import { create } from 'zustand';
import { Task } from '../types';
import { supabase } from '../lib/supabase';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: Task['status']) => Promise<void>;
  setTasks: (tasks: Task[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  
  fetchTasks: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          category:categories(name, color)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const tasks: Task[] = data.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        dueDate: task.due_date,
        priority: task.priority,
        status: task.status,
        category: task.category?.name || '',
        estimatedTime: task.estimated_time,
        actualTime: task.actual_time,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        userId: task.user_id,
      }));

      set({ tasks, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch tasks', isLoading: false });
    }
  },
  
  addTask: async (taskData) => {
    set({ isLoading: true });
    try {
      let categoryId = null;
      if (taskData.category) {
        // Check if category exists
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('name', taskData.category)
          .single();

        if (!existingCategory) {
          // Create new category
          const { data: newCategory, error: categoryError } = await supabase
            .from('categories')
            .insert([{ name: taskData.category }])
            .select('id')
            .single();

          if (categoryError) throw categoryError;
          categoryId = newCategory.id;
        } else {
          categoryId = existingCategory.id;
        }
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: taskData.title,
          description: taskData.description,
          due_date: taskData.dueDate,
          priority: taskData.priority,
          status: taskData.status,
          category_id: categoryId,
          estimated_time: taskData.estimatedTime,
          actual_time: taskData.actualTime,
        }])
        .select()
        .single();

      if (error) throw error;

      await get().fetchTasks(); // Refresh tasks
      set({ isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add task', isLoading: false });
    }
  },
  
  updateTask: async (id, updates) => {
    set({ isLoading: true });
    try {
      let categoryId = null;
      if (updates.category) {
        // Handle category update
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('name', updates.category)
          .single();

        if (!existingCategory) {
          const { data: newCategory, error: categoryError } = await supabase
            .from('categories')
            .insert([{ name: updates.category }])
            .select('id')
            .single();

          if (categoryError) throw categoryError;
          categoryId = newCategory.id;
        } else {
          categoryId = existingCategory.id;
        }
      }

      const { error } = await supabase
        .from('tasks')
        .update({
          title: updates.title,
          description: updates.description,
          due_date: updates.dueDate,
          priority: updates.priority,
          status: updates.status,
          category_id: categoryId,
          estimated_time: updates.estimatedTime,
          actual_time: updates.actualTime,
        })
        .eq('id', id);

      if (error) throw error;

      await get().fetchTasks(); // Refresh tasks
      set({ isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update task', isLoading: false });
    }
  },
  
  deleteTask: async (id) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete task', isLoading: false });
    }
  },
  
  completeTask: async (id) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'completed' })
        .eq('id', id);

      if (error) throw error;

      await get().fetchTasks(); // Refresh tasks
      set({ isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to complete task', isLoading: false });
    }
  },
  
  moveTask: async (taskId, newStatus) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      await get().fetchTasks(); // Refresh tasks
      set({ isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to move task', isLoading: false });
    }
  },
  
  setTasks: (tasks) => set({ tasks }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));