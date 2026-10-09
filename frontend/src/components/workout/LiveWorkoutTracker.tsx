import React, { useState, useEffect } from 'react';
import {
  Flame,
  Clock,
  Dumbbell,
  Check,
  RotateCcw,
  Sparkles,
  Zap,
  Info,
  X,
  Play,
  Pause,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  MapPin,
  Target
} from 'lucide-react';

export type GoalOption = 'FAT_LOSS' | 'HYPERTROPHY';
export type LocationOption = 'INDOOR' | 'OUTDOOR';

export interface SetRecord {
  setNumber: number;
  prevRecord: string;
  weightKg: number;
  reps: number;
  completed: boolean;
}

export interface ExerciseItem {
  id: string;
  name: string;
  targetMuscle: string;
  cadence: string;
  techniqueCues: string[];
  commonErrors: string[];
  sets: SetRecord[];
}

export interface WorkoutRoutinePreset {
  id: string;
  title: string;
  description: string;
  estimatedDuration: string;
  targetIntensity: string;
  equipmentRequired: string;
  exercises: ExerciseItem[];
}

const getRoutineHeroPhoto = (goal: string, location: string) => {
  if (location === 'OUTDOOR') {
    return 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80';
  }
  if (goal === 'HYPERTROPHY') {
    return 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=80';
  }
  return 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80';
};

