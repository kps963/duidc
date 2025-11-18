import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { LogIn, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(username, password);
    
    if (result.success) {
      toast({
        title: "Login Successful! 🎉",
        description: `Welcome ${result.role === 'admin' ? 'Admin' : result.role === 'class-teacher' ? 'Class Teacher' : 'Staff Member'}!`,
      });
      
      setTimeout(() => {
        if (result.role === 'admin') {
          navigate('/admin');
        } else if (result.role === 'class-teacher') {
          navigate('/class-teacher');
        } else {
          navigate('/staff');
        }
      }, 500);
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Helmet>
        <title>Login - College Attendance System</title>
        <meta name="description" content="Login to access the college attendance management system" />
      </Helmet>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="flex items-center justify-center mb-8">
            <GraduationCap className="w-12 h-12 text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">Attendance System</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                placeholder="Enter your username"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                placeholder="Enter your password"
                required
              />
            </div>
            
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;