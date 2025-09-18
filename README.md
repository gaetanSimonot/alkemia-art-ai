# Alkemia Art AI 🎨

Générateur IA intelligent pour créer des posts marketing optimisés pour vos figurines STL sur Discord, Instagram et TikTok.

![Alkemia Art AI](https://img.shields.io/badge/React-18.2-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-blue)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)

## 🚀 Fonctionnalités

- 🤖 **IA Intelligente** - Reconnaissance automatique des personnages
- 🎯 **Multi-plateformes** - Posts optimisés pour Discord, Instagram et TikTok
- 📋 **Copie rapide** - Un clic pour copier dans le presse-papier
- ⚙️ **Configurable** - Personnalisez l'agent IA et l'API
- 🌐 **Responsive** - Interface moderne qui s'adapte à tous les écrans

## 🛠️ Structure du projet

```
alkemia-art-ai/
├── public/
│   └── index.html                 # Page HTML principale
├── src/
│   ├── components/
│   │   └── PostGenerator.js       # Composant principal
│   ├── App.js                     # Application React
│   ├── index.js                   # Point d'entrée React
│   └── index.css                  # Styles Tailwind
├── package.json                   # Dépendances et scripts
├── tailwind.config.js             # Configuration Tailwind
├── postcss.config.js              # Configuration PostCSS
├── vercel.json                    # Configuration Vercel
├── .gitignore                     # Fichiers exclus de Git
└── README.md                      # Ce fichier
```

## 🛠️ Technologies utilisées

- **React 18** - Interface utilisateur moderne
- **TailwindCSS** - Styles utilitaires
- **Lucide React** - Icônes SVG optimisées
- **Vercel** - Hébergement et déploiement

## 📦 Installation locale

1. **Cloner le repository :**
```bash
git clone <votre-repo-url>
cd alkemia-art-ai
```

2. **Installer les dépendances :**
```bash
npm install
```

3. **Lancer en développement :**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 🚀 Déploiement sur Vercel via GitHub

### Étape 1 : Préparer le repository GitHub

1. **Créer un nouveau repository GitHub :**
   - Allez sur [github.com](https://github.com)
   - Cliquez sur "New repository"
   - Nommez-le `alkemia-art-ai` (ou autre nom)
   - Sélectionnez "Public" ou "Private"
   - Ne pas initialiser avec README

2. **Pousser vers GitHub :**
```bash
# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "🎨 Initial commit - Alkemia Art AI"

# Connecter au repository GitHub
git remote add origin https://github.com/VOTRE-USERNAME/alkemia-art-ai.git

# Pousser vers GitHub
git branch -M main
git push -u origin main
```

### Étape 2 : Déployer sur Vercel

1. **Connexion à Vercel :**
   - Allez sur [vercel.com](https://vercel.com)
   - Connectez-vous avec GitHub

2. **Importer le projet :**
   - Cliquez sur "New Project"
   - Sélectionnez votre repository `alkemia-art-ai`
   - Vercel détecte automatiquement React

3. **Configuration :**
   - **Framework Preset:** Create React App (auto-détecté)
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install`

4. **Déploiement :**
   - Cliquez sur "Deploy"
   - Attendez 2-3 minutes
   - Votre app sera en ligne sur `https://alkemia-art-ai-xxx.vercel.app`

### Étape 3 : Configuration de l'API

⚠️ **Important :** Cette app nécessite une API backend pour fonctionner avec l'IA.

Vous devez :
1. Créer une API Vercel séparée avec OpenAI
2. Configurer l'URL dans les paramètres de l'app
3. Voir la section "API Backend" ci-dessous

## 🔧 API Backend requise

Cette app frontend nécessite une API pour communiquer avec l'IA. Voici la structure attendue :

**Endpoint:** `POST /api/generate-posts`

**Body:**
```json
{
  "characterName": "vegeta",
  "provider": "openai",
  "systemPrompt": "Instructions pour l'IA...",
  "userPrompt": "Prompt spécifique..."
}
```

**Réponse attendue:**
```json
{
  "formattedName": "VEGETA de Dragon Ball Z",
  "context": "Prince des Saiyans",
  "messages": {
    "discord": "Message pour Discord...",
    "instagram": "Message pour Instagram...",
    "tiktok": "Message pour TikTok..."
  }
}
```

## 📱 Utilisation

1. **Configuration initiale :**
   - Cliquez sur ⚙️ en bas à droite
   - Configurez l'URL de votre API Vercel
   - Personnalisez l'agent IA si souhaité

2. **Génération de posts :**
   - Tapez un nom de personnage (ex: "vegeta", "spider man")
   - Cliquez sur "Générer" ou appuyez sur Entrée
   - Copiez les posts générés d'un clic

## 🎯 Scripts disponibles

```bash
npm run dev      # Serveur de développement (port 3000)
npm run build    # Build de production
npm run start    # Serveur de production local
npm test         # Tests (si configurés)
```

## 🔄 Déploiements automatiques

Chaque push sur `main` redéploie automatiquement :

```bash
# Mettre à jour l'app
git add .
git commit -m "✨ Nouvelles fonctionnalités"
git push origin main
```

## 🎨 Personnalisation

### Agent IA
Modifiez le comportement de l'IA dans les paramètres :
- Ton et style des messages
- Références culturelles
- Format des hashtags
- Spécificités par plateforme

### Styles
Modifiez `src/index.css` et les classes Tailwind dans les composants.

## 🐛 Dépannage

**Erreurs courantes :**

1. **"API non configurée" :**
   - Configurez l'URL API dans ⚙️ Paramètres
   - Vérifiez que votre API backend fonctionne

2. **"Erreur CORS" :**
   - Ajoutez votre domaine Vercel dans les CORS de l'API
   - Vérifiez les headers `Access-Control-Allow-Origin`

3. **Build failed :**
   - Vérifiez `package.json` et les dépendances
   - Contrôlez les imports React manquants

4. **Styles cassés :**
   - Vérifiez `tailwind.config.js`
   - Contrôlez `postcss.config.js`

## 🌐 Variables d'environnement

Pour des configurations avancées, ajoutez dans Vercel :

- `REACT_APP_API_URL` - URL par défaut de l'API
- `REACT_APP_DEFAULT_AGENT` - Agent par défaut

## 📄 Licence

MIT - Libre d'utilisation et modification.

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature
3. Commitez vos changes
4. Push vers la branche
5. Ouvrez une Pull Request

---

**🎨 Créé avec React & TailwindCSS | 🚀 Déployé sur Vercel**