export type FieldType = 
  | 'text' 
  | 'email' 
  | 'phone' 
  | 'number' 
  | 'text_area' 
  | 'dropdown' 
  | 'checkboxes' 
  | 'file_upload' 
  | 'image_upload' 
  | 'radio';

export interface FieldOption {
  optionId: string;
  label: string;
  value: string;
  imageUrl?: string;
  nextFieldId?: string;
  nextStepId?: string;
}

export interface FormField {
  fieldId: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: FieldOption[];
  subFields: FormField[];
  imageUrl?: string;
  imageName?: string;
}

export interface FormStep {
  stepId: string;
  title: string;
  description?: string; // Add optional description property
  fields: FormField[];
  isLastStep?: boolean;
  nextStepCondition?: { fieldId: string; value: string; nextStepId: string; }[];
}

export interface FormSettings {
  successMessage: string;
  allowMultipleSubmissions?: boolean;
  requireEmailVerification?: boolean;
  redirectUrl?: string;
  showProgressBar?: boolean;
  enableAnalytics?: boolean;
  submitButtonText?: string;
}

export interface FormTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderRadius: string;
  fontFamily: string;
  buttonColor: string;
  buttonTextColor: string;
}

export interface FormData {
  id?: string | number; // Add optional id property
  name: string;
  description: string;
  category: TemplateCategory; // Make category mandatory
  steps: FormStep[];
  settings: FormSettings;
  theme?: FormTheme;
}

export interface APIFormData {
  name: string;
  description: string;
  category: string;
  formPayload: string;
  isActive: boolean;
}

export type ExportFormat = 'generated' | 'api' | 'template';

export interface TreeNode {
  id: string;
  type: 'step' | 'field' | 'subfield';
  label: string;
  parent?: string;
  children: string[];
  isExpanded?: boolean;
  stepId?: string;
  fieldId?: string;
  level: number;
}