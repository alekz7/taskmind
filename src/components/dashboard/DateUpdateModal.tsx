import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Task } from '../../types';

interface DateUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onConfirm: (newDueDate: string) => void;
  isMovingToUpcoming: boolean;
}

const DateUpdateModal: React.FC<DateUpdateModalProps> = ({
  isOpen,
  onClose,
  task,
  onConfirm,
  isMovingToUpcoming
}) => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [newDueDate, setNewDueDate] = useState('');

  React.useEffect(() => {
    if (isOpen && task) {
      if (isMovingToUpcoming) {
        // When moving to upcoming, suggest tomorrow as default
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setNewDueDate(format(tomorrow, 'yyyy-MM-dd'));
      } else {
        // When moving to today, set today's date
        setNewDueDate(format(new Date(), 'yyyy-MM-dd'));
      }
    }
  }, [isOpen, task, isMovingToUpcoming]);

  const handleConfirm = () => {
    if (newDueDate) {
      onConfirm(newDueDate);
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isMovingToUpcoming ? "Update Due Date" : "Confirm Date Change"}
      size="md"
    >
      <div className="space-y-6">
        {/* Task Info */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {task.description}
            </p>
          )}
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Clock size={12} className="mr-1" />
            <span>
              Current due date: {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No due date'}
            </span>
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isMovingToUpcoming ? "Select new due date:" : "Confirm due date:"}
          </label>
          <Input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            leftIcon={<Calendar size={16} />}
            fullWidth
            min={format(new Date(), 'yyyy-MM-dd')}
          />
          {isMovingToUpcoming && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select a future date for this upcoming task
            </p>
          )}
        </div>

        {/* Action Message */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {isMovingToUpcoming 
              ? "This task will be moved to upcoming tasks with the selected due date."
              : "This task will be moved to today's tasks and marked for completion today."
            }
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            variant="ghost"
            onClick={handleCancel}
          >
            {t('common:actions.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!newDueDate}
          >
            {t('common:actions.confirm', { defaultValue: 'Confirm' })}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DateUpdateModal;