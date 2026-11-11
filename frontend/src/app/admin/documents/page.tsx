'use client';

import React, { useState, useEffect } from 'react';
import {
  Upload,
  Trash2,
  Eye,
  CheckCircle2,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import { DocumentMetadata, DocumentChunk } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';

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
      if (inspectDoc?.id === doc.id) {
        setInspectDoc(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete document.');
    }
  };

  const handleViewChunks = async (doc: DocumentMetadata) => {
    try {
      setInspectDoc(doc);
      setLoadingChunks(true);
      const docChunks = await api.getDocumentChunks(doc.id);
      setChunks(docChunks);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch chunks.');
    } finally {
      setLoadingChunks(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="border-b border-[#DCE6F2] pb-4">
        <h1 className="text-lg font-semibold tracking-tight text-[#101C3A] poppins">
          Approved Document Management &amp; Ingestion Desk
        </h1>
        <p className="mt-0.5 text-xs text-[#647794]">
          Upload and index verified university policies, dining norms, and maintenance handbooks for grounded RAG synthesis.
        </p>
      </div>

      {uploadSuccess && (
        <div className="rounded-md border border-[#3F51B5]/40 bg-[#EAF4FF] p-4 text-xs text-[#3F51B5] flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-[#DC143C]/30 bg-[#FDF2F2] p-4 text-xs text-[#DC143C]">
          <div className="font-semibold">Ingestion Pipeline Notice</div>
          <p className="mt-0.5">{error}</p>
        </div>
      )}

      {/* Upload Form */}
      <form
        onSubmit={handleUpload}
        className="rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] p-5 space-y-4 shadow-card"
      >
        <div className="border-b border-[#DCE6F2] pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#101C3A] poppins">
          Ingest New Approved Document
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[#647794]">
              Document Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hostel Gate Protocol &amp; Visitor Guidelines 2026"
              required
              className="mt-1 w-full rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] px-3 py-2 text-sm text-[#101C3A] focus:border-[#3F51B5] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#647794]">
              Policy Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] px-3 py-2 text-sm text-[#101C3A] focus:border-[#3F51B5] focus:outline-none"
            >
              <option value="Rules & Discipline">Rules & Discipline</option>
              <option value="Mess & Dining">Mess & Dining</option>
              <option value="Facilities & Maintenance">Facilities & Maintenance</option>
              <option value="Hostel Admissions">Hostel Admissions</option>
              <option value="General Notice">General Notice</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#647794]">
            Attach Official File (PDF, Markdown, or Plain Text)
          </label>
          <input
            type="file"
            accept=".pdf,.md,.txt"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            required
            className="mt-1 block w-full text-sm text-[#647794] file:mr-4 file:rounded-md file:border file:border-[#DCE6F2] file:bg-[#FFFFFF] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[#101C3A] hover:file:bg-[#F5F7FF] cursor-pointer"
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-[#DCE6F2]">
          <button
            type="submit"
            disabled={uploading || !title.trim() || !selectedFile}
            className="inline-flex items-center space-x-2 rounded-lg bg-[#021861] px-4 py-2 text-xs font-medium text-white hover:bg-[#3F51B5] disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>{uploading ? 'Chunking & Embedding...' : 'Parse & Embed Document'}</span>
          </button>
        </div>
      </form>

      {/* Documents Table */}
      <div className="rounded-lg border border-[#DCE6F2] bg-[#FFFFFF]">
        <div className="flex items-center justify-between border-b border-[#DCE6F2] px-5 py-3">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-[#101C3A]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#101C3A] poppins">
              Indexed Policy Documents ({documents.length})
            </h2>
          </div>
          <button
            onClick={loadDocuments}
            className="text-xs text-[#647794] hover:text-[#101C3A]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE6F2] bg-[#EAF4FF]/50 text-[11px] font-semibold uppercase text-[#647794]">
              <tr>
                <th className="px-5 py-3">Document Title</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">File Specs</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Vector Chunks</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE6F2]">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#F5F7FF]">
                    <td className="px-5 py-3 font-semibold text-[#101C3A]">
                      <div>{doc.title}</div>
                      <div className="text-[11px] font-normal text-[#647794]">{doc.file_name}</div>
                    </td>
                    <td className="px-5 py-3 text-[#647794]">
                      {doc.category}
                    </td>
                    <td className="px-5 py-3 text-[#647794] font-mono text-[11px]">
                      {(doc.file_size / 1024).toFixed(1)} KB
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center space-x-1 rounded border border-[#3F51B5]/30 bg-[#EAF4FF] px-2 py-0.5 text-[11px] font-medium text-[#3F51B5]">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Indexed</span>
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono font-medium text-[#101C3A]">
                      {doc.chunk_count} chunks
                    </td>
                    <td className="px-5 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleViewChunks(doc)}
                        className="inline-flex items-center space-x-1 rounded border border-[#DCE6F2] bg-[#FFFFFF] px-2.5 py-1 text-[11px] font-medium text-[#101C3A] hover:bg-[#EAF4FF]"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Inspect Chunks</span>
                      </button>
                      <button
                        onClick={() => handleDelete(doc)}
                        className="inline-flex items-center space-x-1 rounded border border-[#DC143C]/30 bg-[#FDF2F2] px-2 py-1 text-[11px] font-medium text-[#DC143C] hover:bg-[#FDF2F2]"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={FileText}
                      title="No approved documents"
                      description="No approved documents have been uploaded yet."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chunk Inspector Panel */}
      {inspectDoc && (
        <div className="rounded-lg border border-[#DCE6F2] bg-[#FFFFFF] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DCE6F2] pb-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#101C3A] poppins">
                Chunk Inspection: {inspectDoc.title}
              </h3>
              <p className="text-[11px] text-[#647794]">
                Displaying {chunks.length} semantic chunks stored in vector store
              </p>
            </div>
            <button
              onClick={() => setInspectDoc(null)}
              className="rounded border border-[#DCE6F2] px-2.5 py-1 text-xs text-[#101C3A] hover:bg-[#EAF4FF]"
            >
              Close Inspector
            </button>
          </div>

          {loadingChunks ? (
            <div className="py-6 text-center text-xs text-[#647794]">Loading chunks...</div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {chunks.map((chunk, idx) => (
                <div key={idx} className="rounded border border-[#DCE6F2] bg-[#FFFFFF] p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#647794] border-b border-[#DCE6F2]/50 pb-1">
                    <span className="font-semibold text-[#101C3A]">Chunk #{chunk.chunk_index}</span>
                    <span>Page {chunk.page_number}</span>
                  </div>
                  <p className="font-mono text-[11px] leading-relaxed text-[#101C3A] whitespace-pre-wrap">
                    {chunk.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
