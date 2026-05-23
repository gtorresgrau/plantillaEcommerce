'use client';
// src/app/NotFoundClient.jsx — Botón "volver" client-side para la página 404
import { ArrowLeft } from 'lucide-react';

export default function NotFoundClient() {
  return (
    <button
      onClick={() => window.history.back()}
      className="mt-8 flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-text transition-colors"
    >
      <ArrowLeft size={14} />
      Volver a la página anterior
    </button>
  );
}
