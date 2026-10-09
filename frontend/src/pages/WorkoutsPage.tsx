import React, { useState } from 'react';
import { WorkoutHistoryTable } from '../components/workout/WorkoutHistoryTable';
import { LiveWorkoutTracker } from '../components/workout/LiveWorkoutTracker';
import { WorkoutLog } from '../types';
import { PlusCircle, Sparkles, Dumbbell, History, Activity } from 'lucide-react';

interface WorkoutsPageProps {
  onOpenLogWorkout: () => void;
  onEditWorkout: (workout: WorkoutLog) => void;
  refreshTrigger: number;
}

export const WorkoutsPage: React.FC<WorkoutsPageProps> = ({
  onOpenLogWorkout,
  onEditWorkout,
  refreshTrigger,
}) => {
  const [activeTab, setActiveTab] = useState<'tracker' | 'history'>('tracker');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-sky-500" />
            FitPulse Enterprise Workout Suite
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
            Workout Tracking Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Execute real-time set-by-set workout protocols or browse historical workout logs and perceived exertion (RPE) telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-100 border border-slate-200 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('tracker')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                activeTab === 'tracker'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/25'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live Tracker</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/25'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History Log</span>
            </button>
          </div>

          <button
            onClick={onOpenLogWorkout}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-xs font-bold shadow-sm shadow-sky-500/20 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Add Workout Modal</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'tracker' ? (
        <LiveWorkoutTracker />
      ) : (
        <WorkoutHistoryTable
          onEdit={onEditWorkout}
          refreshTrigger={refreshTrigger}
        />
      )}
    </div>
  );
};

