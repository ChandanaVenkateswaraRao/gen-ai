import { NextResponse } from 'next/server';
import { findUserById, uploadDocument } from '@/lib/data';

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

  if (user.role !== 'admin') {
    return NextResponse.json(
      { detail: 'Forbidden: Institutional Administrator privileges required.' },
      { status: 403 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string | null;
    const categoryRaw = formData.get('category') as unknown;
    const categoryVal = typeof categoryRaw === 'string' ? categoryRaw : '';
    const validCategories = [
      'Rules & Discipline',
      'Mess & Dining',
      'Facilities & Maintenance',
      'Hostel Admissions',
      'General Notice',
    ];
    const cat = validCategories.includes(categoryVal) ? categoryVal : 'Rules & Discipline';

    if (!file) {
      return NextResponse.json({ detail: 'File is required.' }, { status: 400 });
    }
    if (!title?.trim()) {
      return NextResponse.json({ detail: 'Title is required.' }, { status: 400 });
    }

    const contentBytes = await file.arrayBuffer();
    const fileSize = contentBytes.byteLength;
    const filename = file.name || 'uploaded_document.txt';
    const text = new TextDecoder().decode(contentBytes);

    // Parse chunks by markdown sections (H2 ## headers)
    const sections = text.split(/\n(?=##\s+)/);
    const chunks: Array<{
      content: string;
      page_number: number;
      chunk_index: number;
      metadata: Record<string, unknown>;
    }> = [];

    let chunkIdx = 0;
    for (const sec of sections) {
      const trimmed = sec.trim();
      if (!trimmed) continue;
      const lines = trimmed.split('\n');
      const firstLine = lines[0].replace(/^#+\s*/, '').trim();

      if (trimmed.length > 1200) {
        const paras = trimmed.split(/\n\n/);
        let current = `Section: ${firstLine}\n`;
        for (const para of paras) {
          if (current.length + para.length > 1000) {
            chunks.push({
              content: current.trim(),
              page_number: Math.floor(chunkIdx / 2) + 1,
              chunk_index: chunkIdx,
              metadata: { section: firstLine, doc_title: title.trim() },
            });
            chunkIdx += 1;
            current = `Section: ${firstLine}\n${para}\n`;
          } else {
            current += para + '\n\n';
          }
        }
        if (current.trim()) {
          chunks.push({
            content: current.trim(),
            page_number: Math.floor(chunkIdx / 2) + 1,
            chunk_index: chunkIdx,
            metadata: { section: firstLine, doc_title: title.trim() },
          });
          chunkIdx += 1;
        }
      } else {
        chunks.push({
          content: trimmed,
          page_number: Math.floor(chunkIdx / 2) + 1,
          chunk_index: chunkIdx,
          metadata: { section: firstLine, doc_title: title.trim() },
        });
        chunkIdx += 1;
      }
    }

    if (chunks.length === 0) {
      chunks.push({
        content: text.slice(0, 1000),
        page_number: 1,
        chunk_index: 0,
        metadata: { doc_title: title.trim() },
      });
    }

    const created = uploadDocument({
      title: title.trim(),
      file_name: filename,
      file_size: fileSize,
      category: cat,
      chunks,
      uploaded_by: user.full_name,
    });

    return NextResponse.json(created);
  } catch {
    return NextResponse.json(
      { detail: 'Document ingestion failed.' },
      { status: 500 }
    );
  }
}
