import React, { useState, useEffect, useCallback } from 'react';
import { FitnessContent } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../Modal';
import { ProtocolDetailModal } from './ProtocolDetailModal';
import { CLINICAL_PROTOCOLS } from '../../data/mockContent';
import {
  BookOpen,
  Search,
  PlusCircle,
  Tag,
  User as UserIcon,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

/**
 * Normalizes category strings (removing spaces, underscores, and lowercasing)
 * to guarantee robust matching across 'Guide'/'GUIDE', 'Workout Routine'/'WORKOUT_ROUTINE', etc.
 */
export const normalizeCategory = (cat?: string): string => {
  if (!cat) return '';
  return cat.toLowerCase().replace(/[\s_-]+/g, '');
};

export const matchesCategory = (itemCategory: string, selectedTab: string): boolean => {
  if (!selectedTab || selectedTab.toUpperCase() === 'ALL') return true;
  return normalizeCategory(itemCategory) === normalizeCategory(selectedTab);
};

export const getCategoryBadgeClass = (category: string) => {
  const norm = category ? category.toUpperCase() : '';
  if (norm.includes('WORKOUT') || norm.includes('ROUTINE')) {
    return 'bg-sky-500 text-white shadow-sm shadow-sky-200';
  }
  if (norm.includes('NUTRITION')) {
    return 'bg-amber-500 text-white shadow-sm shadow-amber-200';
  }
  if (norm.includes('RECOVERY')) {
    return 'bg-emerald-500 text-white shadow-sm shadow-emerald-200';
  }
  return 'bg-indigo-500 text-white shadow-sm shadow-indigo-200';
};

export const getCategoryChips = (category: string) => {
  const norm = category ? category.toUpperCase() : '';
  if (norm.includes('WORKOUT') || norm.includes('ROUTINE')) {
    return [
      { label: 'Volume', val: 'Deload -40%', color: 'bg-rose-100 text-rose-800 border-rose-200' },
      { label: 'Rest', val: '180s Buffer', color: 'bg-sky-100 text-sky-800 border-sky-200' },
      { label: 'RPE', val: 'Target 7-8', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    ];
  }
  if (norm.includes('NUTRITION')) {
    return [
      { label: 'Leucine', val: '3.0g Threshold', color: 'bg-amber-100 text-amber-800 border-amber-200' },
      { label: 'Sodium', val: '700mg Hydration', color: 'bg-sky-100 text-sky-800 border-sky-200' },
      { label: 'Target', val: '2.2g/kg BW', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    ];
  }
  if (norm.includes('RECOVERY')) {
    return [
      { label: 'Temp/Room', val: '18.5°C Ambient', color: 'bg-sky-100 text-sky-800 border-sky-200' },
      { label: 'HRV', val: 'Baseline +12ms', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      { label: 'SWS Target', val: '90+ Mins', color: 'bg-violet-100 text-violet-800 border-violet-200' },
    ];
  }
  return [
    { label: 'Spinal Shear', val: '0° Deflection', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    { label: 'Form Index', val: '98% Symmetry', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { label: 'HRV Baseline', val: 'Calibrated', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  ];
};

export const CommunityContentView: React.FC = () => {
  const { showToast } = useToast();
  const [contents, setContents] = useState<FitnessContent[]>(CLINICAL_PROTOCOLS);
  const [category, setCategory] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [selectedProtocol, setSelectedProtocol] = useState<FitnessContent | null>(null);
  const [isReaderOpen, setIsReaderOpen] = useState<boolean>(false);

  const handleOpenReader = (item: FitnessContent) => {
    setSelectedProtocol(item);
    setIsReaderOpen(true);
  };

  const handleCloseReader = () => {
    setIsReaderOpen(false);
    setSelectedProtocol(null);
  };

  // Form state
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [contentCategory, setContentCategory] = useState<string>('Workout Routine');
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.getPublicContent(
        category === 'ALL' ? undefined : category,
        search.trim() || undefined
      );
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        // Hydrate backend data with clinical metadata from local catalog when matching
        const hydrated = res.data.map((item) => {
          const matchedMock = CLINICAL_PROTOCOLS.find(
            (p) => p.title.toLowerCase() === item.title.toLowerCase()
          );
          return {
            ...item,
            category: item.category || matchedMock?.category || 'GUIDE',
            readTime: item.readTime || matchedMock?.readTime || '6 min read',
            author: item.author || matchedMock?.author || item.creator?.name || 'FitPulse Practitioner',
            imageUrl: item.media_url || item.imageUrl || matchedMock?.imageUrl,
            summary: item.summary || matchedMock?.summary || item.description,
            content: item.content || matchedMock?.content || item.description,
          };
        });
        setContents(hydrated);
      } else {
        setContents(CLINICAL_PROTOCOLS);
      }
    } catch {
      // Fallback to local clinical store for seamless client resilience
      setContents(CLINICAL_PROTOCOLS);
    } finally {
      setIsLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Client-side filtering ensures instant tab switching responsiveness
  const displayedContents = contents.filter((item) => {
    const matchesCat = matchesCategory(item.category, category);
    if (!matchesCat) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.summary && item.summary.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.author && item.author.toLowerCase().includes(q))
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      showToast('Title and description are required.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createContent({
        title,
        description,
        category: contentCategory,
        media_url: mediaUrl.trim() || undefined,
      });
      showToast(res.message || 'Content submitted successfully!', 'success');
      setIsSubmitModalOpen(false);
      setTitle('');
      setDescription('');
      setMediaUrl('');
      fetchContent();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit guide.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-sky-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-600" />
            Verified Fitness Protocols & Guides
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Clinical conditioning routines, biochemical fueling guides, and recovery protocols vetted by the FitPulse medical board.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-xs font-bold shadow-md shadow-sky-200 transition-all self-stretch sm:self-auto justify-center active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          Submit Protocol
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/70 border border-sky-200/90 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guides, biomechanics, recovery, macros..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/90 border border-sky-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Guides' },
            { id: 'Workout Routine', label: 'Workout Routine' },
            { id: 'Guide', label: 'Guide' },
            { id: 'Nutrition', label: 'Nutrition' },
            { id: 'Recovery', label: 'Recovery' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                category === tab.id
                  ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-sm shadow-sky-200 border border-sky-400'
                  : 'text-slate-600 hover:text-sky-900 bg-white/70 hover:bg-white border border-sky-200/60 shadow-2xs'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Cards */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium">Loading clinical protocols...</p>
        </div>
      ) : displayedContents.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/70 border border-sky-200/90 shadow-sm text-slate-400">
          <BookOpen className="w-12 h-12 text-sky-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800">No guides matching your criteria</h4>
          <p className="text-xs text-slate-500 mt-1">Try switching category tabs or clearing your search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedContents.map((item) => {
            const coverImage = item.imageUrl || item.media_url;
            return (
              <div
                key={item.id}
                onClick={() => handleOpenReader(item)}
                className="bg-[#F0F8FF] hover:bg-[#E6F3FF] border border-sky-200 hover:border-sky-400 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all overflow-hidden flex flex-col justify-between group cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenReader(item);
                  }
                }}
              >
                {coverImage && (
                  <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
                    <img
                      src={coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Category Pill with Soft Gradient on Media */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 ${getCategoryBadgeClass(item.category)}`}>
                        <Tag className="w-3 h-3" />
                        {item.category.replace('_', ' ')}
                      </span>
                    </div>
                    {/* Read Time Pill */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-white/95 text-sky-800 border border-sky-200 shadow-2xs flex items-center gap-1 backdrop-blur-xs">
                        <Clock className="w-3 h-3 text-sky-600" />
                        {item.readTime || '6 min read'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {!coverImage && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm ${getCategoryBadgeClass(item.category)}`}>
                          {item.category.replace('_', ' ')}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {item.readTime || '6 min read'}
                        </span>
                      </div>
                    )}
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-2">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                      {item.summary || item.description}
                    </p>

                    {/* Domain-Specific Metric Chips Strip */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-1">
                      {getCategoryChips(item.category).map((chip, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shadow-2xs ${chip.color}`}
                        >
                          {chip.label}: {chip.val}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-sky-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0">
                        <UserIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-slate-800 text-xs truncate">
                          {item.author || item.creator?.name || 'FitPulse Practitioner'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenReader(item);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-xs font-bold transition-all shadow-sm shadow-sky-200 flex items-center gap-1.5 shrink-0 ml-2 group/btn active:scale-95"
                    >
                      <span>Read Protocol</span>
                      <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comprehensive Clinical Detail Reader Modal */}
      <ProtocolDetailModal
        isOpen={isReaderOpen}
        onClose={handleCloseReader}
        protocol={selectedProtocol}
      />

      {/* Submit Guide Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Training Protocol"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Protocol Title
            </label>
            <input
              type="text"
              placeholder="e.g. Science-Backed 4-Day Conditioning Split"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={contentCategory}
              onChange={(e) => setContentCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
            >
              <option value="Workout Routine">Workout Routine</option>
              <option value="Guide">Conditioning Guide</option>
              <option value="Nutrition">Nutrition & Macros</option>
              <option value="Recovery">Mobility & Recovery</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Cover Image URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Protocol Breakdown & Scientific Details
            </label>
            <textarea
              rows={5}
              placeholder="Detail warmup sets, work sets, target RPE, and post-session nutrition..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white resize-none"
              required
            />
          </div>

          <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <p>
              Protocols undergo clinical review by the FitPulse moderation team before becoming visible in the public directory.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold shadow-sm shadow-sky-200 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Protocol'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
