'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, Copy, MessageCircle } from 'lucide-react';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { useCart } from '@/contexts/CartContext';
import Swal from 'sweetalert2';

function ExitoContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || searchParams.get('external_reference');
  const metodo  = searchParams.get('metodo');
  const { clearCart } = useCart();
  const [config, setConfig] = useState(null);

  useEffect(() => {
    document.title = '¡Pedido confirmado! — Gracias por tu compra';
    clearCart();
    // Solo necesitamos config si el método es transferencia
    if (metodo === 'transferencia') {
      fetch('/api/configuracion')
        .then(r => r.json())
        .then(({ data }) => setConfig(data))
        .catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copiar = (texto) => {
    navigator.clipboard.writeText(texto).then(() =>
      Swal.fire({ icon: 'success', title: '¡Copiado!', timer: 1200, showConfirmButton: false, toast: true, position: 'top-end' })
    );
  };

  const whatsappUrl = config?.whatsappVentas
    ? `https://wa.me/${config.codigoPais || 54}${config.whatsappVentas.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Te envío el comprobante de pago del pedido N° ${orderId}`)}`
    : null;

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full">

          {/* Ícono animado */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-[bounce_1s_ease-in-out_3]">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-brand-text mb-3">¡Gracias por tu compra!</h1>
            <p className="text-brand-muted">
              {metodo === 'transferencia'
                ? 'Tu pedido fue registrado. Para completarlo, realizá la transferencia con los datos a continuación.'
                : 'Tu pedido fue confirmado y estamos preparándolo. Recibirás un email con los detalles.'
              }
            </p>
          </div>

          {/* N° de pedido */}
          {orderId && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-center">
              <p className="text-xs text-green-600 mb-1 font-medium uppercase tracking-wide">N° de pedido</p>
              <p className="font-mono text-lg font-bold text-green-800">{orderId}</p>
            </div>
          )}

          {/* Datos bancarios para transferencia */}
          {metodo === 'transferencia' && config && (config.cbu || config.alias) && (
            <div className="card mb-6">
              <h2 className="font-semibold text-brand-text mb-4 flex items-center gap-2">
                🏦 Datos para la transferencia
              </h2>
              <div className="space-y-3 text-sm">
                {config.banco && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-brand-muted">Banco</span>
                    <span className="font-medium text-brand-text">{config.banco}</span>
                  </div>
                )}
                {config.titularCuenta && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-brand-muted">Titular</span>
                    <span className="font-medium text-brand-text">{config.titularCuenta}</span>
                  </div>
                )}
                {config.cbu && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-brand-muted">CBU</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-brand-text">{config.cbu}</span>
                      <button onClick={() => copiar(config.cbu)} className="text-brand-primary hover:text-brand-primary/70">
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                )}
                {config.alias && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-brand-muted">Alias</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-brand-text">{config.alias}</span>
                      <button onClick={() => copiar(config.alias)} className="text-brand-primary hover:text-brand-primary/70">
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                )}
                {config.cuitBancario && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-brand-muted">CUIT</span>
                    <span className="font-medium text-brand-text">{config.cuitBancario}</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-brand-muted mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                📌 Una vez realizada la transferencia, envianos el comprobante para confirmar tu pedido.
              </p>
            </div>
          )}

          {/* Acciones */}
          <div className="space-y-3">
            {metodo === 'transferencia' && whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium text-white"
                style={{ backgroundColor: '#25D366' }}>
                <MessageCircle size={18} /> Enviar comprobante por WhatsApp
              </a>
            )}
            {orderId && (
              <Link href="/mi-cuenta" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                <Package size={16} /> Ver mis pedidos
              </Link>
            )}
            <Link href="/productos" className="btn-secondary w-full py-3 flex items-center justify-center gap-2">
              Seguir comprando <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function ExitoPage() {
  return (
    <Suspense fallback={null}>
      <ExitoContent />
    </Suspense>
  );
}
