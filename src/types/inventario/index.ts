// Re-export all inventory types for backward compatibility
export * from '../inventario';

// Additional types for modular components
export interface IVistaInventario {
  vistaComponentes: boolean;
  aeronaveSeleccionada: IAeronave | null;
  vistaEnTarjetas: boolean;
  busqueda: string;
}

export interface IFormularioInventario {
  mostrarFormulario: boolean;
  aeronaveEditando: IAeronave | null;
  formulario: ICrearAeronaveData;
}

export interface IAeronaveCardProps {
  aeronave: IAeronave;
  onVerComponentes: (aeronave: IAeronave) => void;
  onEditar: (aeronave: IAeronave) => void;
  onEliminar: (aeronave: IAeronave) => void;
  onGestionarHoras: (aeronave: IAeronave) => void;
  obtenerColorEstado: (estado: string) => string;
}

export interface IAeronaveListProps {
  aeronaves: IAeronave[];
  vistaEnTarjetas: boolean;
  onVerComponentes: (aeronave: IAeronave) => void;
  onEditar: (aeronave: IAeronave) => void;
  onEliminar: (aeronave: IAeronave) => void;
  onGestionarHoras: (aeronave: IAeronave) => void;
  obtenerColorEstado: (estado: string) => string;
}

// Props para el nuevo componente de gestión de horas
export interface IGestionHorasAeronaveProps {
  aeronave: IAeronave;
  isOpen: boolean;
  onClose: () => void;
  onActualizar: (aeronave: IAeronave) => void;
}

// Import types for re-export
import { IAeronave, ICrearAeronaveData } from '../inventario';