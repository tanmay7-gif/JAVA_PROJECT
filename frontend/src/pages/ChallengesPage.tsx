import React from 'react';
import { Arena } from './Arena';

interface ChallengesPageProps {
  onChallengeJoined?: () => void;
}

export const ChallengesPage: React.FC<ChallengesPageProps> = () => {
  return (
    <div className="animate-in fade-in duration-300">
      <Arena />
    </div>
  );
};

