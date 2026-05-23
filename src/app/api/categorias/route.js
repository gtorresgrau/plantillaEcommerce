// src/app/api/categorias/route.js
// Devuelve las categorías distintas con su cantidad de productos
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Producto from '@/models/Product';

export async function GET() {
  try {
    await connectDB();

    const resultado = await Producto.aggregate([
      { $match: { activo: true, visible: true, categoria: { $exists: true, $ne: '' } } },
      { $group: { _id: '$categoria', cantidad: { $sum: 1 } } },
      { $sort: { cantidad: -1 } },
      { $limit: 20 },
    ]);

    const categorias = resultado.map(r => ({
      nombre:   r._id,
      cantidad: r.cantidad,
    }));

    return NextResponse.json({ success: true, data: categorias });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
