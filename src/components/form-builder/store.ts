import type { FormSchema } from './types';

const STORAGE_KEY = 'calendar_app_forms';

export const getForms = (): FormSchema[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load forms", error);
    return [];
  }
};

export const getForm = (id: string): FormSchema | undefined => {
  const forms = getForms();
  return forms.find(f => f.id === id);
};

export const saveForm = (form: FormSchema): void => {
  const forms = getForms();
  const existingIndex = forms.findIndex(f => f.id === form.id);
  
  if (existingIndex >= 0) {
    forms[existingIndex] = form;
  } else {
    forms.push(form);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
};

export const deleteForm = (id: string): void => {
  const forms = getForms();
  const newForms = forms.filter(f => f.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newForms));
};
