/**
 * Firestore Database Operations
 *
 * This file contains all database operations for the TaskMind application.
 * It provides a clean interface for CRUD operations on users, tasks, and categories.
 *
 * Collections Structure:
 * - users: User profiles and preferences
 * - tasks: Individual tasks belonging to users
 * - categories: Task categories created by users
 *
 * All operations include proper error handling and type safety.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  writeBatch,
  DocumentReference,
  QuerySnapshot,
  DocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import { Task, User, UserPreferences } from "../types";

/**
 * Collection References
 * These are references to the main collections in our Firestore database
 */
export const collections = {
  users: collection(db, "users"),
  tasks: collection(db, "tasks"),
  categories: collection(db, "categories"),
} as const;

/**
 * User Operations
 * Functions for managing user data in Firestore
 */

/**
 * Creates a new user document in Firestore
 * Called after successful Firebase Auth registration
 *
 * @param userId - The Firebase Auth user ID
 * @param userData - User profile data
 * @returns Promise<void>
 */
export const createUser = async (
  userId: string,
  userData: {
    name: string;
    email: string;
    preferences?: Partial<UserPreferences>;
  }
): Promise<void> => {
  console.log("👤 Creating user document for:", userId);

  try {
    // Default user preferences
    const defaultPreferences: UserPreferences = {
      workHours: { start: "09:00", end: "17:00" },
      workDays: [1, 2, 3, 4, 5], // Monday to Friday
      focusTime: 45, // 45 minutes
      breakTime: 15, // 15 minutes
      theme: "system",
      notifications: true,
    };

    // Create user document with provided data and defaults
    const userDoc = {
      name: userData.name,
      email: userData.email,
      preferences: { ...defaultPreferences, ...userData.preferences },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Use the Firebase Auth user ID as the document ID
    await updateDoc(doc(collections.users, userId), userDoc);

    console.log("✅ User document created successfully");
  } catch (error) {
    console.error("❌ Error creating user document:", error);
    throw new Error("Failed to create user profile");
  }
};

/**
 * Retrieves a user document from Firestore
 *
 * @param userId - The Firebase Auth user ID
 * @returns Promise<User | null> - User data or null if not found
 */
export const getUser = async (userId: string): Promise<User | null> => {
  console.log("👤 Fetching user document for:", userId);

  try {
    const userDoc = await getDoc(doc(collections.users, userId));

    if (!userDoc.exists()) {
      console.log("❌ User document not found");
      return null;
    }

    const userData = userDoc.data();

    // Convert Firestore Timestamps to ISO strings
    const user: User = {
      id: userDoc.id,
      name: userData.name,
      email: userData.email,
      preferences: userData.preferences,
      createdAt: userData.createdAt.toDate().toISOString(),
      updatedAt: userData.updatedAt.toDate().toISOString(),
    };

    console.log("✅ User document retrieved successfully");
    return user;
  } catch (error) {
    console.error("❌ Error fetching user document:", error);
    throw new Error("Failed to fetch user profile");
  }
};

/**
 * Updates a user document in Firestore
 *
 * @param userId - The Firebase Auth user ID
 * @param updates - Partial user data to update
 * @returns Promise<void>
 */
export const updateUser = async (
  userId: string,
  updates: Partial<User>
): Promise<void> => {
  console.log("👤 Updating user document for:", userId);

  try {
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(doc(collections.users, userId), updateData);

    console.log("✅ User document updated successfully");
  } catch (error) {
    console.error("❌ Error updating user document:", error);
    throw new Error("Failed to update user profile");
  }
};

/**
 * Task Operations
 * Functions for managing tasks in Firestore
 */

/**
 * Creates a new task document in Firestore
 *
 * @param userId - The Firebase Auth user ID
 * @param taskData - Task data without ID and timestamps
 * @returns Promise<string> - The created task ID
 */
export const createTask = async (
  userId: string,
  taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "userId">
): Promise<string> => {
  console.log("📝 Creating task for user:", userId);

  try {
    // Prepare task document with timestamps and user ID
    const taskDoc = {
      ...taskData,
      userId,
      dueDate: taskData.dueDate
        ? Timestamp.fromDate(new Date(taskData.dueDate))
        : null,
      actualTime: taskData.actualTime || 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    console.log("📄 Task document:", taskDoc);

    // Add document to tasks collection
    const docRef = await addDoc(collections.tasks, taskDoc);

    console.log("✅ Task created with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error creating task:", error);
    throw new Error("Failed to create task");
  }
};

/**
 * Retrieves all tasks for a specific user
 *
 * @param userId - The Firebase Auth user ID
 * @returns Promise<Task[]> - Array of user's tasks
 */
export const getUserTasks = async (userId: string): Promise<Task[]> => {
  console.log("📋 Fetching tasks for user:", userId);

  try {
    // Query tasks collection for user's tasks, ordered by creation date
    const q = query(
      collections.tasks,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    // Convert Firestore documents to Task objects
    const tasks: Task[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description || "",
        dueDate: data.dueDate ? data.dueDate.toDate().toISOString() : null,
        priority: data.priority,
        status: data.status,
        category: data.category || "",
        estimatedTime: data.estimatedTime,
        actualTime: data.actualTime,
        userId: data.userId,
        createdAt: data.createdAt.toDate().toISOString(),
        updatedAt: data.updatedAt.toDate().toISOString(),
      };
    });

    console.log(`✅ Retrieved ${tasks.length} tasks for user`);
    return tasks;
  } catch (error) {
    console.error("❌ Error fetching tasks:", error);
    throw new Error("Failed to fetch tasks");
  }
};

/**
 * Updates a task document in Firestore
 *
 * @param taskId - The task document ID
 * @param updates - Partial task data to update
 * @returns Promise<void>
 */
export const updateTask = async (
  taskId: string,
  updates: Partial<Task>
): Promise<void> => {
  console.log("📝 Updating task:", taskId);

  try {
    // Prepare update data with timestamp conversion
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    // Convert dueDate to Timestamp if provided
    if (updates.dueDate !== undefined) {
      updateData.dueDate = updates.dueDate
        ? Timestamp.fromDate(new Date(updates.dueDate))
        : null;
    }

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.userId;

    await updateDoc(doc(collections.tasks, taskId), updateData);

    console.log("✅ Task updated successfully");
  } catch (error) {
    console.error("❌ Error updating task:", error);
    throw new Error("Failed to update task");
  }
};

/**
 * Deletes a task document from Firestore
 *
 * @param taskId - The task document ID
 * @returns Promise<void>
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  console.log("🗑️ Deleting task:", taskId);

  try {
    await deleteDoc(doc(collections.tasks, taskId));

    console.log("✅ Task deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting task:", error);
    throw new Error("Failed to delete task");
  }
};

/**
 * Real-time listener for user's tasks
 * Sets up a real-time listener that updates when tasks change
 *
 * @param userId - The Firebase Auth user ID
 * @param callback - Function called when tasks change
 * @returns Function to unsubscribe from the listener
 */
export const subscribeToUserTasks = (
  userId: string,
  callback: (tasks: Task[]) => void
): (() => void) => {
  console.log("🔄 Setting up real-time listener for user tasks:", userId);

  // Create query for user's tasks
  const q = query(
    collections.tasks,
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  // Set up real-time listener
  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      console.log("🔄 Tasks updated, processing changes...");

      // Convert documents to Task objects
      const tasks: Task[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description || "",
          dueDate: data.dueDate ? data.dueDate.toDate().toISOString() : null,
          priority: data.priority,
          status: data.status,
          category: data.category || "",
          estimatedTime: data.estimatedTime,
          actualTime: data.actualTime,
          userId: data.userId,
          createdAt: data.createdAt.toDate().toISOString(),
          updatedAt: data.updatedAt.toDate().toISOString(),
        };
      });

      console.log(`✅ Real-time update: ${tasks.length} tasks`);
      callback(tasks);
    },
    (error) => {
      console.error("❌ Error in real-time listener:", error);
    }
  );

  return unsubscribe;
};

