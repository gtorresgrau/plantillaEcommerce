'use client';
// src/hooks/useToast.js — Sistema de toasts ligero, sin dependencias externas
// Uso: const { toast } = useToast();
//      toast('Guardado', 'success');        // tipos: 'success' | 'error' | 'info' | 'warning'
//      toast('Copiado al portapapeles!');   // 'success' por defecto

import { useState, useCallback, useRef } from 'react';

let _setToasts = null;

/**
 * Trigger global — usable fuera de componentes React (ej. en fetch utils).
 * Solo funciona si el componente ToastContainer está montado en el árbol.
 */
export function toast(message, type = 'success', duration = 3000) {
  if (_setToasts) {
    const id = Date.now() + Math.random();
    _setToasts(prev => [...prev, { id, message, type, duration }]);
  }
}

/**
 * Hook que devuelve { toast } y el componente <ToastContainer />.
 * Montar <ToastContainer /> una vez en el layout raíz del cliente.
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const timerRefs = useRef({});

  // Registrar el setter global al montar
  const setToastsWrapped = useCallback((updater) => {
    setToasts(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      _setToasts = setToastsWrapped;
      return next;
    });
  }, []);

  _setToasts = setToastsWrapped;

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    if (timerRefs.current[id]) {
      clearTimeout(timerRefs.current[id]);
      delete timerRefs.current[id];
    }
  }, []);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    if (duration > 0) {
      timerRefs.current[id] = setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, [removeToast]);

  const ICONS = {
    success: '✓',
    error:   '✕',
    warning: '⚠',
    info:    'ℹ',
  };

  const STYLES = {
    success: { bg: '#f0fdf4', border: '#86efac', text: '#166534', icon: '#16a34a' },
    error:   { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', icon: '#dc2626' },
    warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e', icon: '#d97706' },
    info:    { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af', icon: '#2563eb' },
  };

  const ToastContainer = () => (
    <div
      aria-live="polite"
      style={{
        position:  'fixed',
        bottom:    '24px',
        right:     '24px',
        zIndex:    9999,
        display:   'flex',
        flexDirection: 'column-reverse',
        gap:       '8px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map(({ id, message, type }) => {
        const s = STYLES[type] || STYLES.info;
        return (
          <div
            key={id}
            style={{
              display:       'flex',
              alignItems:    'center',
              gap:           '10px',
              padding:       '12px 16px',
              borderRadius:  '10px',
              border:        `1px solid ${s.border}`,
              backgroundColor: s.bg,
              color:         s.text,
              fontSize:      '14px',
              fontWeight:    500,
              boxShadow:     '0 4px 12px rgba(0,0,0,0.12)',
              maxWidth:      '320px',
              pointerEvents: 'auto',
              animation:     'toast-in 0.25s ease',
            }}
          >
            <span style={{ color: s.icon, fontSize: '16px', fontWeight: 700, flexShrink: 0 }}>
              {ICONS[type] || ICONS.info}
            </span>
            <span style={{ flex: 1 }}>{message}</span>
            <button
              onClick={() => removeToast(id)}
              style={{
                background: 'none',
                border:     'none',
                cursor:     'pointer',
                color:      s.text,
                opacity:    0.5,
                fontSize:   '16px',
                lineHeight: 1,
                padding:    '0 0 0 4px',
                flexShrink: 0,
              }}
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );

  return { toast: addToast, ToastContainer, toasts, removeToast };
}
