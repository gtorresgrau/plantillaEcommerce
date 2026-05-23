'use client';
// src/app/pedido/[orderId]/page.jsx — Página pública de seguimiento de pedido
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import {
  Package, Truck, CheckCircle, Clock, XCircle, CreditCard,
  ArrowLeft, ExternalLink, Copy, RefreshCw, Info,
} from 'lucide-react';

// ─── Configuración de estados ─────────────────────────────────────────────────
const STEPS = [
  { key: 'pendiente',  label: 'Recibido',    icon: Clock        },
  { key: 'pagado',     label: 'Pago OK',     icon: CreditCard   },
  { key: 'preparando', label: 'Preparando',  icon: Package      },
  { key: 'enviado',    label: 'En camino',   icon: Truck        },
  { key: 'entregado',  label: 'Entregado',   icon: CheckCircle  },
];

const STATUS_COLORS = {
  pendiente:  { bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200',  dot: 'bg-yellow-500'  },
  pagado:     { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-500'    },
  preparando: { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200',  dot: 'bg-purple-500'  },
  enviado:    { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200',  dot: 'bg-indigo-500'  },
  entregado:  { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200',   dot: 'bg-green-500'   },
  cancelado:  { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-500'     },
};

const METODO_LABEL = {
  mercadopago:   'MercadoPago',
  transferencia: 'Transferencia bancaria',
  efectivo:      'Efectivo',
};

const ENVIO_LABEL = {
  pickit:       'Pickit',
  retiroLocal:  'Retiro en local',
  otro:         'Envío a domicilio',
};

// ─── Stepper visual ───────────────────────────────────────────────────────────
function OrderStepper({ status }) {
  if (status === 'cancelado') {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200 text-red-700">
        <XCircle size={22} />
        <div>
          <p className="font-semibold">Pedido cancelado</p>
          <p className="text-sm opacity-80">Si tenés dudas, contactanos.</p>
        </div>
      </div>
    );
  }

  const stepOrder = STEPS.map(s => s.key);
  const currentIdx = stepOrder.indexOf(status);

  return (
    <div className="relative">
      {/* Línea de conexión */}
      <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 -z-0" />
      <div
        className="absolute top-5 left-5 h-0.5 bg-brand-primary -z-0 transition-all duration-700"
        style={{ width: `${currentIdx > 0 ? (currentIdx / (STEPS.length - 1)) * 100 : 0}%` }}
      />

      <div className="flex justify-between relative z-10">
        {STEPS.map((step, idx) => {
          const Icon     = step.icon;
          const done     = idx < currentIdx;
          const current  = idx === currentIdx;
          const upcoming = idx > currentIdx;
          return (
            <div key={step.key} className="flex flex-col items-center gap-2 w-20">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                ${done    ? 'bg-brand-primary border-brand-primary text-white'                          : ''}
                ${current ? 'bg-white border-brand-primary text-brand-primary shadow-md scale-110'      : ''}
                ${upcoming? 'bg-white border-gray-200 text-gray-300'                                    : ''}
              `}>
                <Icon size={16} />
              </div>
              <span className={`text-[10px] text-center leading-tight font-medium ${upcoming ? 'text-gray-300' : current ? 'text-brand-primary' : 'text-brand-muted'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Timeline de historial ────────────────────────────────────────────────────
function OrderTimeline({ historial }) {
  if (!historial?.length) return null;

  const ESTADO_INFO = {
    pendiente:  { label: 'Pedido recibido',   color: 'bg-yellow-500',  Icon: Clock       },
    pagado:     { label: 'Pago confirmado',    color: 'bg-blue-500',    Icon: CreditCard  },
    preparando: { label: 'En preparación',     color: 'bg-purple-500',  Icon: Package     },
    enviado:    { label: 'Enviado',            color: 'bg-indigo-500',  Icon: Truck       },
    entregado:  { label: 'Entregado',          color: 'bg-green-500',   Icon: CheckCircle },
    cancelado:  { label: 'Cancelado',          color: 'bg-red-500',     Icon: XCircle     },
  };

  // Mostrar más reciente primero
  const ordenado = [...historial].reverse();

  return (
    <div className="card">
      <h2 className="text-sm font-semibold text-brand-text mb-4">Historial</h2>
      <div className="relative">
        {/* Línea vertical */}
        <div className="absolute left-3.5 top-3 bottom-3 w-px bg-gray-100" />

        <div className="space-y-4">
          {ordenado.map((h, i) => {
            const info = ESTADO_INFO[h.estado] || { label: h.estado, color: 'bg-gray-400', Icon: Clock };
            const Icon = info.Icon;
            return (
              <div key={i} className="flex gap-4 relative">
                <div className={`w-7 h-7 rounded-full ${info.color} flex items-center justify-center shrink-0 z-10`}>
                  <Icon size={13} className="text-white" />
                </div>
                <div className="flex-1 pb-1">
                  <p className="text-sm font-medium text-brand-text">{info.label}</p>
                  {h.nota && <p className="text-xs text-brand-muted mt-0.5">{h.nota}</p>}
                  <p className="text-xs text-brand-muted mt-0.5">
                    {new Date(h.fecha).toLocaleDateString('es-AR', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Búsqueda de pedido (si llegan sin orderId) ───────────────────────────────
function BuscadorPedido({ onBuscar }) {
  const [input, setInput] = useState('');
  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-lg font-semibold text-brand-text mb-3">Rastrear pedido</h2>
      <p className="text-sm text-brand-muted mb-4">
        Ingresá el número de pedido que recibiste en tu email de confirmación.
      </p>
      <form onSubmit={e => { e.preventDefault(); if (input.trim()) onBuscar(input.trim()); }}
        className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value.toUpperCase())}
          placeholder="ORD-1234567890-ABCD"
          className="input flex-1 font-mono text-sm"
        />
        <button type="submit" className="btn-primary px-4 py-2 text-sm">Buscar</button>
      </form>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function SeguimientoPage({ params }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams?.orderId;

  const [pedido,    setPedido]    = useState(null);
  const [loading,   setLoading]   = useState(!!orderId);
  const [error,     setError]     = useState('');
  const [copiado,   setCopiado]   = useState(false);
  const [buscado,   setBuscado]   = useState(orderId || '');

  const cargar = async (id) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/seguimiento/${id}`);
      const d   = await res.json();
      if (!d.success) throw new Error(d.error || 'No encontrado');
      setPedido(d.data);
      setBuscado(id);
    } catch (e) {
      setError(e.message);
      setPedido(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId && orderId !== 'buscar') cargar(orderId);
  }, [orderId]);

  const copiarId = () => {
    navigator.clipboard.writeText(buscado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const colors = pedido ? STATUS_COLORS[pedido.orderStatus] || STATUS_COLORS.pendiente : null;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-brand-muted mb-6">
          <Link href="/" className="hover:text-brand-primary flex items-center gap-1">
            <ArrowLeft size={13} /> Inicio
          </Link>
          <span>/</span>
          <span className="text-brand-text">Seguimiento de pedido</span>
        </div>

        <h1 className="text-2xl font-bold text-brand-text mb-6">Seguimiento de pedido</h1>

        {/* Estado: sin orderId → buscador */}
        {(!orderId || orderId === 'buscar') && !pedido && (
          <div className="card">
            <BuscadorPedido onBuscar={cargar} />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="card flex items-center justify-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="card border border-red-200 bg-red-50">
            <div className="flex items-start gap-3 text-red-700 mb-4">
              <XCircle size={20} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Pedido no encontrado</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
            <BuscadorPedido onBuscar={cargar} />
          </div>
        )}

        {/* Pedido encontrado */}
        {!loading && pedido && (
          <div className="space-y-5">

            {/* Header del pedido */}
            <div className={`card border ${colors.border}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-semibold text-brand-text">{pedido.orderId}</span>
                    <button onClick={copiarId} className="text-brand-muted hover:text-brand-primary transition-colors" title="Copiar">
                      <Copy size={13} />
                    </button>
                    {copiado && <span className="text-xs text-green-600">¡Copiado!</span>}
                  </div>
                  <p className="text-sm text-brand-muted">
                    {pedido.clienteNombre && <span>Para: <strong>{pedido.clienteNombre}</strong> · </span>}
                    {new Date(pedido.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}>
                  <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  {pedido.estadoInfo.label}
                </div>
              </div>

              {/* Descripción del estado */}
              <p className={`text-sm mt-3 pt-3 border-t ${colors.border} ${colors.text}`}>
                <Info size={13} className="inline mr-1 opacity-70" />
                {pedido.estadoInfo.desc}
              </p>

              {/* Notas del admin */}
              {pedido.notasAdmin && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-700">
                  <span className="font-semibold">Nota de la tienda: </span>{pedido.notasAdmin}
                </div>
              )}
            </div>

            {/* Stepper */}
            <div className="card">
              <h2 className="text-sm font-semibold text-brand-text mb-6">Estado del pedido</h2>
              <OrderStepper status={pedido.orderStatus} />
            </div>

            {/* Tracking Pickit */}
            {pedido.pickitTracking && (
              <div className="card border border-indigo-100 bg-indigo-50">
                <div className="flex items-center gap-3">
                  <Truck size={18} className="text-indigo-600 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-indigo-700">Envío Pickit</p>
                    <p className="text-xs text-indigo-600 font-mono">{pedido.pickitTracking}</p>
                  </div>
                  {pedido.pickitLabel && (
                    <a
                      href={pedido.pickitLabel}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-indigo-700 hover:text-indigo-900 font-medium"
                    >
                      Ver etiqueta <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Timeline de historial */}
            {pedido.historialEstados?.length > 0 && (
              <OrderTimeline historial={pedido.historialEstados} />
            )}

            {/* Items del pedido */}
            <div className="card">
              <h2 className="text-sm font-semibold text-brand-text mb-4">
                Productos ({pedido.items.length})
              </h2>
              <div className="space-y-3">
                {pedido.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {item.foto1
                        ? <Image src={item.foto1} alt={item.nombre} fill className="object-cover" sizes="48px" />
                        : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-text line-clamp-1">{item.nombre}</p>
                    </div>
                    <span className="text-sm text-brand-muted shrink-0">× {item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Resumen de totales */}
              <div className="border-t border-gray-100 mt-4 pt-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-brand-muted">
                  <span>Subtotal</span>
                  <span>${pedido.subtotal?.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Envío ({ENVIO_LABEL[pedido.tipoEnvio] || pedido.tipoEnvio})</span>
                  <span>{pedido.costoEnvio > 0 ? `$${pedido.costoEnvio.toLocaleString('es-AR')}` : 'Gratis'}</span>
                </div>
                {pedido.descuentoCupon > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento cupón</span>
                    <span>-${pedido.descuentoCupon.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-brand-text pt-1 border-t border-gray-100">
                  <span>Total</span>
                  <span>${pedido.total?.toLocaleString('es-AR')}</span>
                </div>
                <p className="text-xs text-brand-muted text-right">
                  Método de pago: {METODO_LABEL[pedido.metodoPago] || pedido.metodoPago}
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <button
                onClick={() => cargar(buscado)}
                className="flex items-center gap-2 text-sm text-brand-muted hover:text-brand-primary transition-colors"
              >
                <RefreshCw size={13} /> Actualizar estado
              </button>
              <Link href="/productos" className="btn-primary text-sm px-4 py-2">
                Seguir comprando
              </Link>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
