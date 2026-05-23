'use client';
// src/hooks/useRecentlyViewed.js — Historial de productos vistos en localStorage
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'recently_viewed_v1';
const MAX_ITEMS   = 10;

export function useRecentlyViewed() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch { /* noop */ }
  }, []);

  const addItem = useCallback((producto) => {
    if (!producto?.cod_producto) return;
    setItems(prev => {
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
        viewedAt:           Date.now(),
      };
      const filtered = prev.filter(p => p.cod_producto !== snap.cod_producto);
      const next = [snap, ...filtered].slice(0, MAX_ITEMS);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  }, []);

  return { items, addItem, clear };
}
