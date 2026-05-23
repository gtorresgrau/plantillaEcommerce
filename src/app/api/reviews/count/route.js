// src/app/api/reviews/count/route.js — Reseñas pendientes para badge del admin
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireRole } from '@/lib/auth';
import mongoose from 'mongoose';

const Review = mongoose.models.Review
  || mongoose.model('Review', new mongoose.Schema({
    aprobado: { type: Boolean, default: false },
  }, { timestamps: true }));

export async function GET() {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();
    const pendientes = await Review.countDocuments({ aprobado: false });
    return NextResponse.json({ success: true, pendientes });
  } catch {
    return NextResponse.json({ success: false, pendientes: 0 });
  }
}