const ROUTINE_PRESETS: Record<string, WorkoutRoutinePreset> = {
  'HYPERTROPHY_INDOOR': {
    id: 'hyp_ind',
    title: 'Push & Upper Body Hypertrophy',
    description: 'Hypertrophy-focused compound press & lat movement protocol targeted for maximum mechanical tension.',
    estimatedDuration: '45 mins',
    targetIntensity: 'Zone 3-4 (Moderate High)',
    equipmentRequired: 'Barbell, Dumbbells, Bench',
    exercises: [
      {
        id: 'ex_1',
        name: 'Incline Barbell Bench Press',
        targetMuscle: 'Upper Pectoralis & Deltoids',
        cadence: '3-1-1-0 Tempo',
        techniqueCues: [
          'Retract and depress scapula before initiating unrack.',
          'Lower bar with 3-second eccentric control to upper chest.',
          'Drive feet flat into the ground for leg-drive stability.'
        ],
        commonErrors: [
          'Flaring elbows outward beyond 80 degrees.',
          'Bouncing bar off upper sternum.'
        ],
        sets: [
          { setNumber: 1, prevRecord: '80kg × 10', weightKg: 80, reps: 10, completed: false },
          { setNumber: 2, prevRecord: '85kg × 8', weightKg: 85, reps: 8, completed: false },
          { setNumber: 3, prevRecord: '85kg × 8', weightKg: 85, reps: 8, completed: false },
          { setNumber: 4, prevRecord: '90kg × 6', weightKg: 90, reps: 6, completed: false },
        ]
      },
      {
        id: 'ex_2',
        name: 'Weighted Neutral Pull-Ups',
        targetMuscle: 'Latissimus Dorsi & Biceps',
        cadence: '2-1-2-0 Tempo',
        techniqueCues: [
          'Initiate pull by driving elbows straight down toward hips.',
          'Pause briefly with chin fully over bar at peak contraction.',
          'Maintain a rigid core and avoid swinging legs.'
        ],
        commonErrors: [
          'Cutting eccentric phase short at bottom.',
          'Kicking legs forward to generate momentum.'
        ],
        sets: [
          { setNumber: 1, prevRecord: '+10kg × 10', weightKg: 10, reps: 10, completed: false },
          { setNumber: 2, prevRecord: '+15kg × 8', weightKg: 15, reps: 8, completed: false },
          { setNumber: 3, prevRecord: '+15kg × 8', weightKg: 15, reps: 8, completed: false },
        ]
      },
      {
        id: 'ex_3',
        name: 'Seated Dumbbell Shoulder Press',
        targetMuscle: 'Anterior & Lateral Deltoids',
        cadence: '2-0-1-0 Tempo',
        techniqueCues: [
          'Set bench angle to 75-80 degrees for shoulder safety.',
          'Press dumbbells upwards in a slight inward arc.',
          'Keep forearms vertical throughout the movement.'
        ],
        commonErrors: [
          'Arching lower back excessively off the bench.',
          'Locking out elbows aggressively at top.'
        ],
        sets: [
          { setNumber: 1, prevRecord: '28kg × 10', weightKg: 28, reps: 10, completed: false },
          { setNumber: 2, prevRecord: '30kg × 8', weightKg: 30, reps: 8, completed: false },
          { setNumber: 3, prevRecord: '30kg × 8', weightKg: 30, reps: 8, completed: false },
        ]
      },
      {
        id: 'ex_4',
        name: 'Hanging Leg Raises',
        targetMuscle: 'Rectus Abdominis & Core',
        cadence: '2-1-2-1 Tempo',
        techniqueCues: [
          'Flex pelvis upward rather than just swinging legs.',
          'Squeeze abs hard at peak elevation.',
          'Control lowering phase without swinging body.'
        ],
        commonErrors: [
          'Using momentum to swing legs up.',
          'Hyperextending lumbar spine at bottom.'
        ],
        sets: [
          { setNumber: 1, prevRecord: 'BW × 15', weightKg: 0, reps: 15, completed: false },
          { setNumber: 2, prevRecord: 'BW × 12', weightKg: 0, reps: 12, completed: false },
          { setNumber: 3, prevRecord: 'BW × 12', weightKg: 0, reps: 12, completed: false },
        ]
      }
    ]
  },

  'HYPERTROPHY_OUTDOOR': {
    id: 'hyp_out',
    title: 'Outdoor Calisthenics Muscle Build',
    description: 'High-rep calisthenics & weighted bodyweight volume routine utilizing park equipment.',
    estimatedDuration: '40 mins',
    targetIntensity: 'Zone 3 (Sub-maximal Threshold)',
    equipmentRequired: 'Pull-Up Bar, Parallel Dip Bars',
    exercises: [
      {
        id: 'ex_5',
        name: 'Parallel Bar Weighted Dips',
        targetMuscle: 'Chest, Triceps & Anterior Delts',
        cadence: '3-0-1-0 Tempo',
        techniqueCues: [
          'Lean forward 15 degrees to prioritize chest activation.',
          'Lower until shoulders are below elbow joints.',
          'Drive through palms to return to full lockout.'
        ],
        commonErrors: [
          'Shrugging shoulders into neck.',
          'Partial depth reps.'
        ],
        sets: [
          { setNumber: 1, prevRecord: '+15kg × 12', weightKg: 15, reps: 12, completed: false },
          { setNumber: 2, prevRecord: '+20kg × 10', weightKg: 20, reps: 10, completed: false },
          { setNumber: 3, prevRecord: '+20kg × 10', weightKg: 20, reps: 10, completed: false },
        ]
      },
      {
        id: 'ex_6',
        name: 'Archer & Wide Grip Pull-ups',
        targetMuscle: 'Latissimus Dorsi & Rhomboids',
        cadence: '2-1-2-0 Tempo',
        techniqueCues: [
          'Pull chest toward bar with wide grip.',
          'Focus on full elbow extension at bottom.',
          'Keep core braced and legs straight.'
        ],
        commonErrors: [
          'Kipping legs for elevation.',
          'Incomplete range of motion.'
        ],
        sets: [
          { setNumber: 1, prevRecord: 'BW × 10', weightKg: 0, reps: 10, completed: false },
          { setNumber: 2, prevRecord: 'BW × 10', weightKg: 0, reps: 10, completed: false },
          { setNumber: 3, prevRecord: 'BW × 8', weightKg: 0, reps: 8, completed: false },
        ]
      },
      {
        id: 'ex_7',
        name: 'Elevated Feet Deficit Push-ups',
        targetMuscle: 'Upper Chest & Triceps',
        cadence: '2-1-1-0 Tempo',
        techniqueCues: [
          'Place feet on park bench, hands flat on ground.',
          'Lower chest until 1 inch from ground.',
          'Push floor away with explosive intent.'
        ],
        commonErrors: [
          'Sagging hips at waist.',
          'Looking up instead of keeping neck neutral.'
        ],
        sets: [
          { setNumber: 1, prevRecord: 'BW × 15', weightKg: 0, reps: 15, completed: false },
          { setNumber: 2, prevRecord: 'BW × 15', weightKg: 0, reps: 15, completed: false },
          { setNumber: 3, prevRecord: 'BW × 12', weightKg: 0, reps: 12, completed: false },
        ]
      }
    ]
  },

  'FAT_LOSS_INDOOR': {
    id: 'fat_ind',
    title: 'Indoor Metabolic Dumbbell Circuit',
    description: 'High-density multi-joint dumbbell circuit engineered for maximum calorie burn & cardiovascular strain.',
    estimatedDuration: '35 mins',
    targetIntensity: 'Zone 4 (V02 Peak Threshold)',
    equipmentRequired: 'Dumbbells, Treadmill / Rower',
    exercises: [
      {
        id: 'ex_8',
        name: 'Dumbbell Thrusters (Squat to Press)',
        targetMuscle: 'Quads, Glutes & Deltoids',
        cadence: 'Continuous Flow',
        techniqueCues: [
          'Squat to full depth with dumbbells at shoulder rack.',
          'Drive up explosively through heels.',
          'Transfer leg momentum into overhead dumbbell press.'
        ],
        commonErrors: [
          'Pausing at bottom of squat.',
          'Pressing dumbbells before legs extend.'
        ],
        sets: [
          { setNumber: 1, prevRecord: '16kg × 15', weightKg: 16, reps: 15, completed: false },
          { setNumber: 2, prevRecord: '18kg × 12', weightKg: 18, reps: 12, completed: false },
          { setNumber: 3, prevRecord: '18kg × 12', weightKg: 18, reps: 12, completed: false },
        ]
      },
      {
        id: 'ex_9',
        name: 'Renegade Rows to Push-Up',
        targetMuscle: 'Core, Lats & Chest',
        cadence: 'Controlled Flow',
        techniqueCues: [
          'Perform 1 push-up on dumbbells, then row left, then right.',
          'Keep hips parallel to ground without twisting.',
          'Squeeze lats hard on each dumbbell pull.'
        ],
        commonErrors: [
          'Twisting hips side to side during rows.',
          'Sagging lower back.'
        ],
        sets: [
          { setNumber: 1, prevRecord: '14kg × 10', weightKg: 14, reps: 10, completed: false },
          { setNumber: 2, prevRecord: '16kg × 10', weightKg: 16, reps: 10, completed: false },
          { setNumber: 3, prevRecord: '16kg × 8', weightKg: 16, reps: 8, completed: false },
        ]
      },
      {
        id: 'ex_10',
        name: 'Kettlebell Russian Swings',
        targetMuscle: 'Posterior Chain & Cardio',
        cadence: 'Explosive Hip Hinge',
        techniqueCues: [
          'Hinge at hips, driving kettlebell between thighs.',
          'Snap hips forward violently to project weight to chest level.',
          'Keep arms relaxed like ropes.'
        ],
        commonErrors: [
          'Squatting instead of hinging at hips.',
          'Lifting weight with shoulders/arms.'
        ],
        sets: [
          { setNumber: 1, prevRecord: '24kg × 20', weightKg: 24, reps: 20, completed: false },
          { setNumber: 2, prevRecord: '24kg × 20', weightKg: 24, reps: 20, completed: false },
          { setNumber: 3, prevRecord: '28kg × 15', weightKg: 28, reps: 15, completed: false },
        ]
      }
    ]
  },

  'FAT_LOSS_OUTDOOR': {
    id: 'fat_out',
    title: 'Outdoor Park HIIT & Conditioning',
    description: 'Bodyweight interval conditioning protocol designed for park conditioning and fat loss.',
    estimatedDuration: '30 mins',
    targetIntensity: 'Zone 4-5 (Max Anaerobic Peak)',
    equipmentRequired: 'Bodyweight, Jump Rope',
    exercises: [
      {
        id: 'ex_11',
        name: 'Outdoor Sprint Interval Burpees',
        targetMuscle: 'Full Body Conditioning',
        cadence: 'Maximal Pace',
        techniqueCues: [
          'Drop chest completely flat to ground.',
          'Jump feet back in under hips aggressively.',
          'Explode upward into vertical jump with overhead clap.'
        ],
        commonErrors: [
          'Arching lower back when rising.',
          'Short-stepping vertical jump.'
        ],
        sets: [
          { setNumber: 1, prevRecord: 'BW × 20', weightKg: 0, reps: 20, completed: false },
          { setNumber: 2, prevRecord: 'BW × 18', weightKg: 0, reps: 18, completed: false },
          { setNumber: 3, prevRecord: 'BW × 15', weightKg: 0, reps: 15, completed: false },
        ]
      },
      {
        id: 'ex_12',
        name: 'Walking Park Bench Plyo Step-Ups',
        targetMuscle: 'Quadriceps, Glutes & Cardio',
        cadence: '1-0-1-0 Tempo',
        techniqueCues: [
          'Place full foot firmly on bench surface.',
          'Drive through heel to step up without pushing off back leg.',
          'Alternate legs smoothly at steady rhythm.'
        ],
        commonErrors: [
          'Pushing off back toe for assistance.',
          'Slouching forward at waist.'
        ],
        sets: [
          { setNumber: 1, prevRecord: 'BW × 24', weightKg: 0, reps: 24, completed: false },
          { setNumber: 2, prevRecord: 'BW × 24', weightKg: 0, reps: 24, completed: false },
          { setNumber: 3, prevRecord: 'BW × 20', weightKg: 0, reps: 20, completed: false },
        ]
      },
      {
        id: 'ex_13',
        name: 'Speed Jump Rope Double-Unders',
        targetMuscle: 'Calves, Core & Cardio',
        cadence: 'Rapid Cadence',
        techniqueCues: [
          'Flick rope using wrists, keeping elbows close to torso.',
          'Jump lightly on balls of feet.',
          'Maintain steady breathing rhythm.'
        ],
        commonErrors: [
          'Bending knees backward while jumping.',
          'Swinging whole arms.'
        ],
        sets: [
          { setNumber: 1, prevRecord: 'BW × 100', weightKg: 0, reps: 100, completed: false },
          { setNumber: 2, prevRecord: 'BW × 100', weightKg: 0, reps: 100, completed: false },
          { setNumber: 3, prevRecord: 'BW × 80', weightKg: 0, reps: 80, completed: false },
        ]
      }
    ]
  }
};

