import { z } from "zod";
import React from "react";

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
  | "checkbox"
  | "radio"
  | "file"
  | "image"
  | "custom";

export interface FieldOption {
  label: string;
  value: string | number | boolean;
  icon?: React.ReactNode;
  description?: string;
  [key: string]: any;
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
  render?: (value: any, data: any) => React.ReactNode;
  renderCustom?: (props: any) => React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  readOnly?: boolean;
  prefix?: string;
  paginatedSelectConfig?: PaginatedSelectConfig;
  initialValue?: any;
  fullWidth?: boolean;
  step?: number;
}

export interface GenericUpdateFormProps<T = any> {
  title: string;
  description?: string;
  fields: FormField[];
  entityId: string | number;
  fetchData: (id: string | number) => Promise<T>;
  onUpdate: (id: string | number, data: any) => Promise<any>;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  className?: string;
  beforeSubmit?: (data: any) => any;
  afterSuccess?: () => void;
  afterError?: (error: any) => void;
  fetchOptions?: (endpoint: string, params: any) => Promise<any>;
  preventDefaultSubmit?: boolean;
}
