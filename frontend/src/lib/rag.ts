/**
 * HostelIQ AI — Server-side RAG engine (demo only).
 *
 * Runs exclusively on the server (Next.js Route Handlers).
 * - Retrieves document chunks from the in-memory store using deterministic
 *   lexical-overlap scoring (no numpy / external ML dependencies).
 * - Synthesizes answers via the Gemini API (server-side fetch) when
 *   GEMINI_API_KEY is configured; otherwise falls back to a deterministic
 *   grounded answer built from retrieved excerpts.
 * - Mess menu and complaint tracking queries route to structured data
 *   (zero hallucination), exactly like the original Python implementation.
 *
 * The GEMINI_API_KEY is read only from the server environment and is never
 * sent to the browser.
 */

import {
  RAGQueryResponse,
  GroundedSource,
  DocumentChunk,
} from '@/types';
import {
  documents,
  documentChunks,
  messMenus,
  complaints,
  getOverview,
} from './data';

const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'by', 'for', 'with',
  'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above',
  'below', 'to', 'from', 'up', 'down', 'out', 'off', 'over', 'under', 'then', 'once',
  'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few',
  'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
  'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now', 'of', 'and', 'or',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'student', 'students', 'hostel',
]);

function termsOf(text: string): Set<string> {
  return new Set(
    text.toLowerCase().match(/\b[a-zA-Z0-9_]{3,}\b/g)?.filter((t) => !STOPWORDS.has(t)) ?? []
  );
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const n = Math.sqrt(na) * Math.sqrt(nb);
  return n > 0 ? dot / n : 0;
}

// Deterministic 768-dim hash projection (mirrors the Python fallback).
function embedText(text: string): number[] {
  const words = text.toLowerCase().match(/\b[a-zA-Z0-9_]{2,}\b/g) ?? [];
  const vec = new Array(768).fill(0);
  if (words.length === 0) return vec;
  for (const w of words) {
    let h = 0;
    for (let i = 0; i < w.length; i++) {
      h = ((h << 5) - h + w.charCodeAt(i)) | 0;
    }
    const idx = Math.abs(h) % 768;
    vec[idx] += 1;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  if (norm > 0) {
    for (let i = 0; i < 768; i++) vec[i] /= norm;
  }
  return vec;
}

const chunkVectorCache = new Map<string, number[]>();
function getChunkVector(chunk: DocumentChunk): number[] {
  if (chunkVectorCache.has(chunk.id)) return chunkVectorCache.get(chunk.id)!;
  const v = embedText(chunk.content);
  chunkVectorCache.set(chunk.id, v);
  return v;
}

// ---------------------------------------------------------------------------
// Intent detection
// ---------------------------------------------------------------------------

const MESS_TERMS = ['mess', 'menu', 'lunch', 'dinner', 'breakfast', 'snacks', 'food', 'eat today', 'what to eat'];
const COMPLAINT_ID_RE = /\b(cmp-\d{4}-\d{4})\b/i;

function isMessQuery(qLower: string): boolean {
  return MESS_TERMS.some((t) => qLower.includes(t));
}

function extractComplaintId(qLower: string): string | null {
  const m = qLower.match(COMPLAINT_ID_RE);
  return m ? m[1].toUpperCase() : null;
}

// ---------------------------------------------------------------------------
// Structured handlers (zero hallucination)
// ---------------------------------------------------------------------------

function handleMessQuery(query: string, nowIso: string): RAGQueryResponse {
  const overview = getOverview();
  const activeMeal = overview.current_meal as any;
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });

  const dayMenus = messMenus.filter((m) => m.day_of_week === currentDay).sort((a, b) => a.start_time.localeCompare(b.start_time));

  const lines = [`**Mess Schedule for Today (${currentDay})**:\n`];
  for (const m of dayMenus) {
    const activeBadge = m.is_active_now ? ' *(Serving Now)*' : '';
    lines.push(`- **${m.meal_type}** (${m.start_time} – ${m.end_time})${activeBadge}:\n  ${m.items.join(', ')}`);
  }
  lines.push('\n*Note: Timings and items are sourced directly from the authorized hostel mess roster.*');

  return {
    query,
    answer: lines.join('\n'),
    is_grounded: true,
    query_type: 'structured_menu',
    sources: [],
    generated_at: nowIso,
    suggested_followups: [
      'What are the mess dining hall timings?',
      'How do I apply for a mess rebate?',
      'Can I take meals to my hostel room?',
    ],
  };
}

function handleComplaintQuery(trackingId: string, nowIso: string): RAGQueryResponse {
  const c = complaints.find((x) => x.tracking_id === trackingId);
  if (!c) {
    return {
      query: trackingId,
      answer: `No record was found in the database for tracking ID **${trackingId}**. Please check the code format (e.g. \`CMP-2026-0041\`) or check your complaints list.`,
      is_grounded: false,
      query_type: 'structured_complaint',
      sources: [],
      generated_at: nowIso,
      suggested_followups: ['View all my active complaints'],
    };
  }
  const notes = c.admin_notes ? `\n- **Admin Remarks**: ${c.admin_notes}` : '';
  const ans =
    `**Complaint Record Found: ${c.tracking_id}**\n\n` +
    `- **Category**: ${c.category}\n` +
    `- **Title**: ${c.title}\n` +
    `- **Current Status**: **${c.status}**\n` +
    `- **Priority**: ${c.priority}\n` +
    `- **Room / Block**: ${c.room_number}, ${c.block_name}\n` +
    `- **Submitted At**: ${c.created_at.slice(0, 10)}${notes}`;

  return {
    query: trackingId,
    answer: ans,
    is_grounded: true,
    query_type: 'structured_complaint',
    sources: [],
    generated_at: nowIso,
    suggested_followups: ['Submit a new maintenance complaint', 'View all my active complaints'],
  };
}

