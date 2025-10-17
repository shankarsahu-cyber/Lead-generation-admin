// import { TemplateCategory, TemplateStep } from "@/types/template";

import { TemplateCategory, TemplateStep } from "@/types";

export const TEMPLATE_CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: 'REAL_ESTATE', label: 'Real Estate' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'HEALTHCARE', label: 'Healthcare' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'ECOMMERCE', label: 'E-Commerce' },
  { value: 'EVENTS', label: 'Events' },
  { value: 'TRAVEL', label: 'Travel' },
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'AUTOMOBILE', label: 'Automobile' },
  { value: 'BEAUTY_WELLNESS', label: 'Beauty & Wellness' },
  { value: 'LEGAL', label: 'Legal' },
  { value: 'CONSTRUCTION', label: 'Construction' },
  { value: 'NON_PROFIT', label: 'Non-Profit' },
  { value: 'TECHNOLOGY', label: 'Technology' },
  { value: 'HOSPITAL', label: 'Hospital' },
];

export const DEFAULT_TEMPLATE_STEPS: TemplateStep[] = [
  {
    "stepId": "step1",
    "title": "Template Name",
    "fields": [
      {
        "fieldId": "main_selection",
        "type": "image_select",
        "label": "Choose an option",
        "required": true,
        "options": [
          {
            "optionId": "new-item-1760613551493",
            "label": "One",
            "value": "one",
            "imageUrl": "",
            "nextFieldId": "step2_new-item-1760613551493"
          },
          {
            "optionId": "new-item-1760613552639",
            "label": "Two",
            "value": "two",
            "imageUrl": "",
            "nextFieldId": "step3_new-item-1760613552639"
          },
          {
            "optionId": "new-item-1760613553369",
            "label": "Three",
            "value": "three",
            "imageUrl": "",
            "nextFieldId": "step4_new-item-1760613553369"
          }
        ]
      }
    ]
  },
  {
    "stepId": "step2_new-item-1760613551493",
    "title": "Choose One Type",
    "fields": [
      {
        "fieldId": "new-item-1760613551493_selection",
        "type": "radio",
        "label": "Select One option",
        "options": [
          {
            "optionId": "new-item-1760613608278",
            "label": "option 1",
            "value": "option_1",
            "imageUrl": "",
            "nextFieldId": "step_final"
          },
          {
            "optionId": "new-item-1760613634961",
            "label": "option 2",
            "value": "option_2",
            "imageUrl": "",
            "nextFieldId": "step_final"
          },
          {
            "optionId": "new-item-1760613640718",
            "label": "option 3",
            "value": "option_3",
            "imageUrl": "",
            "nextFieldId": "step_final"
          }
        ]
      }
    ]
  },
  {
    "stepId": "step3_new-item-1760613552639",
    "title": "Choose Two Type",
    "fields": [
      {
        "fieldId": "new-item-1760613552639_selection",
        "type": "radio",
        "label": "Select Two option",
        "options": [
          {
            "optionId": "new-item-1760613655451",
            "label": "option 2.1",
            "value": "option_2.1",
            "imageUrl": "",
            "nextFieldId": "step_final"
          },
          {
            "optionId": "new-item-1760613656850",
            "label": "option 2.2",
            "value": "option_2.2",
            "imageUrl": "",
            "nextFieldId": "step_final"
          },
          {
            "optionId": "new-item-1760613657985",
            "label": "option 2.3",
            "value": "option_2.3",
            "imageUrl": "",
            "nextFieldId": "step_final"
          }
        ]
      }
    ]
  },
  {
    "stepId": "step4_new-item-1760613553369",
    "title": "Choose Three Type",
    "fields": [
      {
        "fieldId": "new-item-1760613553369_selection",
        "type": "radio",
        "label": "Select Three option",
        "options": [
          {
            "optionId": "new-item-1760613695747",
            "label": "option 3.1",
            "value": "option_3.1",
            "imageUrl": "",
            "nextFieldId": "step_final"
          },
          {
            "optionId": "new-item-1760613705301",
            "label": "option 3.2",
            "value": "option_3.2",
            "imageUrl": "",
            "nextFieldId": "step_final"
          },
          {
            "optionId": "new-item-1760613710903",
            "label": "option 3.3",
            "value": "option_3.3",
            "imageUrl": "",
            "nextFieldId": "step_final"
          }
        ]
      }
    ]
  },
  {
    "stepId": "step_final",
    "title": "Your Details",
    "fields": [
      {
        "fieldId": "name",
        "type": "text",
        "label": "Your Name",
        "required": true
      },
      {
        "fieldId": "email",
        "type": "email",
        "label": "Email Address",
        "required": true
      },
      {
        "fieldId": "phone",
        "type": "text",
        "label": "Phone Number",
        "required": true
      },
      {
        "fieldId": "message",
        "type": "text",
        "label": "Additional Message",
        "required": false
      }
    ],
    "isLastStep": true
  }
];
