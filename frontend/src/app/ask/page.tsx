'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Database,
  ExternalLink,
  Send,
  HelpCircle,
  Loader2,
  Bot,
  User,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { RAGQueryResponse, GroundedSource, DocumentChunk } from '@/types';
import { Badge } from '@/components/ui/Badge';

function AskContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { openEvidenceDrawer } = useApp();

  const [inputQuery, setInputQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<RAGQueryResponse[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    api.getSuggestions().then(setSuggestions).catch(() => {
      setSuggestions([
        'What are the main hostel gate curfew timings?',
        'Can parents stay overnight in student rooms?',
        'Are electric kettles or heaters permitted?',
        'What is the minimum duration required to claim a mess rebate?',
        'What is for lunch today?',
        'Check status of complaint CMP-2026-0041',
      ]);
    });

    if (initialQuery) {
      handleAsk(initialQuery);
    }
  }, []);

  const handleAsk = async (queryText: string) => {
    if (!queryText.trim() || loading) return;
    try {
      setLoading(true);
      setError(null);
      const conversationHistory = history.slice(0, 5).flatMap((item) => [
        { role: 'user', content: item.query },
        { role: 'assistant', content: item.answer },
      ]);
      const res = await api.queryRAG(queryText.trim(), conversationHistory);
      setHistory((prev) => [res, ...prev]);
      setInputQuery('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve answer from policy engine.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    setError(null);
  };

  const handleCopyAnswer = (answerText: string, idx: number) => {
    navigator.clipboard.writeText(answerText);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleInspect = async (source: GroundedSource) => {
    try {
      const chunk: DocumentChunk = {
        id: `${source.document_id}_chunk_${source.chunk_index}`,
        document_id: source.document_id,
        content: source.snippet,
        page_number: source.page_number,
        chunk_index: source.chunk_index,
        similarity: source.similarity,
        metadata: { doc_title: source.document_title },
      };
      try {
        const fullChunk = await api.getEvidence(`${source.document_id}_chunk_${source.chunk_index}`);
        fullChunk.metadata = { doc_title: source.document_title };
        fullChunk.similarity = source.similarity;
        openEvidenceDrawer(fullChunk);
      } catch {
        openEvidenceDrawer(chunk);
      }
    } catch (e) {
      // fallback
    }
  };

  const getGroundingBadge = (item: RAGQueryResponse) => {
    if (item.query_type === 'structured_menu') {
      return (
        <Badge variant="primary" dot className="flex items-center space-x-1.5">
          <Database className="h-3 w-3" />
          <span>Structured Dining Database</span>
        </Badge>
      );
    }
    if (item.query_type === 'structured_complaint') {
      return (
        <Badge variant="primary" dot className="flex items-center space-x-1.5">
          <Database className="h-3 w-3" />
          <span>Complaints Registry</span>
        </Badge>
      );
    }
    if (item.is_grounded) {
      return (
        <Badge variant="success" dot className="flex items-center space-x-1.5">
          <ShieldCheck className="h-3 w-3" />
          <span>Grounded in Handbooks ({item.sources.length} sources)</span>
        </Badge>
      );
    }
    return (
      <Badge variant="warning" dot className="flex items-center space-x-1.5">
        <ShieldAlert className="h-3 w-3" />
        <span>General Guidelines Match</span>
      </Badge>
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-card">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/10 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-glow shrink-0">
              <Bot className="h-6 w-6" />
              <div className="absolute -inset-0.5 rounded-2xl bg-indigo-500/20 blur-sm -z-10 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 poppins">
                  HostelIQ Policy Assistant
                </h1>
                <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  RAG Online
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Retrieval-Augmented Generation grounded exclusively in Kalasalingam University residential rules, dining policies, and estate guidelines.
              </p>
            </div>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="btn-press inline-flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-subtle shrink-0 self-start sm:self-auto"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Suggested Topic Chips */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          <span>Recommended Policy Topics</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputQuery(s);
                handleAsk(s);
              }}
              className="btn-press rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-left text-xs text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-900 transition-all font-medium shadow-subtle"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Modern Conversational Composer */}
      <div className="sticky top-16 z-20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(inputQuery);
          }}
          className="relative flex items-center shadow-lg rounded-2xl bg-white border border-slate-200/90 transition-all focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600/15"
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about curfew hours, guest policies, mess rebates, appliances, or complaint tracking..."
            className="w-full rounded-2xl bg-transparent py-3.5 pl-11 pr-28 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <div className="absolute inset-y-0 right-2 flex items-center">
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="btn-press inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:from-indigo-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <span>{loading ? 'Searching' : 'Ask'}</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Animated Typing Indicator / Loading State */}
      {loading && (
        <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-card animate-fade-in flex items-center space-x-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <Bot className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-800">Synthesizing Answer</span>
              {/* Three-dot typing animation */}
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Evaluating semantic similarity across indexed university policy handbook vectors…
            </p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 animate-slide-down flex items-start space-x-3">
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
          <div>
            <div className="font-semibold">Query Processing Notice</div>
            <p className="mt-0.5 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Conversational History Feed */}
      <div className="space-y-6">
        {history.map((item, idx) => (
          <div
            key={idx}
            className="rounded-3xl border border-slate-200/90 bg-white shadow-card overflow-hidden transition-all animate-fade-in"
          >
            {/* User Message Header Box */}
            <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
                  <User className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    You asked
                  </span>
                  <div className="text-xs sm:text-sm font-semibold text-slate-900 mt-0.5">
                    {item.query}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                {item.generated_at ? item.generated_at.slice(11, 16) : ''} UTC
              </span>
            </div>

            {/* Assistant Response Box */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold tracking-tight text-slate-900">
                    HostelIQ AI
                  </span>
                  <span className="text-slate-300">•</span>
                  {getGroundingBadge(item)}
                </div>

                <button
                  onClick={() => handleCopyAnswer(item.answer, idx)}
                  className="btn-press inline-flex items-center space-x-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-subtle shrink-0"
                  title="Copy answer"
                >
                  {copiedIdx === idx ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Formatted Answer Typography */}
              <div className="text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-wrap font-normal">
                {item.answer}
              </div>

              {/* Retrieved Sources Citation Cards */}
              {item.sources && item.sources.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <BookOpen className="h-3 w-3 text-indigo-600" />
                    <span>Verified Policy Citations</span>
                  </span>

                  <div className="grid grid-cols-1 gap-2">
                    {item.sources.map((src, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                            <span className="text-xs font-semibold text-slate-900 truncate">
                              {src.document_title}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.2 shrink-0">
                              Page {src.page_number}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-500 line-clamp-1 italic">
                            &ldquo;{src.snippet}&rdquo;
                          </p>
                        </div>

                        <button
                          onClick={() => handleInspect(src)}
                          className="btn-press inline-flex items-center space-x-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors shrink-0 shadow-subtle self-start sm:self-auto"
                        >
                          <span>Inspect Evidence</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Follow-up Inquiries */}
              {item.suggested_followups && item.suggested_followups.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Related Policy Inquiries
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.suggested_followups.map((f, fIdx) => (
                      <button
                        key={fIdx}
                        onClick={() => {
                          setInputQuery(f);
                          handleAsk(f);
                        }}
                        className="btn-press rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-900 transition-colors shadow-subtle"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {history.length === 0 && !loading && (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Ask anything about university hostel regulations
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Click any of the recommended topics above or enter your question to query Kalasalingam University&apos;s approved residential rulebooks in real-time.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AskPage() {
  return (
    <Suspense fallback={<div className="text-xs text-slate-400 p-8 text-center">Loading assistant interface…</div>}>
      <AskContent />
    </Suspense>
  );
}
