'use client';
// src/contexts/BrandingContext.jsx
// ─── Aplica los colores y tipografía del BrandingConfig como CSS variables ──────
// Todos los componentes usan var(--color-primary), etc. para adaptarse automáticamente.

import { createContext, useContext, useEffect } from 'react';

const BrandingContext = createContext(null);

export function BrandingProvider({ branding, children }) {
  useEffect(() => {
    if (!branding) return;
    const { colores = {}, tipografia = {} } = branding;
    const root = document.documentElement;

    // Colores
    if (colores.primary)    root.style.setProperty('--color-primary',      colores.primary);
    if (colores.secondary)  root.style.setProperty('--color-secondary',    colores.secondary);
    if (colores.accent)     root.style.setProperty('--color-accent',       colores.accent);
    if (colores.bg)         root.style.setProperty('--color-bg',           colores.bg);
    if (colores.surface)    root.style.setProperty('--color-surface',      colores.surface);
    if (colores.text)       root.style.setProperty('--color-text',         colores.text);
    if (colores.textMuted)  root.style.setProperty('--color-text-muted',   colores.textMuted);
    if (colores.nav)        root.style.setProperty('--color-nav',          colores.nav);
    if (colores.navText)    root.style.setProperty('--color-nav-text',     colores.navText);
    if (colores.footer)     root.style.setProperty('--color-footer',       colores.footer);
    if (colores.footerText) root.style.setProperty('--color-footer-text',  colores.footerText);
    if (colores.danger)     root.style.setProperty('--color-danger',       colores.danger);
    if (colores.success)    root.style.setProperty('--color-success',      colores.success);
    if (colores.warning)    root.style.setProperty('--color-warning',      colores.warning);

    // Tipografía
    if (tipografia.borderRadius) root.style.setProperty('--border-radius', tipografia.borderRadius);
    if (tipografia.fuente)       root.style.setProperty('--font-brand',    tipografia.fuente);
  }, [branding]);

  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}
