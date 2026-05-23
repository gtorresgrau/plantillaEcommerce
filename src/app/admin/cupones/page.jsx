'use client';
// src/app/admin/cupones/page.jsx — Gestión de cupones de descuento
import { useState, useEffect, useCallback } from 'react';
import { Tag, Plus, Trash2, Edit2, RefreshCw, Copy, ToggleLeft, ToggleRight } from 'lucide-react';
import Swal from 'sweetalert2';

const FORM_INICIAL = {
  codigo: '', tipo: 'porcentaje', valor: '', descripcion: '',
  montoMinimo: '', usoMaximo: '', vencimiento: '', activo: true,
};

function CuponForm({ inicial, onGuardar, onCancelar }) {
  const [form, setForm] = useState(inicial || FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.codigo.trim() || !form.valor) {
      Swal.fire({ icon: 'warning', title: 'Completá los campos obligatorios', timer: 1800, showConfirmButton: false });
      return;
    }
    setGuardando(true);
    try {
      await onGuardar(form);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card border border-brand-primary/20 mb-6">
      <h3 className="font-semibold text-brand-text mb-4">
        {inicial ? 'Editar cupón' : 'Nuevo cupón'}
      </h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label text-sm">Código *</label>
          <input value={form.codigo} onChange={e => set('codigo', e.target.value.toUpperCase())}
            placeholder="VERANO20" className="input mt-1 font-mono uppercase" disabled={!!inicial} />
        </div>
        <div>
          <label className="label text-sm">Descripción</label>
          <input value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
            placeholder="Ej: 20% de descuento en verano" className="input mt-1" />
        </div>
        <div>
          <label className="label text-sm">Tipo *</label>
          <select value={form.tipo} onChange={e => set('tipo', e.target.value)} className="input mt-1">
            <option value="porcentaje">Porcentaje (%)</option>
            <option value="monto">Monto fijo ($)</option>
          </select>
        </div>
        <div>
          <label className="label text-sm">Valor * {form.tipo === 'porcentaje' ? '(%)' : '($)'}</label>
          <input type="number" min="0" value={form.valor} onChange={e => set('valor', e.target.value)}
            placeholder={form.tipo === 'porcentaje' ? '20' : '500'} className="input mt-1" />
        </div>
        <div>
          <label className="label text-sm">Monto mínimo ($)</label>
          <input type="number" min="0" value={form.montoMinimo} onChange={e => set('montoMinimo', e.target.value)}
            placeholder="0 = sin mínimo" className="input mt-1" />
        </div>
        <div>
          <label className="label text-sm">Límite de usos</label>
          <input type="number" min="1" value={form.usoMaximo} onChange={e => set('usoMaximo', e.target.value)}
            placeholder="Vacío = ilimitado" className="input mt-1" />
        </div>
        <div>
          <label className="label text-sm">Vencimiento</label>
          <input type="date" value={form.vencimiento ? form.vencimiento.slice(0, 10) : ''}
            onChange={e => set('vencimiento', e.target.value)} className="input mt-1" />
        </div>
        <div className="flex items-center gap-3 pt-5">
          <label className="label text-sm">Activo</label>
          <button type="button" onClick={() => set('activo', !form.activo)}
            className={`transition-colors ${form.activo ? 'text-green-500' : 'text-gray-300'}`}>
            {form.activo ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
          </button>
        </div>
      </div>
      <div className="flex gap-3 justify-end mt-4">
        <button type="button" onClick={onCancelar} className="btn-secondary text-sm px-4 py-2">Cancelar</button>
        <button type="submit" disabled={guardando} className="btn-primary text-sm px-5 py-2 disabled:opacity-50">
          {guardando ? 'Guardando…' : inicial ? 'Actualizar' : 'Crear cupón'}
        </button>
      </div>
    </form>
  );
}

export default function CuponesAdminPage() {
  const [cupones,   setCupones]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editando,  setEditando]  = useState(null); // cupon en edición

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cupones');
      const d   = await res.json();
      setCupones(d.data || []);
    } catch {
      Swal.fire('Error', 'No se pudieron cargar los cupones.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const crearCupon = async (form) => {
    const res = await fetch('/api/cupones', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    });
    const d = await res.json();
    if (!d.success) throw new Error(d.error || 'Error al crear');
    setCupones(prev => [d.data, ...prev]);
    setShowForm(false);
    Swal.fire({ icon: 'success', title: '¡Cupón creado!', timer: 1500, showConfirmButton: false });
  };

  const actualizarCupon = async (form) => {
    const res = await fetch(`/api/cupones/${editando.codigo}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    });
    const d = await res.json();
    if (!d.success) throw new Error(d.error || 'Error al actualizar');
    setCupones(prev => prev.map(c => c.codigo === editando.codigo ? d.data : c));
    setEditando(null);
    Swal.fire({ icon: 'success', title: 'Cupón actualizado', timer: 1500, showConfirmButton: false });
  };

  const toggleActivo = async (cupon) => {
    try {
      const res = await fetch(`/api/cupones/${cupon.codigo}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ activo: !cupon.activo }),
      });
      const d = await res.json();
      if (!d.success) throw new Error();
      setCupones(prev => prev.map(c => c.codigo === cupon.codigo ? { ...c, activo: !c.activo } : c));
    } catch {
      Swal.fire({ icon: 'error', title: 'Error al actualizar' });
    }
  };

  const eliminar = async (codigo) => {
    const { isConfirmed } = await Swal.fire({
      title: `¿Eliminar cupón ${codigo}?`,
      icon:  'warning',
      showCancelButton:   true,
      confirmButtonText:  'Sí, eliminar',
      cancelButtonText:   'Cancelar',
      confirmButtonColor: '#EF4444',
    });
    if (!isConfirmed) return;
    await fetch(`/api/cupones/${codigo}`, { method: 'DELETE' });
    setCupones(prev => prev.filter(c => c.codigo !== codigo));
  };

  const copiar = (texto) => {
    navigator.clipboard.writeText(texto);
    Swal.fire({ icon: 'success', title: '¡Copiado!', timer: 1000, showConfirmButton: false });
  };

  const vencido = (v) => v && new Date() > new Date(v);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-text flex items-center gap-2">
            <Tag size={22} className="text-brand-primary" />
            Cupones de descuento
          </h1>
          <p className="text-sm text-brand-muted mt-0.5">Creá y gestioná códigos de descuento para tus clientes</p>
        </div>
        <div className="flex gap-2">
          <button onClick={cargar} className="btn-secondary flex items-center gap-2 text-sm px-3 py-2">
            <RefreshCw size={14} /> Recargar
          </button>
          <button onClick={() => { setShowForm(true); setEditando(null); }}
            className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
            <Plus size={14} /> Nuevo cupón
          </button>
        </div>
      </div>

      {/* Formulario crear */}
      {showForm && !editando && (
        <CuponForm
          onGuardar={crearCupon}
          onCancelar={() => setShowForm(false)}
        />
      )}

      {/* Formulario editar */}
      {editando && (
        <CuponForm
          inicial={{ ...editando, vencimiento: editando.vencimiento || '' }}
          onGuardar={actualizarCupon}
          onCancelar={() => setEditando(null)}
        />
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full" />
        </div>
      ) : cupones.length === 0 ? (
        <div className="card text-center py-16 text-brand-muted">
          <Tag size={40} className="mx-auto mb-3 text-gray-200" />
          <p>No hay cupones creados todavía.</p>
          <button onClick={() => setShowForm(true)} className="text-brand-primary hover:underline text-sm mt-2">
            Crear el primero
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide">Código</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide hidden md:table-cell">Descripción</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide">Descuento</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide hidden sm:table-cell">Usos</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide hidden lg:table-cell">Vencimiento</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide">Estado</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cupones.map(c => (
                <tr key={c.codigo} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${!c.activo ? 'opacity-60' : ''}`}>
                  {/* Código */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-brand-text bg-gray-100 px-2 py-0.5 rounded text-xs">
                        {c.codigo}
                      </span>
                      <button onClick={() => copiar(c.codigo)} className="text-brand-muted hover:text-brand-primary" title="Copiar">
                        <Copy size={12} />
                      </button>
                    </div>
                  </td>
                  {/* Descripción */}
                  <td className="px-4 py-3 text-brand-muted hidden md:table-cell">{c.descripcion || '—'}</td>
                  {/* Descuento */}
                  <td className="px-4 py-3 text-center">
                    <span className="font-bold text-brand-text">
                      {c.tipo === 'porcentaje' ? `${c.valor}%` : `$${c.valor.toLocaleString('es-AR')}`}
                    </span>
                    {c.montoMinimo > 0 && (
                      <p className="text-[10px] text-brand-muted">mín. ${c.montoMinimo.toLocaleString('es-AR')}</p>
                    )}
                  </td>
                  {/* Usos */}
                  <td className="px-4 py-3 text-center text-brand-muted hidden sm:table-cell">
                    {c.usosActuales}{c.usoMaximo ? `/${c.usoMaximo}` : ''}
                  </td>
                  {/* Vencimiento */}
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    {c.vencimiento ? (
                      <span className={`text-xs ${vencido(c.vencimiento) ? 'text-red-500 font-medium' : 'text-brand-muted'}`}>
                        {vencido(c.vencimiento) ? '⚠ ' : ''}{new Date(c.vencimiento).toLocaleDateString('es-AR')}
                      </span>
                    ) : (
                      <span className="text-xs text-brand-muted">Sin vencimiento</span>
                    )}
                  </td>
                  {/* Estado */}
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleActivo(c)} title={c.activo ? 'Desactivar' : 'Activar'}>
                      {c.activo
                        ? <ToggleRight size={22} className="text-green-500" />
                        : <ToggleLeft  size={22} className="text-gray-300" />
                      }
                    </button>
                  </td>
                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setEditando(c)} className="p-1.5 text-brand-muted hover:text-brand-primary hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => eliminar(c.codigo)} className="p-1.5 text-brand-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
