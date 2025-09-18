import React, { useState, useEffect, useRef } from 'react';
import * as fabric from 'fabric';
import { Upload, Type, Download, Eye, EyeOff, ZoomIn, ZoomOut } from 'lucide-react';

const FabricBannerEditor = () => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const backgroundInputRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('instagram-post');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [showLogo, setShowLogo] = useState(true);
  const [logoObject, setLogoObject] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Formats optimisés
  const formats = {
    'instagram-post': { width: 1080, height: 1080, name: '📱 Instagram Post', maxDisplayWidth: 400 },
    'instagram-story': { width: 1080, height: 1920, name: '📱 Instagram Story', maxDisplayWidth: 225 },
    'tiktok': { width: 1080, height: 1920, name: '🎵 TikTok', maxDisplayWidth: 225 },
    'facebook-post': { width: 1200, height: 630, name: '📘 Facebook Post', maxDisplayWidth: 400 },
    'patreon-banner': { width: 1200, height: 400, name: '🎨 Patreon', maxDisplayWidth: 400 },
    'youtube-thumbnail': { width: 1280, height: 720, name: '📺 YouTube', maxDisplayWidth: 400 }
  };

  const currentFormat = formats[selectedFormat];

  // Calculer les dimensions d'affichage
  const getDisplayDimensions = () => {
    const aspect = currentFormat.width / currentFormat.height;
    const maxWidth = currentFormat.maxDisplayWidth;

    if (aspect >= 1) {
      return { width: maxWidth, height: maxWidth / aspect };
    } else {
      return { width: maxWidth * aspect, height: maxWidth };
    }
  };

  // Initialiser canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const displayDims = getDisplayDimensions();

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: displayDims.width,
      height: displayDims.height,
      backgroundColor: backgroundColor,
      selection: true,
      preserveObjectStacking: true,
      allowTouchScrolling: true
    });

    // Configurer le scaling pour avoir les bonnes proportions
    const scaleX = displayDims.width / currentFormat.width;
    const scaleY = displayDims.height / currentFormat.height;
    fabricCanvas.setDimensions({ width: displayDims.width, height: displayDims.height });
    fabricCanvas.setZoom(scaleX);

    // Events
    fabricCanvas.on('object:scaling', (e) => {
      const obj = e.target;
      obj.set({
        scaleX: obj.scaleX,
        scaleY: obj.scaleY
      });
    });

    fabricCanvas.on('mouse:dblclick', (e) => {
      if (e.target && e.target.type === 'text') {
        e.target.enterEditing();
        e.target.selectAll();
      }
    });

    setCanvas(fabricCanvas);

    // Ajouter le logo si activé
    if (showLogo) {
      addLogo(fabricCanvas);
    }

    return () => {
      fabricCanvas.dispose();
    };
  }, [selectedFormat, backgroundColor, showLogo]);

  // Ajouter le logo
  const addLogo = (fabricCanvas) => {
    if (logoObject) {
      fabricCanvas.remove(logoObject);
    }

    fabric.Image.fromURL('/logo.png', (logoImg) => {
      const logoSize = 60; // Taille fixe en pixels d'affichage
      const scale = logoSize / Math.max(logoImg.width, logoImg.height);

      logoImg.set({
        left: 20,
        top: 20,
        scaleX: scale,
        scaleY: scale,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        cornerColor: '#ff6b35',
        borderColor: '#ff6b35'
      });

      fabricCanvas.add(logoImg);
      setLogoObject(logoImg);
      fabricCanvas.renderAll();
    }, { crossOrigin: 'anonymous' });
  };

  // Upload d'image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      fabric.Image.fromURL(event.target.result, (img) => {
        const canvasCenter = canvas.getCenter();

        // Redimensionner pour s'adapter au canvas
        const maxSize = Math.min(canvas.width, canvas.height) * 0.4;
        const imgScale = Math.min(maxSize / img.width, maxSize / img.height);

        img.set({
          left: canvasCenter.left,
          top: canvasCenter.top,
          scaleX: imgScale,
          scaleY: imgScale,
          originX: 'center',
          originY: 'center',
          selectable: true,
          hasControls: true,
          hasBorders: true,
          cornerColor: '#ff6b35',
          borderColor: '#ff6b35',
          cornerSize: 10,
          transparentCorners: false
        });

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  // Background image
  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      fabric.Image.fromURL(event.target.result, (img) => {
        // Couvrir tout le canvas
        const scaleX = canvas.width / img.width;
        const scaleY = canvas.height / img.height;
        const scale = Math.max(scaleX, scaleY);

        img.set({
          scaleX: scale,
          scaleY: scale,
          left: canvas.width / 2,
          top: canvas.height / 2,
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false
        });

        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Ajouter du texte
  const addText = () => {
    if (!canvas) return;

    const canvasCenter = canvas.getCenter();
    const text = new fabric.Text('VOTRE TEXTE', {
      left: canvasCenter.left,
      top: canvasCenter.top,
      fontSize: 40,
      fontFamily: 'Bebas Neue, Arial Black, sans-serif',
      fill: '#ff6b35',
      originX: 'center',
      originY: 'center',
      selectable: true,
      hasControls: true,
      hasBorders: true,
      cornerColor: '#ff6b35',
      borderColor: '#ff6b35',
      editable: true
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  // Toggle logo
  const toggleLogo = () => {
    setShowLogo(!showLogo);
  };

  // Supprimer sélectionné
  const deleteSelected = () => {
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
      activeObjects.forEach(obj => {
        if (obj !== logoObject) {
          canvas.remove(obj);
        }
      });
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  };

  // Zoom
  const zoomIn = () => {
    if (canvas) {
      const newZoom = Math.min(zoomLevel * 1.2, 3);
      canvas.setZoom(newZoom);
      setZoomLevel(newZoom);
      canvas.renderAll();
    }
  };

  const zoomOut = () => {
    if (canvas) {
      const newZoom = Math.max(zoomLevel / 1.2, 0.3);
      canvas.setZoom(newZoom);
      setZoomLevel(newZoom);
      canvas.renderAll();
    }
  };

  // Export
  const exportBanner = () => {
    if (!canvas) return;

    // Créer un canvas temporaire aux vraies dimensions
    const tempCanvas = new fabric.Canvas(document.createElement('canvas'), {
      width: currentFormat.width,
      height: currentFormat.height,
      backgroundColor: backgroundColor
    });

    // Copier le background si il existe
    if (canvas.backgroundImage) {
      const bgImg = canvas.backgroundImage;
      tempCanvas.setBackgroundImage(bgImg, () => {});
    }

    // Copier tous les objets avec le bon scaling
    const objects = canvas.getObjects();
    const scaleRatio = currentFormat.width / canvas.width;

    objects.forEach(obj => {
      obj.clone(cloned => {
        cloned.set({
          left: cloned.left * scaleRatio,
          top: cloned.top * scaleRatio,
          scaleX: cloned.scaleX * scaleRatio,
          scaleY: cloned.scaleY * scaleRatio
        });
        tempCanvas.add(cloned);
      });
    });

    setTimeout(() => {
      const dataURL = tempCanvas.toDataURL({
        format: 'png',
        quality: 1
      });

      const link = document.createElement('a');
      link.download = `banner-${selectedFormat}-${Date.now()}.png`;
      link.href = dataURL;
      link.click();

      tempCanvas.dispose();
    }, 100);
  };

  const displayDims = getDisplayDimensions();

  return (
    <div className="bg-black/10 rounded-3xl p-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent mb-3">
          🎨 Éditeur de Bannières
        </h2>
        <p className="text-gray-300 text-sm">
          Double-cliquez sur le texte pour l'éditer • Glissez pour déplacer
        </p>
      </div>

      {/* Sélection du format */}
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

      {/* Toolbar simplifié */}
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
          onClick={toggleLogo}
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
          onClick={exportBanner}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-all"
        >
          <Download size={18} />
          <span>Export</span>
        </button>
      </div>

      {/* Canvas */}
      <div className="flex justify-center items-center">
        <div className="relative">
          {/* Contrôles de zoom */}
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
            <canvas
              ref={canvasRef}
              className="border border-gray-200 rounded-lg shadow-inner"
              style={{
                width: displayDims.width,
                height: displayDims.height,
                touchAction: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Format info */}
      <div className="text-center mt-4 text-gray-400 text-sm">
        Format actuel : {currentFormat.width} × {currentFormat.height} pixels
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

export default FabricBannerEditor;