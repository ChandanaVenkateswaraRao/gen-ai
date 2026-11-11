import { NextResponse } from 'next/server';
import { findUserById, updateComplaintStatus } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ complaintId: string }> }
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

  // Server-side role enforcement — never trust a role supplied by the browser.
  if (user.role !== 'admin') {
    return NextResponse.json(
      { detail: 'Forbidden: Institutional Administrator privileges required.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { status, admin_notes } = body;

    if (!status) {
      return NextResponse.json({ detail: 'Status is required.' }, { status: 400 });
    }

    const { complaintId } = await params;
    const updated = updateComplaintStatus(complaintId, status, admin_notes ?? null);
    if (!updated) {
      return NextResponse.json({ detail: 'Complaint record not found.' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { detail: 'Failed to update complaint status.' },
      { status: 500 }
    );
  }
}
