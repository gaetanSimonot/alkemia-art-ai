import React, { useState, useEffect, useRef } from 'react';
import * as fabric from 'fabric';
import { Upload, Type, Palette, Download, RotateCw, Move, Square, Eye, EyeOff } from 'lucide-react';

const FabricBannerEditor = () => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('instagram-post');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [showLogo, setShowLogo] = useState(true);
  const [logoObject, setLogoObject] = useState(null);

  // Formats sociaux populaires
  const formats = {
    'instagram-post': { width: 1080, height: 1080, name: '📱 Instagram Post' },
    'instagram-story': { width: 1080, height: 1920, name: '📱 Instagram Story' },
    'tiktok': { width: 1080, height: 1920, name: '🎵 TikTok' },
    'facebook-post': { width: 1200, height: 630, name: '📘 Facebook Post' },
    'facebook-cover': { width: 1200, height: 315, name: '📘 Facebook Couverture' },
    'patreon-banner': { width: 1200, height: 400, name: '🎨 Bannière Patreon' },
    'youtube-thumbnail': { width: 1280, height: 720, name: '📺 YouTube Thumbnail' },
    'twitter-header': { width: 1500, height: 500, name: '🐦 Twitter Header' }
  };

  const currentFormat = formats[selectedFormat];

  // Initialisation du canvas Fabric.js
  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: currentFormat.width,
      height: currentFormat.height,
      backgroundColor: backgroundColor,
      selection: true,
      preserveObjectStacking: true
    });

    // Configuration mobile-friendly
    fabricCanvas.on('touch:gesture', (e) => {
      e.e.preventDefault();
    });

    fabricCanvas.on('selection:created', () => {
      console.log('Objet sélectionné');
    });

    fabricCanvas.on('object:modified', () => {
      fabricCanvas.renderAll();
    });

    setCanvas(fabricCanvas);

    // Ajouter le logo par défaut
    addLogo(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, [selectedFormat, backgroundColor]);

  // Ajouter le logo
  const addLogo = (fabricCanvas) => {
    fabric.Image.fromURL('/logo.png', (logoImg) => {
      logoImg.set({
        left: 20,
        top: 20,
        scaleX: 0.3,
        scaleY: 0.3,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        visible: showLogo
      });

      fabricCanvas.add(logoImg);
      setLogoObject(logoImg);
      fabricCanvas.renderAll();
    }, { crossOrigin: 'anonymous' });
  };

  // Toggle logo visibility
  const toggleLogo = () => {
    if (logoObject && canvas) {
      const newVisibility = !showLogo;
      logoObject.set('visible', newVisibility);
      setShowLogo(newVisibility);
      canvas.renderAll();
    }
  };

  // Changer de format
  const changeFormat = (format) => {
    setSelectedFormat(format);
  };

  // Changer la couleur de fond
  const changeBackgroundColor = (color) => {
    setBackgroundColor(color);
    if (canvas) {
      canvas.setBackgroundColor(color, canvas.renderAll.bind(canvas));
    }
  };

  // Ajouter une image de fond
  const handleBackgroundImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      fabric.Image.fromURL(event.target.result, (img) => {
        // Ajuster l'image pour couvrir tout le canvas
        const canvasAspect = canvas.width / canvas.height;
        const imgAspect = img.width / img.height;

        let scale;
        if (canvasAspect > imgAspect) {
          scale = canvas.width / img.width;
        } else {
          scale = canvas.height / img.height;
        }

        img.set({
          scaleX: scale,
          scaleY: scale,
          left: (canvas.width - img.width * scale) / 2,
          top: (canvas.height - img.height * scale) / 2,
          selectable: false,
          evented: false
        });

        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
      });
    };
    reader.readAsDataURL(file);
  };

  // Ajouter une image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      fabric.Image.fromURL(event.target.result, (img) => {
        // Redimensionner intelligemment l'image
        const maxSize = Math.min(canvas.width, canvas.height) * 0.4;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);

        img.set({
          left: canvas.width / 2 - (img.width * scale) / 2,
          top: canvas.height / 2 - (img.height * scale) / 2,
          scaleX: scale,
          scaleY: scale,
          selectable: true,
          hasControls: true,
          hasBorders: true,
          borderColor: '#ff6b35',
          cornerColor: '#ff6b35',
          cornerSize: 20,
          transparentCorners: false,
          borderOpacityWhenMoving: 0.8
        });

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };

  // Ajouter du texte avec Bebas Neue
  const addText = () => {
    if (!canvas) return;

    const text = new fabric.Text('VOTRE TEXTE', {
      left: canvas.width / 2,
      top: canvas.height / 2,
      fontSize: 60,
      fontFamily: 'Bebas Neue, Arial Black, Impact',
      fill: '#ff6b35',
      fontWeight: 'normal',
      selectable: true,
      hasControls: true,
      hasBorders: true,
      borderColor: '#ff6b35',
      cornerColor: '#ff6b35',
      cornerSize: 20,
      transparentCorners: false,
      editable: true
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();

    // Permettre l'édition directe du texte
    text.on('editing:entered', () => {
      text.hiddenTextarea.focus();
    });
  };

  // Supprimer l'objet sélectionné
  const deleteSelected = () => {
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
      canvas.discardActiveObject();
      activeObjects.forEach(obj => {
        // Ne pas supprimer le logo s'il est dans la sélection
        if (obj !== logoObject) {
          canvas.remove(obj);
        }
      });
      canvas.renderAll();
    }
  };

  // Dupliquer l'objet sélectionné
  const duplicateSelected = () => {
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.clone((cloned) => {
        cloned.set({
          left: cloned.left + 20,
          top: cloned.top + 20
        });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.renderAll();
      });
    }
  };

  // Export en haute qualité
  const exportBanner = () => {
    if (!canvas) return;

    // Créer un canvas temporaire en haute résolution
    const multiplier = 2; // Facteur de qualité
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: multiplier
    });

    const link = document.createElement('a');
    link.download = `banner-${selectedFormat}-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  };

  return (
    <div className="bg-black/10 rounded-3xl p-6 mt-12">
      <div className="text-center mb-6">
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent mb-3">
          🎨 Éditeur Pro Mobile
        </h2>
        <p className="text-gray-300 text-sm">
          Glissez, redimensionnez et éditez comme sur mobile !
        </p>
      </div>

      {/* Sélection du format */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Object.entries(formats).map(([key, format]) => (
          <button
            key={key}
            onClick={() => changeFormat(key)}
            className={`p-3 rounded-xl text-sm font-semibold transition-all ${
              selectedFormat === key
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {format.name}
            <div className="text-xs opacity-75 mt-1">
              {format.width}×{format.height}
            </div>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {/* Upload d'image */}
        <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700 transition-all text-sm">
          <Upload size={18} />
          <span>Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>

        {/* Background image */}
        <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl cursor-pointer hover:bg-indigo-700 transition-all text-sm">
          <Square size={18} />
          <span>Fond</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleBackgroundImageUpload}
            className="hidden"
          />
        </label>

        {/* Couleur de fond */}
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-xl text-sm">
          <Palette size={18} />
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => changeBackgroundColor(e.target.value)}
            className="w-6 h-6 rounded border-0 cursor-pointer"
          />
          <span className="text-white">Couleur</span>
        </div>

        {/* Ajouter texte */}
        <button
          onClick={addText}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all text-sm"
        >
          <Type size={18} />
          <span>Texte</span>
        </button>

        {/* Toggle logo */}
        <button
          onClick={toggleLogo}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm ${
            showLogo ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-600 hover:bg-gray-700'
          } text-white`}
        >
          {showLogo ? <Eye size={18} /> : <EyeOff size={18} />}
          <span>Logo</span>
        </button>

        {/* Dupliquer */}
        <button
          onClick={duplicateSelected}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-all text-sm"
        >
          <Move size={18} />
          <span>Copier</span>
        </button>

        {/* Supprimer */}
        <button
          onClick={deleteSelected}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all text-sm"
        >
          🗑️
          <span>Suppr</span>
        </button>

        {/* Export */}
        <button
          onClick={exportBanner}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all text-sm"
        >
          <Download size={18} />
          <span>Télécharger</span>
        </button>
      </div>

      {/* Canvas */}
      <div className="flex justify-center">
        <div
          className="bg-white rounded-2xl p-4 shadow-2xl overflow-auto"
          style={{
            maxWidth: '100%',
            maxHeight: '70vh'
          }}
        >
          <canvas
            ref={canvasRef}
            className="border border-gray-200 rounded-lg shadow-inner"
            style={{
              maxWidth: '100%',
              height: 'auto',
              touchAction: 'none'
            }}
          />
        </div>
      </div>

      {/* Instructions mobile */}
      <div className="mt-6 text-center text-gray-400 text-sm">
        <p>📱 <strong>Mobile :</strong> Touchez pour sélectionner • Glissez pour déplacer • Pincez pour redimensionner</p>
        <p>🖥️ <strong>Desktop :</strong> Cliquez pour sélectionner • Glissez les coins pour redimensionner • Roulette pour faire tourner</p>
      </div>
    </div>
  );
};

export default FabricBannerEditor;