import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WorkoutLog } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  Flame,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Sparkles,
} from 'lucide-react';

interface WorkoutHistoryTableProps {
  onEdit: (workout: WorkoutLog) => void;
  refreshTrigger: number;
}

export const WorkoutHistoryTable: React.FC<WorkoutHistoryTableProps> = ({
  onEdit,
  refreshTrigger,
}) => {
  const { showToast } = useToast();
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterIntensity, setFilterIntensity] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Deletion
  const [deleteCandidate, setDeleteCandidate] = useState<WorkoutLog | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchWorkouts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.getWorkouts({
        type: filterType === 'ALL' ? undefined : filterType,
        limit: 100,
      });
      if (res.success && res.data) {
        setWorkouts(res.data.workouts);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load workouts history.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filterType, showToast]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts, refreshTrigger]);

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await api.deleteWorkout(deleteCandidate.id);
      showToast('Workout log deleted successfully.', 'success');
      setDeleteCandidate(null);
      fetchWorkouts();
    } catch (err: any) {
      showToast(err.message || 'Could not delete workout.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter application
  const filteredWorkouts = useMemo(() => {
    return workouts.filter((w) => {
      // Search text
      if (search.trim()) {
        const term = search.toLowerCase();
        const matchesNote = w.notes && w.notes.toLowerCase().includes(term);
        const matchesType = w.type.toLowerCase().includes(term);
        if (!matchesNote && !matchesType) return false;
      }

      // Intensity filter
      if (filterIntensity !== 'ALL' && w.intensity !== filterIntensity) {
        return false;
      }

      // Date Range filter
      if (dateRange !== 'ALL') {
        const workoutTime = new Date(w.date).getTime();
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        if (dateRange === 'TODAY' && now - workoutTime > oneDay) return false;
        if (dateRange === 'WEEK' && now - workoutTime > 7 * oneDay) return false;
        if (dateRange === 'MONTH' && now - workoutTime > 30 * oneDay) return false;
      }

      return true;
    });
  }, [workouts, search, filterIntensity, dateRange]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterType, filterIntensity, dateRange]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredWorkouts.length / itemsPerPage));
  const paginatedWorkouts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredWorkouts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredWorkouts, currentPage, itemsPerPage]);

  return (
    <div className="space-y-4">
      {/* Comprehensive Filter & Controls Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/70 border border-sky-200/90 shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-200">
        {/* Search Input & Selectors */}
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conditioning notes or muscle targets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white/80 border border-sky-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs"
            />
          </div>

          {/* Discipline Selector */}
          <div className="flex items-center gap-1.5 bg-white/80 border border-sky-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-sky-600" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Disciplines</option>
              <option value="Cardio">Cardio</option>
              <option value="Strength">Strength</option>
              <option value="HIIT">HIIT</option>
              <option value="Yoga">Yoga</option>
              <option value="Cycling">Cycling</option>
              <option value="Running">Running</option>
            </select>
          </div>

          {/* Intensity Selector */}
          <div className="flex items-center gap-1.5 bg-white/80 border border-sky-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">RPE:</span>
            <select
              value={filterIntensity}
              onChange={(e) => setFilterIntensity(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Intensities</option>
              <option value="LOW">Low (Recovery)</option>
              <option value="MEDIUM">Medium (Tempo)</option>
              <option value="HIGH">High (Max VO2)</option>
            </select>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5 bg-white/80 border border-sky-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All-Time</option>
              <option value="TODAY">Last 24 Hours</option>
              <option value="WEEK">Past 7 Days</option>
              <option value="MONTH">Past 30 Days</option>
            </select>
          </div>
        </div>

        {/* View Toggle & Count */}
        <div className="flex items-center justify-between lg:justify-end gap-3 self-end lg:self-auto">
          <div className="flex items-center bg-sky-100/70 p-1 rounded-xl border border-sky-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-300'
                  : 'text-sky-700 hover:text-sky-900'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'cards'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-300'
                  : 'text-sky-700 hover:text-sky-900'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-xs text-slate-600 font-medium">
            Showing <span className="text-sky-700 font-bold">{filteredWorkouts.length}</span> logs
          </div>
        </div>
      </div>

      {/* Main Content Area: Table or Card Grid */}
      {isLoading ? (
        <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/70 border border-sky-200/90 rounded-2xl py-20 flex flex-col items-center justify-center gap-3 text-sky-800 shadow-sm">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-600">
            Filtering audit telemetry...
          </p>
        </div>
      ) : paginatedWorkouts.length === 0 ? (
        <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/70 border border-sky-200/90 rounded-2xl py-16 text-center text-slate-400 px-4 shadow-sm">
          <Dumbbell className="w-12 h-12 mx-auto text-sky-300 mb-3" />
          <h4 className="text-sm font-bold text-slate-800">No workout records matched criteria</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Try adjusting your search query, intensity filter, or date range.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/60 border border-sky-200/90 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sky-50/70 text-sky-900 uppercase tracking-wider font-bold border-b border-sky-100">
                <tr>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Discipline</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Intensity</th>
                  <th className="py-3.5 px-4">Calories</th>
                  <th className="py-3.5 px-4">Conditioning Notes</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100/60 text-slate-700">
                {paginatedWorkouts.map((w) => {
                  const formattedDate = new Date(w.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const formattedTime = new Date(w.date).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  let intensityBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  if (w.intensity === 'MEDIUM') {
                    intensityBadge = 'bg-amber-50 text-amber-700 border-amber-200';
                  } else if (w.intensity === 'HIGH') {
                    intensityBadge = 'bg-rose-50 text-rose-700 border-rose-200';
                  }

                  return (
                    <tr key={w.id} className="hover:bg-sky-50/40 transition-colors group">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <div>
                            <div className="font-semibold text-slate-900">{formattedDate}</div>
                            <div className="text-[10px] text-slate-400">{formattedTime}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-800">
                          {w.type}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-slate-700 font-semibold">
                          <Clock className="w-3 h-3 text-sky-600" />
                          {w.duration_minutes}m
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${intensityBadge}`}
                        >
                          {w.intensity}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-bold text-sky-700">
                        <span className="inline-flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-sky-500 fill-sky-500/20" />
                          {w.calories_burned} kcal
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                        {w.notes || <span className="text-slate-400 italic">No notes</span>}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEdit(w)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-700 hover:bg-sky-50 transition-colors"
                            title="Edit workout entry"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteCandidate(w)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete workout entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedWorkouts.map((w) => {
            let intensityBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            if (w.intensity === 'MEDIUM') {
              intensityBadge = 'bg-amber-50 text-amber-700 border-amber-200';
            } else if (w.intensity === 'HIGH') {
              intensityBadge = 'bg-rose-50 text-rose-700 border-rose-200';
            }

            return (
              <div
                key={w.id}
                className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/70 border border-sky-200/90 rounded-2xl p-5 space-y-3 flex flex-col justify-between hover:border-sky-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-slate-800"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200 shadow-2xs">
                      {w.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${intensityBadge}`}>
                      {w.intensity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-2">
                    {w.notes || 'Conditioning session completed as planned.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-sky-200/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-600" />
                      {w.duration_minutes}m
                    </span>
                    <span className="text-sky-700 font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3 text-sky-500" />
                      {w.calories_burned} kcal
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(w)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-sky-100 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteCandidate(w)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/70 border border-sky-200/90 rounded-2xl shadow-sm">
          <div className="text-xs text-slate-500">
            Page <span className="font-bold text-slate-900">{currentPage}</span> of{' '}
            <span className="font-bold text-slate-900">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                  currentPage === i + 1
                    ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white border border-sky-100 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h4 className="text-sm font-bold text-slate-900">Delete Workout Record?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this {deleteCandidate.type} session ({deleteCandidate.duration_minutes}m, {deleteCandidate.calories_burned} kcal)?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-3 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
