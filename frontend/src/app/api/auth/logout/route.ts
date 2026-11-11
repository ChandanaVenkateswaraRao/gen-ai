import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  // Server-side logout is a no-op for in-memory demo auth.
  // The client clears its local session and redirects to /login.
  return NextResponse.json({ ok: true });
}
