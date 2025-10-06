'use client';

import { useState } from 'react';
import Hero from '../components/Hero';
import AdminSystem from '../components/AdminSystem';

export default function Home() {
  const [showAdmin, setShowAdmin] = useState(false);

  if (showAdmin) {
    return (
      <div>
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Sistema Administrativo - Garage Fitness Club</h1>
          <button
            onClick={() => setShowAdmin(false)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            Volver a la Página Principal
          </button>
        </div>
        <AdminSystem />
      </div>
    );
  }

  return (
    <div>
      {/* Botón flotante para acceder al admin */}
      <button
        onClick={() => setShowAdmin(true)}
        className="fixed bottom-6 right-6 bg-gray-800 hover:bg-gray-900 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-105 z-50"
        title="Acceder al Sistema Administrativo"
      >
        <span className="text-2xl">⚙️</span>
      </button>
      <Hero />
    </div>
  );
}
