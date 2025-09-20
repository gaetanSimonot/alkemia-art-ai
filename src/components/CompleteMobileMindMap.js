import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Mic, MicOff, Type, Plus, X, Home, Camera, Settings, LogOut,
  Volume2, VolumeX, Sun, Moon, Palette, RotateCcw, ArrowLeft,
  Edit3, Trash2, Save, Share2, FolderPlus, File, Folder,
  ChevronRight, ChevronDown, Send, Download, Upload
} from 'lucide-react';

const CompleteMobileMindMap = ({ onLogout }) => {
  // États principaux
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [openCategory, setOpenCategory] = useState(null);

  // États pour les interactions mobiles
  const [isRecording, setIsRecording] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showRichEditor, setShowRichEditor] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [richContent, setRichContent] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({});

  // États pour le zoom/pan tactile (CANVAS SEULEMENT)
  const [canvasTransform, setCanvasTransform] = useState({
    scale: 1,
    translateX: 0,
    translateY: 0
  });
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // États pour le drag des bulles
  const [ballPositions, setBallPositions] = useState({});
  const [draggedBall, setDraggedBall] = useState(null);
  const [longPressTimer, setLongPressTimer] = useState(null);

  // Ref pour le conteneur canvas uniquement
  const canvasRef = useRef();

  // Thèmes
  const themes = {
    dark: {
      bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#06d6a0',
      text: '#ffffff',
      textSecondary: '#94a3b8',
      surface: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(255, 255, 255, 0.1)'
    },
    ocean: {
      bg: 'linear-gradient(135deg, #0c1445 0%, #1e3a8a 50%, #0891b2 100%)',
      primary: '#0ea5e9',
      secondary: '#3b82f6',
      accent: '#10b981',
      text: '#ffffff',
      textSecondary: '#94a3b8',
      surface: 'rgba(255, 255, 255, 0.08)',
      border: 'rgba(255, 255, 255, 0.1)'
    },
    sunset: {
      bg: 'linear-gradient(135deg, #451a03 0%, #ea580c 50%, #dc2626 100%)',
      primary: '#f97316',
      secondary: '#ec4899',
      accent: '#8b5cf6',
      text: '#ffffff',
      textSecondary: '#fbbf24',
      surface: 'rgba(255, 255, 255, 0.08)',
      border: 'rgba(255, 255, 255, 0.15)'
    },
    forest: {
      bg: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #10b981 100%)',
      primary: '#10b981',
      secondary: '#34d399',
      accent: '#fbbf24',
      text: '#ffffff',
      textSecondary: '#a7f3d0',
      surface: 'rgba(255, 255, 255, 0.08)',
      border: 'rgba(255, 255, 255, 0.1)'
    }
  };

  const theme = themes[currentTheme];

  // Données avec contenu complet
  const sampleCategories = [
    {
      id: '1',
      name: 'Travail',
      emoji: '💼',
      importance: 5,
      files: 12,
      connections: ['3', '8'],
      folders: [
        {
          id: 'f1',
          name: 'Projets',
          notes: [
            { id: 'n1', title: 'Meeting client', content: 'Présentation du nouveau projet...', type: 'text', date: '2024-01-15' },
            { id: 'n2', title: 'Idées marketing', content: 'Stratégie digitale pour Q2...', type: 'text', date: '2024-01-14' }
          ]
        },
        {
          id: 'f2',
          name: 'Réunions',
          notes: [
            { id: 'n3', title: 'Standup équipe', content: '', type: 'voice', date: '2024-01-16' }
          ]
        }
      ]
    },
    {
      id: '2',
      name: 'Personnel',
      emoji: '🏠',
      importance: 4,
      files: 8,
      connections: ['5', '6'],
      folders: [
        {
          id: 'f3',
          name: 'Tâches',
          notes: [
            { id: 'n4', title: 'Courses', content: 'Lait, pain, légumes...', type: 'text', date: '2024-01-17' }
          ]
        }
      ]
    },
    {
      id: '3',
      name: 'Idées',
      emoji: '💡',
      importance: 5,
      files: 15,
      connections: ['1', '4'],
      folders: [
        {
          id: 'f4',
          name: 'Innovation',
          notes: [
            { id: 'n5', title: 'App mobile', content: 'Concept d\'app de productivité...', type: 'text', date: '2024-01-18' }
          ]
        }
      ]
    },
    {
      id: '4',
      name: 'Projets',
      emoji: '🚀',
      importance: 5,
      files: 20,
      connections: ['3'],
      folders: [
        {
          id: 'f5',
          name: 'En cours',
          notes: [
            { id: 'n6', title: 'Site web', content: 'Développement de la nouvelle version...', type: 'text', date: '2024-01-19' }
          ]
        }
      ]
    },
    {
      id: '5',
      name: 'Famille',
      emoji: '👨‍👩‍👧‍👦',
      importance: 3,
      files: 6,
      connections: ['2'],
      folders: [
        {
          id: 'f6',
          name: 'Événements',
          notes: []
        }
      ]
    },
    {
      id: '6',
      name: 'Santé',
      emoji: '🏃‍♀️',
      importance: 4,
      files: 9,
      connections: ['2'],
      folders: [
        {
          id: 'f7',
          name: 'Sport',
          notes: []
        }
      ]
    },
    {
      id: '7',
      name: 'Créatif',
      emoji: '🎨',
      importance: 3,
      files: 11,
      connections: [],
      folders: [
        {
          id: 'f8',
          name: 'Inspiration',
          notes: []
        }
      ]
    },
    {
      id: '8',
      name: 'Réunions',
      emoji: '👥',
      importance: 4,
      files: 7,
      connections: ['1'],
      folders: [
        {
          id: 'f9',
          name: 'Comptes-rendus',
          notes: []
        }
      ]
    }
  ];

  // Initialisation
  useEffect(() => {
    setCategories(sampleCategories);
    initializeBallPositions();
  }, []);

  // Empêcher le zoom/scroll du navigateur sur la zone canvas uniquement
  useEffect(() => {
    const preventDefaultTouch = (e) => {
      if (canvasRef.current && canvasRef.current.contains(e.target)) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchstart', preventDefaultTouch, { passive: false });
    document.addEventListener('touchmove', preventDefaultTouch, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventDefaultTouch);
      document.removeEventListener('touchmove', preventDefaultTouch);
    };
  }, []);

  const initializeBallPositions = () => {
    const positions = {};
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const radius = Math.min(window.innerWidth, window.innerHeight) * 0.2;

    sampleCategories.forEach((category, index) => {
      const angle = (index / sampleCategories.length) * 2 * Math.PI;
      positions[category.id] = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    });

    setBallPositions(positions);
  };

  const getTouchDistance = (touches) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  // Gestionnaires tactiles pour canvas seulement
  const handleCanvasTouchStart = useCallback((e) => {
    const touches = e.touches;

    if (touches.length === 1) {
      const touch = touches[0];
      setPanStart({ x: touch.clientX, y: touch.clientY });
    } else if (touches.length === 2) {
      const distance = getTouchDistance(touches);
      setLastTouchDistance(distance);
      setIsPanning(true);
    }
  }, []);

  const handleCanvasTouchMove = useCallback((e) => {
    const touches = e.touches;

    if (touches.length === 2 && isPanning) {
      const distance = getTouchDistance(touches);
      if (lastTouchDistance > 0) {
        const scaleChange = distance / lastTouchDistance;
        const newScale = Math.max(0.5, Math.min(3, canvasTransform.scale * scaleChange));

        setCanvasTransform(prev => ({
          ...prev,
          scale: newScale
        }));
      }
      setLastTouchDistance(distance);

      const centerX = (touches[0].clientX + touches[1].clientX) / 2;
      const centerY = (touches[0].clientY + touches[1].clientY) / 2;

      setCanvasTransform(prev => ({
        ...prev,
        translateX: prev.translateX + (centerX - panStart.x) * 0.5,
        translateY: prev.translateY + (centerY - panStart.y) * 0.5
      }));

      setPanStart({ x: centerX, y: centerY });
    }
  }, [isPanning, lastTouchDistance, canvasTransform.scale, panStart]);

  const handleCanvasTouchEnd = useCallback(() => {
    setIsPanning(false);
    setLastTouchDistance(0);
    setDraggedBall(null);

    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  // Gestionnaires pour bulles
  const handleBallTouchStart = useCallback((e, categoryId) => {
    e.stopPropagation();
    const touch = e.touches[0];

    // Long press pour ouvrir
    const timer = setTimeout(() => {
      const category = categories.find(cat => cat.id === categoryId);
      setOpenCategory(category);
      showNotification(`${category?.name} ouvert`, 'info');
    }, 1000);

    setLongPressTimer(timer);
    setDraggedBall(categoryId);
    setPanStart({ x: touch.clientX, y: touch.clientY });
  }, [categories]);

  const handleBallTouchMove = useCallback((e, categoryId) => {
    if (draggedBall === categoryId && e.touches.length === 1) {
      e.stopPropagation();
      const touch = e.touches[0];
      const deltaX = touch.clientX - panStart.x;
      const deltaY = touch.clientY - panStart.y;

      setBallPositions(prev => ({
        ...prev,
        [categoryId]: {
          x: prev[categoryId].x + deltaX / canvasTransform.scale,
          y: prev[categoryId].y + deltaY / canvasTransform.scale
        }
      }));

      setPanStart({ x: touch.clientX, y: touch.clientY });

      if (longPressTimer && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
    }
  }, [draggedBall, panStart, longPressTimer, canvasTransform.scale]);

  // Notifications
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Actions
  const addTextNote = () => {
    if (!openCategory) {
      showNotification('Ouvrez une catégorie d\'abord', 'warning');
      return;
    }
    setShowTextModal(true);
  };

  const saveTextNote = () => {
    if (textInput.trim() && openCategory) {
      const newNote = {
        id: `n${Date.now()}`,
        title: noteTitle || 'Note sans titre',
        content: textInput,
        type: 'text',
        date: new Date().toISOString().split('T')[0]
      };

      setCategories(prev => prev.map(cat =>
        cat.id === openCategory.id
          ? {
              ...cat,
              folders: cat.folders.map(folder =>
                folder.id === cat.folders[0].id
                  ? { ...folder, notes: [...folder.notes, newNote] }
                  : folder
              )
            }
          : cat
      ));

      showNotification(`Note ajoutée à ${openCategory.name}`, 'success');
      setTextInput('');
      setNoteTitle('');
      setShowTextModal(false);
    }
  };

  const startRecording = () => {
    if (!openCategory) {
      showNotification('Ouvrez une catégorie d\'abord', 'warning');
      return;
    }
    setIsRecording(true);
    showNotification('Enregistrement démarré...', 'info');

    setTimeout(() => {
      setIsRecording(false);
      showNotification(`Note vocale ajoutée à ${openCategory.name}`, 'success');
    }, 10000);
  };

  const resetView = () => {
    setCanvasTransform({ scale: 1, translateX: 0, translateY: 0 });
    initializeBallPositions();
    showNotification('Vue réinitialisée', 'info');
  };

  const shareNote = (note) => {
    if (navigator.share) {
      navigator.share({
        title: note.title,
        text: note.content,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(note.content);
      showNotification('Note copiée dans le presse-papiers', 'success');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mindmap_auth_time');
    localStorage.removeItem('mindmap_authenticated');
    onLogout();
  };

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  if (openCategory) {
    return (
      <div className="min-h-screen" style={{ background: theme.bg }}>
        {/* Header de la catégorie */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setOpenCategory(null)}
              className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Retour</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-2xl">{openCategory.emoji}</span>
              <h1 className="text-white font-bold text-lg">{openCategory.name}</h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowShareModal(true)}
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <Share2 size={18} />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Contenu de la catégorie */}
        <div className="pt-16 pb-20 p-4">
          {openCategory.folders.map(folder => (
            <div key={folder.id} className="mb-6">
              <button
                onClick={() => toggleFolder(folder.id)}
                className="flex items-center gap-2 w-full p-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 text-white mb-3"
              >
                {expandedFolders[folder.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                <Folder size={20} />
                <span className="font-semibold">{folder.name}</span>
                <span className="text-sm opacity-70">({folder.notes.length})</span>
              </button>

              {expandedFolders[folder.id] && (
                <div className="space-y-3 ml-4">
                  {folder.notes.map(note => (
                    <div key={note.id} className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {note.type === 'voice' ? <Volume2 size={16} /> : <File size={16} />}
                          <h3 className="text-white font-medium">{note.title}</h3>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => shareNote(note)}
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                          >
                            <Share2 size={16} />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-white transition-colors">
                            <Edit3 size={16} />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      {note.content && (
                        <p className="text-gray-300 text-sm mb-2">{note.content}</p>
                      )}
                      <span className="text-xs text-gray-500">{note.date}</span>
                    </div>
                  ))}

                  {folder.notes.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <File size={32} className="mx-auto mb-2 opacity-50" />
                      <p>Aucune note dans ce dossier</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Boutons d'action */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-lg border-t border-white/10 p-4">
          <div className="flex justify-around items-center">
            <button
              onClick={addTextNote}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-blue-600/80 text-white text-sm"
            >
              <Type size={20} />
              <span>Texte</span>
            </button>

            <button
              onClick={startRecording}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl text-white text-sm ${
                isRecording ? 'bg-red-600/80 animate-pulse' : 'bg-red-500/80'
              }`}
            >
              <Mic size={24} />
              <span>{isRecording ? 'Stop' : 'Vocal'}</span>
            </button>

            <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-green-600/80 text-white text-sm">
              <Camera size={20} />
              <span>Photo</span>
            </button>

            <button
              onClick={() => setShowRichEditor(true)}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-purple-600/80 text-white text-sm"
            >
              <Edit3 size={20} />
              <span>Riche</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: theme.bg }}>
      {/* Header mobile */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
          >
            <Home size={20} />
            <span className="font-bold">Alkemia Art</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={resetView}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <RotateCcw size={18} />
            </button>

            <select
              value={currentTheme}
              onChange={(e) => setCurrentTheme(e.target.value)}
              className="px-3 py-2 rounded-lg bg-black/30 text-white border border-white/20 text-sm"
            >
              <option value="dark">Sombre</option>
              <option value="ocean">Océan</option>
              <option value="sunset">Coucher</option>
              <option value="forest">Forêt</option>
            </select>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Zone Mind Map - CANVAS ISOLÉ */}
      <div
        ref={canvasRef}
        className="absolute inset-0 pt-16 pb-20"
        onTouchStart={handleCanvasTouchStart}
        onTouchMove={handleCanvasTouchMove}
        onTouchEnd={handleCanvasTouchEnd}
        style={{
          transform: `scale(${canvasTransform.scale}) translate(${canvasTransform.translateX}px, ${canvasTransform.translateY}px)`,
          transformOrigin: 'center center',
          transition: isPanning ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        {/* Bulles des catégories */}
        {categories.map((category) => {
          const position = ballPositions[category.id] || { x: 0, y: 0 };
          const isSelected = selectedCategory?.id === category.id;
          const size = 60 + (category.importance * 8);

          return (
            <div
              key={category.id}
              className={`absolute rounded-full flex flex-col items-center justify-center text-white font-bold cursor-pointer transition-all duration-300 select-none ${
                isSelected ? 'ring-4 ring-white/50 shadow-2xl' : 'hover:scale-110'
              }`}
              style={{
                left: position.x - size/2,
                top: position.y - size/2,
                width: size,
                height: size,
                background: isSelected
                  ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
                  : `linear-gradient(135deg, ${theme.surface}, ${theme.primary}20)`,
                backdropFilter: 'blur(10px)',
                border: `2px solid ${theme.border}`,
                zIndex: draggedBall === category.id ? 50 : 10
              }}
              onTouchStart={(e) => handleBallTouchStart(e, category.id)}
              onTouchMove={(e) => handleBallTouchMove(e, category.id)}
            >
              <span className="text-2xl mb-1">{category.emoji}</span>
              <span className="text-xs text-center px-1 leading-tight">
                {category.name}
              </span>
              <span className="text-xs opacity-70">{category.files}</span>
            </div>
          );
        })}

        {/* Micro central */}
        <div
          className="absolute rounded-full flex items-center justify-center cursor-pointer transition-all duration-300"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 80,
            height: 80,
            background: isRecording
              ? `linear-gradient(135deg, #ef4444, #dc2626)`
              : `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            boxShadow: isRecording ? '0 0 30px rgba(239, 68, 68, 0.5)' : `0 0 20px ${theme.primary}40`,
            animation: isRecording ? 'pulse 1.5s ease-in-out infinite' : 'none'
          }}
        >
          {isRecording ? (
            <MicOff className="text-white" size={32} />
          ) : (
            <Mic className="text-white" size={32} />
          )}
        </div>
      </div>

      {/* Instructions tactiles */}
      <div className="fixed top-20 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-xs max-w-48">
        <div className="space-y-1">
          <div>👆 1 doigt: déplacer bulle</div>
          <div>✌️ 2 doigts: zoom/pan canvas</div>
          <div>⏱️ Appui long: ouvrir bulle</div>
        </div>
      </div>

      {/* Modal texte */}
      {showTextModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md border border-white/20">
            <h3 className="text-white text-lg font-bold mb-4">Nouvelle note texte</h3>
            <input
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full p-3 mb-3 bg-black/30 text-white rounded-lg border border-white/20 placeholder-gray-400"
              placeholder="Titre de la note"
              autoFocus
            />
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="w-full h-32 p-3 bg-black/30 text-white rounded-lg border border-white/20 resize-none placeholder-gray-400"
              placeholder="Tapez votre note ici..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={saveTextNote}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold"
              >
                Sauvegarder
              </button>
              <button
                onClick={() => setShowTextModal(false)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-bold"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {notification && (
        <div className="fixed top-20 left-4 right-4 z-50">
          <div className={`p-4 rounded-lg backdrop-blur-lg border text-white text-center ${
            notification.type === 'success' ? 'bg-green-600/80 border-green-500/50' :
            notification.type === 'warning' ? 'bg-yellow-600/80 border-yellow-500/50' :
            'bg-blue-600/80 border-blue-500/50'
          }`}>
            {notification.message}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default CompleteMobileMindMap;