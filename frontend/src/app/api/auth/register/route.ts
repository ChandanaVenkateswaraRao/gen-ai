import { NextResponse } from 'next/server';
import { EMAIL_REGEX, isDemoMode } from '@/lib/data';
import { User } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || '').toString().trim();
    const password = (body.password || '').toString();
    const fullName = (body.full_name || '').toString().trim();
    const requestedRole = (body.role || 'student').toString().trim().toLowerCase();
    const roomNumber = body.room_number ? body.room_number.toString().trim() : undefined;
    const blockName = body.block_name ? body.block_name.toString().trim() : undefined;

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

    if (!email.toLowerCase().endsWith('@klu.ac.in')) {
      return NextResponse.json(
        { detail: 'Institutional email required. Both residents and admins must register with an @klu.ac.in email address.' },
        { status: 400 }
      );
    }

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

    if (!fullName) {
      return NextResponse.json(
        { detail: 'Full name is required.' },
        { status: 400 }
      );
    }

    const role: 'student' | 'admin' = requestedRole === 'admin' ? 'admin' : 'student';

    if (isDemoMode()) {
      const id = `user_${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
      const user: User = {
        id,
        email,
        full_name: fullName,
        role,
        room_number: roomNumber,
        block_name: blockName,
      };
      return NextResponse.json(user, { status: 201 });
    }

    return NextResponse.json(
      { detail: 'Direct registration disabled in production Next.js route. Backend API handles registrations.' },
      { status: 403 }
    );
  } catch {
    return NextResponse.json(
      { detail: 'Unable to process registration request.' },
      { status: 400 }
    );
  }
}
