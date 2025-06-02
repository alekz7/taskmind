import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { PlusCircle, CircleDot, CheckCircle, Clock, Search, Filter } from 'lucide-react';

import { useTaskStore } from '../store/taskStore';
import { Task } from '../types';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';

const TasksPage: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, completeTask, moveTask } = useTaskStore();
  
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
    const { source, destination, draggableId } = result;
    
    // Dropped outside a droppable area
    if (!destination) return;
    
    // Dropped in the same place
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    // Map droppable IDs to status
    const statusMap: Record<string, Task['status']> = {
      'pending': 'pending',
      'in-progress': 'in-progress',
      'completed': 'completed',
    };
    
    // Update task status
    const newStatus = statusMap[destination.droppableId];
    if (newStatus) {
      moveTask(draggableId, newStatus);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">
            Manage and organize all your tasks
          </p>
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
            Create New Task
          </Button>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={18} />}
            fullWidth
          />
        </div>
        
        <div className="md:col-span-2">
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Priority:</span>
            
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant={filterPriority === 'all' ? 'primary' : 'ghost'}
                onClick={() => setFilterPriority('all')}
              >
                All
              </Button>
              
              <Button
                size="sm"
                variant={filterPriority === 'high' ? 'danger' : 'ghost'}
                onClick={() => setFilterPriority('high')}
              >
                High
              </Button>
              
              <Button
                size="sm"
                variant={filterPriority === 'medium' ? 'warning' : 'ghost'}
                onClick={() => setFilterPriority('medium')}
              >
                Medium
              </Button>
              
              <Button
                size="sm"
                variant={filterPriority === 'low' ? 'success' : 'ghost'}
                onClick={() => setFilterPriority('low')}
              >
                Low
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
              <CardHeader className="bg-gray-50">
                <CardTitle className="flex items-center">
                  <CircleDot className="mr-2 h-5 w-5 text-gray-500" />
                  To Do <span className="ml-2 text-sm text-gray-500">({pendingTasks.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <Droppable droppableId="pending">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="min-h-[200px]"
                    >
                      {pendingTasks.length === 0 ? (
                        <div className="text-center p-4 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                          No pending tasks
                        </div>
                      ) : (
                        pendingTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
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
          
          {/* In Progress Tasks */}
          <div>
            <Card>
              <CardHeader className="bg-primary-50">
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-primary-500" />
                  In Progress <span className="ml-2 text-sm text-gray-500">({inProgressTasks.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <Droppable droppableId="in-progress">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="min-h-[200px]"
                    >
                      {inProgressTasks.length === 0 ? (
                        <div className="text-center p-4 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                          No tasks in progress
                        </div>
                      ) : (
                        inProgressTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
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
              <CardHeader className="bg-success-50">
                <CardTitle className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-success-500" />
                  Completed <span className="ml-2 text-sm text-gray-500">({completedTasks.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <Droppable droppableId="completed">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="min-h-[200px]"
                    >
                      {completedTasks.length === 0 ? (
                        <div className="text-center p-4 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                          No completed tasks
                        </div>
                      ) : (
                        completedTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
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