import { NextResponse } from 'next/server';
import { findUserById, createComplaint, getComplaintsForUser } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
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

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') ?? undefined;
  const category = searchParams.get('category') ?? undefined;

  const items = getComplaintsForUser(user, status, category);
  return NextResponse.json(items);
}

export async function POST(req: Request) {
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

  try {
    const body = await req.json();
    const { title, description, category, priority, room_number, block_name } = body;

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { detail: 'Title and description are required.' },
        { status: 400 }
      );
    }

    const created = createComplaint({
      title: title.trim(),
      description: description.trim(),
      category,
      priority: priority || 'Medium',
      room_number: room_number?.trim() || user.room_number || 'Unassigned',
      block_name: block_name?.trim() || user.block_name || 'General Hostel Block',
      student_id: user.id,
      student_name: user.full_name,
    });

    // Returned only after the backend confirms persistence and generates a tracking ID.
    return NextResponse.json(created);
  } catch {
    return NextResponse.json(
      { detail: 'Failed to submit complaint.' },
      { status: 500 }
    );
  }
}
