'use client';

import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import AdminSystem from '../components/AdminSystem';
import SupabaseProbe from '../components/SupabaseProbe';

export default function Home() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdminAuthed, setIsAdminAuthed] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('adminAuth');
    setIsAdminAuthed(stored === 'true');
  }, []);

  const handleOpenAdmin = () => {
    if (isAdminAuthed) {
      setShowAdmin(true);
    } else {
      setShowLogin(true);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminAuth');
    }
    setIsAdminAuthed(false);
    setShowAdmin(false);
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError('');
    const ADMIN_USER = 'dueno';
    const ADMIN_PASS = 'gym2025';
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('adminAuth', 'true');
      }
      setIsAdminAuthed(true);
      setShowLogin(false);
      setUsername('');
      setPassword('');
      setShowAdmin(true);
    } else {
      setLoginError('Usuario o contraseña incorrectos');
    }
  };

  if (showAdmin) {
    return (
      <div>
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Sistema Administrativo - Garage Fitness Club</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
            >
              Cerrar sesión
            </button>
            <button
              onClick={handleLogout}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              Volver a la Página Principal
            </button>
          </div>
        </div>
        <AdminSystem />
      </div>
    );
  }

  return (
    <div>
      {/* Botón flotante para acceder al admin */}
      <button
        onClick={handleOpenAdmin}
        className="fixed bottom-6 right-6 bg-gray-800 hover:bg-gray-900 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-105 z-50"
        title="Acceder al Sistema Administrativo"
      >
        <span className="text-2xl">⚙️</span>
      </button>
      <Hero />
      <SupabaseProbe />

      {showLogin && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Acceso Administrativo</h2>
            <p className="text-gray-500 mb-6">Inicia sesión para ver pagos y gestión</p>
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {loginError && (
                  <div className="text-red-600 text-sm">{loginError}</div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Ingresar
                </button>
                <button
                  type="button"
                  onClick={() => { setShowLogin(false); setUsername(''); setPassword(''); setLoginError(''); }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
            <div className="mt-4 text-xs text-gray-500">
              Consejo: Usuario <span className="font-medium">dueno</span> · Contraseña <span className="font-medium">gym2025</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
