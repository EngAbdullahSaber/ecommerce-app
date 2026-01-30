// pages/merchants/edit/[id].tsx - Update Merchant Page
"use client";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Globe,
  ArrowLeft,
  Info,
  Shield,
} from "lucide-react";
import { z } from "zod";
import { useToast } from "../../hooks/useToast";
import {
  GetSpecifiedMethod,
  UpdateMethod,
} from "../../services/apis/ApiMethod";
import {
  FormField,
  GenericUpdateForm,
} from "../../components/shared/GenericUpdateForm";
import { useQueryClient } from "@tanstack/react-query";

// Merchant Interface based on your data structure
interface Merchant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  language: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Fetch merchant by ID
const fetchMerchantById = async (id: string): Promise<any> => {
  try {
    const response = await GetSpecifiedMethod(`/merchants/${id}`, "en");

    if (!response || !response.data) {
      throw new Error("Merchant not found");
    }

    const merchant = response.data as Merchant;
    console.log("Merchant data:", merchant);

    // Transform the data for the form
    const transformedData = {
      id: merchant.id,
      firstName: merchant.firstName || "",
      lastName: merchant.lastName || "",
      email: merchant.email || "",
      phone: merchant.phone || "",
      language: merchant.language || "ar",
      isVerified: merchant.isVerified,
      createdAt: new Date(merchant.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      updatedAt: merchant.updatedAt
        ? new Date(merchant.updatedAt).toLocaleDateString("en-US", {
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
    console.error("Error fetching merchant:", error);
    throw error;
  }
};

export default function UpdateMerchantPage() {
  const params = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const merchantId = params.id as string;
  const queryClient = useQueryClient();

  // Define form fields for updating merchant
  const merchantFields: FormField[] = [
    // Basic Information Section Header
    {
      name: "basicInfoHeader",
      label: "Basic Information",
      type: "custom",
      cols: 12,
      render: () => (
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-lg">
              <User size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Merchant Information
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Update merchant personal details
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // First Name
    {
      name: "firstName",
      label: "First Name",
      type: "text",
      placeholder: "Ahmed",
      required: true,
      icon: <User size={18} />,
      cols: 6,
      validation: z.string().min(2, "First name must be at least 2 characters"),
      helperText: "Enter merchant's first name",
    },

    // Last Name
    {
      name: "lastName",
      label: "Last Name",
      type: "text",
      placeholder: "Ali",
      required: true,
      cols: 6,
      validation: z.string().min(2, "Last name must be at least 2 characters"),
      helperText: "Enter merchant's last name",
    },

    // Contact Information Section Header
    {
      name: "contactInfoHeader",
      label: "Contact Information",
      type: "custom",
      cols: 12,
      render: () => (
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 rounded-lg">
              <Mail
                size={20}
                className="text-purple-600 dark:text-purple-400"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Contact Details
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Merchant's contact information (read-only)
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Email (Read-only)
    {
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "ahmed.ali@merchant.com",
      readOnly: true,
      icon: <Mail size={18} />,
      cols: 6,
      validation: z.string().email("Please enter a valid email address"),
      helperText: "Email cannot be changed",
    },

    // Phone Number (Read-only)
    {
      name: "phone",
      label: "Phone Number",
      type: "tel",
      placeholder: "+966501234568",
      readOnly: true,
      icon: <Phone size={18} />,
      cols: 6,
      validation: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"),
      helperText: "Phone number cannot be changed",
    },

    // Account Settings Section Header
    {
      name: "settingsHeader",
      label: "Account Settings",
      type: "custom",
      cols: 12,
      render: () => (
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 rounded-lg">
              <Globe size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Account Preferences
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Update merchant's account preferences
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Language Selection
    {
      name: "language",
      label: "Language Preference",
      type: "select",
      required: true,
      icon: <Globe size={18} />,
      cols: 6,
      options: [
        { label: "العربية (Arabic)", value: "ar" },
        { label: "English", value: "en" },
      ],
      validation: z.enum(["ar", "en"]),
      helperText: "Select merchant's preferred language",
    },

    // Verification Status (Read-only)
    {
      name: "isVerified",
      label: "Verification Status",
      type: "custom",
      cols: 6,
      render: (value: boolean) => (
        <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-500/10 dark:to-green-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
          <Shield
            size={18}
            className={
              value
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            }
          />
          <div>
            <div className="font-medium text-slate-900 dark:text-white">
              {value ? "Verified Account" : "Pending Verification"}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {value
                ? "Account is verified and active"
                : "Account requires verification"}
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
                System Information
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                System metadata about this merchant account
              </p>
            </div>
          </div>
        </div>
      ),
    },

    // Read-only Fields
    {
      name: "createdAt",
      label: "Created At",
      type: "text",
      readOnly: true,
      cols: 6,
      prefix: "📅",
      helperText: "Date and time when this merchant account was created",
    },
    {
      name: "updatedAt",
      label: "Last Updated",
      type: "text",
      readOnly: true,
      cols: 6,
      prefix: "🔄",
      helperText: "Date and time when this merchant account was last updated",
    },
  ];

  // Handle update
  const handleUpdate = async (id: string, data: any) => {
    try {
      console.log("Update called with data:", data);

      // Prepare FormData
      const formData = new FormData();

      // Add merchant data in the required format
      if (data.firstName) {
        formData.append("firstName", data.firstName);
      }
      if (data.lastName) {
        formData.append("lastName", data.lastName);
      }
      if (data.language) {
        formData.append("language", data.language);
      }

      const requestData: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        language: data.language,
      };
      // Make API call
      const response = await UpdateMethod(`/merchants`, requestData, id, "en");

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
    queryClient.invalidateQueries({ queryKey: ["merchants"] });
    queryClient.invalidateQueries({ queryKey: ["merchant", merchantId] });
    toast.success("Merchant updated successfully!", { duration: 2000 });

    // Redirect after delay
    setTimeout(() => {
      navigate("/merchants");
    }, 1500);
  };

  const handleAfterError = (error: any) => {
    console.error("Update failed:", error);
    toast.error(
      error.message || "Failed to update merchant. Please try again."
    );
  };

  // Transform data before submission
  const beforeSubmit = (data: any) => {
    console.log("Before submit data:", data);

    // Remove display-only fields
    const { createdAt, updatedAt, email, phone, isVerified, id, ...rest } =
      data;

    console.log("After transformation:", rest);
    return rest;
  };

  if (!merchantId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/30 p-4 md:p-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Merchant Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            The merchant ID is missing or invalid.
          </p>
          <button
            onClick={() => navigate("/merchants")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Merchants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/merchants")}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors duration-200 group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Merchants
        </button>

        <GenericUpdateForm
          title={`Update Merchant`}
          description="Edit merchant details and save changes. Note: Email and phone number cannot be changed."
          fields={merchantFields}
          entityId={merchantId}
          fetchData={fetchMerchantById}
          onUpdate={handleUpdate}
          onCancel={() => navigate("/merchants")}
          onBack={() => navigate("/merchants")}
          submitLabel="Save Changes"
          cancelLabel="Cancel"
          showBackButton={true}
          className="mb-8"
          afterSuccess={handleAfterSuccess}
          afterError={handleAfterError}
          beforeSubmit={beforeSubmit}
          // Add custom validation if needed
          customValidation={(data: any) => {
            const errors: Record<string, string> = {};

            // Add any custom validation here
            if (data.firstName && data.firstName.trim().length < 2) {
              errors.firstName = "First name must be at least 2 characters";
            }

            if (data.lastName && data.lastName.trim().length < 2) {
              errors.lastName = "Last name must be at least 2 characters";
            }

            return errors;
          }}
        />
      </div>
    </div>
  );
}
