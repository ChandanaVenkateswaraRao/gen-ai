'use client';

import React, { useState, useEffect } from 'react';
import {
  Upload,
  Trash2,
  Eye,
  CheckCircle2,
  FileText,
  RefreshCw,
  Plus,
  X,
  FileUp,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { DocumentMetadata, DocumentChunk } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';

export default function AdminDocumentsPage() {
  const { currentRole, currentUser } = useApp();
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upload state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('Rules & Discipline');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Chunk inspection state
  const [inspectDoc, setInspectDoc] = useState<DocumentMetadata | null>(null);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [loadingChunks, setLoadingChunks] = useState(false);
  const [copiedChunkId, setCopiedChunkId] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [currentUser]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDocuments();
      setDocuments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load approved documents.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedFile) return;

    try {
      setUploading(true);
      setError(null);
      setUploadSuccess(null);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('file', selectedFile);

      const created = await api.uploadDocument(formData);
      setUploadSuccess(`Document "${created.title}" successfully parsed and indexed into ${created.chunk_count} vector chunks.`);
      setTitle('');
      setSelectedFile(null);
      loadDocuments();
    } catch (err: any) {
      setError(err.message || 'Document ingestion failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: DocumentMetadata) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${doc.title}"? This will remove all associated vector embeddings from the knowledge base.`
    );
    if (!confirmed) return;

    try {
      setError(null);
      await api.deleteDocument(doc.id);
      loadDocuments();
    } catch (err: any) {
      setError(err.message || 'Failed to delete document.');
    }
  };

  const handleInspect = async (doc: DocumentMetadata) => {
    try {
      setInspectDoc(doc);
      setLoadingChunks(true);
      const data = await api.getDocumentChunks(doc.id);
      setChunks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch document chunks.');
    } finally {
      setLoadingChunks(false);
    }
  };

  const handleCopyChunk = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChunkId(id);
    setTimeout(() => setCopiedChunkId(null), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/10 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
              Knowledge Base Management
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 poppins">
              Approved Policy Documents &amp; Ingestion
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
              Upload institutional rulebooks, circulars, and dining regulations to be chunked, vectorized, and served to the RAG policy assistant.
            </p>
          </div>

          <button
            onClick={loadDocuments}
            disabled={loading}
            className="btn-press inline-flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-subtle shrink-0 self-start sm:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
            <span>Sync Knowledge Base</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {uploadSuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-800 shadow-card animate-slide-down flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
          <button onClick={() => setUploadSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 animate-slide-down">
          {error}
        </div>
      )}

      {/* Upload New Document Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card space-y-5">
        <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileUp className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Ingest New Policy PDF / Text Document
            </h2>
            <p className="text-[11px] text-slate-400">Files are automatically parsed into semantic vector chunks</p>
          </div>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Official Document Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Student Hostel Handbook 2026"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Policy Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              >
                <option value="Rules & Discipline">Rules &amp; Discipline</option>
                <option value="Mess & Dining">Mess &amp; Dining Guidelines</option>
                <option value="Maintenance & Estate">Maintenance &amp; Estate Guidelines</option>
                <option value="Fee & Rebate">Fee, Deposits &amp; Rebates</option>
                <option value="Emergency & Health">Emergency &amp; Health Regulations</option>
              </select>
            </div>
          </div>

          {/* Styled File Drop Area */}
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center hover:border-indigo-300 transition-colors bg-slate-50/50">
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.txt,.md,.json"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
              <Upload className="mx-auto h-8 w-8 text-indigo-600" />
              <div className="text-xs font-bold text-slate-900">
                {selectedFile ? selectedFile.name : 'Click to select document (PDF, TXT, MD)'}
              </div>
              <p className="text-[11px] text-slate-400">
                Maximum file size: 25MB. Text and tables are automatically chunked with overlap.
              </p>
            </label>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={uploading || !title.trim() || !selectedFile}
              className="btn-press inline-flex items-center space-x-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <span>{uploading ? 'Parsing & Indexing…' : 'Index Document into RAG'}</span>
              <FileUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Indexed Documents Table / Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Currently Indexed Knowledge Base ({documents.length} documents)
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card animate-pulse space-y-2">
                <div className="h-4 w-48 bg-slate-200 rounded" />
                <div className="h-3 w-32 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200/90 bg-white shadow-card hover-lift transition-all"
              >
                <div className="flex items-start space-x-3.5 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {doc.title}
                      </h3>
                      <Badge variant="primary">
                        {doc.category}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1">
                      <span>Indexed into <strong className="text-slate-700">{doc.chunk_count} vector chunks</strong></span>
                      <span>&bull;</span>
                      <span>{doc.created_at ? doc.created_at.slice(0, 10) : 'Recent'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleInspect(doc)}
                    className="btn-press inline-flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-subtle"
                  >
                    <Eye className="h-3.5 w-3.5 text-slate-500" />
                    <span>Inspect Chunks</span>
                  </button>
                  <button
                    onClick={() => handleDelete(doc)}
                    className="btn-press inline-flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white p-2 text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors shadow-subtle"
                    title="Delete document"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="Knowledge base is empty"
            description="Upload your first approved university policy PDF above to enable AI-powered grounded answers."
          />
        )}
      </div>

      {/* Chunk Inspector Modal */}
      {inspectDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-slide-down">
            <div className="flex items-center justify-between border-b border-slate-100 p-6 bg-slate-50/60">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Vector Inspector</span>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {inspectDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setInspectDoc(null)}
                className="btn-press rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingChunks ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading chunks…</div>
              ) : chunks.length > 0 ? (
                chunks.map((ch) => (
                  <div key={ch.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700 font-mono text-[11px]">Chunk #{ch.chunk_index} &bull; Page {ch.page_number}</span>
                      <button
                        onClick={() => handleCopyChunk(ch.content, ch.id)}
                        className="btn-press text-[11px] text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        {copiedChunkId === ch.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedChunkId === ch.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="text-xs font-mono text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/80">
                      {ch.content}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">No chunks retrieved for this document.</div>
              )}
            </div>

            <div className="border-t border-slate-100 p-4 bg-slate-50/80 flex justify-end">
              <button
                onClick={() => setInspectDoc(null)}
                className="btn-press rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
