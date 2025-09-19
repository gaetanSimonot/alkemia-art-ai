import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Mic, MicOff, Type, Share2, Plus, X, Folder, File,
  ChevronRight, ChevronDown, Edit3, Trash2, Save, FolderPlus,
  Bold, Italic, Underline, List, AlignLeft, Link2, Mail, Upload
} from 'lucide-react';

const MindMapNotes = () => {
  // États principaux
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('dark');

  // États pour les interactions
  const [isRecording, setIsRecording] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showRichEditor, setShowRichEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [textInput, setTextInput] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [richEditorContent, setRichEditorContent] = useState('');

  // États pour le drag des boules - SIMPLE ET EFFICACE
  const [ballPositions, setBallPositions] = useState({});
  const [draggedBall, setDraggedBall] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // États pour le drag organisé des fichiers/dossiers
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedItemType, setDraggedItemType] = useState(null);
  const [dragOverTarget, setDragOverTarget] = useState(null);

  // Refs
  const containerRef = useRef();
  const sidebarRef = useRef();

  // Thèmes améliorés
  const themes = useMemo(() => ({
    dark: {
      bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#06d6a0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      text: '#ffffff',
      textSecondary: '#94a3b8',
      surface: 'rgba(255, 255, 255, 0.05)',
      surfaceHover: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.1)',
      shadow: 'rgba(0, 0, 0, 0.5)'
    },
    ocean: {
      bg: 'linear-gradient(135deg, #0c1445 0%, #1e3a8a 50%, #0891b2 100%)',
      primary: '#0ea5e9',
      secondary: '#3b82f6',
      accent: '#10b981',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      text: '#ffffff',
      textSecondary: '#94a3b8',
      surface: 'rgba(255, 255, 255, 0.08)',
      surfaceHover: 'rgba(255, 255, 255, 0.12)',
      border: 'rgba(255, 255, 255, 0.1)',
      shadow: 'rgba(0, 0, 0, 0.4)'
    },
    sunset: {
      bg: 'linear-gradient(135deg, #451a03 0%, #ea580c 50%, #dc2626 100%)',
      primary: '#f97316',
      secondary: '#ec4899',
      accent: '#8b5cf6',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      text: '#ffffff',
      textSecondary: '#fbbf24',
      surface: 'rgba(255, 255, 255, 0.08)',
      surfaceHover: 'rgba(255, 255, 255, 0.12)',
      border: 'rgba(255, 255, 255, 0.15)',
      shadow: 'rgba(0, 0, 0, 0.4)'
    },
    forest: {
      bg: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)',
      primary: '#22c55e',
      secondary: '#16a34a',
      accent: '#84cc16',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      text: '#ffffff',
      textSecondary: '#bbf7d0',
      surface: 'rgba(255, 255, 255, 0.06)',
      surfaceHover: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.1)',
      shadow: 'rgba(0, 0, 0, 0.3)'
    }
  }), []);

  // Données initiales
  const initialCategories = useMemo(() => [
    {
      id: 'work',
      emoji: '💼',
      name: 'Travail',
      color: '#6366f1',
      notes: [
        { id: 1, type: 'text', title: 'Réunion équipe', content: 'Réunion équipe demain 14h', timestamp: Date.now(), folderId: null },
        { id: 2, type: 'text', title: 'Rapport projet', content: 'Finir rapport pour vendredi', timestamp: Date.now(), folderId: 'folder-1' }
      ],
      folders: [
        { id: 'folder-1', name: 'Urgent', color: '#ef4444' },
        { id: 'folder-2', name: 'En cours', color: '#f59e0b' }
      ]
    },
    {
      id: 'personal',
      emoji: '🏠',
      name: 'Personnel',
      color: '#06d6a0',
      notes: [
        { id: 3, type: 'text', title: 'Courses', content: 'Lait, pain, œufs', timestamp: Date.now(), folderId: null }
      ],
      folders: []
    },
    {
      id: 'ideas',
      emoji: '💡',
      name: 'Idées',
      color: '#f59e0b',
      notes: [
        { id: 5, type: 'text', title: 'App mobile', content: 'Idée app pour notes vocales', timestamp: Date.now(), folderId: null }
      ],
      folders: []
    }
  ], []);

  // Position par défaut pour les boules
  const getDefaultBallPosition = useCallback((categoryId, index) => {
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

  // Gestion du drag des boules
  const handleBallMouseDown = useCallback((e, categoryId) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const categoryIndex = categories.findIndex(c => c.id === categoryId);
    const currentPos = ballPositions[categoryId] || getDefaultBallPosition(categoryId, categoryIndex);

    setDraggedBall(categoryId);
    setSelectedCategory(categoryId);
    setDragOffset({
      x: mouseX - currentPos.x,
      y: mouseY - currentPos.y
    });
  }, [categories, ballPositions, getDefaultBallPosition]);

  const handleBallMouseMove = useCallback((e) => {
    if (!draggedBall) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = mouseX - dragOffset.x;
    const newY = mouseY - dragOffset.y;

    const ballSize = 80;
    const constrainedX = Math.max(ballSize/2, Math.min(newX, rect.width - ballSize/2));
    const constrainedY = Math.max(ballSize/2, Math.min(newY, rect.height - ballSize/2));

    setBallPositions(prev => ({
      ...prev,
      [draggedBall]: { x: constrainedX, y: constrainedY }
    }));
  }, [draggedBall, dragOffset]);

  const handleBallMouseUp = useCallback(() => {
    if (draggedBall) {
      setDraggedBall(null);
      localStorage.setItem('mindmap-ball-positions', JSON.stringify(ballPositions));
    }
  }, [draggedBall, ballPositions]);

  // Fonctions utilitaires - DÉPLACÉ EN PREMIER
  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const autoBackup = useCallback(() => {
    const backupData = {
      categories,
      ballPositions,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindmap-backup-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [categories, ballPositions]);

  const emailBackup = useCallback(() => {
    const backupData = {
      categories,
      ballPositions,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    const jsonData = JSON.stringify(backupData, null, 2);
    const encodedData = encodeURIComponent(jsonData);
    const timestamp = new Date().toLocaleDateString('fr-FR');

    const subject = `Backup MindMap - ${timestamp}`;
    const body = `Voici votre backup MindMap du ${timestamp}.\n\nPour restaurer :\n1. Copiez le contenu JSON ci-dessous\n2. Utilisez le bouton "Importer Backup" dans l'application\n\nDonnées JSON :\n\n${jsonData}`;

    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto);

    showNotification('Email de backup ouvert !', 'success');
  }, [categories, ballPositions, showNotification]);

  const importBackup = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target.result);

        if (backupData.categories) {
          setCategories(backupData.categories);
          localStorage.setItem('mindmap-categories', JSON.stringify(backupData.categories));
        }

        if (backupData.ballPositions) {
          setBallPositions(backupData.ballPositions);
          localStorage.setItem('mindmap-ball-positions', JSON.stringify(backupData.ballPositions));
        }

        showNotification('Backup restauré avec succès !', 'success');
      } catch (error) {
        showNotification('Erreur lors de la restauration du backup', 'error');
      }
    };
    reader.readAsText(file);

    // Reset input for allowing same file selection again
    event.target.value = '';
  }, [showNotification]);

  // Gestion du drag organisé des fichiers/dossiers
  const handleItemDragStart = useCallback((e, itemId, itemType) => {
    setDraggedItem(itemId);
    setDraggedItemType(itemType);
  }, []);

  const handleItemDragOver = useCallback((e, targetId, targetType) => {
    e.preventDefault();
    setDragOverTarget({ id: targetId, type: targetType });
  }, []);

  const handleItemDrop = useCallback((e, targetId, targetType) => {
    e.preventDefault();

    if (!draggedItem || !selectedCategory) return;

    setCategories(prev => prev.map(cat => {
      if (cat.id !== selectedCategory) return cat;

      // Déplacer une note
      if (draggedItemType === 'note') {
        const noteToMove = cat.notes.find(n => n.id === draggedItem);
        if (!noteToMove) return cat;

        if (targetType === 'folder') {
          // Déplacer dans un dossier
          return {
            ...cat,
            notes: cat.notes.map(note =>
              note.id === draggedItem
                ? { ...note, folderId: targetId }
                : note
            )
          };
        } else if (targetType === 'category') {
          // Sortir du dossier
          return {
            ...cat,
            notes: cat.notes.map(note =>
              note.id === draggedItem
                ? { ...note, folderId: null }
                : note
            )
          };
        }
      }

      return cat;
    }));

    setDraggedItem(null);
    setDraggedItemType(null);
    setDragOverTarget(null);
    showNotification('Élément déplacé !', 'success');
  }, [draggedItem, draggedItemType, selectedCategory, showNotification]);

  // Event listeners globaux
  useEffect(() => {
    const handleMouseMove = (e) => {
      handleBallMouseMove(e);
    };

    const handleMouseUp = (e) => {
      handleBallMouseUp();
    };

    if (draggedBall) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedBall, handleBallMouseMove, handleBallMouseUp]);

  // Charger données au démarrage
  useEffect(() => {
    const savedCategories = localStorage.getItem('mindmap-categories');
    const savedBallPositions = localStorage.getItem('mindmap-ball-positions');

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      setCategories(initialCategories);
    }

    if (savedBallPositions) {
      setBallPositions(JSON.parse(savedBallPositions));
    }
  }, [initialCategories]);

  // Auto-backup whenever categories change
  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem('mindmap-categories', JSON.stringify(categories));
      // Trigger auto-backup after a delay to avoid too frequent downloads
      const timeoutId = setTimeout(() => {
        autoBackup();
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [categories, autoBackup]);

  // Autres fonctions utilitaires

  const addNote = useCallback(() => {
    if (!noteTitle.trim() || !selectedCategory) return;

    const newNote = {
      id: Date.now(),
      type: 'text',
      title: noteTitle,
      content: richEditorContent || textInput,
      timestamp: Date.now(),
      folderId: null
    };

    setCategories(prev => prev.map(cat =>
      cat.id === selectedCategory
        ? { ...cat, notes: [...cat.notes, newNote] }
        : cat
    ));

    setNoteTitle('');
    setTextInput('');
    setRichEditorContent('');
    setShowTextModal(false);
    showNotification('Note ajoutée !', 'success');
  }, [noteTitle, textInput, richEditorContent, selectedCategory, showNotification]);

  const addFolder = useCallback(() => {
    if (!newFolderName.trim() || !selectedCategory) return;

    const newFolder = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      color: themes[currentTheme].accent
    };

    setCategories(prev => prev.map(cat =>
      cat.id === selectedCategory
        ? { ...cat, folders: [...cat.folders, newFolder] }
        : cat
    ));

    setNewFolderName('');
    setShowCreateFolder(false);
    showNotification('Dossier créé !', 'success');
  }, [newFolderName, selectedCategory, themes, currentTheme, showNotification]);

  const shareNote = useCallback((note) => {
    const noteData = {
      title: note.title,
      content: note.content,
      timestamp: note.timestamp,
      category: categories.find(c => c.id === selectedCategory)?.name
    };

    const dataStr = JSON.stringify(noteData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `note-${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    a.click();

    URL.revokeObjectURL(url);
    showNotification('Note partagée !', 'success');
  }, [categories, selectedCategory, showNotification]);

  const handleShare = useCallback(() => {
    const shareData = {
      categories: categories,
      ballPositions: ballPositions,
      theme: currentTheme,
      timestamp: Date.now()
    };

    const dataStr = JSON.stringify(shareData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `mindmap-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
    showNotification('Mind Map exporté !', 'success');
  }, [categories, ballPositions, currentTheme, showNotification]);

  // Éditeur de texte riche
  const RichTextEditor = ({ content, onChange, onSave, onCancel }) => {
    const editorRef = useRef();

    const formatText = (command, value = null) => {
      document.execCommand(command, false, value);
      onChange(editorRef.current.innerHTML);
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div
          className="w-full max-w-4xl max-h-[90vh] p-6 rounded-2xl shadow-2xl border overflow-hidden flex flex-col"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
            boxShadow: `0 20px 60px ${theme.shadow}`
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold" style={{ color: theme.text }}>
              Éditeur de texte riche
            </h3>
            <div className="flex gap-2">
              <button
                onClick={onSave}
                className="px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all hover:scale-105 shadow-lg"
                style={{
                  backgroundColor: theme.success,
                  color: theme.text,
                  boxShadow: `0 4px 15px ${theme.success}40`
                }}
              >
                <Save size={16} />
                Sauvegarder
              </button>
              <button
                onClick={onCancel}
                className="p-2 rounded-xl transition-all hover:scale-105"
                style={{
                  backgroundColor: theme.surface,
                  color: theme.text,
                  border: `1px solid ${theme.border}`
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Barre d'outils de formatage */}
          <div className="flex gap-1 mb-4 p-3 rounded-xl flex-wrap" style={{ backgroundColor: theme.bg }}>
            <button
              onClick={() => formatText('bold')}
              className="p-2 rounded-lg hover:bg-white/10 transition-all"
              style={{ color: theme.text }}
            >
              <Bold size={16} />
            </button>
            <button
              onClick={() => formatText('italic')}
              className="p-2 rounded-lg hover:bg-white/10 transition-all"
              style={{ color: theme.text }}
            >
              <Italic size={16} />
            </button>
            <button
              onClick={() => formatText('underline')}
              className="p-2 rounded-lg hover:bg-white/10 transition-all"
              style={{ color: theme.text }}
            >
              <Underline size={16} />
            </button>
            <div className="w-px bg-gray-300 mx-2"></div>
            <button
              onClick={() => formatText('formatBlock', 'h1')}
              className="px-3 py-2 rounded-lg hover:bg-white/10 transition-all text-sm font-bold"
              style={{ color: theme.text }}
            >
              H1
            </button>
            <button
              onClick={() => formatText('formatBlock', 'h2')}
              className="px-3 py-2 rounded-lg hover:bg-white/10 transition-all text-sm font-bold"
              style={{ color: theme.text }}
            >
              H2
            </button>
            <button
              onClick={() => formatText('formatBlock', 'h3')}
              className="px-3 py-2 rounded-lg hover:bg-white/10 transition-all text-sm font-bold"
              style={{ color: theme.text }}
            >
              H3
            </button>
            <div className="w-px bg-gray-300 mx-2"></div>
            <button
              onClick={() => formatText('insertUnorderedList')}
              className="p-2 rounded-lg hover:bg-white/10 transition-all"
              style={{ color: theme.text }}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => formatText('insertOrderedList')}
              className="px-3 py-2 rounded-lg hover:bg-white/10 transition-all text-sm"
              style={{ color: theme.text }}
            >
              1.
            </button>
            <button
              onClick={() => formatText('justifyLeft')}
              className="p-2 rounded-lg hover:bg-white/10 transition-all"
              style={{ color: theme.text }}
            >
              <AlignLeft size={16} />
            </button>
          </div>

          {/* Zone d'édition */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning={true}
            className="flex-1 p-4 rounded-xl border resize-none overflow-y-auto min-h-[300px] focus:outline-none"
            style={{
              backgroundColor: theme.bg,
              color: theme.text,
              borderColor: theme.border
            }}
            onInput={(e) => onChange(e.target.innerHTML)}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    );
  };

  const theme = themes[currentTheme];

  return (
    <div
      className="min-h-screen p-6 relative overflow-hidden"
      style={{ background: theme.bg }}
    >
      {/* Header moderne */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
              style={{
                backgroundColor: theme.primary,
                boxShadow: `0 8px 25px ${theme.primary}40`
              }}
            >
              🧠
            </div>
            <h1 className="text-3xl font-bold" style={{ color: theme.text }}>
              Mind Map
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={emailBackup}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg"
              style={{
                backgroundColor: theme.primary,
                color: theme.text,
                border: `1px solid ${theme.border}`
              }}
            >
              <Mail size={16} />
              📧 Backup
            </button>

            <label className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg cursor-pointer"
              style={{
                backgroundColor: theme.secondary,
                color: theme.text,
                border: `1px solid ${theme.border}`
              }}
            >
              <Upload size={16} />
              Importer
              <input
                type="file"
                accept=".json"
                onChange={importBackup}
                className="hidden"
              />
            </label>

            <select
              value={currentTheme}
              onChange={(e) => setCurrentTheme(e.target.value)}
              className="px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-sm transition-all hover:scale-105"
              style={{
                backgroundColor: theme.surface,
                color: theme.text,
                border: `1px solid ${theme.border}`
              }}
            >
              <option value="dark">🌙 Sombre</option>
              <option value="ocean">🌊 Océan</option>
              <option value="sunset">🌅 Coucher</option>
              <option value="forest">🌲 Forêt</option>
            </select>
          </div>
        </div>

      </div>

      {/* Notification moderne */}
      {notification && (
        <div
          className="fixed top-6 right-6 px-6 py-3 rounded-xl shadow-2xl z-50 animate-bounce backdrop-blur-md"
          style={{
            backgroundColor: notification.type === 'success' ? theme.success : theme.primary,
            color: theme.text,
            boxShadow: `0 10px 40px ${notification.type === 'success' ? theme.success : theme.primary}40`
          }}
        >
          {notification.message}
        </div>
      )}

      {/* Container Mind Map avec design amélioré */}
      <div
        ref={containerRef}
        className="relative w-full h-[600px] rounded-3xl border backdrop-blur-md overflow-hidden"
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          boxShadow: `0 20px 60px ${theme.shadow}`
        }}
      >
        {categories.map((category, index) => {
          const position = ballPositions[category.id] || getDefaultBallPosition(category.id, index);
          const isSelected = selectedCategory === category.id;
          const isDragging = draggedBall === category.id;

          return (
            <div
              key={category.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 cursor-grab ${
                isDragging ? 'scale-110 z-50 cursor-grabbing' : isSelected ? 'scale-105 z-40' : 'z-10'
              }`}
              style={{
                left: position.x,
                top: position.y,
              }}
              onMouseDown={(e) => handleBallMouseDown(e, category.id)}
              onClick={() => setSelectedCategory(category.id)}
            >
              {/* Boule avec design moderne */}
              <div
                className={`w-20 h-20 rounded-3xl flex items-center justify-center text-2xl font-bold shadow-2xl border-2 ${
                  isSelected ? 'border-white/30' : 'border-transparent'
                }`}
                style={{
                  backgroundColor: category.color,
                  boxShadow: isSelected
                    ? `0 0 40px ${category.color}60, 0 15px 35px rgba(0,0,0,0.3)`
                    : `0 0 20px ${category.color}30, 0 8px 25px rgba(0,0,0,0.2)`
                }}
              >
                {category.emoji}
              </div>

              {/* Nom avec design moderne */}
              <div
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 text-sm font-bold text-center whitespace-nowrap px-3 py-1 rounded-full backdrop-blur-md"
                style={{
                  color: theme.text,
                  backgroundColor: theme.surface
                }}
              >
                {category.name}
              </div>

              {/* Compteur moderne */}
              <div
                className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white/20"
                style={{
                  backgroundColor: theme.accent,
                  color: theme.text,
                  boxShadow: `0 2px 10px ${theme.accent}50`
                }}
              >
                {category.notes.length}
              </div>
            </div>
          );
        })}
      </div>

      {/* Panel latéral moderne */}
      {selectedCategory && (
        <div
          ref={sidebarRef}
          className="fixed right-0 top-0 h-full w-96 shadow-2xl z-40 backdrop-blur-md border-l"
          style={{
            backgroundColor: theme.surface + 'f0',
            borderColor: theme.border
          }}
        >
          {/* Header du panel */}
          <div className="p-6 border-b" style={{ borderColor: theme.border }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-md"
                  style={{ backgroundColor: categories.find(c => c.id === selectedCategory)?.color }}
                >
                  {categories.find(c => c.id === selectedCategory)?.emoji}
                </div>
                <h2 className="text-xl font-bold" style={{ color: theme.text }}>
                  {categories.find(c => c.id === selectedCategory)?.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="p-2 rounded-xl hover:bg-white/10 transition-all"
                style={{ color: theme.text }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Zone de contenu avec drag & drop organisé */}
          <div className="p-6 h-full overflow-y-auto pb-24">
            {/* Bouton créer dossier */}
            <div className="mb-4">
              <button
                onClick={() => setShowCreateFolder(true)}
                className="w-full p-3 rounded-xl border-2 border-dashed transition-all hover:scale-105 flex items-center justify-center gap-2"
                style={{
                  borderColor: theme.accent,
                  backgroundColor: theme.accent + '10',
                  color: theme.accent
                }}
              >
                <FolderPlus size={18} />
                Créer un dossier
              </button>
            </div>

            {/* Zone de drop pour sortir des dossiers */}
            <div
              className="mb-6 p-4 rounded-xl border-2 border-dashed transition-all"
              style={{
                borderColor: dragOverTarget?.type === 'category' ? theme.accent : theme.border,
                backgroundColor: dragOverTarget?.type === 'category' ? theme.accent + '20' : 'transparent'
              }}
              onDragOver={(e) => handleItemDragOver(e, selectedCategory, 'category')}
              onDrop={(e) => handleItemDrop(e, selectedCategory, 'category')}
            >
              <div className="text-center" style={{ color: theme.textSecondary }}>
                <FolderPlus size={24} className="mx-auto mb-2" />
                <p className="text-sm">Zone racine - glissez ici pour sortir des dossiers</p>
              </div>
            </div>

            {/* Dossiers */}
            {categories.find(c => c.id === selectedCategory)?.folders.map(folder => (
              <div
                key={folder.id}
                className="mb-4"
              >
                <div
                  className="p-4 rounded-xl border transition-all cursor-pointer"
                  style={{
                    backgroundColor: dragOverTarget?.id === folder.id ? theme.accent + '20' : theme.surface,
                    borderColor: dragOverTarget?.id === folder.id ? theme.accent : theme.border,
                    boxShadow: `0 2px 10px ${theme.shadow}`
                  }}
                  onClick={() => setExpandedFolders(prev => ({ ...prev, [folder.id]: !prev[folder.id] }))}
                  onDragOver={(e) => handleItemDragOver(e, folder.id, 'folder')}
                  onDrop={(e) => handleItemDrop(e, folder.id, 'folder')}
                >
                  <div className="flex items-center gap-3">
                    {expandedFolders[folder.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <Folder size={18} style={{ color: folder.color }} />
                    <span className="font-medium" style={{ color: theme.text }}>{folder.name}</span>
                    <span
                      className="ml-auto text-xs px-2 py-1 rounded-full"
                      style={{ backgroundColor: theme.accent, color: theme.text }}
                    >
                      {categories.find(c => c.id === selectedCategory)?.notes.filter(n => n.folderId === folder.id).length}
                    </span>
                  </div>
                </div>

                {/* Notes dans le dossier */}
                {expandedFolders[folder.id] && (
                  <div className="ml-6 mt-2 space-y-2">
                    {categories.find(c => c.id === selectedCategory)?.notes
                      .filter(note => note.folderId === folder.id)
                      .map(note => (
                        <div
                          key={note.id}
                          draggable
                          onDragStart={(e) => handleItemDragStart(e, note.id, 'note')}
                          className="p-3 rounded-lg cursor-move hover:scale-105 transition-all border"
                          style={{
                            backgroundColor: theme.bg,
                            borderColor: theme.border,
                            boxShadow: `0 2px 8px ${theme.shadow}`
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <File size={14} style={{ color: theme.primary }} />
                            <div className="flex-1">
                              <div className="font-medium text-sm" style={{ color: theme.text }}>
                                {note.title}
                              </div>
                              <div className="text-xs mt-1" style={{ color: theme.textSecondary }}>
                                {note.content?.substring(0, 40)}...
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}

            {/* Notes hors dossiers */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium mb-3" style={{ color: theme.textSecondary }}>
                Notes libres
              </h3>
              {categories.find(c => c.id === selectedCategory)?.notes
                .filter(note => !note.folderId)
                .map(note => (
                  <div
                    key={note.id}
                    draggable
                    onDragStart={(e) => handleItemDragStart(e, note.id, 'note')}
                    className="p-4 rounded-xl cursor-move hover:scale-105 transition-all border"
                    style={{
                      backgroundColor: theme.bg,
                      borderColor: theme.border,
                      boxShadow: `0 2px 12px ${theme.shadow}`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <File size={16} style={{ color: theme.primary }} />
                      <div className="flex-1">
                        <div className="font-medium" style={{ color: theme.text }}>
                          {note.title}
                        </div>
                        <div className="text-sm mt-1" style={{ color: theme.textSecondary }}>
                          {note.content?.substring(0, 50)}...
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingNote(note);
                            setRichEditorContent(note.content || '');
                            setShowRichEditor(true);
                          }}
                          className="p-2 rounded-lg hover:bg-white/10 transition-all"
                          title="Modifier"
                        >
                          <Edit3 size={14} style={{ color: theme.textSecondary }} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            shareNote(note);
                          }}
                          className="p-2 rounded-lg hover:bg-white/10 transition-all"
                          title="Partager"
                        >
                          <Share2 size={14} style={{ color: theme.accent }} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Boutons d'action fixes en bas */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t backdrop-blur-md" style={{
            backgroundColor: theme.surface + 'f0',
            borderColor: theme.border
          }}>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTextModal(true)}
                className="flex-1 p-3 rounded-xl font-medium transition-all hover:scale-105 shadow-lg"
                style={{
                  backgroundColor: theme.primary,
                  color: theme.text,
                  boxShadow: `0 4px 15px ${theme.primary}40`
                }}
              >
                <Type size={16} className="inline mr-2" />
                Nouvelle note
              </button>
              <button
                onClick={() => setIsRecording(!isRecording)}
                className="p-3 rounded-xl transition-all hover:scale-105 shadow-lg"
                style={{
                  backgroundColor: isRecording ? theme.error : theme.success,
                  color: theme.text,
                  boxShadow: `0 4px 15px ${isRecording ? theme.error : theme.success}40`
                }}
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal texte moderne */}
      {showTextModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            className="w-full max-w-lg p-8 rounded-2xl shadow-2xl border"
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
              boxShadow: `0 20px 60px ${theme.shadow}`
            }}
          >
            <h3 className="text-2xl font-bold mb-6" style={{ color: theme.text }}>
              Nouvelle note
            </h3>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Titre de la note"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full p-4 rounded-xl border backdrop-blur-sm transition-all focus:scale-105"
                style={{
                  backgroundColor: theme.bg,
                  color: theme.text,
                  borderColor: theme.border
                }}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowTextModal(false);
                  setRichEditorContent('');
                  setShowRichEditor(true);
                }}
                className="flex-1 p-3 rounded-xl font-medium transition-all hover:scale-105 shadow-lg"
                style={{
                  backgroundColor: theme.primary,
                  color: theme.text,
                  boxShadow: `0 4px 15px ${theme.primary}40`
                }}
              >
                Ouvrir l'éditeur
              </button>
              <button
                onClick={() => {
                  setShowTextModal(false);
                  setNoteTitle('');
                  setTextInput('');
                }}
                className="px-6 p-3 rounded-xl font-medium border transition-all hover:scale-105"
                style={{
                  backgroundColor: 'transparent',
                  color: theme.text,
                  borderColor: theme.border
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal création dossier */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            className="w-full max-w-md p-8 rounded-2xl shadow-2xl border"
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
              boxShadow: `0 20px 60px ${theme.shadow}`
            }}
          >
            <h3 className="text-xl font-bold mb-6" style={{ color: theme.text }}>
              Créer un dossier
            </h3>

            <input
              type="text"
              placeholder="Nom du dossier"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full p-4 rounded-xl border backdrop-blur-sm transition-all focus:scale-105"
              style={{
                backgroundColor: theme.bg,
                color: theme.text,
                borderColor: theme.border
              }}
              onKeyPress={(e) => e.key === 'Enter' && addFolder()}
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={addFolder}
                className="flex-1 p-3 rounded-xl font-medium transition-all hover:scale-105 shadow-lg"
                style={{
                  backgroundColor: theme.success,
                  color: theme.text,
                  boxShadow: `0 4px 15px ${theme.success}40`
                }}
              >
                Créer
              </button>
              <button
                onClick={() => {
                  setShowCreateFolder(false);
                  setNewFolderName('');
                }}
                className="px-6 p-3 rounded-xl font-medium border transition-all hover:scale-105"
                style={{
                  backgroundColor: 'transparent',
                  color: theme.text,
                  borderColor: theme.border
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Éditeur de texte riche */}
      {showRichEditor && (
        <RichTextEditor
          content={richEditorContent}
          onChange={setRichEditorContent}
          onSave={() => {
            if (editingNote) {
              // Modifier une note existante
              setCategories(prev => prev.map(cat =>
                cat.id === selectedCategory
                  ? {
                      ...cat,
                      notes: cat.notes.map(note =>
                        note.id === editingNote.id
                          ? { ...note, content: richEditorContent }
                          : note
                      )
                    }
                  : cat
              ));
              showNotification('Note modifiée !', 'success');
            } else if (noteTitle.trim()) {
              // Créer une nouvelle note
              const newNote = {
                id: Date.now(),
                type: 'text',
                title: noteTitle,
                content: richEditorContent,
                timestamp: Date.now(),
                folderId: null
              };

              setCategories(prev => prev.map(cat =>
                cat.id === selectedCategory
                  ? { ...cat, notes: [...cat.notes, newNote] }
                  : cat
              ));
              showNotification('Note créée !', 'success');
            }

            setShowRichEditor(false);
            setEditingNote(null);
            setRichEditorContent('');
            setNoteTitle('');
          }}
          onCancel={() => {
            setShowRichEditor(false);
            setEditingNote(null);
            setRichEditorContent('');
          }}
        />
      )}
    </div>
  );
};

export default MindMapNotes;