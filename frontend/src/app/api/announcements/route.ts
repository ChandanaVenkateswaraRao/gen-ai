import { NextResponse } from 'next/server';
import { findUserById, getAnnouncements, createAnnouncement } from '@/lib/data';

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
  const category = searchParams.get('category') ?? undefined;

  return NextResponse.json(getAnnouncements(category));
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

  if (user.role !== 'admin') {
    return NextResponse.json(
      { detail: 'Forbidden: Institutional Administrator privileges required.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { title, content, category, priority, is_pinned, target_audience } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { detail: 'Title and content are required.' },
        { status: 400 }
      );
    }

    const created = createAnnouncement({
      title: title.trim(),
      content: content.trim(),
      category: category || 'General',
      priority: priority || 'Normal',
      is_pinned: !!is_pinned,
      target_audience: target_audience || 'all',
      author_name: user.full_name,
    });

    return NextResponse.json(created);
  } catch {
    return NextResponse.json(
      { detail: 'Failed to publish announcement.' },
      { status: 500 }
    );
  }
}
