// src/app/api/productos/filtros/route.js
// Devuelve las categorías y marcas únicas de los productos activos.
// Usado por el sidebar de /productos para mostrar filtros dinámicos.
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Producto from '@/models/Product';

export async function GET() {
  try {
    await connectDB();

    const [categorias, marcas] = await Promise.all([
      Producto.distinct('categoria', { activo: true, visible: true, categoria: { $nin: [null, ''] } }),
      Producto.distinct('marca',     { activo: true, visible: true, marca:     { $nin: [null, ''] } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        categorias: categorias.sort(),
        marcas:     marcas.sort(),
      },
    });
  } catch (error) {
    console.error('[GET /api/productos/filtros]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
