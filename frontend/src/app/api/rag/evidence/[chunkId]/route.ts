import { NextResponse } from 'next/server';
import { findUserById, documentChunks } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ chunkId: string }> }
) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json(
      { detail: 'Authentication credentials required.' },
      { status: 401 }
    );
  }

  const user = findUserById(userId);
  if (!user) {
    return NextResponse.json(
      { detail: 'Invalid user session. Please log in again.' },
      { status: 401 }
    );
  }

  const { chunkId } = await params;
  const chunk = documentChunks.find((c) => c.id === chunkId);
  if (!chunk) {
    return NextResponse.json(
      { detail: 'Evidence chunk not found.' },
      { status: 404 }
    );
  }

  return NextResponse.json(chunk);
}
