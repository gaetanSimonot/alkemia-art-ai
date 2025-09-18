import React, { useState, useEffect } from 'react';
import { Copy, Sparkles, Loader, Check, AlertCircle } from 'lucide-react';
import KonvaBannerEditor from './KonvaBannerEditor';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img src="/logo.png?v=2" alt="Alkemia Art" className="w-12 h-12 object-contain" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Alkemia Art Tool
            </h1>
          </div>
          <p className="text-gray-300 text-sm md:text-base">
            Génération intelligente de posts pour vos figurines STL
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tapez un nom de personnage (ex: dbz vegeta, spider man, naruto...)"
                value={figurineName}
                onChange={(e) => setFigurineName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-5 py-4 rounded-xl bg-black/30 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={previewPosts}
                disabled={!figurineName.trim()}
                className="px-6 py-4 bg-gray-600 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-all flex items-center justify-center gap-2 text-lg"
              >
                👁️ <span>Aperçu</span>
              </button>
              <button
                onClick={generatePosts}
                disabled={isGenerating || !figurineName.trim()}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-purple-500/25"
              >
                {isGenerating ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    <span>Génération...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>Générer IA</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Nom reformulé */}
          {generatedPosts.formattedName && (
            <div className="mt-4 px-4 py-2 bg-purple-500/20 rounded-lg inline-block">
              <span className="text-purple-300 text-sm">Personnage identifié :</span>
              <span className="text-white font-bold ml-2">{generatedPosts.formattedName}</span>
            </div>
          )}
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 rounded-xl p-4 mb-6 flex items-start gap-2">
            <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Posts générés */}
        {generatedPosts.discord && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Discord */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">D</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Discord</h3>
                </div>
                <button
                  onClick={() => copyToClipboard(generatedPosts.discord, 'discord')}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    copiedPlatform === 'discord'
                      ? 'bg-green-600 text-white'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {copiedPlatform === 'discord' ? (
                    <>
                      <Check size={16} />
                      <span>Copié!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-black/30 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-gray-200 text-sm whitespace-pre-wrap font-sans">
                  {generatedPosts.discord}
                </pre>
              </div>
            </div>

            {/* Instagram */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-pink-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">I</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Instagram</h3>
                </div>
                <button
                  onClick={() => copyToClipboard(generatedPosts.instagram, 'instagram')}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    copiedPlatform === 'instagram'
                      ? 'bg-green-600 text-white'
                      : 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white hover:opacity-90'
                  }`}
                >
                  {copiedPlatform === 'instagram' ? (
                    <>
                      <Check size={16} />
                      <span>Copié!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-black/30 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-gray-200 text-sm whitespace-pre-wrap font-sans">
                  {generatedPosts.instagram}
                </pre>
              </div>
            </div>

            {/* TikTok */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-cyan-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">T</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">TikTok</h3>
                </div>
                <button
                  onClick={() => copyToClipboard(generatedPosts.tiktok, 'tiktok')}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    copiedPlatform === 'tiktok'
                      ? 'bg-green-600 text-white'
                      : 'bg-black text-white hover:bg-gray-900'
                  }`}
                >
                  {copiedPlatform === 'tiktok' ? (
                    <>
                      <Check size={16} />
                      <span>Copié!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-black/30 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-gray-200 text-sm whitespace-pre-wrap font-sans">
                  {generatedPosts.tiktok}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Section Banner Editor */}
        <div className="mt-16">
          <KonvaBannerEditor />
        </div>

        {/* Bouton de configuration flottant */}
        <button
          onClick={() => setShowApiConfig(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-purple-500/50 flex items-center justify-center hover:scale-110 transition-all"
          title="Configuration"
        >
          ⚙️
        </button>

        {/* Modal de configuration */}
        {showApiConfig && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-6">⚙️ Configuration</h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      URL de votre API Vercel
                    </label>
                    <input
                      type="text"
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      className="w-full px-4 py-3 bg-black/30 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="https://votre-projet.vercel.app/api/generate-posts"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Agent IA (Instructions pour ChatGPT)
                    </label>
                    <textarea
                      value={agent}
                      onChange={(e) => setAgent(e.target.value)}
                      className="w-full px-4 py-3 bg-black/30 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 h-32 font-mono text-sm"
                      placeholder="Instructions pour personnaliser le comportement de l'IA..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Corrections de noms (JSON)
                    </label>
                    <textarea
                      value={nameCorrections}
                      onChange={(e) => setNameCorrections(e.target.value)}
                      className="w-full px-4 py-3 bg-black/30 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 h-32 font-mono text-sm"
                      placeholder='{"vegeta": "VEGETA", "goku": "GOKU"}'
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Format: {'"input": "OUTPUT FORMATÉ"'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Discord</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Titre Discord
                      </label>
                      <input
                        type="text"
                        value={discordTitle}
                        onChange={(e) => setDiscordTitle(e.target.value)}
                        className="w-full px-4 py-2 bg-black/30 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="Ex: 🎨 **NOUVELLE FIGURINE** 🎨"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Template Discord
                      </label>
                      <textarea
                        value={discordTemplate}
                        onChange={(e) => setDiscordTemplate(e.target.value)}
                        className="w-full px-4 py-3 bg-black/30 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 h-32 font-mono text-sm"
                        placeholder="Utilisez {title}, {name} et {message}"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Variables: {'{title}'}, {'{name}'}, {'{message}'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Instagram</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Titre Instagram
                      </label>
                      <input
                        type="text"
                        value={instagramTitle}
                        onChange={(e) => setInstagramTitle(e.target.value)}
                        className="w-full px-4 py-2 bg-black/30 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="Ex: ✨ NOUVEAUTÉ : {name} ✨"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Template Instagram
                      </label>
                      <textarea
                        value={instagramTemplate}
                        onChange={(e) => setInstagramTemplate(e.target.value)}
                        className="w-full px-4 py-3 bg-black/30 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 h-32 font-mono text-sm"
                        placeholder="Utilisez {title}, {name} et {message}"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Variables: {'{title}'}, {'{name}'}, {'{message}'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">TikTok</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Titre TikTok
                      </label>
                      <input
                        type="text"
                        value={tiktokTitle}
                        onChange={(e) => setTiktokTitle(e.target.value)}
                        className="w-full px-4 py-2 bg-black/30 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="Ex: 🔥 DROP : {name} 🔥"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Template TikTok
                      </label>
                      <textarea
                        value={tiktokTemplate}
                        onChange={(e) => setTiktokTemplate(e.target.value)}
                        className="w-full px-4 py-3 bg-black/30 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 h-32 font-mono text-sm"
                        placeholder="Utilisez {title}, {name} et {message}"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Variables: {'{title}'}, {'{name}'}, {'{message}'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveConfig}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  💾 Sauvegarder
                </button>
                <button
                  onClick={resetToDefaults}
                  className="px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all"
                >
                  🔄 Reset
                </button>
                <button
                  onClick={() => setShowApiConfig(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-600 transition-all"
                >
                  ❌ Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostGenerator;