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
    <AthleteBiomechanicsDashboard
      onOpenLogWorkout={onOpenLogWorkout}
      onNavigateTab={onNavigateTab}
      refreshTrigger={refreshTrigger}
    />
  );
};
