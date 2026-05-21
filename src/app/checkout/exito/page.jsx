'use client';
import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';

function ExitoContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || searchParams.get('external_reference');

  // Confetti sencillo con emojis animados via CSS
  useEffect(() => {
    document.title = '¡Pago exitoso! — Tu pedido fue confirmado';
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          {/* Animación de éxito */}
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle size={48} className="text-green-500" />
          </div>

          <h1 className="text-3xl font-bold text-brand-text mb-3">¡Gracias por tu compra!</h1>
          <p className="text-brand-muted mb-6">
            Tu pedido fue confirmado y estamos preparándolo. Recibirás un email con los detalles.
          </p>

          {orderId && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-green-700 font-medium">
                N° de pedido: <span className="font-mono">{orderId}</span>
              </p>
            </div>
          )}

          <div className="space-y-3">
            {orderId && (
              <Link href={`/mi-cuenta`} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
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
