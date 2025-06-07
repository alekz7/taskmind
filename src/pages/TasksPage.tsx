import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { PlusCircle, CircleDot, CheckCircle, Clock, Search, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import { Task } from '../types';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';

const TasksPage: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, completeTask, moveTask, fetchTasks, isLoading, isInitialized } = useTaskStore();
  const { isAuthenticated } = useAuthStore();
  const { t } = useTranslation(['tasks', 'common']);
  
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [isDragDisabled, setIsDragDisabled] = useState(true);
  
  // Fetch tasks when component mounts and user is authenticated
  useEffect(() => {
    console.log('🚀 TasksPage: Component mounted, checking auth state...');
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
  
  // Enable drag only after tasks are loaded and ready
  useEffect(() => {
    const shouldEnableDrag = isInitialized && !isLoading && tasks.length > 0;
    console.log('🎯 Drag state check:', {
      isInitialized,
      isLoading,
      tasksCount: tasks.length,
      shouldEnableDrag,
      currentlyDisabled: isDragDisabled
    });
    
    if (shouldEnableDrag && isDragDisabled) {
      console.log('✅ Enabling drag and drop');
      setIsDragDisabled(false);
    } else if (!shouldEnableDrag && !isDragDisabled) {
      console.log('⏳ Disabling drag and drop');
      setIsDragDisabled(true);
    }
  }, [isInitialized, isLoading, tasks.length, isDragDisabled]);
  
  // Get task being edited
  const editingTask = editingTaskId ? tasks.find(task => task.id === editingTaskId) : undefined;
  
  // Filter and group tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    return matchesSearch && matchesPriority;
  });
  
  const pendingTasks = filteredTasks.filter(task => task.status === 'pending');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in-progress');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');
  
  // Debug logging for task distribution
  useEffect(() => {
    console.log('🔍 TASK DISTRIBUTION UPDATE:');
    console.log('📋 Total tasks in store:', tasks.length);
    console.log('🔎 Filtered tasks:', filteredTasks.length);
    console.log('📊 Distribution:', {
      pending: pendingTasks.length,
      inProgress: inProgressTasks.length,
      completed: completedTasks.length
    });
    console.log('📝 All task IDs in store:', tasks.map(t => t.id));
    console.log('🎯 Drag disabled:', isDragDisabled);
    console.log('🔄 Store state:', { isLoading, isInitialized });
  }, [tasks, filteredTasks, pendingTasks, inProgressTasks, completedTasks, isDragDisabled, isLoading, isInitialized]);
  
  const handleAddTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    console.log('➕ TasksPage: Adding new task:', taskData);
    setIsDragDisabled(true);
    try {
      await addTask(taskData);
      setShowAddTask(false);
    } finally {
      // Re-enable drag after a short delay
      setTimeout(() => setIsDragDisabled(false), 500);
    }
  };
  
  const handleUpdateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (editingTaskId) {
      console.log('📝 TasksPage: Updating task:', editingTaskId, taskData);
      setIsDragDisabled(true);
      try {
        await updateTask(editingTaskId, taskData);
        setEditingTaskId(null);
      } finally {
        setTimeout(() => setIsDragDisabled(false), 500);
      }
    }
  };
  
  const handleEditTask = (taskId: string) => {
    console.log('✏️ TasksPage: Editing task:', taskId);
    setEditingTaskId(taskId);
    setShowAddTask(false);
  };
  
  const handleCancelEdit = () => {
    console.log('❌ TasksPage: Cancelling edit');
    setEditingTaskId(null);
  };
  
  const handleDragStart = (start: any) => {
    console.log('🎯 ========== DRAG START ==========');
    console.log('🎯 Drag started for task:', start.draggableId);
    
    // Verify the task exists
    const task = tasks.find(t => t.id === start.draggableId);
    if (!task) {
      console.error('❌ CRITICAL: Task not found at drag start!', {
        draggableId: start.draggableId,
        availableIds: tasks.map(t => t.id),
        totalTasks: tasks.length
      });
    } else {
      console.log('✅ Task found:', { id: task.id, title: task.title, status: task.status });
    }
  };
  
  const handleDragEnd = async (result: DropResult) => {
    console.log('🎯 ========== DRAG END TRIGGERED ==========');
    console.log('🎯 Full drag result:', JSON.stringify(result, null, 2));
    
    const { source, destination, draggableId } = result;
    
    // Verify task still exists
    const draggedTask = tasks.find(task => task.id === draggableId);
    console.log('🎯 Dragged task verification:', draggedTask ? {
      id: draggedTask.id,
      title: draggedTask.title,
      currentStatus: draggedTask.status
    } : 'TASK NOT FOUND!');
    
    if (!draggedTask) {
      console.error('❌ CRITICAL: Task disappeared during drag!', {
        draggableId,
        availableIds: tasks.map(t => t.id),
        totalTasks: tasks.length
      });
      return;
    }
    
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
    
    // Map droppableId to task status
    const statusMap: Record<string, Task['status']> = {
      'pending': 'pending',
      'in-progress': 'in-progress',
      'completed': 'completed',
    };
    
    const newStatus = statusMap[destination.droppableId];
    const oldStatus = statusMap[source.droppableId];
    
    console.log('🔄 Status change details:', {
      taskId: draggableId,
      taskTitle: draggedTask.title,
      from: {
        droppableId: source.droppableId,
        status: oldStatus,
        index: source.index
      },
      to: {
        droppableId: destination.droppableId,
        status: newStatus,
        index: destination.index
      }
    });
    
    if (!newStatus) {
      console.error('❌ Invalid destination status:', destination.droppableId);
      return;
    }
    
    if (draggedTask.status === newStatus) {
      console.log('⚠️ Task already in target status, no change needed');
      return;
    }
    
    console.log(`🚀 EXECUTING MOVE: Task "${draggedTask.title}" from ${draggedTask.status} to ${newStatus}`);
    
    // Disable drag during the operation
    setIsDragDisabled(true);
    
    try {
      // Call moveTask and wait for completion
      await moveTask(draggableId, newStatus);
      
      console.log('✅ ========== DRAG OPERATION COMPLETED SUCCESSFULLY ==========');
      console.log(`✅ Task "${draggedTask.title}" successfully moved to ${newStatus}`);
      
    } catch (error) {
      console.error('❌ ========== DRAG OPERATION FAILED ==========');
      console.error(`❌ Failed to move task "${draggedTask.title}":`, error);
    } finally {
      // Re-enable drag after operation
      setTimeout(() => {
        setIsDragDisabled(false);
        console.log('🔄 Drag re-enabled after operation');
      }, 500);
    }
  };
  
  // Show loading state while tasks are being fetched initially
  if (!isInitialized && isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading tasks...</p>
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
          <p className="text-gray-500 dark:text-gray-400">Please log in to view your tasks.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">{t('subtitle')}</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button
            variant="primary"
            leftIcon={<PlusCircle size={18} />}
            onClick={() => {
              setShowAddTask(true);
              setEditingTaskId(null);
            }}
          >
            {t('newTask')}
          </Button>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <Input
            placeholder={t('filters.search.placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={18} />}
            fullWidth
          />
        </div>
        
        <div className="md:col-span-2">
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('filters.priority.title')}</span>
            
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant={filterPriority === 'all' ? 'primary' : 'ghost'}
                onClick={() => setFilterPriority('all')}
              >
                {t('filters.priority.all')}
              </Button>
              
              <Button
                size="sm"
                variant={filterPriority === 'high' ? 'danger' : 'ghost'}
                onClick={() => setFilterPriority('high')}
              >
                {t('common:priority.high')}
              </Button>
              
              <Button
                size="sm"
                variant={filterPriority === 'medium' ? 'warning' : 'ghost'}
                onClick={() => setFilterPriority('medium')}
              >
                {t('common:priority.medium')}
              </Button>
              
              <Button
                size="sm"
                variant={filterPriority === 'low' ? 'success' : 'ghost'}
                onClick={() => setFilterPriority('low')}
              >
                {t('common:priority.low')}
              </Button>
            </div>
          </div>
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
      {isDragDisabled && tasks.length > 0 && (
        <div className="mb-4 p-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-md text-sm text-center">
          ⏳ Drag and drop temporarily disabled during operations...
        </div>
      )}
      
      {/* Empty state */}
      {isInitialized && tasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No tasks found. Create your first task to get started!</p>
        </div>
      )}
      
      {/* Task Columns - Only render if we have tasks */}
      {tasks.length > 0 && (
        <DragDropContext 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Pending Tasks */}
            <div>
              <Card>
                <CardHeader className="bg-gray-50 dark:bg-gray-800">
                  <CardTitle className="flex items-center">
                    <CircleDot className="mr-2 h-5 w-5 text-gray-500" />
                    {t('columns.todo.title')} <span className="ml-2 text-sm text-gray-500">({pendingTasks.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <Droppable droppableId="pending" isDropDisabled={isDragDisabled}>
                    {(provided, snapshot) => {
                      console.log('🔄 Rendering Droppable: pending, isDraggingOver:', snapshot.isDraggingOver, 'disabled:', isDragDisabled);
                      return (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`min-h-[200px] transition-colors duration-300 rounded-lg ${
                            snapshot.isDraggingOver ? 'bg-gray-50 dark:bg-gray-800' : ''
                          } ${isDragDisabled ? 'opacity-50' : ''}`}
                        >
                          {pendingTasks.length === 0 ? (
                            <div className="text-center p-4 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                              {t('columns.todo.empty')}
                            </div>
                          ) : (
                            pendingTasks.map((task, index) => {
                              console.log(`🎯 Rendering pending task ${index}:`, { id: task.id, title: task.title });
                              return (
                                <Draggable 
                                  key={task.id} 
                                  draggableId={task.id} 
                                  index={index}
                                  isDragDisabled={isDragDisabled}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={{
                                        ...provided.draggableProps.style,
                                        opacity: snapshot.isDragging ? 0.8 : 1,
                                        transform: snapshot.isDragging
                                          ? `${provided.draggableProps.style?.transform} scale(1.02)`
                                          : provided.draggableProps.style?.transform,
                                      }}
                                    >
                                      <TaskCard
                                        task={task}
                                        onEdit={handleEditTask}
                                        onDelete={deleteTask}
                                        onComplete={completeTask}
                                        isDraggable={!isDragDisabled}
                                      />
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })
                          )}
                          {provided.placeholder}
                        </div>
                      );
                    }}
                  </Droppable>
                </CardContent>
              </Card>
            </div>
            
            {/* In Progress Tasks */}
            <div>
              <Card>
                <CardHeader className="bg-primary-50 dark:bg-primary-900">
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-primary-500" />
                    {t('columns.inProgress.title')} <span className="ml-2 text-sm text-gray-500">({inProgressTasks.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <Droppable droppableId="in-progress" isDropDisabled={isDragDisabled}>
                    {(provided, snapshot) => {
                      console.log('🔄 Rendering Droppable: in-progress, isDraggingOver:', snapshot.isDraggingOver, 'disabled:', isDragDisabled);
                      return (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`min-h-[200px] transition-colors duration-300 rounded-lg ${
                            snapshot.isDraggingOver ? 'bg-primary-50 dark:bg-primary-900/50' : ''
                          } ${isDragDisabled ? 'opacity-50' : ''}`}
                        >
                          {inProgressTasks.length === 0 ? (
                            <div className="text-center p-4 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                              {t('columns.inProgress.empty')}
                            </div>
                          ) : (
                            inProgressTasks.map((task, index) => {
                              console.log(`🎯 Rendering in-progress task ${index}:`, { id: task.id, title: task.title });
                              return (
                                <Draggable 
                                  key={task.id} 
                                  draggableId={task.id} 
                                  index={index}
                                  isDragDisabled={isDragDisabled}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={{
                                        ...provided.draggableProps.style,
                                        opacity: snapshot.isDragging ? 0.8 : 1,
                                        transform: snapshot.isDragging
                                          ? `${provided.draggableProps.style?.transform} scale(1.02)`
                                          : provided.draggableProps.style?.transform,
                                      }}
                                    >
                                      <TaskCard
                                        task={task}
                                        onEdit={handleEditTask}
                                        onDelete={deleteTask}
                                        onComplete={completeTask}
                                        isDraggable={!isDragDisabled}
                                      />
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })
                          )}
                          {provided.placeholder}
                        </div>
                      );
                    }}
                  </Droppable>
                </CardContent>
              </Card>
            </div>
            
            {/* Completed Tasks */}
            <div>
              <Card>
                <CardHeader className="bg-success-50 dark:bg-success-900">
                  <CardTitle className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-success-500" />
                    {t('columns.completed.title')} <span className="ml-2 text-sm text-gray-500">({completedTasks.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <Droppable droppableId="completed" isDropDisabled={isDragDisabled}>
                    {(provided, snapshot) => {
                      console.log('🔄 Rendering Droppable: completed, isDraggingOver:', snapshot.isDraggingOver, 'disabled:', isDragDisabled);
                      return (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`min-h-[200px] transition-colors duration-300 rounded-lg ${
                            snapshot.isDraggingOver ? 'bg-success-50 dark:bg-success-900/50' : ''
                          } ${isDragDisabled ? 'opacity-50' : ''}`}
                        >
                          {completedTasks.length === 0 ? (
                            <div className="text-center p-4 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                              {t('columns.completed.empty')}
                            </div>
                          ) : (
                            completedTasks.map((task, index) => {
                              console.log(`🎯 Rendering completed task ${index}:`, { id: task.id, title: task.title });
                              return (
                                <Draggable 
                                  key={task.id} 
                                  draggableId={task.id} 
                                  index={index}
                                  isDragDisabled={isDragDisabled}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={{
                                        ...provided.draggableProps.style,
                                        opacity: snapshot.isDragging ? 0.8 : 1,
                                        transform: snapshot.isDragging
                                          ? `${provided.draggableProps.style?.transform} scale(1.02)`
                                          : provided.draggableProps.style?.transform,
                                      }}
                                    >
                                      <TaskCard
                                        task={task}
                                        onEdit={handleEditTask}
                                        onDelete={deleteTask}
                                        onComplete={completeTask}
                                        isDraggable={!isDragDisabled}
                                      />
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })
                          )}
                          {provided.placeholder}
                        </div>
                      );
                    }}
                  </Droppable>
                </CardContent>
              </Card>
            </div>
          </div>
        </DragDropContext>
      )}
    </div>
  );
};

export default TasksPage;