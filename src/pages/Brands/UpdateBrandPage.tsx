// pages/brands/edit/[id].tsx - Update Brand Page
"use client";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2,
  Upload,
  Image,
  ArrowLeft,
  FileText,
  Globe,
} from "lucide-react";
import { z } from "zod";
import { useToast } from "../../hooks/useToast";
import {
  GetSpecifiedMethod,
  UpdateMethodFormData,
} from "../../services/apis/ApiMethod";
import {
  FormField,
  GenericUpdateForm,
} from "../../components/shared/GenericUpdateForm";
import { useQueryClient } from "@tanstack/react-query";

// Brand Interface
interface Brand {
  id: number;
  title: {
    english: string;
    arabic: string;
  };
  description: {
    english: string;
    arabic: string;
  };
  logo: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdById: number;
  updatedById: number | null;
  deletedById: number | null;
}

// Fetch brand by ID
const fetchBrandById = async (id: string): Promise<any> => {
  try {
    const response = await GetSpecifiedMethod(`/brands/${id}`, "en");

    if (!response || !response.data) {
      throw new Error("Brand not found");
    }

    const brand = response.data as Brand;
    console.log("Fetched brand:", brand);

    // Transform the data for the form
    const transformedData = {
      id: brand.id,
      englishTitle: brand.title.english,
      arabicTitle: brand.title.arabic,
      englishDescription: brand.description.english,
      arabicDescription: brand.description.arabic,
      logo: import.meta.env.VITE_IMAGE_BASE_URL + brand.logo, // URL for display
      currentLogo: brand.logo, // Original logo path
      createdAt: new Date(brand.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    return transformedData;
  } catch (error) {
    console.error("Error fetching brand:", error);
    throw error;
  }
};

export default function UpdateBrandPage() {
  const params = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const brandId = params.id as string;
  const queryClient = useQueryClient();

  // Format image URL
  const formatImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return import.meta.env.VITE_IMAGE_BASE_URL + url;
  };

  // Define form fields for updating brand
  const brandFields: FormField[] = [
    // English Title
    {
      name: "englishTitle",
      label: "English Title",
      type: "text",
      placeholder: "Samsung",
      required: true,
      icon: <Globe size={18} />,
      cols: 6,
      validation: z.string().min(2, "Title must be at least 2 characters"),
    },
    {
      name: "arabicTitle",
      label: "عنوان العلامة التجارية (Arabic)",
      type: "text",
      placeholder: "سامسونج",
      required: true,
      cols: 6,
      validation: z.string().min(2, "العنوان يجب أن يكون على الأقل حرفين"),
    },

    // English Description
    {
      name: "englishDescription",
      label: "Description (English)",
      type: "textarea",
      placeholder: "Updated description...",
      required: true,
      icon: <FileText size={18} />,
      cols: 12,
      rows: 4,
      validation: z
        .string()
        .min(10, "Description must be at least 10 characters"),
    },

    // Arabic Description
    {
      name: "arabicDescription",
      label: "الوصف (Arabic)",
      type: "textarea",
      placeholder: "وصف محدث...",
      required: true,
      cols: 12,
      rows: 4,
      validation: z.string().min(10, "الوصف يجب أن يكون على الأقل 10 أحرف"),
    },

    // Current Logo Display (Read-only)
    {
      name: "currentLogo",
      label: "Current Logo",
      type: "custom",
      cols: 12,
      render: (value, data) => {
        console.log("Current logo render:", value, data);
        const currentLogoUrl = data?.logo ? formatImageUrl(data.logo) : null;

        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-lg">
                <Building2
                  size={20}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Current Logo
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  This is the current logo image. Upload a new one to change it.
                </p>
              </div>
            </div>

            <div className="w-full h-48 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-white/30 dark:from-slate-900 dark:to-slate-800/30 flex items-center justify-center p-4">
              {currentLogoUrl ? (
                <img
                  src={currentLogoUrl}
                  alt="Current logo"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center p-4">
                  <div className="mx-auto w-12 h-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-full flex items-center justify-center mb-2">
                    <Building2
                      size={20}
                      className="text-slate-400 dark:text-slate-500"
                    />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No logo available
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      },
    },

    // Logo Upload Field
    {
      name: "logo",
      label: "New Logo (Optional)",
      type: "file",
      required: false,
      cols: 12,
      accept: ".jpg,.jpeg,.png,.svg,.webp",
      helperText:
        "Leave empty to keep current logo. JPG, PNG, SVG, WEBP up to 5MB",
      renderCustom: ({ onChange, value, disabled, data, error }) => {
        console.log("Logo field renderCustom:", { value, data, disabled });

        const currentLogoUrl = data?.logo ? formatImageUrl(data.logo) : null;
        const isFile = value instanceof File;

        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-lg">
                <Image
                  size={20}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Update Logo (Optional)
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Upload a new logo image to replace the current one
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
                              "Invalid file type. Please upload JPG, PNG, SVG, or WEBP",
                            );
                            return;
                          }

                          onChange(file);
                        }
                      }}
                      className="sr-only"
                      id="logo-upload-update"
                      disabled={disabled}
                    />
                    <div
                      className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl transition-colors bg-gradient-to-br from-slate-50/50 to-white/50 dark:from-slate-900/50 dark:to-slate-800/50 ${
                        disabled
                          ? "border-slate-200 dark:border-slate-700 opacity-50"
                          : isFile
                            ? "border-green-500 dark:border-green-400"
                            : "border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 cursor-pointer"
                      }`}
                      onClick={() => {
                        if (!disabled) {
                          document
                            .getElementById("logo-upload-update")
                            ?.click();
                        }
                      }}
                    >
                      <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-full mb-3">
                        <Upload
                          size={24}
                          className="text-indigo-600 dark:text-indigo-400"
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                        {isFile
                          ? "Change uploaded file"
                          : "Click to upload new logo"}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        JPG, PNG, SVG, WEBP up to 5MB
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
                    <div className="w-full h-full p-4 flex items-center justify-center">
                      <img
                        src={URL.createObjectURL(value)}
                        alt="Logo preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ) : currentLogoUrl ? (
                    <div className="text-center w-full h-full">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 pt-2">
                        Current logo (no changes)
                      </p>
                      <div className="w-full h-full p-4 flex items-center justify-center">
                        <img
                          src={currentLogoUrl}
                          alt="Current logo"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <div className="mx-auto w-12 h-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-full flex items-center justify-center mb-2">
                        <Building2
                          size={20}
                          className="text-slate-400 dark:text-slate-500"
                        />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Upload a new logo to see preview
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Logo Requirements */}
            <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-900/20 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Logo Requirements:
              </h4>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                <li>Use transparent background (PNG format recommended)</li>
                <li>Minimum dimensions: 200x200 pixels</li>
                <li>Maximum file size: 5MB</li>
                <li>Supported formats: JPG, PNG, SVG, WEBP</li>
                <li>Square or landscape orientation preferred</li>
              </ul>
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

      // Add brand data
      if (data.englishTitle) {
        formData.append("englishTitle", data.englishTitle);
      }
      if (data.arabicTitle) {
        formData.append("arabicTitle", data.arabicTitle);
      }
      if (data.englishDescription) {
        formData.append("englishDescription", data.englishDescription);
      }
      if (data.arabicDescription) {
        formData.append("arabicDescription", data.arabicDescription);
      }

      // Add logo file if provided and it's a File object
      if (data.logo && data.logo instanceof File) {
        formData.append("logo", data.logo);
        console.log("Adding new logo file to FormData");
      } else {
        console.log("No new logo file provided, keeping current logo");
      }

      // Log FormData for debugging
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // Make API call
      const response = await UpdateMethodFormData(
        `/brands`,
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
    // Invalidate brands query to refresh the list
    queryClient.invalidateQueries({ queryKey: ["brands"] });
    toast.success("Brand updated successfully!", { duration: 2000 });

    // Redirect after delay
    setTimeout(() => {
      navigate("/brands");
    }, 1500);
  };

  const handleAfterError = (error: any) => {
    console.error("Update failed:", error);
    toast.error(error.message || "Failed to update brand. Please try again.");
  };

  // Transform data before submission
  const beforeSubmit = (data: any) => {
    console.log("Before submit data:", data);

    // Remove display-only fields
    const { currentLogo, createdAt, id, ...rest } = data;

    // If logo is not a File object (meaning it's the original URL string), remove it
    if (rest.logo && !(rest.logo instanceof File)) {
      delete rest.logo;
    }

    console.log("After transformation:", rest);
    return rest;
  };

  // AlertCircle icon component
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

  if (!brandId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-indigo-950/30 dark:to-purple-950/30 p-4 md:p-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Brand Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            The brand ID is missing or invalid.
          </p>
          <button
            onClick={() => navigate("/brands")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Brands
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-indigo-950/30 dark:to-purple-950/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/brands")}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors duration-200 group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Brands
        </button>

        <GenericUpdateForm
          title={`Update Brand`}
          description="Edit brand details and save changes"
          fields={brandFields}
          entityId={brandId}
          fetchData={fetchBrandById}
          onUpdate={handleUpdate}
          onCancel={() => navigate("/brands")}
          onBack={() => navigate("/brands")}
          submitLabel="Save Changes"
          cancelLabel="Cancel"
          showBackButton={true}
          className="mb-8"
          afterSuccess={handleAfterSuccess}
          afterError={handleAfterError}
          beforeSubmit={beforeSubmit}
        />

        {/* Additional Information */}
        <div className="mt-8 p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            About Brand Updates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Title Updates
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Brand titles should be accurate and match the official brand
                name in each language.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Logo Updates
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                When updating a logo, ensure it meets the requirements for
                optimal display across all platforms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
