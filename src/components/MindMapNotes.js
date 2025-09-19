import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Stage, Layer, Circle, Text, Group } from 'react-konva';
import {
  Mic, MicOff, Type, Image as ImageIcon,
  Edit3, List, Grid
} from 'lucide-react';
import RichNoteEditor from './RichNoteEditor';

const MindMapNotes = () => {
  // États principaux optimisés
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState('mindmap'); // mindmap ou list
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
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  // États pour la navigation canvas
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

  // Refs optimisées
  const stageRef = useRef();
  const mediaRecorderRef = useRef();
  const audioChunksRef = useRef([]);
  const containerRef = useRef();

  // Thèmes optimisés
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

  // Données initiales optimisées
  const initialCategories = useMemo(() => [
    {
      id: 'work',
      emoji: '💼',
      name: 'Travail',
      importance: 5,
      color: '#4a90ff',
      x: 0, y: 0,
      customPosition: null,
      notes: [
        { id: 1, type: 'voice', title: 'Réunion équipe', content: 'Réunion équipe demain 14h', timestamp: Date.now() - 86400000, folderId: null },
        { id: 2, type: 'text', title: 'Rapport projet', content: 'Finir rapport pour vendredi', timestamp: Date.now() - 43200000, folderId: null }
      ],
      folders: [
        { id: 'folder-1', name: 'Urgent', color: '#ff4444' },
        { id: 'folder-2', name: 'Projets', color: '#44ff44' }
      ],
      connections: []
    },
    {
      id: 'personal',
      emoji: '🏠',
      name: 'Personnel',
      importance: 4,
      color: '#06d6a0',
      x: 0, y: 0,
      customPosition: null,
      notes: [
        { id: 3, type: 'photo', title: 'Courses', content: 'Photo liste courses', timestamp: Date.now() - 129600000 },
        { id: 4, type: 'text', title: 'Anniversaire', content: 'Anniversaire maman le 15', timestamp: Date.now() - 216000000 }
      ],
      connections: []
    },
    {
      id: 'ideas',
      emoji: '💡',
      name: 'Idées',
      importance: 5,
      color: '#f59e0b',
      x: 0, y: 0,
      customPosition: null,
      notes: [
        { id: 5, type: 'voice', title: 'App mobile', content: 'Idée app mobile pour les courses', timestamp: Date.now() - 302400000 },
        { id: 6, type: 'text', title: 'Blog article', content: 'Article sur la productivité', timestamp: Date.now() - 388800000 }
      ],
      connections: []
    },
    {
      id: 'projects',
      emoji: '🚀',
      name: 'Projets',
      importance: 5,
      color: '#ec4899',
      x: 0, y: 0,
      customPosition: null,
      notes: [
        { id: 7, type: 'text', title: 'Site web', content: 'Refonte site web portfolio', timestamp: Date.now() - 475200000 }
      ],
      connections: []
    },
    {
      id: 'family',
      emoji: '👨‍👩‍👧‍👦',
      name: 'Famille',
      importance: 3,
      color: '#8b5cf6',
      x: 0, y: 0,
      customPosition: null,
      notes: [
        { id: 8, type: 'photo', title: 'Vacances', content: 'Photos vacances été', timestamp: Date.now() - 561600000 }
      ],
      connections: []
    },
    {
      id: 'health',
      emoji: '🏃‍♀️',
      name: 'Santé',
      importance: 4,
      color: '#10b981',
      x: 0, y: 0,
      customPosition: null,
      notes: [
        { id: 9, type: 'voice', title: 'RDV médecin', content: 'RDV médecin mardi 10h', timestamp: Date.now() - 648000000 }
      ],
      connections: []
    },
    {
      id: 'creative',
      emoji: '🎨',
      name: 'Créatif',
      importance: 3,
      color: '#f97316',
      x: 0, y: 0,
      customPosition: null,
      notes: [
        { id: 10, type: 'text', title: 'Design logo', content: 'Nouveau logo pour client', timestamp: Date.now() - 734400000 }
      ],
      connections: []
    },
    {
      id: 'meetings',
      emoji: '👥',
      name: 'Réunions',
      importance: 4,
      color: '#06b6d4',
      x: 0, y: 0,
      customPosition: null,
      notes: [
        { id: 11, type: 'voice', title: 'Call client', content: 'Appel client projet X', timestamp: Date.now() - 820800000 }
      ],
      connections: []
    }
  ], []);

  // Initialisation des données
  useEffect(() => {
    const saved = localStorage.getItem('mindmap-categories');
    if (saved) {
      setCategories(JSON.parse(saved));
    } else {
      setCategories(initialCategories);
    }

    const updateStageSize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        setStageSize({
          width: container.offsetWidth,
          height: container.offsetHeight
        });
      }
    };

    updateStageSize();
    window.addEventListener('resize', updateStageSize);
    return () => window.removeEventListener('resize', updateStageSize);
  }, [initialCategories]);

  // Sauvegarder les données à chaque changement
  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem('mindmap-categories', JSON.stringify(categories));
    }
  }, [categories]);

  // Calcul optimisé des positions des catégories
  const categoryPositions = useMemo(() => {
    const centerX = stageSize.width / 2;
    const centerY = stageSize.height / 2;
    const radius = Math.min(stageSize.width, stageSize.height) * 0.3 * (globalSize / 100);

    return categories.map((category, index) => {
      // Si position custom définie, l'utiliser
      if (category.customPosition) {
        return {
          ...category,
          finalX: category.customPosition.x,
          finalY: category.customPosition.y,
          size: viewMode === 'list' ? 60 : (30 + category.importance * 8) * (globalSize / 100)
        };
      }

      // Sinon calculer position automatique
      const angle = (index * 2 * Math.PI) / categories.length;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      return {
        ...category,
        finalX: viewMode === 'list' ? centerX : x,
        finalY: viewMode === 'list' ? 100 + index * 120 : y,
        size: viewMode === 'list' ? 60 : (30 + category.importance * 8) * (globalSize / 100)
      };
    });
  }, [categories, stageSize, globalSize, viewMode]);

  // Gestion du drag individuel optimisée
  const handleCategoryDragEnd = useCallback((categoryId, newPos) => {
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId
        ? { ...cat, customPosition: { x: newPos.x, y: newPos.y } }
        : cat
    ));
  }, []);

  // Gestion zoom optimisée
  const handleWheel = useCallback((e) => {
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
  }, []);

  // Notifications
  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Gestion des enregistrements vocaux
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

  // Ajouter une note à une catégorie
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

  // Créer un nouveau dossier
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

  // Déplacer une note vers un dossier
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

    showNotification('Note déplacée dans le dossier!', 'success');
  };

  // Ajouter une note texte
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

  // Ouvrir l'éditeur riche
  const openRichEditor = (note = null) => {
    setEditingNote(note);
    setShowRichEditor(true);
  };

  const saveRichNote = (noteData) => {
    if (editingNote) {
      // Modifier note existante
      setCategories(prev => prev.map(cat => ({
        ...cat,
        notes: cat.notes.map(note =>
          note.id === editingNote.id ? { ...noteData, id: editingNote.id } : note
        )
      })));
      showNotification('Note modifiée!', 'success');
    } else {
      // Nouvelle note
      addNoteToCategory(selectedCategory, 'rich', noteData.title, noteData.content);
      showNotification('Note enrichie ajoutée!', 'success');
    }
    setShowRichEditor(false);
    setEditingNote(null);
  };

  // Upload photo
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


  // Rendu des bulles optimisé
  const renderCategories = useMemo(() => {
    return categoryPositions.map((category) => {
      const isSelected = selectedCategory === category.id;

      return (
        <Group
          key={category.id}
          x={category.finalX}
          y={category.finalY}
          draggable={true}
          onDragEnd={(e) => {
            handleCategoryDragEnd(category.id, {
              x: e.target.x(),
              y: e.target.y()
            });
          }}
          onClick={() => setSelectedCategory(category.id)}
          onTap={() => setSelectedCategory(category.id)}
        >
          {/* Cercle principal */}
          <Circle
            radius={category.size}
            fill={category.color}
            stroke={isSelected ? themes[currentTheme].accent : 'transparent'}
            strokeWidth={isSelected ? 4 : 0}
            shadowBlur={isSelected ? 20 : 10}
            shadowColor={category.color}
            shadowOpacity={isSelected ? 0.6 : 0.3}
          />

          {/* Cercle interne avec effet */}
          <Circle
            radius={category.size * 0.8}
            fill={`linear-gradient(45deg, ${category.color}80, ${category.color}40)`}
            opacity={0.7}
          />

          {/* Texte emoji */}
          <Text
            text={category.emoji}
            fontSize={category.size * 0.6}
            x={-category.size * 0.3}
            y={-category.size * 0.3}
            fill={themes[currentTheme].text}
          />

          {/* Nom de la catégorie */}
          <Text
            text={category.name}
            fontSize={Math.max(12, category.size * 0.2)}
            x={-category.size}
            y={category.size + 10}
            width={category.size * 2}
            align="center"
            fill={themes[currentTheme].text}
            fontStyle="bold"
          />

          {/* Nombre de notes */}
          <Circle
            x={category.size * 0.7}
            y={-category.size * 0.7}
            radius={12}
            fill={themes[currentTheme].accent}
          />
          <Text
            text={category.notes?.length || 0}
            fontSize={10}
            x={category.size * 0.7 - 6}
            y={-category.size * 0.7 - 5}
            fill={themes[currentTheme].text}
            fontStyle="bold"
          />
        </Group>
      );
    });
  }, [categoryPositions, selectedCategory, themes, currentTheme, handleCategoryDragEnd]);

  const theme = themes[currentTheme];

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: theme.bg }}
      ref={containerRef}
    >
      {/* Barre de contrôles thèmes et modes */}
      <div className="absolute top-4 right-4 z-40">
        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-3 shadow-2xl">
          {/* Sélecteur de thème */}
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

          {/* Vue mode */}
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
            {/* Taille globale */}
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


            {/* Tri */}
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

      {/* Panel info droite */}
      {selectedCategory && (
        <div className="absolute right-4 top-4 bottom-24 w-80 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-2xl z-30 overflow-hidden">
          {(() => {
            const category = categories.find(c => c.id === selectedCategory);
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

                {/* Bouton créer dossier */}
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
                  {/* Affichage des dossiers */}
                  {category.folders?.map((folder) => {
                    const folderNotes = category.notes?.filter(note => note.folderId === folder.id) || [];
                    if (folderNotes.length === 0) return null;

                    return (
                      <div key={folder.id} className="bg-black/30 rounded-xl border border-white/10">
                        <div
                          className="flex items-center gap-2 p-3 border-b border-white/10"
                          style={{ borderLeftColor: folder.color, borderLeftWidth: '4px' }}
                        >
                          <span className="text-lg">📁</span>
                          <span className="text-white font-medium text-sm">{folder.name}</span>
                          <span className="text-gray-400 text-xs ml-auto">({folderNotes.length})</span>
                        </div>

                        <div className="p-2 space-y-2">
                          {folderNotes.map((note, index) => (
                            <div
                              key={note.id}
                              className="bg-black/20 rounded-lg p-2 border border-white/5 hover:border-white/20 transition-all cursor-pointer text-xs"
                              onClick={() => openRichEditor(note)}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm">
                                  {note.type === 'voice' ? '🎤' :
                                   note.type === 'photo' ? '📷' : '📝'}
                                </span>
                                <span className="text-white font-medium truncate">{note.title}</span>
                              </div>
                              <p className="text-gray-400 text-xs truncate">
                                {new Date(note.timestamp).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Notes sans dossier */}
                  {category.notes?.filter(note => !note.folderId).map((note, index) => (
                    <div
                      key={note.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', JSON.stringify({
                          noteId: note.id,
                          categoryId: category.id,
                          sourceIndex: index
                        }));
                        e.currentTarget.style.opacity = '0.5';
                      }}
                      onDragEnd={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = '#06d6a0';
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';

                        const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
                        const targetIndex = index;

                        if (dragData.sourceIndex !== targetIndex) {
                          // Réorganiser les notes dans la même catégorie
                          setCategories(prev => prev.map(cat => {
                            if (cat.id === category.id) {
                              const newNotes = [...cat.notes];
                              const [movedNote] = newNotes.splice(dragData.sourceIndex, 1);
                              newNotes.splice(targetIndex, 0, movedNote);
                              return { ...cat, notes: newNotes };
                            }
                            return cat;
                          }));
                          showNotification('Note déplacée!', 'success');
                        }
                      }}
                      className="bg-black/20 rounded-xl p-3 border border-white/10 hover:border-white/20 transition-all cursor-grab active:cursor-grabbing group"
                      onClick={() => openRichEditor(note)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {note.type === 'voice' ? '🎤' :
                             note.type === 'photo' ? '📷' :
                             note.type === 'rich' ? '📝' : '📝'}
                          </span>
                          <span className="text-white font-medium text-sm truncate">
                            {note.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {/* Menu dossier */}
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
                            ⣿⣿ Glisser
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

      {/* Canvas principal */}
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
            {renderCategories}
          </Layer>
        </Stage>
      </div>

      {/* Boutons d'action */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <div className="flex items-center gap-4">
          {/* Note texte */}
          <button
            onClick={addTextNote}
            className="flex items-center justify-center w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl shadow-2xl transition-all hover:scale-110 border border-blue-400/30"
            disabled={!selectedCategory}
          >
            <Type size={24} />
          </button>

          {/* Note vocale */}
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

          {/* Photo */}
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