/**
 * Category Operations
 * Functions for managing task categories in Firestore
 */

/**
 * Creates a new category for a user
 *
 * @param userId - The Firebase Auth user ID
 * @param categoryData - Category name and color
 * @returns Promise<string> - The created category ID
 */
export const createCategory = async (
  userId: string,
  categoryData: { name: string; color?: string }
): Promise<string> => {
  console.log("🏷️ Creating category for user:", userId);

  try {
    const categoryDoc = {
      name: categoryData.name,
      color: categoryData.color || "#4F46E5",
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collections.categories, categoryDoc);

    console.log("✅ Category created with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error creating category:", error);
    throw new Error("Failed to create category");
  }
};

/**
 * Retrieves all categories for a specific user
 *
 * @param userId - The Firebase Auth user ID
 * @returns Promise<Array> - Array of user's categories
 */
export const getUserCategories = async (
  userId: string
): Promise<
  Array<{
    id: string;
    name: string;
    color: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  }>
> => {
  console.log("🏷️ Fetching categories for user:", userId);

  try {
    const q = query(
      collections.categories,
      where("userId", "==", userId),
      orderBy("name", "asc")
    );

    const querySnapshot = await getDocs(q);

    const categories = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        color: data.color,
        userId: data.userId,
        createdAt: data.createdAt.toDate().toISOString(),
        updatedAt: data.updatedAt.toDate().toISOString(),
      };
    });

    console.log(`✅ Retrieved ${categories.length} categories for user`);
    return categories;
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
};

