'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, RefreshCw } from 'lucide-react';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';

function ErrorContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || searchParams.get('external_reference');

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle size={48} className="text-red-500" />
          </div>

          <h1 className="text-3xl font-bold text-brand-text mb-3">El pago no se procesó</h1>
          <p className="text-brand-muted mb-6">
            Hubo un problema al procesar tu pago. No se realizó ningún cobro. Podés intentar nuevamente.
          </p>

          <div className="space-y-3">
            <Link href="/carrito" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              <RefreshCw size={16} /> Reintentar pago
            </Link>
            <Link href="/productos" className="btn-secondary w-full py-3 text-center block">
              Volver a la tienda
            </Link>
          </div>

          {orderId && (
            <p className="text-xs text-brand-muted mt-4">Ref: {orderId}</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={null}>
      <ErrorContent />
    </Suspense>
  );
}
