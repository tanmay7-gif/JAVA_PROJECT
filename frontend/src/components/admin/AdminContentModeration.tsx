import React, { useState, useEffect, useCallback } from 'react';
import { FitnessContent } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../Modal';
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

export const AdminContentModeration: React.FC = () => {
  const { showToast } = useToast();
  const [contents, setContents] = useState<FitnessContent[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Moderation feedback dialog
  const [rejectCandidate, setRejectCandidate] = useState<FitnessContent | null>(null);
  const [rejectionFeedback, setRejectionFeedback] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.getAllContentAdmin(
        statusFilter === 'ALL' ? undefined : statusFilter
      );
      if (res.success && res.data) {
        setContents(res.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load moderation queue.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, showToast]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    try {
      await api.moderateContentAdmin(id, 'APPROVED');
      showToast('Guide approved and released to public directory!', 'success');
      fetchContent();
    } catch (err: any) {
      showToast(err.message || 'Approval action failed.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectCandidate) return;

    setIsProcessing(true);
    try {
      await api.moderateContentAdmin(
        rejectCandidate.id,
        'REJECTED',
        rejectionFeedback.trim() || undefined
      );
      showToast('Content rejected with moderator feedback.', 'info');
      setRejectCandidate(null);
      setRejectionFeedback('');
      fetchContent();
    } catch (err: any) {
      showToast(err.message || 'Rejection action failed.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-600" />
            Fitness Content Quality & Moderation
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Review user-submitted workout guides, verify safety standards, and moderate public releases.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white border border-emerald-100 rounded-2xl text-xs font-bold shadow-soft-sm">
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                statusFilter === s
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Moderation List / Cards */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-500">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs">Loading moderation items...</p>
        </div>
      ) : contents.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white border border-emerald-100 shadow-soft-sm text-gray-400">
          <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-gray-800">Moderation Queue Clear</h4>
          <p className="text-xs text-gray-500 mt-1">
            No items pending review under status: <span className="text-emerald-700 font-bold">{statusFilter}</span>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {contents.map((item) => {
            let statusBadge = 'bg-amber-50 text-amber-800 border-amber-200';
            if (item.status === 'APPROVED') statusBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
            if (item.status === 'REJECTED') statusBadge = 'bg-rose-50 text-rose-800 border-rose-200';

            return (
              <div
                key={item.id}
                className="clinical-card p-6 flex flex-col lg:flex-row gap-5 items-start justify-between"
              >
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusBadge}`}>
                      {item.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F8FAF8] text-gray-600 border border-gray-200">
                      {item.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      Submitted by <strong className="text-gray-900">{item.creator?.name}</strong> on {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed bg-[#FAFCFA] p-4 rounded-2xl border border-emerald-100/70">
                    {item.description}
                  </p>

                  {item.feedback && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-rose-900">Feedback Given:</strong>
                        {item.feedback}
                      </div>
                    </div>
                  )}

                  {item.media_url && (
                    <div className="flex items-center gap-2 text-xs text-emerald-700 hover:text-emerald-800">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <a href={item.media_url} target="_blank" rel="noreferrer" className="underline truncate max-w-md">
                        {item.media_url}
                      </a>
                    </div>
                  )}
                </div>

                {/* Moderation Actions */}
                <div className="flex flex-row lg:flex-col gap-2 shrink-0 self-stretch lg:self-center justify-end">
                  {item.status !== 'APPROVED' && (
                    <button
                      onClick={() => handleApprove(item.id)}
                      disabled={isProcessing}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve & Publish
                    </button>
                  )}

                  {item.status !== 'REJECTED' && (
                    <button
                      onClick={() => setRejectCandidate(item)}
                      disabled={isProcessing}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject Guide
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Feedback Modal */}
      <Modal
        isOpen={!!rejectCandidate}
        onClose={() => setRejectCandidate(null)}
        title="Reject Content Submission"
      >
        <form onSubmit={handleRejectConfirm} className="space-y-4">
          <p className="text-xs text-gray-600">
            You are rejecting "<strong>{rejectCandidate?.title}</strong>". Please provide clinical or safety feedback:
          </p>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Rejection Rationale
            </label>
            <textarea
              rows={4}
              placeholder="e.g. Protocol lacks proper warmup instructions or promotes unverified claims."
              value={rejectionFeedback}
              onChange={(e) => setRejectionFeedback(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-rose-500 resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setRejectCandidate(null)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-md shadow-rose-600/25 transition-all disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
