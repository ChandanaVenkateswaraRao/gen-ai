import { NextResponse } from 'next/server';
import { findUserById, getDocumentChunks } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ docId: string }> }
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

  const { docId } = await params;
  const chunks = getDocumentChunks(docId);
  return NextResponse.json(chunks);
}
