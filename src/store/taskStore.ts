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
    console.log('🔄 fetchTasks: Starting to fetch tasks from database...');
    set({ isLoading: true, error: null });
    
    try {
      console.log('📡 fetchTasks: Making Supabase query...');
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          category:categories(name, color)
        `)
        .order('created_at', { ascending: false });

      console.log('📡 fetchTasks: Raw Supabase response:', { data, error });

      if (error) {
        console.error('❌ fetchTasks: Supabase error:', error);
        throw error;
      }

      if (!data) {
        console.log('⚠️ fetchTasks: No data returned from Supabase');
        set({ tasks: [], isLoading: false });
        return;
      }

      console.log(`📊 fetchTasks: Retrieved ${data.length} tasks from database`);
      console.log('🔍 fetchTasks: First task raw data:', data[0]);

      const tasks: Task[] = data.map((task, index) => {
        console.log(`🔄 fetchTasks: Mapping task ${index + 1}/${data.length}:`, {
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          raw_task: task
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

        console.log(`✅ fetchTasks: Mapped task ${index + 1}:`, mappedTask);
        return mappedTask;
      });

      console.log('📋 fetchTasks: All mapped tasks:', tasks);
      console.log('📊 fetchTasks: Task distribution:', {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        completed: tasks.filter(t => t.status === 'completed').length
      });

      set({ tasks, isLoading: false });
      console.log('✅ fetchTasks: Tasks successfully loaded into store');
      
    } catch (error) {
      console.error('❌ fetchTasks: Error occurred:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
      set({ error: errorMessage, isLoading: false });
      console.error('❌ fetchTasks: Error set in store:', errorMessage);
    }
  },
  
  addTask: async (taskData) => {
    console.log('➕ addTask: Starting to add task:', taskData);
    set({ isLoading: true });
    
    try {
      let categoryId = null;
      if (taskData.category) {
        console.log('🏷️ addTask: Processing category:', taskData.category);
        
        // Check if category exists
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('name', taskData.category)
          .single();

        if (!existingCategory) {
          console.log('🆕 addTask: Creating new category:', taskData.category);
          // Create new category
          const { data: newCategory, error: categoryError } = await supabase
            .from('categories')
            .insert([{ name: taskData.category }])
            .select('id')
            .single();

          if (categoryError) throw categoryError;
          categoryId = newCategory.id;
          console.log('✅ addTask: New category created with ID:', categoryId);
        } else {
          categoryId = existingCategory.id;
          console.log('✅ addTask: Using existing category ID:', categoryId);
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
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ addTask: Database error:', error);
        throw error;
      }

      console.log('✅ addTask: Task inserted successfully:', data);
      console.log('🔄 addTask: Refreshing tasks...');
      await get().fetchTasks(); // Refresh tasks
      set({ isLoading: false });
      console.log('✅ addTask: Task addition completed');
      
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
      let categoryId = null;
      if (updates.category) {
        console.log('🏷️ updateTask: Processing category update:', updates.category);
        
        // Handle category update
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('name', updates.category)
          .single();

        if (!existingCategory) {
          console.log('🆕 updateTask: Creating new category:', updates.category);
          const { data: newCategory, error: categoryError } = await supabase
            .from('categories')
            .insert([{ name: updates.category }])
            .select('id')
            .single();

          if (categoryError) throw categoryError;
          categoryId = newCategory.id;
          console.log('✅ updateTask: New category created with ID:', categoryId);
        } else {
          categoryId = existingCategory.id;
          console.log('✅ updateTask: Using existing category ID:', categoryId);
        }
      }

      console.log(`📡 updateTask: Updating task ${id} in database...`);
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

      if (error) {
        console.error('❌ updateTask: Database error:', error);
        throw error;
      }

      console.log(`✅ updateTask: Task ${id} updated successfully`);
      console.log('🔄 updateTask: Refreshing tasks...');
      await get().fetchTasks(); // Refresh tasks
      set({ isLoading: false });
      console.log('✅ updateTask: Task update completed');
      
    } catch (error) {
      console.error('❌ updateTask: Error occurred:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  deleteTask: async (id) => {
    console.log(`🗑️ deleteTask: Starting to delete task ${id}`);
    set({ isLoading: true });
    
    try {
      console.log(`📡 deleteTask: Deleting task ${id} from database...`);
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ deleteTask: Database error:', error);
        throw error;
      }

      console.log(`✅ deleteTask: Task ${id} deleted successfully`);
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
        isLoading: false
      }));
      console.log('✅ deleteTask: Task deletion completed');
      
    } catch (error) {
      console.error('❌ deleteTask: Error occurred:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  completeTask: async (id) => {
    console.log(`✅ completeTask: Starting to complete task ${id}`);
    set({ isLoading: true });
    
    try {
      console.log(`📡 completeTask: Updating task ${id} status to completed...`);
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'completed' })
        .eq('id', id);

      if (error) {
        console.error('❌ completeTask: Database error:', error);
        throw error;
      }

      console.log(`✅ completeTask: Task ${id} marked as completed`);
      console.log('🔄 completeTask: Refreshing tasks...');
      await get().fetchTasks(); // Refresh tasks
      set({ isLoading: false });
      console.log('✅ completeTask: Task completion completed');
      
    } catch (error) {
      console.error('❌ completeTask: Error occurred:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete task';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  moveTask: async (taskId, newStatus) => {
    console.log(`🔄 moveTask called with taskId: ${taskId}, newStatus: ${newStatus}`);
    
    const currentTasks = get().tasks;
    console.log('📋 moveTask: Current tasks in store:', currentTasks.map(t => ({ id: t.id, title: t.title, status: t.status })));
    
    const taskToMove = currentTasks.find(task => task.id === taskId);
    
    if (!taskToMove) {
      console.error('❌ moveTask: Task not found for move operation:', taskId);
      console.error('❌ moveTask: Available task IDs:', currentTasks.map(t => t.id));
      return;
    }

    console.log(`📝 moveTask: Found task to move:`, { 
      id: taskToMove.id, 
      title: taskToMove.title, 
      currentStatus: taskToMove.status,
      newStatus: newStatus
    });

    // Optimistic update - update local state immediately
    const updatedTasks = currentTasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    
    console.log(`🔄 moveTask: Applying optimistic update - changing status from ${taskToMove.status} to ${newStatus}`);
    console.log('📊 moveTask: Updated task distribution (optimistic):', {
      pending: updatedTasks.filter(t => t.status === 'pending').length,
      inProgress: updatedTasks.filter(t => t.status === 'in-progress').length,
      completed: updatedTasks.filter(t => t.status === 'completed').length
    });
    
    set({ tasks: updatedTasks });
    
    try {
      console.log(`🚀 moveTask: Making Supabase API call to update task ${taskId}...`);
      
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) {
        console.error('❌ moveTask: Supabase error:', error);
        throw error;
      }
      
      console.log(`✅ moveTask: Task ${taskId} successfully moved to ${newStatus} in database`);
      console.log(`📊 moveTask: Final task distribution after database update:`, {
        pending: updatedTasks.filter(t => t.status === 'pending').length,
        inProgress: updatedTasks.filter(t => t.status === 'in-progress').length,
        completed: updatedTasks.filter(t => t.status === 'completed').length
      });
      
    } catch (error) {
      console.error('❌ moveTask: Failed to move task in database, reverting optimistic update:', error);
      // Revert optimistic update on error
      set({ tasks: currentTasks });
      set({ error: error instanceof Error ? error.message : 'Failed to move task' });
      throw error; // Re-throw so the UI can handle it
    }
  },
  
  setTasks: (tasks) => {
    console.log('📋 setTasks: Setting tasks in store:', tasks.map(t => ({ id: t.id, title: t.title, status: t.status })));
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
}));