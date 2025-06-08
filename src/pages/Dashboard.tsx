import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import {
  Plus,
  Clock,
  Sparkles,
  Calendar,
  Layout,
  BarChart,
  Mic,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from 'react-toastify';

import { useTaskStore } from "../store/taskStore";
import { useAuthStore } from "../store/authStore";
import { useAISuggestionStore } from "../store/aiSuggestionStore";
import { Task } from "../types";

import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import TaskForm from "../components/tasks/TaskForm";
import AISuggestionList from "../components/ai/AISuggestionList";
import DraggableTaskList from "../components/dashboard/DraggableTaskList";
import DateUpdateModal from "../components/dashboard/DateUpdateModal";
import AudioRecorder from "../components/audio/AudioRecorder";

const Dashboard: React.FC = () => {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    fetchTasks,
    isInitialized,
    isLoading,
  } = useTaskStore();
  const { isAuthenticated, isAuthInitialized } = useAuthStore();
  const {
    suggestions,
    generateSuggestions,
    applySuggestion,
    dismissSuggestion,
    isLoading: suggestionsLoading,
  } = useAISuggestionStore();
  const { t } = useTranslation(["dashboard", "common"]);

  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isDragDisabled, setIsDragDisabled] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  
  // Modal state for date updates
  const [dateUpdateModal, setDateUpdateModal] = useState({
    isOpen: false,
    task: null as Task | null,
    isMovingToUpcoming: false,
    pendingUpdate: null as { taskId: string; targetList: string } | null
  });

  // Fetch tasks when component mounts and user is authenticated
  useEffect(() => {
    console.log("🚀 Dashboard: Component mounted, checking auth state...");
    console.log("🔐 Auth state:", {
      isAuthenticated,
      isAuthInitialized,
      isInitialized,
    });

    if (isAuthInitialized && isAuthenticated && !isInitialized) {
      console.log(
        "✅ User authenticated and tasks not initialized, fetching tasks..."
      );
      fetchTasks();
    } else if (!isAuthenticated) {
      console.log("❌ User not authenticated, skipping task fetch");
    } else if (isInitialized) {
      console.log("✅ Tasks already initialized");
    }
  }, [isAuthenticated, isAuthInitialized, isInitialized, fetchTasks]);

  // Filter tasks
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  
  const todayTasks = tasks.filter(
    (task) =>
      task.status !== "completed" &&
      (task.dueDate ? new Date(task.dueDate) <= today : true)
  );

  const upcomingTasks = tasks.filter(
    (task) =>
      task.status !== "completed" &&
      (task.dueDate ? new Date(task.dueDate) > today : false)
  );

  const completedTasks = tasks
    .filter((task) => task.status === "completed")
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 5);

  // Get task being edited
  const editingTask = editingTaskId
    ? tasks.find((task) => task.id === editingTaskId)
    : undefined;

  // Generate AI suggestions
  useEffect(() => {
    if (tasks.length > 0) {
      generateSuggestions(tasks);
    }
  }, [tasks.length]);

  const handleAddTask = async (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "userId">
  ) => {
    try {
      await addTask(taskData);
      setShowAddTask(false);
      toast.success('Task created successfully!');
    } catch (error) {
      console.error("Failed to add task:", error);
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = async (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "userId">
  ) => {
    if (editingTaskId) {
      try {
        await updateTask(editingTaskId, taskData);
        setEditingTaskId(null);
        toast.success('Task updated successfully!');
      } catch (error) {
        console.error("Failed to update task:", error);
        toast.error('Failed to update task');
      }
    }
  };

  const handleEditTask = (taskId: string) => {
    setEditingTaskId(taskId);
    setShowAddTask(false);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
  };

  const handleDragEnd = async (result: DropResult) => {
    console.log('🎯 Dashboard drag end:', result);
    
    const { source, destination, draggableId } = result;
    
    // Drop outside valid drop zone
    if (!destination) {
      console.log('❌ No destination - drag cancelled');
      return;
    }
    
    // Drop in same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      console.log('❌ Same position - no change needed');
      return;
    }

    const draggedTask = tasks.find(task => task.id === draggableId);
    if (!draggedTask) {
      console.error('❌ Task not found:', draggableId);
      return;
    }

    console.log('🔄 Task movement:', {
      task: draggedTask.title,
      from: source.droppableId,
      to: destination.droppableId
    });

    // Handle movement between today and upcoming
    if (source.droppableId !== destination.droppableId) {
      if (destination.droppableId === 'upcoming-tasks') {
        // Moving from today to upcoming - show modal for date selection
        setDateUpdateModal({
          isOpen: true,
          task: draggedTask,
          isMovingToUpcoming: true,
          pendingUpdate: { taskId: draggableId, targetList: 'upcoming' }
        });
      } else if (destination.droppableId === 'today-tasks') {
        // Moving from upcoming to today - auto-set to today
        const todayDate = format(new Date(), 'yyyy-MM-dd');
        setIsDragDisabled(true);
        
        try {
          await updateTask(draggableId, { dueDate: todayDate });
          toast.success('Task moved to today!');
        } catch (error) {
          console.error('Failed to move task:', error);
          toast.error('Failed to move task');
        } finally {
          setIsDragDisabled(false);
        }
      }
    }
  };

  const handleDateUpdateConfirm = async (newDueDate: string) => {
    const { pendingUpdate } = dateUpdateModal;
    
    if (!pendingUpdate) return;

    setIsDragDisabled(true);
    
    try {
      await updateTask(pendingUpdate.taskId, { dueDate: newDueDate });
      toast.success('Task date updated successfully!');
    } catch (error) {
      console.error('Failed to update task date:', error);
      toast.error('Failed to update task date');
    } finally {
      setIsDragDisabled(false);
      setDateUpdateModal({
        isOpen: false,
        task: null,
        isMovingToUpcoming: false,
        pendingUpdate: null
      });
    }
  };

  const handleDateUpdateCancel = () => {
    setDateUpdateModal({
      isOpen: false,
      task: null,
      isMovingToUpcoming: false,
      pendingUpdate: null
    });
  };

  const handleAudioTranscription = async (transcribedText: string) => {
    try {
      // Create a task from the transcribed text
      const taskData = {
        title: transcribedText,
        description: '',
        dueDate: format(new Date(), 'yyyy-MM-dd'), // Set to today by default
        priority: 'medium' as const,
        status: 'pending' as const,
        category: '',
        estimatedTime: undefined,
        actualTime: undefined,
      };

      await addTask(taskData);
      toast.success('Task created from voice recording!');
    } catch (error) {
      console.error('Failed to create task from audio:', error);
      toast.error('Failed to create task from audio');
    }
  };

  // Task metrics
  const totalTasks = tasks.length;
  const completedTasksCount = tasks.filter(
    (task) => task.status === "completed"
  ).length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;
  const highPriorityCount = tasks.filter(
    (task) => task.priority === "high" && task.status !== "completed"
  ).length;

  // Show loading state while auth is being initialized or tasks are being fetched initially
  if (!isAuthInitialized || (!isInitialized && isLoading)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              Loading dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show auth required message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            Please log in to view your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button
            variant="secondary"
            leftIcon={<Mic size={18} />}
            onClick={() => setShowAudioRecorder(true)}
          >
            Voice to Task
          </Button>
          <Button
            variant={showAddTask ? "ghost" : "primary"}
            leftIcon={showAddTask ? <Clock size={18} /> : <Plus size={18} />}
            onClick={() => {
              setShowAddTask(!showAddTask);
              setEditingTaskId(null);
            }}
          >
            {showAddTask
              ? t("common:actions.cancel")
              : t("common:actions.create")}
          </Button>
        </div>
      </div>

      {/* Task Form */}
      {showAddTask && (
        <div className="mb-8">
          <TaskForm
            onSubmit={handleAddTask}
            onCancel={() => setShowAddTask(false)}
          />
        </div>
      )}

      {editingTaskId && (
        <div className="mb-8">
          <TaskForm
            initialTask={editingTask}
            onSubmit={handleUpdateTask}
            onCancel={handleCancelEdit}
          />
        </div>
      )}

      {/* Drag disabled indicator */}
      {isDragDisabled && (
        <div className="mb-4 p-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-md text-sm text-center">
          ⏳ Drag and drop temporarily disabled during operations...
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400">
                  <BarChart size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("metrics.completionRate.title")}
                  </p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {completionRate}%
                    </p>
                    <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      ({completedTasksCount}/{totalTasks}{" "}
                      {t("metrics.completionRate.tasks")})
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-warning-100 dark:bg-warning-900 text-warning-600 dark:text-warning-400">
                  <Clock size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("metrics.todayTasks.title")}
                  </p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {todayTasks.length}
                    </p>
                    <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      {t("metrics.todayTasks.remaining")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-error-100 dark:bg-error-900 text-error-600 dark:text-error-400">
                  <Layout size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("metrics.highPriority.title")}
                  </p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {highPriorityCount}
                    </p>
                    <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      {t("metrics.highPriority.attention")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content with Drag and Drop */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Tasks */}
          <Card className="lg:col-span-1 h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-gray-500" />
                {t("sections.todayTasks.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(600px-60px)] p-4">
              <DraggableTaskList
                tasks={todayTasks}
                title=""
                emptyMessage={t("sections.todayTasks.empty")}
                droppableId="today-tasks"
                onEdit={handleEditTask}
                onDelete={deleteTask}
                onComplete={completeTask}
                isDragDisabled={isDragDisabled}
              />
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card className="lg:col-span-1 h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-gray-500" />
                {t("sections.upcomingTasks.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(600px-60px)] p-4">
              <DraggableTaskList
                tasks={upcomingTasks}
                title=""
                emptyMessage={t("sections.upcomingTasks.empty")}
                droppableId="upcoming-tasks"
                onEdit={handleEditTask}
                onDelete={deleteTask}
                onComplete={completeTask}
                isDragDisabled={isDragDisabled}
              />
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card className="lg:col-span-1 h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-primary-500" />
                {t("sections.aiInsights.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(600px-60px)]">
              <AISuggestionList
                suggestions={suggestions}
                isLoading={suggestionsLoading}
                onApply={applySuggestion}
                onDismiss={dismissSuggestion}
              />
            </CardContent>
          </Card>
        </div>
      </DragDropContext>

      {/* Date Update Modal */}
      <DateUpdateModal
        isOpen={dateUpdateModal.isOpen}
        onClose={handleDateUpdateCancel}
        task={dateUpdateModal.task}
        onConfirm={handleDateUpdateConfirm}
        isMovingToUpcoming={dateUpdateModal.isMovingToUpcoming}
      />

      {/* Audio Recorder Modal */}
      <AudioRecorder
        isOpen={showAudioRecorder}
        onClose={() => setShowAudioRecorder(false)}
        onTranscriptionComplete={handleAudioTranscription}
      />
    </div>
  );
};

export default Dashboard;