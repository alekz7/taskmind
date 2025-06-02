import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, Clock, Tag, PlusCircle, X } from 'lucide-react';
import { Task } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface TaskFormProps {
  initialTask?: Partial<Task>;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ initialTask, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [dueDate, setDueDate] = useState(initialTask?.dueDate || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(initialTask?.priority || 'medium');
  const [category, setCategory] = useState(initialTask?.category || '');
  const [estimatedTime, setEstimatedTime] = useState<number | undefined>(initialTask?.estimatedTime);
  const [titleError, setTitleError] = useState('');

  // Clear error when title changes
  useEffect(() => {
    if (title.trim() !== '') {
      setTitleError('');
    }
  }, [title]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate title
    if (title.trim() === '') {
      setTitleError('Title is required');
      return;
    }
    
    // Create task object
    const taskData = {
      title,
      description,
      dueDate: dueDate || null,
      priority,
      status: initialTask?.status || 'pending',
      category,
      estimatedTime,
      actualTime: initialTask?.actualTime,
    };
    
    onSubmit(taskData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-md p-5 border border-gray-200"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {initialTask?.id ? 'Edit Task' : 'Create New Task'}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          leftIcon={<X size={16} />}
        >
          Cancel
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          error={titleError}
          autoFocus
        />
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            className="w-full rounded-md shadow-sm border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
            placeholder="Task description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            leftIcon={<CalendarIcon size={16} />}
            fullWidth
          />
          
          <div>
            <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Time (minutes)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Clock size={16} />
              </div>
              <input
                id="estimatedTime"
                type="number"
                min="0"
                className="pl-10 w-full rounded-md shadow-sm border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                placeholder="30"
                value={estimatedTime || ''}
                onChange={(e) => setEstimatedTime(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="priority"
              className="w-full rounded-md shadow-sm border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <Input
            label="Category"
            placeholder="e.g., Work, Personal, Study"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            leftIcon={<Tag size={16} />}
            fullWidth
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-3">
          <Button
            variant="ghost"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            leftIcon={<PlusCircle size={16} />}
          >
            {initialTask?.id ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default TaskForm;