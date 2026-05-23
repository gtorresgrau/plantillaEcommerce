// middleware.js — Protección de rutas por rol (Edge Runtime)
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

async function verifyToken(token) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  return jwtVerify(token, secret);
}

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const token    = request.cookies.get('token')?.value;

  // ─── Si ya tiene sesión, redirigir fuera de login/register ────────────────
  const authPages = ['/login', '/register'];
  if (token && authPages.some((p) => pathname === p)) {
    try {
      const { payload } = await verifyToken(token);
      const rol = payload.rol;
      if (rol === 'superAdmin') return NextResponse.redirect(new URL('/super-admin', request.url));
      if (rol === 'admin')      return NextResponse.redirect(new URL('/admin', request.url));
      if (rol === 'vendedor')   return NextResponse.redirect(new URL('/vendedor', request.url));
      return NextResponse.redirect(new URL('/mi-cuenta', request.url));
    } catch {
      // Token inválido → dejar pasar a login
      return NextResponse.next();
    }
  }

  // ─── Rutas protegidas: sin token → redirigir al login ─────────────────────
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // ─── Token presente: verificar y aplicar reglas de rol ────────────────────
  try {
    const { payload } = await verifyToken(token);
    const rol = payload.rol;

    // /super-admin → solo superAdmin
    if (pathname.startsWith('/super-admin') && rol !== 'superAdmin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // /admin/stock → también accesible para vendedor
    const adminStockPath = pathname === '/admin/stock';
    if (adminStockPath && !['admin', 'superAdmin', 'vendedor'].includes(rol)) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // /admin → admin y superAdmin (excepto /admin/stock ya tratado arriba)
    if (pathname.startsWith('/admin') && !adminStockPath && rol !== 'admin' && rol !== 'superAdmin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // /vendedor → vendedor, admin, superAdmin
    if (pathname.startsWith('/vendedor') && !['vendedor', 'admin', 'superAdmin'].includes(rol)) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // /mi-cuenta → redirigir a panel si tiene rol privilegiado
    if (pathname === '/mi-cuenta') {
      if (rol === 'superAdmin') return NextResponse.redirect(new URL('/super-admin', request.url));
      if (rol === 'admin')      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // APIs protegidas: verificación de rol se hace dentro de cada route handler
    return NextResponse.next();

  } catch (err) {
    // Token expirado o inválido → limpiar cookie y redirigir
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: [
    // Paneles — siempre requieren sesión
    '/admin/:path*',
    '/super-admin/:path*',
    '/vendedor/:path*',
    '/mi-cuenta/:path*',
    // Auth — redirige si ya está logueado
    '/login',
    '/register',
    // APIs admin/super-admin
    '/api/super-admin/:path*',
    '/api/reportes/:path*',
    // /checkout y /carrito NO están aquí → compra como invitado permitida
  ],
};
