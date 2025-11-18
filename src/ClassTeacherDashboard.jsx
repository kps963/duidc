import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Calendar, CheckCircle, LogOut, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const ClassTeacherDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [recoveryStatus, setRecoveryStatus] = useState({});

  useEffect(() => {
    const storedAttendance = localStorage.getItem('attendanceRecords');
    const storedRecovery = localStorage.getItem('recoveryStatus');
    
    if (storedAttendance) {
      const allRecords = JSON.parse(storedAttendance);
      const classRecords = allRecords.filter(record => record.className === user.classNumber);
      setAttendanceRecords(classRecords);
    }
    
    if (storedRecovery) {
      setRecoveryStatus(JSON.parse(storedRecovery));
    }
  }, [user.classNumber]);

  const handleRecoveryToggle = (recordId, studentId) => {
    const key = `${recordId}-${studentId}`;
    const newStatus = { ...recoveryStatus, [key]: !recoveryStatus[key] };
    setRecoveryStatus(newStatus);
    localStorage.setItem('recoveryStatus', JSON.stringify(newStatus));
    
    toast({
      title: recoveryStatus[key] ? "Recovery Unmarked" : "Recovery Marked! ✅",
      description: recoveryStatus[key] ? "Period recovery status removed." : "Student has recovered the missed period.",
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const groupedByDate = attendanceRecords.reduce((acc, record) => {
    if (!acc[record.date]) {
      acc[record.date] = [];
    }
    acc[record.date].push(record);
    return acc;
  }, {});

  return (
    <div className="min-h-screen p-6">
      <Helmet>
        <title>Class Teacher Dashboard - Attendance System</title>
        <meta name="description" content="Class teacher dashboard for viewing and managing student attendance and recovery status" />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white flex items-center">
            <Users className="w-10 h-10 mr-3 text-green-400" />
            Class {user.classNumber} Teacher Dashboard
          </h1>
          <Button onClick={handleLogout} variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </motion.div>

        <div className="space-y-6">
          {Object.keys(groupedByDate).length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 text-center"
            >
              <Calendar className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <p className="text-white/60 text-lg">No attendance records for Class {user.classNumber} yet.</p>
            </motion.div>
          ) : (
            Object.entries(groupedByDate).sort((a, b) => new Date(b[0]) - new Date(a[0])).map(([date, records]) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
              >
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <Calendar className="w-6 h-6 mr-2 text-green-400" />
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h2>

                <div className="space-y-4">
                  {records.map((record) => (
                    <div key={record.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{record.subject}</h3>
                          <p className="text-white/60 text-sm">Period {record.period}</p>
                        </div>
                        <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm">
                          {record.absentees.length} Absent
                        </span>
                      </div>

                      {record.absentees.length > 0 ? (
                        <div className="space-y-2">
                          {record.absentees.map((student) => {
                            const recoveryKey = `${record.id}-${student.id}`;
                            const isRecovered = recoveryStatus[recoveryKey] || false;
                            
                            return (
                              <div key={student.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                                <div>
                                  <p className="text-white font-medium">{student.name}</p>
                                  <p className="text-white/50 text-sm">Roll No: {student.rollNo}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={recoveryKey}
                                    checked={isRecovered}
                                    onCheckedChange={() => handleRecoveryToggle(record.id, student.id)}
                                    className="border-white/30 data-[state=checked]:bg-green-600"
                                  />
                                  <label
                                    htmlFor={recoveryKey}
                                    className={`text-sm cursor-pointer ${isRecovered ? 'text-green-400' : 'text-white/60'}`}
                                  >
                                    {isRecovered ? 'Recovered ✓' : 'Mark as Recovered'}
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-white/60 text-center py-2">All students present</p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassTeacherDashboard;