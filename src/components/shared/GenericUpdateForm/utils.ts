import { z } from "zod";
import { FormField } from "./types";

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateUpdateSchema(fields: FormField[]) {
  const schemaFields: Record<string, z.ZodType<any>> = {};

  fields.forEach((field) => {
    if (field.readOnly) return;

    if (field.validation) {
      schemaFields[field.name] = field.validation;
    } else {
      let fieldSchema: z.ZodType<any>;

      switch (field.type) {
        case "email":
          fieldSchema = z.string().email("Invalid email address");
          break;
        case "number":
          fieldSchema = z.preprocess(
            (val) => (val === "" ? undefined : Number(val)),
            z.number().optional(),
          );
          if (field.min !== undefined)
            fieldSchema = (fieldSchema as z.ZodNumber).min(
              Number(field.min),
              `Minimum value is ${field.min}`,
            );
          if (field.max !== undefined)
            fieldSchema = (fieldSchema as z.ZodNumber).max(
              Number(field.max),
              `Maximum value is ${field.max}`,
            );
          break;
        case "date":
        case "datetime":
          fieldSchema = z.string();
          break;
        case "checkbox":
          fieldSchema = z.boolean();
          break;
        case "radio":
          fieldSchema = z.union([z.string(), z.boolean(), z.number()]);
          break;
        case "multiselect":
          fieldSchema = z.array(z.string());
          break;
        case "file":
        case "image":
          fieldSchema = z.any().optional();
          break;
        case "custom":
        case "paginatedSelect":
          fieldSchema = z.any().optional();
          break;
        default:
          fieldSchema = z.string();
      }

      if (field.required) {
        if (field.type === "checkbox") {
          fieldSchema = (fieldSchema as z.ZodBoolean).refine(
            (val) => val === true,
            "This field is required",
          );
        } else if (field.type === "number") {
          fieldSchema = (fieldSchema as z.ZodNumber).min(
            1,
            `${field.label} is required`,
          );
        } else if (field.type !== "file" && field.type !== "image") {
          if (field.type === "radio") {
            fieldSchema = fieldSchema.refine(
              (val) => val !== undefined && val !== null && val !== "",
              `${field.label} is required`,
            );
          } else {
            fieldSchema = (fieldSchema as z.ZodString).min(
              1,
              `${field.label} is required`,
            );
          }
        }
      } else {
        if (field.type === "number") {
          fieldSchema = fieldSchema.optional();
        }
      }

      schemaFields[field.name] = fieldSchema;
    }
  });

  return z.object(schemaFields);
}
