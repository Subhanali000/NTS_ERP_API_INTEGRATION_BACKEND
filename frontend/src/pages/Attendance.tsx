import React, { useState, useEffect } from 'react';
import { Clock, Calendar, TrendingUp, MapPin } from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import { getCurrentDate, getCurrentTime } from '../utils/dateUtils';

const Attendance: React.FC = () => {
  const user = getCurrentUser();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchInTime, setPunchInTime] = useState<string | null>(null);

useEffect(() => {
  const fetchAttendance = async () => {
    if (!user?.id || !user?.token) {
      console.error('User not authenticated');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/employee/${user.id}/attendance`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await res.json();
      setAttendance(data);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    }
  };

  fetchAttendance();
}, [user]);


  const todayAttendance = attendance.find(
    (a: any) => a.date === getCurrentDate()
  );

  const handlePunchIn = async () => {
    const punchIn = getCurrentTime();
    setPunchInTime(punchIn);
    setIsPunchedIn(true);

    try {
      const res = await fetch(`http://localhost:3000/api/employee/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          date: getCurrentDate(),
          punch_in: punchIn,
          punch_out: null,
          status: 'present',
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      fetchAttendance(); // refresh after punching in
    } catch (err) {
      console.error('Punch in failed:', err);
    }
  };

  const handlePunchOut = async () => {
    const punchOut = getCurrentTime();
    setIsPunchedIn(false);

    try {
      const existing = attendance.find((a: any) => a.date === getCurrentDate());

      const res = await fetch(`http://localhost:3000/api/employee/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          date: getCurrentDate(),
          punch_in: existing?.punch_in || punchInTime || '09:00',
          punch_out: punchOut,
          status: 'present',
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      fetchAttendance(); // refresh after punching out
    } catch (err) {
      console.error('Punch out failed:', err);
    }
  };

  const weeklyAttendance = attendance.slice(-7);
  const totalHours = weeklyAttendance.reduce((sum, a) => sum + (a.total_hours || 0), 0);
  const avgHours = weeklyAttendance.length ? totalHours / weeklyAttendance.length : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-600 mt-1">Track your daily attendance and working hours</p>
      </div>

      {/* Punch In/Out Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {isPunchedIn ? 'You\'re Checked In' : 'Ready to Start?'}
            </h2>
            <p className="text-blue-100 mb-4">
              {isPunchedIn 
                ? `Checked in at ${formatTime(punchInTime!)}` 
                : 'Click the button below to punch in'
              }
            </p>
            <div className="flex items-center space-x-4 text-sm text-blue-100">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>Office</span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-4">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <button
              onClick={isPunchedIn ? handlePunchOut : handlePunchIn}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                isPunchedIn
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-white text-blue-600 hover:bg-gray-100'
              }`}
            >
              {isPunchedIn ? 'Punch Out' : 'Punch In'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Hours</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {todayAttendance?.totalHours || 0}h
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Weekly Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalHours.toFixed(1)}h</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Daily Average</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{avgHours.toFixed(1)}h</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">In Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Out Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Total Hours</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {weeklyAttendance.map((attendance) => (
                <tr key={attendance.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">{new Date(attendance.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    {attendance.inTime ? formatTime(attendance.inTime) : '-'}
                  </td>
                  <td className="py-3 px-4">
                    {attendance.outTime ? formatTime(attendance.outTime) : '-'}
                  </td>
                  <td className="py-3 px-4">{attendance.totalHours || 0}h</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      attendance.status === 'present' ? 'bg-green-100 text-green-800' :
                      attendance.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                      attendance.status === 'absent' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {attendance.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;