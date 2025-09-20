'use client';

import { useState } from 'react';

export default function Hero() {
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <span className="text-3xl mr-3">💪</span>
              <h1 className="text-2xl font-bold">PowerGym</h1>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#inicio" className="hover:text-blue-300 transition-colors">Inicio</a>
              <a href="#servicios" className="hover:text-blue-300 transition-colors">Servicios</a>
              <a href="#membresias" className="hover:text-blue-300 transition-colors">Membresías</a>
              <a href="#contacto" className="hover:text-blue-300 transition-colors">Contacto</a>
            </div>
            <button
              onClick={() => setShowMembershipModal(true)}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Únete Ahora
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            TRANSFORMA TU CUERPO
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300">
            El gimnasio más moderno y equipado de la ciudad. 
            <br />
            <span className="text-blue-400 font-semibold">¡Tu mejor versión te espera!</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowMembershipModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
            >
              🏋️ Comenzar Entrenamiento
            </button>
            <button
              onClick={() => setShowContactModal(true)}
              className="border-2 border-white/30 hover:border-white/60 px-8 py-4 rounded-lg text-lg font-semibold transition-all"
            >
              📞 Contactar
            </button>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 text-6xl opacity-20 animate-bounce">🏋️‍♂️</div>
        <div className="absolute top-40 right-20 text-4xl opacity-20 animate-pulse">💪</div>
        <div className="absolute bottom-20 left-20 text-5xl opacity-20 animate-bounce delay-1000">🏃‍♂️</div>
        <div className="absolute bottom-40 right-10 text-4xl opacity-20 animate-pulse delay-500">🥊</div>
      </section>

      {/* Features Section */}
      <section id="servicios" className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">¿Por qué elegir PowerGym?</h2>
            <p className="text-xl text-gray-300">Equipamiento de última generación y entrenadores certificados</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 text-center hover:bg-white/15 transition-all">
              <div className="text-5xl mb-4">🏋️‍♀️</div>
              <h3 className="text-2xl font-semibold mb-4">Equipamiento Premium</h3>
              <p className="text-gray-300">Máquinas de última generación y pesas libres para todos los niveles</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 text-center hover:bg-white/15 transition-all">
              <div className="text-5xl mb-4">👨‍💼</div>
              <h3 className="text-2xl font-semibold mb-4">Entrenadores Certificados</h3>
              <p className="text-gray-300">Personal trainers profesionales para guiarte en tu transformación</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 text-center hover:bg-white/15 transition-all">
              <div className="text-5xl mb-4">🕐</div>
              <h3 className="text-2xl font-semibold mb-4">Horarios Flexibles</h3>
              <p className="text-gray-300">Abierto 24/7 para que entrenes cuando mejor te convenga</p>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Section */}
      <section id="membresias" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Planes de Membresía</h2>
            <p className="text-xl text-gray-300">Elige el plan que mejor se adapte a tus objetivos</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Plan Básico */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 text-center hover:bg-white/15 transition-all">
              <h3 className="text-2xl font-semibold mb-4">Plan Día</h3>
              <div className="text-4xl font-bold mb-4 text-blue-400">$50</div>
              <p className="text-gray-300 mb-6">Acceso por 24 horas</p>
              <ul className="text-left space-y-2 mb-8">
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Acceso a todas las áreas
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Equipamiento completo
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Duchas y lockers
                </li>
              </ul>
              <button
                onClick={() => setShowMembershipModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition-colors"
              >
                Seleccionar
              </button>
            </div>

            {/* Plan Popular */}
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-lg p-8 border-2 border-blue-400 text-center hover:from-blue-600/30 hover:to-purple-600/30 transition-all transform scale-105">
              <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4 inline-block">
                MÁS POPULAR
              </div>
              <h3 className="text-2xl font-semibold mb-4">Plan Mensual</h3>
              <div className="text-4xl font-bold mb-4 text-blue-400">$800</div>
              <p className="text-gray-300 mb-6">Acceso ilimitado por 30 días</p>
              <ul className="text-left space-y-2 mb-8">
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Acceso 24/7
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Clases grupales incluidas
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Consulta nutricional
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Invitado gratis 1 vez
                </li>
              </ul>
              <button
                onClick={() => setShowMembershipModal(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 rounded-lg font-semibold transition-colors"
              >
                Seleccionar
              </button>
            </div>

            {/* Plan Premium */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 text-center hover:bg-white/15 transition-all">
              <h3 className="text-2xl font-semibold mb-4">Plan Semanal</h3>
              <div className="text-4xl font-bold mb-4 text-blue-400">$300</div>
              <p className="text-gray-300 mb-6">Acceso por 7 días</p>
              <ul className="text-left space-y-2 mb-8">
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Acceso a todas las áreas
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Equipamiento completo
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Duchas y lockers
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Clases grupales
                </li>
              </ul>
              <button
                onClick={() => setShowMembershipModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition-colors"
              >
                Seleccionar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">¿Listo para comenzar?</h2>
            <p className="text-xl text-gray-300">Contáctanos y da el primer paso hacia tu transformación</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Información de Contacto</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-4">📍</span>
                  <div>
                    <p className="font-semibold">Dirección</p>
                    <p className="text-gray-300">Av. Principal 123, Centro de la Ciudad</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-4">📞</span>
                  <div>
                    <p className="font-semibold">Teléfono</p>
                    <p className="text-gray-300">+52 55 1234 5678</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-4">✉️</span>
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-gray-300">info@powergym.com</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-4">🕐</span>
                  <div>
                    <p className="font-semibold">Horarios</p>
                    <p className="text-gray-300">Lunes a Domingo: 24/7</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold mb-6">Envíanos un mensaje</h3>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Tu nombre"
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Tu email"
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                <textarea
                  placeholder="Tu mensaje"
                  rows={4}
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
                ></textarea>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-lg font-semibold transition-colors"
                >
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <span className="text-2xl mr-2">💪</span>
              <span className="text-xl font-bold">PowerGym</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-300 mb-2">© 2024 PowerGym. Todos los derechos reservados.</p>
              <p className="text-sm text-gray-400">Transformando vidas, un entrenamiento a la vez.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Membership Modal */}
      {showMembershipModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md mx-4">
            <h3 className="text-2xl font-semibold mb-6 text-center">¡Únete a PowerGym!</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre completo"
                className="w-full p-4 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full p-4 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="tel"
                placeholder="Teléfono"
                className="w-full p-4 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              <select className="w-full p-4 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none">
                <option value="">Selecciona tu plan</option>
                <option value="day">Plan Día - $50 MXN</option>
                <option value="week">Plan Semanal - $300 MXN</option>
                <option value="month">Plan Mensual - $800 MXN</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowMembershipModal(false)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 rounded-lg font-semibold transition-colors"
              >
                ¡Registrarme!
              </button>
              <button
                onClick={() => setShowMembershipModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md mx-4">
            <h3 className="text-2xl font-semibold mb-6 text-center">Contáctanos</h3>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-lg mb-2">📞 <strong>+52 55 1234 5678</strong></p>
                <p className="text-lg mb-2">✉️ <strong>info@powergym.com</strong></p>
                <p className="text-lg mb-4">📍 <strong>Av. Principal 123, Centro</strong></p>
              </div>
              <div className="text-center">
                <p className="text-gray-300 mb-4">¡Estamos aquí para ayudarte!</p>
                <p className="text-sm text-gray-400">Horarios: 24/7 todos los días</p>
              </div>
            </div>
            <button
              onClick={() => setShowContactModal(false)}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
