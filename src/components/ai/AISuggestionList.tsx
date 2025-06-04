import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { AISuggestion as AISuggestionType } from '../../types';
import AISuggestion from './AISuggestion';

interface AISuggestionListProps {
  suggestions: AISuggestionType[];
  isLoading?: boolean;
  onApply: (id: string) => void;
  onDismiss: (id: string) => void;
}

const AISuggestionList: React.FC<AISuggestionListProps> = ({
  suggestions,
  isLoading = false,
  onApply,
  onDismiss,
}) => {
  const { t } = useTranslation(['dashboard']);

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
        <Sparkles size={18} className="mr-2 text-primary-500" />
        {t('sections.aiInsights.title')}
      </h2>
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-500"></div>
            <span className="text-gray-500">{t('sections.aiInsights.loading')}</span>
          </div>
        </div>
      ) : suggestions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col items-center justify-center h-full py-8 px-4 text-center bg-gray-50 rounded-lg border border-gray-200"
        >
          <Sparkles size={24} className="text-gray-400 mb-2" />
          <p className="text-gray-500">{t('sections.aiInsights.empty')}</p>
          <p className="text-xs text-gray-400 mt-1">{t('sections.aiInsights.addMore')}</p>
        </motion.div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1">
          <AnimatePresence>
            {suggestions.map((suggestion) => (
              <AISuggestion
                key={suggestion.id}
                suggestion={suggestion}
                onApply={onApply}
                onDismiss={onDismiss}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AISuggestionList;