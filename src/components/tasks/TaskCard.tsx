import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, CheckCircle2, Edit, Trash2, AlertTriangle, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Task } from '../../types';
import Button from '../ui/Button';

interface TaskCardProps {
  task: Task;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  isDraggable?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onComplete,
  isDraggable = false,
}) => {
  const { t } = useTranslation(['tasks', 'common']);

  const priorityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const statusColors = {
    'pending': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-3 border-l-4 ${
        task.priority === 'high' 
          ? 'border-error-500' 
          : task.priority === 'medium' 
            ? 'border-warning-500' 
            : 'border-success-500'
      } ${isDraggable ? 'cursor-grab active:cursor-grabbing group' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        {isDraggable && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mr-2 text-gray-400 dark:text-gray-600">
            <GripVertical size={20} aria-label="Drag handle" />
          </div>
        )}
        <h3 className={`font-medium flex-1 ${task.status === 'completed' ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
          {task.title}
        </h3>
        <div className="flex space-x-1">
          <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
            {t(`common:priority.${task.priority}`)}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[task.status]}`}>
            {t(`common:status.${task.status}`)}
          </span>
        </div>
      </div>
      
      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{task.description}</p>
      )}
      
      <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
        {task.dueDate && (
          <div className="flex items-center">
            <Calendar size={14} className="mr-1" />
            <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
          </div>
        )}
        
        {task.estimatedTime && (
          <div className="flex items-center">
            <Clock size={14} className="mr-1" />
            <span>{t('task.estimatedTime', { time: task.estimatedTime })}</span>
          </div>
        )}
        
        {task.category && (
          <div className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
            {task.category}
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        {task.status !== 'completed' ? (
          <Button
            variant="success"
            size="xs"
            leftIcon={<CheckCircle2 size={14} />}
            onClick={() => onComplete(task.id)}
          >
            {t('common:actions.complete')}
          </Button>
        ) : (
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <CheckCircle2 size={14} className="mr-1 text-success-500" />
            {t('common:status.completed')}
          </div>
        )}
        
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="xs"
            leftIcon={<Edit size={14} />}
            onClick={() => onEdit(task.id)}
          >
            {t('common:actions.edit')}
          </Button>
          
          <Button
            variant="ghost"
            size="xs"
            leftIcon={<Trash2 size={14} />}
            onClick={() => onDelete(task.id)}
          >
            {t('common:actions.delete')}
          </Button>
        </div>
      </div>
      
      {task.priority === 'high' && task.status !== 'completed' && (
        <div className="mt-2 flex items-center text-xs text-error-500 dark:text-error-400">
          <AlertTriangle size={14} className="mr-1" />
          {t('task.highPriorityWarning')}
        </div>
      )}
    </motion.div>
  );
};

export default TaskCard;