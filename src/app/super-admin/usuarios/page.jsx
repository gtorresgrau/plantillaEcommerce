'use client';
// src/app/super-admin/usuarios/page.jsx — Gestión global de usuarios
import { useState, useEffect } from 'react';
import { Users, Search, Shield, ShieldOff, Trash2, RefreshCw, UserCheck } from 'lucide-react';
import Swal from 'sweetalert2';

const ROL_CONFIG = {
  superAdmin: { label: 'Super Admin', color: 'text-purple-300 bg-purple-900/50 border-purple-700' },
  admin:      { label: 'Admin',       color: 'text-blue-300 bg-blue-900/50 border-blue-700' },
  vendedor:   { label: 'Vendedor',    color: 'text-yellow-300 bg-yellow-900/50 border-yellow-700' },
  cliente:    { label: 'Cliente',     color: 'text-gray-300 bg-gray-800 border-gray-700' },
};

function timeAgo(date) {
  if (!date) return '—';
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (d === 0) return 'Hoy';
  if (d === 1) return 'Ayer';
  return `Hace ${d} días`;
}

export default function SuperAdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [rolFiltro, setRolFiltro] = useState('todos');

  const cargar = () => {
    setLoading(true);
    fetch('/api/super-admin/usuarios')
      .then(r => r.json())
      .then(d => setUsuarios(d.data || []))
      .catch(() => setUsuarios([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const cambiarRol = async (id, rolActual) => {
    const roles = ['cliente', 'vendedor', 'admin', 'superAdmin'];
    const opciones = roles.reduce((acc, r) => {
      acc[r] = ROL_CONFIG[r]?.label || r;
      return acc;
    }, {});

    const { value: nuevoRol } = await Swal.fire({
      title: 'Cambiar rol',
      input: 'select',
      inputOptions: opciones,
      inputValue: rolActual,
      showCancelButton: true,
      confirmButtonText: 'Cambiar',
      cancelButtonText: 'Cancelar',
      background: '#111827',
      color: '#F9FAFB',
    });

    if (!nuevoRol || nuevoRol === rolActual) return;

    const res = await fetch(`/api/super-admin/usuarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rol: nuevoRol }),
    });
    if (res.ok) {
      setUsuarios(prev => prev.map(u => u._id === id ? { ...u, rol: nuevoRol } : u));
      Swal.fire({ icon: 'success', title: 'Rol actualizado', timer: 1500, showConfirmButton: false });
    }
  };

  const eliminar = async (id, email) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar usuario?',
      text: email,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
      background: '#111827',
      color: '#F9FAFB',
    });
    if (!isConfirmed) return;
    const res = await fetch(`/api/super-admin/usuarios/${id}`, { method: 'DELETE' });
    if (res.ok) setUsuarios(prev => prev.filter(u => u._id !== id));
  };

  const filtrados = usuarios.filter(u => {
    const matchSearch = !search || [u.nombre, u.apellido, u.email].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchRol    = rolFiltro === 'todos' || u.rol === rolFiltro;
    return matchSearch && matchRol;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="text-purple-400" />
            Usuarios del sistema
          </h1>
          <p className="text-gray-400 mt-1">Gestión global de todos los usuarios registrados</p>
        </div>
        <button onClick={cargar} className="flex items-center gap-2 px-4 py-2 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 rounded-lg text-sm transition-colors">
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {['superAdmin', 'admin', 'vendedor', 'cliente'].map(r => (
          <div key={r} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{usuarios.filter(u => u.rol === r).length}</p>
            <p className="text-xs text-gray-400 mt-0.5">{ROL_CONFIG[r]?.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
          <Search size={15} className="text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="flex-1 bg-transparent text-sm text-gray-200 focus:outline-none placeholder-gray-500"
          />
        </div>
        <select
          value={rolFiltro}
          onChange={e => setRolFiltro(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none"
        >
          <option value="todos">Todos los roles</option>
          <option value="superAdmin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="vendedor">Vendedor</option>
          <option value="cliente">Cliente</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin h-8 w-8 border-b-2 border-purple-500 rounded-full" />
          </div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <UserCheck size={40} className="text-gray-700" />
            <p className="text-gray-500">Sin resultados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800 bg-gray-800/50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Usuario</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Rol</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium hidden md:table-cell">Registro</th>
                <th className="w-24 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtrados.map(u => {
                const cfg = ROL_CONFIG[u.rol] || ROL_CONFIG.cliente;
                return (
                  <tr key={u._id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-900/50 border border-purple-700/50 flex items-center justify-center text-sm font-bold text-purple-300 flex-shrink-0">
                          {(u.nombre?.[0] || u.email?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-200">{u.nombre} {u.apellido}</p>
                          <p className="text-xs text-gray-500 sm:hidden">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{timeAgo(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => cambiarRol(u._id, u.rol)}
                          title="Cambiar rol"
                          className="p-1.5 text-gray-500 hover:text-purple-400 hover:bg-purple-900/30 rounded-lg transition-colors"
                        >
                          <Shield size={14} />
                        </button>
                        <button
                          onClick={() => eliminar(u._id, u.email)}
                          title="Eliminar usuario"
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {filtrados.length > 0 && (
        <p className="text-xs text-gray-600 mt-3 text-right">{filtrados.length} usuario{filtrados.length !== 1 ? 's' : ''}</p>
      )}
    </div>
  );
}
