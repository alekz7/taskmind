import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../../types';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  title: string;
  emptyMessage?: string;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onComplete: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  title,
  emptyMessage = 'No tasks found',
  onEdit,
  onDelete,
  onComplete,
}) => {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">{title}</h2>
      
      {tasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center h-full py-8 px-4 text-center bg-gray-50 rounded-lg border border-gray-200"
        >
          <p className="text-gray-500">{emptyMessage}</p>
        </motion.div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1">
          <AnimatePresence>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onComplete={onComplete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default TaskList;