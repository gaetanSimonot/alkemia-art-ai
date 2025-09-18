import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer } from 'react-konva';
import { Upload, Type, Download, Eye, EyeOff, ZoomIn, ZoomOut } from 'lucide-react';
import useImage from 'use-image';

const KonvaImageComponent = ({ src, x, y, isSelected, onSelect, onTransform }) => {
  const [image] = useImage(src);
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaImage
        image={image}
        x={x}
        y={y}
        ref={shapeRef}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onTransform={onTransform}
        onDragEnd={onTransform}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

const KonvaTextComponent = ({
  text, x, y, fontSize, fill, fontFamily, fontWeight, fontStyle,
  align, letterSpacing, isSelected, onSelect, onTransform, onTextChange
}) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Text
        text={text}
        x={x}
        y={y}
        fontSize={fontSize}
        fontFamily={fontFamily || "Bebas Neue, Arial Black, sans-serif"}
        fontStyle={fontStyle || 'normal'}
        fontVariant={fontWeight || 'normal'}
        fill={fill}
        align={align || 'left'}
        letterSpacing={letterSpacing || 0}
        ref={shapeRef}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={() => {
          const newText = prompt('Nouveau texte:', text);
          if (newText && onTextChange) {
            onTextChange(newText);
          }
        }}
        onTransform={onTransform}
        onDragEnd={onTransform}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

const KonvaBannerEditor = () => {
  const stageRef = useRef();
  const fileInputRef = useRef();
  const backgroundInputRef = useRef();

  const [selectedFormat, setSelectedFormat] = useState('instagram-post');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [showLogo, setShowLogo] = useState(true);
  const [zoom, setZoom] = useState(1);

  const [objects, setObjects] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // Propriétés de texte pour l'objet sélectionné
  const selectedObject = objects.find(obj => obj.id === selectedId);
  const isTextSelected = selectedObject && selectedObject.type === 'text';

  // Formats
  const formats = {
    'instagram-post': { width: 1080, height: 1080, name: '📱 Instagram Post' },
    'instagram-story': { width: 1080, height: 1920, name: '📱 Instagram Story' },
    'tiktok': { width: 1080, height: 1920, name: '🎵 TikTok' },
    'facebook-post': { width: 1200, height: 630, name: '📘 Facebook Post' },
    'patreon-banner': { width: 1200, height: 400, name: '🎨 Patreon' },
    'youtube-thumbnail': { width: 1280, height: 720, name: '📺 YouTube' }
  };

  const currentFormat = formats[selectedFormat];
  const displayWidth = 400;
  const displayHeight = (displayWidth * currentFormat.height) / currentFormat.width;
  const scale = displayWidth / currentFormat.width;

  // Initialiser avec logo si activé
  useEffect(() => {
    if (showLogo) {
      const logoExists = objects.some(obj => obj.id === 'logo');
      if (!logoExists) {
        setObjects(prev => [
          ...prev,
          {
            id: 'logo',
            type: 'image',
            src: '/logo.png',
            x: 20,
            y: 20,
            isLogo: true
          }
        ]);
      }
    } else {
      setObjects(prev => prev.filter(obj => obj.id !== 'logo'));
    }
  }, [showLogo]);

  // Nettoyer les objets quand le format change
  useEffect(() => {
    setObjects(prev => prev.filter(obj => obj.isLogo));
    setSelectedId(null);
  }, [selectedFormat]);

  // Upload d'image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const newImage = {
        id: Date.now(),
        type: 'image',
        src: e.target.result,
        x: displayWidth / 4,
        y: displayHeight / 4,
        isLogo: false
      };
      setObjects(prev => [...prev, newImage]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Background image
  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setBackgroundImage(e.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Ajouter du texte
  const addText = () => {
    const newText = {
      id: Date.now(),
      type: 'text',
      text: 'VOTRE TEXTE',
      x: displayWidth / 2,
      y: displayHeight / 2,
      fontSize: 40,
      fill: '#ff6b35',
      fontFamily: 'Bebas Neue, Arial Black, sans-serif',
      fontWeight: 'normal',
      fontStyle: 'normal',
      align: 'center',
      letterSpacing: 0
    };
    setObjects(prev => [...prev, newText]);
    setSelectedId(newText.id);
  };

  // Supprimer l'élément sélectionné
  const deleteSelected = () => {
    if (selectedId) {
      const selectedObj = objects.find(obj => obj.id === selectedId);
      if (selectedObj && !selectedObj.isLogo) {
        setObjects(prev => prev.filter(obj => obj.id !== selectedId));
        setSelectedId(null);
      }
    }
  };

  // Mettre à jour un objet
  const updateObject = (id, updates) => {
    setObjects(prev => prev.map(obj =>
      obj.id === id ? { ...obj, ...updates } : obj
    ));
  };

  // Modifier le texte
  const updateText = (id, newText) => {
    updateObject(id, { text: newText });
  };

  // Export
  const exportImage = () => {
    if (!stageRef.current) return;

    // Créer une copie à l'échelle réelle
    const stage = stageRef.current;
    const originalScale = stage.scaleX();

    stage.scale({ x: 1/scale, y: 1/scale });
    stage.size({ width: currentFormat.width, height: currentFormat.height });

    const dataURL = stage.toDataURL({ quality: 1 });

    // Restaurer l'échelle d'affichage
    stage.scale({ x: originalScale, y: originalScale });
    stage.size({ width: displayWidth, height: displayHeight });

    // Télécharger
    const link = document.createElement('a');
    link.download = `banner-${selectedFormat}-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  };

  // Zoom
  const zoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.5));

  // Drag and drop sur le stage
  const handleDrop = (e) => {
    e.preventDefault();
    const stage = e.target.getStage();
    stage.setPointersPositions(e);
    const pos = stage.getPointerPosition();

    // Vérifier si c'est un fichier
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = {
            id: Date.now(),
            type: 'image',
            src: e.target.result,
            x: pos.x / zoom,
            y: pos.y / zoom,
            isLogo: false
          };
          setObjects(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <div className="bg-black/10 rounded-3xl p-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent mb-3">
          🎨 Éditeur Konva Pro
        </h2>
        <p className="text-gray-300 text-sm">
          Glissez directement sur le canvas • Double-cliquez le texte pour l'éditer
        </p>
      </div>

      {/* Formats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {Object.entries(formats).map(([key, format]) => (
          <button
            key={key}
            onClick={() => setSelectedFormat(key)}
            className={`p-3 rounded-xl text-xs font-semibold transition-all ${
              selectedFormat === key
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {format.name}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
        >
          <Upload size={18} />
          <span>Image</span>
        </button>

        <button
          onClick={() => backgroundInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
        >
          🖼️ <span>Fond</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-2 bg-purple-600 rounded-xl">
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="w-6 h-6 rounded border-0 cursor-pointer"
          />
          <span className="text-white text-sm">Couleur</span>
        </div>

        <button
          onClick={addText}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
        >
          <Type size={18} />
          <span>Texte</span>
        </button>

        <button
          onClick={() => setShowLogo(!showLogo)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            showLogo ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-600 hover:bg-gray-700'
          } text-white`}
        >
          {showLogo ? <Eye size={18} /> : <EyeOff size={18} />}
          <span>Logo</span>
        </button>

        <button
          onClick={deleteSelected}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
        >
          🗑️ <span>Suppr</span>
        </button>

        <button
          onClick={exportImage}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all"
        >
          <Download size={18} />
          <span>Export</span>
        </button>
      </div>

      {/* Contrôles de texte */}
      {isTextSelected && (
        <div className="bg-black/20 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Type size={20} />
            Propriétés du texte sélectionné
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Texte */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Texte</label>
              <input
                type="text"
                value={selectedObject.text || ''}
                onChange={(e) => updateObject(selectedId, { text: e.target.value })}
                className="w-full px-3 py-2 bg-black/30 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Taille */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Taille: {selectedObject.fontSize || 40}px
              </label>
              <input
                type="range"
                min="12"
                max="120"
                value={selectedObject.fontSize || 40}
                onChange={(e) => updateObject(selectedId, { fontSize: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Couleur */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Couleur</label>
              <input
                type="color"
                value={selectedObject.fill || '#ff6b35'}
                onChange={(e) => updateObject(selectedId, { fill: e.target.value })}
                className="w-full h-10 rounded-lg border-0 cursor-pointer"
              />
            </div>

            {/* Police */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Police</label>
              <select
                value={selectedObject.fontFamily || 'Bebas Neue, Arial Black, sans-serif'}
                onChange={(e) => updateObject(selectedId, { fontFamily: e.target.value })}
                className="w-full px-3 py-2 bg-black/30 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Bebas Neue, Arial Black, sans-serif">Bebas Neue</option>
                <option value="Arial Black, sans-serif">Arial Black</option>
                <option value="Impact, sans-serif">Impact</option>
                <option value="Times, serif">Times</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Courier, monospace">Courier</option>
                <option value="Comic Sans MS, cursive">Comic Sans</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Style de police */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Style</label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateObject(selectedId, { fontWeight: selectedObject.fontWeight === 'bold' ? 'normal' : 'bold' })}
                  className={`px-3 py-2 rounded-lg font-bold transition-all ${
                    selectedObject.fontWeight === 'bold' ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  B
                </button>
                <button
                  onClick={() => updateObject(selectedId, { fontStyle: selectedObject.fontStyle === 'italic' ? 'normal' : 'italic' })}
                  className={`px-3 py-2 rounded-lg italic transition-all ${
                    selectedObject.fontStyle === 'italic' ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  I
                </button>
              </div>
            </div>

            {/* Alignement */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Alignement</label>
              <div className="flex gap-2">
                {['left', 'center', 'right'].map(align => (
                  <button
                    key={align}
                    onClick={() => updateObject(selectedId, { align })}
                    className={`px-3 py-2 rounded-lg transition-all ${
                      selectedObject.align === align ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    {align === 'left' ? '⬅️' : align === 'center' ? '↔️' : '➡️'}
                  </button>
                ))}
              </div>
            </div>

            {/* Espacement */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Espacement: {selectedObject.letterSpacing || 0}px
              </label>
              <input
                type="range"
                min="-5"
                max="20"
                value={selectedObject.letterSpacing || 0}
                onChange={(e) => updateObject(selectedId, { letterSpacing: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="flex justify-center items-center">
        <div className="relative">
          {/* Zoom controls */}
          <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-10">
            <button
              onClick={zoomIn}
              className="w-10 h-10 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center justify-center"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={zoomOut}
              className="w-10 h-10 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center justify-center"
            >
              <ZoomOut size={16} />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-2xl">
            <Stage
              width={displayWidth}
              height={displayHeight}
              scaleX={zoom}
              scaleY={zoom}
              ref={stageRef}
              onMouseDown={(e) => {
                // Déselectionner si on clique sur le background
                const clickedOnEmpty = e.target === e.target.getStage();
                if (clickedOnEmpty) {
                  setSelectedId(null);
                }
              }}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <Layer>
                {/* Background */}
                {backgroundImage ? (
                  <KonvaImageComponent
                    src={backgroundImage}
                    x={0}
                    y={0}
                    isSelected={false}
                    onSelect={() => {}}
                    onTransform={() => {}}
                  />
                ) : (
                  <Rect
                    x={0}
                    y={0}
                    width={displayWidth}
                    height={displayHeight}
                    fill={backgroundColor}
                  />
                )}

                {/* Objects */}
                {objects.map((obj) => {
                  if (obj.type === 'image') {
                    return (
                      <KonvaImageComponent
                        key={obj.id}
                        src={obj.src}
                        x={obj.x}
                        y={obj.y}
                        isSelected={selectedId === obj.id}
                        onSelect={() => setSelectedId(obj.id)}
                        onTransform={() => {
                          const node = stageRef.current.findOne(`#${obj.id}`);
                          if (node) {
                            updateObject(obj.id, {
                              x: node.x(),
                              y: node.y(),
                              scaleX: node.scaleX(),
                              scaleY: node.scaleY(),
                              rotation: node.rotation()
                            });
                          }
                        }}
                      />
                    );
                  } else if (obj.type === 'text') {
                    return (
                      <KonvaTextComponent
                        key={obj.id}
                        text={obj.text}
                        x={obj.x}
                        y={obj.y}
                        fontSize={obj.fontSize}
                        fill={obj.fill}
                        fontFamily={obj.fontFamily}
                        fontWeight={obj.fontWeight}
                        fontStyle={obj.fontStyle}
                        align={obj.align}
                        letterSpacing={obj.letterSpacing}
                        isSelected={selectedId === obj.id}
                        onSelect={() => setSelectedId(obj.id)}
                        onTextChange={(newText) => updateText(obj.id, newText)}
                        onTransform={() => {
                          const node = stageRef.current.findOne(`#${obj.id}`);
                          if (node) {
                            updateObject(obj.id, {
                              x: node.x(),
                              y: node.y(),
                              scaleX: node.scaleX(),
                              scaleY: node.scaleY(),
                              rotation: node.rotation()
                            });
                          }
                        }}
                      />
                    );
                  }
                  return null;
                })}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>

      {/* Format info */}
      <div className="text-center mt-4 text-gray-400 text-sm">
        Format : {currentFormat.width} × {currentFormat.height} pixels • Zoom: {Math.round(zoom * 100)}%
      </div>

      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <input
        ref={backgroundInputRef}
        type="file"
        accept="image/*"
        onChange={handleBackgroundUpload}
        className="hidden"
      />
    </div>
  );
};

export default KonvaBannerEditor;