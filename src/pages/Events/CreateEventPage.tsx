// pages/create-event.tsx - Updated with translations
"use client";
import { useState } from "react";
import { GenericForm, FormField } from "../../components/shared/GenericForm";
import { z } from "zod";
import {
  Calendar,
  Clock,
  Users,
  Globe,
  Lock,
  ArrowLeft,
  Tag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CreateMethod } from "../../services/apis/ApiMethod";
import { useToast } from "../../hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export default function CreateEventPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [isLoading, setIsLoading] = useState(false);

  // Define event type options
  const eventTypeOptions = [
    { value: "Birthday", label: t("events.types.Birthday") },
    { value: "Party", label: t("events.types.Party") },
    { value: "Conference", label: t("events.types.Conference") },
    { value: "Meeting", label: t("events.types.Meeting") },
    { value: "Wedding", label: t("events.types.Wedding") },
    { value: "Concert", label: t("events.types.Concert") },
    { value: "Seminar", label: t("events.types.Seminar") },
    { value: "Workshop", label: t("events.types.Workshop") },
    { value: "Networking", label: t("events.types.Networking") },
    { value: "Festival", label: t("events.types.Festival") },
  ];

  // Define form fields for creating an event
  const eventFields: FormField[] = [
    // English Title
    {
      name: "titleEnglish",
      label: t("events.form.titleEnglish"),
      type: "text",
      placeholder: t("events.form.placeholderTitleEnglish"),
      required: true,
      icon: <Calendar size={18} />,
      cols: 6,
      validation: z.string().min(2, t("events.validations.titleMin")),
    },

    // Arabic Title
    {
      name: "titleArabic",
      label: t("events.form.titleArabic"),
      type: "text",
      placeholder: t("events.form.placeholderTitleArabic"),
      required: true,
      cols: 6,
      validation: z.string().min(2, t("events.validations.titleMinAr")),
    },

    // Event Date
    {
      name: "eventDate",
      label: t("events.form.eventDate"),
      type: "datetime-local",
      required: true,
      icon: <Clock size={18} />,
      cols: 6,
      validation: z.string().min(1, t("events.validations.selectDate")),
      helperText: t("events.form.helper.eventDate"),
      min: new Date().toISOString().slice(0, 16),
    },

    // Event Type
    {
      name: "eventType",
      label: t("events.form.eventType"),
      type: "select",
      required: true,
      placeholder: t("events.form.placeholderEventType"),
      icon: <Tag size={18} />,
      cols: 6,
      options: eventTypeOptions,
      validation: z.string().min(1, t("events.validations.selectType")),
      helperText: t("events.form.helper.eventType"),
    },

    // Visibility (Public/Private)
    {
      name: "isPublic",
      label: t("events.form.visibility"),
      type: "radio",
      required: true,
      cols: 6,
      options: [
        {
          value: "true",
          label: t("events.form.public"),
          icon: <Globe size={16} />,
        },
        {
          value: "false",
          label: t("events.form.private"),
          icon: <Lock size={16} />,
        },
      ],
      defaultValue: "true",
      validation: z.string().min(1, t("events.validations.selectVisibility")),
      helperText: t("events.form.helper.visibility"),
    },

    // Status (Active/Inactive)
    {
      name: "isActive",
      label: t("events.form.status"),
      type: "radio",
      required: false,
      cols: 6,
      options: [
        { value: "true", label: t("common.active"), icon: <Globe size={16} /> },
        {
          value: "false",
          label: t("common.inactive"),
          icon: <Lock size={16} />,
        },
      ],
      validation: z.string().min(1, t("events.validations.selectStatus")),
      helperText: t("events.form.helper.status"),
    },
  ];

  // Default values for the form
  const defaultValues = {
    titleEnglish: "",
    titleArabic: "",
    eventDate: "",
    eventType: "",
    isPublic: true,
    isActive: true,
  };

  // Handle form submission
  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    const loadingToast = toast.loading(t("events.form.creating"));

    try {
      const requestData: any = {
        title: {
          english: data.titleEnglish,
          arabic: data.titleArabic,
        },
        eventDate: new Date(data.eventDate).toISOString(),
        eventType: data.eventType,
        isPublic: data.isPublic == "true" ? true : false,
        isActive: data.isActive == "true" ? true : false,
      };

      const result = await CreateMethod("/events", requestData, lang);

      if (!result) {
        throw new Error(
          t("events.form.createError", { message: "No response from server" })
        );
      }

      toast.dismiss(loadingToast);
      toast.success(t("events.form.createSuccess"), { duration: 2000 });

      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["all-events"] });

      setTimeout(() => {
        navigate("/events");
      }, 1500);

      return result;
    } catch (error: any) {
      console.error("Failed to create event:", error);
      toast.dismiss(loadingToast);

      let errorMessage = t("messages.error");
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      toast.error(t("events.form.createError", { message: errorMessage }), {
        duration: 3000,
      });

      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 dark:from-slate-950 dark:via-purple-950/30 dark:to-pink-950/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/events")}
          disabled={isLoading}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          {t("events.backToList")}
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl">
              <Calendar size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 dark:from-slate-100 dark:via-purple-100 dark:to-pink-100 bg-clip-text text-transparent">
                {t("events.createTitle")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("events.createSubtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden">
          <div className="p-8">
            <GenericForm
              title={t("events.form.title")}
              description={t("events.form.description")}
              fields={eventFields}
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              onCancel={() => navigate("/events")}
              submitLabel={t("events.form.submitCreate")}
              cancelLabel={t("common.cancel")}
              isLoading={isLoading}
              mode="create"
              className="group"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
