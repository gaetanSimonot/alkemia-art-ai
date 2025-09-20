import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

const PasswordProtection = ({ onPasswordCorrect }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const correctPassword = 'MDP123!';

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulation d'un petit délai pour l'authentification
    setTimeout(() => {
      if (password === correctPassword) {
        onPasswordCorrect();
      } else {
        setError('Mot de passe incorrect');
        setPassword('');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Zone Protégée
          </h1>
          <p className="text-gray-300 text-sm">
            Entrez le mot de passe pour accéder au Mind Map
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 pr-12 bg-black/30 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                placeholder="Entrez votre mot de passe"
                autoFocus
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!password.trim() || isLoading}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/25"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Vérification...</span>
              </>
            ) : (
              <>
                <Lock size={20} />
                <span>Accéder</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-xs text-gray-400 text-center">
            Cette section contient des données sensibles et nécessite une authentification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordProtection;