import React from 'react';
import { FormData, FormField } from '@/types/form-builder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, FileText, Image, Calendar, Hash, Type, List, ToggleLeft } from 'lucide-react';

interface FormSummaryProps {
  formData: FormData;
  formValues: Record<string, any>;
}

export const FormSummary = ({ formData, formValues }: FormSummaryProps) => {
  // Helper function to get field icon based on type
  const getFieldIcon = (fieldType: string) => {
    switch (fieldType) {
      case 'text':
        return <Type className="w-4 h-4" />;
      case 'number':
        return <Hash className="w-4 h-4" />;
      case 'date':
        return <Calendar className="w-4 h-4" />;
      case 'select':
        return <List className="w-4 h-4" />;
      case 'checkbox':
        return <ToggleLeft className="w-4 h-4" />;
      case 'image_upload':
        return <Image className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Helper function to format field value for display
  const formatFieldValue = (field: FormField, value: any) => {
    if (value === undefined || value === null || value === '') {
      return <span className="text-muted-foreground italic">कोई जवाब नहीं दिया गया</span>;
    }

    switch (field.type) {
      case 'checkbox':
        return value ? (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            हाँ
          </Badge>
        ) : (
          <Badge variant="secondary">नहीं</Badge>
        );
      case 'select':
        return <Badge variant="outline">{value}</Badge>;
      case 'date':
        return <Badge variant="outline">{new Date(value).toLocaleDateString('hi-IN')}</Badge>;
      case 'image_upload':
        return value ? (
          <div className="flex items-center gap-2">
            <img src={value} alt="Uploaded" className="w-16 h-16 object-cover rounded" />
            <Badge variant="outline">Image uploaded</Badge>
          </div>
        ) : null;
      default:
        return <span className="font-medium">{value}</span>;
    }
  };

  // Helper function to collect all fields recursively
  const collectAllFields = (fields: FormField[], parentPath: string = ''): Array<{field: FormField, path: string}> => {
    const result: Array<{field: FormField, path: string}> = [];
    
    fields.forEach(field => {
      const currentPath = parentPath ? `${parentPath}.${field.fieldId}` : field.fieldId;
      
      // Add current field if it's a form field (not just a container)
      if (field.type !== 'container' || !field.subFields?.length) {
        result.push({ field, path: currentPath });
      }
      
      // Recursively add subfields
      if (field.subFields && field.subFields.length > 0) {
        result.push(...collectAllFields(field.subFields, currentPath));
      }
    });
    
    return result;
  };

  // Get all answered fields
  const getAnsweredFields = () => {
    const answeredFields: Array<{
      stepTitle: string;
      field: FormField;
      value: any;
      path: string;
    }> = [];

    formData.steps.forEach(step => {
      const allFields = collectAllFields(step.fields);
      
      allFields.forEach(({ field, path }) => {
        const value = formValues[path];
        // Exclude image upload fields from summary as requested
        if (value !== undefined && value !== null && value !== '' && field.type !== 'image_upload') {
          answeredFields.push({
            stepTitle: step.title,
            field,
            value,
            path
          });
        }
      });
    });

    return answeredFields;
  };

  const answeredFields = getAnsweredFields();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-primary">📋 आपके जवाबों का सारांश</h2>
        <p className="text-muted-foreground">
          कृपया अपने सभी जवाबों की जांच करें और confirm करें
        </p>
      </div>

      {/* Summary Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-medium">कुल जवाब दिए गए:</span>
            </div>
            <Badge variant="default" className="bg-green-600">
              {answeredFields.length} प्रश्न
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Answered Fields by Step */}
      {formData.steps.map(step => {
        const stepFields = answeredFields.filter(item => item.stepTitle === step.title);
        
        if (stepFields.length === 0) return null;

        return (
          <Card key={step.stepId} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {formData.steps.indexOf(step) + 1}
                  </span>
                </div>
                {step.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {stepFields.map(({ field, value, path }) => (
                  <div key={path} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getFieldIcon(field.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{field.label}</p>
                        {field.description && (
                          <p className="text-sm text-gray-600 mt-1">{field.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      {formatFieldValue(field, value)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* No answers message */}
      {answeredFields.length === 0 && (
        <Card className="text-center p-8">
          <CardContent>
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              कोई जवाब नहीं मिला
            </h3>
            <p className="text-sm text-muted-foreground">
              कृपया पहले form भरें और फिर summary देखें
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Message */}
      {answeredFields.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-green-800 font-medium">
              सभी जवाब सही लग रहे हैं? आप अब form submit कर सकते हैं!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};