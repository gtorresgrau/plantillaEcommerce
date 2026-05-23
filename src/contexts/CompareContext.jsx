'use client';
// src/contexts/CompareContext.jsx — Comparador de hasta 3 productos
import { createContext, useContext, useState } from 'react';

const CompareContext = createContext(null);

export function CompareProvider({ children }) {
  const [items, setItems] = useState([]);

  const toggle = (producto) => {
    setItems(prev => {
      const exists = prev.some(p => p.cod_producto === producto.cod_producto);
      if (exists) return prev.filter(p => p.cod_producto !== producto.cod_producto);
      if (prev.length >= 3) return prev; // máximo 3
      return [...prev, producto];
    });
  };

  const remove  = (cod) => setItems(prev => prev.filter(p => p.cod_producto !== cod));
  const clear   = ()    => setItems([]);
  const has     = (cod) => items.some(p => p.cod_producto === cod);
  const isFull  = items.length >= 3;

  return (
    <CompareContext.Provider value={{ items, toggle, remove, clear, has, isFull, count: items.length }}>
      {children}
    </CompareContext.Provider>
  );
}

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used inside CompareProvider');
  return ctx;
};
