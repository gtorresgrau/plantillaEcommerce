'use client';
import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Upload, X, Search, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Swal from 'sweetalert2';

const EMPTY_FORM = {
  cod_producto: '', titulo_de_producto: '', precio: '', precio_costo: '', descuento: 0,
  stock: 0, categoria: '', marca: '', descripcion: '',
  foto1: '', foto2: '', foto3: '', foto4: '',
  destacado: false, novedad: false, visible: true, activo: true,
};

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-brand-text text-lg">{title}</h2>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-text"><X size={20} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ImageUploader({ value, onChange, label }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'productos');
      const res  = await fetch('/api/cloudinary/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al subir');
      onChange(data.url);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-xs text-brand-muted mb-1">{label}</label>
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 text-center relative">
        {value ? (
          <div className="relative w-full aspect-square max-w-[120px] mx-auto">
            <Image src={value} alt={label} fill className="object-cover rounded" />
            <button onClick={() => onChange('')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
          </div>
        ) : (
          <div className="py-4">
            {uploading
              ? <div className="animate-spin h-6 w-6 border-2 border-brand-primary border-t-transparent rounded-full mx-auto" />
              : <Upload size={20} className="text-gray-300 mx-auto mb-1" />
            }
            <p className="text-xs text-brand-muted">
              <button type="button" onClick={() => inputRef.current?.click()} className="text-brand-primary hover:underline">
                {uploading ? 'Subiendo...' : 'Subir imagen'}
              </button>
            </p>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
      </div>
      {!value && (
        <input type="url" placeholder="O pegar URL" value={value} onChange={e => onChange(e.target.value)}
          className="mt-1 w-full border border-gray-200 rounded px-2 py-1 text-xs text-brand-text" />
      )}
    </div>
  );
}

function ProductoForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isEdit = !!initial?.cod_producto;
      const url    = isEdit ? `/api/productos/${form.cod_producto}` : '/api/productos';
      const method = isEdit ? 'PUT' : 'POST';
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, precio: Number(form.precio), precio_costo: Number(form.precio_costo), stock: Number(form.stock), descuento: Number(form.descuento) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');
      onSave(data.data);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const F = ({ label, field, type = 'text', placeholder, className = '' }) => (
    <div className={className}>
      <label className="block text-sm font-medium text-brand-text mb-1">{label}</label>
      <input type={type} placeholder={placeholder} value={form[field] ?? ''} onChange={e => set(field, e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary" />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <F label="Código" field="cod_producto" placeholder="PROD-001" className="col-span-2" />
        <F label="Nombre del producto" field="titulo_de_producto" className="col-span-2" />
        <F label="Precio venta ($)" field="precio" type="number" />
        <F label="Precio costo ($)" field="precio_costo" type="number" />
        <F label="Descuento (%)" field="descuento" type="number" />
        <F label="Stock" field="stock" type="number" />
        <F label="Categoría" field="categoria" />
        <F label="Marca" field="marca" />
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-text mb-1">Descripción</label>
        <textarea rows={3} value={form.descripcion || ''} onChange={e => set('descripcion', e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none" />
      </div>

      {/* Imágenes */}
      <div>
        <label className="block text-sm font-medium text-brand-text mb-2">Imágenes</label>
        <div className="grid grid-cols-4 gap-2">
          {['foto1','foto2','foto3','foto4'].map((f, i) => (
            <ImageUploader key={f} label={`Foto ${i+1}`} value={form[f]} onChange={v => set(f, v)} />
          ))}
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex flex-wrap gap-4">
        {[['destacado','Destacado'],['novedad','Novedad'],['visible','Visible'],['activo','Activo']].map(([field, label]) => (
          <label key={field} className="flex items-center gap-2 text-sm text-brand-text cursor-pointer">
            <input type="checkbox" checked={form[field]} onChange={e => set(field, e.target.checked)} className="accent-brand-primary" />
            {label}
          </label>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary px-6 py-2 disabled:opacity-60">
          {saving ? 'Guardando...' : 'Guardar producto'}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary px-6 py-2">Cancelar</button>
      </div>
    </form>
  );
}

export default function AdminProductosPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null); // null | 'nuevo' | producto
  const [busqueda, setBusqueda]   = useState('');
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);
  const LIMIT = 20;

  const fetchProductos = async (pg = 1, q = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: LIMIT, admin: 'true' });
      if (q) params.set('busqueda', q);
      const res  = await fetch(`/api/productos?${params}`);
      const data = await res.json();
      setProductos(data.data || []);
      setTotal(data.pagination?.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProductos(1, busqueda); }, [busqueda]);

  const handleSave = (product) => {
    setModal(null);
    fetchProductos(page, busqueda);
    Swal.fire({ icon: 'success', title: 'Guardado', timer: 1500, showConfirmButton: false });
  };

  const handleDelete = (prod) => {
    Swal.fire({
      title: `¿Eliminar "${prod.titulo_de_producto}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
    }).then(async r => {
      if (!r.isConfirmed) return;
      const res = await fetch(`/api/productos/${prod.cod_producto}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProductos(page, busqueda);
        Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1200, showConfirmButton: false });
      }
    });
  };

  const toggleVisible = async (prod) => {
    await fetch(`/api/productos/${prod.cod_producto}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visible: !prod.visible }),
    });
    fetchProductos(page, busqueda);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-text">Productos</h1>
        <button onClick={() => setModal('nuevo')} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

      {/* Búsqueda */}
      <div className="relative mb-4 max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
        <input
          value={busqueda}
          onChange={e => { setBusqueda(e.target.value); setPage(1); }}
          placeholder="Buscar..."
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
        />
      </div>

      {/* Tabla */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="py-3 text-brand-muted font-normal">Imagen</th>
              <th className="py-3 text-brand-muted font-normal">Código</th>
              <th className="py-3 text-brand-muted font-normal">Nombre</th>
              <th className="py-3 text-brand-muted font-normal">Precio</th>
              <th className="py-3 text-brand-muted font-normal">Stock</th>
              <th className="py-3 text-brand-muted font-normal">Categoría</th>
              <th className="py-3 text-brand-muted font-normal">Estado</th>
              <th className="py-3 text-brand-muted font-normal">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="py-3 pr-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
              : productos.map(prod => {
                const precioFinal = prod.descuento > 0 ? Math.round(prod.precio * (1 - prod.descuento / 100)) : prod.precio;
                return (
                  <tr key={prod.cod_producto} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 pr-3">
                      {prod.foto1
                        ? <div className="relative w-10 h-10 rounded overflow-hidden"><Image src={prod.foto1} alt="" fill className="object-cover" sizes="40px" /></div>
                        : <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-300">📦</div>
                      }
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-brand-muted">{prod.cod_producto}</td>
                    <td className="py-2.5 pr-4 font-medium text-brand-text max-w-[200px] truncate">{prod.titulo_de_producto}</td>
                    <td className="py-2.5 pr-4">
                      <span className="font-semibold">${precioFinal.toLocaleString('es-AR')}</span>
                      {prod.descuento > 0 && <span className="text-xs text-green-600 ml-1">-{prod.descuento}%</span>}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className={`font-medium ${prod.stock === 0 ? 'text-red-500' : prod.stock <= 5 ? 'text-yellow-600' : 'text-green-600'}`}>{prod.stock}</span>
                    </td>
                    <td className="py-2.5 pr-4 text-brand-muted">{prod.categoria || '—'}</td>
                    <td className="py-2.5 pr-4">
                      <div className="flex gap-1">
                        {prod.activo   && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Activo</span>}
                        {!prod.visible && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Oculto</span>}
                        {prod.destacado && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">★</span>}
                      </div>
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleVisible(prod)} title={prod.visible ? 'Ocultar' : 'Mostrar'} className="text-brand-muted hover:text-brand-text">
                          {prod.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>
                        <button onClick={() => setModal(prod)} className="text-brand-muted hover:text-brand-primary"><Pencil size={15} /></button>
                        <button onClick={() => handleDelete(prod)} className="text-brand-muted hover:text-red-500"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 py-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => { setPage(p); fetchProductos(p, busqueda); }}
                className={`w-8 h-8 rounded text-sm font-medium ${p === page ? 'bg-brand-primary text-white' : 'border border-gray-200 text-brand-text hover:bg-gray-50'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <Modal
          title={modal === 'nuevo' ? 'Nuevo producto' : `Editar: ${modal.titulo_de_producto}`}
          onClose={() => setModal(null)}
        >
          <ProductoForm
            initial={modal === 'nuevo' ? null : modal}
            onSave={handleSave}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  );
}
