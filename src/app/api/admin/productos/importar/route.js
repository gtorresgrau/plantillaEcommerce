// src/app/api/admin/productos/importar/route.js
// Importación masiva de productos desde JSON (el cliente parsea el CSV/Excel)
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Producto from '@/models/Product';
import { requireRole } from '@/lib/auth';

export async function POST(request) {
  try {
    await requireRole(['admin', 'superAdmin']);
    await connectDB();

    const { productos, modo = 'upsert' } = await request.json();
    // modo: 'upsert' (crear o actualizar), 'solo_nuevos' (skip existentes), 'reemplazar' (borrar todo y crear)

    if (!Array.isArray(productos) || productos.length === 0) {
      return NextResponse.json({ error: 'No se enviaron productos' }, { status: 400 });
    }

    if (productos.length > 1000) {
      return NextResponse.json({ error: 'Máximo 1000 productos por importación' }, { status: 400 });
    }

    const resultados = { creados: 0, actualizados: 0, errores: [], omitidos: 0 };

    if (modo === 'reemplazar') {
      await Producto.deleteMany({});
    }

    for (const prod of productos) {
      try {
        if (!prod.cod_producto || !prod.titulo_de_producto || !prod.precio) {
          resultados.errores.push({ cod: prod.cod_producto || '?', error: 'Faltan campos obligatorios (cod_producto, titulo_de_producto, precio)' });
          continue;
        }

        const datos = {
          cod_producto:       String(prod.cod_producto).trim(),
          titulo_de_producto: String(prod.titulo_de_producto).trim(),
          nombre:             String(prod.nombre || prod.titulo_de_producto).trim(),
          descripcion:        String(prod.descripcion || '').trim(),
          precio:             parseFloat(prod.precio) || 0,
          precio_costo:       prod.precio_costo ? parseFloat(prod.precio_costo) : undefined,
          descuento:          prod.descuento ? parseFloat(prod.descuento) : 0,
          stock:              prod.stock !== undefined ? parseInt(prod.stock) : 0,
          categoria:          prod.categoria ? String(prod.categoria).trim() : '',
          subcategoria:       prod.subcategoria ? String(prod.subcategoria).trim() : '',
          marca:              prod.marca ? String(prod.marca).trim() : '',
          modelo:             prod.modelo ? String(prod.modelo).trim() : '',
          medidas:            prod.medidas ? String(prod.medidas).trim() : '',
          foto1:              prod.foto1 || prod.foto_1_1 || '',
          foto2:              prod.foto2 || prod.foto_1_2 || '',
          foto3:              prod.foto3 || prod.foto_1_3 || '',
          foto4:              prod.foto4 || prod.foto_1_4 || '',
          destacado:          prod.destacado === true || prod.destacado === 'true' || prod.destacado === '1',
          novedad:            prod.novedad   === true || prod.novedad   === 'true' || prod.novedad   === '1',
          visible:            prod.visible   !== false && prod.visible   !== 'false' && prod.visible   !== '0',
          activo:             prod.activo    !== false && prod.activo    !== 'false' && prod.activo    !== '0',
        };

        // Limpiar undefined
        Object.keys(datos).forEach(k => datos[k] === undefined && delete datos[k]);

        if (modo === 'solo_nuevos') {
          const existe = await Producto.findOne({ cod_producto: datos.cod_producto });
          if (existe) { resultados.omitidos++; continue; }
          await Producto.create(datos);
          resultados.creados++;
        } else {
          // upsert o reemplazar
          const result = await Producto.findOneAndUpdate(
            { cod_producto: datos.cod_producto },
            { $set: datos },
            { upsert: true, new: true, runValidators: false }
          );
          if (result.createdAt?.getTime() === result.updatedAt?.getTime()) {
            resultados.creados++;
          } else {
            resultados.actualizados++;
          }
        }
      } catch (err) {
        resultados.errores.push({ cod: prod.cod_producto || '?', error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      resultados,
      total: productos.length,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
