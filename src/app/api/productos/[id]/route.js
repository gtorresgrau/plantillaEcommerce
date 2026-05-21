// src/app/api/productos/[id]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Producto from '@/models/Product';
import { getAuthUser } from '@/lib/auth';
import { deleteImage } from '@/lib/cloudinary';
import { PRODUCTOS_PRUEBA } from '@/data/productosDePrueba';

// ─── GET: Obtener producto por cod_producto ────────────────────────────────────
export async function GET(request, { params }) {
  try {
    await connectDB();
    const producto = await Producto.findOne({ cod_producto: params.id }).lean();
    if (producto) return NextResponse.json({ success: true, data: producto });

    // Fallback a demo products
    const demo = PRODUCTOS_PRUEBA.find(p => p.cod_producto === params.id);
    if (demo) {
      const precioFinal = demo.descuento > 0 ? Math.round(demo.precio * (1 - demo.descuento / 100)) : demo.precio;
      return NextResponse.json({ success: true, data: { ...demo, precioFinal } });
    }

    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// ─── PUT: Actualizar producto ──────────────────────────────────────────────────
export async function PUT(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user || !['admin', 'superAdmin', 'vendedor'].includes(user.rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    delete body.cod_producto; // No se puede cambiar el código

    const producto = await Producto.findOneAndUpdate(
      { cod_producto: params.id },
      { $set: body },
      { new: true, runValidators: true }
    );
    if (!producto) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    return NextResponse.json({ success: true, data: producto });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// ─── DELETE: Eliminar producto ─────────────────────────────────────────────────
export async function DELETE(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user || !['admin', 'superAdmin'].includes(user.rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await connectDB();
    const producto = await Producto.findOne({ cod_producto: params.id });
    if (!producto) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });

    // Eliminar imágenes de Cloudinary
    const fotos = [producto.foto_1_1, producto.foto_1_2, producto.foto_1_3, producto.foto_1_4].filter(Boolean);
    for (const foto of fotos) {
      try {
        // Extraer publicId de la URL de Cloudinary
        const parts = foto.split('/');
        const publicId = parts.slice(-2).join('/').split('.')[0];
        await deleteImage(publicId);
      } catch (e) {
        console.error('Error eliminando imagen de Cloudinary:', e.message);
      }
    }

    await Producto.deleteOne({ cod_producto: params.id });
    return NextResponse.json({ success: true, message: 'Producto eliminado' });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
