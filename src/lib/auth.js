// src/lib/auth.js
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const COOKIE_NAME = 'token';
const EXPIRES_IN = '7d';

// ─── Crear token JWT ───────────────────────────────────────────────────────────
export async function createToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(SECRET);
}

// ─── Verificar token JWT ───────────────────────────────────────────────────────
export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, SECRET);
  return payload;
}

// ─── Obtener usuario autenticado desde la cookie (Server Component / API Route) ─
export async function getAuthUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}

// ─── Verificar que el usuario tiene uno de los roles permitidos ───────────────
export async function requireRole(allowedRoles = []) {
  const user = await getAuthUser();
  if (!user) throw new Error('No autenticado');
  if (!allowedRoles.includes(user.rol)) {
    throw new Error(`Acceso denegado. Rol requerido: ${allowedRoles.join(' o ')}`);
  }
  return user;
}

// ─── Helper para setear la cookie en las API Routes ───────────────────────────
export function setAuthCookie(token, response) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: '/',
  });
  return response;
}

export function deleteAuthCookie(response) {
  response.cookies.delete(COOKIE_NAME);
  return response;
}
