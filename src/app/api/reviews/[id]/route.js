// src/app/api/reviews/[id]/route.js — Aprobar / destacar / eliminar (admin)
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';
import Producto from '@/models/Product';
import { requireRole } from '@/lib/auth';

// ─── Recalcula promedio y cantResenas del producto ────────────────────────────
async function recalcularPromedio(cod_producto) {
  const agg = await Review.aggregate([
    { $match: { cod_producto, aprobado: true } },
    { $group: { _id: null, promedio: { $avg: '$rating' }, total: { $sum: 1 } } },
  ]);
  const promedio    = agg[0] ? Math.round(agg[0].promedio * 10) / 10 : 0;
  const cantResenas = agg[0]?.total || 0;
  await Producto.updateOne({ cod_producto }, { $set: { promedio, cantResenas } });
}

// PATCH: aprobar o destacar reseña
export async function PATCH(request, { params }) {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();

    const body    = await request.json();
    const allowed = ['aprobado', 'destacado'];
    const update  = {};
    for (const k of allowed) {
      if (typeof body[k] === 'boolean') update[k] = body[k];
    }

    const review = await Review.findByIdAndUpdate(params.id, { $set: update }, { new: true });
    if (!review) return NextResponse.json({ error: 'Reseña no encontrada' }, { status: 404 });

    // Si cambió el campo "aprobado", recalcular promedio del producto
    if (typeof update.aprobado === 'boolean') {
      await recalcularPromedio(review.cod_producto);
    }

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: eliminar reseña
export async function DELETE(request, { params }) {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();

    const review = await Review.findByIdAndDelete(params.id);
    if (review?.aprobado && review?.cod_producto) {
      await recalcularPromedio(review.cod_producto);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
