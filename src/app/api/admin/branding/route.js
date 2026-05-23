// src/app/api/admin/branding/route.js
// El admin puede editar: banner, textos, secciones, testimonios
// NO puede modificar: colores, logos, tipografía (eso es exclusivo del superAdmin)
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import BrandingConfig from '@/models/BrandingConfig';
import { requireRole } from '@/lib/auth';

// GET: obtener branding actual (igual que el super-admin para el formulario)
export async function GET() {
  try {
    await connectDB();
    const branding = await BrandingConfig.findOne({ activo: true }).lean();
    return NextResponse.json({ success: true, data: branding || null });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: actualizar solo campos permitidos para el admin
export async function PUT(request) {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();

    const body = await request.json();

    // Lista blanca de campos que el admin puede actualizar
    const permitidos = {};
    if (body.banner      !== undefined) permitidos.banner      = body.banner;
    if (body.textos      !== undefined) permitidos.textos      = body.textos;
    if (body.secciones   !== undefined) permitidos.secciones   = body.secciones;
    if (body.testimonios !== undefined) permitidos.testimonios = body.testimonios;
    if (body.faqs        !== undefined) permitidos.faqs        = body.faqs;

    let branding = await BrandingConfig.findOne({ activo: true });
    if (!branding) {
      branding = await BrandingConfig.create({ activo: true, ...permitidos });
    } else {
      branding = await BrandingConfig.findByIdAndUpdate(
        branding._id,
        { $set: permitidos },
        { new: true, runValidators: true }
      );
    }

    return NextResponse.json({ success: true, data: branding });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
