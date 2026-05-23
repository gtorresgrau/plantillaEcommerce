'use client';
// src/app/productos/[id]/ProductoDetalle.jsx
// Componente cliente — lógica interactiva del detalle de producto
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Package, Truck, Shield, Plus, Minus, MessageCircle, Star, Heart } from 'lucide-react';
import { useWishlist }        from '@/contexts/WishlistContext';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import RecentlyViewed        from '@/components/storefront/RecentlyViewed';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import ProductReviews from '@/components/storefront/ProductReviews';
import { useCart } from '@/contexts/CartContext';
import Swal from 'sweetalert2';

// ── Mini card para productos relacionados ─────────────────────────────────────
function RelatedCard({ p }) {
  const { addItem } = useCart();
  const precio = p.precioFinal ?? (p.descuento > 0 ? Math.round(p.precio * (1 - p.descuento / 100)) : p.precio);
  return (
    <Link href={`/productos/${p.cod_producto}`} className="card group hover:shadow-md transition-shadow flex flex-col">
      <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
        {p.foto1
          ? <Image src={p.foto1} alt={p.titulo_de_producto} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="200px" />
          : <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
        }
        {p.descuento > 0 && (
          <span className="absolute top-2 left-2 bg-brand-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">-{p.descuento}%</span>
        )}
      </div>
      <p className="text-xs text-brand-muted mb-0.5">{p.marca || p.categoria}</p>
      <p className="text-sm font-medium text-brand-text line-clamp-2 flex-1">{p.titulo_de_producto}</p>
      <p className="text-base font-bold text-brand-primary mt-2">${precio?.toLocaleString('es-AR')}</p>
    </Link>
  );
}

export default function ProductoDetalle({ id }) {
  const { addItem }           = useCart();
  const { toggle, has }       = useWishlist();
  const { addItem: addViewed } = useRecentlyViewed();

  const [producto,     setProducto]     = useState(null);
  const [relacionados, setRelacionados]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [cantidad,     setCantidad]     = useState(1);
  const [fotoActiva,   setFotoActiva]   = useState(0);
  const [waConfig,     setWaConfig]     = useState(null); // { whatsappVentas, codigoPais }

  useEffect(() => {
    if (!id) return;
    // Carga en paralelo: producto + config de WhatsApp
    Promise.all([
      fetch(`/api/productos/${id}`).then(r => r.json()),
      fetch('/api/configuracion').then(r => r.json()),
    ])
      .then(async ([d, cfgData]) => {
        const prod = d.data || null;
        setProducto(prod);
        if (prod) addViewed(prod);
        const cfg = cfgData.data;
        if (cfg?.whatsappVentas) {
          setWaConfig({ numero: cfg.whatsappVentas, codigoPais: cfg.codigoPais || 54 });
        }
        setLoading(false);
        if (prod?.categoria) {
          try {
            const rel = await fetch(`/api/productos?categoria=${encodeURIComponent(prod.categoria)}&limit=5`).then(r => r.json());
            setRelacionados((rel.data || []).filter(p => p.cod_producto !== prod.cod_producto).slice(0, 4));
          } catch { /* silenciar */ }
        }
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
            <h1 className="text-2xl font-bold text-brand-text mb-2">{producto.titulo_de_producto}</h1>

            {/* Rating */}
            {producto.cantResenas > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex">
                  {[1,2,3,4,5].map(i => {
                    const lleno = i <= Math.floor(producto.promedio);
                    const medio = !lleno && i === Math.ceil(producto.promedio) && producto.promedio % 1 >= 0.5;
                    return (
                      <Star
                        key={i}
                        size={16}
                        className={lleno ? 'text-yellow-400 fill-yellow-400' : medio ? 'text-yellow-400 fill-yellow-200' : 'text-gray-200 fill-gray-200'}
                      />
                    );
                  })}
                </div>
                <span className="text-sm font-medium text-brand-text">{producto.promedio.toFixed(1)}</span>
                <a href="#resenas" className="text-sm text-brand-muted hover:text-brand-primary transition-colors">
                  {producto.cantResenas} {producto.cantResenas === 1 ? 'reseña' : 'reseñas'}
                </a>
              </div>
            )}

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
              <div className="flex gap-3">
                <button
                  onClick={handleAgregarCarrito}
                  disabled={sinStock}
                  className="btn-primary flex-1 py-3 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={18} />
                  {sinStock ? 'Sin stock' : 'Agregar al carrito'}
                </button>
                <button
                  onClick={() => toggle(producto)}
                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-200 shrink-0
                    ${has(producto.cod_producto)
                      ? 'bg-red-500 border-red-500 text-white scale-105'
                      : 'border-gray-200 text-gray-400 hover:border-red-400 hover:text-red-400'
                    }`}
                  title={has(producto.cod_producto) ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                >
                  <Heart size={18} className={has(producto.cod_producto) ? 'fill-white' : ''} />
                </button>
              </div>
              <Link href="/carrito" className="btn-secondary w-full py-3 text-base text-center block">
                Ver carrito
              </Link>

              {/* WhatsApp: consultar disponibilidad o detalles */}
              {waConfig && (
                <a
                  href={`https://wa.me/${waConfig.codigoPais}${waConfig.numero.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Quiero consultar sobre el producto: ${producto.titulo_de_producto}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium text-white text-base transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <MessageCircle size={18} />
                  Consultar por WhatsApp
                </a>
              )}
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

      {/* ── Reseñas ───────────────────────────────────────────── */}
      <div id="resenas">
        <ProductReviews cod_producto={producto.cod_producto} />
      </div>

      {/* ── Vistos recientemente ──────────────────────────────── */}
      <RecentlyViewed excludeId={producto.cod_producto} />

      {/* ── Productos relacionados ─────────────────────────────── */}
      {relacionados.length > 0 && (
        <section className="bg-brand-bg py-10 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-brand-text mb-5">Productos relacionados</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relacionados.map(p => <RelatedCard key={p._id} p={p} />)}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
