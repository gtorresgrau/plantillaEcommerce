// src/app/api/reviews/admin/route.js — Todas las reseñas para moderación (admin)
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();

    const reviews = await Review.find({})
      .sort({ aprobado: 1, createdAt: -1 }) // pendientes primero
      .lean();

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
