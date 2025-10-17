export type TemplateCategory = 
  | 'REAL_ESTATE'
  | 'EDUCATION'
  | 'INSURANCE'
  | 'HEALTHCARE'
  | 'FINANCE'
  | 'ECOMMERCE'
  | 'EVENTS'
  | 'TRAVEL'
  | 'RESTAURANT'
  | 'AUTOMOBILE'
  | 'BEAUTY_WELLNESS'
  | 'LEGAL'
  | 'CONSTRUCTION'
  | 'NON_PROFIT'
  | 'TECHNOLOGY'
  | 'HOSPITAL';

export interface TemplateOption {
  optionId: string;
  label: string;
  value: string;
  imageUrl?: string;
  nextFieldId?: string;
}

export interface TemplateField {
  fieldId: string;
  type: 'text' | 'email' | 'radio' | 'image_select';
  label: string;
  required?: boolean;
  options?: TemplateOption[];
}

export interface TemplateStep {
  stepId: string;
  title: string;
  fields: TemplateField[];
  isLastStep?: boolean;
}

export interface FormPayload {
  name: string;
  description: string;
  steps: TemplateStep[];
  settings: {
    successMessage: string;
  };
  formId?: string;
  theme?: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    borderRadius: string;
    fontFamily: string;
    buttonColor: string;
    buttonTextColor: string;
  };
}

export interface Template {
  id: number;
  name: string;
  description: string;
  formPayload: string;
  category: TemplateCategory;
  isActive: boolean;
  imageUrl: string | null;
}

export interface CreateTemplateData {
  name: string;
  description: string;
  steps: TemplateStep[];
  settings: {
    successMessage: string;
  };
}