// ---------------------------------------------------------------------------
// Policy RAG retrieval
// ---------------------------------------------------------------------------

function searchSimilarChunks(query: string, topK: number = 4, threshold: number = 0.25): Array<{ chunk: DocumentChunk; score: number }> {
  const queryVec = embedText(query);
  const queryTerms = termsOf(query);

  const scored: Array<{ chunk: DocumentChunk; score: number }> = [];

  for (const chunk of documentChunks) {
    const vec = getChunkVector(chunk);
    const sim = cosineSimilarity(queryVec, vec);

    const chunkTerms = termsOf(chunk.content);
    const overlap = [...queryTerms].filter((t) => chunkTerms.has(t)).length;

    if (queryTerms.size >= 3 && overlap < 2) continue;
    if (queryTerms.size >= 2 && overlap === 0) continue;

    const adjustedSim = sim + 0.15 * Math.min(overlap, 4);
    if (adjustedSim >= threshold && overlap > 0) {
      scored.push({ chunk, score: adjustedSim });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

// ---------------------------------------------------------------------------
// Gemini API (server-side only)
// ---------------------------------------------------------------------------

function getGeminiApiKey(): string | undefined {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim() === '' || key.includes('your_')) return undefined;
  return key.trim();
}

async function callGeminiGenerate(systemInstruction: string, userPrompt: string): Promise<string | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
    const body = JSON.stringify({
      contents: [{ parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }] }],
    });
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

function synthesizeGroundedAnswer(query: string, context: string, sources: GroundedSource[]): string {
  const points = sources.map(
    (s) => `Based on **${s.document_title}** (Page ${s.page_number}):\n${s.snippet}`
  );
  return (
    `Here is the verified policy information found in the official hostel records:\n\n` +
    points.join('\n\n')
  );
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export async function answerQuery(
  query: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<RAGQueryResponse> {
  const nowIso = new Date().toISOString();
  const qLower = query.toLowerCase().trim();

  // 1. Mess menu intent (structured DB)
  if (isMessQuery(qLower)) {
    return handleMessQuery(query, nowIso);
  }

  // 2. Complaint tracking intent (structured DB)
  const complaintId = extractComplaintId(qLower);
  if (complaintId) {
    return handleComplaintQuery(complaintId, nowIso);
  }

  // 3. Policy RAG
  const matching = searchSimilarChunks(query, 3, 0.30);
  if (!matching.length) {
    return {
      query,
      answer: 'I could not find policy information regarding this topic in the approved hostel documents. Please contact the hostel warden or administration office for guidance on unlisted matters.',
      is_grounded: false,
      query_type: 'policy_rag',
      sources: [],
      generated_at: nowIso,
      suggested_followups: [
        'What are the main hostel gate curfew timings?',
        'Can parents stay overnight in student rooms?',
        'Are electric room heaters or kettles allowed in rooms?',
      ],
    };
  }

  const sources: GroundedSource[] = [];
  const contextBlocks: string[] = [];
  for (const { chunk, score } of matching) {
    const doc = documents.find((d) => d.id === chunk.document_id);
    const docTitle = doc?.title ?? 'Approved Hostel Document';
    sources.push({
      document_id: chunk.document_id,
      document_title: docTitle,
      page_number: chunk.page_number,
      chunk_index: chunk.chunk_index,
      similarity: Math.round(score * 1000) / 1000,
      snippet: chunk.content.length > 240 ? chunk.content.slice(0, 240) + '...' : chunk.content,
    });
    contextBlocks.push(`--- Document: ${docTitle} (Page ${chunk.page_number}) ---\n${chunk.content}`);
  }

  const combinedContext = contextBlocks.join('\n\n');

  const systemInstruction =
    'You are HostelIQ AI, an intelligent university hostel policy assistant. ' +
    'You MUST answer the question using ONLY the approved hostel document excerpts provided below. ' +
    'Do NOT invent, assume, or generalize policies not present in the text. ' +
    "If the excerpts do not contain the answer, say: 'This information is not stated in the approved hostel documents.' " +
    'Keep the tone formal, direct, and institutional.';

  const userPrompt = `Approved Document Context:\n<approved_hostel_policy_documents>\n${combinedContext}\n</approved_hostel_policy_documents>\n\nStudent Question: ${query}\n\nProvide a concise, direct answer based strictly on the approved text above:`;

  let answer: string | null = null;
  const geminiText = await callGeminiGenerate(systemInstruction, userPrompt);
  if (geminiText) {
    answer = geminiText.trim();
  } else {
    answer = synthesizeGroundedAnswer(query, combinedContext, sources);
  }

  return {
    query,
    answer,
    is_grounded: true,
    query_type: 'policy_rag',
    sources,
    generated_at: nowIso,
    suggested_followups: [
      'How do I apply for a Digital Late Entry Gate Pass?',
      'What is the penalty for unauthorized appliances?',
      'What is the minimum duration for a mess rebate?',
    ],
  };
}

export function getSuggestions(): string[] {
  return [
    'What is the hostel gate curfew timing on weekdays vs weekends?',
    'Can parents or overnight guests stay in student rooms?',
    'Are electric kettles or room heaters permitted in rooms?',
    'What is the minimum duration required to claim a mess rebate?',
    'What is the procedure if I arrive past 10:30 PM due to lab work?',
    'What is for lunch today?',
    'Check status of complaint CMP-2026-0041',
  ];
}
