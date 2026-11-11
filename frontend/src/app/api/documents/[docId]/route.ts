import { NextResponse } from 'next/server';
import { findUserById, deleteDocument } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function DELETE(
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

  if (user.role !== 'admin') {
    return NextResponse.json(
      { detail: 'Forbidden: Institutional Administrator privileges required.' },
      { status: 403 }
    );
  }

  const { docId } = await params;
  const success = deleteDocument(docId);
  if (!success) {
    return NextResponse.json({ detail: 'Document not found.' }, { status: 404 });
  }

  return NextResponse.json({ status: 'success', message: 'Document removed.' });
}
