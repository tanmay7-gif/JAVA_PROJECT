import React from 'react';
import { AdminContentModeration } from '../components/admin/AdminContentModeration';

export const AdminModerationPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminContentModeration />
    </div>
  );
};
