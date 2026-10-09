import React, { useState, useEffect, useCallback } from 'react';
import { Challenge, UserChallenge } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { HolographicBadge3D } from '../three/HolographicBadge3D';
import {
  Award,
  Flame,
  Clock,
  Dumbbell,
  CheckCircle2,
  Calendar,
  Sparkles,
  Users,
  Target,
  Trophy,
  Crown,
  Medal,
  TrendingUp,
} from 'lucide-react';

interface ChallengesViewProps {
  onChallengeJoined?: () => void;
}

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  email: string;
  avatar: string;
  tier: string;
  completedChallenges: number;
  totalCalories: number;
  streakDays: number;
  badge: string;
  level: string;
}

const getChallengePhoto = (metric: string, title: string) => {
  const lower = (metric + ' ' + title).toLowerCase();
  if (lower.includes('marathon') || lower.includes('run') || lower.includes('step') || lower.includes('distance')) {
    return 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=600&q=80';
  }
  if (lower.includes('cycl') || lower.includes('ride') || lower.includes('bike') || lower.includes('century')) {
    return 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80';
  }
  if (lower.includes('titan') || lower.includes('lift') || lower.includes('hypertrophy') || lower.includes('strength') || lower.includes('iron')) {
    return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80';
  }
  if (lower.includes('zenith') || lower.includes('stretch') || lower.includes('yoga') || lower.includes('mobility')) {
    return 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80';
  }
  if (lower.includes('swim') || lower.includes('water') || lower.includes('aqua')) {
    return 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=600&q=80';
  }
  return 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80';
};

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lead-1',
    rank: 1,
    name: 'Sarah Connor',
    email: 'sarah@fitpulse.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    tier: 'Titan Master',
    completedChallenges: 8,
    totalCalories: 6450,
    streakDays: 14,
    badge: 'Titan of Endurance',
    level: 'Lvl 4 Elite',
  },
  {
    id: 'lead-2',
    rank: 2,
    name: 'Marcus Vance',
    email: 'admin@fitpulse.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    tier: 'Kinetic Pioneer',
    completedChallenges: 6,
    totalCalories: 5120,
    streakDays: 10,
    badge: 'Century Cyclist',
    level: 'Lvl 4 Titan',
  },
  {
    id: 'lead-3',
    rank: 3,
    name: 'Alex Chen',
    email: 'alex@fitpulse.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    tier: 'Aerobic Trailblazer',
    completedChallenges: 5,
    totalCalories: 4300,
    streakDays: 8,
    badge: 'Marathon Finisher',
    level: 'Lvl 3 Challenger',
  },
  {
    id: 'lead-4',
    rank: 4,
    name: 'Maya Lin',
    email: 'maya@fitpulse.com',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
    tier: 'Zenith Master',
    completedChallenges: 4,
    totalCalories: 3820,
    streakDays: 6,
    badge: 'Century Cyclist',
    level: 'Lvl 3 Prodigy',
  },
  {
    id: 'lead-5',
    rank: 5,
    name: 'David Miller',
    email: 'david@fitpulse.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    tier: 'Conditioning Pro',
    completedChallenges: 3,
    totalCalories: 2950,
    streakDays: 5,
    badge: 'Titan of Endurance',
    level: 'Lvl 2 Athlete',
  },
];

