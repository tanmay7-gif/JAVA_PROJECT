import React from 'react';
import { UsersDirectory } from './UsersDirectory';

export const AdminUsersPage: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-300">
      <UsersDirectory />
    </div>
  );
};

export default AdminUsersPage;
