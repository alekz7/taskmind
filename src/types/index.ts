// Task Types
export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  category: string;
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  workHours: {
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
  workDays: number[]; // 0 = Sunday, 6 = Saturday
  focusTime: number; // in minutes
  breakTime: number; // in minutes
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
}

// Authentication Types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

// AI Suggestion Types
export interface AISuggestion {
  id: string;
  type: 'task-priority' | 'task-scheduling' | 'productivity' | 'idle-time';
  content: string;
  relatedTaskIds?: string[];
  applied: boolean;
  createdAt: string;
  userId: string;
}

// Dashboard Types
export interface DashboardState {
  todayTasks: Task[];
  upcomingTasks: Task[];
  completedTasks: Task[];
  suggestions: AISuggestion[];
  loading: boolean;
  error: string | null;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}