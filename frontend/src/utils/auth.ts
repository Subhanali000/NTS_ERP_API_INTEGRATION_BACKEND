import { User, UserRole } from '../types';

// Store current user in-memory for fast access
let currentUser: User | null = null;
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  } catch (err) {
    console.error('Failed to parse currentUser:', err);
    return null;
  }
};
export const setCurrentUser = (user: any) => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

export const clearCurrentUser = (): void => {
  currentUser = null;
  localStorage.removeItem('currentUser');
  localStorage.removeItem('authToken');
};

export const storeAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
};
export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

export const getAuthToken = () => localStorage.getItem('authToken');

export const isAuthenticated = (): boolean => !!getCurrentUser();

// Role-based access helpers — all null-safe
export const isDirector = (role?: UserRole): boolean =>
  !!role && [
    'global_hr_director',
    'global_operations_director',
    'engineering_director',
    'director_tech_team',
    'director_business_development'
  ].includes(role);

export const isManager = (role?: UserRole): boolean =>
  !!role && [
    'talent_acquisition_manager',
    'project_tech_manager',
    'quality_assurance_manager',
    'software_development_manager',
    'systems_integration_manager',
    'client_relations_manager'
  ].includes(role);

export const isTeamLead = (role?: UserRole): boolean => role === 'team_lead';
export const isEmployee = (role?: UserRole): boolean => role === 'employee';
export const isIntern = (role?: UserRole): boolean => role === 'intern';

export const getRoleDisplayName = (role?: UserRole): string => {
  const roleMap: Partial<Record<UserRole, string>> = {
    'global_hr_director': 'Global HR Director',
    'global_operations_director': 'Global Operations Director',
    'engineering_director': 'Engineering Director',
    'director_tech_team': 'Director – Tech Team',
    'director_business_development': 'Director – Business Development',
    'talent_acquisition_manager': 'Talent Acquisition Manager',
    'project_tech_manager': 'Project/Tech Manager',
    'quality_assurance_manager': 'Quality Assurance Manager',
    'software_development_manager': 'Software Development Manager',
    'systems_integration_manager': 'Systems Integration Manager',
    'client_relations_manager': 'Client Relations Manager',
    'team_lead': 'Team Lead',
    'employee': 'Employee',
    'intern': 'Intern'
  };

  return role ? roleMap[role] ?? role : 'Unknown';
};

export const getSimpleDesignation = (role?: UserRole): string => {
  if (!role) return 'Staff';
  if (isDirector(role)) return 'Director';
  if (isManager(role)) return 'Manager';
  if (isTeamLead(role)) return 'Team Lead';
  if (isEmployee(role)) return 'Employee';
  if (isIntern(role)) return 'Intern';
  return 'Staff';
};

export const getDepartmentColor = (department: string): string => {
  const colorMap: Record<string, string> = {
    'hr': 'bg-blue-500',
    'operations': 'bg-green-500',
    'engineering': 'bg-purple-500',
    'tech': 'bg-orange-500',
    'business_development': 'bg-pink-500',
    'quality_assurance': 'bg-yellow-500',
    'systems_integration': 'bg-indigo-500',
    'client_relations': 'bg-red-500'
  };

  return colorMap[department] || 'bg-gray-500';
};
