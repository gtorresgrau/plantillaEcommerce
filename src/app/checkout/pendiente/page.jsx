'use client';
import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Clock, Package } from 'lucide-react';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { useCart } from '@/contexts/CartContext';

function PendienteContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || searchParams.get('external_reference');
  const { clearCart } = useCart();

  useEffect(() => {
    // El pedido ya fue creado, vaciar el carrito independientemente del estado del pago
    clearCart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock size={48} className="text-yellow-500" />
          </div>

          <h1 className="text-3xl font-bold text-brand-text mb-3">Pago en proceso</h1>
          <p className="text-brand-muted mb-6">
            Tu pago está siendo procesado. Te notificaremos por email cuando se confirme. Esto puede tardar unas horas.
          </p>

          {orderId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-yellow-700 font-medium">
                N° de pedido: <span className="font-mono">{orderId}</span>
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link href="/mi-cuenta" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              <Package size={16} /> Ver mis pedidos
            </Link>
            <Link href="/" className="btn-secondary w-full py-3 text-center block">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function PendientePage() {
  return (
    <Suspense fallback={null}>
      <PendienteContent />
    </Suspense>
  );
}
