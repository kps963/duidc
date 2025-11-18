import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Upload, Users, BookOpen, Calendar, LogOut, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState({ className: '', subjectName: '' });
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedClassForUpload, setSelectedClassForUpload] = useState('');
  
  useEffect(() => {
    // Data is now initialized as empty arrays, effectively clearing previous data.
    // User can re-upload fresh data.
    const storedStudents = localStorage.getItem('students');
    const storedSubjects = localStorage.getItem('subjects');
    const storedAttendance = localStorage.getItem('attendanceRecords');
    
    if (storedStudents) setStudents(JSON.parse(storedStudents));
    if (storedSubjects) setSubjects(JSON.parse(storedSubjects));
    if (storedAttendance) setAttendanceRecords(JSON.parse(storedAttendance));
  }, []);

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!selectedClassForUpload) {
      toast({
        title: "No Class Selected",
        description: "Please select a class before uploading the student file.",
        variant: "destructive",
      });
      e.target.value = ''; // Reset file input
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split('\n').filter(row => row.trim());
      
      const parsedStudents = rows.map((row, index) => {
        const values = row.split(',').map(v => v.trim());
        return {
          id: `${selectedClassForUpload}-${values[0] || Date.now() + index}`, // Unique ID
          rollNo: values[0] || '',
          adNumber: values[1] || '',
          name: values[2] || '',
          className: selectedClassForUpload,
        };
      });

      const otherClassStudents = students.filter(s => s.className !== selectedClassForUpload);
      const updatedStudents = [...otherClassStudents, ...parsedStudents];
      
      setStudents(updatedStudents);
      localStorage.setItem('students', JSON.stringify(updatedStudents));
      
      toast({
        title: "Students Uploaded! 🎉",
        description: `Successfully updated ${parsedStudents.length} students for Class ${selectedClassForUpload}.`,
      });
      e.target.value = '';
    };
    
    reader.readAsText(file);
  };
  
  const handleClearStudents = () => {
    if (!selectedClassForUpload) {
      toast({
        title: "No Class Selected",
        description: "Please select a class to clear its students.",
        variant: "destructive",
      });
      return;
    }
    
    const updatedStudents = students.filter(s => s.className !== selectedClassForUpload);
    setStudents(updatedStudents);
    localStorage.setItem('students', JSON.stringify(updatedStudents));

    toast({
      title: "Students Cleared! 🗑️",
      description: `All students from Class ${selectedClassForUpload} have been removed.`,
    });
  };

  const handleAddSubject = () => {
    if (!newSubject.className || !newSubject.subjectName) {
      toast({
        title: "Missing Information",
        description: "Please select a class and enter a subject name.",
        variant: "destructive",
      });
      return;
    }

    const subject = {
      id: Date.now(),
      ...newSubject,
    };

    const updatedSubjects = [...subjects, subject];
    setSubjects(updatedSubjects);
    localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
    setNewSubject({ className: '', subjectName: '' });
    
    toast({
      title: "Subject Added! ✅",
      description: `${newSubject.subjectName} added for Class ${newSubject.className}.`,
    });
  };

  const handleDeleteSubject = (id) => {
    const updatedSubjects = subjects.filter(s => s.id !== id);
    setSubjects(updatedSubjects);
    localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
    
    toast({
      title: "Subject Deleted",
      description: "Subject removed successfully.",
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const allClassNumbers = Array.from({ length: 10 }, (_, i) => (i + 1).toString());

  return (
    <div className="min-h-screen p-6">
      <Helmet>
        <title>Admin Dashboard - Attendance System</title>
        <meta name="description" content="Admin dashboard for managing students, subjects, and attendance records" />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white flex items-center">
            <Users className="w-10 h-10 mr-3 text-blue-400" />
            Admin Dashboard
          </h1>
          <Button onClick={handleLogout} variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </motion.div>

        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20">
            <TabsTrigger value="students" className="data-[state=active]:bg-blue-600">
              <Users className="w-4 h-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="subjects" className="data-[state=active]:bg-blue-600">
              <BookOpen className="w-4 h-4 mr-2" />
              Subjects
            </TabsTrigger>
            <TabsTrigger value="attendance" className="data-[state=active]:bg-blue-600">
              <Calendar className="w-4 h-4 mr-2" />
              Attendance Records
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <h2 className="text-2xl font-semibold text-white mb-4">Manage Students</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <Label className="text-white mb-2 block">1. Select Class</Label>
                     <Select value={selectedClassForUpload} onValueChange={setSelectedClassForUpload}>
                      <SelectTrigger className="bg-white/20 border-white/30 text-white">
                        <SelectValue placeholder="Choose a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {allClassNumbers.map((className) => (
                          <SelectItem key={className} value={className}>
                            Class {className}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 flex items-end gap-2">
                    <div className="flex-grow">
                      <Label htmlFor="csv-upload" className="text-white mb-2 block">
                        2. Upload New CSV
                      </Label>
                      <Input
                        id="csv-upload"
                        type="file"
                        accept=".csv"
                        onChange={handleCSVUpload}
                        className="bg-white/20 border-white/30 text-white file:bg-blue-600 file:text-white file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded-md"
                        disabled={!selectedClassForUpload}
                      />
                    </div>
                     <Button 
                        onClick={handleClearStudents} 
                        variant="destructive" 
                        disabled={!selectedClassForUpload}
                        className="h-10"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Clear
                      </Button>
                  </div>
                </div>

                {students.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold text-white mb-3">Student List ({students.length})</h3>
                    <div className="bg-white/5 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-white/10 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-white">Roll No</th>
                            <th className="px-4 py-3 text-left text-white">Ad No</th>
                            <th className="px-4 py-3 text-left text-white">Name</th>
                            <th className="px-4 py-3 text-left text-white">Class</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.sort((a, b) => a.className.localeCompare(b.className) || a.rollNo - b.rollNo).map((student) => (
                            <tr key={student.id} className="border-t border-white/10 hover:bg-white/5">
                              <td className="px-4 py-3 text-white/80">{student.rollNo}</td>
                              <td className="px-4 py-3 text-white/80">{student.adNumber}</td>
                              <td className="px-4 py-3 text-white/80">{student.name}</td>
                              <td className="px-4 py-3 text-white/80">{student.className}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="subjects">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <h2 className="text-2xl font-semibold text-white mb-4">Manage Subjects</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="class-name" className="text-white mb-2 block">Class</Label>
                  <Select
                    value={newSubject.className}
                    onValueChange={(value) => setNewSubject({ ...newSubject, className: value })}
                  >
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {allClassNumbers.map(num => (
                        <SelectItem key={num} value={num}>Class {num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject-name" className="text-white mb-2 block">Subject Name</Label>
                  <Input
                    id="subject-name"
                    value={newSubject.subjectName}
                    onChange={(e) => setNewSubject({ ...newSubject, subjectName: e.target.value })}
                    placeholder="e.g., Mathematics, Physics"
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  />
                </div>
              </div>

              <Button onClick={handleAddSubject} className="bg-blue-600 hover:bg-blue-700 mb-6">
                <BookOpen className="w-4 h-4 mr-2" />
                Add Subject
              </Button>

              {subjects.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Subject List ({subjects.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjects.sort((a,b) => a.className.localeCompare(b.className) || a.subjectName.localeCompare(b.subjectName)).map((subject) => (
                      <div key={subject.id} className="bg-white/5 rounded-lg p-4 border border-white/10 flex justify-between items-center">
                        <div>
                          <p className="text-white font-semibold">{subject.subjectName}</p>
                          <p className="text-white/60 text-sm">Class {subject.className}</p>
                        </div>
                        <Button
                          onClick={() => handleDeleteSubject(subject.id)}
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="attendance">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <h2 className="text-2xl font-semibold text-white mb-4">Attendance Records</h2>
              
              {attendanceRecords.length === 0 ? (
                <p className="text-white/60 text-center py-8">No attendance records yet. Staff will mark attendance.</p>
              ) : (
                <div className="bg-white/5 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-white/10 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-white">Date</th>
                        <th className="px-4 py-3 text-left text-white">Class</th>
                        <th className="px-4 py-3 text-left text-white">Subject</th>
                        <th className="px-4 py-3 text-left text-white">Period</th>
                        <th className="px-4 py-3 text-left text-white">Absentees</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.sort((a, b) => new Date(b.date) - new Date(a.date)).map((record) => (
                        <tr key={record.id} className="border-t border-white/10 hover:bg-white/5">
                          <td className="px-4 py-3 text-white/80">{record.date}</td>
                          <td className="px-4 py-3 text-white/80">{record.className}</td>
                          <td className="px-4 py-3 text-white/80">{record.subject}</td>
                          <td className="px-4 py-3 text-white/80">{record.period}</td>
                          <td className="px-4 py-3 text-white/80">{record.absentees.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;