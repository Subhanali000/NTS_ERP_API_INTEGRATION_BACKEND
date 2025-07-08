import React, { useState } from 'react';
import { TrendingUp, Users, Target, Award, Clock, CheckCircle, AlertTriangle, Eye, Filter, Search, Calendar, BarChart3, Building, UserCheck, Briefcase, Star, ChevronDown, ChevronRight, Activity, PieChart, Globe, Settings, UserPlus } from 'lucide-react';
import { getCurrentUser, getRoleDisplayName, isManager } from '../utils/auth';
import { mockUsers, mockTasks, mockProgressReports, mockProjects, mockAttendance } from '../data/mockData';
import { formatDate, getRelativeDate, getCurrentDate } from '../utils/dateUtils';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import AddEmployee from '../components/Director/AddEmployee';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DirectorDashboard: React.FC = () => {
  const user = getCurrentUser();
  const [activeTab, setActiveTab] = useState<'director' | 'manager' | 'employee'>('director');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [organizationUsers, setOrganizationUsers] = useState(mockUsers);

  // Enhanced mock data for comprehensive view
  const enhancedUsers = [
    ...organizationUsers,
    // Additional team members for better visualization
    { id: 'eng-1', name: 'Marcus Thompson', email: 'marcus.thompson@nts.com', role: 'employee' as const, department: 'engineering' as const, managerId: '8', joinDate: '2021-08-15', leaveBalance: 18, avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150' },
    { id: 'eng-2', name: 'Sophia Chen', email: 'sophia.chen@nts.com', role: 'employee' as const, department: 'engineering' as const, managerId: '8', joinDate: '2022-02-20', leaveBalance: 16, avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150' },
    { id: 'tech-1', name: 'Isabella Rodriguez', email: 'isabella.rodriguez@nts.com', role: 'employee' as const, department: 'tech' as const, managerId: '7', joinDate: '2021-11-10', leaveBalance: 19, avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150' },
    { id: 'tech-2', name: 'Daniel Kim', email: 'daniel.kim@nts.com', role: 'employee' as const, department: 'tech' as const, managerId: '7', joinDate: '2022-05-18', leaveBalance: 15, avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150' },
    { id: 'hr-1', name: 'Oliver Brown', email: 'oliver.brown@nts.com', role: 'employee' as const, department: 'hr' as const, managerId: '6', joinDate: '2021-06-12', leaveBalance: 20, avatar: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=150' },
    { id: 'ops-1', name: 'Liam Garcia', email: 'liam.garcia@nts.com', role: 'employee' as const, department: 'operations' as const, managerId: '2', joinDate: '2021-04-08', leaveBalance: 22, avatar: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150' },
    { id: 'bd-1', name: 'Noah Martinez', email: 'noah.martinez@nts.com', role: 'employee' as const, department: 'business_development' as const, managerId: '5', joinDate: '2021-09-22', leaveBalance: 21, avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150' }
  ];

  const departments = [...new Set(enhancedUsers.map(u => u.department))];
  const managers = enhancedUsers.filter(u => isManager(u.role));
  const employees = enhancedUsers.filter(u => u.role === 'employee' || u.role === 'intern');
  const teams = [
    { id: 'team-alpha', name: 'Alpha Team', managerId: '8', department: 'engineering', members: 5, manager: 'Robert Davis' },
    { id: 'team-beta', name: 'Beta Team', managerId: '7', department: 'tech', members: 4, manager: 'Anna Martinez' },
    { id: 'team-gamma', name: 'Gamma Team', managerId: '6', department: 'hr', members: 3, manager: 'James Wilson' },
    { id: 'team-delta', name: 'Delta Team', managerId: '2', department: 'operations', members: 4, manager: 'Michael Chen' },
    { id: 'team-epsilon', name: 'Epsilon Team', managerId: '5', department: 'business_development', members: 3, manager: 'Lisa Thompson' }
  ];

  const handleAddEmployee = (newEmployee: any) => {
    setOrganizationUsers(prev => [...prev, newEmployee]);
    console.log('New employee added to organization:', newEmployee);
    // TODO: Send to backend
  };

  const getDepartmentMetrics = (dept: string) => {
    const deptUsers = enhancedUsers.filter(u => u.department === dept);
    const deptTasks = mockTasks.filter(t => 
      deptUsers.some(user => user.id === t.assigneeId)
    );
    const completedTasks = deptTasks.filter(t => t.status === 'completed').length;
    const avgProgress = deptTasks.length > 0 
      ? Math.round(deptTasks.reduce((sum, task) => sum + task.progressPct, 0) / deptTasks.length)
      : Math.floor(Math.random() * 30) + 70; // Random for demo

    return {
      totalEmployees: deptUsers.length,
      completedTasks,
      totalTasks: deptTasks.length || Math.floor(Math.random() * 10) + 5,
      avgProgress,
      activeProjects: mockProjects.filter(p => 
        deptUsers.some(u => u.id === p.managerId)
      ).length || Math.floor(Math.random() * 3) + 1
    };
  };

  const getTeamMetrics = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return null;

    const teamMembers = enhancedUsers.filter(u => u.managerId === team.managerId);
    const teamTasks = mockTasks.filter(t => 
      teamMembers.some(member => member.id === t.assigneeId)
    );
    const completedTasks = teamTasks.filter(t => t.status === 'completed').length;
    const avgProgress = teamTasks.length > 0 
      ? Math.round(teamTasks.reduce((sum, task) => sum + task.progressPct, 0) / teamTasks.length)
      : Math.floor(Math.random() * 30) + 70;

    return {
      ...team,
      totalTasks: teamTasks.length || Math.floor(Math.random() * 8) + 3,
      completedTasks,
      avgProgress,
      efficiency: Math.floor(Math.random() * 20) + 80,
      productivity: Math.floor(Math.random() * 25) + 75,
      collaboration: Math.floor(Math.random() * 20) + 80,
      innovation: Math.floor(Math.random() * 30) + 70
    };
  };

  const getEmployeeMetrics = (empId: string) => {
    const empTasks = mockTasks.filter(t => t.assigneeId === empId);
    const completedTasks = empTasks.filter(t => t.status === 'completed').length;
    const avgProgress = empTasks.length > 0 
      ? Math.round(empTasks.reduce((sum, task) => sum + task.progressPct, 0) / empTasks.length)
      : Math.floor(Math.random() * 30) + 70;

    return {
      totalTasks: empTasks.length || Math.floor(Math.random() * 8) + 3,
      completedTasks,
      avgProgress,
      performance: Math.floor(Math.random() * 20) + 80,
      attendance: Math.floor(Math.random() * 10) + 90,
      quality: Math.floor(Math.random() * 15) + 85,
      growth: Math.floor(Math.random() * 25) + 75
    };
  };

  // Chart data for department overview
  const departmentChartData = {
    labels: departments.map(dept => dept.replace('_', ' ').toUpperCase()),
    datasets: [
      {
        label: 'Average Progress (%)',
        data: departments.map(dept => getDepartmentMetrics(dept).avgProgress),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(236, 72, 153, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8,
      }
    ],
  };

  // Team performance chart with filtering
  const filteredTeams = selectedTeam ? teams.filter(t => t.id === selectedTeam) : teams;
  const teamChartData = {
    labels: filteredTeams.map(team => team.name),
    datasets: [
      {
        label: 'Team Efficiency (%)',
        data: filteredTeams.map(team => getTeamMetrics(team.id)?.efficiency || 85),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Productivity (%)',
        data: filteredTeams.map(team => getTeamMetrics(team.id)?.productivity || 80),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 8,
      }
    ],
  };

  // Employee performance chart
  const filteredEmployees = employees.filter(emp => !selectedDepartment || emp.department === selectedDepartment).slice(0, 10);
  const employeeChartData = {
    labels: filteredEmployees.map(emp => emp.name.split(' ')[0]),
    datasets: [
      {
        label: 'Performance Score (%)',
        data: filteredEmployees.map(emp => getEmployeeMetrics(emp.id).performance),
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 2,
        borderRadius: 8,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const DirectorView = () => (
    <div className="space-y-8">
      {/* Company Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Employees</p>
              <p className="text-3xl font-bold mt-2">{enhancedUsers.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active Projects</p>
              <p className="text-3xl font-bold mt-2">{mockProjects.filter(p => p.status === 'active').length}</p>
            </div>
            <Briefcase className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Departments</p>
              <p className="text-3xl font-bold mt-2">{departments.length}</p>
            </div>
            <Building className="w-8 h-8 text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Avg Performance</p>
              <p className="text-3xl font-bold mt-2">87%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept.replace('_', ' ').toUpperCase()}</option>
            ))}
          </select>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Department Performance Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Department Performance Overview</h3>
        <div className="h-80">
          <Bar data={departmentChartData} options={chartOptions} />
        </div>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments
          .filter(dept => !selectedDepartment || dept === selectedDepartment)
          .map(dept => {
            const metrics = getDepartmentMetrics(dept);
            return (
              <div key={dept} className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 capitalize">
                      {dept.replace('_', ' ')} Department
                    </h4>
                    <p className="text-sm text-gray-600">{metrics.totalEmployees} employees</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Building className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-xl font-bold text-gray-900">{metrics.avgProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${metrics.avgProgress}%` }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">{metrics.completedTasks}</p>
                      <p className="text-xs text-gray-500">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">{metrics.totalTasks}</p>
                      <p className="text-xs text-gray-500">Total Tasks</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-purple-600">{metrics.activeProjects}</p>
                      <p className="text-xs text-gray-500">Projects</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );

  const ManagerView = () => (
    <div className="space-y-8">
      {/* Manager Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100">Total Teams</p>
              <p className="text-3xl font-bold mt-2">{teams.length}</p>
            </div>
            <Users className="w-8 h-8 text-indigo-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100">Active Managers</p>
              <p className="text-3xl font-bold mt-2">{managers.length}</p>
            </div>
            <UserCheck className="w-8 h-8 text-emerald-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-100">Team Efficiency</p>
              <p className="text-3xl font-bold mt-2">92%</p>
            </div>
            <Activity className="w-8 h-8 text-rose-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100">Collaboration</p>
              <p className="text-3xl font-bold mt-2">89%</p>
            </div>
            <Globe className="w-8 h-8 text-amber-200" />
          </div>
        </div>
      </div>

      {/* Enhanced Team Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">Filter Teams:</span>
          </div>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Teams</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name} - {team.manager}</option>
            ))}
          </select>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept.replace('_', ' ').toUpperCase()}</option>
            ))}
          </select>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Team Performance Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          {selectedTeam ? `${teams.find(t => t.id === selectedTeam)?.name} Performance` : 'Team Performance Overview'}
        </h3>
        <div className="h-80">
          <Bar data={teamChartData} options={chartOptions} />
        </div>
      </div>

      {/* Team Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams
          .filter(team => !selectedTeam || team.id === selectedTeam)
          .filter(team => !selectedDepartment || team.department === selectedDepartment)
          .map(team => {
            const metrics = getTeamMetrics(team.id);
            const manager = enhancedUsers.find(u => u.id === team.managerId);
            
            return (
              <div key={team.id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{team.name}</h4>
                    <p className="text-sm text-gray-600">{team.members} members • {team.department.replace('_', ' ')}</p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img
                      src={manager?.avatar}
                      alt={manager?.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{manager?.name}</p>
                      <p className="text-xs text-gray-600">Team Manager</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Efficiency</span>
                    <span className="text-xl font-bold text-gray-900">{metrics?.efficiency}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${metrics?.efficiency}%` }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="text-center bg-green-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-green-600">{metrics?.completedTasks}</p>
                      <p className="text-xs text-green-700">Completed</p>
                    </div>
                    <div className="text-center bg-blue-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-blue-600">{metrics?.totalTasks}</p>
                      <p className="text-xs text-blue-700">Total Tasks</p>
                    </div>
                    <div className="text-center bg-purple-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-purple-600">{metrics?.productivity}%</p>
                      <p className="text-xs text-purple-700">Productivity</p>
                    </div>
                    <div className="text-center bg-orange-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-orange-600">{metrics?.collaboration}%</p>
                      <p className="text-xs text-orange-700">Collaboration</p>
                    </div>
                  </div>

                  {/* Team Performance Indicators */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Innovation Score</span>
                      <span className="font-bold text-gray-900">{metrics?.innovation}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                      <div
                        className="bg-gradient-to-r from-purple-400 to-pink-500 h-1 rounded-full"
                        style={{ width: `${metrics?.innovation}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Team Comparison Table */}
      {!selectedTeam && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Team Performance Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Team</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Manager</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Members</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Efficiency</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Productivity</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Tasks</th>
                </tr>
              </thead>
              <tbody>
                {teams
                  .filter(team => !selectedDepartment || team.department === selectedDepartment)
                  .map(team => {
                    const metrics = getTeamMetrics(team.id);
                    return (
                      <tr key={team.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{team.name}</div>
                          <div className="text-sm text-gray-600 capitalize">{team.department.replace('_', ' ')}</div>
                        </td>
                        <td className="py-4 px-4 text-gray-900">{team.manager}</td>
                        <td className="py-4 px-4 text-gray-900">{team.members}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${metrics?.efficiency}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{metrics?.efficiency}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${metrics?.productivity}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{metrics?.productivity}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-green-600 font-medium">{metrics?.completedTasks}</span>
                          <span className="text-gray-500">/{metrics?.totalTasks}</span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const EmployeeView = () => (
    <div className="space-y-8">
      {/* Employee Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100">Total Employees</p>
              <p className="text-3xl font-bold mt-2">{employees.length}</p>
            </div>
            <Users className="w-8 h-8 text-cyan-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100">High Performers</p>
              <p className="text-3xl font-bold mt-2">{employees.filter(emp => getEmployeeMetrics(emp.id).performance >= 90).length}</p>
            </div>
            <Star className="w-8 h-8 text-teal-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-100">Avg Performance</p>
              <p className="text-3xl font-bold mt-2">
                {Math.round(employees.reduce((sum, emp) => sum + getEmployeeMetrics(emp.id).performance, 0) / employees.length)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-violet-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100">Avg Attendance</p>
              <p className="text-3xl font-bold mt-2">
                {Math.round(employees.reduce((sum, emp) => sum + getEmployeeMetrics(emp.id).attendance, 0) / employees.length)}%
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-pink-200" />
          </div>
        </div>
      </div>

      {/* Employee Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept.replace('_', ' ').toUpperCase()}</option>
            ))}
          </select>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Employee Performance Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Employee Performance Overview</h3>
        <div className="h-80">
          <Bar data={employeeChartData} options={chartOptions} />
        </div>
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees
          .filter(emp => !selectedDepartment || emp.department === selectedDepartment)
          .slice(0, 12)
          .map(employee => {
            const metrics = getEmployeeMetrics(employee.id);
            const manager = enhancedUsers.find(u => u.id === employee.managerId);
            
            return (
              <div key={employee.id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={employee.avatar}
                    alt={employee.name}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-lg"
                  />
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">{employee.name}</h4>
                    <p className="text-sm text-gray-600">{getRoleDisplayName(employee.role)}</p>
                    <p className="text-xs text-gray-500 capitalize">{employee.department.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      metrics.performance >= 90 ? 'text-green-600' :
                      metrics.performance >= 80 ? 'text-blue-600' :
                      metrics.performance >= 70 ? 'text-yellow-600' :
                      'text-orange-600'
                    }`}>
                      {metrics.performance}%
                    </div>
                    <p className="text-xs text-gray-500">Performance</p>
                  </div>
                </div>

                {manager && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <img
                        src={manager.avatar}
                        alt={manager.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{manager.name}</p>
                        <p className="text-xs text-gray-600">Manager</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        metrics.performance >= 90 ? 'bg-green-500' :
                        metrics.performance >= 80 ? 'bg-blue-500' :
                        metrics.performance >= 70 ? 'bg-yellow-500' :
                        'bg-orange-500'
                      }`}
                      style={{ width: `${metrics.performance}%` }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center bg-blue-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-blue-600">{metrics.completedTasks}</p>
                      <p className="text-xs text-blue-700">Completed</p>
                    </div>
                    <div className="text-center bg-purple-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-purple-600">{metrics.totalTasks}</p>
                      <p className="text-xs text-purple-700">Total Tasks</p>
                    </div>
                    <div className="text-center bg-green-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-green-600">{metrics.attendance}%</p>
                      <p className="text-xs text-green-700">Attendance</p>
                    </div>
                    <div className="text-center bg-orange-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-orange-600">{metrics.quality}%</p>
                      <p className="text-xs text-orange-700">Quality</p>
                    </div>
                  </div>

                  {/* Growth Indicator */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Growth Score</span>
                      <span className="font-bold text-gray-900">{metrics.growth}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                      <div
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1 rounded-full"
                        style={{ width: `${metrics.growth}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Employee Performance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Employee Performance Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Employee</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Department</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Manager</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Performance</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Attendance</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Tasks</th>
              </tr>
            </thead>
            <tbody>
              {employees
                .filter(emp => !selectedDepartment || emp.department === selectedDepartment)
                .slice(0, 10)
                .map(employee => {
                  const metrics = getEmployeeMetrics(employee.id);
                  const manager = enhancedUsers.find(u => u.id === employee.managerId);
                  return (
                    <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={employee.avatar}
                            alt={employee.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{employee.name}</div>
                            <div className="text-sm text-gray-600">{getRoleDisplayName(employee.role)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-900 capitalize">{employee.department.replace('_', ' ')}</td>
                      <td className="py-4 px-4 text-gray-900">{manager?.name || 'N/A'}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                metrics.performance >= 90 ? 'bg-green-500' :
                                metrics.performance >= 80 ? 'bg-blue-500' :
                                metrics.performance >= 70 ? 'bg-yellow-500' :
                                'bg-orange-500'
                              }`}
                              style={{ width: `${metrics.performance}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{metrics.performance}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-green-600 font-medium">{metrics.attendance}%</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-blue-600 font-medium">{metrics.completedTasks}</span>
                        <span className="text-gray-500">/{metrics.totalTasks}</span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
            Executive Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Comprehensive organizational oversight and management</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddEmployee(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <UserPlus className="w-5 h-5" />
            <span>Add Employee</span>
          </button>
          <div className="p-2 bg-blue-100 rounded-lg">
            <Globe className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('director')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                activeTab === 'director'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Director Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('manager')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                activeTab === 'manager'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Manager Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('employee')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                activeTab === 'employee'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Employee Dashboard</span>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'director' && <DirectorView />}
          {activeTab === 'manager' && <ManagerView />}
          {activeTab === 'employee' && <EmployeeView />}
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <AddEmployee
          onClose={() => setShowAddEmployee(false)}
          onSave={handleAddEmployee}
        />
      )}
    </div>
  );
};

export default DirectorDashboard;