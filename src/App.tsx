import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuthStore } from './store/authStore';
import { useTaskStore } from './store/taskStore';
import { useThemeStore } from './store/themeStore';
import Navbar from './components/layout/Navbar';

import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  const { theme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const { reset: resetTasks } = useTaskStore();

  // Apply theme class to html element
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  // Reset task store when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('🔄 User logged out, resetting task store');
      resetTasks();
    }
  }, [isAuthenticated, resetTasks]);

  return (
    <Router>
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col`}>
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tasks" 
              element={
                <ProtectedRoute>
                  <TasksPage />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/\" replace />} />
          </Routes>
        </main>
        <ToastContainer position="bottom-right" theme={theme} />
      </div>
    </Router>
  );
}

export default App