import React, { useState, useEffect } from 'react';
import PasswordProtection from './PasswordProtection';
import MindMapNotes from './MindMapNotes';
import FluidMobileMindMap from './FluidMobileMindMap';

const ProtectedMindMap = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Vérifier si l'utilisateur est déjà authentifié (session) et détecter mobile
  useEffect(() => {
    const checkAuth = () => {
      const authTime = localStorage.getItem('mindmap_auth_time');
      const authStatus = localStorage.getItem('mindmap_authenticated');

      if (authStatus === 'true' && authTime) {
        const now = new Date().getTime();
        const authTimestamp = parseInt(authTime);
        const oneHour = 60 * 60 * 1000; // 1 heure en millisecondes

        // Session expire après 1 heure
        if (now - authTimestamp < oneHour) {
          setIsAuthenticated(true);
        } else {
          // Session expirée, nettoyer
          localStorage.removeItem('mindmap_auth_time');
          localStorage.removeItem('mindmap_authenticated');
        }
      }
      setIsLoading(false);
    };

    const checkIfMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                           || window.innerWidth <= 768
                           || 'ontouchstart' in window;
      setIsMobile(isMobileDevice);
    };

    checkAuth();
    checkIfMobile();

    // Écouter les changements de taille d'écran
    const handleResize = () => checkIfMobile();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePasswordCorrect = () => {
    setIsAuthenticated(true);
    // Sauvegarder l'état d'authentification avec timestamp
    localStorage.setItem('mindmap_authenticated', 'true');
    localStorage.setItem('mindmap_auth_time', new Date().getTime().toString());
  };

  // Fonction pour déconnecter (optionnelle, peut être ajoutée plus tard)
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('mindmap_auth_time');
    localStorage.removeItem('mindmap_authenticated');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PasswordProtection onPasswordCorrect={handlePasswordCorrect} />;
  }

  // Choisir le composant approprié selon la plateforme
  return isMobile ? <FluidMobileMindMap onLogout={handleLogout} /> : <MindMapNotes onLogout={handleLogout} />;
};

export default ProtectedMindMap;