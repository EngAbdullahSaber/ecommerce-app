// pages/events/edit/[id].tsx - Update Event Page
"use client";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Globe,
  ArrowLeft,
  Info,
  Eye,
  EyeOff,
  Lock,
  Unlock,
} from "lucide-react";
import { z } from "zod";
import { useToast } from "../../hooks/useToast";
import {
  GetSpecifiedMethod,
  UpdateMethod,
  UpdateMethodFormData,
} from "../../services/apis/ApiMethod";
import {
  FormField,
  GenericUpdateForm,
} from "../../components/shared/GenericUpdateForm";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

// Event Interface based on your data structure
interface EventTitle {
  english: string;
  arabic: string;
}

interface Event {
  id: number;
  title: EventTitle;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdById: number;
  updatedById: number | null;
  deletedById: number | null;
}

// Fetch event by ID
const fetchEventById = async (id: string, lang: string): Promise<any> => {
  try {
    const response = await GetSpecifiedMethod(`/events/${id}`, lang);

    if (!response || !response.data) {
      throw new Error("Event not found");
    }

    const event = response.data as Event;
    console.log("Event data:", event);

    // Transform the data for the form
    const transformedData = {
      id: event.id,
      titleEnglish: event?.title?.english || "",
      titleArabic: event?.title?.arabic || "",
      isPublic: event.isPublic || false,
      createdAt: new Date(event.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      updatedAt: event.updatedAt
        ? new Date(event.updatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Never updated",
    };

    return transformedData;
  } catch (error) {
    console.error("Error fetching event:", error);
    throw error;
  }
};

export default function UpdateEventPage() {
  const params = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const eventId = params.id as string;
  const queryClient = useQueryClient();

  // Define form fields for updating event
  const eventFields: FormField[] = [
    // Basic Information Section Header
    {
      name: "basicInfoHeader",
      label: "Event Information",
      type: "custom",
      cols: 12,
      render: () => (
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10 rounded-lg">
              <Calendar
                size={20}
                className="text-blue-600 dark:text-blue-400"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t("events.form.eventDetails")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("events.form.updateEventDetails")}
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Event Titles (Editable)
    {
      name: "titleEnglish",
      label: t("events.form.englishTitle"),
      type: "text",
      placeholder: "Birthday Celebration",
      required: true,
      icon: <Globe size={18} />,
      cols: 6,
      validation: z.string().min(2, t("events.form.titleMinLength")),
      helperText: t("events.form.englishTitleHelper"),
    },
    {
      name: "titleArabic",
      label: t("events.form.arabicTitle"),
      type: "text",
      placeholder: "احتفال عيد ميلاد",
      required: true,
      cols: 6,
      validation: z.string().min(2, t("events.form.titleMinLength")),
      helperText: t("events.form.arabicTitleHelper"),
    },

    // Visibility Settings Section Header
    {
      name: "visibilityHeader",
      label: "Visibility Settings",
      type: "custom",
      cols: 12,
      render: () => (
        <div className="space-y-3 mb-6 mt-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 rounded-lg">
              <Eye size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t("events.form.visibility")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("events.form.controlVisibility")}
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Public/Private Toggle
    {
      name: "isPublic",
      label: t("events.form.eventVisibility"),
      type: "switch",
      required: true,
      cols: 12,
      validation: z.boolean(),
      helperText: t("events.form.makePublicOrPrivate"),
      render: (field: any, value: boolean, onChange: any) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  value
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-red-100 dark:bg-red-900/30"
                }`}
              >
                {value ? (
                  <Unlock
                    size={20}
                    className="text-green-600 dark:text-green-400"
                  />
                ) : (
                  <Lock size={20} className="text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">
                  {value
                    ? t("events.form.publicEvent")
                    : t("events.form.privateEvent")}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {value
                    ? t("events.form.visibleToEveryone")
                    : t("events.form.visibleToSelectedUsers")}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`p-4 rounded-lg border transition-all ${
                value
                  ? "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800"
                  : "border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Unlock
                  size={16}
                  className={
                    value
                      ? "text-green-600 dark:text-green-400"
                      : "text-slate-400"
                  }
                />
                <span
                  className={`font-medium ${
                    value
                      ? "text-green-700 dark:text-green-300"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {t("events.form.publicEvent")}
                </span>
              </div>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• {t("events.form.visibleToAll")}</li>
                <li>• {t("events.form.appearsInListings")}</li>
                <li>• {t("events.form.noRestrictions")}</li>
              </ul>
            </div>

            <div
              className={`p-4 rounded-lg border transition-all ${
                !value
                  ? "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                  : "border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Lock
                  size={16}
                  className={
                    !value ? "text-red-600 dark:text-red-400" : "text-slate-400"
                  }
                />
                <span
                  className={`font-medium ${
                    !value
                      ? "text-red-700 dark:text-red-300"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {t("events.form.privateEvent")}
                </span>
              </div>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• {t("events.form.onlySelectedUsers")}</li>
                <li>• {t("events.form.notInPublicListings")}</li>
                <li>• {t("events.form.requiresPermission")}</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },

    // Metadata Section Header
    {
      name: "metadataHeader",
      label: "Metadata",
      type: "custom",
      cols: 12,
      render: () => (
        <div className="space-y-3 mb-6 mt-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-500/10 dark:to-gray-500/10 rounded-lg">
              <Info size={20} className="text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t("common.metadata")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("events.form.systemInformation")}
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Read-only Fields
    {
      name: "createdAt",
      label: t("common.createdAt"),
      type: "text",
      readOnly: true,
      cols: 6,
      prefix: "📅",
      helperText: t("events.form.createdAtHelper"),
    },
    {
      name: "updatedAt",
      label: t("common.lastUpdated"),
      type: "text",
      readOnly: true,
      cols: 6,
      prefix: "🔄",
      helperText: t("events.form.updatedAtHelper"),
    },
  ];

  // Handle update
  const handleUpdate = async (id: string, data: any) => {
    try {
      const requestData: any = {
        title: {
          english: data.titleEnglish,
          arabic: data.titleArabic,
        },
        isPublic: data.isPublic == "true" ? true : false, // Convert to boolean
      };
      // Make API call
      const response = await UpdateMethod(`/events`, requestData, id, lang);

      console.log("Update response:", response);

      if (!response) {
        throw new Error("No response from server");
      }

      if (response.code !== 200) {
        throw new Error(
          response.message?.english || response.message || "Update failed"
        );
      }

      return response;
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  };

  const handleAfterSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["events"] });
    toast.success(t("events.messages.updateSuccess"), { duration: 2000 });

    // Redirect after delay
    setTimeout(() => {
      navigate("/events");
    }, 1500);
  };

  const handleAfterError = (error: any) => {
    console.error("Update failed:", error);
    toast.error(error.message || t("events.messages.updateFailed"));
  };

  // Transform data before submission
  const beforeSubmit = (data: any) => {
    console.log("Before submit data:", data);

    // Remove display-only fields
    const { createdAt, updatedAt, id, ...rest } = data;

    // Ensure isPublic is boolean
    if (typeof rest.isPublic === "string") {
      rest.isPublic = rest.isPublic === "true";
    }

    console.log("After transformation:", rest);
    return rest;
  };

  if (!eventId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/30 p-4 md:p-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("events.messages.eventNotFound")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {t("events.messages.eventIdMissing")}
          </p>
          <button
            onClick={() => navigate("/events")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("events.messages.backToEvents")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/events")}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors duration-200 group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          {t("events.messages.backToEvents")}
        </button>

        <GenericUpdateForm
          title={t("events.form.updateEvent")}
          description={t("events.form.editEventDetails")}
          fields={eventFields}
          entityId={eventId}
          fetchData={(id) => fetchEventById(id, lang)}
          onUpdate={handleUpdate}
          onCancel={() => navigate("/events")}
          onBack={() => navigate("/events")}
          submitLabel={t("common.saveChanges")}
          cancelLabel={t("common.cancel")}
          showBackButton={true}
          className="mb-8"
          afterSuccess={handleAfterSuccess}
          afterError={handleAfterError}
          beforeSubmit={beforeSubmit}
        />
      </div>
    </div>
  );
}
