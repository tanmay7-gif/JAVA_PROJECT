import React from 'react';
import { AdminDashboardPage } from './AdminDashboardPage';

export const AdminModerationPage: React.FC = () => {
  return <AdminDashboardPage initialTab="moderation" />;
};

export default AdminModerationPage;
