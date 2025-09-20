import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Home, Move, Maximize2, Eye, X, LogOut } from 'lucide-react';

const SimpleMindMap = ({ onLogout }) => {
  // Deux bulles simples avec position et taille
  const [balls, setBalls] = useState([
    {
      id: '1',
      name: 'Travail',
      emoji: '💼',
      x: window.innerWidth / 2 - 100,
      y: window.innerHeight / 2,
      size: 80
    },
    {
      id: '2',
      name: 'Personnel',
      emoji: '🏠',
      x: window.innerWidth / 2 + 100,
      y: window.innerHeight / 2,
      size: 80
    }
  ]);

  const [selectedBall, setSelectedBall] = useState(null);
  const [mode, setMode] = useState(null); // 'move', 'resize', null

  // Canvas transform pour zoom/pan avec deux doigts
  const [canvasTransform, setCanvasTransform] = useState({
    scale: 1,
    x: 0,
    y: 0
  });

  // Refs pour touch handling
  const canvasRef = useRef();
  const lastTouchDistance = useRef(0);
  const lastTouchCenter = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const theme = {
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#06d6a0'
  };

  // Sélectionner une bulle
  const selectBall = (ballId) => {
    setSelectedBall(ballId);
    setMode(null);
  };

  // Désélectionner
  const deselectBall = () => {
    setSelectedBall(null);
    setMode(null);
  };

  // Activer un mode
  const activateMode = (newMode) => {
    setMode(newMode);
  };

  // Ouvrir une bulle
  const openBall = (ballId) => {
    const ball = balls.find(b => b.id === ballId);
    alert(`Ouverture de ${ball.name} ${ball.emoji}`);
    deselectBall();
  };

  // Handle touch events
  const handleTouchStart = (e) => {
    const touches = e.touches;

    if (touches.length === 1) {
      // Un doigt - sélection ou drag
      const touch = touches[0];
      const rect = canvasRef.current.getBoundingClientRect();

      // Convertir en coordonnées canvas
      const canvasX = (touch.clientX - rect.left - canvasTransform.x) / canvasTransform.scale;
      const canvasY = (touch.clientY - rect.top - canvasTransform.y) / canvasTransform.scale;

      // Check si on touche une bulle
      let touchedBall = null;
      for (const ball of balls) {
        const distance = Math.sqrt(
          Math.pow(canvasX - ball.x, 2) + Math.pow(canvasY - ball.y, 2)
        );
        if (distance < ball.size / 2) {
          touchedBall = ball.id;
          break;
        }
      }

      if (touchedBall) {
        selectBall(touchedBall);
      } else {
        // Touche le vide - désélectionner si pas en mode actif
        if (!mode) {
          deselectBall();
        }
      }

      isDragging.current = false;
    } else if (touches.length === 2) {
      // Deux doigts - zoom/pan
      const touch1 = touches[0];
      const touch2 = touches[1];

      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;

      lastTouchDistance.current = distance;
      lastTouchCenter.current = { x: centerX, y: centerY };
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touches = e.touches;

    if (touches.length === 1 && selectedBall && mode) {
      // Un doigt avec mode actif - drag
      const touch = touches[0];
      const rect = canvasRef.current.getBoundingClientRect();

      const canvasX = (touch.clientX - rect.left - canvasTransform.x) / canvasTransform.scale;
      const canvasY = (touch.clientY - rect.top - canvasTransform.y) / canvasTransform.scale;

      isDragging.current = true;

      setBalls(prev => prev.map(ball => {
        if (ball.id === selectedBall) {
          if (mode === 'move') {
            // Déplacer la bulle
            return { ...ball, x: canvasX, y: canvasY };
          } else if (mode === 'resize') {
            // Redimensionner basé sur la distance du centre
            const originalBall = balls.find(b => b.id === selectedBall);
            const distance = Math.sqrt(
              Math.pow(canvasX - originalBall.x, 2) +
              Math.pow(canvasY - originalBall.y, 2)
            );
            const newSize = Math.max(40, Math.min(150, distance * 2));
            return { ...ball, size: newSize };
          }
        }
        return ball;
      }));
    } else if (touches.length === 2) {
      // Deux doigts - zoom/pan
      const touch1 = touches[0];
      const touch2 = touches[1];

      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;

      if (lastTouchDistance.current > 0) {
        // Zoom
        const scaleChange = distance / lastTouchDistance.current;
        const newScale = Math.max(0.5, Math.min(3, canvasTransform.scale * scaleChange));

        // Pan
        const deltaX = centerX - lastTouchCenter.current.x;
        const deltaY = centerY - lastTouchCenter.current.y;

        setCanvasTransform(prev => ({
          scale: newScale,
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
      }

      lastTouchDistance.current = distance;
      lastTouchCenter.current = { x: centerX, y: centerY };
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    lastTouchDistance.current = 0;
  };

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: theme.bg }}>
      {/* Header simple */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors">
            <Home size={20} />
            <span className="font-bold">Alkemia Art</span>
          </Link>

          <button
            onClick={onLogout}
            className="p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0 pt-16"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `scale(${canvasTransform.scale}) translate(${canvasTransform.x}px, ${canvasTransform.y}px)`,
          transformOrigin: 'center center'
        }}
      >
        {/* Bulles */}
        {balls.map((ball) => {
          const isSelected = selectedBall === ball.id;

          return (
            <div key={ball.id} className="absolute">
              {/* Bulle */}
              <div
                className={`absolute rounded-full flex flex-col items-center justify-center text-white font-bold cursor-pointer transition-all duration-200 ${
                  isSelected ? 'ring-4 ring-blue-400 shadow-2xl' : 'hover:scale-105'
                }`}
                style={{
                  left: ball.x - ball.size/2,
                  top: ball.y - ball.size/2,
                  width: ball.size,
                  height: ball.size,
                  background: isSelected
                    ? `linear-gradient(135deg, ${theme.accent}, ${theme.primary})`
                    : `linear-gradient(135deg, rgba(255,255,255,0.1), ${theme.primary}40)`,
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${isSelected ? theme.accent : 'rgba(255,255,255,0.2)'}`,
                  zIndex: isSelected ? 50 : 10
                }}
              >
                <span className="text-2xl mb-1">{ball.emoji}</span>
                <span className="text-xs text-center px-1 leading-tight">
                  {ball.name}
                </span>
              </div>

              {/* Boutons d'action - suivent la bulle */}
              {isSelected && (
                <div
                  className="absolute flex gap-2"
                  style={{
                    left: ball.x - 75,
                    top: ball.y - ball.size/2 - 70,
                    zIndex: 60
                  }}
                >
                  {/* Move */}
                  <button
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      activateMode('move');
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      activateMode('move');
                    }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-lg border border-white/20 ${
                      mode === 'move' ? 'bg-blue-600 scale-110 shadow-lg' : 'bg-gray-700/80 hover:bg-blue-500/50'
                    }`}
                  >
                    <Move size={18} />
                  </button>

                  {/* Resize */}
                  <button
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      activateMode('resize');
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      activateMode('resize');
                    }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-lg border border-white/20 ${
                      mode === 'resize' ? 'bg-purple-600 scale-110 shadow-lg' : 'bg-gray-700/80 hover:bg-purple-500/50'
                    }`}
                  >
                    <Maximize2 size={18} />
                  </button>

                  {/* Open */}
                  <button
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      openBall(ball.id);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openBall(ball.id);
                    }}
                    className="w-12 h-12 rounded-full bg-green-600/80 flex items-center justify-center text-white hover:bg-green-700 transition-all backdrop-blur-lg border border-white/20"
                  >
                    <Eye size={18} />
                  </button>

                  {/* Close */}
                  <button
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      deselectBall();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      deselectBall();
                    }}
                    className="w-12 h-12 rounded-full bg-red-600/80 flex items-center justify-center text-white hover:bg-red-700 transition-all backdrop-blur-lg border border-white/20"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Instructions simples */}
      <div className="fixed bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white text-xs max-w-72">
        <div className="space-y-1">
          <div>👆 <strong>Tap bulle</strong> → sélectionner</div>
          <div>🔘 <strong>Tap bouton mode</strong> → activer</div>
          <div>✋ <strong>Puis glissez</strong> → action</div>
          <div>✌️ <strong>2 doigts</strong> → zoom/pan</div>
          <div className={`font-bold mt-2 ${mode ? 'text-yellow-300' : selectedBall ? 'text-blue-300' : 'text-gray-400'}`}>
            {selectedBall ?
              `🎯 ${balls.find(b => b.id === selectedBall)?.emoji} | ${mode === 'move' ? '🔄 MOVE' : mode === 'resize' ? '📏 SIZE' : '⚡ READY'}` :
              '🚀 TAP UNE BULLE'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleMindMap;