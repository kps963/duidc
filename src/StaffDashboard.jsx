import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { CheckCircle, LogOut, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const StaffDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [attendance, setAttendance] = useState({});
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    const storedStudents = localStorage.getItem('students');
    const storedSubjects = localStorage.getItem('subjects');
    
    if (storedStudents) setStudents(JSON.parse(storedStudents));
    if (storedSubjects) setSubjects(JSON.parse(storedSubjects));
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const classStudents = students
        .filter(s => s.className === selectedClass)
        .sort((a,b) => a.rollNo - b.rollNo);
      setFilteredStudents(classStudents);
      
      const initialAttendance = {};
      classStudents.forEach(student => {
        initialAttendance[student.id] = true;
      });
      setAttendance(initialAttendance);
    } else {
      setFilteredStudents([]);
      setAttendance({});
    }
  }, [selectedClass, students]);

  const handleAttendanceToggle = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleSaveAttendance = () => {
    if (!selectedClass || !selectedSubject || !selectedPeriod) {
      toast({
        title: "Missing Information",
        description: "Please select class, subject, and period.",
        variant: "destructive",
      });
      return;
    }

    const absentees = filteredStudents.filter(student => !attendance[student.id]);
    
    const record = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      className: selectedClass,
      subject: selectedSubject,
      period: selectedPeriod,
      absentees: absentees,
      timestamp: new Date().toISOString(),
    };

    const existingRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    const updatedRecords = [...existingRecords, record];
    localStorage.setItem('attendanceRecords', JSON.stringify(updatedRecords));

    toast({
      title: "Attendance Saved! 🎉",
      description: `Recorded ${absentees.length} absent and ${filteredStudents.length - absentees.length} present students.`,
    });

    setSelectedClass('');
    setSelectedSubject('');
    setSelectedPeriod('');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const availableClasses = [...new Set(subjects.map(s => s.className))].sort();
  const availableSubjects = selectedClass ? subjects.filter(s => s.className === selectedClass) : [];

  const handleClassChange = (value) => {
    setSelectedClass(value);
    setSelectedSubject('');
    setSelectedPeriod('');
  }

  return (
    <div className="min-h-screen p-6">
      <Helmet>
        <title>Staff Dashboard - Attendance System</title>
        <meta name="description" content="Staff dashboard for marking student attendance" />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white flex items-center">
            <CheckCircle className="w-10 h-10 mr-3 text-orange-400" />
            Staff Dashboard
          </h1>
          <Button onClick={handleLogout} variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <h2 className="text-2xl font-semibold text-white mb-6">Mark Attendance</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label className="text-white mb-2 block">Select Class</Label>
              <Select value={selectedClass} onValueChange={handleClassChange}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white">
                  <SelectValue placeholder="Choose class" />
                </SelectTrigger>
                <SelectContent>
                  {availableClasses.map((className) => (
                    <SelectItem key={className} value={className}>
                      Class {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white mb-2 block">Select Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedClass}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white">
                  <SelectValue placeholder="Choose subject" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.subjectName}>
                      {subject.subjectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white mb-2 block">Select Period</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod} disabled={!selectedClass}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white">
                  <SelectValue placeholder="Choose period" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((period) => (
                    <SelectItem key={period} value={period.toString()}>
                      Period {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredStudents.length > 0 && selectedClass && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">
                  Students ({filteredStudents.length})
                </h3>
                <div className="text-white/60 text-sm">
                  Present: {Object.values(attendance).filter(Boolean).length} | 
                  Absent: {Object.values(attendance).filter(v => !v).length}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      attendance[student.id]
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div>
                      <p className="text-white font-medium">{student.name}</p>
                      <p className="text-white/50 text-sm">Roll No: {student.rollNo}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`student-${student.id}`}
                        checked={attendance[student.id]}
                        onCheckedChange={() => handleAttendanceToggle(student.id)}
                        className="border-white/30 data-[state=checked]:bg-green-600"
                      />
                      <label
                        htmlFor={`student-${student.id}`}
                        className={`text-sm cursor-pointer font-semibold ${
                          attendance[student.id] ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {attendance[student.id] ? 'Present' : 'Absent'}
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleSaveAttendance}
                className="w-full bg-blue-600 hover:bg-blue-700 mt-6"
                size="lg"
                disabled={!selectedSubject || !selectedPeriod}
              >
                <Save className="w-5 h-5 mr-2" />
                Save Attendance
              </Button>
            </div>
          )}

          {selectedClass && filteredStudents.length === 0 && (
            <p className="text-white/60 text-center py-8">No students found for Class {selectedClass}. Please upload students via the Admin Dashboard.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default StaffDashboard;