export const LiveWorkoutTracker: React.FC = () => {
  const [goal, setGoal] = useState<GoalOption>('HYPERTROPHY');
  const [location, setLocation] = useState<LocationOption>('INDOOR');

  const presetKey = `${goal}_${location}`;
  const currentPreset = ROUTINE_PRESETS[presetKey] || ROUTINE_PRESETS['HYPERTROPHY_INDOOR'];

  const [routineState, setRoutineState] = useState<WorkoutRoutinePreset>(currentPreset);

  // Sync state whenever preference switch toggles
  useEffect(() => {
    setRoutineState(JSON.parse(JSON.stringify(currentPreset)));
  }, [goal, location]);

  // Form Cue Modal State
  const [activeTechniqueExercise, setActiveTechniqueExercise] = useState<ExerciseItem | null>(null);

  // Floating Rest Timer State
  const [restTimerSeconds, setRestTimerSeconds] = useState<number | null>(null);
  const [restTimerActive, setRestTimerActive] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (restTimerActive && restTimerSeconds !== null && restTimerSeconds > 0) {
      interval = setInterval(() => {
        setRestTimerSeconds((prev) => (prev && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (restTimerSeconds === 0) {
      setRestTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [restTimerActive, restTimerSeconds]);

  // Toggle set completion checkmark
  const handleToggleSet = (exerciseId: string, setIndex: number) => {
    setRoutineState((prev) => {
      const updatedExercises = prev.exercises.map((ex) => {
        if (ex.id === exerciseId) {
          const updatedSets = ex.sets.map((s, idx) => {
            if (idx === setIndex) {
              const nextCompleted = !s.completed;
              // Trigger rest timer if set marked completed
              if (nextCompleted) {
                setRestTimerSeconds(60);
                setRestTimerActive(true);
              }
              return { ...s, completed: nextCompleted };
            }
            return s;
          });
          return { ...ex, sets: updatedSets };
        }
        return ex;
      });
      return { ...prev, exercises: updatedExercises };
    });
  };

  // Calculate total volume lifted
  const totalVolumeKg = routineState.exercises.reduce((acc, ex) => {
    const exVol = ex.sets.reduce((sAcc, s) => (s.completed ? sAcc + s.weightKg * s.reps : sAcc), 0);
    return acc + exVol;
  }, 0);

  const completedSetsCount = routineState.exercises.reduce((acc, ex) => {
    return acc + ex.sets.filter((s) => s.completed).length;
  }, 0);

  const totalSetsCount = routineState.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  return (
    <div className="w-full bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/40 text-slate-800 min-h-screen p-4 sm:p-6 lg:p-8 font-sans space-y-6 select-none border border-sky-200/90 rounded-3xl shadow-sm">
      {/* 1. Interactive 2-Tier Preference Switcher Strip */}
      <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/70 border border-sky-200/90 rounded-2xl p-3 sm:p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-sky-600" /> Tailor Workout Session Routine
          </span>
          <span className="text-[11px] font-mono text-sky-700 font-bold">Live Auto-Recalculate</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Goal Switcher */}
          <div className="flex items-center bg-white/80 border border-sky-200 p-1 rounded-xl shadow-xs">
            <button
              onClick={() => setGoal('HYPERTROPHY')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all ${
                goal === 'HYPERTROPHY'
                  ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-sm shadow-sky-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50/50'
              }`}
            >
              Hypertrophy & Muscle Gain
            </button>
            <button
              onClick={() => setGoal('FAT_LOSS')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all ${
                goal === 'FAT_LOSS'
                  ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-sm shadow-sky-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50/50'
              }`}
            >
              Fat Loss & Endurance
            </button>
          </div>

          {/* Location Switcher */}
          <div className="flex items-center bg-white/80 border border-sky-200 p-1 rounded-xl shadow-xs">
            <button
              onClick={() => setLocation('INDOOR')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all ${
                location === 'INDOOR'
                  ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-sm shadow-sky-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50/50'
              }`}
            >
              Indoor / Gym Equipment
            </button>
            <button
              onClick={() => setLocation('OUTDOOR')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all ${
                location === 'OUTDOOR'
                  ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-sm shadow-sky-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50/50'
              }`}
            >
              Outdoor / Calisthenics
            </button>
          </div>
        </div>
      </div>

      {/* 2. Tailored Workout Routine Header with Real-World Contextual Photo Blend */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/70 border border-sky-200/90 rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-md transition-all">
        {/* Layer: Authentic Athletic Training Photography Backdrop */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.07] bg-cover bg-center mix-blend-multiply"
          style={{
            backgroundImage: `url('${getRoutineHeroPhoto(goal, location)}')`
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-700 text-[10px] font-mono font-medium uppercase tracking-wider">
                Tailored Active Routine
              </span>
              <span className="text-slate-500 text-xs font-mono font-normal">
                {goal} • {location}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-sans">
              {routineState.title}
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed font-normal">
              {routineState.description}
            </p>
          </div>

          {/* Real-time Session Volume & Set Completion Readout */}
          <div className="bg-white/80 border border-sky-200 p-4 rounded-2xl flex items-center gap-6 shrink-0 shadow-2xs backdrop-blur-xs">
            <div>
              <span className="text-[10px] font-mono text-slate-500 font-medium uppercase tracking-wider block">
                Session Volume
              </span>
              <span className="text-2xl font-bold font-mono text-sky-700 tabular-nums">
                {totalVolumeKg.toLocaleString()} <span className="text-xs text-slate-500 font-normal">kg</span>
              </span>
            </div>

            <div className="border-l border-sky-200 pl-6">
              <span className="text-[10px] font-mono text-slate-500 font-medium uppercase tracking-wider block">
                Sets Done
              </span>
              <span className="text-2xl font-bold font-mono text-slate-800 tabular-nums">
                {completedSetsCount} / {totalSetsCount}
              </span>
            </div>
          </div>
        </div>

        {/* Session Telemetry Chips */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5 pt-2 border-t border-sky-200/80">
          <span className="px-3 py-1.5 rounded-xl bg-sky-100/70 border border-sky-200 text-xs font-mono text-sky-900 font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-600" /> {routineState.estimatedDuration}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-100/80 border border-amber-200 text-xs font-mono text-amber-900 font-medium flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-600" /> {routineState.targetIntensity}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-100/80 border border-emerald-200 text-xs font-mono text-emerald-900 font-medium flex items-center gap-1.5">
            <Dumbbell className="w-3.5 h-3.5 text-emerald-600" /> {routineState.equipmentRequired}
          </span>
        </div>

        {/* Weekly Consistency 7-Day Streak Strip */}
        <div className="relative z-10 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 p-3 rounded-2xl border border-sky-200/80 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-mono font-medium text-slate-800 uppercase tracking-wider">
              Weekly Consistency Streak
            </span>
          </div>

          <div className="flex items-center gap-2">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
              const isCompleted = idx < 5;
              return (
                <div
                  key={idx}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs border ${
                    isCompleted
                      ? 'bg-sky-500 border-sky-600 text-white font-medium shadow-2xs'
                      : 'bg-white border-sky-200 text-slate-400 font-normal'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : day}
                </div>
              );
            })}
            <span className="text-xs font-mono font-medium text-amber-700 ml-2">🔥 5-Day Streak</span>
          </div>
        </div>
      </div>

      {/* 3. Live Interactive Exercise Log Cards */}
      <div className="space-y-6">
        {routineState.exercises.map((exercise) => (
          <div
            key={exercise.id}
            className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/70 border border-sky-200/90 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm hover:shadow-md hover:border-sky-300 transition-all"
          >
            {/* Exercise Title Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sky-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-sky-100 border border-sky-200 text-sky-800 text-[10px] font-mono font-medium uppercase">
                    {exercise.targetMuscle}
                  </span>
                  <span className="text-xs font-mono text-slate-500 font-normal">{exercise.cadence}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-sans">
                  {exercise.name}
                </h3>
              </div>

              <button
                onClick={() => setActiveTechniqueExercise(exercise)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-100/80 hover:bg-sky-200 text-sky-800 border border-sky-300 text-xs font-mono font-medium transition-all self-start sm:self-auto active:scale-95 shadow-xs"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Technique Cues</span>
              </button>
            </div>

            {/* Set Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="bg-sky-50/70 text-slate-600 uppercase tracking-wider border-b border-sky-100 text-[10px] font-medium">
                    <th className="py-2.5 px-3">Set #</th>
                    <th className="py-2.5 px-3">Prev Record</th>
                    <th className="py-2.5 px-3">Weight (kg)</th>
                    <th className="py-2.5 px-3">Target Reps</th>
                    <th className="py-2.5 px-3 text-right">Complete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100">
                  {exercise.sets.map((set, idx) => (
                    <tr
                      key={idx}
                      className={`transition-colors ${
                        set.completed
                          ? 'bg-sky-50/80 text-sky-700 line-through'
                          : 'hover:bg-sky-50/40 text-slate-700'
                      }`}
                    >
                      <td className="py-3 px-3 font-semibold text-slate-700">Set {set.setNumber}</td>
                      <td className="py-3 px-3 text-slate-400 tabular-nums font-normal">{set.prevRecord}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 bg-white border border-sky-200 rounded-md font-semibold tabular-nums text-slate-800">
                          {set.weightKg} <span className="font-normal text-slate-500">kg</span>
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 bg-white border border-sky-200 rounded-md font-semibold tabular-nums text-slate-800">
                          {set.reps} <span className="font-normal text-slate-500">reps</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleToggleSet(exercise.id, idx)}
                          className={`w-7 h-7 rounded-lg border flex items-center justify-center ml-auto transition-all active:scale-95 ${
                            set.completed
                              ? 'bg-sky-500 border-sky-400 text-white shadow-sm'
                              : 'bg-white border-slate-300 text-slate-400 hover:text-sky-600 hover:border-sky-300'
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Floating Auto-Rest Countdown Drawer */}
      {restTimerSeconds !== null && restTimerSeconds >= 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur-md border border-sky-200 shadow-xl rounded-2xl p-4 px-6 flex items-center gap-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth="3.5"
                  strokeDasharray="100, 100"
                  strokeDashoffset={100 - (restTimerSeconds / 60) * 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute font-mono font-bold text-xs text-slate-900 tabular-nums">
                {restTimerSeconds}s
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
                Auto-Rest Countdown
              </span>
              <span className="text-xs font-mono font-bold text-sky-600">
                {restTimerSeconds === 0 ? 'Rest Complete! Ready for Next Set' : 'Recovery Phase'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
            <button
              onClick={() => setRestTimerSeconds((prev) => (prev ? prev + 30 : 30))}
              className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-mono font-bold transition-all"
            >
              +30s
            </button>
            <button
              onClick={() => setRestTimerSeconds((prev) => (prev && prev > 15 ? prev - 15 : 0))}
              className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-mono font-bold transition-all"
            >
              -15s
            </button>
            <button
              onClick={() => {
                setRestTimerSeconds(null);
                setRestTimerActive(false);
              }}
              className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-mono font-bold transition-all ml-1 shadow-sm"
            >
              Skip Rest
            </button>
          </div>
        </div>
      )}

      {/* 5. Form Cue & Technique Modal */}
      {activeTechniqueExercise && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-sky-100 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveTechniqueExercise(null)}
              className="absolute top-5 right-5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono text-sky-600 font-bold uppercase tracking-wider">
                Execution Technique Guide
              </span>
              <h3 className="text-xl font-black text-slate-900 font-display mt-0.5">
                {activeTechniqueExercise.name}
              </h3>
              <span className="text-xs text-slate-500 font-mono block mt-1">
                Target: {activeTechniqueExercise.targetMuscle} • {activeTechniqueExercise.cadence}
              </span>
            </div>

            {/* Cues List */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sky-600" /> 3 High-Impact Execution Cues
              </h4>
              <ul className="space-y-2">
                {activeTechniqueExercise.techniqueCues.map((cue, idx) => (
                  <li key={idx} className="p-3 rounded-xl bg-sky-50/60 border border-sky-100 text-xs text-slate-700 leading-relaxed flex items-start gap-2">
                    <span className="w-5 h-5 rounded-md bg-sky-100 text-sky-700 font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{cue}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Common Errors */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <h4 className="text-xs font-mono font-bold text-rose-500 uppercase tracking-wider">
                Common Errors to Avoid
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {activeTechniqueExercise.commonErrors.map((err, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>{err}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setActiveTechniqueExercise(null)}
              className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-sky-200"
            >
              Got it, Resume Workout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
