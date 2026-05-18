// src/app/api/productos/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Producto from '@/models/Product';
import { getAuthUser } from '@/lib/auth';

// ─── GET: Listar productos (público, con filtros) ──────────────────────────────
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const page     = parseInt(searchParams.get('page')  || '1');
    const limit    = parseInt(searchParams.get('limit') || '24');
    const categoria  = searchParams.get('categoria');
    const marca      = searchParams.get('marca');
    const destacado  = searchParams.get('destacado');
    const novedad    = searchParams.get('novedad');
    const busqueda   = searchParams.get('q');
    const ordenar    = searchParams.get('ordenar') || 'createdAt';
    const direction  = searchParams.get('dir') === 'asc' ? 1 : -1;
    const adminView  = searchParams.get('admin') === 'true';

    const filter = {};
    if (!adminView) {
      filter.activo   = true;
      filter.visible  = true;
    }
    if (categoria) filter.categoria = categoria;
    if (marca)     filter.marca     = marca;
    if (destacado === 'true') filter.destacado = true;
    if (novedad   === 'true') filter.novedad   = true;
    if (busqueda) {
      filter.$or = [
        { nombre:            { $regex: busqueda, $options: 'i' } },
        { titulo_de_producto:{ $regex: busqueda, $options: 'i' } },
        { descripcion:       { $regex: busqueda, $options: 'i' } },
        { cod_producto:      { $regex: busqueda, $options: 'i' } },
        { marca:             { $regex: busqueda, $options: 'i' } },
        { categoria:         { $regex: busqueda, $options: 'i' } },
      ];
    }

    const skip  = (page - 1) * limit;
    const total = await Producto.countDocuments(filter);
    const productos = await Producto.find(filter)
      .sort({ [ordenar]: direction })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: productos,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[GET /api/productos]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// ─── POST: Crear producto (admin / vendedor) ───────────────────────────────────
export async function POST(request) {
  try {
    const user = await getAuthUser();
    if (!user || !['admin', 'superAdmin', 'vendedor'].includes(user.rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();

    // Validaciones mínimas
    if (!body.cod_producto || !body.nombre || !body.precio) {
      return NextResponse.json({ error: 'cod_producto, nombre y precio son requeridos' }, { status: 400 });
    }

    const producto = await Producto.create({
      ...body,
      vendedor: user.id,
    });

    return NextResponse.json({ success: true, data: producto }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'El código de producto ya existe' }, { status: 409 });
    }
    console.error('[POST /api/productos]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
