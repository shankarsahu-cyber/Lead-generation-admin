import { z } from "zod";

// Form option schema
export const formOptionSchema = z.object({
  optionId: z.string(),
  label: z.string(),
  value: z.string(),
  imageUrl: z.string().optional(),
  nextFieldId: z.string().optional(),
});

// Form field schema  
export const formFieldSchema = z.object({
  fieldId: z.string(),
  type: z.enum(["image_select", "radio", "text", "email"]),
  label: z.string(),
  required: z.boolean().default(true),
  allowMultiple: z.boolean().default(false),
  options: z.array(formOptionSchema).optional(),
});

// Form step schema
export const formStepSchema = z.object({
  stepId: z.string(),
  title: z.string(),
  fields: z.array(formFieldSchema),
  isLastStep: z.boolean().default(false),
});

// Complete form schema
export const formBuilderSchema = z.object({
  name: z.string(),
  description: z.string(),
  steps: z.array(formStepSchema),
  settings: z.object({
    successMessage: z.string(),
  }),
});

// Tree node for sidebar navigation - using interface instead of zod schema for recursive types
export interface TreeNode {
  id: string;
  label: string;
  type: "root" | "option" | "step";
  children: TreeNode[];
  stepId?: string;
  fieldId?: string;
  optionId?: string;
  imageUrl?: string;
  allowMultiple: boolean;
  isExpanded: boolean;
}

export type FormOption = z.infer<typeof formOptionSchema>;
export type FormField = z.infer<typeof formFieldSchema>;  
export type FormStep = z.infer<typeof formStepSchema>;
export type FormBuilder = z.infer<typeof formBuilderSchema>;