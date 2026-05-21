'use client';
import { createContext, useContext, useEffect, useReducer, useCallback } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'ecommerce_cart';

function cartReducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return action.payload;

    case 'ADD': {
      const existing = state.findIndex(i => i.cod_producto === action.item.cod_producto);
      if (existing >= 0) {
        const updated = [...state];
        updated[existing] = {
          ...updated[existing],
          quantity: updated[existing].quantity + (action.item.quantity || 1),
        };
        return updated;
      }
      return [...state, { ...action.item, quantity: action.item.quantity || 1 }];
    }

    case 'REMOVE':
      return state.filter(i => i.cod_producto !== action.cod_producto);

    case 'UPDATE_QTY': {
      if (action.quantity <= 0) {
        return state.filter(i => i.cod_producto !== action.cod_producto);
      }
      return state.map(i =>
        i.cod_producto === action.cod_producto ? { ...i, quantity: action.quantity } : i
      );
    }

    case 'CLEAR':
      return [];

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, []);

  // Cargar desde localStorage al montar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) dispatch({ type: 'LOAD', payload: JSON.parse(saved) });
    } catch {
      // ignorar errores de parsing
    }
  }, []);

  // Persistir cambios
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignorar si localStorage no disponible
    }
  }, [items]);

  const addItem = useCallback((product, quantity = 1) => {
    dispatch({
      type: 'ADD',
      item: {
        cod_producto: product.cod_producto || product._id,
        titulo_de_producto: product.titulo_de_producto,
        precio: product.precioFinal ?? product.precio,
        precioFinal: product.precioFinal ?? product.precio,
        foto1: product.foto1 || product.foto2 || null,
        stock: product.stock,
        quantity,
      },
    });
  }, []);

  const removeItem = useCallback((cod_producto) => {
    dispatch({ type: 'REMOVE', cod_producto });
  }, []);

  const updateQty = useCallback((cod_producto, quantity) => {
    dispatch({ type: 'UPDATE_QTY', cod_producto, quantity });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal   = items.reduce((acc, i) => acc + i.precioFinal * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
