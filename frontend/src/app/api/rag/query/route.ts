import { NextResponse } from 'next/server';
import { findUserById } from '@/lib/data';
import { answerQuery } from '@/lib/rag';

export const dynamic = 'force-dynamic';

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
    const query = typeof body.query === 'string' ? body.query : '';
    const history = Array.isArray(body.conversation_history) ? body.conversation_history : [];

    if (!query.trim()) {
      return NextResponse.json({ detail: 'Query cannot be empty.' }, { status: 400 });
    }

    const result = await answerQuery(query, history);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { detail: 'Failed to retrieve answer from policy engine.' },
      { status: 500 }
    );
  }
}
