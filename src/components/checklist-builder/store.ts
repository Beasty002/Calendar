import type { ChecklistSchema } from './types';

const STORAGE_KEY = 'calendar_app_checklists';

export const getChecklists = (): ChecklistSchema[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load checklists", error);
    return [];
  }
};

export const getChecklist = (id: string): ChecklistSchema | undefined => {
  const checklists = getChecklists();
  return checklists.find(c => c.id === id);
};

export const saveChecklist = (checklist: ChecklistSchema): void => {
  const checklists = getChecklists();
  const existingIndex = checklists.findIndex(c => c.id === checklist.id);
  
  if (existingIndex >= 0) {
    checklists[existingIndex] = checklist;
  } else {
    checklists.push(checklist);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(checklists));
};

export const deleteChecklist = (id: string): void => {
  const checklists = getChecklists();
  const newChecklists = checklists.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newChecklists));
};
