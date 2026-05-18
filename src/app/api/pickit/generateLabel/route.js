// src/app/api/pickit/generateLabel/route.js
import { NextResponse } from 'next/server';
import { pickitGenerateLabel } from '@/lib/pickit';
import { getAuthUser } from '@/lib/auth';

export async function POST(request) {
  try {
    const user = await getAuthUser();
    if (!user || !['admin', 'superAdmin'].includes(user.rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { arrayTransactionId } = await request.json();
    if (!arrayTransactionId?.length) {
      return NextResponse.json({ error: 'arrayTransactionId requerido' }, { status: 400 });
    }

    const pdfBuffer = await pickitGenerateLabel(arrayTransactionId);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="etiqueta-pickit.pdf"`,
      },
    });
  } catch (error) {
    console.error('[Pickit generateLabel]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
