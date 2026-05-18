// src/app/api/auth/logout/route.js
import { NextResponse } from 'next/server';
import { deleteAuthCookie } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  return deleteAuthCookie(response);
}