/**
 * Batch Operations
 * Functions for performing multiple operations atomically
 */

/**
 * Deletes a user and all their associated data
 * This is a batch operation that ensures data consistency
 *
 * @param userId - The Firebase Auth user ID
 * @returns Promise<void>
 */
export const deleteUserData = async (userId: string): Promise<void> => {
  console.log("🗑️ Deleting all data for user:", userId);

  try {
    const batch = writeBatch(db);

    // Get all user's tasks
    const tasksQuery = query(collections.tasks, where("userId", "==", userId));
    const tasksSnapshot = await getDocs(tasksQuery);

    // Get all user's categories
    const categoriesQuery = query(
      collections.categories,
      where("userId", "==", userId)
    );
    const categoriesSnapshot = await getDocs(categoriesQuery);

    // Add task deletions to batch
    tasksSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Add category deletions to batch
    categoriesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Add user document deletion to batch
    batch.delete(doc(collections.users, userId));

    // Execute all deletions atomically
    await batch.commit();

    console.log("✅ All user data deleted successfully");
  } catch (error) {
    console.error("❌ Error deleting user data:", error);
    throw new Error("Failed to delete user data");
  }
};

/**
 * Utility Functions
 * Helper functions for common operations
 */

/**
 * Checks if a document exists in Firestore
 *
 * @param docRef - Document reference
 * @returns Promise<boolean> - Whether the document exists
 */
export const documentExists = async (
  docRef: DocumentReference
): Promise<boolean> => {
  try {
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error("❌ Error checking document existence:", error);
    return false;
  }
};

/**
 * Converts Firestore Timestamp to ISO string
 *
 * @param timestamp - Firestore Timestamp
 * @returns string - ISO date string
 */
export const timestampToISOString = (timestamp: Timestamp): string => {
  return timestamp.toDate().toISOString();
};

/**
 * Converts ISO string to Firestore Timestamp
 *
 * @param isoString - ISO date string
 * @returns Timestamp - Firestore Timestamp
 */
export const isoStringToTimestamp = (isoString: string): Timestamp => {
  return Timestamp.fromDate(new Date(isoString));
};
