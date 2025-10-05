import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TokenProvider from './components/auth/TokenProvider';
import AuthGuard from './components/auth/AuthGuard';
import { MantenimientoProvider } from './context/mantenimiento/MantenimientoContext';
import Home from './pages/Home';
import SignInPage from './components/auth/SignInPage';
import SignUpPage from './components/auth/SignUpPage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import GestionPersonal from './pages/GestionPersonal';
import GestionInventario from './pages/GestionInventario';
import GestionComponentesAeronave from './pages/GestionComponentesAeronave';
import DashboardMantenimiento from './pages/DashboardMantenimiento';
import GestionComponentes from './pages/GestionComponentes';
import GestionOrdenes from './pages/GestionOrdenes';
import GestionInspecciones from './pages/GestionInspecciones';
import GestionHerramientas from './pages/GestionHerramientas';
import GestionCatalogoComponentes from './pages/GestionCatalogoComponentes';
import GestionCatalogoControlMonitoreo from './pages/GestionCatalogoControlMonitoreo';
import MonitoreoFlota from './pages/MonitoreoFlota';

export default function App() {
  return (
    <TokenProvider>
      <MantenimientoProvider>
        <BrowserRouter>
      <Routes>
        {/* Página pública */}
        <Route path="/" element={<Home />} />

        {/* Páginas de autenticación */}
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />

        {/* Página protegida - solo para usuarios autenticados */}
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          }
        />

        <Route
          path="/profile"
          element={
            <AuthGuard>
              <Profile />
            </AuthGuard>
          }
        />

        <Route
          path="/personal"
          element={
            <AuthGuard>
              <GestionPersonal />
            </AuthGuard>
          }
        />

        <Route
          path="/inventario"
          element={
            <AuthGuard>
              <GestionInventario />
            </AuthGuard>
          }
        />

        {/* Nueva ruta independiente para componentes de aeronave */}
        <Route
          path="/componentes/aeronave/:matricula"
          element={
            <AuthGuard>
              <GestionComponentesAeronave />
            </AuthGuard>
          }
        />



        <Route
          path="/mantenimiento"
          element={
            <AuthGuard>
              <DashboardMantenimiento />
            </AuthGuard>
          }
        />

        <Route
          path="/mantenimiento/componentes"
          element={
            <AuthGuard>
              <GestionComponentes />
            </AuthGuard>
          }
        />

        <Route
          path="/mantenimiento/ordenes"
          element={
            <AuthGuard>
              <GestionOrdenes />
            </AuthGuard>
          }
        />

        <Route
          path="/mantenimiento/inspecciones"
          element={
            <AuthGuard>
              <GestionInspecciones />
            </AuthGuard>
          }
        />

        <Route
          path="/mantenimiento/monitoreo"
          element={
            <AuthGuard>
              <MonitoreoFlota />
            </AuthGuard>
          }
        />

        <Route
          path="/herramientas"
          element={
            <AuthGuard>
              <GestionHerramientas />
            </AuthGuard>
          }
        />

        <Route
          path="/herramientas/catalogo-componentes"
          element={
            <AuthGuard>
              <GestionCatalogoComponentes />
            </AuthGuard>
          }
        />

        <Route
          path="/herramientas/control-monitoreo"
          element={
            <AuthGuard>
              <GestionCatalogoControlMonitoreo />
            </AuthGuard>
          }
        />

        <Route
          path="/settings"
          element={
            <AuthGuard>
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Configuración</h1>
                <p className="text-gray-600">Página en construcción</p>
              </div>
            </AuthGuard>
          }
        />
      </Routes>
        </BrowserRouter>
      </MantenimientoProvider>
    </TokenProvider>
  );
}
