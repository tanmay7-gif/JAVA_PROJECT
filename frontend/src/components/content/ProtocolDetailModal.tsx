import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FitnessContent } from '../../types';
import { enrichProtocol, EnrichedProtocol } from '../../utils/protocolContentGenerator';
import { useToast } from '../../context/ToastContext';
import {
  X,
  Clock,
  Tag,
  User as UserIcon,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Share2,
  Printer,
  Sparkles,
  FileText,
  ShieldCheck,
  Layers,
  ArrowRight,
  Activity,
  Check,
} from 'lucide-react';

export interface ProtocolDetailModalProps {
  isOpen?: boolean;
  onClose: () => void;
  protocol: FitnessContent | null;
}

export const ProtocolDetailModal: React.FC<ProtocolDetailModalProps> = ({
  isOpen = true,
  onClose,
  protocol,
}) => {
  const { showToast } = useToast();
  const [enriched, setEnriched] = useState<EnrichedProtocol | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const isModalActive = isOpen && Boolean(protocol);

  useEffect(() => {
    if (protocol) {
      const result = enrichProtocol(protocol);
      setEnriched(result);
      setCompletedSteps({});
      // Check local storage for bookmark status
      try {
        const saved = localStorage.getItem(`fitpulse_bookmark_${protocol.id}`);
        setIsBookmarked(saved === 'true');
      } catch {
        setIsBookmarked(false);
      }
    } else {
      setEnriched(null);
    }
  }, [protocol]);

  // Handle ESC key press to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalActive) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalActive, onClose]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isModalActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalActive]);

  if (!isModalActive || !enriched || typeof document === 'undefined') return null;

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => {
      const next = { ...prev, [index]: !prev[index] };
      const completedCount = Object.values(next).filter(Boolean).length;
      if (!prev[index] && completedCount === enriched.actionChecklist.length) {
        showToast('All clinical protocol implementation steps marked complete!', 'success');
      }
      return next;
    });
  };

  const handleToggleBookmark = () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    try {
      localStorage.setItem(`fitpulse_bookmark_${enriched.id}`, String(nextState));
    } catch {
      // ignore storage error
    }
    showToast(
      nextState
        ? 'Protocol saved to your personal clinical library.'
        : 'Protocol removed from your personal library.',
      nextState ? 'success' : 'info'
    );
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Protocol link copied to clipboard!', 'success');
    } else {
      showToast('Protocol reference ready to share.', 'info');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const totalSteps = enriched.actionChecklist.length;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="protocol-detail-title"
    >
      {/* Click outside backdrop */}
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Container */}
      <div
        className="relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col bg-gradient-to-b from-[#F0F9FF] via-[#F8FAFC] to-white rounded-2xl sm:rounded-3xl shadow-2xl border border-sky-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Sticky Visual Hero Header */}
        <div className="relative h-52 sm:h-64 w-full shrink-0 overflow-hidden bg-slate-900 select-none">
          <img
            src={enriched.imageUrl}
            alt={enriched.title}
            className="w-full h-full object-cover opacity-85"
          />
          {/* Subtle multi-stop gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-slate-900/20" />

          {/* Top Floating Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider bg-sky-500 text-white shadow-sm flex items-center gap-1.5 backdrop-blur-md">
                <Tag className="w-3.5 h-3.5" />
                {enriched.category.replace('_', ' ')}
              </span>
              <span className="px-3 py-1 rounded-xl text-[11px] font-semibold bg-white/95 text-slate-800 border border-sky-200 shadow-sm flex items-center gap-1.5 backdrop-blur-md">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                {enriched.readTime}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white/90 hover:text-white backdrop-blur-md transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-sky-400"
              title="Close Protocol Reader (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Title Overlay in Banner */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 text-white">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FitPulse Clinical Knowledge Hub</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold">Peer-Reviewed Protocol</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-white leading-snug tracking-tight drop-shadow-sm">
              {enriched.title}
            </h1>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-slate-700">
          
          {/* Author, Actions & Governance Bar - Header Band */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-sky-100/80 via-sky-50/80 to-cyan-100/70 border border-sky-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-500 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-sky-950">{enriched.author}</h4>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-sky-700 border border-sky-200 shadow-2xs">
                    Lead Clinician
                  </span>
                </div>
                <p className="text-xs text-sky-800/80 font-medium mt-0.5">{enriched.authorRole}</p>
              </div>
            </div>

            {/* Quick Action Toolbar */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={handleToggleBookmark}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  isBookmarked
                    ? 'bg-sky-500 text-white border-sky-600 shadow-sm shadow-sky-200'
                    : 'bg-sky-100/80 hover:bg-sky-200 text-sky-800 border-sky-200'
                }`}
                title="Bookmark Protocol"
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-3.5 h-3.5" />
                ) : (
                  <Bookmark className="w-3.5 h-3.5" />
                )}
                <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-100/80 hover:bg-sky-200 text-sky-800 border border-sky-200 transition-all"
                title="Share Protocol Reference"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-100/80 hover:bg-sky-200 text-sky-800 border border-sky-200 transition-all hidden sm:flex"
                title="Print Protocol"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* 4-KPI Protocol Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {enriched.keyMetrics.map((metric, idx) => {
              const kpiColorSchemes = [
                'bg-sky-100/70 border-sky-200 text-sky-900',
                'bg-emerald-50/80 border-emerald-200 text-emerald-900',
                'bg-amber-50/80 border-amber-200 text-amber-900',
                'bg-violet-50/80 border-violet-200 text-violet-900',
              ];
              const scheme = kpiColorSchemes[idx % kpiColorSchemes.length];
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border shadow-2xs hover:shadow-xs transition-all ${scheme}`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-75 mb-1">
                    {metric.label}
                  </p>
                  <p className="text-base font-black tracking-tight">
                    {metric.value}
                  </p>
                  {metric.sublabel && (
                    <p className="text-[10px] font-semibold mt-0.5 truncate opacity-85">
                      {metric.sublabel}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Clinical Overview: Executive Clinical Abstract */}
          <div className="bg-sky-100/60 border border-sky-200 rounded-xl p-4 text-sky-950 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-900 uppercase tracking-wider mb-2">
              <FileText className="w-4 h-4 text-sky-600" />
              <span>Clinical Overview & Biological Scope</span>
            </div>
            <p className="text-xs sm:text-sm text-sky-950 leading-relaxed font-medium">
              {enriched.summary}
            </p>
          </div>

          {/* Main Structured Sections / Action Steps */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-sky-200 pb-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-sky-950">
                Detailed Protocol Architecture & Biomechanical Guidance
              </h3>
            </div>

            {enriched.sections.map((sec, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl transition-all space-y-3 ${
                    isEven
                      ? 'bg-sky-50/50 hover:bg-sky-50 border border-sky-200/80 shadow-xs'
                      : 'bg-[#F0F7FF]/70 hover:bg-[#F0F7FF] border border-sky-200/90 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-200/80 text-sky-900 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">
                      {sec.title}
                    </h4>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line pl-8">
                    {sec.content}
                  </div>

                  {sec.takeaway && (
                    <div className="ml-8 p-3 rounded-xl bg-white/90 border-l-4 border-sky-500 text-xs text-slate-800 flex items-start gap-2 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-sky-950">Clinical Takeaway: </strong>
                        {sec.takeaway}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Objectives Checklist: Interactive Implementation Checklist */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/50 via-emerald-50/30 to-sky-50/40 border border-emerald-200/90 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                  Objectives & Protocol Implementation Checklist
                </h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-emerald-800 border border-emerald-200 shadow-2xs">
                {completedCount} / {totalSteps} Completed
              </span>
            </div>

            <div className="space-y-2.5">
              {enriched.actionChecklist.map((step, idx) => {
                const isChecked = !!completedSteps[idx];
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleStep(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs flex items-start gap-3 transition-all ${
                      isChecked
                        ? 'bg-emerald-100/80 border-emerald-300 text-emerald-950 shadow-2xs'
                        : 'bg-emerald-50/80 border-emerald-200 text-emerald-950 hover:border-emerald-300 hover:bg-emerald-100/50 shadow-2xs'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-emerald-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className={isChecked ? 'line-through text-slate-500' : 'font-medium text-emerald-950'}>
                      {step}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contraindications Box: Soft rose alert tile */}
          <div className="bg-rose-50 border border-rose-200 text-rose-950 rounded-xl p-4 flex items-start gap-3 shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-rose-950 text-xs sm:text-sm">
                Clinical Governance & Contraindications Callout (ACSM / NSCA / ISSN)
              </p>
              <p className="text-[11px] sm:text-xs text-rose-900 leading-relaxed font-medium">
                {enriched.scientificBasis}. Ensure individual tolerance before progressive volume scaling.
              </p>
              <div className="p-2.5 mt-2 rounded-lg bg-rose-100/70 border border-rose-200 text-[11px] font-semibold text-rose-950">
                <strong>Contraindications:</strong> {enriched.contraindications}
              </div>
            </div>
          </div>

          {/* Tags & Taxonomy */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
              Tags:
            </span>
            {enriched.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-sky-100/70 text-sky-800 border border-sky-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 border-t border-sky-200 bg-gradient-to-r from-[#F0F9FF] to-[#E0F2FE]/50 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600 font-medium hidden sm:block">
            Published on {new Date(enriched.created_at).toLocaleDateString()} • Verified by FitPulse
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none bg-sky-100 hover:bg-sky-200 text-sky-700 border border-sky-300 rounded-xl px-4 py-2 text-xs font-bold transition-colors"
            >
              Back to Protocols
            </button>
            <button
              onClick={handleToggleBookmark}
              className="flex-1 sm:flex-none bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-md shadow-sky-200 rounded-xl px-5 py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>{isBookmarked ? 'Bookmarked' : 'Save Protocol'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};

export const ProtocolReaderModal = ProtocolDetailModal;
export default ProtocolDetailModal;
