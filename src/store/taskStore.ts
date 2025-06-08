/**
 * Task Management Store using Zustand
 * 
 * This store manages all task-related state and operations for the TaskMind application.
 * It provides a clean interface for CRUD operations on tasks with Firebase Firestore.
 * 
 * Features:
 * - Real-time task synchronization with Firestore
 * - Optimistic updates for better UX
 * - Comprehensive error handling
 * - Loading states for all operations
 * - Task filtering and organization
 */

import { create } from "zustand";
import { Task } from "../types";
import { 
  getUserTasks, 
  createTask, 
  updateTask as updateTaskInFirestore, 
  deleteTask as deleteTaskFromFirestore,
  subscribeToUserTasks 
} from "../lib/firestore";
import { auth } from "../lib/firebase";

/**
 * Task Store State Interface
 * Defines the shape of the task store state and available actions
 */
interface TaskState {
  // State properties
  tasks: Task[];                    // Array of all user tasks
  isLoading: boolean;              // Loading state for async operations
  error: string | null;            // Error message if any operation fails
  isInitialized: boolean;          // Whether tasks have been loaded initially
  realtimeUnsubscribe: (() => void) | null; // Function to unsubscribe from real-time updates

  // Action methods
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "userId">) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: Task["status"]) => Promise<void>;
  setTasks: (tasks: Task[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  setupRealtimeSync: (userId: string) => void;
  cleanupRealtimeSync: () => void;
}

/**
 * Create the task store with Zustand
 * Manages all task-related state and operations
 */
export const useTaskStore = create<TaskState>((set, get) => ({
  // Initial state
  tasks: [],
  isLoading: false,
  error: null,
  isInitialized: false,
  realtimeUnsubscribe: null,

  /**
   * Fetch Tasks from Firestore
   * Loads all tasks for the current user from the database
   * This is typically called once when the user logs in
   */
  fetchTasks: async () => {
    console.log("🔄 fetchTasks: Starting to fetch tasks from Firestore...");
    set({ isLoading: true, error: null });

    try {
      // Check if user is authenticated
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        console.log("❌ fetchTasks: No authenticated user found");
        set({ tasks: [], isLoading: false, isInitialized: true });
        return;
      }

      console.log("👤 fetchTasks: Authenticated user:", currentUser.uid);
      console.log("📡 fetchTasks: Making Firestore query...");

      // Fetch tasks from Firestore
      const tasks = await getUserTasks(currentUser.uid);

      console.log(`📊 fetchTasks: Retrieved ${tasks.length} tasks from database`);
      console.log("📊 fetchTasks: Task distribution:", {
        total: tasks.length,
        pending: tasks.filter((t) => t.status === "pending").length,
        inProgress: tasks.filter((t) => t.status === "in-progress").length,
        completed: tasks.filter((t) => t.status === "completed").length,
      });

      // Update store with fetched tasks
      set({ tasks, isLoading: false, isInitialized: true });
      console.log("✅ fetchTasks: Tasks successfully loaded into store");
      
    } catch (error) {
      console.error("❌ fetchTasks: Error occurred:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch tasks";
      set({ error: errorMessage, isLoading: false, isInitialized: true });
    }
  },

  /**
   * Add New Task
   * Creates a new task in Firestore and updates local state
   * 
   * @param taskData - Task data without ID, timestamps, and userId
   */
  addTask: async (taskData) => {
    console.log("➕ addTask: Starting to add task:", taskData);
    set({ isLoading: true, error: null });

    try {
      // Get current authenticated user
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.error("❌ addTask: No authenticated user");
        throw new Error("No authenticated user found. Please log in again.");
      }

      console.log("👤 addTask: Authenticated user:", currentUser.uid);

      // Create task in Firestore
      console.log("📡 addTask: Creating task in Firestore...");
      const taskId = await createTask(currentUser.uid, taskData);

      console.log("✅ addTask: Task created successfully with ID:", taskId);

      // Create complete task object for local state
      const newTask: Task = {
        id: taskId,
        ...taskData,
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Update local state optimistically
      set((state) => ({
        tasks: [newTask, ...state.tasks],
        isLoading: false
      }));

      console.log("✅ addTask: Task added to local state");
      
    } catch (error) {
      console.error("❌ addTask: Error occurred:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to add task";
      set({ error: errorMessage, isLoading: false });
      throw error; // Re-throw so the UI can handle it
    }
  },

  /**
   * Update Existing Task
   * Updates a task in Firestore and local state
   * 
   * @param id - Task ID to update
   * @param updates - Partial task data to update
   */
  updateTask: async (id, updates) => {
    console.log(`📝 updateTask: Starting to update task ${id}:`, updates);
    set({ isLoading: true, error: null });

    try {
      // Get current authenticated user
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("No authenticated user found");
      }

      // Update task in Firestore
      await updateTaskInFirestore(id, updates);
      console.log(`✅ updateTask: Task ${id} updated in Firestore`);

      // Update local state optimistically
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id 
            ? { ...task, ...updates, updatedAt: new Date().toISOString() }
            : task
        ),
        isLoading: false
      }));

      console.log(`✅ updateTask: Task ${id} updated in local state`);
      
    } catch (error) {
      console.error("❌ updateTask: Error occurred:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update task";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  /**
   * Delete Task
   * Removes a task from Firestore and local state
   * 
   * @param id - Task ID to delete
   */
  deleteTask: async (id) => {
    console.log(`🗑️ deleteTask: Starting to delete task ${id}`);

    try {
      // Get current authenticated user
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("No authenticated user");
      }

      // Delete from Firestore
      await deleteTaskFromFirestore(id);
      console.log(`✅ deleteTask: Task ${id} deleted from Firestore`);

      // Update local state
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      }));

      console.log(`✅ deleteTask: Task ${id} removed from local state`);
      
    } catch (error) {
      console.error("❌ deleteTask: Error occurred:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete task";
      set({ error: errorMessage });
      throw error;
    }
  },

  /**
   * Complete Task
   * Marks a task as completed by updating its status
   * 
   * @param id - Task ID to complete
   */
  completeTask: async (id) => {
    console.log(`✅ completeTask: Starting to complete task ${id}`);

    try {
      // Use the updateTask method to change status to completed
      await get().updateTask(id, { status: "completed" });
      console.log(`✅ completeTask: Task ${id} marked as completed`);
      
    } catch (error) {
      console.error("❌ completeTask: Error occurred:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to complete task";
      set({ error: errorMessage });
      throw error;
    }
  },

  /**
   * Move Task to Different Status
   * Updates a task's status (used for drag-and-drop functionality)
   * 
   * @param taskId - Task ID to move
   * @param newStatus - New status for the task
   */
  moveTask: async (taskId, newStatus) => {
    console.log(`🎯 moveTask: Moving task ${taskId} to status ${newStatus}`);

    const currentState = get();
    const taskToMove = currentState.tasks.find((task) => task.id === taskId);

    if (!taskToMove) {
      console.error("❌ moveTask: Task not found!", {
        searchingFor: taskId,
        availableIds: currentState.tasks.map((t) => t.id),
      });
      set({ error: `Task ${taskId} not found` });
      return;
    }

    console.log(`📝 moveTask: Found task:`, {
      id: taskToMove.id,
      title: taskToMove.title,
      currentStatus: taskToMove.status,
      newStatus: newStatus,
    });

    if (taskToMove.status === newStatus) {
      console.log("⚠️ moveTask: Task already in target status, no change needed");
      return;
    }

    // Optimistic update - update local state immediately
    const optimisticTasks = currentState.tasks.map((task) =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );

    console.log(`🔄 moveTask: Applying optimistic update`);
    set({ tasks: optimisticTasks });

    try {
      // Update in Firestore
      console.log(`🚀 moveTask: Updating Firestore for task ${taskId}...`);
      await updateTaskInFirestore(taskId, { status: newStatus });
      
      console.log(`✅ moveTask: Task ${taskId} successfully moved to ${newStatus}`);
      
    } catch (error) {
      console.error("❌ moveTask: Firestore update failed, reverting optimistic update:", error);
      
      // Revert optimistic update on error
      set({ tasks: currentState.tasks });
      
      const errorMessage = error instanceof Error ? error.message : "Failed to move task";
      set({ error: errorMessage });
      throw error;
    }
  },

  /**
   * Set Tasks
   * Directly sets the tasks array (used by real-time updates)
   * 
   * @param tasks - Array of tasks to set
   */
  setTasks: (tasks) => {
    console.log("📋 setTasks: Setting tasks in store:", tasks.length, "tasks");
    set({ tasks });
  },

  /**
   * Set Loading State
   * Updates the loading state
   * 
   * @param isLoading - Loading state
   */
  setLoading: (isLoading) => {
    console.log("⏳ setLoading:", isLoading);
    set({ isLoading });
  },

  /**
   * Set Error State
   * Updates the error state
   * 
   * @param error - Error message or null
   */
  setError: (error) => {
    console.log("❌ setError:", error);
    set({ error });
  },

  /**
   * Reset Store
   * Resets all state to initial values (used when user logs out)
   */
  reset: () => {
    console.log("🔄 reset: Resetting task store");
    
    // Clean up real-time subscription if it exists
    const { realtimeUnsubscribe } = get();
    if (realtimeUnsubscribe) {
      realtimeUnsubscribe();
    }
    
    set({
      tasks: [],
      isLoading: false,
      error: null,
      isInitialized: false,
      realtimeUnsubscribe: null,
    });
  },

  /**
   * Setup Real-time Synchronization
   * Establishes a real-time listener for task updates
   * 
   * @param userId - User ID to listen for tasks
   */
  setupRealtimeSync: (userId) => {
    console.log("🔄 setupRealtimeSync: Setting up real-time task synchronization for user:", userId);
    
    // Clean up existing subscription if any
    const { realtimeUnsubscribe } = get();
    if (realtimeUnsubscribe) {
      realtimeUnsubscribe();
    }

    // Set up new real-time listener
    const unsubscribe = subscribeToUserTasks(userId, (tasks) => {
      console.log("🔄 Real-time update received:", tasks.length, "tasks");
      set({ tasks, isInitialized: true });
    });

    // Store the unsubscribe function
    set({ realtimeUnsubscribe: unsubscribe });
    console.log("✅ Real-time synchronization established");
  },

  /**
   * Cleanup Real-time Synchronization
   * Removes the real-time listener
   */
  cleanupRealtimeSync: () => {
    console.log("🧹 cleanupRealtimeSync: Cleaning up real-time synchronization");
    
    const { realtimeUnsubscribe } = get();
    if (realtimeUnsubscribe) {
      realtimeUnsubscribe();
      set({ realtimeUnsubscribe: null });
      console.log("✅ Real-time synchronization cleaned up");
    }
  },
}));