import React from 'react';
import { AdminSystemSettings } from '../components/admin/AdminSystemSettings';

export const AdminSettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminSystemSettings />
    </div>
  );
};
