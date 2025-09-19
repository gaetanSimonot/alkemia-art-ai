import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Stage, Layer, Circle, Text as KonvaText, Line, Group } from 'react-konva';
import { Mic, MicOff, Camera, Edit3, Zap, Settings, Search, Filter, Plus, Save, Download } from 'lucide-react';
import RichNoteEditor from './RichNoteEditor';

// Données exemple avec catégories pré-remplies
const initialCategories = [
  {
    id: 'travail',
    name: 'Travail',
    emoji: '💼',
    x: 300,
    y: 200,
    color: '#3B82F6',
    importance: 5,
    notes: [
      { id: 1, type: 'text', content: 'Réunion équipe lundi', timestamp: Date.now() - 86400000 },
      { id: 2, type: 'voice', content: 'Finir le rapport mensuel', timestamp: Date.now() - 172800000 }
    ]
  },
  {
    id: 'personnel',
    name: 'Personnel',
    emoji: '🏠',
    x: 500,
    y: 300,
    color: '#10B981',
    importance: 4,
    notes: [
      { id: 3, type: 'text', content: 'Acheter des courses', timestamp: Date.now() - 3600000 }
    ]
  },
  {
    id: 'idees',
    name: 'Idées',
    emoji: '💡',
    x: 150,
    y: 300,
    color: '#F59E0B',
    importance: 5,
    notes: [
      { id: 4, type: 'text', content: 'App de méditation avec IA', timestamp: Date.now() - 7200000 },
      { id: 5, type: 'voice', content: 'Plateforme éco-responsable', timestamp: Date.now() - 14400000 }
    ]
  },
  {
    id: 'projets',
    name: 'Projets',
    emoji: '🚀',
    x: 400,
    y: 100,
    color: '#8B5CF6',
    importance: 5,
    notes: []
  },
  {
    id: 'famille',
    name: 'Famille',
    emoji: '👨‍👩‍👧‍👦',
    x: 600,
    y: 200,
    color: '#EC4899',
    importance: 3,
    notes: [
      { id: 6, type: 'photo', content: 'photo-anniversaire.jpg', timestamp: Date.now() - 259200000 }
    ]
  },
  {
    id: 'sante',
    name: 'Santé',
    emoji: '🏃‍♀️',
    x: 200,
    y: 150,
    color: '#06B6D4',
    importance: 4,
    notes: []
  },
  {
    id: 'creatif',
    name: 'Créatif',
    emoji: '🎨',
    x: 100,
    y: 400,
    color: '#F97316',
    importance: 3,
    notes: []
  },
  {
    id: 'reunions',
    name: 'Réunions',
    emoji: '👥',
    x: 450,
    y: 400,
    color: '#6366F1',
    importance: 4,
    notes: []
  }
];

// Connexions logiques entre catégories
const initialConnections = [
  { from: 'travail', to: 'reunions' },
  { from: 'travail', to: 'projets' },
  { from: 'idees', to: 'projets' },
  { from: 'idees', to: 'creatif' },
  { from: 'personnel', to: 'famille' },
  { from: 'personnel', to: 'sante' }
];

const themes = {
  dark: {
    name: 'Dark',
    background: 'linear-gradient(135deg, #0F0F23 0%, #1E1E3F 100%)',
    cardBg: 'rgba(255, 255, 255, 0.1)',
    textColor: '#FFFFFF',
    accentColor: '#3B82F6'
  },
  ocean: {
    name: 'Ocean',
    background: 'linear-gradient(135deg, #0F2027 0%, #203A43 25%, #2C5364 100%)',
    cardBg: 'rgba(255, 255, 255, 0.15)',
    textColor: '#E0F2FE',
    accentColor: '#06B6D4'
  },
  sunset: {
    name: 'Sunset',
    background: 'linear-gradient(135deg, #667db6 0%, #0082c8 25%, #0082c8 75%, #667db6 100%)',
    cardBg: 'rgba(255, 255, 255, 0.2)',
    textColor: '#FFF7ED',
    accentColor: '#F97316'
  },
  forest: {
    name: 'Forest',
    background: 'linear-gradient(135deg, #2D5016 0%, #A8EB12 100%)',
    cardBg: 'rgba(255, 255, 255, 0.1)',
    textColor: '#F0FDF4',
    accentColor: '#22C55E'
  }
};

