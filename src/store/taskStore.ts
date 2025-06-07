import { create } from 'zustand';
import { Task } from '../types';
import { supabase } from '../lib/supabase';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  
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
  reset: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  isInitialized: false,
  
  fetchTasks: async () => {
    console.log('🔄 fetchTasks: Starting to fetch tasks from database...');
    set({ isLoading: true, error: null });
    
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('❌ fetchTasks: No authenticated user found');
        set({ tasks: [], isLoading: false, isInitialized: true });
        return;
      }

      console.log('👤 fetchTasks: Authenticated user:', user.id);
      console.log('📡 fetchTasks: Making Supabase query...');
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          due_date,
          priority,
          status,
          estimated_time,
          actual_time,
          created_at,
          updated_at,
          user_id,
          category:categories(name, color)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('📡 fetchTasks: Raw Supabase response:', { data, error });

      if (error) {
        console.error('❌ fetchTasks: Supabase error:', error);
        throw error;
      }

      if (!data) {
        console.log('⚠️ fetchTasks: No data returned from Supabase');
        set({ tasks: [], isLoading: false, isInitialized: true });
        return;
      }

      console.log(`📊 fetchTasks: Retrieved ${data.length} tasks from database`);

      const tasks: Task[] = data.map((task, index) => {
        console.log(`🔄 fetchTasks: Mapping task ${index + 1}/${data.length}:`, {
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority
        });

        const mappedTask: Task = {
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
        };

        return mappedTask;
      });

      console.log('📋 fetchTasks: All mapped tasks:', tasks);
      console.log('📊 fetchTasks: Task distribution:', {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        completed: tasks.filter(t => t.status === 'completed').length
      });

      set({ tasks, isLoading: false, isInitialized: true });
      console.log('✅ fetchTasks: Tasks successfully loaded into store');
      
    } catch (error) {
      console.error('❌ fetchTasks: Error occurred:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
      set({ error: errorMessage, isLoading: false, isInitialized: true });
    }
  },
  
  addTask: async (taskData) => {
    console.log('➕ addTask: Starting to add task:', taskData);
    set({ isLoading: true });
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      let categoryId = null;
      if (taskData.category) {
        console.log('🏷️ addTask: Processing category:', taskData.category);
        
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('name', taskData.category)
          .eq('user_id', user.id)
          .single();

        if (!existingCategory) {
          console.log('🆕 addTask: Creating new category:', taskData.category);
          const { data: newCategory, error: categoryError } = await supabase
            .from('categories')
            .insert([{ 
              name: taskData.category,
              user_id: user.id 
            }])
            .select('id')
            .single();

          if (categoryError) throw categoryError;
          categoryId = newCategory.id;
        } else {
          categoryId = existingCategory.id;
        }
      }

      console.log('📡 addTask: Inserting task into database...');
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
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ addTask: Task inserted successfully');
      await get().fetchTasks(); // Refresh tasks
      set({ isLoading: false });
      
    } catch (error) {
      console.error('❌ addTask: Error occurred:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add task';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  updateTask: async (id, updates) => {
    console.log(`📝 updateTask: Starting to update task ${id}:`, updates);
    set({ isLoading: true });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      let categoryId = null;
      if (updates.category) {
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('name', updates.category)
          .eq('user_id', user.id)
          .single();

        if (!existingCategory) {
          const { data: newCategory, error: categoryError } = await supabase
            .from('categories')
            .insert([{ 
              name: updates.category,
              user_id: user.id 
            }])
            .select('id')
            .single();

          if (categoryError) throw categoryError;
          categoryId = newCategory.id;
        } else {
          categoryId = existingCategory.id;
        }
      }

      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (categoryId !== null) updateData.category_id = categoryId;
      if (updates.estimatedTime !== undefined) updateData.estimated_time = updates.estimatedTime;
      if (updates.actualTime !== undefined) updateData.actual_time = updates.actualTime;

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log(`✅ updateTask: Task ${id} updated successfully`);
      await get().fetchTasks(); // Refresh tasks
      set({ isLoading: false });
      
    } catch (error) {
      console.error('❌ updateTask: Error occurred:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  deleteTask: async (id) => {
    console.log(`🗑️ deleteTask: Starting to delete task ${id}`);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log(`✅ deleteTask: Task ${id} deleted successfully`);
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id)
      }));
      
    } catch (error) {
      console.error('❌ deleteTask: Error occurred:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
      set({ error: errorMessage });
    }
  },
  
  completeTask: async (id) => {
    console.log(`✅ completeTask: Starting to complete task ${id}`);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('tasks')
        .update({ status: 'completed' })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log(`✅ completeTask: Task ${id} marked as completed`);
      
      // Update local state immediately
      set(state => ({
        tasks: state.tasks.map(task =>
          task.id === id ? { ...task, status: 'completed' } : task
        )
      }));
      
    } catch (error) {
      console.error('❌ completeTask: Error occurred:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete task';
      set({ error: errorMessage });
    }
  },
  
  moveTask: async (taskId, newStatus) => {
    console.log(`🎯 moveTask: Called with taskId=${taskId}, newStatus=${newStatus}`);
    
    const currentState = get();
    const currentTasks = currentState.tasks;
    
    console.log('📋 moveTask: Current tasks in store:', currentTasks.map(t => ({ 
      id: t.id, 
      title: t.title, 
      status: t.status 
    })));
    
    const taskToMove = currentTasks.find(task => task.id === taskId);
    
    if (!taskToMove) {
      console.error('❌ moveTask: Task not found!', {
        searchingFor: taskId,
        availableIds: currentTasks.map(t => t.id),
        totalTasks: currentTasks.length
      });
      set({ error: `Task ${taskId} not found` });
      return;
    }

    console.log(`📝 moveTask: Found task:`, { 
      id: taskToMove.id, 
      title: taskToMove.title, 
      currentStatus: taskToMove.status,
      newStatus: newStatus
    });

    if (taskToMove.status === newStatus) {
      console.log('⚠️ moveTask: Task already in target status, no change needed');
      return;
    }

    // Immediate optimistic update
    const optimisticTasks = currentTasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    
    console.log(`🔄 moveTask: Applying optimistic update`);
    console.log('📊 moveTask: New distribution (optimistic):', {
      pending: optimisticTasks.filter(t => t.status === 'pending').length,
      inProgress: optimisticTasks.filter(t => t.status === 'in-progress').length,
      completed: optimisticTasks.filter(t => t.status === 'completed').length
    });
    
    set({ tasks: optimisticTasks });
    
    try {
      console.log(`🚀 moveTask: Updating database for task ${taskId}...`);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ moveTask: Database update failed:', error);
        throw error;
      }
      
      console.log(`✅ moveTask: Database updated successfully for task ${taskId}`);
      console.log(`🎉 moveTask: Task ${taskId} successfully moved from ${taskToMove.status} to ${newStatus}`);
      
    } catch (error) {
      console.error('❌ moveTask: Database error, reverting optimistic update:', error);
      
      // Revert optimistic update
      set({ tasks: currentTasks });
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to move task';
      set({ error: errorMessage });
      
      throw error;
    }
  },
  
  setTasks: (tasks) => {
    console.log('📋 setTasks: Setting tasks in store:', tasks.length, 'tasks');
    set({ tasks });
  },
  
  setLoading: (isLoading) => {
    console.log('⏳ setLoading:', isLoading);
    set({ isLoading });
  },
  
  setError: (error) => {
    console.log('❌ setError:', error);
    set({ error });
  },

  reset: () => {
    console.log('🔄 reset: Resetting task store');
    set({ 
      tasks: [], 
      isLoading: false, 
      error: null, 
      isInitialized: false 
    });
  },
}));