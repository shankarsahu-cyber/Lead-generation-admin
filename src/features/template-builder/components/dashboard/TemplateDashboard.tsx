import React from 'react';
import { FormData } from '../../types/form-builder';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Trash2, FolderOpen, Plus, Eye, FileText, Calendar, Users, Settings } from 'lucide-react';


interface SavedForm extends FormData {
  formId: string;
  savedAt: string;
}

interface FormDashboardProps {
  savedForms: SavedForm[];
  onLoadForm: (formId: string) => void;
  onDeleteForm: (formId: string) => void;
  onNewForm: () => void;
  onSaveTemplate: (formData: FormData) => Promise<any>; // Add onSaveTemplate prop
}

// Template categories for better organization
const getFormCategory = (form: SavedForm) => {
  const name = form.name.toLowerCase();
  if (name.includes('real estate') || name.includes('property')) return 'REAL ESTATE';
  if (name.includes('job') || name.includes('application') || name.includes('career')) return 'JOBS';
  if (name.includes('lead') || name.includes('marketing') || name.includes('contact')) return 'MARKETING';
  if (name.includes('event') || name.includes('registration') || name.includes('booking')) return 'EVENTS';
  return 'GENERAL';
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'REAL ESTATE': return 'bg-blue-100 text-blue-800';
    case 'JOBS': return 'bg-green-100 text-green-800';
    case 'MARKETING': return 'bg-purple-100 text-purple-800';
    case 'EVENTS': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const FormDashboard = ({
  savedForms,
  onLoadForm,
  onDeleteForm,
  onNewForm,
  onSaveTemplate,
}: FormDashboardProps) => {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Form Templates</h1>
            <p className="text-gray-600 mt-1">Choose from your saved forms or create a new one</p>
          </div>
          <Button 
            onClick={onNewForm}
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            Create New Form
          </Button>
        </div>
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Forms</p>
                  <p className="text-2xl font-bold text-gray-900">{savedForms.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{savedForms.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{savedForms.filter(form => {
                    const formDate = new Date(form.savedAt);
                    const now = new Date();
                    return formDate.getMonth() === now.getMonth() && formDate.getFullYear() === now.getFullYear();
                  }).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Settings className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{new Set(savedForms.map(getFormCategory)).size}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {savedForms.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No forms yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first form template to get started with building professional forms.
                </p>
                <Button 
                  onClick={onNewForm}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Form
                </Button>
              </div>
            </div>
          ) : (
            savedForms.map((form) => {
              const category = getFormCategory(form);
              const categoryColor = getCategoryColor(category);
              const stepCount = form.steps.length;
              const fieldCount = form.steps.reduce((total, step) => total + step.fields.length, 0);
              
              return (
                <Card 
                  key={form.formId} 
                  className="group hover:shadow-xl transition-all duration-300 bg-white border-0 shadow-md hover:scale-105 cursor-pointer overflow-hidden"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={`${categoryColor} text-xs font-medium px-2 py-1`}>
                        {category}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteForm(form.formId);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight">
                      {form.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {form.description || 'Professional form template for data collection'}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* Form Stats */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>{stepCount} Steps</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Settings className="h-3 w-3" />
                        <span>{fieldCount} Fields</span>
                      </div>
                    </div>
                    
                    {/* Date */}
                    <p className="text-xs text-gray-400 mb-4">
                      Created: {new Date(form.savedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onLoadForm(form.formId);
                        }}
                        className="flex-1 gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Eye className="h-4 w-4" />
                        Use Template
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onLoadForm(form.formId);
                        }}
                        className="flex-1 gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
                      >
                        <FileText className="h-4 w-4" />
                        Update Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
