import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sparkles, Check, X, ArrowRight } from 'lucide-react';
import { AISuggestion as AISuggestionType } from '../../types';
import Button from '../ui/Button';

interface AISuggestionProps {
  suggestion: AISuggestionType;
  onApply: (id: string) => void;
  onDismiss: (id: string) => void;
}

const AISuggestion: React.FC<AISuggestionProps> = ({
  suggestion,
  onApply,
  onDismiss,
}) => {
  const { t } = useTranslation(['dashboard', 'common']);

  const typeColors = {
    'task-priority': 'bg-error-50 border-error-200',
    'task-scheduling': 'bg-primary-50 border-primary-200',
    'productivity': 'bg-secondary-50 border-secondary-200',
    'idle-time': 'bg-accent-50 border-accent-200',
  };

  const typeIcons = {
    'task-priority': <Sparkles className="text-error-500\" size={20} />,
    'task-scheduling': <Sparkles className="text-primary-500" size={20} />,
    'productivity': <Sparkles className="text-secondary-500" size={20} />,
    'idle-time': <Sparkles className="text-accent-500" size={20} />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-4 rounded-lg border ${typeColors[suggestion.type]} mb-3`}
    >
      <div className="flex items-start">
        <div className="mr-3 mt-0.5">
          {typeIcons[suggestion.type]}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-gray-900">{t('sections.aiInsights.suggestion')}</h3>
            {suggestion.applied && (
              <span className="text-xs px-2 py-1 rounded-full bg-success-100 text-success-800 flex items-center">
                <Check size={12} className="mr-1" />
                {t('sections.aiInsights.applied')}
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-700 mt-1">{suggestion.content}</p>
          
          {!suggestion.applied && (
            <div className="flex justify-end mt-3 space-x-2">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<X size={14} />}
                onClick={() => onDismiss(suggestion.id)}
              >
                {t('common:actions.dismiss')}
              </Button>
              
              <Button
                variant="primary"
                size="sm"
                leftIcon={<ArrowRight size={14} />}
                onClick={() => onApply(suggestion.id)}
              >
                {t('common:actions.apply')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AISuggestion;