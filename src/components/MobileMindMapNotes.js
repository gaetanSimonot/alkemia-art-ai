import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Mic, MicOff, Type, Plus, X, Home, Camera, Settings,
  Volume2, VolumeX, Sun, Moon, Palette, RotateCcw
} from 'lucide-react';

const MobileMindMapNotes = () => {
  // États principaux
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('dark');

  // États pour les interactions mobiles
  const [isRecording, setIsRecording] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showTextModal, setShowTextModal] = useState(false);
  const [textInput, setTextInput] = useState('');

  // États pour le zoom/pan tactile
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // États pour le drag des bulles
  const [ballPositions, setBallPositions] = useState({});
  const [draggedBall, setDraggedBall] = useState(null);
  const [longPressTimer, setLongPressTimer] = useState(null);

  // Ref pour le conteneur
  const containerRef = useRef();

  // Thèmes simplifiés pour mobile
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

  // Données de démonstration
  const sampleCategories = [
    { id: '1', name: 'Travail', emoji: '💼', importance: 5, files: 12, connections: ['3', '8'] },
    { id: '2', name: 'Personnel', emoji: '🏠', importance: 4, files: 8, connections: ['5', '6'] },
    { id: '3', name: 'Idées', emoji: '💡', importance: 5, files: 15, connections: ['1', '4'] },
    { id: '4', name: 'Projets', emoji: '🚀', importance: 5, files: 20, connections: ['3'] },
    { id: '5', name: 'Famille', emoji: '👨‍👩‍👧‍👦', importance: 3, files: 6, connections: ['2'] },
    { id: '6', name: 'Santé', emoji: '🏃‍♀️', importance: 4, files: 9, connections: ['2'] },
    { id: '7', name: 'Créatif', emoji: '🎨', importance: 3, files: 11, connections: [] },
    { id: '8', name: 'Réunions', emoji: '👥', importance: 4, files: 7, connections: ['1'] }
  ];

  // Initialisation
  useEffect(() => {
    setCategories(sampleCategories);
    initializeBallPositions();
  }, []);

  const initializeBallPositions = () => {
    const positions = {};
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const radius = Math.min(window.innerWidth, window.innerHeight) * 0.25;

    sampleCategories.forEach((category, index) => {
      const angle = (index / sampleCategories.length) * 2 * Math.PI;
      positions[category.id] = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    });

    setBallPositions(positions);
  };

  // Fonction pour obtenir la distance entre deux points
  const getTouchDistance = (touches) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  // Gestionnaires tactiles pour zoom/pan avec deux doigts
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    const touches = e.touches;

    if (touches.length === 1) {
      // Un doigt - préparation pour drag de bulle ou pan
      const touch = touches[0];
      setPanStart({ x: touch.clientX, y: touch.clientY });
    } else if (touches.length === 2) {
      // Deux doigts - zoom
      const distance = getTouchDistance(touches);
      setLastTouchDistance(distance);
      setIsPanning(true);
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    const touches = e.touches;

    if (touches.length === 2 && isPanning) {
      // Zoom avec deux doigts
      const distance = getTouchDistance(touches);
      if (lastTouchDistance > 0) {
        const scaleChange = distance / lastTouchDistance;
        const newScale = Math.max(0.5, Math.min(3, scale * scaleChange));
        setScale(newScale);
      }
      setLastTouchDistance(distance);

      // Pan avec deux doigts
      const centerX = (touches[0].clientX + touches[1].clientX) / 2;
      const centerY = (touches[0].clientY + touches[1].clientY) / 2;

      setTranslateX(prev => prev + (centerX - panStart.x) * 0.5);
      setTranslateY(prev => prev + (centerY - panStart.y) * 0.5);
      setPanStart({ x: centerX, y: centerY });
    }
  }, [isPanning, lastTouchDistance, scale, panStart]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    setIsPanning(false);
    setLastTouchDistance(0);
    setDraggedBall(null);

    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  // Gestionnaires pour drag des bulles avec un doigt
  const handleBallTouchStart = useCallback((e, categoryId) => {
    e.stopPropagation();
    const touch = e.touches[0];

    // Long press pour sélectionner
    const timer = setTimeout(() => {
      setSelectedCategory(categories.find(cat => cat.id === categoryId));
      showNotification(`${categories.find(cat => cat.id === categoryId)?.name} sélectionnée`, 'info');
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
          x: prev[categoryId].x + deltaX,
          y: prev[categoryId].y + deltaY
        }
      }));

      setPanStart({ x: touch.clientX, y: touch.clientY });

      // Annuler le long press si on bouge
      if (longPressTimer && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
    }
  }, [draggedBall, panStart, longPressTimer]);

  // Notifications
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Actions
  const addTextNote = () => {
    if (!selectedCategory) {
      showNotification('Sélectionnez une catégorie d\'abord', 'warning');
      return;
    }
    setShowTextModal(true);
  };

  const saveTextNote = () => {
    if (textInput.trim()) {
      showNotification(`Note ajoutée à ${selectedCategory.name}`, 'success');
      setTextInput('');
      setShowTextModal(false);
    }
  };

  const startRecording = () => {
    if (!selectedCategory) {
      showNotification('Sélectionnez une catégorie d\'abord', 'warning');
      return;
    }
    setIsRecording(true);
    showNotification('Enregistrement démarré...', 'info');

    // Simuler arrêt automatique après 10 secondes
    setTimeout(() => {
      setIsRecording(false);
      showNotification(`Note vocale ajoutée à ${selectedCategory.name}`, 'success');
    }, 10000);
  };

  const resetView = () => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
    initializeBallPositions();
    showNotification('Vue réinitialisée', 'info');
  };

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
          </div>
        </div>
      </div>

      {/* Zone Mind Map */}
      <div
        ref={containerRef}
        className="absolute inset-0 pt-16 pb-20"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
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
          onTouchStart={(e) => {
            e.stopPropagation();
            startRecording();
          }}
        >
          {isRecording ? (
            <MicOff className="text-white" size={32} />
          ) : (
            <Mic className="text-white" size={32} />
          )}
        </div>
      </div>

      {/* Boutons d'action mobiles */}
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
              isRecording
                ? 'bg-red-600/80 animate-pulse'
                : 'bg-red-500/80'
            }`}
          >
            <Mic size={24} />
            <span>{isRecording ? 'Stop' : 'Vocal'}</span>
          </button>

          <button
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-green-600/80 text-white text-sm"
          >
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
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="w-full h-32 p-3 bg-black/30 text-white rounded-lg border border-white/20 resize-none placeholder-gray-400"
              placeholder="Tapez votre note ici..."
              autoFocus
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

      {/* Instructions tactiles */}
      <div className="fixed top-20 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-xs max-w-48">
        <div className="space-y-1">
          <div>👆 1 doigt: déplacer bulle</div>
          <div>✌️ 2 doigts: zoom/pan</div>
          <div>⏱️ Appui long: sélectionner</div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default MobileMindMapNotes;