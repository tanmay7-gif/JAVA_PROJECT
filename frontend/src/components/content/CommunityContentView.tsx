import React, { useState, useEffect, useCallback } from 'react';
import { FitnessContent } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../Modal';
import {
  BookOpen,
  Search,
  PlusCircle,
  Tag,
  User as UserIcon,
  CheckCircle2,
} from 'lucide-react';

export const CommunityContentView: React.FC = () => {
  const { showToast } = useToast();
  const [contents, setContents] = useState<FitnessContent[]>([]);
  const [category, setCategory] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);

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
      if (res.success && res.data) {
        setContents(res.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load community guides.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [category, search, showToast]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

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
            Clinical conditioning routines and nutrition plans vetted by the FitPulse moderation board.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm shadow-sky-200 transition-all self-stretch sm:self-auto justify-center"
        >
          <PlusCircle className="w-4 h-4" />
          Submit Protocol
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-sky-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guides, hypertrophy, recovery, macros..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'Workout Routine', 'Guide', 'Nutrition', 'Recovery'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                category === cat
                  ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              {cat === 'ALL' ? 'All Guides' : cat}
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
      ) : contents.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white border border-sky-100 shadow-sm text-slate-400">
          <BookOpen className="w-12 h-12 text-sky-200 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800">No guides matching your criteria</h4>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {contents.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-sky-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between group hover:border-sky-300"
            >
              {item.media_url && (
                <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={item.media_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur-md text-sky-800 border border-sky-200 shadow-sm flex items-center gap-1">
                      <Tag className="w-3 h-3 text-sky-600" />
                      {item.category}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {!item.media_url && (
                    <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-800 border border-sky-200 mb-2">
                      {item.category}
                    </span>
                  )}
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-sky-50 flex items-center justify-center text-sky-700">
                      <UserIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-slate-800">
                      {item.creator?.name || 'FitPulse Practitioner'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
              Protocols undergo review by the FitPulse moderation team before becoming visible to athletes.
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
