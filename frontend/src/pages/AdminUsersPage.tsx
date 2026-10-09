import React from 'react';
import { AdminDashboardPage } from './AdminDashboardPage';

export const AdminUsersPage: React.FC = () => {
  return <AdminDashboardPage initialTab="users" />;
};

export default AdminUsersPage;
