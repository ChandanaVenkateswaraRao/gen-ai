import { NextResponse } from 'next/server';
import { EMAIL_REGEX, isDemoMode, createDemoUser } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || '').toString().trim();
    const password = body.password ?? undefined;
    const requestedRole = (body.role || 'student').toString().trim().toLowerCase();

    // Validate email presence and format
    if (!email) {
      return NextResponse.json(
        { detail: 'Email address is required.' },
        { status: 400 }
      );
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { detail: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Validate password presence and minimum length
    if (!password) {
      return NextResponse.json(
        { detail: 'Password is required.' },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { detail: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    if (isDemoMode()) {
      // Development/demo mode: accept any syntactically valid email
      // and any password with at least 8 characters. Role is client-selected.
      // NOT secure identity verification — demo only.
      const role = requestedRole === 'admin' ? 'admin' : 'student';
      const user = createDemoUser(email, role);
      return NextResponse.json(user);
    }

    // Production mode: fail safely — no arbitrary credentials accepted.
    return NextResponse.json(
      { detail: 'Authentication disabled in production mode. Configure institutional credentials.' },
      { status: 403 }
    );
  } catch {
    return NextResponse.json(
      { detail: 'Unable to process login request.' },
      { status: 400 }
    );
  }
}
