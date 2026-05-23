'use client';
// src/app/admin/productos/importar/page.jsx
// Importación masiva de productos desde CSV o Excel
import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, ArrowLeft, Download, X } from 'lucide-react';
import Swal from 'sweetalert2';

// ── Columnas esperadas y sus aliases ──────────────────────────────────────────
const COLUMN_MAP = {
  cod_producto:       ['cod_producto', 'codigo', 'sku', 'id', 'code'],
  titulo_de_producto: ['titulo_de_producto', 'titulo', 'nombre', 'name', 'title', 'producto'],
  precio:             ['precio', 'price', 'pvp'],
  precio_costo:       ['precio_costo', 'costo', 'cost'],
  descuento:          ['descuento', 'discount', 'desc%'],
  stock:              ['stock', 'cantidad', 'qty', 'inventory'],
  categoria:          ['categoria', 'category', 'rubro'],
  subcategoria:       ['subcategoria', 'subcategory'],
  marca:              ['marca', 'brand'],
  modelo:             ['modelo', 'model'],
  descripcion:        ['descripcion', 'description', 'detalle'],
  foto1:              ['foto1', 'foto_1_1', 'imagen', 'image', 'img', 'foto'],
  foto2:              ['foto2', 'foto_1_2', 'imagen2', 'image2'],
  foto3:              ['foto3', 'foto_1_3', 'imagen3', 'image3'],
  foto4:              ['foto4', 'foto_1_4', 'imagen4', 'image4'],
  destacado:          ['destacado', 'featured', 'destacar'],
  novedad:            ['novedad', 'nuevo', 'new', 'novedad'],
  visible:            ['visible', 'activo', 'active', 'publicado'],
};

