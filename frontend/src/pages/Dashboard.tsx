import React from 'react';
import {
  getCurrentUser,
  isDirector,
  isManager,
  isTeamLead,
} from '../utils/auth';

import DirectorDashboard from './DirectorDashboard';
import ManagerDashboard from './ManagerDashboard';
import TeamLeadDashboard from './TeamLeadDashboard';
import EmployeeDashboard from './EmployeeDashboard';

const Dashboard: React.FC = () => {
  const user = getCurrentUser();

  if (!user || !user.role) {
    return (
      <div className="p-6 text-center text-red-600 text-lg">
        Unauthorized: User not found or invalid role.
      </div>
    );
  }

  const role = user.role;

  if (isDirector(role)) {
    return <DirectorDashboard />;
  }

  if (isManager(role)) {
    return <ManagerDashboard />;
  }

  if (isTeamLead(role)) {
    return <TeamLeadDashboard />;
  }

  // Default fallback to Employee Dashboard
  return <EmployeeDashboard />;
};

export default Dashboard;
