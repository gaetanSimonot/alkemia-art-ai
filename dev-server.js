const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

// API Routes pour les fonctionnalités avancées
app.post('/api/speech-to-text', (req, res) => {
  // Simulation de la conversion speech-to-text
  // Dans une vraie implémentation, on utiliserait l'API Google Speech ou Azure
  setTimeout(() => {
    res.json({
      transcript: `Transcription simulée : "${req.body.mockText || 'Note vocale convertie en texte'}"`,
      confidence: 0.95
    });
  }, 1000);
});

app.post('/api/chatgpt-correct', (req, res) => {
  // Simulation de correction ChatGPT
  // Dans une vraie implémentation, on utiliserait l'API OpenAI
  const { text } = req.body;
  setTimeout(() => {
    res.json({
      correctedText: text.charAt(0).toUpperCase() + text.slice(1).replace(/\s+/g, ' ').trim(),
      suggestions: ["Améliorer la ponctuation", "Clarifier le message"]
    });
  }, 800);
});

app.post('/api/save-backup', (req, res) => {
  // Simulation de sauvegarde cloud
  const { data } = req.body;
  setTimeout(() => {
    res.json({
      success: true,
      backupId: `backup_${Date.now()}`,
      message: 'Données sauvegardées avec succès'
    });
  }, 1500);
});

app.get('/api/categories', (req, res) => {
  // API pour récupérer les catégories sauvegardées
  res.json({
    categories: [
      {
        id: 'travail',
        name: 'Travail',
        emoji: '💼',
        color: '#3B82F6',
        importance: 5,
        notes: []
      }
    ]
  });
});

// Servir l'application React pour toutes les autres routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur de développement démarré sur le port ${PORT}`);
  console.log(`📱 Application : http://localhost:${PORT}`);
  console.log(`🧠 Mind Map Notes : http://localhost:${PORT}/mindmap`);
  console.log(`🎨 Banner Editor : http://localhost:${PORT}/banner-editor`);
  console.log(`\n🔧 APIs disponibles :`);
  console.log(`   • POST /api/speech-to-text - Conversion vocale`);
  console.log(`   • POST /api/chatgpt-correct - Correction IA`);
  console.log(`   • POST /api/save-backup - Sauvegarde cloud`);
  console.log(`   • GET  /api/categories - Récupération données`);
});

module.exports = app;