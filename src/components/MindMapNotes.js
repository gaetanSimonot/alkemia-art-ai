import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Stage, Layer, Circle, Text, Group } from 'react-konva';
import {
  Mic, MicOff, Type, Image as ImageIcon,
  Edit3, List, Grid
} from 'lucide-react';
import RichNoteEditor from './RichNoteEditor';

const MindMapNotes = () => {
  // États principaux
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState('mindmap');
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [globalSize, setGlobalSize] = useState(100);
  const [sortMode, setSortMode] = useState('importance');

  // États pour les interactions
  const [isRecording, setIsRecording] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showTextModal, setShowTextModal] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [showRichEditor, setShowRichEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState({});

  // États pour la navigation canvas
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [ballPositions, setBallPositions] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  // Refs
  const stageRef = useRef();
  const mediaRecorderRef = useRef();
  const audioChunksRef = useRef([]);
  const containerRef = useRef();

  // Thèmes
  const themes = useMemo(() => ({
    dark: {
      bg: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      primary: '#4a90ff',
      secondary: '#7c3aed',
      accent: '#06d6a0',
      text: '#ffffff',
      textSecondary: '#a0a0a0',
      surface: 'rgba(255, 255, 255, 0.1)',
      surfaceHover: 'rgba(255, 255, 255, 0.2)'
    },
    ocean: {
      bg: 'linear-gradient(135deg, #0c1445 0%, #1e3a8a 50%, #0891b2 100%)',
      primary: '#06b6d4',
      secondary: '#3b82f6',
      accent: '#10b981',
      text: '#ffffff',
      textSecondary: '#94a3b8',
      surface: 'rgba(255, 255, 255, 0.1)',
      surfaceHover: 'rgba(255, 255, 255, 0.2)'
    },
    sunset: {
      bg: 'linear-gradient(135deg, #451a03 0%, #ea580c 50%, #3b82f6 100%)',
      primary: '#f97316',
      secondary: '#ec4899',
      accent: '#8b5cf6',
      text: '#ffffff',
      textSecondary: '#fbbf24',
      surface: 'rgba(255, 255, 255, 0.1)',
      surfaceHover: 'rgba(255, 255, 255, 0.2)'
    },
    forest: {
      bg: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)',
      primary: '#22c55e',
      secondary: '#16a34a',
      accent: '#84cc16',
      text: '#ffffff',
      textSecondary: '#bbf7d0',
      surface: 'rgba(255, 255, 255, 0.1)',
      surfaceHover: 'rgba(255, 255, 255, 0.2)'
    }
  }), []);

  // Données initiales
  const initialCategories = useMemo(() => [
    {
      id: 'work',
      emoji: '💼',
      name: 'Travail',
      importance: 5,
      color: '#4a90ff',
      notes: [
        { id: 1, type: 'voice', title: 'Réunion équipe', content: 'Réunion équipe demain 14h', timestamp: Date.now() - 86400000, folderId: null },
        { id: 2, type: 'text', title: 'Rapport projet', content: 'Finir rapport pour vendredi', timestamp: Date.now() - 43200000, folderId: 'folder-1' }
      ],
      folders: [
        { id: 'folder-1', name: 'Urgent', color: '#ff4444' },
        { id: 'folder-2', name: 'Projets', color: '#44ff44' }
      ]
    },
    {
      id: 'personal',
      emoji: '🏠',
      name: 'Personnel',
      importance: 4,
      color: '#06d6a0',
      notes: [
        { id: 3, type: 'photo', title: 'Courses', content: 'Photo liste courses', timestamp: Date.now() - 129600000, folderId: null },
        { id: 4, type: 'text', title: 'Anniversaire', content: 'Anniversaire maman le 15', timestamp: Date.now() - 216000000, folderId: null }
      ],
      folders: []
    },
    {
      id: 'ideas',
      emoji: '💡',
      name: 'Idées',
      importance: 5,
      color: '#f59e0b',
      notes: [
        { id: 5, type: 'voice', title: 'App mobile', content: 'Idée app mobile pour les courses', timestamp: Date.now() - 302400000, folderId: null },
        { id: 6, type: 'text', title: 'Blog article', content: 'Article sur la productivité', timestamp: Date.now() - 388800000, folderId: null }
      ],
      folders: []
    }
  ], []);

  // Initialisation
  useEffect(() => {
    const saved = localStorage.getItem('mindmap-categories');
    const savedPositions = localStorage.getItem('mindmap-positions');
    const savedExpanded = localStorage.getItem('mindmap-folders-expanded');

    if (saved) {
      setCategories(JSON.parse(saved));
    } else {
      setCategories(initialCategories);
    }

    if (savedPositions) {
      setBallPositions(JSON.parse(savedPositions));
    }

    if (savedExpanded) {
      setExpandedFolders(JSON.parse(savedExpanded));
    }

    const updateStageSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    updateStageSize();
    window.addEventListener('resize', updateStageSize);
    return () => window.removeEventListener('resize', updateStageSize);
  }, [initialCategories]);

  // Sauvegarde
  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem('mindmap-categories', JSON.stringify(categories));
    }
  }, [categories]);

  useEffect(() => {
    if (Object.keys(ballPositions).length > 0) {
      localStorage.setItem('mindmap-positions', JSON.stringify(ballPositions));
    }
  }, [ballPositions]);

  useEffect(() => {
    localStorage.setItem('mindmap-folders-expanded', JSON.stringify(expandedFolders));
  }, [expandedFolders]);

  // Calcul des positions par défaut SEULEMENT pour les nouvelles boules
  const getDefaultPosition = (categoryId, index) => {
    const centerX = stageSize.width / 2;
    const centerY = stageSize.height / 2;
    const radius = Math.min(stageSize.width, stageSize.height) * 0.3;
    const totalCategories = categories.length;

    if (viewMode === 'list') {
      return { x: centerX, y: 100 + index * 120 };
    }

    const angle = (index * 2 * Math.PI) / totalCategories;
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  };

  // Positions finales des boules
  const finalBallPositions = useMemo(() => {
    const positions = {};

    categories.forEach((category, index) => {
      if (ballPositions[category.id]) {
        // Position sauvegardée
        positions[category.id] = ballPositions[category.id];
      } else {
        // Position par défaut
        positions[category.id] = getDefaultPosition(category.id, index);
      }
    });

    return positions;
  }, [categories, ballPositions, stageSize, viewMode]);

  // Gestion du drag des boules - SIMPLE et DIRECTE
  const handleBallDragEnd = (categoryId, e) => {
    setBallPositions(prev => ({
      ...prev,
      [categoryId]: {
        x: e.target.x(),
        y: e.target.y()
      }
    }));
  };

  // Gestion zoom - SANS interférer avec les positions des boules
  const handleWheel = useCallback((e) => {
    if (isDragging) return; // Pas de zoom pendant le drag

    e.evt.preventDefault();
    const scaleBy = 1.05;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.3, Math.min(3, newScale));

    setScale(clampedScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };
    setPanOffset(newPos);
  }, [isDragging]);

  // Notifications
  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Fonctions de gestion des notes et dossiers
  const addNoteToCategory = useCallback((categoryId, type, title, content, folderId = null) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          notes: [
            {
              id: Date.now(),
              type,
              title,
              content,
              timestamp: Date.now(),
              folderId
            },
            ...cat.notes
          ]
        };
      }
      return cat;
    }));
  }, []);

  const createFolder = (categoryId, folderName) => {
    const newFolder = {
      id: `folder-${Date.now()}`,
      name: folderName,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    };

    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          folders: [...(cat.folders || []), newFolder]
        };
      }
      return cat;
    }));

    showNotification('Dossier créé!', 'success');
  };

  const moveNoteToFolder = (categoryId, noteId, folderId) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          notes: cat.notes.map(note =>
            note.id === noteId ? { ...note, folderId } : note
          )
        };
      }
      return cat;
    }));
  };

  const moveNoteToCategoryFromDrag = (noteId, sourceCategoryId, targetCategoryId) => {
    let noteToMove = null;

    // Trouver et supprimer la note de la catégorie source
    setCategories(prev => prev.map(cat => {
      if (cat.id === sourceCategoryId) {
        const note = cat.notes.find(n => n.id === noteId);
        if (note) {
          noteToMove = { ...note, folderId: null }; // Reset folder when moving
          return {
            ...cat,
            notes: cat.notes.filter(n => n.id !== noteId)
          };
        }
      }
      return cat;
    }));

    // Ajouter la note à la catégorie cible
    if (noteToMove) {
      setTimeout(() => {
        setCategories(prev => prev.map(cat => {
          if (cat.id === targetCategoryId) {
            return {
              ...cat,
              notes: [noteToMove, ...cat.notes]
            };
          }
          return cat;
        }));
        showNotification('Note déplacée vers ' + targetCategoryId, 'success');
      }, 100);
    }
  };

  // Fonctions d'enregistrement
  const startRecording = async () => {
    if (!selectedCategory) {
      showNotification('Sélectionnez d\'abord une catégorie', 'error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const mockTranscription = 'Note vocale transcrite automatiquement';
        addNoteToCategory(selectedCategory, 'voice', 'Note vocale', mockTranscription);
        showNotification('Note vocale ajoutée avec succès!', 'success');
      };

      mediaRecorder.start();
      setIsRecording(true);
      showNotification('Enregistrement en cours...', 'info');
    } catch (error) {
      showNotification('Erreur d\'accès au microphone', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const addTextNote = () => {
    if (!selectedCategory) {
      showNotification('Sélectionnez d\'abord une catégorie', 'error');
      return;
    }
    setShowTextModal(true);
  };

  const saveTextNote = () => {
    if (textInput.trim()) {
      const title = textInput.split('\n')[0].substring(0, 30) + (textInput.length > 30 ? '...' : '');
      addNoteToCategory(selectedCategory, 'text', title, textInput);
      setTextInput('');
      setShowTextModal(false);
      showNotification('Note texte ajoutée!', 'success');
    }
  };

  const openRichEditor = (note = null) => {
    setEditingNote(note);
    setShowRichEditor(true);
  };

  const saveRichNote = (noteData) => {
    if (editingNote) {
      setCategories(prev => prev.map(cat => ({
        ...cat,
        notes: cat.notes.map(note =>
          note.id === editingNote.id ? { ...noteData, id: editingNote.id } : note
        )
      })));
      showNotification('Note modifiée!', 'success');
    } else {
      addNoteToCategory(selectedCategory, 'rich', noteData.title, noteData.content);
      showNotification('Note enrichie ajoutée!', 'success');
    }
    setShowRichEditor(false);
    setEditingNote(null);
  };

  const handlePhotoUpload = (event) => {
    if (!selectedCategory) {
      showNotification('Sélectionnez d\'abord une catégorie', 'error');
      return;
    }

    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const title = file.name.split('.')[0];
        addNoteToCategory(selectedCategory, 'photo', title, e.target.result);
        showNotification('Photo ajoutée!', 'success');
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  const theme = themes[currentTheme];

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: theme.bg }}
      ref={containerRef}
    >
      {/* Contrôles thèmes */}
      <div className="absolute top-4 right-4 z-40">
        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-3 shadow-2xl">
          <select
            value={currentTheme}
            onChange={(e) => setCurrentTheme(e.target.value)}
            className="px-3 py-1 bg-black/30 text-white rounded-lg border border-white/20 text-sm backdrop-blur-sm"
          >
            <option value="dark">🌙 Dark</option>
            <option value="ocean">🌊 Ocean</option>
            <option value="sunset">🌅 Sunset</option>
            <option value="forest">🌲 Forest</option>
          </select>

          <button
            onClick={() => setViewMode(viewMode === 'mindmap' ? 'list' : 'mindmap')}
            className="p-2 bg-black/30 text-white rounded-lg border border-white/20 backdrop-blur-sm hover:bg-black/50 transition-all"
          >
            {viewMode === 'mindmap' ? <List size={16} /> : <Grid size={16} />}
          </button>
        </div>
      </div>

      {/* Contrôles latéraux */}
      <div className="absolute left-4 top-4 z-30 space-y-3">
        <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-2xl">
          <div className="flex flex-col gap-3">
            <div className="text-white text-sm">
              <label className="block mb-2">Taille: {globalSize}%</label>
              <input
                type="range"
                min="50"
                max="200"
                value={globalSize}
                onChange={(e) => setGlobalSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
              className="px-2 py-1 bg-black/30 text-white rounded-lg border border-white/20 text-sm backdrop-blur-sm"
            >
              <option value="importance">⭐ Importance</option>
              <option value="notes">📝 Nb notes</option>
              <option value="alphabetical">🔤 Alpha</option>
              <option value="recent">📅 Récent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Panel info droite avec dossiers */}
      {selectedCategory && (
        <div className="absolute right-4 top-4 bottom-24 w-80 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-2xl z-30 overflow-hidden">
          {(() => {
            const category = categories.find(c => c.id === selectedCategory);
            if (!category) return null;

            return (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{category.emoji}</span>
                    <div>
                      <h3 className="text-white font-bold text-lg">{category.name}</h3>
                      <p className="text-gray-300 text-sm">{category.notes?.length || 0} notes</p>
                    </div>
                  </div>
                </div>

                {/* Créer dossier */}
                <div className="mb-4">
                  {!showCreateFolder ? (
                    <button
                      onClick={() => setShowCreateFolder(true)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30 hover:bg-purple-500/30 transition-all text-sm"
                    >
                      <span>📁</span>
                      <span>Nouveau dossier</span>
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Nom du dossier"
                        className="flex-1 px-3 py-2 bg-black/30 text-white rounded-lg border border-white/20 text-sm"
                        autoFocus
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newFolderName.trim()) {
                            createFolder(selectedCategory, newFolderName.trim());
                            setNewFolderName('');
                            setShowCreateFolder(false);
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (newFolderName.trim()) {
                            createFolder(selectedCategory, newFolderName.trim());
                            setNewFolderName('');
                          }
                          setShowCreateFolder(false);
                        }}
                        className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                      >
                        ✓
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto space-y-3">
                  {/* Dossiers avec expand/collapse */}
                  {category.folders?.map((folder) => {
                    const folderNotes = category.notes?.filter(note => note.folderId === folder.id) || [];
                    const isExpanded = expandedFolders[folder.id] !== false; // Par défaut ouvert

                    return (
                      <div
                        key={folder.id}
                        className="bg-black/30 rounded-xl border border-white/10"
                        onDrop={(e) => {
                          e.preventDefault();
                          const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
                          if (dragData.type === 'note') {
                            moveNoteToFolder(category.id, dragData.noteId, folder.id);
                            showNotification(`Note déplacée dans ${folder.name}`, 'success');
                          }
                        }}
                        onDragOver={(e) => e.preventDefault()}
                      >
                        <div
                          className="flex items-center gap-2 p-3 cursor-pointer hover:bg-black/20 transition-all"
                          style={{ borderLeftColor: folder.color, borderLeftWidth: '4px' }}
                          onClick={() => setExpandedFolders(prev => ({ ...prev, [folder.id]: !isExpanded }))}
                        >
                          <span className="text-lg">{isExpanded ? '📂' : '📁'}</span>
                          <span className="text-white font-medium text-sm flex-1">{folder.name}</span>
                          <span className="text-gray-400 text-xs">({folderNotes.length})</span>
                          <span className="text-gray-400 text-xs">{isExpanded ? '▼' : '▶'}</span>
                        </div>

                        {isExpanded && (
                          <div className="p-2 space-y-2 border-t border-white/5">
                            {folderNotes.map((note) => (
                              <div
                                key={note.id}
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('text/plain', JSON.stringify({
                                    type: 'note',
                                    noteId: note.id,
                                    categoryId: category.id
                                  }));
                                }}
                                className="bg-black/20 rounded-lg p-2 border border-white/5 hover:border-white/20 transition-all cursor-pointer text-xs group"
                                onClick={() => openRichEditor(note)}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm">
                                    {note.type === 'voice' ? '🎤' :
                                     note.type === 'photo' ? '📷' : '📝'}
                                  </span>
                                  <span className="text-white font-medium truncate flex-1">{note.title}</span>
                                  <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    ⋮⋮
                                  </span>
                                </div>
                                <p className="text-gray-400 text-xs truncate">
                                  {new Date(note.timestamp).toLocaleString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Notes sans dossier */}
                  {category.notes?.filter(note => !note.folderId).map((note) => (
                    <div
                      key={note.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', JSON.stringify({
                          type: 'note',
                          noteId: note.id,
                          categoryId: category.id
                        }));
                      }}
                      className="bg-black/20 rounded-xl p-3 border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
                      onClick={() => openRichEditor(note)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {note.type === 'voice' ? '🎤' :
                             note.type === 'photo' ? '📷' : '📝'}
                          </span>
                          <span className="text-white font-medium text-sm truncate">
                            {note.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {category.folders && category.folders.length > 0 && (
                            <select
                              value={note.folderId || ''}
                              onChange={(e) => {
                                const folderId = e.target.value || null;
                                moveNoteToFolder(category.id, note.id, folderId);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs bg-black/30 text-gray-300 border border-white/20 rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <option value="">Sans dossier</option>
                              {category.folders.map(folder => (
                                <option key={folder.id} value={folder.id}>📁 {folder.name}</option>
                              ))}
                            </select>
                          )}
                          <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            ⋮⋮
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-300 text-xs truncate">
                        {note.type === 'photo' ? 'Image' :
                         typeof note.content === 'string' ?
                           note.content.replace(/<[^>]*>/g, '').substring(0, 50) + '...' :
                           'Contenu riche'
                        }
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(note.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => openRichEditor()}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all font-medium"
                >
                  <Edit3 size={16} />
                  Nouvelle note enrichie
                </button>
              </div>
            );
          })()}
        </div>
      )}

      {/* Canvas principal - SIMPLE */}
      <div className="absolute inset-0 pb-20">
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          onWheel={handleWheel}
          ref={stageRef}
          scaleX={scale}
          scaleY={scale}
          x={panOffset.x}
          y={panOffset.y}
          draggable
          onDragEnd={(e) => {
            setPanOffset({
              x: e.target.x(),
              y: e.target.y(),
            });
          }}
        >
          <Layer>
            {categories.map((category, index) => {
              const position = finalBallPositions[category.id] || { x: 400, y: 300 };
              const isSelected = selectedCategory === category.id;
              const size = (30 + category.importance * 8) * (globalSize / 100);

              return (
                <Group
                  key={category.id}
                  x={position.x}
                  y={position.y}
                  draggable={true}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={(e) => {
                    setIsDragging(false);
                    handleBallDragEnd(category.id, e);
                  }}
                  onClick={(e) => {
                    e.cancelBubble = true; // Empêcher la propagation
                    setSelectedCategory(category.id);
                  }}
                  onTap={(e) => {
                    e.cancelBubble = true;
                    setSelectedCategory(category.id);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    try {
                      const dragData = JSON.parse(e.dataTransfer?.getData('text/plain') || '{}');
                      if (dragData.type === 'note' && dragData.categoryId !== category.id) {
                        moveNoteToCategoryFromDrag(dragData.noteId, dragData.categoryId, category.id);
                      }
                    } catch (err) {
                      console.log('Drop ignored');
                    }
                  }}
                >
                  {/* Cercle principal */}
                  <Circle
                    radius={size}
                    fill={category.color}
                    stroke={isSelected ? theme.accent : 'transparent'}
                    strokeWidth={isSelected ? 4 : 0}
                    shadowBlur={isSelected ? 20 : 10}
                    shadowColor={category.color}
                    shadowOpacity={isSelected ? 0.6 : 0.3}
                  />

                  {/* Cercle interne */}
                  <Circle
                    radius={size * 0.8}
                    fill={category.color}
                    opacity={0.7}
                  />

                  {/* Emoji */}
                  <Text
                    text={category.emoji}
                    fontSize={size * 0.6}
                    x={-size * 0.3}
                    y={-size * 0.3}
                    fill={theme.text}
                  />

                  {/* Nom */}
                  <Text
                    text={category.name}
                    fontSize={Math.max(12, size * 0.2)}
                    x={-size}
                    y={size + 10}
                    width={size * 2}
                    align="center"
                    fill={theme.text}
                    fontStyle="bold"
                  />

                  {/* Compteur */}
                  <Circle
                    x={size * 0.7}
                    y={-size * 0.7}
                    radius={12}
                    fill={theme.accent}
                  />
                  <Text
                    text={category.notes?.length || 0}
                    fontSize={10}
                    x={size * 0.7 - 6}
                    y={-size * 0.7 - 5}
                    fill={theme.text}
                    fontStyle="bold"
                  />
                </Group>
              );
            })}
          </Layer>
        </Stage>
      </div>

      {/* Boutons d'action */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={addTextNote}
            className="flex items-center justify-center w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl shadow-2xl transition-all hover:scale-110 border border-blue-400/30"
            disabled={!selectedCategory}
          >
            <Type size={24} />
          </button>

          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center justify-center w-16 h-16 rounded-2xl shadow-2xl transition-all hover:scale-110 border ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse border-red-400/30'
                : 'bg-red-500 hover:bg-red-600 border-red-400/30'
            }`}
            disabled={!selectedCategory}
          >
            {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
          </button>

          <label className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-2xl shadow-2xl transition-all hover:scale-110 cursor-pointer border border-green-400/30">
            <ImageIcon size={24} />
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={!selectedCategory}
            />
          </label>
        </div>
      </div>

      {/* Modal note texte */}
      {showTextModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Nouvelle note texte</h3>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Tapez votre note ici..."
              className="w-full h-32 p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={saveTextNote}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl font-medium transition-all"
              >
                Sauvegarder
              </button>
              <button
                onClick={() => {
                  setShowTextModal(false);
                  setTextInput('');
                }}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-xl font-medium transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Éditeur riche */}
      {showRichEditor && (
        <RichNoteEditor
          note={editingNote}
          onSave={saveRichNote}
          onClose={() => {
            setShowRichEditor(false);
            setEditingNote(null);
          }}
          categoryColor={categories.find(c => c.id === selectedCategory)?.color}
        />
      )}

      {/* Notifications */}
      {notification && (
        <div className="fixed top-24 right-4 z-50 animate-fade-in">
          <div className={`px-6 py-3 rounded-xl shadow-lg backdrop-blur-sm border ${
            notification.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-100' :
            notification.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-100' :
            'bg-blue-500/20 border-blue-500/30 text-blue-100'
          }`}>
            {notification.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default MindMapNotes;