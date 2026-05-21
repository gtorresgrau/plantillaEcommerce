'use client';
import { useState, useEffect } from 'react';
import { Search, UserCheck, UserX } from 'lucide-react';
import Swal from 'sweetalert2';

const ROL_COLORS = {
  superAdmin: 'bg-purple-100 text-purple-700',
  admin:      'bg-blue-100 text-blue-700',
  vendedor:   'bg-green-100 text-green-700',
  cliente:    'bg-gray-100 text-gray-600',
};

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/super-admin/usuarios');
      const data = await res.json();
      setUsuarios(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsuarios(); }, []);

  const cambiarRol = async (userId, nuevoRol) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Cambiar rol?',
      text:  `El usuario pasará a ser "${nuevoRol}"`,
      icon:  'question',
      showCancelButton: true,
      confirmButtonText: 'Cambiar',
    });
    if (!isConfirmed) return;

    const res = await fetch(`/api/super-admin/usuarios/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rol: nuevoRol }),
    });
    if (res.ok) {
      setUsuarios(prev => prev.map(u => u._id === userId ? { ...u, rol: nuevoRol } : u));
      Swal.fire({ icon: 'success', title: 'Rol actualizado', timer: 1500, showConfirmButton: false });
    }
  };

  const filtrados = busqueda
    ? usuarios.filter(u =>
        `${u.nombre} ${u.apellido}`.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email.toLowerCase().includes(busqueda.toLowerCase())
      )
    : usuarios;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-6">Usuarios</h1>

      <div className="relative mb-4 max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar usuario..."
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
        />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-3 px-2 text-left text-brand-muted font-normal">Nombre</th>
              <th className="py-3 px-2 text-left text-brand-muted font-normal">Email</th>
              <th className="py-3 px-2 text-left text-brand-muted font-normal">Rol</th>
              <th className="py-3 px-2 text-left text-brand-muted font-normal">Registro</th>
              <th className="py-3 px-2 text-left text-brand-muted font-normal">Cambiar rol</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
              ))
              : filtrados.map(u => (
                <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium text-brand-text">{u.nombre} {u.apellido}</td>
                  <td className="py-3 px-2 text-brand-muted">{u.email}</td>
                  <td className="py-3 px-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROL_COLORS[u.rol] || 'bg-gray-100 text-gray-600'}`}>{u.rol}</span>
                  </td>
                  <td className="py-3 px-2 text-brand-muted text-xs">{new Date(u.createdAt).toLocaleDateString('es-AR')}</td>
                  <td className="py-3 px-2">
                    {u.rol !== 'superAdmin' && (
                      <select
                        value={u.rol}
                        onChange={e => cambiarRol(u._id, e.target.value)}
                        className="border border-gray-200 rounded px-2 py-1 text-xs text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white"
                      >
                        <option value="cliente">Cliente</option>
                        <option value="vendedor">Vendedor</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))
            }
            {!loading && filtrados.length === 0 && (
              <tr><td colSpan={5} className="py-12 text-center text-brand-muted">No se encontraron usuarios</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
