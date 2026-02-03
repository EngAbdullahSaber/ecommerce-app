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

export function generateSchema(fields: FormField[]) {
  const schemaFields: Record<string, z.ZodType<any>> = {};

  fields.forEach((field) => {
    if (field.type === "radio") {
      schemaFields[field.name] = z.any().optional();
      return;
    }

    if (field.validation) {
      schemaFields[field.name] = field.validation;
    } else if (field.type === "array" && field.arrayConfig) {
      schemaFields[field.name] = generateArraySchema(field);
    } else if (field.type === "custom") {
      schemaFields[field.name] = generateCustomSchema(field);
    } else if (field.type === "image") {
      schemaFields[field.name] = generateImageSchema(field);
    } else if (field.type === "daterange") {
      schemaFields[field.name] = generateDateRangeSchema(field);
    } else {
      schemaFields[field.name] = generateBasicSchema(field);
    }
  });

  return z.object(schemaFields);
}

function generateArraySchema(field: FormField) {
  const itemSchema: Record<string, z.ZodType<any>> = {};
  field.arrayConfig!.fields.forEach((subField) => {
    if (subField.validation) {
      itemSchema[subField.name] = subField.validation;
    } else {
      itemSchema[subField.name] = generateSubFieldSchema(subField);
    }
  });

  const arraySchema = z.array(z.object(itemSchema));
  let constrainedSchema = arraySchema;

  if (field.arrayConfig!.minItems) {
    constrainedSchema = constrainedSchema.min(
      field.arrayConfig!.minItems,
      `At least ${field.arrayConfig!.minItems} item(s) required`,
    );
  }
  if (field.arrayConfig!.maxItems) {
    constrainedSchema = constrainedSchema.max(
      field.arrayConfig!.maxItems,
      `Maximum ${field.arrayConfig!.maxItems} item(s) allowed`,
    );
  }

  if (field.required) {
    constrainedSchema = constrainedSchema.min(1, `${field.label} is required`);
  }

  return constrainedSchema;
}

function generateCustomSchema(field: FormField) {
  if (field.validation) return field.validation;

  if (field.required) {
    return z.any().refine(
      (val) => {
        if (val === undefined || val === null) return false;
        if (typeof val === "string") return val.trim().length > 0;
        if (Array.isArray(val)) return val.length > 0;
        return true;
      },
      { message: `${field.label} is required` },
    );
  }

  return z.any().optional();
}

function generateImageSchema(field: FormField) {
  if (field.required) {
    return z.any().refine(
      (val) => {
        if (!val) return false;
        if (Array.isArray(val)) return val.length > 0;
        if (typeof val === "string") return val.trim().length > 0;
        return true;
      },
      { message: `${field.label} is required` },
    );
  }
  return z.any().optional();
}

function generateDateRangeSchema(field: FormField) {
  if (field.required) {
    if (field.dateRangeConfig?.range) {
      return z
        .object({
          startDate: z.date({ required_error: "Start date is required" }),
          endDate: z.date({ required_error: "End date is required" }),
        })
        .refine(
          (data) => data.endDate >= data.startDate,
          "End date must be after start date",
        );
    } else {
      return z.date({
        required_error: `${field.label} is required`,
      });
    }
  } else {
    if (field.dateRangeConfig?.range) {
      return z
        .object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
        .optional();
    } else {
      return z.date().optional();
    }
  }
}

function generateBasicSchema(field: FormField) {
  let fieldSchema: z.ZodType<any>;

  switch (field.type) {
    case "email":
      fieldSchema = z.string().email("Invalid email address");
      break;
    case "number":
      let numberSchema = z.number();
      if (field.min !== undefined) {
        numberSchema = numberSchema.min(Number(field.min));
      }
      if (field.max !== undefined) {
        numberSchema = numberSchema.max(Number(field.max));
      }
      fieldSchema = numberSchema;
      break;
    case "date":
    case "datetime":
      fieldSchema = z.string();
      break;
    case "checkbox":
      fieldSchema = z.boolean();
      break;
    case "multiselect":
      fieldSchema = z.array(z.string());
      break;
    case "file":
      fieldSchema = z.any();
      break;
    case "paginatedSelect":
      fieldSchema = z.any().optional();
      break;
    default:
      fieldSchema = z.string();
  }

  if (field.required) {
    if (field.type === "checkbox") {
      fieldSchema = fieldSchema.refine(
        (val) => val === true,
        "This field is required",
      );
    } else if (field.type === "number") {
      fieldSchema = fieldSchema.refine(
        (val) => val !== undefined && val !== null,
        `${field.label} is required`,
      );
    } else if (
      field.type !== "file" &&
      field.type !== "image" &&
      field.type !== "paginatedSelect"
    ) {
      fieldSchema = fieldSchema.min(1, `${field.label} is required`);
    }
  } else {
    fieldSchema = fieldSchema.optional();
  }

  return fieldSchema;
}

function generateSubFieldSchema(subField: FormField) {
  let subFieldSchema: z.ZodType<any>;

  switch (subField.type) {
    case "email":
      subFieldSchema = z.string().email("Invalid email address");
      break;
    case "number":
      let numberSchema = z.number();
      if (subField.min !== undefined) {
        numberSchema = numberSchema.min(Number(subField.min));
      }
      if (subField.max !== undefined) {
        numberSchema = numberSchema.max(Number(subField.max));
      }
      subFieldSchema = numberSchema;
      break;
    case "checkbox":
      subFieldSchema = z.boolean();
      break;
    case "radio":
      subFieldSchema = z.any().optional();
      break;
    case "image":
      subFieldSchema = z.any().optional();
      break;
    default:
      subFieldSchema = z.string();
  }

  if (
    subField.required &&
    subField.type !== "radio" &&
    subField.type !== "image"
  ) {
    if (subField.type === "checkbox") {
      subFieldSchema = subFieldSchema.refine(
        (val) => val === true,
        "This field is required",
      );
    } else if (subField.type === "number") {
      subFieldSchema = subFieldSchema.refine(
        (val) => val !== undefined && val !== null,
        `${subField.label} is required`,
      );
    } else {
      subFieldSchema = subFieldSchema.min(1, `${subField.label} is required`);
    }
  } else {
    subFieldSchema = subFieldSchema.optional();
  }

  return subFieldSchema;
}
