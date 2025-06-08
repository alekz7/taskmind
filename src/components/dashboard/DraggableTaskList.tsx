import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import { Task } from '../../types';
import TaskCard from '../tasks/TaskCard';

interface DraggableTaskListProps {
  tasks: Task[];
  title: string;
  emptyMessage?: string;
  droppableId: string;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  isDragDisabled?: boolean;
}

const DraggableTaskList: React.FC<DraggableTaskListProps> = ({
  tasks,
  title,
  emptyMessage = 'No tasks found',
  droppableId,
  onEdit,
  onDelete,
  onComplete,
  isDragDisabled = false,
}) => {
  const { t } = useTranslation(['tasks']);

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
        {title}
        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </h2>
      
      <Droppable droppableId={droppableId} isDropDisabled={isDragDisabled}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`flex-1 transition-all duration-200 rounded-lg border-2 border-dashed ${
              snapshot.isDraggingOver
                ? 'border-primary-300 bg-primary-50 dark:bg-primary-900/20'
                : 'border-transparent'
            } ${isDragDisabled ? 'opacity-50' : ''}`}
          >
            {tasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full py-8 px-4 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
              </motion.div>
            ) : (
              <div className="space-y-3 min-h-[200px]">
                <AnimatePresence>
                  {tasks.map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                      isDragDisabled={isDragDisabled}
                    >
                      {(provided, snapshot) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          style={{
                            ...provided.draggableProps.style,
                            opacity: snapshot.isDragging ? 0.8 : 1,
                            transform: snapshot.isDragging
                              ? `${provided.draggableProps.style?.transform} scale(1.02)`
                              : provided.draggableProps.style?.transform,
                          }}
                          className={`${
                            snapshot.isDragging
                              ? 'shadow-lg ring-2 ring-primary-500 ring-opacity-50'
                              : ''
                          }`}
                        >
                          <TaskCard
                            task={task}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onComplete={onComplete}
                            isDraggable={!isDragDisabled}
                          />
                        </motion.div>
                      )}
                    </Draggable>
                  ))}
                </AnimatePresence>
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default DraggableTaskList;