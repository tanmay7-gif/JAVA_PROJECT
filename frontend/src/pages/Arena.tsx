import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { Challenge, UserChallenge } from '../types';
import {
  Trophy,
  Flame,
  Award,
  Zap,
  Target,
  Plus,
  CheckCircle2,
  Lock,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Clock,
  Dumbbell,
  Check,
  ChevronRight,
  Activity,
  History,
  Calendar,
} from 'lucide-react';

export interface BadgeItem {
  id: string;
  title: string;
  category: string;
  unlocked: boolean;
  unlockedDate?: string;
  iconSymbol: string;
  bgGradient: string;
  borderColor: string;
  unlockHint: string;
}

export const Arena: React.FC = () => {
  // Live XP & Level State
  const [userXp, setUserXp] = useState<number>(1450);
  const [completedQuestsCount, setCompletedQuestsCount] = useState<number>(12);
  const [streakDays, setStreakDays] = useState<number>(5);

  // Challenges from Database
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [myChallenges, setMyChallenges] = useState<UserChallenge[]>([]);
  const [challengeHistory, setChallengeHistory] = useState<UserChallenge[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'challenges' | 'history'>('challenges');

  // Level Math
  const currentLevel = Math.floor(userXp / 300) + 1;
  const xpInCurrentLevel = userXp % 300;
  const levelProgressPercent = Math.min(Math.round((xpInCurrentLevel / 300) * 100), 100);
  const xpNeeded = 300 - xpInCurrentLevel;

  // Enamel Badges Showcase
  const [badges] = useState<BadgeItem[]>([
    {
      id: 'b1',
      title: 'Century Club',
      category: 'Strength Milestone',
      unlocked: true,
      unlockedDate: 'Oct 2, 2026',
      iconSymbol: '🏋️‍♂️',
      bgGradient: 'from-amber-400 to-amber-600',
      borderColor: 'border-amber-300',
      unlockHint: 'Log over 100 reps of compound lifts in a single week',
    },
    {
      id: 'b2',
      title: 'Night Owl Runner',
      category: 'Endurance',
      unlocked: true,
      unlockedDate: 'Sep 28, 2026',
      iconSymbol: '🌙',
      bgGradient: 'from-emerald-400 to-teal-600',
      borderColor: 'border-emerald-300',
      unlockHint: 'Complete a cardio workout past 8:00 PM',
    },
    {
      id: 'b3',
      title: 'Sub-25 5K Peak',
      category: 'Speed & V02',
      unlocked: true,
      unlockedDate: 'Sep 21, 2026',
      iconSymbol: '⚡',
      bgGradient: 'from-sky-400 to-blue-600',
      borderColor: 'border-sky-300',
      unlockHint: 'Finish a 5km run in under 25 minutes',
    },
    {
      id: 'b4',
      title: '5-Day Streak Master',
      category: 'Consistency',
      unlocked: true,
      unlockedDate: 'Oct 5, 2026',
      iconSymbol: '🔥',
      bgGradient: 'from-[#FF6B00] to-rose-600',
      borderColor: 'border-orange-300',
      unlockHint: 'Maintain a 5-day active workout streak',
    },
    {
      id: 'b5',
      title: 'Iron Core Titan',
      category: 'Abdominal Power',
      unlocked: false,
      iconSymbol: '🛡️',
      bgGradient: 'from-zinc-400 to-zinc-600',
      borderColor: 'border-zinc-300',
      unlockHint: 'Complete 600 cumulative seconds of core plank holds',
    },
    {
      id: 'b6',
      title: 'Ultra Marathoner',
      category: 'Distance Record',
      unlocked: false,
      iconSymbol: '🏃',
      bgGradient: 'from-zinc-400 to-zinc-600',
      borderColor: 'border-zinc-300',
      unlockHint: 'Log 50 km of running in a single calendar month',
    },
  ]);

  // Toast State
  const [activeToast, setActiveToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setActiveToast(msg);
    setTimeout(() => setActiveToast(null), 3000);
  };

  const loadChallengesData = async () => {
    setIsLoading(true);
    try {
      const [allRes, myRes, histRes] = await Promise.all([
        api.getChallenges(),
        api.getMyChallenges(),
        api.getChallengeHistory(),
      ]);

      if (allRes.success && allRes.data) {
        setChallenges(allRes.data);
      }
      if (myRes.success && myRes.data) {
        const myActive = Array.isArray(myRes.data)
          ? myRes.data
          : [...((myRes.data as any).active || []), ...((myRes.data as any).completed || [])];
        setMyChallenges(myActive);
      }
      if (histRes.success && histRes.data) {
        const histList = Array.isArray(histRes.data)
          ? histRes.data
          : [...((histRes.data as any).completed || []), ...((histRes.data as any).active || [])];
        setChallengeHistory(histList);
        const completed = histList.filter((h: any) => h.status === 'COMPLETED').length;
        setCompletedQuestsCount((prev) => Math.max(prev, completed));
      }

    } catch (err: any) {
      console.error('Failed to load challenges:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChallengesData();
  }, []);

  // Check if a challenge is already joined
  const getEnrollment = (challengeId: string) => {
    return myChallenges.find(
      (mc) => mc.challenge_id === challengeId || (mc as any).challengeId === challengeId
    );
  };

  // Join Challenge (Prevent duplicates)
  const handleJoinChallenge = async (challenge: Challenge) => {
    const existing = getEnrollment(challenge.id);
    if (existing || challenge.user_status === 'IN_PROGRESS' || challenge.user_status === 'COMPLETED') {
      triggerToast('You are already enrolled in this challenge!');
      return;
    }

    try {
      const res = await api.joinChallenge(challenge.id);
      if (res.success && res.data) {
        triggerToast(`🎯 Enrolled in ${challenge.title}! Grinding begins.`);
        setMyChallenges((prev) => [res.data, ...prev]);
        setChallenges((prev) =>
          prev.map((c) =>
            c.id === challenge.id
              ? {
                  ...c,
                  user_status: 'IN_PROGRESS',
                  user_progress: 0,
                  progress_percent: 0,
                  total_participants: (c.total_participants || 0) + 1,
                }
              : c
          )
        );
      }
    } catch (err: any) {
      triggerToast(err.message || 'Failed to join challenge.');
    }
  };

  // Log Progress toward Challenge
  const handleLogChallengeProgress = async (challenge: Challenge) => {
    const enrollment = getEnrollment(challenge.id);
    const userChallengeId = enrollment?.id || challenge.id;
    const currentProg = enrollment?.current_progress ?? challenge.user_progress ?? 0;
    const step = challenge.target_metric === 'DURATION' ? 15 : challenge.target_metric === 'CALORIES' ? 200 : 1;
    const nextProg = Math.min(challenge.target_value, currentProg + step);
    const isNowComplete = nextProg >= challenge.target_value;

    try {
      const res = await api.updateUserChallengeProgress(
        userChallengeId,
        nextProg,
        isNowComplete ? 'COMPLETED' : 'IN_PROGRESS'
      );

      if (res.success) {
        triggerToast(`+${step} progress logged! Keep pushing 💪`);
        // Update local state
        setMyChallenges((prev) =>
          prev.map((mc) =>
            mc.id === userChallengeId || mc.challenge_id === challenge.id
              ? {
                  ...mc,
                  current_progress: nextProg,
                  status: isNowComplete ? 'COMPLETED' : 'IN_PROGRESS',
                }
              : mc
          )
        );
        setChallenges((prev) =>
          prev.map((c) =>
            c.id === challenge.id
              ? {
                  ...c,
                  user_progress: nextProg,
                  progress_percent: Math.round((nextProg / c.target_value) * 100),
                  user_status: isNowComplete ? 'COMPLETED' : 'IN_PROGRESS',
                }
              : c
          )
        );

        if (isNowComplete) {
          // Refresh history
          api.getChallengeHistory().then((hRes) => {
            if (hRes.success && hRes.data) setChallengeHistory(hRes.data);
          });
        }
      }
    } catch (err: any) {
      triggerToast(err.message || 'Failed to update challenge progress.');
    }
  };

  // Claim XP Reward
  const handleClaimReward = async (challenge: Challenge) => {
    const xpAmount = challenge.reward_xp ?? (challenge as any).rewardXp ?? 200;
    setUserXp((prev) => prev + xpAmount);
    setCompletedQuestsCount((prev) => prev + 1);
    triggerToast(`🎉 +${xpAmount} XP Awarded! Badge added to trophy case.`);

    setChallenges((prev) =>
      prev.map((c) => (c.id === challenge.id ? { ...c, user_status: 'COMPLETED' } : c))
    );
  };

  const totalUnlockedBadges = badges.filter((b) => b.unlocked).length;

  return (
    <div className="w-full bg-slate-50 min-h-screen text-slate-800 p-4 sm:p-6 lg:p-8 font-sans space-y-8 animate-in fade-in duration-300">
      {/* Toast Banner */}
      {activeToast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white text-xs font-mono font-bold px-4 py-3 rounded-2xl shadow-xl border border-emerald-500/40 flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{activeToast}</span>
        </div>
      )}

      {/* Arena Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5 text-emerald-600" />
            FitPulse Gamified Arena & Badges
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
            Athletic Arena & Milestone Badges
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Join community challenges, track verified target progress, earn XP rewards, and preserve lifetime challenge history.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm self-start md:self-auto">
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'challenges'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Active Quests ({challenges.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Challenge History ({challengeHistory.length})</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout: Left Column (Quests / History & Badges) + Right Sticky Sidebar (XP & Tier) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Active Quests or History */}
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'challenges' ? (
            /* Active Challenges */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-extrabold text-slate-900 font-display">
                    Official Community Challenges
                  </h2>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {myChallenges.length} Active Enrollments
                </span>
              </div>

              {isLoading ? (
                <div className="p-12 text-center text-xs font-bold text-emerald-600">
                  Loading athletic arena challenges...
                </div>
              ) : challenges.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                  <Trophy className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No active challenges currently</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Check back soon for upcoming endurance and strength quests!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {challenges.map((c) => {
                    const enrollment = getEnrollment(c.id);
                    const isEnrolled = !!enrollment || c.user_status === 'IN_PROGRESS' || c.user_status === 'COMPLETED';
                    const currentProg = enrollment?.current_progress ?? c.user_progress ?? 0;
                    const percent = Math.min(100, Math.round((currentProg / c.target_value) * 100));
                    const isFullyCompleted = c.user_status === 'COMPLETED' || percent >= 100;
                    const xpVal = c.reward_xp ?? (c as any).rewardXp ?? 150;

                    return (
                      <div
                        key={c.id}
                        className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 transition-all hover:shadow-md ${
                          isFullyCompleted
                            ? 'border-emerald-300 ring-2 ring-emerald-500/10'
                            : isEnrolled
                            ? 'border-emerald-200 bg-emerald-50/10'
                            : 'border-slate-200/80'
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                              {c.target_metric}
                            </span>
                            <h3 className="text-base font-bold text-slate-900 font-display">
                              {c.title}
                            </h3>
                          </div>
                          {/* Reward Pill */}
                          <span className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-mono text-xs font-black shrink-0 flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            +{xpVal} XP
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 leading-relaxed">{c.description}</p>

                        {/* Progress Bar & Readout (Only if enrolled) */}
                        {isEnrolled && (
                          <div className="space-y-2 pt-2 border-t border-slate-100">
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-slate-600 font-semibold">
                                {currentProg} / {c.target_value} target
                              </span>
                              <span className="font-extrabold text-emerald-600">{percent}%</span>
                            </div>

                            <div className="w-full h-3 rounded-full bg-slate-100 p-0.5 overflow-hidden border border-slate-200/60">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isFullyCompleted
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                          {!isEnrolled ? (
                            <button
                              onClick={() => handleJoinChallenge(c)}
                              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Join Challenge</span>
                            </button>
                          ) : isFullyCompleted ? (
                            <button
                              onClick={() => handleClaimReward(c)}
                              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-mono font-black text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5 animate-pulse"
                            >
                              <Sparkles className="w-4 h-4 text-slate-950" />
                              <span>Claim +{xpVal} XP Reward</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleLogChallengeProgress(c)}
                              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono font-bold text-xs border border-slate-300/80 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5 text-slate-600" />
                              <span>Log Progress Toward Goal</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Challenge History View */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-extrabold text-slate-900 font-display">
                    Participation & Completion History
                  </h2>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {challengeHistory.length} Total Records
                </span>
              </div>

              {challengeHistory.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                  <History className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No challenge history recorded yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Complete quests to build your athletic archive!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {challengeHistory.map((h) => {
                    const challengeTitle = h.challenge?.title || 'Athletic Challenge';
                    const isDone = h.status === 'COMPLETED';

                    return (
                      <div
                        key={h.id}
                        className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${
                              isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isDone ? '🏆' : '🎯'}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{challengeTitle}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Enrolled: {new Date(h.joined_at).toLocaleDateString()}
                              {h.completed_at && ` • Completed: ${new Date(h.completed_at).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                              isDone
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-sky-50 text-sky-700 border border-sky-200'
                            }`}
                          >
                            {h.status}
                          </span>
                          <span className="text-xs font-mono font-bold text-amber-600">
                            +{h.challenge?.reward_xp || 150} XP
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section: Badges Showcase */}
          <div className="space-y-4 pt-4 border-t border-slate-200/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-extrabold text-slate-900 font-display">
                  Enamel Achievement Badges
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600">
                {totalUnlockedBadges} of {badges.length} Unlocked
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`bg-white border rounded-2xl p-4 flex flex-col items-center text-center space-y-3 shadow-sm transition-all relative overflow-hidden ${
                    badge.unlocked
                      ? 'border-slate-200 hover:shadow-md'
                      : 'border-dashed border-slate-300 opacity-60 bg-slate-50/50'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border ${
                      badge.unlocked
                        ? `bg-gradient-to-br ${badge.bgGradient} text-white ${badge.borderColor}`
                        : 'bg-slate-200 text-slate-400 border-slate-300'
                    }`}
                  >
                    {badge.iconSymbol}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 font-display">
                      {badge.title}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                      {badge.category}
                    </span>
                  </div>

                  {badge.unlocked ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Unlocked {badge.unlockedDate}
                    </span>
                  ) : (
                    <div className="p-2 rounded-xl bg-slate-100 border border-slate-200/60 text-[11px] text-slate-500 font-mono leading-tight">
                      🔒 {badge.unlockHint}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky User XP & Tier Sidebar */}
        <div className="lg:sticky lg:top-8 space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
            {/* Athlete Tier Badge */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-300 flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                  Current Rank Tier
                </span>
                <h3 className="text-lg font-black text-slate-900 font-display">
                  Level {currentLevel}: Iron Athlete
                </h3>
              </div>
            </div>

            {/* Live XP Counter */}
            <div className="space-y-1">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block font-bold">
                Lifetime Athlete XP
              </span>
              <div className="text-4xl font-black font-mono tabular-nums text-slate-900 tracking-tight flex items-baseline gap-1.5">
                <span>{userXp.toLocaleString()}</span>
                <span className="text-sm font-bold text-amber-500">XP</span>
              </div>
            </div>

            {/* Next Level Progress Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Progress to Level {currentLevel + 1}</span>
                <span className="font-bold text-slate-900">{levelProgressPercent}%</span>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-100 p-0.5 overflow-hidden border border-slate-200/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                  style={{ width: `${levelProgressPercent}%` }}
                />
              </div>

              <p className="text-[11px] font-mono text-slate-400 text-right">
                {xpNeeded} XP needed for Level {currentLevel + 1}
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center font-mono">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-lg font-black text-slate-900 block tabular-nums">
                  {completedQuestsCount}
                </span>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">
                  Quests
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-lg font-black text-amber-500 block tabular-nums">
                  {streakDays}d
                </span>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">
                  Streak
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-lg font-black text-emerald-600 block tabular-nums">
                  {totalUnlockedBadges}
                </span>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">
                  Badges
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
