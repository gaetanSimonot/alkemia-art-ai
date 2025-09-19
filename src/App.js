import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Brain, Palette, Home } from 'lucide-react';
import PostGenerator from './components/PostGenerator';
import MindMapNotes from './components/MindMapNotes';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navigation intégrée et responsive */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">🎨</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-white font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Alkemia Art Tool
                  </h1>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center space-x-1">
                <Link
                  to="/"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-all text-white text-sm font-medium group"
                >
                  <Home size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Accueil</span>
                </Link>

                <Link
                  to="/mindmap"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-all text-white text-sm font-medium group"
                >
                  <Brain size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Mind Map</span>
                </Link>

                <Link
                  to="/banner-editor"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-all text-white text-sm font-medium group"
                >
                  <Palette size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Éditeur</span>
                </Link>
              </div>
            </div>
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