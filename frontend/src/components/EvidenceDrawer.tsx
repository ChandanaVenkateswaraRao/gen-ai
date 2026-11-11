'use client';

import React, { useState } from 'react';
import { X, FileText, CheckCircle2, ShieldAlert, Copy, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function EvidenceDrawer() {
  const { activeEvidenceChunk, closeEvidenceDrawer } = useApp();
  const [copied, setCopied] = useState(false);

  if (!activeEvidenceChunk) return null;

  const handleCopy = () => {
    if (!activeEvidenceChunk.content) return;
    navigator.clipboard.writeText(activeEvidenceChunk.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm transition-opacity animate-fade-in">
      <div className="relative flex h-full w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl animate-fade-in">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-slate-900">
                Retrieved Policy Evidence
              </h3>
              <p className="text-xs text-slate-500">
                Verbatim chunk inspected from vector knowledge base
              </p>
            </div>
          </div>
          <button
            onClick={closeEvidenceDrawer}
            className="btn-press rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Close evidence inspector"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Verification Metadata Box */}
        <div className="border-b border-slate-100 bg-white px-6 py-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">Document Source</span>
              <div className="font-semibold text-slate-900 truncate">
                {activeEvidenceChunk.metadata?.doc_title || 'Approved Policy Document'}
              </div>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">Index Location</span>
              <div className="font-semibold text-slate-900">
                Page {activeEvidenceChunk.page_number} <span className="text-slate-400 font-normal">(Chunk #{activeEvidenceChunk.chunk_index})</span>
              </div>
            </div>
          </div>
          {activeEvidenceChunk.similarity !== undefined && (
            <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-1.5 text-xs text-emerald-800 font-medium">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Vector Similarity Score</span>
              </div>
              <span className="font-mono font-bold text-emerald-700">
                {(activeEvidenceChunk.similarity * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {/* Verbatim Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Verbatim Text Chunk
            </span>
            <button
              onClick={handleCopy}
              className="btn-press inline-flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy excerpt</span>
                </>
              )}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 text-xs font-mono leading-relaxed text-slate-800 whitespace-pre-wrap select-text shadow-inner">
            {activeEvidenceChunk.content}
          </div>

          <div className="flex items-start space-x-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs text-indigo-900">
            <ShieldAlert className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-semibold text-indigo-950">Strict RAG Grounding:</strong> Answers generated by HostelIQ AI are synthesized strictly from authorized university handbooks. No out-of-domain hallucinations are permitted.
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-slate-100 bg-slate-50/80 px-6 py-4 flex items-center justify-end">
          <button
            onClick={closeEvidenceDrawer}
            className="btn-press rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
