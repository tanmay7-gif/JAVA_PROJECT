import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { WorkoutModal } from './components/workout/WorkoutModal';
import { WorkoutLog } from './types';

// Multi-Route Page Components
import { DashboardPage } from './pages/DashboardPage';
import { WorkoutsPage } from './pages/WorkoutsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { ProfilePage } from './pages/ProfilePage';
import { CommunityGuidesPage } from './pages/CommunityGuidesPage';

// Admin Space Pages
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminModerationPage } from './pages/AdminModerationPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';

// Protected Route Guard for Authenticated Users
const ProtectedUserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex flex-col items-center justify-center gap-3 text-emerald-800">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold tracking-wider uppercase text-emerald-600">
          Calibrating Telemetry Access...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Protected Route Guard for Admin Workspace (RBAC)
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex flex-col items-center justify-center gap-3 text-emerald-800">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold tracking-wider uppercase text-emerald-600">
          Verifying Cryptographic Credentials...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppShell: React.FC = () => {
  const { user, role, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState<boolean>(false);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutLog | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex flex-col items-center justify-center gap-3 text-emerald-800">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold tracking-wider uppercase text-emerald-600">
          Initializing Clinical Health OS...
        </p>
      </div>
    );
  }

  const handleOpenLogWorkout = () => {
    setEditingWorkout(null);
    setIsWorkoutModalOpen(true);
  };

  const handleEditWorkout = (workout: WorkoutLog) => {
    setEditingWorkout(workout);
    setIsWorkoutModalOpen(true);
  };

  const handleWorkoutSaved = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleNavigateTab = (tab: string) => {
    if (tab === 'analytics') navigate('/analytics');
    else if (tab === 'workouts') navigate('/workouts');
    else if (tab === 'challenges') navigate('/challenges');
    else if (tab === 'profile') navigate('/profile');
    else if (tab === 'guides') navigate('/community');
    else if (tab.startsWith('admin-')) {
      if (tab === 'admin-users') navigate('/admin/users');
      else if (tab === 'admin-content') navigate('/admin/moderation');
      else if (tab === 'admin-settings' || tab === 'admin-audit') navigate('/admin/settings');
      else navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-gray-900 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Persistent Light-Glass Navigation Header */}
      {user && <Navbar onOpenLogWorkout={handleOpenLogWorkout} />}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          {/* Public Root Route */}
          <Route
            path="/"
            element={
              user ? (
                <Navigate
                  to={role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'}
                  replace
                />
              ) : (
                <LandingPage />
              )
            }
          />

          {/* ================= USER SPACE ROUTES ================= */}
          {/* 1. /dashboard — Daily Pulse View */}
          <Route
            path="/dashboard"
            element={
              <ProtectedUserRoute>
                <DashboardPage
                  onOpenLogWorkout={handleOpenLogWorkout}
                  onNavigateTab={handleNavigateTab}
                  refreshTrigger={refreshTrigger}
                />
              </ProtectedUserRoute>
            }
          />

          {/* 2. /workouts — Workout Center */}
          <Route
            path="/workouts"
            element={
              <ProtectedUserRoute>
                <WorkoutsPage
                  onOpenLogWorkout={handleOpenLogWorkout}
                  onEditWorkout={handleEditWorkout}
                  refreshTrigger={refreshTrigger}
                />
              </ProtectedUserRoute>
            }
          />

          {/* 3. /analytics — 3D Metrics & Progress */}
          <Route
            path="/analytics"
            element={
              <ProtectedUserRoute>
                <AnalyticsPage />
              </ProtectedUserRoute>
            }
          />

          {/* 4. /challenges — Arena & Badges */}
          <Route
            path="/challenges"
            element={
              <ProtectedUserRoute>
                <ChallengesPage
                  onChallengeJoined={() => setRefreshTrigger((prev) => prev + 1)}
                />
              </ProtectedUserRoute>
            }
          />

          {/* 5. /profile — Interactive 3D Profile & Settings */}
          <Route
            path="/profile"
            element={
              <ProtectedUserRoute>
                <ProfilePage />
              </ProtectedUserRoute>
            }
          />

          {/* Optional: /community & /guides */}
          <Route
            path="/community"
            element={
              <ProtectedUserRoute>
                <CommunityGuidesPage />
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/guides"
            element={
              <ProtectedUserRoute>
                <Navigate to="/community" replace />
              </ProtectedUserRoute>
            }
          />

          {/* ================= ADMIN SPACE ROUTES ================= */}
          {/* 1. /admin/dashboard — Platform Overview & 3D Mesh */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboardPage />
              </ProtectedAdminRoute>
            }
          />

          {/* 2. /admin/users — Paginated User Directory */}
          <Route
            path="/admin/users"
            element={
              <ProtectedAdminRoute>
                <AdminUsersPage />
              </ProtectedAdminRoute>
            }
          />

          {/* 3. /admin/moderation — Content Approval Queue */}
          <Route
            path="/admin/moderation"
            element={
              <ProtectedAdminRoute>
                <AdminModerationPage />
              </ProtectedAdminRoute>
            }
          />

          {/* 4. /admin/settings — Global Platform Configuration */}
          <Route
            path="/admin/settings"
            element={
              <ProtectedAdminRoute>
                <AdminSettingsPage />
              </ProtectedAdminRoute>
            }
          />

          {/* Admin legacy alias */}
          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />

          {/* Wildcard Fallback */}
          <Route
            path="*"
            element={
              <Navigate
                to={
                  !user
                    ? '/'
                    : role === 'ADMIN'
                    ? '/admin/dashboard'
                    : '/dashboard'
                }
                replace
              />
            }
          />
        </Routes>
      </main>

      {/* Global Interactive Workout Modal (with 3D Muscle Anatomy Torso Selector) */}
      <WorkoutModal
        isOpen={isWorkoutModalOpen}
        onClose={() => setIsWorkoutModalOpen(false)}
        onSaved={handleWorkoutSaved}
        editWorkout={editingWorkout}
      />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}
