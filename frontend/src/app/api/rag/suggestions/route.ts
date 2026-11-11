import { NextResponse } from 'next/server';
import { getSuggestions } from '@/lib/rag';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ suggestions: getSuggestions() });
}
