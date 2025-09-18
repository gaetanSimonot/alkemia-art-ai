# 🧠 Mind Map Notes - App de Prise de Notes Vocales

Une application moderne de prise de notes avec interface Mind Map interactive, intégrée au site Alkemia Art.

## 🚀 Fonctionnalités Principales

### 🧠 Interface Mind Map Interactive
- **Hub central** avec micro pour enregistrement
- **Catégories bulles colorées** connectées visuellement
- **Drag & drop fluide** : viewport et bulles individuelles
- **Zoom/dézoom** avec molette vers position souris
- **Connexions animées** entre catégories liées

### 📱 Modes d'Affichage Intelligents
- **Vue Mind Map** : bulles en cercle, tailles selon importance
- **Vue Liste** : tri alphabétique/récent, tailles uniformes
- **Filtres** : Importance, Nombre de fichiers, Alphabétique, Récent
- **Contrôle taille globale** avec slider

### 🎤 Système de Notes Multimodal
- **Note vocale** : Web Audio API + Speech-to-Text simulé
- **Note texte** : saisie rapide clavier
- **Photo** : upload fichier + capture caméra mobile
- **Sélection catégorie obligatoire** avant ajout
- **Notifications visuelles** au centre

### 🎨 Design Moderne
- **4 Thèmes** : Dark, Ocean, Sunset, Forest
- **Effets glassmorphisme** et dégradés
- **Animations fluides** (pulse, scale, flow)
- **Interface responsive** mobile/desktop
- **Contrôles intuitifs** avec icônes Lucide

## 📁 Structure de l'Application

```
src/
├── components/
│   ├── PostGenerator.js      # Page principale existante
│   ├── KonvaBannerEditor.js  # Éditeur de bannières
│   └── MindMapNotes.js       # ⭐ Nouvelle app Mind Map
├── App.js                    # Router avec navigation
└── index.js                  # Point d'entrée
```

## 🛠️ Technologies Utilisées

- **React 18** : Framework principal
- **React-Konva** : Canvas interactif pour les bulles
- **React Router** : Navigation entre pages
- **Lucide React** : Icônes modernes
- **TailwindCSS** : Styles utilitaires
- **Web Audio API** : Enregistrement vocal
- **IndexedDB** (à implémenter) : Stockage local

## 🎯 Données Exemple Pré-remplies

8 catégories avec connexions logiques :
- 💼 **Travail** (5/5) → connecté à Réunions, Projets
- 🏠 **Personnel** (4/5) → connecté à Famille, Santé
- 💡 **Idées** (5/5) → connecté à Projets, Créatif
- 🚀 **Projets** (5/5)
- 👨‍👩‍👧‍👦 **Famille** (3/5)
- 🏃‍♀️ **Santé** (4/5)
- 🎨 **Créatif** (3/5)
- 👥 **Réunions** (4/5)

## 🎛️ Interface Utilisateur

### Navigation (Coin supérieur gauche)
- 🏠 **Accueil** : Page principale avec PostGenerator
- 🧠 **Mind Map** : Application de notes vocales
- 🎨 **Éditeur** : Éditeur de bannières Konva

### Contrôles Sidebar Gauche
- **Slider taille globale** : 50%-200%
- **Toggle connexions** : Afficher/masquer les liens
- **Sélecteur tri** : Importance/Notes/Alpha/Récent
- **Sélecteur thème** : 4 thèmes disponibles

### Panel Info Droite (quand catégorie sélectionnée)
- **Détails catégorie** : Emoji, nom, statistiques
- **Liste des notes** : Avec type (🎤📝📷) et date
- **Actions rapides** : Éditer, supprimer (à implémenter)

### Boutons d'Action (Bas d'écran)
- 📝 **Note Texte** (bleu) : Ouvre modal de saisie
- 🎤 **Note Vocale** (rouge, plus gros) : Animation pulse pendant enregistrement
- 📷 **Photo** (vert) : Input file caché pour upload

## 🚀 Démarrage Rapide

### Mode Développement React
```bash
npm start
# Ouvre http://localhost:3000
```

### Serveur de Développement avec APIs
```bash
npm run dev-server
# Build + serveur sur http://localhost:3001
# APIs simulées disponibles
```

### Build Production
```bash
npm run build
npm run serve
```

## 🔧 APIs de Développement

Le serveur de développement (`dev-server.js`) fournit des APIs simulées :

- **POST /api/speech-to-text** : Conversion vocale en texte
- **POST /api/chatgpt-correct** : Correction IA du texte
- **POST /api/save-backup** : Sauvegarde cloud simulée
- **GET /api/categories** : Récupération des données

## 📱 Utilisation

1. **Naviguer** : Utilisez le menu en haut à gauche pour aller à Mind Map
2. **Sélectionner** : Cliquez sur une bulle pour la sélectionner
3. **Noter** : Utilisez les boutons en bas pour ajouter des notes
4. **Organiser** : Glissez les bulles pour réorganiser
5. **Zoomer** : Molette de souris pour naviguer
6. **Thèmes** : Changez l'ambiance avec le sélecteur en haut

## 🎨 Thèmes Disponibles

- **Dark** : Sombre et moderne (par défaut)
- **Ocean** : Tons bleus profonds
- **Sunset** : Dégradés chauds orange/bleu
- **Forest** : Vert nature

## 🔮 Fonctionnalités Futures

- **IndexedDB** pour persistance locale
- **Vraie API Speech-to-Text** (Google/Azure)
- **Intégration ChatGPT** pour correction
- **Sauvegarde Google Drive**
- **Export JSON/Markdown**
- **Notifications push**
- **Mode collaboration temps réel**

## 📊 Performance

- **Optimisé 60fps** avec React-Konva
- **Lazy loading** des composants lourds
- **Debounced search** pour les filtres
- **Animations CSS/JS** fluides
- **Responsive** mobile et desktop

## 🎯 Navigation du Site

- `/` - PostGenerator (page principale)
- `/mindmap` - Mind Map Notes (nouvelle app)
- `/banner-editor` - Éditeur de bannières (même que page principale)

L'app s'intègre parfaitement dans le site existant avec un design cohérent et une navigation fluide !