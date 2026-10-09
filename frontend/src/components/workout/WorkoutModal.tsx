import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { WorkoutLog, Intensity } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { MuscleAnatomy3D, MuscleGroup } from '../three/MuscleAnatomy3D';
import { Flame, Clock, Calendar, FileText, Activity, Zap, Check } from 'lucide-react';

interface WorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editWorkout?: WorkoutLog | null;
}

const WORKOUT_TYPES = [
  'Strength',
  'Cardio',
  'HIIT',
  'Yoga',
  'Cycling',
  'Running',
  'Swimming',
  'Pilates',
];

export const WorkoutModal: React.FC<WorkoutModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  editWorkout,
}) => {
  const { showToast } = useToast();
  const [type, setType] = useState<string>('Strength');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('Chest');
  const [duration, setDuration] = useState<number>(45);
  const [intensity, setIntensity] = useState<Intensity>('MEDIUM');
  const [caloriesBurned, setCaloriesBurned] = useState<number>(350);
  const [isManualCalories, setIsManualCalories] = useState<boolean>(false);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Pre-fill if editing
  useEffect(() => {
    if (editWorkout) {
      setType(editWorkout.type);
      setDuration(editWorkout.duration_minutes);
      setIntensity(editWorkout.intensity);
      setCaloriesBurned(editWorkout.calories_burned);
      setIsManualCalories(true);
      setDate(new Date(editWorkout.date).toISOString().slice(0, 16));
      setNotes(editWorkout.notes || '');
    } else {
      setType('Strength');
      setMuscleGroup('Chest');
      setDuration(45);
      setIntensity('MEDIUM');
      setIsManualCalories(false);
      setDate(new Date().toISOString().slice(0, 16));
      setNotes('');
    }
  }, [editWorkout, isOpen]);

  // Recalculate estimated calories when type, duration, or intensity change
  useEffect(() => {
    if (!isManualCalories) {
      api
        .estimateCalories(type, duration, intensity)
        .then((res) => {
          if (res.success && res.data) {
            setCaloriesBurned(res.data.estimated_calories);
          }
        })
        .catch(() => {
          const factor = intensity === 'HIGH' ? 10 : intensity === 'MEDIUM' ? 7 : 4;
          setCaloriesBurned(Math.round(factor * (duration / 60) * 70));
        });
    }
  }, [type, duration, intensity, isManualCalories]);

  // Handle 3D Muscle Group Selection (Two-Way Binding)
  const handleSelectMuscleGroup = (group: MuscleGroup) => {
    setMuscleGroup(group);
    if (!notes.includes(`Target: ${group}`)) {
      setNotes((prev) => {
        const cleaned = prev.replace(/Target: (Chest|Back|Core|Legs|Arms|Full Body)/g, '').trim();
        return cleaned ? `Target: ${group} - ${cleaned}` : `Target: ${group}`;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (duration <= 0 || duration > 1440) {
      showToast('Duration must be between 1 and 1440 minutes.', 'warning');
      return;
    }

    if (caloriesBurned < 0) {
      showToast('Calories burned cannot be negative.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editWorkout) {
        await api.updateWorkout(editWorkout.id, {
          type,
          duration_minutes: duration,
          intensity,
          calories_burned: caloriesBurned,
          date: new Date(date).toISOString(),
          notes: notes.trim() || undefined,
        });
        showToast('Workout log updated successfully!', 'success');
      } else {
        await api.createWorkout({
          type,
          duration_minutes: duration,
          intensity,
          calories_burned: caloriesBurned,
          date: new Date(date).toISOString(),
          notes: notes.trim() || undefined,
        });
        showToast('Workout recorded successfully! Metrics synchronized.', 'success');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to save workout.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editWorkout ? 'Edit Clinical Workout Log' : 'Log New Conditioning Session'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Top: 3D Muscle Anatomy Model Interactive Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Target Anatomy (Click 3D Mannequin or Tags to Focus)
          </label>
          <MuscleAnatomy3D
            selectedGroup={muscleGroup}
            onSelectGroup={handleSelectMuscleGroup}
          />
        </div>

        {/* Workout Discipline */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Primary Discipline
          </label>
          <div className="grid grid-cols-4 gap-2">
            {WORKOUT_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                  type === t
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {type === t && <Check className="w-3 h-3 text-emerald-600" />}
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Duration & Intensity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Duration (Minutes)
              </span>
            </label>
            <input
              type="number"
              min="1"
              max="1440"
              value={duration}
              onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Effort / Intensity
              </span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['LOW', 'MEDIUM', 'HIGH'] as Intensity[]).map((level) => {
                let activeClass = 'bg-emerald-50 text-emerald-800 border-emerald-400 font-bold';
                if (level === 'MEDIUM') activeClass = 'bg-amber-50 text-amber-800 border-amber-400 font-bold';
                if (level === 'HIGH') activeClass = 'bg-rose-50 text-rose-800 border-rose-400 font-bold';

                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setIntensity(level)}
                    className={`py-2 rounded-xl text-xs border transition-all ${
                      intensity === level
                        ? `${activeClass} shadow-sm`
                        : 'bg-white border-gray-200 text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Energy Burn with Smart MET Preview */}
        <div className="p-4 rounded-xl bg-[#F8FAF8] border border-emerald-100">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-emerald-600" />
              Calculated Energy Burn (kcal)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-500">
              <input
                type="checkbox"
                checked={isManualCalories}
                onChange={(e) => setIsManualCalories(e.target.checked)}
                className="rounded border-gray-300 text-emerald-600 focus:ring-0"
              />
              Manual overwrite
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              max="20000"
              disabled={!isManualCalories}
              value={caloriesBurned}
              onChange={(e) => setCaloriesBurned(Math.max(0, parseInt(e.target.value) || 0))}
              className={`w-full px-3.5 py-2.5 rounded-xl text-base font-bold transition-colors ${
                isManualCalories
                  ? 'bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-emerald-500'
                  : 'bg-white/80 border border-emerald-200/80 text-emerald-700 cursor-not-allowed'
              }`}
              required
            />
            <span className="text-xs text-gray-500 whitespace-nowrap font-medium">
              {isManualCalories ? 'Custom Entry' : 'Smart MET Telemetry'}
            </span>
          </div>
        </div>

        {/* Date and Time */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Session Timestamp
            </span>
          </label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-emerald-500"
            required
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gray-400" />
              Clinical Notes & Biometrics (Target Muscle, Heart Rate, Sets)
            </span>
          </label>
          <textarea
            rows={3}
            placeholder="Target muscle focus, perceived exertion (RPE), warmup routine..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold shadow-md shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="inline-block animate-spin mr-1">◌</span>
            ) : (
              <Activity className="w-4 h-4" />
            )}
            {editWorkout ? 'Save Changes' : 'Confirm & Log Session'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
