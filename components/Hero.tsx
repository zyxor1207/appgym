'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Hero() {
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, left: number, top: number, delay: number, duration: number}>>([]);
  const router = useRouter();

  useEffect(() => {
    setIsLoaded(true);
    // Generate particles only on client side
    const generatedParticles = [...Array(20)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 4
    }));
    setParticles(generatedParticles);
  }, []);

  const handleStartTraining = () => {
    router.push('/usuarios');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        {/* Animated grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 animate-grid-move" style={{
            backgroundImage: `linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60 animate-float"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <section className="relative min-h-screen flex items-center justify-center px-8">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
        
        {/* Central Content */}
        <div className={`relative z-10 text-center max-w-6xl mx-auto transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Brand Logo */}
          <div className="mb-16">
            <div className="inline-block mb-8 group">
              <div className="relative w-24 h-24 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl shadow-2xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 group-hover:rotate-6 animate-glow">
                <div className="w-16 h-16 bg-gradient-to-br from-white to-gray-200 rounded-xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/50 to-purple-600/50 rounded-2xl blur-xl animate-pulse-glow"></div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 tracking-wider uppercase mb-4">
              Garage Fitness Club
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto rounded-full"></div>
          </div>

          {/* Main Title */}
          <div className="mb-16">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-white leading-tight tracking-wide">
              <span className="inline-block transform hover:scale-105 transition-transform duration-300">TRANSFORMA</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 font-black">
                TU CUERPO
              </span>
            </h2>
          </div>

          {/* Subtitle */}
          <div className="mb-16">
            <p className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed max-w-3xl mx-auto">
              <span className="text-cyan-400 font-semibold">Descubre tu potencial infinito</span>
              <br />
              <span className="text-white font-medium text-2xl">
                Tu mejor versión te espera
              </span>
            </p>
          </div>

          {/* Feature Icons */}
          <div className="mb-16 flex justify-center space-x-8 md:space-x-12">
            {[
              { icon: '💪', text: 'Fuerza' },
              { icon: '🏃', text: 'Cardio' },
              { icon: '🧘', text: 'Flexibilidad' },
              { icon: '⚡', text: 'Energía' }
            ].map((feature, index) => (
              <div key={index} className="group flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform duration-300 group-hover:bg-gradient-to-br group-hover:from-cyan-500 group-hover:to-blue-500">
                  {feature.icon}
                </div>
                <span className="text-sm text-gray-400 group-hover:text-cyan-400 transition-colors duration-300">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <button
              onClick={handleStartTraining}
              className="group relative bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500 px-12 py-6 rounded-2xl text-xl font-bold transition-all transform hover:scale-105 shadow-2xl hover:shadow-cyan-500/25 border border-cyan-400/30 hover:border-cyan-300/50 animate-glow"
            >
              <span className="relative z-10 flex items-center justify-center">
                Comenzar Entrenamiento
                <svg className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-2xl blur-xl animate-pulse-glow"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-purple-600/30 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            <button
              onClick={() => setShowMembershipModal(true)}
              className="group bg-transparent border-2 border-cyan-400 hover:bg-cyan-400/10 px-12 py-6 rounded-2xl text-xl font-semibold transition-all transform hover:scale-105 text-cyan-400 hover:text-white"
            >
              Ver Membresías
            </button>
          </div>
        </div>

        {/* Animated floating elements */}
        <div className="absolute top-20 left-20 opacity-20 group">
          <div className="w-16 h-16 border-2 border-cyan-400 rounded-lg rotate-45 group-hover:rotate-90 transition-transform duration-1000"></div>
        </div>
        <div className="absolute top-40 right-20 opacity-20 group">
          <div className="w-12 h-12 border-2 border-purple-400 rounded-full group-hover:scale-125 transition-transform duration-1000"></div>
        </div>
        <div className="absolute bottom-20 left-20 opacity-20 group">
          <div className="w-14 h-14 border-2 border-blue-400 rounded-lg group-hover:rotate-45 transition-transform duration-1000"></div>
        </div>
        <div className="absolute bottom-40 right-20 opacity-20 group">
          <div className="w-10 h-10 border-2 border-cyan-400 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
        </div>
      </section>

      {/* Membership Cards Modal */}
      {showMembershipModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-3xl p-8 w-full max-w-6xl mx-4 border border-cyan-400/30 shadow-2xl relative my-8">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-2xl"></div>
            </div>
            
            {/* Header */}
            <div className="relative z-10 text-center mb-12">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-glow">
                <span className="text-3xl">💪</span>
              </div>
              <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-4">
                Membresías Garage Fitness Club
              </h3>
              <p className="text-xl text-gray-300">Elige el plan que mejor se adapte a tus objetivos</p>
            </div>
            
            {/* Pricing Cards */}
            <div className="relative z-10 grid md:grid-cols-3 gap-8 mb-8">
              {/* Plan Día */}
              <div className="group bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-600/70 hover:border-cyan-400/70 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">☀️</span>
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">Plan Día</h4>
                  <p className="text-gray-400 mb-6">Acceso por un día completo</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">$50</span>
                    <span className="text-gray-400 ml-2">MXN</span>
                  </div>
                  <ul className="text-left text-gray-300 space-y-2">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
                      Acceso completo al gimnasio
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
                      Uso de todos los equipos
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
                      Área de cardio y pesas
                    </li>
                  </ul>
                </div>
              </div>

              {/* Plan Semanal */}
              <div className="group bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-600/70 hover:border-blue-400/70 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                    MÁS POPULAR
                  </span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">📅</span>
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">Plan Semanal</h4>
                  <p className="text-gray-400 mb-6">Acceso por 7 días completos</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">$300</span>
                    <span className="text-gray-400 ml-2">MXN</span>
                    <div className="text-sm text-green-400 mt-1">Ahorra $50 vs plan día</div>
                  </div>
                  <ul className="text-left text-gray-300 space-y-2">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                      Acceso completo al gimnasio
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                      Uso de todos los equipos
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                      Área de cardio y pesas
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                      Acceso a clases grupales
                    </li>
                  </ul>
                </div>
              </div>

              {/* Plan Mensual */}
              <div className="group bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-600/70 hover:border-purple-400/70 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">Plan Mensual</h4>
                  <p className="text-gray-400 mb-6">Acceso por 30 días completos</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">$800</span>
                    <span className="text-gray-400 ml-2">MXN</span>
                    <div className="text-sm text-green-400 mt-1">Ahorra $700 vs plan día</div>
                  </div>
                  <ul className="text-left text-gray-300 space-y-2">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                      Acceso completo al gimnasio
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                      Uso de todos los equipos
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                      Área de cardio y pesas
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                      Acceso a clases grupales
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                      Consulta nutricional incluida
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Back to Main Page Button */}
            <div className="relative z-10 text-center mt-12">
              <button
                onClick={() => setShowMembershipModal(false)}
                className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500 px-16 py-6 rounded-2xl text-2xl font-bold transition-all transform hover:scale-105 text-white shadow-2xl hover:shadow-cyan-500/30 border-2 border-cyan-400/50 hover:border-cyan-300/70 animate-glow"
              >
                <span className="flex items-center justify-center">
                  <svg className="mr-4 w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver a la Página Principal
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
