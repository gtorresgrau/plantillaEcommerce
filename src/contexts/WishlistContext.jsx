'use client';
// src/contexts/WishlistContext.jsx
// Lista de favoritos persistida en localStorage (funciona sin login)
import { createContext, useContext, useReducer, useEffect } from 'react';

const WishlistContext = createContext(null);

const STORAGE_KEY = 'wishlist_v1';

function reducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return action.payload;
    case 'TOGGLE': {
      const exists = state.some(p => p.cod_producto === action.payload.cod_producto);
      return exists
        ? state.filter(p => p.cod_producto !== action.payload.cod_producto)
        : [...state, action.payload];
    }
    case 'REMOVE':
      return state.filter(p => p.cod_producto !== action.payload);
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export function WishlistProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, []);

  // Cargar desde localStorage al montar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) dispatch({ type: 'INIT', payload: JSON.parse(saved) });
    } catch { /* noop */ }
  }, []);

  // Sincronizar con localStorage en cada cambio
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch { /* noop */ }
  }, [items]);

  const toggle = (producto) => {
    // Guardamos solo los campos necesarios para la card
    const snap = {
      cod_producto:       producto.cod_producto,
      titulo_de_producto: producto.titulo_de_producto || producto.nombre,
      precio:             producto.precio,
      precioFinal:        producto.precioFinal ?? producto.precio,
      descuento:          producto.descuento || 0,
      foto1:              producto.foto1 || '',
      marca:              producto.marca || '',
      promedio:           producto.promedio || 0,
      cantResenas:        producto.cantResenas || 0,
    };
    dispatch({ type: 'TOGGLE', payload: snap });
  };

  const remove = (cod_producto) => dispatch({ type: 'REMOVE', payload: cod_producto });
  const clear  = ()              => dispatch({ type: 'CLEAR' });
  const has    = (cod_producto)  => items.some(p => p.cod_producto === cod_producto);

  return (
    <WishlistContext.Provider value={{ items, toggle, remove, clear, has, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
};