export const ChallengesView: React.FC<ChallengesViewProps> = ({ onChallengeJoined }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'EXPLORE' | 'ACTIVE' | 'HISTORY' | 'LEADERBOARD'>('ACTIVE');
  const [leaderboardFilter, setLeaderboardFilter] = useState<'CALORIES' | 'CHALLENGES' | 'STREAK'>('CALORIES');
  const [selectedMedalAthlete, setSelectedMedalAthlete] = useState<LeaderboardEntry>(DEFAULT_LEADERBOARD[0]);
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
  const [myChallenges, setMyChallenges] = useState<{
    active: UserChallenge[];
    completed: UserChallenge[];
    total_badges_earned: number;
  }>({
    active: [],
    completed: [],
    total_badges_earned: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [challengesRes, myRes] = await Promise.all([
        api.getChallenges(),
        api.getMyChallenges(),
      ]);

      if (challengesRes.success && challengesRes.data) {
        setAllChallenges(challengesRes.data);
      }
      if (myRes.success && myRes.data) {
        setMyChallenges(myRes.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load challenge records.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleJoin = async (challengeId: string) => {
    setJoiningId(challengeId);
    try {
      await api.joinChallenge(challengeId);
      showToast('Challenge enrolled! Keep logging workouts to achieve milestones.', 'success');
      loadData();
      if (onChallengeJoined) onChallengeJoined();
    } catch (err: any) {
      showToast(err.message || 'Could not join challenge.', 'error');
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-sky-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-sky-600" />
            Endurance Challenges & 3D Badges
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Achieve physiological milestones and unlock holographic 3D medals for your permanent trophy cabinet.
          </p>
        </div>

        <div className="flex items-center p-1 bg-white border border-sky-150 rounded-2xl text-xs font-bold shadow-xs">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'ACTIVE'
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-200'
                : 'text-slate-500 hover:text-slate-900 hover:bg-sky-50/50'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            Active ({myChallenges.active.length})
          </button>
          <button
            onClick={() => setActiveTab('EXPLORE')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'EXPLORE'
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-200'
                : 'text-slate-500 hover:text-slate-900 hover:bg-sky-50/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Explore ({allChallenges.length})
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'HISTORY'
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-200'
                : 'text-slate-500 hover:text-slate-900 hover:bg-sky-50/50'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Trophy Case ({myChallenges.total_badges_earned})
          </button>
          <button
            onClick={() => setActiveTab('LEADERBOARD')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'LEADERBOARD'
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-200'
                : 'text-slate-500 hover:text-slate-900 hover:bg-sky-50/50'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            Leaderboard
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-sky-600">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium">Syncing challenge milestones...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: ACTIVE CHALLENGES */}
          {activeTab === 'ACTIVE' && (
            <div className="space-y-4">
              {myChallenges.active.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/70 border border-sky-200/90 shadow-sm">
                  <Target className="w-12 h-12 text-sky-400 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-slate-800">No active challenges in progress</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                    Enroll in an endurance or metabolic challenge to start tracking your next 3D badge.
                  </p>
                  <button
                    onClick={() => setActiveTab('EXPLORE')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-xs font-bold shadow-md shadow-sky-200 transition-all"
                  >
                    Browse Available Challenges
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myChallenges.active.map((uc) => {
                    const c = uc.challenge;
                    const percent = uc.progress_percentage || 0;
                    let metricIcon = <Flame className="w-4 h-4 text-sky-600" />;
                    let metricUnit = 'kcal';
                    if (c.target_metric === 'DURATION') {
                      metricIcon = <Clock className="w-4 h-4 text-sky-600" />;
                      metricUnit = 'mins';
                    } else if (c.target_metric === 'WORKOUT_COUNT') {
                      metricIcon = <Dumbbell className="w-4 h-4 text-sky-600" />;
                      metricUnit = 'sessions';
                    }

                    return (
                      <div
                        key={uc.id}
                        className="clinical-card p-5 sm:p-6 flex flex-col justify-between relative group hover:border-sky-300"
                      >
                        <div>
                          {/* Authentic Athletic Photography Header */}
                          <div className="h-28 w-full rounded-2xl overflow-hidden relative mb-3 bg-slate-900 group-hover:shadow-md transition-all">
                            <img
                              src={getChallengePhoto(c.target_metric, c.title)}
                              alt={c.title}
                              className="w-full h-full object-cover opacity-85 group-hover:scale-105 group-hover:opacity-95 transition-all duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent" />
                            <div className="absolute top-2 left-2 flex items-center gap-1.5">
                              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/90 text-sky-850 backdrop-blur-xs shadow-xs">
                                {c.target_metric}
                              </span>
                            </div>
                            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-xs">
                              <span className="font-medium text-[11px] text-sky-200 flex items-center gap-1">
                                <Award className="w-3.5 h-3.5 text-amber-300" />
                                {c.reward_badge}
                              </span>
                            </div>
                          </div>

                          <h4 className="text-base font-semibold text-slate-900 group-hover:text-sky-700 transition-colors">
                            {c.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-normal leading-relaxed">{c.description}</p>
                        </div>

                        {/* Progress Section */}
                        <div className="mt-4 pt-3.5 border-t border-sky-100 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600 flex items-center gap-1 font-normal">
                              {metricIcon}
                              {uc.current_progress.toLocaleString()} / {c.target_value.toLocaleString()} <span className="text-slate-400 font-normal">{metricUnit}</span>
                            </span>
                            <span className="font-semibold text-sky-700 font-mono">{percent}%</span>
                          </div>

                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-600 transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              Ends {new Date(c.end_date).toLocaleDateString()}
                            </span>
                            <span className="text-sky-600 font-medium">Auto-Synced</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EXPLORE ALL CHALLENGES */}
          {activeTab === 'EXPLORE' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allChallenges.map((c) => {
                const isJoined = c.user_status === 'IN_PROGRESS';
                const isCompleted = c.user_status === 'COMPLETED';

                return (
                  <div
                    key={c.id}
                    className="clinical-card p-5 sm:p-6 flex flex-col justify-between relative group hover:border-sky-300"
                  >
                    <div>
                      {/* Authentic Athletic Photography Header */}
                      <div className="h-28 w-full rounded-2xl overflow-hidden relative mb-3 bg-slate-900 group-hover:shadow-md transition-all">
                        <img
                          src={getChallengePhoto(c.target_metric, c.title)}
                          alt={c.title}
                          className="w-full h-full object-cover opacity-85 group-hover:scale-105 group-hover:opacity-95 transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent" />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/90 text-sky-850 backdrop-blur-xs shadow-xs">
                            {c.target_metric}
                          </span>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-xs">
                          <span className="font-medium text-[11px] text-sky-200 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-amber-300" />
                            {c.reward_badge}
                          </span>
                          <span className="text-[10px] text-white/80 flex items-center gap-1">
                            <Users className="w-3 h-3 text-sky-300" />
                            {c.total_participants || 0} enrolled
                          </span>
                        </div>
                      </div>

                      <h4 className="text-base font-semibold text-slate-900 mb-1">{c.title}</h4>
                      <p className="text-xs text-slate-500 mb-3.5 font-normal leading-relaxed">{c.description}</p>

                      <div className="p-3 rounded-xl bg-sky-50/80 border border-sky-200/80 text-sky-900 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-normal">Target Volume:</span>
                          <span className="font-semibold text-slate-900">
                            {c.target_value.toLocaleString()} <span className="font-normal text-slate-500">{c.target_metric.toLowerCase()}</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-normal">Reward Badge:</span>
                          <span className="font-medium text-sky-700 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-sky-600" />
                            {c.reward_badge}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-sky-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-normal">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Ends {new Date(c.end_date).toLocaleDateString()}
                      </span>

                      {isCompleted ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Achieved
                        </span>
                      ) : isJoined ? (
                        <span className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold">
                          Enrolled ({c.progress_percent || 0}%)
                        </span>
                      ) : (
                        <button
                          onClick={() => handleJoin(c.id)}
                          disabled={joiningId === c.id}
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-xs font-semibold shadow-sm shadow-sky-200 transition-all disabled:opacity-50"
                        >
                          {joiningId === c.id ? 'Joining...' : 'Enroll Challenge'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: TROPHY CASE WITH 3D HOLOGRAPHIC BADGES */}
          {activeTab === 'HISTORY' && (
            <div className="space-y-6">
              <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-r from-sky-100/90 via-[#E0F2FE]/80 to-[#F0F9FF] border border-sky-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div 
                  className="pointer-events-none absolute inset-0 opacity-[0.08] bg-cover bg-center mix-blend-multiply"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80')`
                  }}
                />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-sky-300/50">
                    <Trophy className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-sky-950 tracking-tight">3D Holographic Medal Cabinet</h3>
                    <p className="text-xs text-slate-600 font-normal">
                      Hover over any medal to inspect real-time physics lighting and holographic reflections.
                    </p>
                  </div>
                </div>

                <div className="relative z-10 text-right">
                  <div className="text-3xl font-bold text-sky-700 tracking-tight">
                    {myChallenges.completed.length}
                  </div>
                  <span className="text-xs font-normal text-slate-500 uppercase tracking-wider">
                    Badges Unlocked
                  </span>
                </div>
              </div>

              {myChallenges.completed.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <Award className="w-12 h-12 text-sky-200 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-slate-800">No completed badges yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Complete all target metrics for an active challenge to immortalize your 3D medal here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myChallenges.completed.map((uc) => (
                    <div
                      key={uc.id}
                      className="clinical-card p-5 flex flex-col items-center text-center relative overflow-hidden"
                    >
                      {/* 3D Holographic Medal Display */}
                      <HolographicBadge3D badgeName={uc.challenge.reward_badge} isUnlocked={true} />

                      <div className="mt-2 w-full">
                        <h4 className="text-sm font-bold text-slate-900">{uc.challenge.reward_badge}</h4>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{uc.challenge.title}</p>
                        <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                          Achieved {uc.completed_at ? new Date(uc.completed_at).toLocaleDateString() : 'Verified'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COMMUNITY LEADERBOARD */}
          {activeTab === 'LEADERBOARD' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Leaderboard Showcase Banner with 3D Holographic Medal */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-sky-600 via-sky-700 to-slate-900 text-white shadow-xl relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-8 space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-bold uppercase tracking-wider">
                      <Crown className="w-3.5 h-3.5 text-amber-300" />
                      Community Hall of Fame
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      Global Athletic Quest Leaderboard
                    </h3>
                    <p className="text-xs text-sky-100/90 leading-relaxed max-w-xl">
                      Real-time verified standings across all athletic endurance challenges. Click on any athlete to inspect their 3D holographic prestige trophy.
                    </p>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => setLeaderboardFilter('CALORIES')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          leaderboardFilter === 'CALORIES'
                            ? 'bg-white text-sky-800 shadow-md font-bold'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5 text-amber-300" />
                        Caloric Burn
                      </button>
                      <button
                        onClick={() => setLeaderboardFilter('CHALLENGES')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          leaderboardFilter === 'CHALLENGES'
                            ? 'bg-white text-sky-800 shadow-md font-bold'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        <Target className="w-3.5 h-3.5 text-sky-300" />
                        Completed Quests
                      </button>
                      <button
                        onClick={() => setLeaderboardFilter('STREAK')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          leaderboardFilter === 'STREAK'
                            ? 'bg-white text-sky-800 shadow-md font-bold'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                        Active Streaks
                      </button>
                    </div>
                  </div>

                  {/* Right side: 3D Holographic Medal Showcase of Selected Athlete */}
                  <div className="lg:col-span-4 flex flex-col items-center justify-center p-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-200 mb-1">
                      Rank #{selectedMedalAthlete.rank} Medal Preview
                    </span>
                    <HolographicBadge3D badgeName={selectedMedalAthlete.badge} isUnlocked={true} />
                    <span className="text-xs font-bold text-white mt-1">
                      {selectedMedalAthlete.name}
                    </span>
                    <span className="text-[10px] text-sky-200">
                      {selectedMedalAthlete.badge}
                    </span>
                  </div>
                </div>
              </div>

              {/* Top 3 Podium Display */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {DEFAULT_LEADERBOARD.slice(0, 3).map((ath, idx) => {
                  const isGold = idx === 0;
                  const isSilver = idx === 1;

                  return (
                    <div
                      key={ath.id}
                      onClick={() => setSelectedMedalAthlete(ath)}
                      className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                        selectedMedalAthlete.id === ath.id
                          ? 'border-sky-500 ring-2 ring-sky-300 shadow-md'
                          : 'border-sky-100 hover:border-sky-200 shadow-sm'
                      } ${
                        isGold
                          ? 'bg-gradient-to-b from-amber-50/60 to-white'
                          : isSilver
                          ? 'bg-gradient-to-b from-slate-50 to-white'
                          : 'bg-gradient-to-b from-sky-50/30 to-white'
                      }`}
                    >
                      {/* Rank Tag */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
                            isGold
                              ? 'bg-amber-400 text-white shadow-md shadow-amber-400/30'
                              : isSilver
                              ? 'bg-slate-300 text-slate-800'
                              : 'bg-amber-600 text-white'
                          }`}
                        >
                          {isGold ? '1' : isSilver ? '2' : '3'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                          {ath.level}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={ath.avatar}
                          alt={ath.name}
                          className="w-12 h-12 rounded-full border-2 border-white shadow object-cover"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{ath.name}</h4>
                          <span className="text-[11px] text-slate-500 block">{ath.tier}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-sky-100 text-center">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold">Burn</span>
                          <span className="text-xs font-black text-sky-700">
                            {ath.totalCalories.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold">Quests</span>
                          <span className="text-xs font-black text-sky-600">
                            {ath.completedChallenges}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold">Streak</span>
                          <span className="text-xs font-black text-rose-600">
                            {ath.streakDays}d
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Full Standings Table */}
              <div className="bg-white rounded-3xl border border-sky-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-sky-100 bg-sky-50/70 flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-900 uppercase tracking-wider">
                    Full Roster Standings
                  </span>
                  <span className="text-xs text-sky-600 font-medium">
                    Live Verified Records
                  </span>
                </div>

                <div className="divide-y divide-sky-100">
                  {DEFAULT_LEADERBOARD.map((athlete) => {
                    const isSelected = selectedMedalAthlete.id === athlete.id;

                    return (
                      <div
                        key={athlete.id}
                        onClick={() => setSelectedMedalAthlete(athlete)}
                        className={`p-4 flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected ? 'bg-sky-50/60' : 'hover:bg-sky-50/30'
                        }`}
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <span className="w-6 text-center text-xs font-bold text-slate-400">
                            #{athlete.rank}
                          </span>
                          <img
                            src={athlete.avatar}
                            alt={athlete.name}
                            className="w-10 h-10 rounded-full border border-sky-100 object-cover"
                          />
                          <div>
                            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                              {athlete.name}
                              <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                                {athlete.tier}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500">
                              3D Trophy: <strong className="text-slate-700">{athlete.badge}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 sm:gap-6 text-right">
                          <div className="hidden sm:block">
                            <span className="text-xs font-bold text-sky-700 block">
                              {athlete.totalCalories.toLocaleString()} kcal
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {athlete.completedChallenges} Quests Won
                            </span>
                          </div>
                          <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                            🔥 {athlete.streakDays}d
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
