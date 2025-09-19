import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Mic, MicOff, Type, Image as ImageIcon,
  Edit3, List, Grid, Plus, X, Folder, File
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

  // États pour le drag HTML/CSS - SIMPLE et EFFICACE
  const [ballPositions, setBallPositions] = useState({});
  const [draggedBall, setDraggedBall] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  // Refs
  const containerRef = useRef();
  const mediaRecorderRef = useRef();
  const audioChunksRef = useRef([]);

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
        { id: 3, type: 'text', title: 'Courses', content: 'Lait, pain, œufs', timestamp: Date.now() - 21600000, folderId: null },
        { id: 4, type: 'voice', title: 'Médecin', content: 'RDV médecin mardi', timestamp: Date.now() - 10800000, folderId: 'folder-3' }
      ],
      folders: [
        { id: 'folder-3', name: 'Santé', color: '#ff8844' }
      ]
    },
    {
      id: 'ideas',
      emoji: '💡',
      name: 'Idées',
      importance: 3,
      color: '#f59e0b',
      notes: [
        { id: 5, type: 'text', title: 'App mobile', content: 'Idée app pour notes vocales', timestamp: Date.now() - 5400000, folderId: null },
        { id: 6, type: 'voice', title: 'Innovation', content: 'Nouveau concept IA', timestamp: Date.now() - 7200000, folderId: null }
      ],
      folders: []
    },
    {
      id: 'projects',
      emoji: '🚀',
      name: 'Projets',
      importance: 4,
      color: '#ec4899',
      notes: [
        { id: 7, type: 'text', title: 'Site web', content: 'Nouveau portfolio', timestamp: Date.now() - 14400000, folderId: null }
      ],
      folders: []
    },
    {
      id: 'family',
      emoji: '👨‍👩‍👧‍👦',
      name: 'Famille',
      importance: 5,
      color: '#8b5cf6',
      notes: [
        { id: 8, type: 'voice', title: 'Anniversaire', content: 'Anniversaire maman le 15', timestamp: Date.now() - 3600000, folderId: null }
      ],
      folders: []
    }
  ], []);

  // Calcul position par défaut pour les boules
  const getDefaultPosition = useCallback((categoryId, index) => {
    if (!containerRef.current) return { x: 150 + index * 200, y: 150 };

    const container = containerRef.current;
    const centerX = container.offsetWidth / 2;
    const centerY = container.offsetHeight / 2;
    const radius = Math.min(container.offsetWidth, container.offsetHeight) * 0.25;

    const angle = (index * 2 * Math.PI) / categories.length;
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  }, [categories.length]);

  // Gestion du drag HTML/CSS - SYSTÈME SIMPLE QUI MARCHE
  const handleBallMouseDown = useCallback((e, categoryId) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const categoryIndex = categories.findIndex(c => c.id === categoryId);
    const currentPos = ballPositions[categoryId] || getDefaultPosition(categoryId, categoryIndex);

    setDraggedBall(categoryId);
    setSelectedCategory(categoryId);
    setDragOffset({
      x: mouseX - currentPos.x,
      y: mouseY - currentPos.y
    });
  }, [categories, ballPositions, getDefaultPosition]);

  const handleMouseMove = useCallback((e) => {
    if (!draggedBall) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = mouseX - dragOffset.x;
    const newY = mouseY - dragOffset.y;

    // Contraintes pour rester dans le container
    const ballSize = 80;
    const constrainedX = Math.max(ballSize/2, Math.min(newX, rect.width - ballSize/2));
    const constrainedY = Math.max(ballSize/2, Math.min(newY, rect.height - ballSize/2));

    setBallPositions(prev => ({
      ...prev,
      [draggedBall]: { x: constrainedX, y: constrainedY }
    }));
  }, [draggedBall, dragOffset]);

  const handleMouseUp = useCallback(() => {
    if (draggedBall) {
      setDraggedBall(null);
      // Sauvegarder positions dans localStorage
      const positions = { ...ballPositions };
      if (ballPositions[draggedBall]) {
        localStorage.setItem('mindmap-ball-positions', JSON.stringify(positions));
      }
    }
  }, [draggedBall, ballPositions]);

  // Event listeners globaux pour le drag
  useEffect(() => {
    if (draggedBall) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedBall, handleMouseMove, handleMouseUp]);

  // Charger positions et données au démarrage
  useEffect(() => {
    const savedCategories = localStorage.getItem('mindmap-categories');
    const savedPositions = localStorage.getItem('mindmap-ball-positions');

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      setCategories(initialCategories);
    }

    if (savedPositions) {
      setBallPositions(JSON.parse(savedPositions));
    }
  }, [initialCategories]);

  // Observer la taille du container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Fonctions utilitaires
  const saveData = useCallback(() => {
    localStorage.setItem('mindmap-categories', JSON.stringify(categories));
  }, [categories]);

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const addNote = useCallback((categoryId, note) => {
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId
        ? { ...cat, notes: [...cat.notes, { ...note, id: Date.now() }] }
        : cat
    ));
    showNotification('Note ajoutée !', 'success');
  }, [showNotification]);

  const deleteNote = useCallback((categoryId, noteId) => {
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId
        ? { ...cat, notes: cat.notes.filter(note => note.id !== noteId) }
        : cat
    ));
    showNotification('Note supprimée !', 'success');
  }, [showNotification]);

  const addFolder = useCallback((categoryId) => {
    if (!newFolderName.trim()) return;

    const newFolder = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      color: themes[currentTheme].accent
    };

    setCategories(prev => prev.map(cat =>
      cat.id === categoryId
        ? { ...cat, folders: [...cat.folders, newFolder] }
        : cat
    ));

    setNewFolderName('');
    setShowCreateFolder(false);
    showNotification('Dossier créé !', 'success');
  }, [newFolderName, themes, currentTheme, showNotification]);

  const theme = themes[currentTheme];

  return (
    <div
      className="min-h-screen p-4 relative overflow-hidden"
      style={{ background: theme.bg }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold" style={{ color: theme.text }}>
            🧠 Mind Map Notes
          </h1>

          {/* Sélecteur de thème */}
          <select
            value={currentTheme}
            onChange={(e) => setCurrentTheme(e.target.value)}
            className="px-3 py-1 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: theme.surface,
              color: theme.text,
              border: `1px solid ${theme.primary}40`
            }}
          >
            <option value="dark">🌙 Sombre</option>
            <option value="ocean">🌊 Océan</option>
            <option value="sunset">🌅 Coucher</option>
            <option value="forest">🌲 Forêt</option>
          </select>
        </div>

        {/* Contrôles de vue */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'mindmap' ? 'list' : 'mindmap')}
            className="p-2 rounded-lg transition-all hover:scale-105"
            style={{
              backgroundColor: theme.surface,
              color: theme.text
            }}
          >
            {viewMode === 'mindmap' ? <List size={20} /> : <Grid size={20} />}
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className="fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse"
          style={{
            backgroundColor: notification.type === 'success' ? theme.accent : theme.secondary,
            color: theme.text
          }}
        >
          {notification.message}
        </div>
      )}

      {viewMode === 'mindmap' ? (
        /* Mode Mind Map avec HTML/CSS */
        <div
          ref={containerRef}
          className="relative w-full h-[600px] rounded-2xl border overflow-hidden"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.primary + '40'
          }}
        >
          {categories.map((category, index) => {
            const position = ballPositions[category.id] || getDefaultPosition(category.id, index);
            const isSelected = selectedCategory === category.id;
            const isDragging = draggedBall === category.id;

            return (
              <div
                key={category.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100 cursor-grab ${
                  isDragging ? 'scale-110 z-50 cursor-grabbing' : isSelected ? 'scale-105 z-40' : 'z-10'
                }`}
                style={{
                  left: position.x,
                  top: position.y,
                }}
                onMouseDown={(e) => handleBallMouseDown(e, category.id)}
                onClick={() => setSelectedCategory(category.id)}
              >
                {/* Boule principale */}
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-2xl ${
                    isSelected ? 'ring-4 ring-white/50' : ''
                  }`}
                  style={{
                    backgroundColor: category.color,
                    boxShadow: isSelected
                      ? `0 0 30px ${category.color}80, 0 10px 20px rgba(0,0,0,0.5)`
                      : `0 0 15px ${category.color}40, 0 5px 15px rgba(0,0,0,0.3)`
                  }}
                >
                  {category.emoji}
                </div>

                {/* Nom */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-sm font-bold text-center whitespace-nowrap"
                     style={{ color: theme.text }}>
                  {category.name}
                </div>

                {/* Compteur de notes */}
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                     style={{ backgroundColor: theme.accent, color: theme.text }}>
                  {category.notes.length}
                </div>

                {/* Indicateur de drag */}
                {isDragging && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs"
                       style={{ color: theme.primary }}>
                    Position: ({Math.round(position.x)}, {Math.round(position.y)})
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Mode Liste */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <div
              key={category.id}
              className="p-6 rounded-xl shadow-lg"
              style={{ backgroundColor: theme.surface }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                  style={{ backgroundColor: category.color }}
                >
                  {category.emoji}
                </div>
                <h3 className="text-xl font-bold" style={{ color: theme.text }}>
                  {category.name}
                </h3>
              </div>

              <div className="space-y-2">
                {category.notes.map(note => (
                  <div
                    key={note.id}
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: theme.bg }}
                  >
                    <div className="font-medium" style={{ color: theme.text }}>
                      {note.title}
                    </div>
                    <div className="text-sm" style={{ color: theme.textSecondary }}>
                      {note.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Panel latéral pour la catégorie sélectionnée */}
      {selectedCategory && (
        <div
          className="fixed right-0 top-0 h-full w-80 p-6 shadow-2xl z-40 overflow-y-auto"
          style={{ backgroundColor: theme.surface }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold" style={{ color: theme.text }}>
              {categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <button
              onClick={() => setSelectedCategory(null)}
              className="p-1 rounded-full hover:bg-white/10"
              style={{ color: theme.text }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Contenu du panel - notes, dossiers, etc. */}
          <div className="space-y-4">
            <div className="text-sm" style={{ color: theme.textSecondary }}>
              {categories.find(c => c.id === selectedCategory)?.notes.length || 0} notes
            </div>

            {/* Liste des notes */}
            {categories.find(c => c.id === selectedCategory)?.notes.map(note => (
              <div
                key={note.id}
                className="p-3 rounded-lg"
                style={{ backgroundColor: theme.bg }}
              >
                <div className="font-medium" style={{ color: theme.text }}>
                  {note.title}
                </div>
                <div className="text-sm mt-1" style={{ color: theme.textSecondary }}>
                  {note.content}
                </div>
              </div>
            ))}

            {/* Boutons d'action */}
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setShowTextModal(true)}
                className="flex-1 p-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                style={{
                  backgroundColor: theme.primary,
                  color: theme.text
                }}
              >
                <Type size={16} className="inline mr-2" />
                Texte
              </button>
              <button
                onClick={() => setIsRecording(!isRecording)}
                className="flex-1 p-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                style={{
                  backgroundColor: isRecording ? theme.secondary : theme.accent,
                  color: theme.text
                }}
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                <span className="ml-2">{isRecording ? 'Stop' : 'Voice'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour ajouter du texte */}
      {showTextModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className="w-96 p-6 rounded-xl"
            style={{ backgroundColor: theme.surface }}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: theme.text }}>
              Nouvelle note texte
            </h3>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Tapez votre note..."
              className="w-full h-32 p-3 rounded-lg resize-none"
              style={{
                backgroundColor: theme.bg,
                color: theme.text,
                border: `1px solid ${theme.primary}40`
              }}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  if (textInput.trim() && selectedCategory) {
                    addNote(selectedCategory, {
                      type: 'text',
                      title: textInput.slice(0, 30) + '...',
                      content: textInput,
                      timestamp: Date.now(),
                      folderId: null
                    });
                    setTextInput('');
                    setShowTextModal(false);
                  }
                }}
                className="flex-1 p-2 rounded-lg font-medium"
                style={{
                  backgroundColor: theme.primary,
                  color: theme.text
                }}
              >
                Ajouter
              </button>
              <button
                onClick={() => {
                  setTextInput('');
                  setShowTextModal(false);
                }}
                className="flex-1 p-2 rounded-lg font-medium"
                style={{
                  backgroundColor: theme.surface,
                  color: theme.text,
                  border: `1px solid ${theme.primary}40`
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MindMapNotes;