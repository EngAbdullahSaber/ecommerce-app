// components/filters/AttributeForm.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../hooks/useToast";
import { useTranslation } from "react-i18next";
import { X, Filter } from "lucide-react";

interface AttributeFormProps {
  isOpen: boolean;
  onClose: () => void;
  attribute: {
    id: number;
    key: string;
    name: string;
    sourcePath: string | null;
    isActive: boolean;
  } | null;
  onSuccess: () => void;
}

interface AttributeFormData {
  key: string;
  name: string;
  sourcePath: string;
  isActive: boolean;
}

export default function AttributeForm({
  isOpen,
  onClose,
  attribute,
  onSuccess,
}: AttributeFormProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<AttributeFormData>({
    defaultValues: {
      key: "",
      name: "",
      sourcePath: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (attribute) {
      setValue("key", attribute.key);
      setValue("name", attribute.name);
      setValue("sourcePath", attribute.sourcePath || "");
      setValue("isActive", attribute.isActive);
    } else {
      reset({
        key: "",
        name: "",
        sourcePath: "",
        isActive: true,
      });
    }
  }, [attribute, setValue, reset]);

  const generateKeyFromName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  const handleNameChange = (name: string) => {
    if (!attribute) {
      setValue("key", generateKeyFromName(name));
    }
  };

  const createAttributeMutation = useMutation({
    onSuccess: (response) => {
      if (response?.code === 201) {
        toast.success(t("filters.attributes.createSuccess"));
        onSuccess();
      } else {
        toast.error(
          response?.message?.english || t("filters.attributes.createError"),
        );
      }
    },
    onError: (error) => {
      console.error("Error creating attribute:", error);
      toast.error(t("filters.attributes.createError"));
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const updateAttributeMutation = useMutation({
    onSuccess: (response) => {
      if (response?.code === 200) {
        toast.success(t("filters.attributes.updateSuccess"));
        onSuccess();
      } else {
        toast.error(
          response?.message?.english || t("filters.attributes.updateError"),
        );
      }
    },
    onError: (error) => {
      console.error("Error updating attribute:", error);
      toast.error(t("filters.attributes.updateError"));
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: AttributeFormData) => {
    setIsSubmitting(true);

    const submitData = {
      ...data,
      sourcePath: data.sourcePath || null,
    };

    if (attribute) {
      updateAttributeMutation.mutate(submitData);
    } else {
      createAttributeMutation.mutate(submitData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-slate-800 rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg">
                <Filter
                  size={20}
                  className="text-purple-600 dark:text-purple-400"
                />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {attribute
                  ? t("filters.attributes.form.editTitle")
                  : t("filters.attributes.form.createTitle")}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t("filters.attributes.form.name")} *
              </label>
              <input
                type="text"
                {...register("name", {
                  required: t("filters.attributes.form.errors.nameRequired"),
                  onChange: (e) => handleNameChange(e.target.value),
                })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.name
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-slate-300 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500"
                } bg-white dark:bg-slate-700 text-slate-900 dark:text-white`}
                placeholder={t("filters.attributes.form.namePlaceholder")}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Key */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t("filters.attributes.form.key")} *
              </label>
              <input
                type="text"
                {...register("key", {
                  required: t("filters.attributes.form.errors.keyRequired"),
                  pattern: {
                    value: /^[a-z0-9_]+$/,
                    message: t("filters.attributes.form.errors.keyPattern"),
                  },
                })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.key
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-slate-300 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500"
                } bg-white dark:bg-slate-700 text-slate-900 dark:text-white`}
                placeholder="color_size_material"
              />
              {errors.key && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.key.message}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {t("filters.attributes.form.keyHint")}
              </p>
            </div>

            {/* Source Path */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t("filters.attributes.form.sourcePath")}
              </label>
              <input
                type="text"
                {...register("sourcePath")}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-purple-500 focus:ring-purple-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="/api/products/attributes"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {t("filters.attributes.form.sourcePathHint")}
              </p>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                {...register("isActive")}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t("filters.attributes.form.active")}
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="w-4 h-4 mr-2 animate-spin"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    {t("common.saving")}
                  </span>
                ) : attribute ? (
                  t("common.update")
                ) : (
                  t("common.create")
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
