// src/app/api/cloudinary/upload/route.js
import { NextResponse } from 'next/server';
import { uploadImage, uploadLogo } from '@/lib/cloudinary';
import { getAuthUser } from '@/lib/auth';

export async function POST(request) {
  try {
    const user = await getAuthUser();
    if (!user || !['admin', 'superAdmin', 'vendedor'].includes(user.rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const formData = await request.formData();
    const file     = formData.get('file');
    const folder   = formData.get('folder') || 'productos';
    const tipo     = formData.get('tipo') || 'imagen'; // imagen | logo | favicon

    if (!file) return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });

    // Solo superAdmin puede subir logos/branding
    if (['logo', 'favicon', 'branding'].includes(tipo) && user.rol !== 'superAdmin') {
      return NextResponse.json({ error: 'Solo el superAdmin puede subir logos' }, { status: 403 });
    }

    // Convertir el archivo a base64
    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    let result;
    if (tipo === 'logo' || tipo === 'favicon' || tipo === 'branding') {
      result = await uploadLogo(base64, folder || 'branding');
    } else {
      result = await uploadImage(base64, folder);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[Cloudinary upload]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const config = { api: { bodyParser: false } };
