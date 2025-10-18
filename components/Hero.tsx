'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClientOnly } from './lib/ClientOnly';

export default function Hero() {
  const [particles, setParticles] = useState<Array<{id: number, left: number, top: number, delay: number, duration: number}>>([]);
  const router = useRouter();

  useEffect(() => {
    // Generate particles only on client side after mounting
    // Use a deterministic seed to ensure consistent generation
    const seed = 12345; // Fixed seed for consistent generation
    const generatedParticles = [...Array(20)].map((_, i) => {
      // Simple pseudo-random function using seed and index
      const random = (seed: number, index: number) => {
        const x = Math.sin(seed + index) * 10000;
        return x - Math.floor(x);
      };
      
      return {
        id: i,
        left: random(seed, i) * 100,
        top: random(seed, i + 100) * 100,
        delay: random(seed, i + 200) * 2,
        duration: 3 + random(seed, i + 300) * 4
      };
    });
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
        <ClientOnly>
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
        </ClientOnly>
      </div>

      {/* Main Content */}
      <section className="relative min-h-screen flex items-center justify-center px-8">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
        
        {/* Central Content */}
        <div className="relative z-10 text-center max-w-6xl mx-auto transition-all duration-1000 opacity-100 translate-y-0">
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
          <div className="flex justify-center items-center">
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
    </div>
  );
}
