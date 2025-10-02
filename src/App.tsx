import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import TokenProvider from './components/auth/TokenProvider';
import { MantenimientoProvider } from './context/mantenimiento/MantenimientoContext';

// Configuración de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 segundos - datos considerados frescos
      cacheTime: 5 * 60 * 1000, // 5 minutos - tiempo en cache antes de garbage collection
      refetchOnWindowFocus: false, // No refetch automático al volver a la ventana
      retry: 1, // Reintentar 1 vez en caso de error
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
  },
});
import Home from './pages/Home';
import SignInPage from './components/auth/SignInPage';
import SignUpPage from './components/auth/SignUpPage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import GestionPersonal from './pages/GestionPersonal';
import GestionInventario from './pages/GestionInventario';
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
    <QueryClientProvider client={queryClient}>
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
            <>
              <SignedIn>
                <Dashboard />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/profile"
          element={
            <>
              <SignedIn>
                <Profile />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/personal"
          element={
            <>
              <SignedIn>
                <GestionPersonal />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/inventario"
          element={
            <>
              <SignedIn>
                <GestionInventario />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />



        <Route
          path="/mantenimiento"
          element={
            <>
              <SignedIn>
                <DashboardMantenimiento />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/mantenimiento/componentes"
          element={
            <>
              <SignedIn>
                <GestionComponentes />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/mantenimiento/ordenes"
          element={
            <>
              <SignedIn>
                <GestionOrdenes />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/mantenimiento/inspecciones"
          element={
            <>
              <SignedIn>
                <GestionInspecciones />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/mantenimiento/monitoreo"
          element={
            <>
              <SignedIn>
                <MonitoreoFlota />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/herramientas"
          element={
            <>
              <SignedIn>
                <GestionHerramientas />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/herramientas/catalogo-componentes"
          element={
            <>
              <SignedIn>
                <GestionCatalogoComponentes />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/herramientas/control-monitoreo"
          element={
            <>
              <SignedIn>
                <GestionCatalogoControlMonitoreo />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/settings"
          element={
            <>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
      </Routes>
          </BrowserRouter>
        </MantenimientoProvider>
      </TokenProvider>
      {/* React Query DevTools - solo en desarrollo */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
