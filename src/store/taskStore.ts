import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Task } from '../types';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  moveTask: (taskId: string, newStatus: Task['status']) => void;
  setTasks: (tasks: Task[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

// Mock user ID until we have authentication
const TEMP_USER_ID = 'user-1';

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  isLoading: false,
  error: null,
  
  addTask: (taskData) => set((state) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      id: uuidv4(),
      ...taskData,
      createdAt: now,
      updatedAt: now,
      userId: TEMP_USER_ID,
    };
    
    return { tasks: [...state.tasks, newTask] };
  }),
  
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((task) => 
      task.id === id 
        ? { ...task, ...updates, updatedAt: new Date().toISOString() } 
        : task
    ),
  })),
  
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((task) => task.id !== id),
  })),
  
  completeTask: (id) => set((state) => ({
    tasks: state.tasks.map((task) => 
      task.id === id 
        ? { ...task, status: 'completed', updatedAt: new Date().toISOString() } 
        : task
    ),
  })),
  
  moveTask: (taskId, newStatus) => set((state) => ({
    tasks: state.tasks.map((task) => 
      task.id === taskId 
        ? { ...task, status: newStatus, updatedAt: new Date().toISOString() } 
        : task
    ),
  })),
  
  setTasks: (tasks) => set({ tasks }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
}));