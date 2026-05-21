// middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

async function verifyToken(token) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  return jwtVerify(token, secret);
}

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('token')?.value;

  // ─── Redirigir si ya está logueado ─────────────────────────────────────────
  const loginPaths = ['/login', '/register'];
  if (token && loginPaths.some((p) => pathname.startsWith(p))) {
    try {
      const { payload } = await verifyToken(token);
      const rol = payload.rol;
      if (rol === 'superAdmin') return NextResponse.redirect(new URL('/super-admin', request.url));
      if (rol === 'admin')      return NextResponse.redirect(new URL('/admin', request.url));
      return NextResponse.redirect(new URL('/mi-cuenta', request.url));
    } catch {
      return NextResponse.next();
    }
  }

  // ─── Rutas protegidas: requieren token válido ──────────────────────────────
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // ─── Validar token y roles ──────────────────────────────────────────────────
  try {
    const { payload } = await verifyToken(token);
    const rol = payload.rol;

    // SuperAdmin: acceso exclusivo a /super-admin
    if (pathname.startsWith('/super-admin') && rol !== 'superAdmin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Admin: acceso exclusivo a /admin
    if (pathname.startsWith('/admin') && rol !== 'admin' && rol !== 'superAdmin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Mi cuenta: redirigir superAdmin a su panel
    if (pathname.startsWith('/mi-cuenta') && rol === 'superAdmin') {
      return NextResponse.redirect(new URL('/super-admin', request.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error('[Middleware] Token inválido:', err.message);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: [
    // Paneles protegidos — siempre requieren login
    '/admin/:path*',
    '/super-admin/:path*',
    '/mi-cuenta/:path*',
    // Login/register: redirigir si ya autenticado
    '/login',
    '/register',
    // APIs protegidas
    '/api/super-admin/:path*',
    '/api/reportes/:path*',
    // Nota: /checkout, /carrito y /api/pedidos son accesibles sin login
    // El carrito y checkout permiten compra como invitado
    // Los pedidos validan internamente si el usuario es dueño del pedido
  ],
};
