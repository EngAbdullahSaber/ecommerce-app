import { z } from "zod";
import React from "react";

// Field Types
export type FieldType =
  | "text"
  | "email"
  | "number"
  | "password"
  | "textarea"
  | "select"
  | "paginatedSelect"
  | "multiselect"
  | "date"
  | "datetime"
  | "daterange"
  | "checkbox"
  | "radio"
  | "file"
  | "image"
  | "autocomplete"
  | "custom"
  | "array";

export interface FieldOption {
  label: string;
  value: string | number;
  [key: string]: any;
}

export interface ArrayFieldConfig {
  fields: FormField[];
  minItems?: number;
  maxItems?: number;
  addButtonLabel?: string;
  removeButtonLabel?: string;
  itemLabel?: (index: number) => string;
}

export interface PaginatedSelectConfig {
  endpoint: string;
  searchParam?: string;
  labelKey: string;
  valueKey: string;
  pageSize?: number;
  debounceTime?: number;
  additionalParams?: Record<string, any>;
  transformResponse?: (data: any) => FieldOption[];
}

export interface ImageUploadConfig {
  uploadEndpoint?: string;
  maxSize?: number;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  preview?: boolean;
  onUpload?: (file: File) => Promise<string>;
  onRemove?: (url: string) => Promise<void>;
}

export interface DateRangeConfig {
  range?: boolean;
  minDate?: Date;
  maxDate?: Date;
  showTimePicker?: boolean;
  timeFormat?: string;
  timeIntervals?: number;
}

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: FieldOption[];
  rows?: number;
  accept?: string;
  multiple?: boolean;
  min?: number | string;
  max?: number | string;
  validation?: z.ZodType<any>;
  helperText?: string;
  icon?: React.ReactNode;
  render?: (props: {
    field: any;
    value: any;
    onChange: (value: any) => void;
    errors: any;
  }) => React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  arrayConfig?: ArrayFieldConfig;
  paginatedSelectConfig?: PaginatedSelectConfig;
  initialValue?: any;
  readOnly?: boolean;
  imageUploadConfig?: ImageUploadConfig;
  fullWidth?: boolean;
  dateRangeConfig?: DateRangeConfig;
}

export interface GenericFormProps {
  title: string;
  description?: string;
  fields: FormField[];
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  defaultValues?: Record<string, any>;
  isLoading?: boolean;
  mode?: "create" | "edit";
  className?: string;
  fetchOptions?: (endpoint: string, params: any) => Promise<any>;
  onFieldChange?: (fieldName: string, value: any) => void;
  customValidation?: (data: any) => Record<string, string>;
}
