import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { AISuggestion, Task } from '../types';

interface AISuggestionState {
  suggestions: AISuggestion[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addSuggestion: (suggestion: Omit<AISuggestion, 'id' | 'createdAt' | 'applied'>) => void;
  applySuggestion: (id: string) => void;
  dismissSuggestion: (id: string) => void;
  generateSuggestions: (tasks: Task[]) => Promise<void>;
  setSuggestions: (suggestions: AISuggestion[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

// Mock AI suggestion generation - in a real app, this would call an LLM API
const mockGenerateSuggestions = async (tasks: Task[]): Promise<AISuggestion[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (tasks.length === 0) return [];
  
  const suggestions: Omit<AISuggestion, 'id' | 'createdAt' | 'applied'>[] = [];
  
  // Generate priority suggestion if there are multiple tasks
  if (tasks.length > 1) {
    const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed');
    if (highPriorityTasks.length > 0) {
      suggestions.push({
        type: 'task-priority',
        content: `You have ${highPriorityTasks.length} high priority tasks that should be completed soon. Consider focusing on these first.`,
        relatedTaskIds: highPriorityTasks.map(t => t.id),
        userId: tasks[0].userId,
      });
    }
  }
  
  // Generate scheduling suggestion
  const incompleteTasks = tasks.filter(t => t.status !== 'completed');
  if (incompleteTasks.length > 3) {
    suggestions.push({
      type: 'task-scheduling',
      content: 'You have several incomplete tasks. I recommend scheduling specific time blocks for each task to ensure progress.',
      userId: tasks[0].userId,
    });
  }
  
  // Generate productivity suggestion
  suggestions.push({
    type: 'productivity',
    content: 'Based on your past behavior, you complete tasks more efficiently in the morning. Consider scheduling important work before noon.',
    userId: tasks[0].userId,
  });
  
  // Add IDs and timestamps
  return suggestions.map(s => ({
    ...s,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    applied: false,
  }));
};

export const useAISuggestionStore = create<AISuggestionState>((set, get) => ({
  suggestions: [],
  isLoading: false,
  error: null,
  
  addSuggestion: (suggestionData) => set((state) => {
    const newSuggestion: AISuggestion = {
      id: uuidv4(),
      ...suggestionData,
      createdAt: new Date().toISOString(),
      applied: false,
    };
    
    return { suggestions: [...state.suggestions, newSuggestion] };
  }),
  
  applySuggestion: (id) => set((state) => ({
    suggestions: state.suggestions.map((suggestion) => 
      suggestion.id === id 
        ? { ...suggestion, applied: true } 
        : suggestion
    ),
  })),
  
  dismissSuggestion: (id) => set((state) => ({
    suggestions: state.suggestions.filter((suggestion) => suggestion.id !== id),
  })),
  
  generateSuggestions: async (tasks) => {
    const { setLoading, setError, setSuggestions } = get();
    setLoading(true);
    try {
      const newSuggestions = await mockGenerateSuggestions(tasks);
      setSuggestions([...get().suggestions, ...newSuggestions]);
      setLoading(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate suggestions');
      setLoading(false);
    }
  },
  
  setSuggestions: (suggestions) => set({ suggestions }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
}));