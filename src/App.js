import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Brain, Palette, Home } from 'lucide-react';
import PostGenerator from './components/PostGenerator';
import MindMapNotes from './components/MindMapNotes';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navigation */}
        <nav className="fixed top-4 left-4 z-50">
          <div className="flex items-center gap-3 p-3 bg-black/20 backdrop-blur-lg rounded-2xl border border-white/20">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 transition-all text-white text-sm font-semibold"
            >
              <Home size={18} />
              <span>Accueil</span>
            </Link>

            <Link
              to="/mindmap"
              className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 transition-all text-white text-sm font-semibold"
            >
              <Brain size={18} />
              <span>Mind Map</span>
            </Link>

            <Link
              to="/banner-editor"
              className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 transition-all text-white text-sm font-semibold"
            >
              <Palette size={18} />
              <span>Éditeur</span>
            </Link>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<PostGenerator />} />
          <Route path="/mindmap" element={<MindMapNotes />} />
          <Route path="/banner-editor" element={<PostGenerator />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;