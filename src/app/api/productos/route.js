// src/app/api/productos/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Producto from '@/models/Product';
import { getAuthUser } from '@/lib/auth';
import { PRODUCTOS_PRUEBA } from '@/data/productosDePrueba';

// ─── GET: Listar productos (público, con filtros) ──────────────────────────────
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const page      = parseInt(searchParams.get('page')     || '1');
    const limit     = parseInt(searchParams.get('limit')    || '24');
    const categoria = searchParams.get('categoria');
    const marca     = searchParams.get('marca');
    const destacado = searchParams.get('destacado');
    const novedad   = searchParams.get('novedad');
    const busqueda  = searchParams.get('busqueda') || searchParams.get('q');
    const ordenar   = searchParams.get('ordenar')  || 'reciente';
    const adminView = searchParams.get('admin')     === 'true';
    const soloDesc  = searchParams.get('descuento') === '1';
    const soloStock = searchParams.get('stock')     === '1';
    const precioMin = parseFloat(searchParams.get('precioMin') || '0');
    const precioMax = parseFloat(searchParams.get('precioMax') || '0');

    const filter = {};
    if (!adminView) {
      filter.activo  = true;
      filter.visible = true;
    }
    if (categoria)        filter.categoria = categoria;
    if (marca)            filter.marca     = marca;
    if (destacado === 'true') filter.destacado = true;
    if (novedad   === 'true') filter.novedad   = true;
    if (soloDesc)         filter.descuento = { $gt: 0 };
    if (soloStock)        filter.stock     = { $gt: 0 };
    if (precioMin || precioMax) {
      filter.precio = {};
      if (precioMin) filter.precio.$gte = precioMin;
      if (precioMax) filter.precio.$lte = precioMax;
    }
    if (busqueda) {
      filter.$or = [
        { titulo_de_producto: { $regex: busqueda, $options: 'i' } },
        { descripcion:        { $regex: busqueda, $options: 'i' } },
        { cod_producto:       { $regex: busqueda, $options: 'i' } },
        { marca:              { $regex: busqueda, $options: 'i' } },
        { categoria:          { $regex: busqueda, $options: 'i' } },
      ];
    }

    // Ordenamiento
    const sortMap = {
      reciente:    { createdAt: -1 },
      precio_asc:  { precio: 1 },
      precio_desc: { precio: -1 },
      nombre_asc:  { titulo_de_producto: 1 },
      destacado:   { destacado: -1, createdAt: -1 },
      rating:      { promedio: -1, cantResenas: -1 },
    };
    const sort = sortMap[ordenar] || { createdAt: -1 };

    const total = await Producto.countDocuments(filter);

    // Si la BD está vacía, devolver productos de prueba
    if (total === 0 && !adminView) {
      let demo = PRODUCTOS_PRUEBA.filter(p => p.activo && p.visible);
      if (categoria) demo = demo.filter(p => p.categoria === categoria);
      if (marca)     demo = demo.filter(p => p.marca     === marca);
      if (destacado === 'true') demo = demo.filter(p => p.destacado);
      if (novedad   === 'true') demo = demo.filter(p => p.novedad);
      if (soloDesc)  demo = demo.filter(p => p.descuento > 0);
      if (soloStock) demo = demo.filter(p => p.stock > 0);
      if (busqueda) {
        const q = busqueda.toLowerCase();
        demo = demo.filter(p =>
          p.titulo_de_producto.toLowerCase().includes(q) ||
          (p.marca || '').toLowerCase().includes(q) ||
          (p.categoria || '').toLowerCase().includes(q)
        );
      }
      if (precioMin) demo = demo.filter(p => p.precio >= precioMin);
      if (precioMax) demo = demo.filter(p => p.precio <= precioMax);

      // Ordenar demo
      if (ordenar === 'precio_asc')  demo.sort((a, b) => a.precio - b.precio);
      if (ordenar === 'precio_desc') demo.sort((a, b) => b.precio - a.precio);
      if (ordenar === 'nombre_asc')  demo.sort((a, b) => a.titulo_de_producto.localeCompare(b.titulo_de_producto));

      // Calcular precioFinal en demo
      const demoConPrecio = demo.map(p => ({
        ...p,
        precioFinal: p.descuento > 0 ? Math.round(p.precio * (1 - p.descuento / 100)) : p.precio,
      }));

      const start = (page - 1) * limit;
      return NextResponse.json({
        success: true,
        data:       demoConPrecio.slice(start, start + limit),
        pagination: { page, limit, total: demo.length, pages: Math.ceil(demo.length / limit) },
        demo: true,
      });
    }

    const skip = (page - 1) * limit;
    const productos = await Producto.find(filter)
      .sort(sort)
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

    if (!body.cod_producto || !body.titulo_de_producto || !body.precio) {
      return NextResponse.json({ error: 'cod_producto, titulo_de_producto y precio son requeridos' }, { status: 400 });
    }

    const producto = await Producto.create({ ...body, vendedor: user.id });
    return NextResponse.json({ success: true, data: producto }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'El código de producto ya existe' }, { status: 409 });
    }
    console.error('[POST /api/productos]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
