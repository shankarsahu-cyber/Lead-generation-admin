import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Eye, Download, Trash2, PlusCircle, Edit } from 'lucide-react';
import { useToast } from '../../../hooks/use-toast'; // Corrected path
import { getAllForms, deleteForm } from '../services/api'; // Corrected path
import { FormData } from '../../types/template-builder';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';

interface MyFormsProps {
  onLoadForm: (id: number) => void; // Expects numerical ID
  onPreviewForm: (formData: FormData) => void;
  onNewForm: () => void;
  refreshTrigger: number; // New prop to trigger refresh
  onDeleteForm: (id: number) => void; // New prop for deleting forms
}

const MyForms: React.FC<MyFormsProps> = ({ onLoadForm, onPreviewForm, onNewForm, refreshTrigger, onDeleteForm }) => {
  const { toast } = useToast();
  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDeleteId, setTemplateToDeleteId] = useState<number | null>(null); // State to store numerical ID

  const fetchForms = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("MyForms: Fetching forms...");
      const fetchedForms = await getAllForms(toast);
      setForms(fetchedForms);
      console.log("MyForms: Forms fetched successfully.", fetchedForms);
    } catch (err) {
      console.error("MyForms: Failed to fetch forms:", err);
      setError("Failed to load forms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("MyForms: useEffect triggered, refreshTrigger changed:", refreshTrigger);
    fetchForms();
  }, [refreshTrigger]); // Add refreshTrigger to dependency array

  const handleDeleteClick = (id: number) => {
    console.log("MyForms: Delete button clicked for templateId:", id);
    setTemplateToDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (templateToDeleteId) {
      console.log("MyForms: Delete confirmed for templateId:", templateToDeleteId);
      onDeleteForm(templateToDeleteId);
      setTemplateToDeleteId(null);
      setIsDeleteDialogOpen(false);
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
          {forms.map(form => {
            console.log("MyForms: Rendering card for form with formId:", form.formId, "and name:", form.name); // Log formId
            return (
            <Card key={form.formId} className="flex flex-col">
              <CardHeader>
                <CardTitle>{form.name}</CardTitle>
                <CardDescription className="line-clamp-2">{form.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end gap-2 pt-0">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onPreviewForm(form)}>
                    <Eye className="h-4 w-4 mr-2" /> Preview
                  </Button>
                  <Button variant="default" size="sm" className="flex-1" onClick={() => onLoadForm(form.id)}>
                    <Download className="h-4 w-4 mr-2" /> Use Template
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={() => onLoadForm(form.id)}>
                  <Edit className="h-4 w-4 mr-2" /> Update Template
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(form.id)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </CardContent>
            </Card>
          );
          })}
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Template Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyForms;