const MindMapNotes = () => {
  // States principaux
  const [categories, setCategories] = useState(initialCategories);
  const [connections, setConnections] = useState(initialConnections);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [viewMode, setViewMode] = useState('mindmap'); // 'mindmap' ou 'list'
  const [globalScale, setGlobalScale] = useState(1);
  const [showConnections, setShowConnections] = useState(true);

  // States pour les notes
  const [isRecording, setIsRecording] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [showRichEditor, setShowRichEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [notification, setNotification] = useState(null);

  // States pour la vue et les filtres
  const [sortBy, setSortBy] = useState('importance');
  const [searchTerm, setSearchTerm] = useState('');
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Refs
  const stageRef = useRef();
  const mediaRecorderRef = useRef();
  const audioChunksRef = useRef([]);

  const theme = themes[currentTheme];

  // Calculer la taille des bulles selon l'importance et le nombre de notes (optimisé)
  const getBubbleSize = useCallback((category) => {
    const baseSize = 60;
    const importanceBonus = category.importance * 8; // Réduit pour moins de variation
    const notesBonus = category.notes.length * 3; // Réduit pour moins de variation
    return Math.min((baseSize + importanceBonus + notesBonus) * globalScale, 120); // Taille max
  }, [globalScale]);

  // Positions calculées une seule fois
  const finalCategoryPositions = useMemo(() => {
    return categories.map((category, index) => {
      let finalX = category.x;
      let finalY = category.y;

      if (viewMode === 'mindmap' && !category.customPosition) {
        const centerX = 400;
        const centerY = 300;
        const radius = 200 * globalScale;
        const angle = (index / categories.length) * 2 * Math.PI;
        finalX = centerX + Math.cos(angle) * radius;
        finalY = centerY + Math.sin(angle) * radius;
      }

      return {
        ...category,
        finalX,
        finalY,
        size: getBubbleSize(category)
      };
    });
  }, [categories, viewMode, globalScale, getBubbleSize]);

  // Positionner les bulles en cercle pour la vue Mind Map (optimisé)
  const getCircularPositions = () => {
    if (viewMode !== 'mindmap') return categories;

    const centerX = 400;
    const centerY = 300;
    const radius = 200 * globalScale;

    return categories.map((category, index) => {
      if (category.customPosition) {
        return category; // Garder position custom
      }
      const angle = (index / categories.length) * 2 * Math.PI;
      return {
        ...category,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    });
  };

  // Afficher une notification
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Démarrer l'enregistrement vocal
  const startRecording = async () => {
    if (!selectedCategory) {
      showNotification('Sélectionnez une catégorie avant d\'enregistrer', 'warning');
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

        // Ici on pourrait intégrer Speech-to-Text et ChatGPT
        // Pour la démo, on simule la transcription
        const mockTranscription = 'Note vocale transcrite automatiquement';

        addNoteToCategory(selectedCategory, 'voice', mockTranscription);
        showNotification('Note vocale ajoutée avec succès!', 'success');
      };

      mediaRecorder.start();
      setIsRecording(true);
      showNotification('Enregistrement en cours...', 'info');
    } catch (error) {
      showNotification('Erreur d\'accès au microphone', 'error');
    }
  };

  // Arrêter l'enregistrement
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // Ajouter une note à une catégorie
  const addNoteToCategory = (categoryId, type, content) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          notes: [
            ...cat.notes,
            {
              id: Date.now(),
              type,
              content,
              timestamp: Date.now()
            }
          ]
        };
      }
      return cat;
    }));
  };

  // Ajouter une note texte
  const addTextNote = () => {
    if (!selectedCategory) {
      showNotification('Sélectionnez une catégorie avant d\'ajouter une note', 'warning');
      return;
    }

    if (!newNote.trim()) {
      showNotification('Veuillez saisir du texte', 'warning');
      return;
    }

    addNoteToCategory(selectedCategory, 'text', newNote.trim());
    setNewNote('');
    setShowTextInput(false);
    showNotification('Note texte ajoutée!', 'success');
  };

  // Ouvrir l'éditeur riche
  const openRichEditor = (note = null) => {
    if (!selectedCategory && !note) {
      showNotification('Sélectionnez une catégorie avant de créer une note', 'warning');
      return;
    }
    setEditingNote(note);
    setShowRichEditor(true);
  };

  // Sauvegarder une note riche
  const saveRichNote = (noteData) => {
    if (editingNote) {
      // Modifier note existante
      setCategories(prev => prev.map(cat => ({
        ...cat,
        notes: cat.notes.map(note =>
          note.id === editingNote.id ? noteData : note
        )
      })));
    } else {
      // Nouvelle note
      addNoteToCategory(selectedCategory, 'rich', noteData.content);
    }

    setShowRichEditor(false);
    setEditingNote(null);
    showNotification('Note sauvegardée!', 'success');
  };

  // Gestion du zoom avec la molette
  const handleWheel = (e) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    const oldScale = zoom;
    const pointer = stage.getPointerPosition();

    const scaleBy = 1.1;
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const clampedScale = Math.max(0.3, Math.min(newScale, 3));

    const mousePointTo = {
      x: (pointer.x - panOffset.x) / oldScale,
      y: (pointer.y - panOffset.y) / oldScale
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale
    };

    setZoom(clampedScale);
    setPanOffset(newPos);
  };

  // Rendu des connexions
  const renderConnections = () => {
    if (!showConnections) return null;

    return connections.map((conn, index) => {
      const fromCat = categories.find(c => c.id === conn.from);
      const toCat = categories.find(c => c.id === conn.to);

      if (!fromCat || !toCat) return null;

      return (
        <Line
          key={index}
          points={[fromCat.x, fromCat.y, toCat.x, toCat.y]}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth={2}
          dash={[5, 5]}
        />
      );
    });
  };

  // Rendu des catégories (super optimisé)
  const renderCategories = useCallback(() => {
    return finalCategoryPositions.map((category) => {
      const isSelected = selectedCategory === category.id;

      return (
        <Group
          key={category.id}
          x={category.finalX}
          y={category.finalY}
          draggable
          onDragStart={() => {
            // Marquer comme position custom quand on commence à glisser
            setCategories(prev => prev.map(cat =>
              cat.id === category.id
                ? { ...cat, customPosition: true }
                : cat
            ));
          }}
          onDragEnd={(e) => {
            // Sauver la nouvelle position
            setCategories(prev => prev.map(cat =>
              cat.id === category.id
                ? { ...cat, x: e.target.x(), y: e.target.y(), customPosition: true }
                : cat
            ));
          }}
          onClick={() => setSelectedCategory(category.id)}
          onTap={() => setSelectedCategory(category.id)}
        >
          <Circle
            radius={category.size / 2}
            fill={category.color}
            stroke={isSelected ? '#FFFFFF' : 'transparent'}
            strokeWidth={3}
            opacity={0.8}
            shadowBlur={5}
            shadowColor={category.color}
          />
          <KonvaText
            text={`${category.emoji}\n${category.name}\n${category.notes.length} notes`}
            fontSize={Math.max(10, category.size * 0.12)}
            fontFamily="Arial"
            fill="white"
            align="center"
            verticalAlign="middle"
            width={category.size}
            height={category.size}
            offsetX={category.size / 2}
            offsetY={category.size / 2}
          />
        </Group>
      );
    });
  }, [finalCategoryPositions, selectedCategory, setCategories]);

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden"
      style={{ background: theme.background }}
    >
      {/* Notification */}
      {notification && (
        <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 px-6 py-4 rounded-xl backdrop-blur-lg border text-white font-semibold animate-pulse ${
          notification.type === 'success' ? 'bg-green-500/20 border-green-500/50' :
          notification.type === 'warning' ? 'bg-orange-500/20 border-orange-500/50' :
          notification.type === 'error' ? 'bg-red-500/20 border-red-500/50' :
          'bg-blue-500/20 border-blue-500/50'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold" style={{ color: theme.textColor }}>
              🧠 Mind Map Notes
            </h1>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 rounded-xl backdrop-blur-lg border border-white/20 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <Search size={20} style={{ color: theme.textColor }} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Contrôles thème */}
            <select
              value={currentTheme}
              onChange={(e) => setCurrentTheme(e.target.value)}
              className="px-3 py-2 rounded-xl backdrop-blur-lg bg-white/10 border border-white/20 text-white focus:outline-none"
            >
              {Object.entries(themes).map(([key, theme]) => (
                <option key={key} value={key} className="bg-gray-800">
                  {theme.name}
                </option>
              ))}
            </select>

            {/* Mode d'affichage */}
            <div className="flex rounded-xl overflow-hidden border border-white/20">
              <button
                onClick={() => setViewMode('mindmap')}
                className={`px-4 py-2 ${viewMode === 'mindmap' ? 'bg-white/20' : 'bg-white/5'} backdrop-blur-lg transition-all`}
                style={{ color: theme.textColor }}
              >
                Mind Map
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 ${viewMode === 'list' ? 'bg-white/20' : 'bg-white/5'} backdrop-blur-lg transition-all`}
                style={{ color: theme.textColor }}
              >
                Liste
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar gauche - Contrôles (responsive) */}
      <div className="fixed left-2 md:left-4 top-20 md:top-1/2 md:transform md:-translate-y-1/2 z-30 space-y-4">
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl md:rounded-2xl p-2 md:p-4 space-y-2 md:space-y-4">
          {/* Taille globale */}
          <div>
            <label className="block text-sm mb-2" style={{ color: theme.textColor }}>
              Taille: {Math.round(globalScale * 100)}%
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={globalScale}
              onChange={(e) => setGlobalScale(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Toggle connexions */}
          <button
            onClick={() => setShowConnections(!showConnections)}
            className={`w-full px-3 py-2 rounded-xl transition-all ${
              showConnections ? 'bg-blue-500/30' : 'bg-white/10'
            } border border-white/20`}
            style={{ color: theme.textColor }}
          >
            Connexions
          </button>

          {/* Tri */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 rounded-xl backdrop-blur-lg bg-white/10 border border-white/20 text-white focus:outline-none"
          >
            <option value="importance" className="bg-gray-800">Importance</option>
            <option value="notes" className="bg-gray-800">Nb notes</option>
            <option value="alphabetic" className="bg-gray-800">Alphabétique</option>
            <option value="recent" className="bg-gray-800">Récent</option>
          </select>
        </div>
      </div>

      {/* Panel info droite (responsive) */}
      {selectedCategory && (
        <div className="fixed right-2 md:right-4 top-20 md:top-1/2 md:transform md:-translate-y-1/2 z-30 w-64 md:w-80">
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl md:rounded-2xl p-3 md:p-6">
            {(() => {
              const category = categories.find(c => c.id === selectedCategory);
              return (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{category.emoji}</span>
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: theme.textColor }}>
                        {category.name}
                      </h3>
                      <p className="text-sm opacity-75" style={{ color: theme.textColor }}>
                        {category.notes.length} notes • Importance: {category.importance}/5
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-48 md:max-h-60 overflow-y-auto">
                    {category.notes.map((note) => (
                      <div
                        key={note.id}
                        className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
                        onClick={() => openRichEditor(note)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs">
                            {note.type === 'voice' ? '🎤' : note.type === 'photo' ? '📷' : note.type === 'rich' ? '📄' : '📝'}
                          </span>
                          <span className="text-xs opacity-75" style={{ color: theme.textColor }}>
                            {new Date(note.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm line-clamp-2" style={{ color: theme.textColor }}>
                          {typeof note.content === 'string'
                            ? note.content.replace(/<[^>]*>/g, '').substring(0, 50) + '...'
                            : note.content
                          }
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Bouton nouvelle note riche */}
                  <button
                    onClick={() => openRichEditor()}
                    className="w-full mt-3 px-3 py-2 bg-blue-500/30 text-white rounded-xl text-sm hover:bg-blue-500/40 transition-all"
                  >
                    ✍️ Nouvelle note
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Éditeur de notes riche */}
      {showRichEditor && (
        <RichNoteEditor
          note={editingNote}
          onSave={saveRichNote}
          onClose={() => {
            setShowRichEditor(false);
            setEditingNote(null);
          }}
          categoryColor={
            selectedCategory
              ? categories.find(c => c.id === selectedCategory)?.color || '#3B82F6'
              : '#3B82F6'
          }
        />
      )}

      {/* Canvas principal */}
      <div className="w-full h-full">
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          scaleX={zoom}
          scaleY={zoom}
          x={panOffset.x}
          y={panOffset.y}
          onWheel={handleWheel}
          ref={stageRef}
          draggable
          onDragEnd={(e) => {
            setPanOffset({
              x: e.target.x(),
              y: e.target.y()
            });
          }}
        >
          <Layer>
            {renderConnections()}
            {renderCategories()}
          </Layer>
        </Stage>
      </div>

      {/* Input texte modal */}
      {showTextInput && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 w-96">
            <h3 className="text-xl font-bold mb-4" style={{ color: theme.textColor }}>
              Nouvelle note texte
            </h3>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Tapez votre note ici..."
              className="w-full h-32 p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/70 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={addTextNote}
                className="flex-1 px-4 py-3 bg-blue-500/30 text-white rounded-xl font-semibold hover:bg-blue-500/40 transition-all"
              >
                Ajouter
              </button>
              <button
                onClick={() => {
                  setShowTextInput(false);
                  setNewNote('');
                }}
                className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Boutons d'action en bas */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <div className="flex items-center gap-4">
          {/* Note texte */}
          <button
            onClick={() => setShowTextInput(true)}
            className="flex items-center gap-2 px-6 py-4 bg-blue-500/30 backdrop-blur-lg border border-blue-500/50 text-white rounded-2xl font-semibold hover:bg-blue-500/40 transition-all shadow-lg"
          >
            <Edit3 size={20} />
            <span>Note</span>
          </button>

          {/* Note vocale */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center gap-2 px-8 py-5 backdrop-blur-lg border rounded-2xl font-semibold text-white transition-all shadow-lg text-lg ${
              isRecording
                ? 'bg-red-500/30 border-red-500/50 hover:bg-red-500/40 animate-pulse'
                : 'bg-red-500/30 border-red-500/50 hover:bg-red-500/40'
            }`}
          >
            {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
            <span>{isRecording ? 'Arrêter' : 'Vocal'}</span>
          </button>

          {/* Photo */}
          <button
            className="flex items-center gap-2 px-6 py-4 bg-green-500/30 backdrop-blur-lg border border-green-500/50 text-white rounded-2xl font-semibold hover:bg-green-500/40 transition-all shadow-lg"
          >
            <Camera size={20} />
            <span>Photo</span>
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                if (e.target.files[0] && selectedCategory) {
                  addNoteToCategory(selectedCategory, 'photo', e.target.files[0].name);
                  showNotification('Photo ajoutée!', 'success');
                } else if (!selectedCategory) {
                  showNotification('Sélectionnez une catégorie', 'warning');
                }
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MindMapNotes;