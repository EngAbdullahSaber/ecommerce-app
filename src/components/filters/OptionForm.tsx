// components/filters/OptionForm.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../hooks/useToast";
import { useTranslation } from "react-i18next";
import { X, Tag } from "lucide-react";

interface OptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  attribute: {
    id: number;
    name: string;
  } | null;
  option: {
    id: number;
    value: string;
    name: string;
    sortOrder: number;
    isActive: boolean;
  } | null;
  onSuccess: () => void;
}

interface OptionFormData {
  value: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export default function OptionForm({
  isOpen,
  onClose,
  attribute,
  option,
  onSuccess,
}: OptionFormProps) {
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
  } = useForm<OptionFormData>({
    defaultValues: {
      value: "",
      name: "",
      sortOrder: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (option) {
      setValue("value", option.value);
      setValue("name", option.name);
      setValue("sortOrder", option.sortOrder);
      setValue("isActive", option.isActive);
    } else {
      reset({
        value: "",
        name: "",
        sortOrder: 0,
        isActive: true,
      });
    }
  }, [option, setValue, reset]);

  const generateValueFromName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  const handleNameChange = (name: string) => {
    if (!option) {
      setValue("value", generateValueFromName(name));
    }
  };

  const createOptionMutation = useMutation({
    onSuccess: (response) => {
      if (response?.code === 201) {
        toast.success(t("filters.options.createSuccess"));
        onSuccess();
      } else {
        toast.error(
          response?.message?.english || t("filters.options.createError"),
        );
      }
    },
    onError: (error) => {
      console.error("Error creating option:", error);
      toast.error(t("filters.options.createError"));
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const updateOptionMutation = useMutation({
    onSuccess: (response) => {
      if (response?.code === 200) {
        toast.success(t("filters.options.updateSuccess"));
        onSuccess();
      } else {
        toast.error(
          response?.message?.english || t("filters.options.updateError"),
        );
      }
    },
    onError: (error) => {
      console.error("Error updating option:", error);
      toast.error(t("filters.options.updateError"));
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: OptionFormData) => {
    if (!attribute) return;

    setIsSubmitting(true);

    if (option) {
      updateOptionMutation.mutate(data);
    } else {
      createOptionMutation.mutate(data);
    }
  };

  if (!isOpen || !attribute) return null;

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
              <div className="p-2 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-lg">
                <Tag
                  size={20}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {option
                    ? t("filters.options.form.editTitle")
                    : t("filters.options.form.createTitle")}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t("filters.options.form.forAttribute")}: {attribute.name}
                </p>
              </div>
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
                {t("filters.options.form.name")} *
              </label>
              <input
                type="text"
                {...register("name", {
                  required: t("filters.options.form.errors.nameRequired"),
                  onChange: (e) => handleNameChange(e.target.value),
                })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.name
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-500"
                } bg-white dark:bg-slate-700 text-slate-900 dark:text-white`}
                placeholder={t("filters.options.form.namePlaceholder")}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Value */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t("filters.options.form.value")} *
              </label>
              <input
                type="text"
                {...register("value", {
                  required: t("filters.options.form.errors.valueRequired"),
                  pattern: {
                    value: /^[a-z0-9_]+$/,
                    message: t("filters.options.form.errors.valuePattern"),
                  },
                })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.value
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-500"
                } bg-white dark:bg-slate-700 text-slate-900 dark:text-white`}
                placeholder="red_blue_green"
              />
              {errors.value && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.value.message}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {t("filters.options.form.valueHint")}
              </p>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t("filters.options.form.sortOrder")}
              </label>
              <input
                type="number"
                {...register("sortOrder", {
                  valueAsNumber: true,
                  min: {
                    value: 0,
                    message: t("filters.options.form.errors.sortOrderMin"),
                  },
                })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.sortOrder
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-500"
                } bg-white dark:bg-slate-700 text-slate-900 dark:text-white`}
                placeholder="0"
              />
              {errors.sortOrder && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.sortOrder.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                {...register("isActive")}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t("filters.options.form.active")}
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
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-lg transition-all disabled:opacity-50"
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
                ) : option ? (
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
