import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Clear all relevant localStorage items on initial load
    localStorage.removeItem('students');
    localStorage.removeItem('subjects');
    localStorage.removeItem('attendanceRecords');
    localStorage.removeItem('recoveryStatus');

    const storedUser = localStorage.getItem('attendanceUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (username, password) => {
    if (username === 'kps963' && password === '2963') {
      const userData = { username, role: 'admin' };
      setUser(userData);
      localStorage.setItem('attendanceUser', JSON.stringify(userData));
      return { success: true, role: 'admin' };
    }
    
    if (username === 'classteacher' && password.startsWith('class')) {
      const classNumber = password.replace('class', '');
      const userData = { username, role: 'class-teacher', classNumber };
      setUser(userData);
      localStorage.setItem('attendanceUser', JSON.stringify(userData));
      return { success: true, role: 'class-teacher', classNumber };
    }
    
    if (username === 'dustaff' && password === 'duidc') {
      const userData = { username, role: 'staff' };
      setUser(userData);
      localStorage.setItem('attendanceUser', JSON.stringify(userData));
      return { success: true, role: 'staff' };
    }
    
    return { success: false };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('attendanceUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};