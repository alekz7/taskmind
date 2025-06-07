import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { PlusCircle, CircleDot, CheckCircle, Clock, Search, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useTaskStore } from '../store/taskStore';
import { Task } from '../types';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';

const TasksPage: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, completeTask, moveTask } = useTaskStore();
  const { t } = useTranslation(['tasks', 'common']);
  
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  
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
  
  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    addTask(taskData);
    setShowAddTask(false);
  };
  
  const handleUpdateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (editingTaskId) {
      updateTask(editingTaskId, taskData);
      setEditingTaskId(null);
    }
  };
  
  const handleEditTask = (taskId: string) => {
    setEditingTaskId(taskId);
    setShowAddTask(false);
  };
  
  const handleCancelEdit = () => {
    setEditingTaskId(null);
  };
  
  const handleDragEnd = (result: DropResult) => {
    console.log("Drag result", resilt);
    console.log("All task", tasks)
    const { source, destination, draggableId } = result;
    
    // Drop outside valid drop zone
    if (!destination) return;
    
    // Drop in same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    // Map droppableId to task status
    const statusMap: Record<string, Task['status']> = {
      'pending': 'pending',
      'in-progress': 'in-progress',
      'completed': 'completed',
    };
    
    const newStatus = statusMap[destination.droppableId];
    if (newStatus) {
      moveTask(draggableId, newStatus);
    }
  };
  
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
      
      {/* Task Columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
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
                <Droppable droppableId="pending">
                  {
                    
                    (provided, snapshot) => (                      
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`min-h-[200px] transition-colors duration-300 rounded-lg ${
                        snapshot.isDraggingOver ? 'bg-gray-50 dark:bg-gray-800' : ''
                      }`}
                    >
                      {pendingTasks.length === 0 ? (
                        <div className="text-center p-4 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                          {t('columns.todo.empty')}
                        </div>
                      ) : (
                        pendingTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
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
                                  isDraggable
                                />
                              </div>
                            )}
                          </Draggable>
                        ))
                      ) }
                      {provided.placeholder}
                    </div>
                  )}
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
                <Droppable droppableId="in-progress">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`min-h-[200px] transition-colors duration-300 rounded-lg ${
                        snapshot.isDraggingOver ? 'bg-primary-50 dark:bg-primary-900/50' : ''
                      }`}
                    >
                      {inProgressTasks.length === 0 ? (
                        <div className="text-center p-4 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                          {t('columns.inProgress.empty')}
                        </div>
                      ) : (
                        inProgressTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
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
                                  isDraggable
                                />
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
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
                <Droppable droppableId="completed">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`min-h-[200px] transition-colors duration-300 rounded-lg ${
                        snapshot.isDraggingOver ? 'bg-success-50 dark:bg-success-900/50' : ''
                      }`}
                    >
                      {completedTasks.length === 0 ? (
                        <div className="text-center p-4 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                          {t('columns.completed.empty')}
                        </div>
                      ) : (
                        completedTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
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
                                  isDraggable
                                />
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

export default TasksPage;