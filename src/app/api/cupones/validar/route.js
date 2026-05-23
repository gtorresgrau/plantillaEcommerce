// src/app/api/cupones/validar/route.js — Valida un cupón en tiempo real (público)
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Cupon from '@/models/Cupon';

export async function POST(request) {
  try {
    await connectDB();
    const { codigo, subtotal = 0 } = await request.json();

    if (!codigo?.trim()) {
      return NextResponse.json({ error: 'Código requerido.' }, { status: 400 });
    }

    const cupon = await Cupon.findOne({ codigo: codigo.toUpperCase().trim() });

    if (!cupon) {
      return NextResponse.json({ error: 'Cupón no encontrado.', valido: false }, { status: 404 });
    }
    if (!cupon.activo) {
      return NextResponse.json({ error: 'Este cupón está inactivo.', valido: false }, { status: 400 });
    }
    if (cupon.vencimiento && new Date() > new Date(cupon.vencimiento)) {
      return NextResponse.json({ error: 'Este cupón ya venció.', valido: false }, { status: 400 });
    }
    if (cupon.usoMaximo !== null && cupon.usosActuales >= cupon.usoMaximo) {
      return NextResponse.json({ error: 'Este cupón ya alcanzó su límite de usos.', valido: false }, { status: 400 });
    }
    if (cupon.montoMinimo > 0 && subtotal < cupon.montoMinimo) {
      return NextResponse.json({
        error: `El monto mínimo para este cupón es $${cupon.montoMinimo.toLocaleString('es-AR')}.`,
        valido: false,
      }, { status: 400 });
    }

    // Calcular descuento
    const descuento = cupon.tipo === 'porcentaje'
      ? Math.round(subtotal * cupon.valor / 100)
      : Math.min(cupon.valor, subtotal); // el descuento no puede superar el subtotal

    return NextResponse.json({
      valido:      true,
      codigo:      cupon.codigo,
      tipo:        cupon.tipo,
      valor:       cupon.valor,
      descripcion: cupon.descripcion,
      descuento,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