function normalizeHeader(h) {
  return h.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

function mapRow(headers, values) {
  const raw = {};
  headers.forEach((h, i) => { raw[normalizeHeader(h)] = values[i]?.toString().trim() || ''; });

  const out = {};
  for (const [field, aliases] of Object.entries(COLUMN_MAP)) {
    for (const alias of aliases) {
      if (raw[alias] !== undefined) { out[field] = raw[alias]; break; }
    }
  }
  return out;
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const sep = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(sep).map(h => h.replace(/^"|"$/g, '').trim());
  return lines.slice(1).map(line => {
    const vals = line.split(sep).map(v => v.replace(/^"|"$/g, '').trim());
    return mapRow(headers, vals);
  }).filter(r => r.cod_producto);
}

// ── Plantilla de descarga ─────────────────────────────────────────────────────
function descargarPlantilla() {
  const headers = ['cod_producto','titulo_de_producto','precio','precio_costo','descuento','stock','categoria','marca','modelo','descripcion','foto1','foto2','destacado','novedad','visible'];
  const ejemplo = ['PROD-001','Ejemplo Producto',1999,1200,0,10,'Electrónica','MiMarca','Modelo X','Descripción del producto','','',0,0,1];
  const csv = [headers.join(','), ejemplo.join(',')].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantilla_productos.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ── Componente de preview ─────────────────────────────────────────────────────
function PreviewTable({ rows }) {
  const cols = ['cod_producto','titulo_de_producto','precio','stock','categoria','marca'];
  return (
    <div className="overflow-x-auto max-h-72 overflow-y-auto border border-gray-200 rounded-lg">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            {cols.map(c => (
              <th key={c} className="py-2 px-3 text-left text-brand-muted font-normal whitespace-nowrap">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 20).map((row, i) => (
            <tr key={i} className={`border-t border-gray-100 ${!row.cod_producto || !row.titulo_de_producto || !row.precio ? 'bg-red-50' : ''}`}>
              {cols.map(c => (
                <td key={c} className="py-1.5 px-3 text-brand-text truncate max-w-[120px]">{row[c] || <span className="text-red-400">—</span>}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 20 && (
        <div className="text-center text-xs text-brand-muted py-2 bg-gray-50">
          Mostrando 20 de {rows.length} filas
        </div>
      )}
    </div>
  );
}

export default function ImportarProductosPage() {
  const [archivo,    setArchivo]   = useState(null);
  const [rows,       setRows]      = useState([]);
  const [modo,       setModo]      = useState('upsert');
  const [loading,    setLoading]   = useState(false);
  const [resultado,  setResultado] = useState(null);
  const [dragging,   setDragging]  = useState(false);
  const inputRef = useRef();

  const procesarArchivo = useCallback((file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'txt'].includes(ext)) {
      Swal.fire({ icon: 'warning', title: 'Formato no soportado', text: 'Por ahora solo se aceptan archivos CSV (.csv). Descargá la plantilla para el formato correcto.' });
      return;
    }
    setArchivo(file);
    setResultado(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parsed = parseCSV(text);
      setRows(parsed);
    };
    reader.readAsText(file, 'UTF-8');
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    procesarArchivo(file);
  };

  const importar = async () => {
    if (!rows.length) return;

    const validos = rows.filter(r => r.cod_producto && r.titulo_de_producto && r.precio);
    const invalidos = rows.length - validos.length;

    const { isConfirmed } = await Swal.fire({
      title:  `Importar ${validos.length} productos`,
      html:   `Modo: <strong>${{ upsert: 'Crear o actualizar', solo_nuevos: 'Solo nuevos', reemplazar: 'Reemplazar todo' }[modo]}</strong>${invalidos > 0 ? `<br><span class="text-red-500">${invalidos} filas sin datos obligatorios serán omitidas</span>` : ''}`,
      icon:   modo === 'reemplazar' ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonText: 'Importar',
      cancelButtonText:  'Cancelar',
    });
    if (!isConfirmed) return;

    setLoading(true);
    setResultado(null);
    try {
      const res = await fetch('/api/admin/productos/importar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productos: validos, modo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al importar');
      setResultado(data.resultados);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const limpiar = () => {
    setArchivo(null);
    setRows([]);
    setResultado(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const invalidos = rows.filter(r => !r.cod_producto || !r.titulo_de_producto || !r.precio).length;

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/productos" className="text-brand-muted hover:text-brand-text transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-brand-text">Importar productos</h1>
      </div>

      {/* Zona de upload */}
      {!archivo ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragging ? 'border-brand-primary bg-blue-50' : 'border-gray-200 hover:border-brand-primary hover:bg-gray-50'}`}
        >
          <Upload size={36} className="mx-auto text-brand-muted mb-3" />
          <p className="font-medium text-brand-text mb-1">Arrastrá tu archivo CSV aquí</p>
          <p className="text-sm text-brand-muted mb-4">o hacé clic para seleccionarlo</p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={e => procesarArchivo(e.target.files[0])}
          />
          <button
            onClick={e => { e.stopPropagation(); descargarPlantilla(); }}
            className="inline-flex items-center gap-2 text-xs text-brand-primary border border-brand-primary rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
          >
            <Download size={13} /> Descargar plantilla CSV
          </button>
        </div>
      ) : (
        <div className="card mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={20} className="text-brand-primary" />
              <div>
                <p className="font-medium text-brand-text text-sm">{archivo.name}</p>
                <p className="text-xs text-brand-muted">{rows.length} filas detectadas{invalidos > 0 ? ` · ${invalidos} con errores` : ''}</p>
              </div>
            </div>
            <button onClick={limpiar} className="text-brand-muted hover:text-brand-text">
              <X size={18} />
            </button>
          </div>

          {rows.length > 0 && <PreviewTable rows={rows} />}

          {invalidos > 0 && (
            <div className="flex items-start gap-2 mt-3 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-700">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{invalidos} filas no tienen cod_producto, titulo_de_producto o precio y serán omitidas.</span>
            </div>
          )}
        </div>
      )}

      {/* Opciones de importación */}
      {rows.length > 0 && !resultado && (
        <div className="card mb-5">
          <h2 className="font-semibold text-brand-text mb-3">Modo de importación</h2>
          <div className="space-y-2">
            {[
              { value: 'upsert',      label: 'Crear o actualizar',  desc: 'Si el cod_producto ya existe, actualiza sus datos. Si no existe, lo crea.' },
              { value: 'solo_nuevos', label: 'Solo nuevos',          desc: 'Ignora productos que ya existen en la tienda.' },
              { value: 'reemplazar',  label: 'Reemplazar todo',      desc: '⚠️ Elimina TODOS los productos actuales y los reemplaza con los del archivo.' },
            ].map(opt => (
              <label key={opt.value} className={`flex items-start gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${modo === opt.value ? 'border-brand-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" value={opt.value} checked={modo === opt.value} onChange={() => setModo(opt.value)} className="accent-brand-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-brand-text">{opt.label}</p>
                  <p className="text-xs text-brand-muted">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={importar}
            disabled={loading || rows.filter(r => r.cod_producto && r.titulo_de_producto && r.precio).length === 0}
            className="btn-primary w-full mt-4 py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading
              ? <><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Importando...</>
              : <><Upload size={16} /> Importar {rows.filter(r => r.cod_producto && r.titulo_de_producto && r.precio).length} productos</>
            }
          </button>
        </div>
      )}

      {/* Resultado */}
      {resultado && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={20} className="text-green-500" />
            <h2 className="font-semibold text-brand-text">Importación completada</h2>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-600">{resultado.creados}</p>
              <p className="text-xs text-green-700 mt-0.5">Creados</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">{resultado.actualizados}</p>
              <p className="text-xs text-blue-700 mt-0.5">Actualizados</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-600">{resultado.omitidos}</p>
              <p className="text-xs text-gray-600 mt-0.5">Omitidos</p>
            </div>
          </div>

          {resultado.errores?.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-sm font-medium text-red-700 mb-2">Errores ({resultado.errores.length})</p>
              <ul className="space-y-1">
                {resultado.errores.slice(0, 10).map((e, i) => (
                  <li key={i} className="text-xs text-red-600">
                    <span className="font-mono font-bold">{e.cod}</span>: {e.error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <Link href="/admin/productos" className="btn-primary flex-1 py-2.5 text-center text-sm">
              Ver productos
            </Link>
            <button onClick={limpiar} className="btn-secondary flex-1 py-2.5 text-sm">
              Nueva importación
            </button>
          </div>
        </div>
      )}

      {/* Ayuda */}
      <div className="mt-5 p-4 bg-gray-50 rounded-xl text-xs text-brand-muted space-y-1">
        <p className="font-medium text-brand-text mb-2">Columnas del CSV</p>
        <p><strong>Obligatorias:</strong> cod_producto, titulo_de_producto, precio</p>
        <p><strong>Opcionales:</strong> precio_costo, descuento, stock, categoria, marca, modelo, descripcion, foto1, foto2, foto3, foto4, destacado, novedad, visible</p>
        <p className="mt-1">Usá <strong>1</strong> para verdadero y <strong>0</strong> para falso en los campos booleanos. El separador puede ser coma (,) o punto y coma (;).</p>
      </div>
    </div>
  );
}
