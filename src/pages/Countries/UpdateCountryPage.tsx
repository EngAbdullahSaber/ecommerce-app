// pages/countries/edit/[id].tsx - Update Country Page
"use client";
import { useParams, useNavigate } from "react-router-dom";
import {
  Globe,
  Flag,
  Languages,
  MapPin,
  ArrowLeft,
  Image,
  Upload,
} from "lucide-react";
import { z } from "zod";
import { useToast } from "../../hooks/useToast";
import { useTranslation } from "react-i18next";
import {
  GetSpecifiedMethod,
  UpdateMethodFormData,
} from "../../services/apis/ApiMethod";
import {
  FormField,
  GenericUpdateForm,
} from "../../components/shared/GenericUpdateForm";
import { useQueryClient } from "@tanstack/react-query"; // Add this import

// Country Interface
interface CountryName {
  arabic: string;
  english: string;
}

interface Country {
  id: number;
  name: CountryName;
  flag: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdById: number;
  updatedById: number | null;
  deletedById: number | null;
}

// Fetch country by ID

export default function UpdateCountryPage() {
  const params = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { t, i18n } = useTranslation();
  const countryId = params.id as string;
  const queryClient = useQueryClient(); // Initialize queryClient
  const lang = i18n.language || "en";

  // Format image URL
  const formatImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return import.meta.env.VITE_IMAGE_BASE_URL + url;
  };
  const fetchCountryById = async (id: string): Promise<any> => {
    try {
      const response = await GetSpecifiedMethod(`/countries/${id}`, lang);

      if (!response || !response.data) {
        throw new Error("Country not found");
      }

      const country = response.data as Country;
      console.log(country);
      // Transform the data for the form
      const transformedData = {
        id: country.id,
        nameEnglish: country?.name?.english,
        nameArabic: country?.name?.arabic,
        flag: import.meta.env.VITE_IMAGE_BASE_URL + country.flag, // This will be the URL string for display
        currentFlag: country.flag, // For display purposes
        createdAt: new Date(country.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      return transformedData;
    } catch (error) {
      console.error("Error fetching country:", error);
      throw error;
    }
  };

  // Define form fields for updating country
  const countryFields: FormField[] = [
    // English and Arabic Names (Editable)
    {
      name: "nameEnglish",
      label: "English Name",
      type: "text",
      placeholder: "United States",
      required: true,
      icon: <Globe size={18} />,
      cols: 6,
      validation: z.string().min(2, "Name must be at least 2 characters"),
    },
    {
      name: "nameArabic",
      label: "اسم الدولة (Arabic)",
      type: "text",
      placeholder: "الولايات المتحدة",
      required: true,
      cols: 6,
      validation: z.string().min(2, "الاسم يجب أن يكون على الأقل حرفين"),
    },

    // Current Flag Display (Read-only)
    {
      name: "currentFlag",
      label: "Current Flag",
      type: "custom",
      cols: 12,
      render: (value, data) => {
        console.log("Current flag render:", value, data);
        const currentFlagUrl = data?.flag ? formatImageUrl(data.flag) : null;

        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10 rounded-lg">
                <Flag size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Current Flag
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  This is the current flag image. Upload a new one to change it.
                </p>
              </div>
            </div>

            <div className="w-full h-48 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-white/30 dark:from-slate-900 dark:to-slate-800/30 flex items-center justify-center p-4">
              {currentFlagUrl ? (
                <img
                  src={currentFlagUrl}
                  alt="Current flag"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-4">
                  <div className="mx-auto w-12 h-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-full flex items-center justify-center mb-2">
                    <Flag
                      size={20}
                      className="text-slate-400 dark:text-slate-500"
                    />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No flag available
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      },
    },

    // Flag Upload Field
    {
      name: "flag",
      label: "New Flag (Optional)",
      type: "file",
      required: false,
      cols: 12,
      accept: ".jpg,.jpeg,.png,.svg,.webp",
      helperText: "Leave empty to keep current flag. JPG, PNG, SVG up to 5MB",
      renderCustom: ({ onChange, value, disabled, data, error }) => {
        console.log("Flag field renderCustom:", { value, data, disabled });

        const currentFlagUrl = data?.flag ? formatImageUrl(data.flag) : null;
        const isFile = value instanceof File;

        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10 rounded-lg">
                <Image size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Update Flag (Optional)
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Upload a new flag image to replace the current one
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* File Upload */}
              <div>
                <label className="block mb-2">
                  <div className="relative cursor-pointer">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.svg,.webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        console.log("File selected:", file);
                        if (file) {
                          // Validate file size (5MB max)
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error("File size must be less than 5MB");
                            return;
                          }

                          // Validate file type
                          const validTypes = [
                            "image/jpeg",
                            "image/png",
                            "image/svg+xml",
                            "image/webp",
                          ];
                          if (!validTypes.includes(file.type)) {
                            toast.error(
                              "Invalid file type. Please upload JPG, PNG, or SVG",
                            );
                            return;
                          }

                          onChange(file);
                        }
                      }}
                      className="sr-only"
                      id="flag-upload-update"
                      disabled={disabled}
                    />
                    <div
                      className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl transition-colors bg-gradient-to-br from-slate-50/50 to-white/50 dark:from-slate-900/50 dark:to-slate-800/50 ${
                        disabled
                          ? "border-slate-200 dark:border-slate-700 opacity-50"
                          : isFile
                            ? "border-green-500 dark:border-green-400"
                            : "border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer"
                      }`}
                      onClick={() => {
                        if (!disabled) {
                          document
                            .getElementById("flag-upload-update")
                            ?.click();
                        }
                      }}
                    >
                      <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10 rounded-full mb-3">
                        <Upload
                          size={24}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                        {isFile
                          ? "Change uploaded file"
                          : "Click to upload new flag"}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        JPG, PNG, SVG up to 5MB
                      </span>
                      {isFile && (
                        <div className="mt-3 px-3 py-1 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-500/10 dark:to-green-500/10 rounded-full">
                          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            ✓ {value.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </label>
                {error && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {error.message as string}
                  </p>
                )}
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Preview
                </label>
                <div className="w-full h-48 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-white/30 dark:from-slate-900 dark:to-slate-800/30 flex items-center justify-center">
                  {isFile ? (
                    <img
                      src={URL.createObjectURL(value)}
                      alt="Flag preview"
                      className="w-full h-full object-contain p-4"
                    />
                  ) : currentFlagUrl ? (
                    <div className="text-center w-full h-full">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 pt-2">
                        Current flag (no changes)
                      </p>
                      <img
                        src={currentFlagUrl}
                        alt="Current flag"
                        className="w-full h-full object-contain p-4"
                      />
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <div className="mx-auto w-12 h-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-full flex items-center justify-center mb-2">
                        <Flag
                          size={20}
                          className="text-slate-400 dark:text-slate-500"
                        />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Upload a new flag to see preview
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      },
    },
  ];

  // Handle update
  const handleUpdate = async (id: string, data: any) => {
    try {
      console.log("Update called with data:", data);

      // Prepare FormData
      const formData = new FormData();

      // Add name data
      if (data.nameEnglish) {
        formData.append("englishName", data.nameEnglish);
      }
      if (data.nameArabic) {
        formData.append("arabicName", data.nameArabic);
      }

      // Add flag file if provided and it's a File object (not the URL string)
      if (data.flag && data.flag instanceof File) {
        formData.append("flag", data.flag);
        console.log("Adding new flag file to FormData");
      } else {
        console.log("No new flag file provided, keeping current flag");
      }

      // Log FormData for debugging
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // Make API call
      const response = await UpdateMethodFormData(
        `/countries`,
        formData,
        id,
        "en",
      );

      console.log("Update response:", response);

      if (!response) {
        throw new Error("No response from server");
      }

      if (response.code !== 200) {
        throw new Error(
          response.message?.english || response.message || "Update failed",
        );
      }

      return response;
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  };

  const handleAfterSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["countries"] });
    toast.success("Country updated successfully!", { duration: 2000 });

    // Redirect after delay
    setTimeout(() => {
      navigate("/countries");
    }, 1500);
  };

  const handleAfterError = (error: any) => {
    console.error("Update failed:", error);
    toast.error(error.message || "Failed to update country. Please try again.");
  };

  // Transform data before submission
  const beforeSubmit = (data: any) => {
    console.log("Before submit data:", data);

    // Remove display-only fields
    const { currentFlag, createdAt, id, ...rest } = data;

    // If flag is not a File object (meaning it's the original URL string), remove it
    if (rest.flag && !(rest.flag instanceof File)) {
      delete rest.flag;
    }

    console.log("After transformation:", rest);
    return rest;
  };

  // Import AlertCircle if not already imported
  const AlertCircle = ({ size }: { size: number }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );

  if (!countryId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/30 p-4 md:p-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Country Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            The country ID is missing or invalid.
          </p>
          <button
            onClick={() => navigate("/countries")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Countries
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
          onClick={() => navigate("/countries")}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors duration-200 group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Countries
        </button>

        <GenericUpdateForm
          title={`Update Country`}
          description="Edit country details and save changes"
          fields={countryFields}
          entityId={countryId}
          fetchData={fetchCountryById}
          onUpdate={handleUpdate}
          onCancel={() => navigate("/countries")}
          onBack={() => navigate("/countries")}
          submitLabel="Save Changes"
          cancelLabel="Cancel"
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
