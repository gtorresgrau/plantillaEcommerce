'use client';
// src/app/admin/usuarios/page.jsx — Gestión de clientes y vendedores
import { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Users } from 'lucide-react';
import Swal from 'sweetalert2';

const ROL_COLORS = {
  vendedor: 'bg-green-100 text-green-700',
  cliente:  'bg-gray-100 text-gray-600',
};

const ROL_LABELS = { cliente: 'Cliente', vendedor: 'Vendedor' };

export default function AdminUsuariosPage() {
  const [usuarios,  setUsuarios]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [busqueda,  setBusqueda]  = useState('');
  const [filtroRol, setFiltroRol] = useState('');

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (busqueda)  params.set('q',   busqueda);
      if (filtroRol) params.set('rol', filtroRol);
      const res  = await fetch(`/api/admin/usuarios?${params}`);
      const data = await res.json();
      setUsuarios(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsuarios(); }, [busqueda, filtroRol]);

  const cambiarRol = async (userId, nuevoRol) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Cambiar rol?',
      text:  `El usuario pasará a ser "${ROL_LABELS[nuevoRol] || nuevoRol}"`,
      icon:  'question',
      showCancelButton: true,
      confirmButtonText: 'Cambiar',
      cancelButtonText:  'Cancelar',
    });
    if (!isConfirmed) return;

    const res = await fetch(`/api/admin/usuarios/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rol: nuevoRol }),
    });
    if (res.ok) {
      setUsuarios(prev => prev.map(u => u._id === userId ? { ...u, rol: nuevoRol } : u));
      Swal.fire({ icon: 'success', title: 'Rol actualizado', timer: 1500, showConfirmButton: false });
    }
  };

  const toggleActivo = async (u) => {
    const accion = u.activo ? 'desactivar' : 'activar';
    const { isConfirmed } = await Swal.fire({
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario?`,
      text:  `${u.nombre} ${u.apellido} (${u.email})`,
      icon:  'warning',
      showCancelButton: true,
      confirmButtonText: accion.charAt(0).toUpperCase() + accion.slice(1),
    });
    if (!isConfirmed) return;

    const res = await fetch(`/api/admin/usuarios/${u._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: !u.activo }),
    });
    if (res.ok) {
      setUsuarios(prev => prev.map(us => us._id === u._id ? { ...us, activo: !us.activo } : us));
    }
  };

  const totalClientes  = usuarios.filter(u => u.rol === 'cliente').length;
  const totalVendedores = usuarios.filter(u => u.rol === 'vendedor').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-text">Usuarios</h1>
        <div className="flex gap-3 text-sm">
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{totalClientes} clientes</span>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">{totalVendedores} vendedores</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
          />
        </div>
        <select
          value={filtroRol}
          onChange={e => setFiltroRol(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-brand-text bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
        >
          <option value="">Todos los roles</option>
          <option value="cliente">Clientes</option>
          <option value="vendedor">Vendedores</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-3 px-2 text-left text-brand-muted font-normal">Nombre</th>
              <th className="py-3 px-2 text-left text-brand-muted font-normal">Email</th>
              <th className="py-3 px-2 text-left text-brand-muted font-normal">Rol</th>
              <th className="py-3 px-2 text-left text-brand-muted font-normal">Estado</th>
              <th className="py-3 px-2 text-left text-brand-muted font-normal">Registro</th>
              <th className="py-3 px-2 text-left text-brand-muted font-normal">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="py-3 px-2">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : usuarios.map(u => (
                  <tr key={u._id} className={`border-b border-gray-50 hover:bg-gray-50 ${!u.activo ? 'opacity-50' : ''}`}>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-xs font-bold shrink-0">
                          {u.nombre?.[0]?.toUpperCase()}{u.apellido?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-brand-text">{u.nombre} {u.apellido}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-brand-muted">{u.email}</td>
                    <td className="py-3 px-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROL_COLORS[u.rol] || 'bg-gray-100'}`}>
                        {ROL_LABELS[u.rol] || u.rol}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.activo ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-brand-muted text-xs">
                      {new Date(u.createdAt).toLocaleDateString('es-AR')}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={u.rol}
                          onChange={e => cambiarRol(u._id, e.target.value)}
                          className="border border-gray-200 rounded px-2 py-1 text-xs text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white"
                        >
                          <option value="cliente">Cliente</option>
                          <option value="vendedor">Vendedor</option>
                        </select>
                        <button
                          onClick={() => toggleActivo(u)}
                          className="p-1 rounded hover:bg-gray-100 transition-colors"
                          title={u.activo ? 'Desactivar' : 'Activar'}
                        >
                          {u.activo
                            ? <UserX size={14} className="text-red-500" />
                            : <UserCheck size={14} className="text-green-500" />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
            }
            {!loading && usuarios.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <Users size={32} className="mx-auto text-brand-muted mb-3" />
                  <p className="text-brand-muted">No se encontraron usuarios</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
