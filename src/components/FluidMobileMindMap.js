import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Mic, MicOff, Type, Plus, X, Home, Camera, Settings, LogOut,
  Volume2, VolumeX, Sun, Moon, Palette, RotateCcw, ArrowLeft,
  Edit3, Trash2, Save, Share2, FolderPlus, File, Folder,
  ChevronRight, ChevronDown, Send, Download, Upload,
  Move, ZoomIn, Eye, Maximize2
} from 'lucide-react';

const FluidMobileMindMap = ({ onLogout }) => {
  // États principaux
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [openCategory, setOpenCategory] = useState(null);

  // États pour les interactions mobiles
  const [isRecording, setIsRecording] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showTextModal, setShowTextModal] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [noteTitle, setNoteTitle] = useState('');

  // États pour le zoom/pan tactile du canvas
  const [canvasTransform, setCanvasTransform] = useState({
    scale: 1,
    translateX: 0,
    translateY: 0
  });

  // États pour le système de sélection fluide
  const [ballPositions, setBallPositions] = useState({});
  const [activeBall, setActiveBall] = useState(null); // Quelle bulle est sélectionnée
  const [dragMode, setDragMode] = useState(null); // 'move', 'resize', ou null
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [ballSizes, setBallSizes] = useState({});

  // Refs
  const canvasRef = useRef();
  const panStartRef = useRef({ x: 0, y: 0 });
  const lastTouchDistance = useRef(0);
  const isPanning = useRef(false);

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
    }
  };

  const theme = themes[currentTheme];

  // Données
  const sampleCategories = [
    {
      id: '1',
      name: 'Travail',
      emoji: '💼',
      importance: 5,
      files: 12,
      folders: [
        {
          id: 'f1',
          name: 'Projets',
          notes: [
            { id: 'n1', title: 'Meeting client', content: 'Présentation du nouveau projet...', type: 'text', date: '2024-01-15' }
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
      folders: [
        {
          id: 'f2',
          name: 'Tâches',
          notes: [
            { id: 'n2', title: 'Courses', content: 'Lait, pain, légumes...', type: 'text', date: '2024-01-17' }
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
      folders: [
        {
          id: 'f3',
          name: 'Innovation',
          notes: []
        }
      ]
    },
    {
      id: '4',
      name: 'Projets',
      emoji: '🚀',
      importance: 5,
      files: 20,
      folders: [
        {
          id: 'f4',
          name: 'En cours',
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

  // Blocage minimal - seulement le pull-to-refresh
  useEffect(() => {
    const preventPullToRefresh = (e) => {
      const isAtTop = window.pageYOffset === 0;
      if (isAtTop && e.touches && e.touches[0] && e.touches[0].clientY < 50) {
        e.preventDefault();
      }
    };

    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    document.addEventListener('touchstart', preventPullToRefresh, { passive: false });

    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.removeEventListener('touchstart', preventPullToRefresh);
    };
  }, []);

  const initializeBallPositions = () => {
    const positions = {};
    const sizes = {};
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const radius = Math.min(window.innerWidth, window.innerHeight) * 0.2;

    sampleCategories.forEach((category, index) => {
      const angle = (index / sampleCategories.length) * 2 * Math.PI;
      positions[category.id] = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
      sizes[category.id] = 60 + (category.importance * 8); // Taille par défaut
    });

    setBallPositions(positions);
    setBallSizes(sizes);
  };

  // Gestionnaire tactile universel pour canvas
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = (touch.clientX - rect.left - canvasTransform.translateX) / canvasTransform.scale;
    const canvasY = (touch.clientY - rect.top - canvasTransform.translateY) / canvasTransform.scale;

    if (e.touches.length === 1) {
      // Un doigt - check si on touche une bulle
      let touchedBall = null;
      for (const category of categories) {
        const pos = ballPositions[category.id];
        const size = ballSizes[category.id] || 80;
        const distance = Math.sqrt(
          Math.pow(canvasX - pos.x, 2) + Math.pow(canvasY - pos.y, 2)
        );
        if (distance < size / 2) {
          touchedBall = category.id;
          break;
        }
      }

      if (touchedBall) {
        // Touche une bulle - la sélectionner
        setActiveBall(touchedBall);
        setDragStart({ x: canvasX, y: canvasY });
      } else {
        // Touche le vide - désélectionner
        setActiveBall(null);
        setDragMode(null);
        panStartRef.current = { x: touch.clientX, y: touch.clientY };
      }
    } else if (e.touches.length === 2) {
      // Deux doigts - zoom
      const distance = Math.sqrt(
        Math.pow(e.touches[1].clientX - e.touches[0].clientX, 2) +
        Math.pow(e.touches[1].clientY - e.touches[0].clientY, 2)
      );
      lastTouchDistance.current = distance;
      isPanning.current = true;
    }
  }, [categories, ballPositions, ballSizes, canvasTransform]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();

    if (e.touches.length === 2 && isPanning.current) {
      // Zoom avec deux doigts
      const distance = Math.sqrt(
        Math.pow(e.touches[1].clientX - e.touches[0].clientX, 2) +
        Math.pow(e.touches[1].clientY - e.touches[0].clientY, 2)
      );

      if (lastTouchDistance.current > 0) {
        const scaleChange = distance / lastTouchDistance.current;
        const newScale = Math.max(0.5, Math.min(3, canvasTransform.scale * scaleChange));

        setCanvasTransform(prev => ({
          ...prev,
          scale: newScale
        }));
      }
      lastTouchDistance.current = distance;
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];

      if (activeBall && dragMode === 'move') {
        // Déplacer la bulle sélectionnée
        const rect = canvasRef.current.getBoundingClientRect();
        const canvasX = (touch.clientX - rect.left - canvasTransform.translateX) / canvasTransform.scale;
        const canvasY = (touch.clientY - rect.top - canvasTransform.translateY) / canvasTransform.scale;

        setBallPositions(prev => ({
          ...prev,
          [activeBall]: { x: canvasX, y: canvasY }
        }));
        setIsDragging(true);
      } else if (activeBall && dragMode === 'resize') {
        // Redimensionner la bulle
        const rect = canvasRef.current.getBoundingClientRect();
        const canvasX = (touch.clientX - rect.left - canvasTransform.translateX) / canvasTransform.scale;
        const canvasY = (touch.clientY - rect.top - canvasTransform.translateY) / canvasTransform.scale;

        const ballPos = ballPositions[activeBall];
        const distance = Math.sqrt(
          Math.pow(canvasX - ballPos.x, 2) + Math.pow(canvasY - ballPos.y, 2)
        );
        const newSize = Math.max(40, Math.min(120, distance * 2));

        setBallSizes(prev => ({
          ...prev,
          [activeBall]: newSize
        }));
        setIsDragging(true);
      } else if (!activeBall) {
        // Pan du canvas
        const deltaX = touch.clientX - panStartRef.current.x;
        const deltaY = touch.clientY - panStartRef.current.y;

        setCanvasTransform(prev => ({
          ...prev,
          translateX: prev.translateX + deltaX,
          translateY: prev.translateY + deltaY
        }));

        panStartRef.current = { x: touch.clientX, y: touch.clientY };
      }
    }
  }, [activeBall, dragMode, canvasTransform, ballPositions]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    isPanning.current = false;
    lastTouchDistance.current = 0;
  }, []);

  // Actions sur les bulles
  const handleBallAction = (action) => {
    if (!activeBall) return;

    switch (action) {
      case 'move':
        setDragMode('move');
        showNotification('Mode déplacement activé - glissez pour bouger', 'info');
        break;
      case 'resize':
        setDragMode('resize');
        showNotification('Mode redimensionnement activé - glissez depuis le centre', 'info');
        break;
      case 'open':
        const category = categories.find(cat => cat.id === activeBall);
        setOpenCategory(category);
        setActiveBall(null);
        setDragMode(null);
        break;
    }
  };

  // Actions notes
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

  const toggleRecording = () => {
    if (!openCategory) {
      showNotification('Ouvrez une catégorie d\'abord', 'warning');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      showNotification(`Note vocale ajoutée à ${openCategory.name}`, 'success');
    } else {
      setIsRecording(true);
      showNotification('Enregistrement en cours...', 'info');
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const resetView = () => {
    setCanvasTransform({ scale: 1, translateX: 0, translateY: 0 });
    initializeBallPositions();
    setActiveBall(null);
    setDragMode(null);
    showNotification('Vue réinitialisée', 'info');
  };

  const handleLogout = () => {
    localStorage.removeItem('mindmap_auth_time');
    localStorage.removeItem('mindmap_authenticated');
    onLogout();
  };

  // Affichage catégorie ouverte
  if (openCategory) {
    return (
      <div className="min-h-screen" style={{ background: theme.bg }}>
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setOpenCategory(null)}
              className="interactive flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Retour</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{openCategory.emoji}</span>
              <h1 className="text-white font-bold text-lg">{openCategory.name}</h1>
            </div>
            <button
              onClick={handleLogout}
              className="interactive p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="pt-16 pb-20 p-4">
          {openCategory.folders.map(folder => (
            <div key={folder.id} className="mb-6">
              <div className="flex items-center gap-2 w-full p-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 text-white mb-3">
                <Folder size={20} />
                <span className="font-semibold">{folder.name}</span>
                <span className="text-sm opacity-70">({folder.notes.length})</span>
              </div>

              <div className="space-y-3 ml-4">
                {folder.notes.map(note => (
                  <div key={note.id} className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <File size={16} />
                        <h3 className="text-white font-medium">{note.title}</h3>
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
            </div>
          ))}
        </div>

        {/* Boutons d'action */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-lg border-t border-white/10 p-4">
          <div className="flex justify-around items-center">
            <button
              onClick={addTextNote}
              className="interactive flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-blue-600/80 text-white text-sm hover:bg-blue-700/80 transition-all"
            >
              <Type size={20} />
              <span>Texte</span>
            </button>

            <button
              onClick={toggleRecording}
              className={`interactive flex flex-col items-center gap-1 px-6 py-2 rounded-xl text-white text-sm transition-all ${
                isRecording
                  ? 'bg-red-600 animate-pulse shadow-lg shadow-red-500/50'
                  : 'bg-gray-600 hover:bg-red-500'
              }`}
            >
              {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
              <span>{isRecording ? 'Arrêter' : 'Vocal'}</span>
            </button>

            <button className="interactive flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-green-600/80 text-white text-sm hover:bg-green-700/80 transition-all">
              <Camera size={20} />
              <span>Photo</span>
            </button>
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
                  className="interactive flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all"
                >
                  Sauvegarder
                </button>
                <button
                  onClick={() => setShowTextModal(false)}
                  className="interactive px-6 py-3 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-700 transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
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
            className="interactive flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
          >
            <Home size={20} />
            <span className="font-bold">Alkemia Art</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={resetView}
              className="interactive p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
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
            </select>

            <button
              onClick={handleLogout}
              className="interactive p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Mind Map */}
      <div
        ref={canvasRef}
        className="absolute inset-0 pt-16"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `scale(${canvasTransform.scale}) translate(${canvasTransform.translateX}px, ${canvasTransform.translateY}px)`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        {/* Bulles */}
        {categories.map((category) => {
          const position = ballPositions[category.id] || { x: 0, y: 0 };
          const size = ballSizes[category.id] || 80;
          const isActive = activeBall === category.id;

          return (
            <div key={category.id} className="absolute" style={{ left: 0, top: 0 }}>
              {/* Bulle principale */}
              <div
                className={`absolute rounded-full flex flex-col items-center justify-center text-white font-bold cursor-pointer transition-all duration-200 select-none ${
                  isActive ? 'ring-4 ring-blue-400 shadow-2xl' : ''
                }`}
                style={{
                  left: position.x - size/2,
                  top: position.y - size/2,
                  width: size,
                  height: size,
                  background: isActive
                    ? `linear-gradient(135deg, ${theme.accent}, ${theme.primary})`
                    : `linear-gradient(135deg, ${theme.surface}, ${theme.primary}40)`,
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${isActive ? theme.accent : theme.border}`,
                  zIndex: isActive ? 50 : 10,
                  transform: dragMode && isActive ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                <span className="text-2xl mb-1">{category.emoji}</span>
                <span className="text-xs text-center px-1 leading-tight">
                  {category.name}
                </span>
                <span className="text-xs opacity-70">{category.files}</span>
              </div>

              {/* Menu d'actions - affiché quand la bulle est sélectionnée */}
              {isActive && (
                <div
                  className="absolute flex gap-2"
                  style={{
                    left: position.x - 60,
                    top: position.y - size/2 - 60,
                    zIndex: 60
                  }}
                >
                  {/* Bouton Déplacer */}
                  <button
                    onClick={() => handleBallAction('move')}
                    className={`interactive w-12 h-12 rounded-full flex items-center justify-center text-white transition-all ${
                      dragMode === 'move' ? 'bg-blue-600 scale-110' : 'bg-gray-700/80'
                    } backdrop-blur-lg border border-white/20`}
                  >
                    <Move size={18} />
                  </button>

                  {/* Bouton Redimensionner */}
                  <button
                    onClick={() => handleBallAction('resize')}
                    className={`interactive w-12 h-12 rounded-full flex items-center justify-center text-white transition-all ${
                      dragMode === 'resize' ? 'bg-purple-600 scale-110' : 'bg-gray-700/80'
                    } backdrop-blur-lg border border-white/20`}
                  >
                    <Maximize2 size={18} />
                  </button>

                  {/* Bouton Ouvrir */}
                  <button
                    onClick={() => handleBallAction('open')}
                    className="interactive w-12 h-12 rounded-full bg-green-600/80 flex items-center justify-center text-white hover:bg-green-700 transition-all backdrop-blur-lg border border-white/20"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="fixed bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-xs max-w-64">
        <div className="space-y-1">
          <div>👆 Toucher bulle → sélectionner</div>
          <div>✌️ 2 doigts → zoom</div>
          <div>🔄 Mode actif: {dragMode || 'navigation'}</div>
        </div>
      </div>

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
    </div>
  );
};

export default FluidMobileMindMap;