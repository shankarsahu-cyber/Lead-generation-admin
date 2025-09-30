import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Eye, Download, Trash2, PlusCircle } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast'; // Corrected path
import { getAllForms, deleteForm } from '../services/api'; // Corrected path
import { FormData } from '../../types/template-builder';

interface MyFormsProps {
  onLoadForm: (formId: string) => void;
  onPreviewForm: (formData: FormData) => void;
  onNewForm: () => void;
  refreshTrigger: number; // New prop to trigger refresh
}

const MyForms: React.FC<MyFormsProps> = ({ onLoadForm, onPreviewForm, onNewForm }) => {
  const { toast } = useToast();
  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForms = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedForms = await getAllForms(toast);
      setForms(fetchedForms);
    } catch (err) {
      console.error("Failed to fetch forms:", err);
      setError("Failed to load forms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, [refreshTrigger]); // Add refreshTrigger to dependency array

  const handleDelete = async (formId: string) => {
    if (window.confirm("Are you sure you want to delete this form?")) {
      try {
        await deleteForm(formId, toast);
        toast({
          title: "Form Deleted",
          description: "Form has been successfully deleted.",
        });
        fetchForms(); // Refresh the list
      } catch (err) {
        console.error("Failed to delete form:", err);
        toast({
          title: "Delete Failed",
          description: "There was an error deleting the form.",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><p>Loading forms...</p></div>;
  }

  if (error) {
    return <div className="flex-1 flex items-center justify-center"><p className="text-destructive">Error: {error}</p></div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 flex-1 overflow-y-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">My Forms</h1>
        <Button onClick={onNewForm} className="gap-2">
          <PlusCircle className="h-4 w-4" /> New Form
        </Button>
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Forms Yet</h2>
          <p className="text-muted-foreground mb-4">Create your first form to see it here.</p>
          <Button onClick={onNewForm} className="gap-2">
            <PlusCircle className="h-4 w-4" /> Create New Form
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map(form => (
            <Card key={form.name} className="flex flex-col">
              <CardHeader>
                <CardTitle>{form.name}</CardTitle>
                <CardDescription className="line-clamp-2">{form.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end gap-2 pt-0">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => onPreviewForm(form)}>
                    <Eye className="h-4 w-4 mr-2" /> Preview
                  </Button>
                  <Button variant="default" size="sm" className="flex-1" onClick={() => onLoadForm(form.formId)}>
                    <Download className="h-4 w-4 mr-2" /> Use Template
                  </Button>
                </div>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(form.formId)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyForms;
