import { NextResponse } from 'next/server';
import { findUserById, updateMenuItem } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request) {
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

  try {
    const body = await req.json();
    const { day_of_week, meal_type, start_time, end_time, items, dietary_info } = body;

    const updated = updateMenuItem(day_of_week, meal_type, items, dietary_info, start_time, end_time);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { detail: 'Failed to update meal slot.' },
      { status: 400 }
    );
  }
}
