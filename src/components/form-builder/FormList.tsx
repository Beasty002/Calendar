import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, FileText, Trash2, Edit, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { getForms, deleteForm } from './store';
import type { FormSchema } from './types';

export const FormList: React.FC = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState<FormSchema[]>([]);

  useEffect(() => {
    setForms(getForms());
  }, []);

  const handleDelete = (id: string) => {
    deleteForm(id);
    setForms(getForms());
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Forms</h1>
        <Button onClick={() => navigate('/form-builder/new')}>
          <Plus size={16} className="mr-2" /> Create New Form
        </Button>
      </div>

      <div className="grid gap-4">
        {forms.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <FileText size={48} className="mb-4 opacity-20" />
              <p>No forms created yet.</p>
            </CardContent>
          </Card>
        ) : (
          forms.map((form) => (
            <Card key={form.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                  <FileText size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{form.name}</h3>
                  <p className="text-sm text-muted-foreground">{form.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate(`/form-builder/view/${form.id}`)}>
                  <Eye size={14} className="mr-2" /> View
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate(`/form-builder/edit/${form.id}`)}>
                  <Edit size={14} className="mr-2" /> Edit
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(form.id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
