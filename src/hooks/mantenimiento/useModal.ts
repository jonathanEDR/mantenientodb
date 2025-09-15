import { useState, useCallback } from 'react';

export interface UseModalReturn<T> {
  // Estado del modal
  isOpen: boolean;
  loading: boolean;
  
  // Elemento siendo editado
  editingItem: T | null;
  
  // Acciones del modal
  openModal: (item?: T) => void;
  closeModal: () => void;
  setLoading: (loading: boolean) => void;
  
  // Utilidades
  isEditing: boolean;
  isCreating: boolean;
}

export const useModal = <T = any>(): UseModalReturn<T> => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);

  const openModal = useCallback((item?: T) => {
    setEditingItem(item || null);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setEditingItem(null);
    setLoading(false);
  }, []);

  const isEditing = editingItem !== null;
  const isCreating = !isEditing;

  return {
    // Estado del modal
    isOpen,
    loading,
    
    // Elemento siendo editado
    editingItem,
    
    // Acciones del modal
    openModal,
    closeModal,
    setLoading,
    
    // Utilidades
    isEditing,
    isCreating
  };
};