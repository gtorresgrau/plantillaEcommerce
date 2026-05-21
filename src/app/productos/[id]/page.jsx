'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, ArrowLeft, Package, Truck, Shield, Plus, Minus } from 'lucide-react';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { useCart } from '@/contexts/CartContext';
import Swal from 'sweetalert2';

export default function ProductoDetallePage() {
  const { id } = useParams();
  const { addItem } = useCart();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [fotoActiva, setFotoActiva] = useState(0);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/productos/${id}`)
      .then(r => r.json())
      .then(d => {
        setProducto(d.data || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-brand-primary border-t-transparent rounded-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-5xl">😕</p>
          <p className="text-xl font-semibold text-brand-text">Producto no encontrado</p>
          <Link href="/productos" className="btn-primary">Ver todos los productos</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const fotos = [producto.foto1, producto.foto2, producto.foto3, producto.foto4].filter(Boolean);
  const precioFinal = producto.precioFinal ?? (
    producto.descuento > 0 ? Math.round(producto.precio * (1 - producto.descuento / 100)) : producto.precio
  );
  const sinStock = producto.stock === 0;

  const handleAgregarCarrito = () => {
    if (sinStock) return;
    addItem({ ...producto, precioFinal }, cantidad);
    Swal.fire({
      icon: 'success',
      title: '¡Agregado!',
      text: `${cantidad} × ${producto.titulo_de_producto} en tu carrito`,
      showConfirmButton: true,
      confirmButtonText: 'Ir al carrito',
      showCancelButton: true,
      cancelButtonText: 'Seguir comprando',
      confirmButtonColor: 'var(--color-primary)',
    }).then(r => { if (r.isConfirmed) window.location.href = '/carrito'; });
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Navbar />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-brand-muted mb-6">
          <Link href="/" className="hover:text-brand-primary">Inicio</Link>
          <span>/</span>
          <Link href="/productos" className="hover:text-brand-primary">Productos</Link>
          {producto.categoria && (
            <>
              <span>/</span>
              <Link href={`/productos?categoria=${producto.categoria}`} className="hover:text-brand-primary">{producto.categoria}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-brand-text line-clamp-1">{producto.titulo_de_producto}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Galería de imágenes */}
          <div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3">
              {fotos.length > 0 ? (
                <Image
                  src={fotos[fotoActiva]}
                  alt={producto.titulo_de_producto}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-7xl">📦</div>
              )}
              {producto.descuento > 0 && (
                <span className="absolute top-3 left-3 bg-brand-accent text-white text-sm font-bold px-3 py-1 rounded-full">
                  -{producto.descuento}% OFF
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {fotos.length > 1 && (
              <div className="flex gap-2">
                {fotos.map((f, i) => (
                  <button key={i} onClick={() => setFotoActiva(i)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === fotoActiva ? 'border-brand-primary' : 'border-transparent'}`}>
                    <Image src={f} alt={`Foto ${i + 1}`} fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {producto.marca && <p className="text-sm text-brand-muted mb-1 uppercase tracking-wide">{producto.marca}</p>}
            <h1 className="text-2xl font-bold text-brand-text mb-3">{producto.titulo_de_producto}</h1>

            {/* Precio */}
            <div className="mb-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-brand-text">${precioFinal.toLocaleString('es-AR')}</span>
                {producto.descuento > 0 && (
                  <span className="text-lg text-brand-muted line-through">${producto.precio.toLocaleString('es-AR')}</span>
                )}
              </div>
              {producto.descuento > 0 && (
                <p className="text-brand-success text-sm font-medium mt-0.5">
                  Ahorrás ${(producto.precio - precioFinal).toLocaleString('es-AR')}
                </p>
              )}
            </div>

            {/* Stock */}
            <div className={`inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full mb-5 ${sinStock ? 'bg-red-50 text-red-600' : producto.stock <= 5 ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>
              <span className={`w-2 h-2 rounded-full ${sinStock ? 'bg-red-500' : producto.stock <= 5 ? 'bg-yellow-500' : 'bg-green-500'}`} />
              {sinStock ? 'Sin stock' : producto.stock <= 5 ? `Últimas ${producto.stock} unidades` : 'En stock'}
            </div>

            {/* Cantidad */}
            {!sinStock && (
              <div className="flex items-center gap-3 mb-5">
                <span className="text-sm font-medium text-brand-text">Cantidad:</span>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => setCantidad(c => Math.max(1, c - 1))} className="px-3 py-2 hover:bg-gray-50 transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="px-4 py-2 text-sm font-semibold text-brand-text border-x border-gray-200">{cantidad}</span>
                  <button onClick={() => setCantidad(c => Math.min(producto.stock, c + 1))} className="px-3 py-2 hover:bg-gray-50 transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-xs text-brand-muted">({producto.stock} disponibles)</span>
              </div>
            )}

            {/* Botones */}
            <div className="space-y-3 mb-6">
              <button
                onClick={handleAgregarCarrito}
                disabled={sinStock}
                className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={18} />
                {sinStock ? 'Sin stock disponible' : 'Agregar al carrito'}
              </button>
              <Link href="/carrito" className="btn-secondary w-full py-3 text-base text-center block">
                Ver carrito
              </Link>
            </div>

            {/* Descripción */}
            {producto.descripcion && (
              <div className="mb-5">
                <h3 className="font-semibold text-brand-text mb-2">Descripción</h3>
                <p className="text-brand-muted text-sm leading-relaxed">{producto.descripcion}</p>
              </div>
            )}

            {/* Info adicional */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-brand-muted">
                <Truck size={15} className="text-brand-primary" />
                <span>Envío a todo el país</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-brand-muted">
                <Shield size={15} className="text-brand-primary" />
                <span>Compra protegida</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-brand-muted">
                <Package size={15} className="text-brand-primary" />
                <span>Código: {producto.cod_producto}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
