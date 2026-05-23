'use client';
// src/app/admin/stock/page.jsx — Gestión rápida de stock (admin/vendedor)
import { useState, useEffect, useCallback } from 'react';
import { Package, AlertTriangle, Search, Save, RefreshCw, TrendingDown } from 'lucide-react';
import Swal from 'sweetalert2';

const FILTROS = [
  { key: 'todos',   label: 'Todos' },
  { key: 'bajo',    label: 'Stock bajo (≤ 5)' },
  { key: 'sin',     label: 'Sin stock' },
  { key: 'normal',  label: 'Normal (> 5)' },
];

export default function StockPage() {
  const [productos,    setProductos]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [guardando,    setGuardando]    = useState({});   // { id: true }
  const [cambios,      setCambios]      = useState({});   // { id: nuevoStock }
  const [busqueda,     setBusqueda]     = useState('');
  const [filtro,       setFiltro]       = useState('todos');

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/productos?admin=true&limit=200');
      const d   = await res.json();
      setProductos(d.data || []);
      setCambios({});
    } catch {
      Swal.fire('Error', 'No se pudieron cargar los productos.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const handleCambio = (id, valor) => {
    const num = parseInt(valor);
    if (isNaN(num) || num < 0) return;
    setCambios(prev => ({ ...prev, [id]: num }));
  };

  const guardarUno = async (producto) => {
    const nuevoStock = cambios[producto._id ?? producto.cod_producto];
    if (nuevoStock === undefined) return;
    const id = producto._id ?? producto.cod_producto;
    setGuardando(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/productos/${producto.cod_producto}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: nuevoStock }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error || 'Error al guardar');
      setProductos(prev =>
        prev.map(p =>
          (p._id ?? p.cod_producto) === id ? { ...p, stock: nuevoStock } : p
        )
      );
      setCambios(prev => { const n = { ...prev }; delete n[id]; return n; });
      Swal.fire({ icon: 'success', title: 'Guardado', text: `Stock actualizado a ${nuevoStock}`, timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setGuardando(prev => { const n = { ...prev }; delete n[id]; return n; });
    }
  };

  const guardarTodos = async () => {
    const ids = Object.keys(cambios);
    if (!ids.length) {
      Swal.fire('Sin cambios', 'No hay cambios pendientes.', 'info');
      return;
    }
    const conf = await Swal.fire({
      title: `Guardar ${ids.length} cambio${ids.length > 1 ? 's' : ''}`,
      text: '¿Confirmar actualización masiva de stock?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: 'var(--color-primary)',
    });
    if (!conf.isConfirmed) return;

    let ok = 0, fail = 0;
    for (const prod of productos.filter(p => ids.includes(p._id ?? p.cod_producto))) {
      const id = prod._id ?? prod.cod_producto;
      try {
        const res = await fetch(`/api/productos/${prod.cod_producto}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stock: cambios[id] }),
        });
        const d = await res.json();
        if (!d.success) throw new Error();
        ok++;
      } catch { fail++; }
    }
    await cargar();
    Swal.fire({
      icon: fail > 0 ? 'warning' : 'success',
      title: 'Actualización completada',
      text: `${ok} actualizado${ok !== 1 ? 's' : ''}, ${fail} con error.`,
    });
  };

  // ── Filtrado ──────────────────────────────────────────────────────────────
  const productosFiltrados = productos.filter(p => {
    const q = busqueda.toLowerCase();
    const matchBusqueda = !q
      || p.titulo_de_producto?.toLowerCase().includes(q)
      || p.cod_producto?.toLowerCase().includes(q)
      || p.marca?.toLowerCase().includes(q);

    const stock = cambios[p._id ?? p.cod_producto] ?? p.stock ?? 0;
    const matchFiltro =
      filtro === 'todos'  ? true :
      filtro === 'bajo'   ? stock > 0 && stock <= 5 :
      filtro === 'sin'    ? stock === 0 :
      filtro === 'normal' ? stock > 5 : true;

    return matchBusqueda && matchFiltro;
  });

  const totalCambios = Object.keys(cambios).length;

  // ── Stats rápidas ─────────────────────────────────────────────────────────
  const sinStock  = productos.filter(p => (p.stock ?? 0) === 0).length;
  const bajoStock = productos.filter(p => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-text flex items-center gap-2">
            <Package size={22} className="text-brand-primary" />
            Gestión de Stock
          </h1>
          <p className="text-sm text-brand-muted mt-0.5">Actualizá el stock de todos tus productos desde una sola pantalla</p>
        </div>
        <div className="flex gap-2">
          <button onClick={cargar} className="btn-secondary flex items-center gap-2 text-sm px-3 py-2">
            <RefreshCw size={15} /> Recargar
          </button>
          {totalCambios > 0 && (
            <button onClick={guardarTodos} className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
              <Save size={15} /> Guardar {totalCambios} cambio{totalCambios > 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>

      {/* Alert cards */}
      {(sinStock > 0 || bajoStock > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {sinStock > 0 && (
            <div className="card p-4 border-l-4 border-red-500">
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <TrendingDown size={16} />
                <span className="text-xs font-semibold uppercase">Sin stock</span>
              </div>
              <p className="text-2xl font-bold text-red-700">{sinStock}</p>
              <p className="text-xs text-brand-muted">productos agotados</p>
            </div>
          )}
          {bajoStock > 0 && (
            <div className="card p-4 border-l-4 border-yellow-400">
              <div className="flex items-center gap-2 text-yellow-600 mb-1">
                <AlertTriangle size={16} />
                <span className="text-xs font-semibold uppercase">Stock bajo</span>
              </div>
              <p className="text-2xl font-bold text-yellow-700">{bajoStock}</p>
              <p className="text-xs text-brand-muted">productos con poco stock</p>
            </div>
          )}
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            placeholder="Buscar por nombre, código o marca…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="input pl-9 py-2 text-sm w-full"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTROS.map(f => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filtro === f.key
                  ? 'text-white'
                  : 'bg-gray-100 text-brand-muted hover:bg-gray-200'
              }`}
              style={filtro === f.key ? { backgroundColor: 'var(--color-primary)' } : {}}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-brand-muted text-xs uppercase tracking-wide">Producto</th>
                <th className="text-left px-4 py-3 font-semibold text-brand-muted text-xs uppercase tracking-wide hidden sm:table-cell">Código</th>
                <th className="text-left px-4 py-3 font-semibold text-brand-muted text-xs uppercase tracking-wide hidden md:table-cell">Categoría</th>
                <th className="text-center px-4 py-3 font-semibold text-brand-muted text-xs uppercase tracking-wide">Stock actual</th>
                <th className="text-center px-4 py-3 font-semibold text-brand-muted text-xs uppercase tracking-wide">Nuevo stock</th>
                <th className="text-center px-4 py-3 font-semibold text-brand-muted text-xs uppercase tracking-wide">Guardar</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-brand-muted">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                productosFiltrados.map(p => {
                  const id       = p._id ?? p.cod_producto;
                  const stock    = p.stock ?? 0;
                  const nuevo    = cambios[id];
                  const tiene    = nuevo !== undefined;
                  const saving   = guardando[id];
                  const stockBajo = stock > 0 && stock <= 5;
                  const sinStock = stock === 0;

                  return (
                    <tr key={id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${tiene ? 'bg-blue-50/40' : ''}`}>
                      {/* Nombre */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {p.foto1 ? (
                            <img src={p.foto1} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-sm flex-shrink-0">📦</div>
                          )}
                          <span className="font-medium text-brand-text line-clamp-1">{p.titulo_de_producto}</span>
                        </div>
                      </td>
                      {/* Código */}
                      <td className="px-4 py-3 text-brand-muted font-mono text-xs hidden sm:table-cell">
                        {p.cod_producto}
                      </td>
                      {/* Categoría */}
                      <td className="px-4 py-3 text-brand-muted hidden md:table-cell">
                        {p.categoria || '—'}
                      </td>
                      {/* Stock actual */}
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          sinStock  ? 'bg-red-100 text-red-700' :
                          stockBajo ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-green-100 text-green-700'
                        }`}>
                          {sinStock ? '⚠' : stockBajo ? '⚡' : '✓'} {stock}
                        </span>
                      </td>
                      {/* Input nuevo stock */}
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={nuevo !== undefined ? nuevo : stock}
                          onChange={e => handleCambio(id, e.target.value)}
                          className={`w-20 text-center border rounded-lg py-1.5 text-sm font-semibold transition-colors ${
                            tiene ? 'border-brand-primary bg-white' : 'border-gray-200 bg-gray-50'
                          }`}
                        />
                      </td>
                      {/* Botón guardar */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => guardarUno(p)}
                          disabled={!tiene || saving}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            tiene
                              ? 'text-white hover:opacity-90'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                          style={tiene ? { backgroundColor: 'var(--color-primary)' } : {}}
                        >
                          {saving ? (
                            <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Save size={13} />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {productosFiltrados.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-brand-muted">
              Mostrando {productosFiltrados.length} de {productos.length} productos
            </div>
          )}
        </div>
      )}
    </div>
  );
}
