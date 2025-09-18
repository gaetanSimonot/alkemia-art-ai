import React, { useState, useRef, useCallback } from 'react';
import { Upload, RotateCw, Move, Type, Download, Palette, Trash2, Copy, Plus } from 'lucide-react';

const BannerEditor = () => {
  const canvasRef = useRef(null);
  const [selectedTemplate, setSelectedTemplate] = useState('announcement');
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [draggedElement, setDraggedElement] = useState(null);
  const [isTextMode, setIsTextMode] = useState(false);

  // Template dimensions
  const templates = {
    announcement: { width: 800, height: 600, name: 'Annonce' },
    patreon: { width: 1200, height: 400, name: 'Patreon Banner' },
    custom: { width: 1000, height: 500, name: 'Format Custom' }
  };

  const currentTemplate = templates[selectedTemplate];

  // Ajouter un élément image
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const newElement = {
          id: Date.now(),
          type: 'image',
          src: event.target.result,
          x: 100,
          y: 100,
          width: Math.min(200, img.width),
          height: Math.min(200, img.height),
          rotation: 0,
          opacity: 1,
          borderColor: '#ff6b35',
          borderWidth: 3,
          borderRadius: 15
        };
        setElements(prev => [...prev, newElement]);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }, []);

  // Ajouter du texte
  const addText = useCallback(() => {
    const newElement = {
      id: Date.now(),
      type: 'text',
      content: 'NOUVEAU TEXTE',
      x: 200,
      y: 150,
      fontSize: 32,
      fontFamily: 'Arial Black',
      color: '#ff6b35',
      fontWeight: 'bold',
      rotation: 0,
      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
      stroke: '#ffffff',
      strokeWidth: 2
    };
    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
  }, []);

  // Supprimer un élément
  const deleteElement = useCallback((id) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setSelectedElement(null);
  }, []);

  // Dupliquer un élément
  const duplicateElement = useCallback((id) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      const newElement = {
        ...element,
        id: Date.now(),
        x: element.x + 20,
        y: element.y + 20
      };
      setElements(prev => [...prev, newElement]);
    }
  }, [elements]);

  // Mettre à jour un élément
  const updateElement = useCallback((id, updates) => {
    setElements(prev => prev.map(el =>
      el.id === id ? { ...el, ...updates } : el
    ));
  }, []);

  // Export canvas
  const exportBanner = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Fond selon le template
    ctx.fillStyle = selectedTemplate === 'patreon'
      ? 'linear-gradient(90deg, #8b5cf6 0%, #1f2937 100%)'
      : '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Rendu des éléments
    elements.forEach(element => {
      ctx.save();
      ctx.translate(element.x + element.width/2, element.y + element.height/2);
      ctx.rotate((element.rotation || 0) * Math.PI / 180);
      ctx.globalAlpha = element.opacity || 1;

      if (element.type === 'image') {
        const img = new Image();
        img.src = element.src;
        ctx.drawImage(img, -element.width/2, -element.height/2, element.width, element.height);
      } else if (element.type === 'text') {
        ctx.font = `${element.fontWeight || 'bold'} ${element.fontSize}px ${element.fontFamily}`;
        ctx.fillStyle = element.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (element.stroke) {
          ctx.strokeStyle = element.stroke;
          ctx.lineWidth = element.strokeWidth || 1;
          ctx.strokeText(element.content, 0, 0);
        }
        ctx.fillText(element.content, 0, 0);
      }
      ctx.restore();
    });

    // Download
    const link = document.createElement('a');
    link.download = `banner-${selectedTemplate}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }, [elements, selectedTemplate]);

  return (
    <div className="bg-black/10 rounded-3xl p-8 mt-16">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">
        🎨 Éditeur de Bannières
      </h2>

      {/* Template Selector */}
      <div className="flex justify-center gap-4 mb-8">
        {Object.entries(templates).map(([key, template]) => (
          <button
            key={key}
            onClick={() => setSelectedTemplate(key)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              selectedTemplate === key
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {template.name}
            <div className="text-xs opacity-75">
              {template.width}x{template.height}
            </div>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700 transition-all">
          <Upload size={20} />
          <span>Ajouter Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>

        <button
          onClick={addText}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
        >
          <Type size={20} />
          <span>Ajouter Texte</span>
        </button>

        {selectedElement && (
          <>
            <button
              onClick={() => duplicateElement(selectedElement)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-all"
            >
              <Copy size={20} />
              <span>Dupliquer</span>
            </button>

            <button
              onClick={() => deleteElement(selectedElement)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
            >
              <Trash2 size={20} />
              <span>Supprimer</span>
            </button>
          </>
        )}

        <button
          onClick={exportBanner}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all"
        >
          <Download size={20} />
          <span>Télécharger</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Canvas */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl p-4 shadow-2xl">
            <div
              className="relative border-2 border-dashed border-gray-300 rounded-xl overflow-hidden"
              style={{
                width: currentTemplate.width,
                height: currentTemplate.height,
                maxWidth: '100%',
                aspectRatio: `${currentTemplate.width}/${currentTemplate.height}`,
                background: selectedTemplate === 'patreon'
                  ? 'linear-gradient(90deg, #8b5cf6 0%, #1f2937 100%)'
                  : '#f8fafc'
              }}
            >
              {/* Grid */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              />

              {/* Elements */}
              {elements.map(element => (
                <div
                  key={element.id}
                  className={`absolute cursor-move border-2 ${
                    selectedElement === element.id
                      ? 'border-blue-500 border-solid'
                      : 'border-transparent'
                  }`}
                  style={{
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height || 'auto',
                    transform: `rotate(${element.rotation || 0}deg)`,
                    opacity: element.opacity || 1
                  }}
                  onClick={() => setSelectedElement(element.id)}
                >
                  {element.type === 'image' ? (
                    <img
                      src={element.src}
                      alt="Element"
                      className="w-full h-full object-cover rounded-lg shadow-lg"
                      style={{
                        border: `${element.borderWidth}px solid ${element.borderColor}`,
                        borderRadius: element.borderRadius + 'px'
                      }}
                      draggable={false}
                    />
                  ) : (
                    <div
                      className="text-center flex items-center justify-center h-full"
                      style={{
                        fontSize: element.fontSize + 'px',
                        fontFamily: element.fontFamily,
                        color: element.color,
                        fontWeight: element.fontWeight,
                        textShadow: element.textShadow,
                        WebkitTextStroke: element.stroke ? `${element.strokeWidth}px ${element.stroke}` : 'none'
                      }}
                    >
                      {element.content}
                    </div>
                  )}

                  {/* Resize handles */}
                  {selectedElement === element.id && (
                    <>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize" />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize" />
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize" />
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize" />
                    </>
                  )}
                </div>
              ))}

              {/* Template guidelines */}
              {selectedTemplate === 'patreon' && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-4 top-4 text-white/30 text-xs">
                    Zone Figurines
                  </div>
                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/30 text-xs">
                    Texte Principal
                  </div>
                  <div className="absolute right-4 top-4 text-white/30 text-xs">
                    Offre/CTA
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="lg:col-span-1">
          <div className="bg-black/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Propriétés</h3>

            {selectedElement ? (
              <div className="space-y-4">
                {elements.find(el => el.id === selectedElement)?.type === 'image' ? (
                  // Image properties
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Position X</label>
                      <input
                        type="number"
                        value={elements.find(el => el.id === selectedElement)?.x || 0}
                        onChange={(e) => updateElement(selectedElement, { x: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-black/30 text-white rounded-lg border border-white/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Position Y</label>
                      <input
                        type="number"
                        value={elements.find(el => el.id === selectedElement)?.y || 0}
                        onChange={(e) => updateElement(selectedElement, { y: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-black/30 text-white rounded-lg border border-white/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Largeur</label>
                      <input
                        type="number"
                        value={elements.find(el => el.id === selectedElement)?.width || 0}
                        onChange={(e) => updateElement(selectedElement, { width: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-black/30 text-white rounded-lg border border-white/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Hauteur</label>
                      <input
                        type="number"
                        value={elements.find(el => el.id === selectedElement)?.height || 0}
                        onChange={(e) => updateElement(selectedElement, { height: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-black/30 text-white rounded-lg border border-white/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Rotation</label>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={elements.find(el => el.id === selectedElement)?.rotation || 0}
                        onChange={(e) => updateElement(selectedElement, { rotation: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-center text-sm text-gray-400">
                        {elements.find(el => el.id === selectedElement)?.rotation || 0}°
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Bordure</label>
                      <input
                        type="color"
                        value={elements.find(el => el.id === selectedElement)?.borderColor || '#ff6b35'}
                        onChange={(e) => updateElement(selectedElement, { borderColor: e.target.value })}
                        className="w-full h-10 rounded-lg"
                      />
                    </div>
                  </div>
                ) : (
                  // Text properties
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Texte</label>
                      <input
                        type="text"
                        value={elements.find(el => el.id === selectedElement)?.content || ''}
                        onChange={(e) => updateElement(selectedElement, { content: e.target.value })}
                        className="w-full px-3 py-2 bg-black/30 text-white rounded-lg border border-white/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Taille</label>
                      <input
                        type="range"
                        min="12"
                        max="120"
                        value={elements.find(el => el.id === selectedElement)?.fontSize || 32}
                        onChange={(e) => updateElement(selectedElement, { fontSize: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-center text-sm text-gray-400">
                        {elements.find(el => el.id === selectedElement)?.fontSize || 32}px
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Police</label>
                      <select
                        value={elements.find(el => el.id === selectedElement)?.fontFamily || 'Arial Black'}
                        onChange={(e) => updateElement(selectedElement, { fontFamily: e.target.value })}
                        className="w-full px-3 py-2 bg-black/30 text-white rounded-lg border border-white/20"
                      >
                        <option value="Arial Black">Arial Black</option>
                        <option value="Impact">Impact</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times">Times</option>
                        <option value="Courier">Courier</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Couleur</label>
                      <input
                        type="color"
                        value={elements.find(el => el.id === selectedElement)?.color || '#ff6b35'}
                        onChange={(e) => updateElement(selectedElement, { color: e.target.value })}
                        className="w-full h-10 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Contour</label>
                      <input
                        type="color"
                        value={elements.find(el => el.id === selectedElement)?.stroke || '#ffffff'}
                        onChange={(e) => updateElement(selectedElement, { stroke: e.target.value })}
                        className="w-full h-10 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Rotation</label>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={elements.find(el => el.id === selectedElement)?.rotation || 0}
                        onChange={(e) => updateElement(selectedElement, { rotation: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-center text-sm text-gray-400">
                        {elements.find(el => el.id === selectedElement)?.rotation || 0}°
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">
                Sélectionnez un élément pour modifier ses propriétés
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden canvas for export */}
      <canvas
        ref={canvasRef}
        width={currentTemplate.width}
        height={currentTemplate.height}
        className="hidden"
      />
    </div>
  );
};

export default BannerEditor;