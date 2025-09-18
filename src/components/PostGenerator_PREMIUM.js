import React, { useState, useEffect } from 'react';
import { Copy, Sparkles, Loader, Check, AlertCircle } from 'lucide-react';

const PostGenerator = () => {
  const [figurineName, setFigurineName] = useState('');
  const [generatedPosts, setGeneratedPosts] = useState({
    discord: '',
    instagram: '',
    tiktok: '',
    formattedName: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState('');
  const [error, setError] = useState('');
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('apiUrl') || 'https://alkemia-api.vercel.app/api/generate-posts');
  const [showApiConfig, setShowApiConfig] = useState(false);

  // Agent/Guide de personnalisation
  const [agent, setAgent] = useState(localStorage.getItem('agent') || `Tu es un expert en pop culture, gaming, anime, comics et figurines. Tu connais TOUS les personnages de fiction.

Quand on te donne un nom de personnage (même mal écrit ou abrégé), tu dois:
1. Identifier correctement le personnage et son univers
2. Reformuler son nom proprement (ex: "dbz vegeta" → "VEGETA de Dragon Ball Z")
3. Créer des messages de vente engageants pour une boutique de figurines STL 3D
4. Adapter le ton et les références à chaque plateforme sociale
5. Inclure des émojis pertinents et des références à l'univers du personnage

Pour Discord: Ton communautaire, références techniques au print 3D
Pour Instagram: Visuel, inspirant, avec hashtags tendance
Pour TikTok: Ultra court, viral, jeune et dynamique

Sois créatif et montre que tu connais vraiment le personnage !`);

  // Templates personnalisables avec titres séparés
  const [discordTitle, setDiscordTitle] = useState(localStorage.getItem('discordTitle') || '🎨 **NOUVELLE FIGURINE STL DISPONIBLE** 🎨');
  const [discordTemplate, setDiscordTemplate] = useState(localStorage.getItem('discordTemplate') || `{title}

📦 **{name}** débarque dans la librairie !

{message}

🖨️ Fichiers optimisés & pré-supportés
⚡ Compatible toutes imprimantes
🎯 Qualité de détails exceptionnelle

👉 Disponible maintenant sur notre boutique !
💬 Partagez vos prints dans #creations

#AlkemiaArt #3DPrinting #STL`);

  const [instagramTitle, setInstagramTitle] = useState(localStorage.getItem('instagramTitle') || '✨ NOUVEAUTÉ : {name} ✨');
  const [instagramTemplate, setInstagramTemplate] = useState(localStorage.getItem('instagramTemplate') || `{title}

{message}

🎯 STL haute qualité maintenant disponible
🖨️ Print-ready avec supports optimisés
🎨 Rejoignez des milliers de makers satisfaits

➡️ Lien boutique en bio

#AlkemiaArt #3DPrinting #3DPrint #STLFiles #Figurine3D
#MiniaturePainting #3DPrintedMiniatures #3DDesign
#PrintableMiniatures #TabletopGaming #3DPrintingCommunity`);

  const [tiktokTitle, setTiktokTitle] = useState(localStorage.getItem('tiktokTitle') || '🔥 DROP : {name} 🔥');
  const [tiktokTemplate, setTiktokTemplate] = useState(localStorage.getItem('tiktokTemplate') || `{title}

{message}

✅ Dispo maintenant
✅ Fichiers STL HD
✅ Print & Play

#3DPrinting #STL #Figurine #3DPrint #AlkemiaArt
#PrintingLife #fyp #foryou #viral #3DPrinter
#GeekLife #CollectorItem`);

  // Corrections personnalisées des noms
  const defaultCorrections = {
    'vegeta': 'VEGETA',
    'dbz vegeta': 'VEGETA de Dragon Ball Z',
    'goku': 'GOKU',
    'naruto': 'NARUTO Uzumaki',
    'luffy': 'MONKEY D. LUFFY',
    'spiderman': 'SPIDER-MAN',
    'spider man': 'SPIDER-MAN'
  };

  const [nameCorrections, setNameCorrections] = useState(
    localStorage.getItem('nameCorrections') || JSON.stringify(defaultCorrections, null, 2)
  );

  useEffect(() => {
    // Vérifier si l'API est configurée au chargement
    if (!apiUrl) {
      setShowApiConfig(true);
    }
  }, []);

  const saveConfig = () => {
    localStorage.setItem('apiUrl', apiUrl);
    localStorage.setItem('agent', agent);
    localStorage.setItem('discordTitle', discordTitle);
    localStorage.setItem('discordTemplate', discordTemplate);
    localStorage.setItem('instagramTitle', instagramTitle);
    localStorage.setItem('instagramTemplate', instagramTemplate);
    localStorage.setItem('tiktokTitle', tiktokTitle);
    localStorage.setItem('tiktokTemplate', tiktokTemplate);
    localStorage.setItem('nameCorrections', nameCorrections);
    setShowApiConfig(false);
    setError('');
  };

  const resetToDefaults = () => {
    if (window.confirm('Êtes-vous sûr de vouloir restaurer la configuration par défaut ? Cette action est irréversible.')) {
      // Efface tout le localStorage
      localStorage.clear();

      // Recharge la page pour réinitialiser les states
      window.location.reload();
    }
  };

  const generatePosts = async () => {
    if (!figurineName.trim()) {
      setError('Entrez un nom de personnage');
      return;
    }

    if (!apiUrl) {
      setError('Configurez d\'abord l\'URL de votre API Vercel');
      setShowApiConfig(true);
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterName: figurineName,
          provider: 'openai',
          systemPrompt: agent,
          userPrompt: `Personnage: "${figurineName}"

Génère une réponse JSON avec:
1. Le nom correctement formaté du personnage et son univers
2. Des messages de vente pour Discord, Instagram et TikTok

Format OBLIGATOIRE:
{
  "formattedName": "NOM DU PERSONNAGE",
  "context": "Univers et description courte",
  "messages": {
    "discord": "Message avec émojis pour Discord (2-3 phrases max)",
    "instagram": "Message avec émojis et hashtags pour Instagram (2-3 phrases max)",
    "tiktok": "Message ultra court avec émojis pour TikTok (1-2 phrases max)"
  }
}

IMPORTANT: Réponds UNIQUEMENT avec le JSON, rien d'autre.`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la génération');
      }

      const data = await response.json();

      setGeneratedPosts({
        discord: formatDiscordPost(data.formattedName, data.messages.discord),
        instagram: formatInstagramPost(data.formattedName, data.messages.instagram),
        tiktok: formatTikTokPost(data.formattedName, data.messages.tiktok),
        formattedName: data.formattedName
      });

    } catch (error) {
      console.error('Erreur:', error);
      setError(error.message || 'Erreur lors de la génération. Vérifiez votre configuration.');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDiscordPost = (name, message) => {
    // Utilise le nom formaté par l'IA, ou le nom tapé par l'utilisateur, ou "Personnage" en dernier recours
    const characterName = name || figurineName || 'Personnage';

    const title = discordTitle
      .replace(/{name}/g, characterName);

    return discordTemplate
      .replace(/{title}/g, title)
      .replace(/{name}/g, characterName)
      .replace(/{message}/g, message || 'Message personnalisé ici');
  };

  const formatInstagramPost = (name, message) => {
    // Utilise le nom formaté par l'IA, ou le nom tapé par l'utilisateur, ou "Personnage" en dernier recours
    const characterName = name || figurineName || 'Personnage';

    const title = instagramTitle
      .replace(/{name}/g, characterName);

    return instagramTemplate
      .replace(/{title}/g, title)
      .replace(/{name}/g, characterName)
      .replace(/{message}/g, message || 'Message personnalisé ici');
  };

  const formatTikTokPost = (name, message) => {
    // Utilise le nom formaté par l'IA, ou le nom tapé par l'utilisateur, ou "Personnage" en dernier recours
    const characterName = name || figurineName || 'Personnage';

    const title = tiktokTitle
      .replace(/{name}/g, characterName);

    return tiktokTemplate
      .replace(/{title}/g, title)
      .replace(/{name}/g, characterName)
      .replace(/{message}/g, message || 'Message personnalisé ici');
  };

  const copyToClipboard = async (text, platform) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPlatform(platform);
      setTimeout(() => setCopiedPlatform(''), 2000);
    } catch (err) {
      console.error('Erreur de copie:', err);
      setError('Erreur lors de la copie');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isGenerating) {
      generatePosts();
    }
  };

  // Fonction pour formater intelligemment le nom du personnage
  const formatCharacterName = (input) => {
    if (!input) return 'Personnage';

    // Nettoie et formate le nom
    const cleaned = input.trim();

    try {
      // Utilise les corrections personnalisées de l'utilisateur
      const corrections = JSON.parse(nameCorrections);

      // Cherche une correction exacte
      const lowerInput = cleaned.toLowerCase();
      if (corrections[lowerInput]) {
        return corrections[lowerInput];
      }
    } catch (error) {
      console.error('Erreur parsing nameCorrections:', error);
    }

    // Sinon, applique une capitalisation intelligente
    return cleaned
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Fonction de prévisualisation sans API
  const previewPosts = () => {
    if (!figurineName.trim()) {
      setError('Entrez un nom de personnage pour la prévisualisation');
      return;
    }

    const formattedName = formatCharacterName(figurineName);

    setGeneratedPosts({
      discord: formatDiscordPost(formattedName, 'Ceci est un aperçu du message généré par l\'IA pour ce personnage.'),
      instagram: formatInstagramPost(formattedName, 'Message Instagram personnalisé qui sera généré par l\'IA selon vos paramètres.'),
      tiktok: formatTikTokPost(formattedName, 'Message TikTok court et viral pour ce personnage !'),
      formattedName: formattedName
    });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden relative">
      {/* Background decorative sculptures - subtle */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Goldorak en arrière-plan, très subtil */}
        <div className="absolute top-20 right-10 opacity-5 transform rotate-12 scale-75">
          <img
            src="/rendergoldorak.bip.246.png"
            alt=""
            className="w-96 h-auto filter grayscale"
          />
        </div>

        {/* Une autre sculpture en bas à gauche */}
        <div className="absolute bottom-10 left-10 opacity-3 transform -rotate-6 scale-50">
          <img
            src="/untitled.215.png"
            alt=""
            className="w-64 h-auto filter grayscale"
          />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Header Premium */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <img src="/logo.png?v=3" alt="Alkemia Art" className="w-16 h-16 object-contain" />
              <div>
                <h1 className="text-5xl md:text-6xl font-light bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Alkemia Art
                </h1>
                <h2 className="text-2xl md:text-3xl font-extralight text-purple-300 -mt-2">
                  Tool
                </h2>
              </div>
            </div>
            <p className="text-gray-400 text-lg font-light max-w-2xl mx-auto">
              Générateur intelligent de contenus marketing pour vos créations STL
            </p>
          </div>

          {/* Interface principale épurée */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">

              {/* Champ de saisie premium */}
              <div className="flex flex-col lg:flex-row gap-4 mb-8">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Nom du personnage (ex: Vegeta, Spider-Man, Naruto...)"
                    value={figurineName}
                    onChange={(e) => setFigurineName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-6 py-4 rounded-2xl bg-black/20 text-white text-xl placeholder-gray-500 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={previewPosts}
                    disabled={!figurineName.trim()}
                    className="px-8 py-4 bg-gray-600/80 text-white rounded-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-500/80 transition-all flex items-center gap-3 text-lg backdrop-blur-sm border border-gray-500/30"
                  >
                    👁️ <span>Aperçu</span>
                  </button>

                  <button
                    onClick={generatePosts}
                    disabled={isGenerating || !figurineName.trim()}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-3 text-lg shadow-lg hover:shadow-purple-500/25"
                  >
                    {isGenerating ? (
                      <>
                        <Loader className="animate-spin" size={20} />
                        <span>Génération...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        <span>Générer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Personnage identifié */}
              {generatedPosts.formattedName && (
                <div className="mb-8 text-center">
                  <div className="inline-block px-6 py-3 bg-purple-500/20 rounded-full border border-purple-400/30">
                    <span className="text-purple-300 text-sm">Personnage identifié :</span>
                    <span className="text-white font-semibold ml-2 text-lg">{generatedPosts.formattedName}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-red-500/20 border border-red-400/30 text-red-200 rounded-2xl p-6 flex items-start gap-3 backdrop-blur-sm">
                <AlertCircle size={24} className="mt-1 flex-shrink-0" />
                <span className="text-lg">{error}</span>
              </div>
            </div>
          )}

          {/* Résultats - Design moderne */}
          {generatedPosts.discord && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">

              {/* Discord Card */}
              <div className="group">
                <div className="bg-gradient-to-br from-indigo-900/40 to-indigo-800/20 backdrop-blur-xl rounded-3xl border border-indigo-400/20 p-8 hover:border-indigo-400/40 transition-all duration-300 shadow-xl hover:shadow-indigo-500/10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xl">D</span>
                      </div>
                      <h3 className="text-2xl font-semibold text-white">Discord</h3>
                    </div>
                    <button
                      onClick={() => copyToClipboard(generatedPosts.discord, 'discord')}
                      className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-medium ${
                        copiedPlatform === 'discord'
                          ? 'bg-green-500 text-white shadow-lg'
                          : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-md hover:shadow-lg'
                      }`}
                    >
                      {copiedPlatform === 'discord' ? (
                        <>
                          <Check size={18} />
                          <span>Copié!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={18} />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-black/30 rounded-2xl p-6 max-h-96 overflow-y-auto border border-white/5">
                    <pre className="text-gray-200 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                      {generatedPosts.discord}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Instagram Card */}
              <div className="group">
                <div className="bg-gradient-to-br from-pink-900/40 to-orange-800/20 backdrop-blur-xl rounded-3xl border border-pink-400/20 p-8 hover:border-pink-400/40 transition-all duration-300 shadow-xl hover:shadow-pink-500/10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xl">I</span>
                      </div>
                      <h3 className="text-2xl font-semibold text-white">Instagram</h3>
                    </div>
                    <button
                      onClick={() => copyToClipboard(generatedPosts.instagram, 'instagram')}
                      className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-medium ${
                        copiedPlatform === 'instagram'
                          ? 'bg-green-500 text-white shadow-lg'
                          : 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white hover:opacity-90 shadow-md hover:shadow-lg'
                      }`}
                    >
                      {copiedPlatform === 'instagram' ? (
                        <>
                          <Check size={18} />
                          <span>Copié!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={18} />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-black/30 rounded-2xl p-6 max-h-96 overflow-y-auto border border-white/5">
                    <pre className="text-gray-200 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                      {generatedPosts.instagram}
                    </pre>
                  </div>
                </div>
              </div>

              {/* TikTok Card */}
              <div className="group">
                <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/20 backdrop-blur-xl rounded-3xl border border-gray-400/20 p-8 hover:border-gray-400/40 transition-all duration-300 shadow-xl hover:shadow-gray-500/10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-lg border border-white/20">
                        <span className="text-white font-bold text-xl">T</span>
                      </div>
                      <h3 className="text-2xl font-semibold text-white">TikTok</h3>
                    </div>
                    <button
                      onClick={() => copyToClipboard(generatedPosts.tiktok, 'tiktok')}
                      className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-medium ${
                        copiedPlatform === 'tiktok'
                          ? 'bg-green-500 text-white shadow-lg'
                          : 'bg-black text-white hover:bg-gray-900 shadow-md hover:shadow-lg border border-white/20'
                      }`}
                    >
                      {copiedPlatform === 'tiktok' ? (
                        <>
                          <Check size={18} />
                          <span>Copié!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={18} />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-black/30 rounded-2xl p-6 max-h-96 overflow-y-auto border border-white/5">
                    <pre className="text-gray-200 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                      {generatedPosts.tiktok}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bouton de configuration flottant - design premium */}
          <button
            onClick={() => setShowApiConfig(true)}
            className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-2xl hover:shadow-purple-500/50 flex items-center justify-center hover:scale-110 transition-all duration-300 backdrop-blur-sm border border-white/20"
            title="Configuration"
          >
            <span className="text-2xl">⚙️</span>
          </button>

          {/* Modal de configuration - même design épuré */}
          {showApiConfig && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
                <h3 className="text-3xl font-light text-white mb-8 text-center">⚙️ Configuration</h3>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        URL de votre API Vercel
                      </label>
                      <input
                        type="text"
                        value={apiUrl}
                        onChange={(e) => setApiUrl(e.target.value)}
                        className="w-full px-4 py-3 bg-black/30 text-white rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="https://votre-projet.vercel.app/api/generate-posts"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Agent IA (Instructions pour ChatGPT)
                      </label>
                      <textarea
                        value={agent}
                        onChange={(e) => setAgent(e.target.value)}
                        className="w-full px-4 py-3 bg-black/30 text-white rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 h-32 font-mono text-sm"
                        placeholder="Instructions pour personnaliser le comportement de l'IA..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Corrections de noms (JSON)
                      </label>
                      <textarea
                        value={nameCorrections}
                        onChange={(e) => setNameCorrections(e.target.value)}
                        className="w-full px-4 py-3 bg-black/30 text-white rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 h-32 font-mono text-sm"
                        placeholder='{"vegeta": "VEGETA", "goku": "GOKU"}'
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        Format: {'"input": "OUTPUT FORMATÉ"'}
                      </p>
                    </div>
                  </div>

                  {/* Templates en grille plus compacte */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-indigo-300 border-b border-indigo-500/30 pb-2">Discord</h4>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">Titre</label>
                        <input
                          type="text"
                          value={discordTitle}
                          onChange={(e) => setDiscordTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-black/30 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">Template</label>
                        <textarea
                          value={discordTemplate}
                          onChange={(e) => setDiscordTemplate(e.target.value)}
                          className="w-full px-3 py-2 bg-black/30 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-1 focus:ring-purple-500 h-24 font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-pink-300 border-b border-pink-500/30 pb-2">Instagram</h4>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">Titre</label>
                        <input
                          type="text"
                          value={instagramTitle}
                          onChange={(e) => setInstagramTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-black/30 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">Template</label>
                        <textarea
                          value={instagramTemplate}
                          onChange={(e) => setInstagramTemplate(e.target.value)}
                          className="w-full px-3 py-2 bg-black/30 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-1 focus:ring-purple-500 h-24 font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-300 border-b border-gray-500/30 pb-2">TikTok</h4>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">Titre</label>
                        <input
                          type="text"
                          value={tiktokTitle}
                          onChange={(e) => setTiktokTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-black/30 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2">Template</label>
                        <textarea
                          value={tiktokTemplate}
                          onChange={(e) => setTiktokTemplate(e.target.value)}
                          className="w-full px-3 py-2 bg-black/30 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-1 focus:ring-purple-500 h-24 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8 justify-center">
                  <button
                    onClick={saveConfig}
                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
                  >
                    💾 Sauvegarder
                  </button>
                  <button
                    onClick={resetToDefaults}
                    className="px-8 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all shadow-lg"
                  >
                    🔄 Reset
                  </button>
                  <button
                    onClick={() => setShowApiConfig(false)}
                    className="px-8 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all shadow-lg"
                  >
                    ❌ Fermer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostGenerator;