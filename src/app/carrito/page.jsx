'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { useCart } from '@/contexts/CartContext';
import Swal from 'sweetalert2';

// Skeleton para evitar hydration mismatch con localStorage
function CarritoSkeleton() {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Navbar />
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="card flex gap-4 animate-pulse">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                  <div className="h-8 bg-gray-200 rounded w-full mt-3" />
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="card animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
              <div className="h-12 bg-gray-200 rounded mt-6" />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function CarritoPage() {
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, updateQty, clearCart, subtotal, totalItems } = useCart();

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <CarritoSkeleton />;

  const handleRemove = (cod) => {
    Swal.fire({
      title: '¿Eliminar producto?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
    }).then(r => { if (r.isConfirmed) removeItem(cod); });
  };

  const handleClear = () => {
    Swal.fire({
      title: '¿Vaciar carrito?',
      text: 'Se eliminarán todos los productos.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, vaciar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
    }).then(r => { if (r.isConfirmed) clearCart(); });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-12">
          <ShoppingBag size={64} className="text-gray-200" />
          <h1 className="text-2xl font-bold text-brand-text">Tu carrito está vacío</h1>
          <p className="text-brand-muted">¡Encontrá productos increíbles en nuestra tienda!</p>
          <Link href="/productos" className="btn-primary">Ver productos</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Navbar />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-brand-text">Carrito ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})</h1>
          <button onClick={handleClear} className="text-sm text-red-500 hover:underline flex items-center gap-1">
            <Trash2 size={14} /> Vaciar carrito
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => (
              <div key={item.cod_producto} className="card flex gap-4 transition-all duration-200 hover:shadow-md" style={{ animation: 'fadeIn 0.2s ease' }}>
                {/* Imagen */}
                <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  {item.foto1 ? (
                    <Image src={item.foto1} alt={item.titulo_de_producto} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">📦</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-brand-text text-sm line-clamp-2">{item.titulo_de_producto}</h3>
                  <p className="text-brand-muted text-xs mt-0.5">{item.cod_producto}</p>
                  <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                    {/* Cantidad */}
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => updateQty(item.cod_producto, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-50">
                        <Minus size={12} />
                      </button>
                      <span className="px-3 py-1 text-sm font-semibold border-x border-gray-200">{item.quantity}</span>
                      <button onClick={() => updateQty(item.cod_producto, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-50" disabled={item.quantity >= (item.stock || 999)}>
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-brand-text">${(item.precioFinal * item.quantity).toLocaleString('es-AR')}</span>
                      {item.quantity > 1 && (
                        <span className="text-xs text-brand-muted">${item.precioFinal.toLocaleString('es-AR')} c/u</span>
                      )}
                      <button onClick={() => handleRemove(item.cod_producto)} className="text-red-400 hover:text-red-600 ml-1">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link href="/productos" className="flex items-center gap-2 text-sm text-brand-primary hover:underline mt-2">
              <ArrowLeft size={14} /> Seguir comprando
            </Link>
          </div>

          {/* Resumen */}
          <div>
            <div className="card sticky top-20">
              <h2 className="font-semibold text-brand-text text-lg mb-4">Resumen</h2>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-brand-muted">
                  <span>Subtotal ({totalItems} {totalItems === 1 ? 'artículo' : 'artículos'})</span>
                  <span>${subtotal.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Envío</span>
                  <span className="text-brand-success">Se calcula en el checkout</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 mb-5">
                <div className="flex justify-between font-bold text-brand-text text-lg">
                  <span>Total</span>
                  <span>${subtotal.toLocaleString('es-AR')}</span>
                </div>
              </div>

              <Link href="/checkout" className="btn-primary w-full py-3 text-center text-base block">
                Finalizar compra →
              </Link>
              <p className="text-xs text-brand-muted text-center mt-3">El envío se calcula en el próximo paso</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
