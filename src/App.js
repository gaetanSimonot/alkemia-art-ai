import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Brain, Palette, Home } from 'lucide-react';
import PostGenerator from './components/PostGenerator';
import MindMapNotes from './components/MindMapNotes';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navigation Responsive */}
        <nav className="fixed top-4 left-4 right-4 md:right-auto z-50">
          <div className="flex items-center justify-between md:justify-start gap-2 md:gap-3 p-2 md:p-3 bg-black/20 backdrop-blur-lg rounded-2xl border border-white/20">
            <Link
              to="/"
              className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-xl hover:bg-white/10 transition-all text-white text-xs md:text-sm font-semibold"
            >
              <Home size={16} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden sm:inline">Accueil</span>
            </Link>

            <Link
              to="/mindmap"
              className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-xl hover:bg-white/10 transition-all text-white text-xs md:text-sm font-semibold"
            >
              <Brain size={16} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden sm:inline">Mind Map</span>
            </Link>

            <Link
              to="/banner-editor"
              className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-xl hover:bg-white/10 transition-all text-white text-xs md:text-sm font-semibold"
            >
              <Palette size={16} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden sm:inline">Éditeur</span>
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