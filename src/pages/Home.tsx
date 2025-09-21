import React from 'react';
import AuthButtons from '../components/auth/AuthButtons';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header/Navigation */}
      <header className="backdrop-blur-sm bg-slate-900/50 border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">SC</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">COEAM23</h1>
                <p className="text-xs text-blue-300">Control de Mantenimiento</p>
              </div>
            </div>
            <AuthButtons />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center space-y-8">
            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                SISTEMA DE CONTROL
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  DE MANTENIMIENTO
                </span>
                <br />
                <span className="text-blue-300">COEAM23</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Plataforma integral para la gestión y control de mantenimiento aeronáutico
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Gestión de Inventario</h3>
                <p className="text-slate-400">Control completo de componentes y herramientas de mantenimiento</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Órdenes de Trabajo</h3>
                <p className="text-slate-400">Planificación y seguimiento de tareas de mantenimiento</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Panel de Control</h3>
                <p className="text-slate-400">Dashboard con métricas y reportes en tiempo real</p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="mt-16 pt-8 border-t border-slate-700">
              <p className="text-slate-400 mb-6">Accede al sistema para comenzar</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl">
                  Iniciar Sesión
                </button>
                <button className="px-8 py-3 bg-transparent border border-slate-600 text-slate-300 rounded-lg font-semibold hover:bg-slate-800/50 hover:border-slate-500 transition-all duration-300">
                  Más Información
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl"></div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-slate-400 text-sm">
              © 2025 COEAM23 - Sistema de Control de Mantenimiento. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
