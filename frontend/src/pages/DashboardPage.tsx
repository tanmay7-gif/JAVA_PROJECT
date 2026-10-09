import React from 'react';
import { AthleteBiomechanicsDashboard } from '../components/dashboard/AthleteBiomechanicsDashboard';

interface DashboardPageProps {
  onOpenLogWorkout: () => void;
  onNavigateTab: (tab: string) => void;
  refreshTrigger: number;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenLogWorkout,
  onNavigateTab,
  refreshTrigger = 0,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AthleteBiomechanicsDashboard
        onOpenLogWorkout={onOpenLogWorkout}
        onNavigateTab={onNavigateTab}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
};
