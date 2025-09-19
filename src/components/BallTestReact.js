import React, { useState, useEffect, useRef, useCallback } from 'react';

const BallTestReact = () => {
  const [balls, setBalls] = useState([
    { id: 'work', x: 150, y: 150, emoji: '💼', name: 'Travail', color: '#4a90ff', notes: 5 },
    { id: 'personal', x: 350, y: 200, emoji: '🏠', name: 'Personnel', color: '#06d6a0', notes: 3 },
    { id: 'ideas', x: 550, y: 150, emoji: '💡', name: 'Idées', color: '#f59e0b', notes: 7 },
    { id: 'projects', x: 200, y: 350, emoji: '🚀', name: 'Projets', color: '#ec4899', notes: 2 },
    { id: 'family', x: 500, y: 400, emoji: '👨‍👩‍👧‍👦', name: 'Famille', color: '#8b5cf6', notes: 4 }
  ]);

  const [draggedBall, setDraggedBall] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedBall, setSelectedBall] = useState(null);
  const containerRef = useRef();

  // Charger positions sauvées
  useEffect(() => {
    const saved = localStorage.getItem('react-ball-positions');
    if (saved) {
      setBalls(JSON.parse(saved));
    }
  }, []);

  // Sauvegarder positions
  const savePositions = useCallback(() => {
    localStorage.setItem('react-ball-positions', JSON.stringify(balls));
  }, [balls]);

  useEffect(() => {
    savePositions();
  }, [balls, savePositions]);

  // Début du drag
  const handleMouseDown = useCallback((e, ballId) => {
    e.preventDefault();
    e.stopPropagation();

    const ball = balls.find(b => b.id === ballId);
    if (!ball) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setDraggedBall(ballId);
    setSelectedBall(ballId);
    setDragOffset({
      x: mouseX - ball.x,
      y: mouseY - ball.y
    });

    console.log(`Started dragging: ${ballId}`);
  }, [balls]);

  // Pendant le drag
  const handleMouseMove = useCallback((e) => {
    if (!draggedBall) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = mouseX - dragOffset.x;
    const newY = mouseY - dragOffset.y;

    // Contraintes pour rester dans le container
    const container = containerRef.current;
    const ballSize = 80; // Taille approximative de la boule
    const constrainedX = Math.max(ballSize/2, Math.min(newX, container.offsetWidth - ballSize/2));
    const constrainedY = Math.max(ballSize/2, Math.min(newY, container.offsetHeight - ballSize/2));

    setBalls(prev => prev.map(ball =>
      ball.id === draggedBall
        ? { ...ball, x: constrainedX, y: constrainedY }
        : ball
    ));
  }, [draggedBall, dragOffset]);

  // Fin du drag
  const handleMouseUp = useCallback(() => {
    if (draggedBall) {
      console.log(`Stopped dragging: ${draggedBall}`);
      setDraggedBall(null);
    }
  }, [draggedBall]);

  // Event listeners globaux
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

  // Reset positions
  const resetPositions = () => {
    const container = containerRef.current;
    const centerX = container.offsetWidth / 2;
    const centerY = container.offsetHeight / 2;
    const radius = Math.min(container.offsetWidth, container.offsetHeight) * 0.3;

    setBalls(prev => prev.map((ball, index) => {
      const angle = (index * 2 * Math.PI) / prev.length;
      return {
        ...ball,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    }));

    setSelectedBall(null);
    localStorage.removeItem('react-ball-positions');
  };

  // Ajouter boule aléatoire
  const addRandomBall = () => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
    const emojis = ['⭐', '🎯', '🔥', '💫', '🌟', '✨'];
    const names = ['Nouveau', 'Test', 'Demo', 'Extra', 'Bonus'];

    const container = containerRef.current;
    const newBall = {
      id: 'ball_' + Date.now(),
      x: Math.random() * (container.offsetWidth - 100) + 50,
      y: Math.random() * (container.offsetHeight - 100) + 50,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      name: names[Math.floor(Math.random() * names.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      notes: Math.floor(Math.random() * 10) + 1
    };

    setBalls(prev => [...prev, newBall]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          🚀 Test React - Drag des Boules (HTML/CSS)
        </h1>

        {/* Contrôles */}
        <div className="mb-4 flex gap-4 justify-center">
          <button
            onClick={resetPositions}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
          >
            Reset Positions
          </button>
          <button
            onClick={addRandomBall}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
          >
            Ajouter Boule
          </button>
        </div>

        {/* Instructions */}
        <div className="mb-6 text-center text-gray-300">
          <p><strong>Instructions:</strong> Cliquez et glissez chaque boule individuellement</p>
          <p>Chaque boule doit bouger SEULE - Aucune interférence</p>
          {selectedBall && (
            <p className="mt-2 text-blue-400">
              Sélectionné: <strong>{balls.find(b => b.id === selectedBall)?.name}</strong>
            </p>
          )}
        </div>

        {/* Container des boules */}
        <div
          ref={containerRef}
          className="relative w-full h-[600px] bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
          style={{ cursor: draggedBall ? 'grabbing' : 'default' }}
        >
          {balls.map((ball) => {
            const isSelected = selectedBall === ball.id;
            const isDragging = draggedBall === ball.id;

            return (
              <div
                key={ball.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100 ${
                  isDragging ? 'scale-110 z-50' : isSelected ? 'scale-105 z-40' : 'z-10'
                }`}
                style={{
                  left: ball.x,
                  top: ball.y,
                  cursor: 'grab'
                }}
                onMouseDown={(e) => handleMouseDown(e, ball.id)}
                onClick={() => setSelectedBall(ball.id)}
              >
                {/* Boule principale */}
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-2xl ${
                    isSelected ? 'ring-4 ring-white/50' : ''
                  }`}
                  style={{
                    backgroundColor: ball.color,
                    boxShadow: isSelected
                      ? `0 0 30px ${ball.color}80, 0 10px 20px rgba(0,0,0,0.5)`
                      : `0 0 15px ${ball.color}40, 0 5px 15px rgba(0,0,0,0.3)`
                  }}
                >
                  {ball.emoji}
                </div>

                {/* Nom */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-sm font-bold text-white text-center whitespace-nowrap">
                  {ball.name}
                </div>

                {/* Compteur de notes */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {ball.notes}
                </div>

                {/* Indicateur de drag */}
                {isDragging && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-blue-400">
                    Position: ({Math.round(ball.x)}, {Math.round(ball.y)})
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Infos */}
        <div className="mt-4 text-center text-sm text-gray-400">
          <p>Nombre de boules: {balls.length}</p>
          <p>Méthode: React + HTML/CSS + position absolute</p>
          <p>Positions sauvegardées automatiquement dans localStorage</p>
        </div>
      </div>
    </div>
  );
};

export default BallTestReact;