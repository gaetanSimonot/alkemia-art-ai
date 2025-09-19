import React, { useState, useRef, useEffect } from 'react';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Save, X, Type, Palette, Link, Image,
  Share2, Mail, MessageCircle, Copy, Download
} from 'lucide-react';

const RichNoteEditor = ({ note, onSave, onClose, categoryColor }) => {
  const [content, setContent] = useState(note?.content || '');
  const [title, setTitle] = useState(note?.title || 'Sans titre');
  const [fontSize, setFontSize] = useState(16);
  const [textColor, setTextColor] = useState('#333333');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = content;
    }
  }, []);

  // Commandes de formatage
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  const handleSave = () => {
    const finalContent = editorRef.current.innerHTML;
    onSave({
      id: note?.id || Date.now(),
      title,
      content: finalContent,
      type: 'rich',
      timestamp: Date.now(),
      fontSize,
      textColor
    });
  };

  const insertList = (ordered = false) => {
    execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList');
  };

  const changeAlignment = (align) => {
    switch(align) {
      case 'left': execCommand('justifyLeft'); break;
      case 'center': execCommand('justifyCenter'); break;
      case 'right': execCommand('justifyRight'); break;
    }
  };

  const insertLink = () => {
    const url = prompt('URL du lien:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const changeFontSize = (size) => {
    setFontSize(size);
    editorRef.current.style.fontSize = size + 'px';
  };

  const changeTextColor = (color) => {
    setTextColor(color);
    execCommand('foreColor', color);
  };

  // Fonctions de partage
  const getPlainText = () => {
    return editorRef.current.innerText || editorRef.current.textContent || '';
  };

  const shareViaEmail = () => {
    const plainText = getPlainText();
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(plainText);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaWhatsApp = () => {
    const plainText = getPlainText();
    const text = encodeURIComponent(`*${title}*\n\n${plainText}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const copyToClipboard = async () => {
    const plainText = getPlainText();
    const textToCopy = `${title}\n\n${plainText}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      alert('Texte copié dans le presse-papier!');
    } catch (err) {
      // Fallback pour les navigateurs qui ne supportent pas l'API clipboard
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Texte copié dans le presse-papier!');
    }
  };

  const downloadAsText = () => {
    const plainText = getPlainText();
    const content = `${title}\n\n${plainText}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200" style={{ backgroundColor: categoryColor + '10' }}>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-bold bg-transparent border-none outline-none text-gray-800 placeholder-gray-500"
              placeholder="Titre de la note"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Bouton partage */}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
              >
                <Share2 size={16} />
                <span>Partager</span>
              </button>

              {/* Menu partage */}
              {showShareMenu && (
                <div className="absolute right-0 top-12 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 min-w-48">
                  <button
                    onClick={() => {shareViaEmail(); setShowShareMenu(false);}}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-all w-full text-left text-gray-700"
                  >
                    <Mail size={16} />
                    <span>Email</span>
                  </button>
                  <button
                    onClick={() => {shareViaWhatsApp(); setShowShareMenu(false);}}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-all w-full text-left text-gray-700"
                  >
                    <MessageCircle size={16} />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => {copyToClipboard(); setShowShareMenu(false);}}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-all w-full text-left text-gray-700"
                  >
                    <Copy size={16} />
                    <span>Copier</span>
                  </button>
                  <button
                    onClick={() => {downloadAsText(); setShowShareMenu(false);}}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-all w-full text-left text-gray-700"
                  >
                    <Download size={16} />
                    <span>Télécharger</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
            >
              <Save size={16} />
              <span>Sauvegarder</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 p-3 border-b border-gray-200 bg-gray-50 overflow-x-auto">

          {/* Format de base */}
          <div className="flex items-center gap-1 pr-3 border-r border-gray-300">
            <button
              onClick={() => execCommand('bold')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-all"
              title="Gras"
            >
              <Bold size={16} />
            </button>
            <button
              onClick={() => execCommand('italic')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-all"
              title="Italique"
            >
              <Italic size={16} />
            </button>
            <button
              onClick={() => execCommand('underline')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-all"
              title="Souligné"
            >
              <Underline size={16} />
            </button>
          </div>

          {/* Taille de police */}
          <div className="flex items-center gap-2 px-3 border-r border-gray-300">
            <Type size={16} />
            <select
              value={fontSize}
              onChange={(e) => changeFontSize(parseInt(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value={12}>12px</option>
              <option value={14}>14px</option>
              <option value={16}>16px</option>
              <option value={18}>18px</option>
              <option value={24}>24px</option>
              <option value={32}>32px</option>
            </select>
          </div>

          {/* Couleur du texte */}
          <div className="flex items-center gap-2 px-3 border-r border-gray-300">
            <Palette size={16} />
            <input
              type="color"
              value={textColor}
              onChange={(e) => changeTextColor(e.target.value)}
              className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
            />
          </div>

          {/* Alignement */}
          <div className="flex items-center gap-1 px-3 border-r border-gray-300">
            <button
              onClick={() => changeAlignment('left')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-all"
              title="Aligner à gauche"
            >
              <AlignLeft size={16} />
            </button>
            <button
              onClick={() => changeAlignment('center')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-all"
              title="Centrer"
            >
              <AlignCenter size={16} />
            </button>
            <button
              onClick={() => changeAlignment('right')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-all"
              title="Aligner à droite"
            >
              <AlignRight size={16} />
            </button>
          </div>

          {/* Listes */}
          <div className="flex items-center gap-1 px-3 border-r border-gray-300">
            <button
              onClick={() => insertList(false)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-all"
              title="Liste à puces"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => insertList(true)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-all"
              title="Liste numérotée"
            >
              <ListOrdered size={16} />
            </button>
          </div>

          {/* Lien */}
          <div className="flex items-center gap-1 px-3">
            <button
              onClick={insertLink}
              className="p-2 hover:bg-gray-200 rounded-lg transition-all"
              title="Insérer un lien"
            >
              <Link size={16} />
            </button>
          </div>

        </div>

        {/* Éditeur */}
        <div className="flex-1 overflow-auto">
          <div
            ref={editorRef}
            contentEditable
            className="w-full h-full p-6 outline-none text-gray-800 leading-relaxed"
            style={{
              fontSize: fontSize + 'px',
              minHeight: '400px',
              lineHeight: '1.6'
            }}
            onInput={(e) => setContent(e.target.innerHTML)}
            suppressContentEditableWarning={true}
            placeholder="Commencez à taper votre note ici..."
          />
        </div>

        {/* Footer avec infos */}
        <div className="flex items-center justify-between p-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-500">
          <div>
            {note?.timestamp && (
              <span>Dernière modification: {new Date(note.timestamp).toLocaleString()}</span>
            )}
          </div>
          <div>
            <span>Mots: {content.replace(/<[^>]*>/g, '').split(' ').filter(w => w.length > 0).length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RichNoteEditor;