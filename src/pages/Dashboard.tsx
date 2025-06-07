import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Plus, Clock, Sparkles, Calendar, Layout, BarChart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import { useAISuggestionStore } from '../store/aiSuggestionStore';
import { Task } from '../types';

import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';
import AISuggestionList from '../components/ai/AISuggestionList';

const Dashboard: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, completeTask, fetchTasks, isInitialized, isLoading } = useTaskStore();
  const { isAuthenticated } = useAuthStore();
  const { 
    suggestions, 
    generateSuggestions, 
    applySuggestion, 
    dismissSuggestion,
    isLoading: suggestionsLoading 
  } = useAISuggestionStore();
  const { t } = useTranslation(['dashboard', 'common']);
  
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  
  // Fetch tasks when component mounts and user is authenticated
  useEffect(() => {
    console.log('🚀 Dashboard: Component mounted, checking auth state...');
    console.log('🔐 Auth state:', { isAuthenticated, isInitialized });
    
    if (isAuthenticated && !isInitialized) {
      console.log('✅ User authenticated and tasks not initialized, fetching tasks...');
      fetchTasks();
    } else if (!isAuthenticated) {
      console.log('❌ User not authenticated, skipping task fetch');
    } else if (isInitialized) {
      console.log('✅ Tasks already initialized');
    }
  }, [isAuthenticated, isInitialized, fetchTasks]);
  
  // Filter tasks
  const today = new Date().setHours(0, 0, 0, 0);
  const todayTasks = tasks.filter(task => 
    task.status !== 'completed' && 
    (task.dueDate ? new Date(task.dueDate).setHours(0, 0, 0, 0) <= today : true)
  );
  
  const upcomingTasks = tasks.filter(task => 
    task.status !== 'completed' && 
    (task.dueDate ? new Date(task.dueDate).setHours(0, 0, 0, 0) > today : false)
  );
  
  const completedTasks = tasks.filter(task => task.status === 'completed')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
  
  // Get task being edited
  const editingTask = editingTaskId ? tasks.find(task => task.id === editingTaskId) : undefined;
  
  // Generate AI suggestions
  useEffect(() => {
    if (tasks.length > 0) {
      generateSuggestions(tasks);
    }
  }, [tasks.length]);
  
  const handleAddTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    try {
      await addTask(taskData);
      setShowAddTask(false);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };
  
  const handleUpdateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (editingTaskId) {
      try {
        await updateTask(editingTaskId, taskData);
        setEditingTaskId(null);
      } catch (error) {
        console.error('Failed to update task:', error);
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
  
  // Task metrics
  const totalTasks = tasks.length;
  const completedTasksCount = tasks.filter(task => task.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;
  const highPriorityCount = tasks.filter(task => task.priority === 'high' && task.status !== 'completed').length;
  
  // Show loading state while tasks are being fetched initially
  if (!isInitialized && isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
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
          <p className="text-gray-500 dark:text-gray-400">Please log in to view your dashboard.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button
            variant={showAddTask ? 'ghost' : 'primary'}
            leftIcon={showAddTask ? <Clock size={18} /> : <Plus size={18} />}
            onClick={() => {
              setShowAddTask(!showAddTask);
              setEditingTaskId(null);
            }}
          >
            {showAddTask ? t('common:actions.cancel') : t('common:actions.create')}
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
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('metrics.completionRate.title')}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{completionRate}%</p>
                    <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      ({completedTasksCount}/{totalTasks} {t('metrics.completionRate.tasks')})
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
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('metrics.todayTasks.title')}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{todayTasks.length}</p>
                    <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      {t('metrics.todayTasks.remaining')}
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
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('metrics.highPriority.title')}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{highPriorityCount}</p>
                    <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      {t('metrics.highPriority.attention')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Tasks */}
        <Card className="lg:col-span-1 h-[600px]">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-gray-500" />
              {t('sections.todayTasks.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(600px-60px)]">
            <TaskList
              tasks={todayTasks}
              title=""
              emptyMessage={t('sections.todayTasks.empty')}
              onEdit={handleEditTask}
              onDelete={deleteTask}
              onComplete={completeTask}
            />
          </CardContent>
        </Card>
        
        {/* Upcoming Tasks */}
        <Card className="lg:col-span-1 h-[600px]">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-gray-500" />
              {t('sections.upcomingTasks.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(600px-60px)]">
            <TaskList
              tasks={upcomingTasks}
              title=""
              emptyMessage={t('sections.upcomingTasks.empty')}
              onEdit={handleEditTask}
              onDelete={deleteTask}
              onComplete={completeTask}
            />
          </CardContent>
        </Card>
        
        {/* AI Suggestions */}
        <Card className="lg:col-span-1 h-[600px]">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-primary-500" />
              {t('sections.aiInsights.title')}
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
    </div>
  );
};

export default Dashboard;