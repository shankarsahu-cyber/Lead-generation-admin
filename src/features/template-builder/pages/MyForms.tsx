import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Eye, Download, Trash2, PlusCircle, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
  onLoadForm: (id: string | number) => void; // Accepts both string and numerical ID
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
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 sm:p-6 lg:p-8 border-b border-border bg-muted/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Forms</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Manage and organize your form templates
            </p>
          </div>
          <Button 
            onClick={onNewForm} 
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Template
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your templates...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <FolderOpen className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Templates</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">{error}</p>
              <Button onClick={fetchForms} variant="outline">
                Try Again
              </Button>
            </div>
          ) : forms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No Templates Yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                Create your first form template to get started with building amazing forms
              </p>
              <Button onClick={onNewForm} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Your First Template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {forms.map(form => {
                console.log("MyForms: Rendering card for form with formId:", form.formId, "and name:", form.name);
                return (
                  <Card key={form.formId} className="flex flex-col hover:shadow-lg transition-shadow duration-200 border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base sm:text-lg line-clamp-2">{form.name}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm line-clamp-3">{form.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-end gap-2 pt-0">
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" onClick={() => onPreviewForm(form)} className="text-xs">
                          <Eye className="h-3 w-3 mr-1" /> 
                          <span className="hidden sm:inline">Preview</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                        <Button variant="default" size="sm" onClick={() => onLoadForm(form.id)} className="text-xs">
                          <Download className="h-3 w-3 mr-1" /> 
                          <span className="hidden sm:inline">Use</span>
                          <span className="sm:hidden">Use</span>
                        </Button>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => onLoadForm(form.id)} className="text-xs">
                        <Edit className="h-3 w-3 mr-1" /> 
                        <span className="hidden sm:inline">Update Template</span>
                        <span className="sm:hidden">Edit</span>
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(form.id)} className="text-xs">
                        <Trash2 className="h-3 w-3 mr-1" /> 
                        <span className="hidden sm:inline">Delete</span>
                        <span className="sm:hidden">Del</span>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Template Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyForms;
