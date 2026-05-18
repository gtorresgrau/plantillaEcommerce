// src/app/api/super-admin/branding/route.js
// ─── EXCLUSIVO SUPERADMIN: Gestión de branding/identidad visual ────────────────
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import BrandingConfig from '@/models/BrandingConfig';
import { requireRole } from '@/lib/auth';

// GET: Obtener branding actual (público, para el layout)
export async function GET() {
  try {
    await connectDB();
    let branding = await BrandingConfig.findOne({ activo: true }).lean();
    if (!branding) {
      branding = await BrandingConfig.create({ activo: true });
      branding = branding.toObject();
    }
    return NextResponse.json({ success: true, data: branding });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Actualizar branding (solo superAdmin)
export async function PUT(request) {
  try {
    await requireRole(['superAdmin']);
    await connectDB();

    const body = await request.json();

    let branding = await BrandingConfig.findOne({ activo: true });
    if (!branding) {
      branding = await BrandingConfig.create({ ...body, activo: true });
    } else {
      branding = await BrandingConfig.findByIdAndUpdate(
        branding._id,
        { $set: body },
        { new: true, runValidators: true }
      );
    }

    return NextResponse.json({
      success: true,
      data: branding,
      message: 'Branding actualizado exitosamente',
    });
  } catch (error) {
    console.error('[SuperAdmin branding PUT]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Resetear branding a valores por defecto
export async function DELETE(request) {
  try {
    await requireRole(['superAdmin']);
    await connectDB();

    await BrandingConfig.deleteMany({});
    const branding = await BrandingConfig.create({ activo: true });

    return NextResponse.json({
      success: true,
      data: branding,
      message: 'Branding reseteado a valores por defecto',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
