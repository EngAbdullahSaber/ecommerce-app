import { useState, useEffect } from "react";
import { z } from "zod";
import {
  Users,
  ArrowLeft,
  UserPlus,
  UserCheck,
  Mail,
  Phone,
  Lock,
  Type,
  ImageIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  CreateMethod,
  GetPanigationMethod,
} from "../../../services/apis/ApiMethod";
import { useToast } from "../../../hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { CreateForm } from "../../../components/shared/GenericForm/CreateForm";
import { FormField, PaginatedSelectConfig } from "../../../components/shared/GenericForm";

export default function CreateInfluencerPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<"NEW" | "EXISTING">("NEW");
  const [formFields, setFormFields] = useState<FormField[]>([]);

  const userPaginatedConfig: PaginatedSelectConfig = {
    endpoint: "home-page/admin/users",
    searchParam: "search",
    labelKey: "email",
    valueKey: "id",
    pageSize: 10,
    debounceTime: 500,
    transformResponse: (data: any) => {
      const users = data.users || data.data || data || [];
      return users.map((user: any) => ({
        label: `${user.firstName} ${user.lastName} (${user.email})`,
        value: user.id.toString(),
        rawData: user,
      }));
    },
  };

  const fetchOptions = async (endpoint: string, params: any) => {
    try {
      const response = await GetPanigationMethod(
        endpoint,
        params.page,
        params.pageSize,
        lang,
        params.search || ""
      );
      return response;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  };

  const handleFieldChange = (name: string, value: any) => {
    if (name === "userType") {
      setUserType(value);
    }
  };

  useEffect(() => {
    const baseFields: FormField[] = [];

    const newUserFields: FormField[] = [
      {
        name: "firstName",
        label: t("influencers.create.form.firstName"),
        type: "text",
        required: true,
        cols: 6,
        validation: z.string().min(1, t("influencers.create.validations.firstNameRequired")),
      },
      {
        name: "lastName",
        label: t("influencers.create.form.lastName"),
        type: "text",
        required: true,
        cols: 6,
        validation: z.string().min(1, t("influencers.create.validations.lastNameRequired")),
      },
      {
        name: "email",
        label: t("influencers.create.form.email"),
        type: "text",
        required: true,
        icon: <Mail size={18} />,
        cols: 6,
        validation: z.string().email(t("influencers.create.validations.emailRequired")),
      },
      {
        name: "phone",
        label: t("influencers.create.form.phone"),
        type: "text",
        required: true,
        icon: <Phone size={18} />,
        cols: 6,
        validation: z.string().min(1, t("influencers.create.validations.phoneRequired")),
      },
      {
        name: "password",
        label: t("influencers.create.form.password"),
        type: "password",
        required: true,
        icon: <Lock size={18} />,
        cols: 12,
        validation: z.string().min(8, t("influencers.create.validations.passwordRequired")),
      },
    ];

    const existingUserFields: FormField[] = [
      {
        name: "userId",
        label: t("influencers.create.form.selectUser"),
        type: "paginatedSelect",
        required: true,
        icon: <UserCheck size={18} />,
        cols: 12,
        paginatedSelectConfig: userPaginatedConfig,
        placeholder: t("influencers.create.form.selectUserPlaceholder"),
        validation: z.coerce.number().min(1, t("influencers.create.validations.userRequired")),
      },
    ];

    const commonFields: FormField[] = [
      {
        name: "displayNameEn",
        label: t("influencers.create.form.displayNameEn"),
        type: "text",
        required: true,
        icon: <Type size={18} />,
        cols: 6,
        validation: z.string().min(1, t("influencers.create.validations.displayNameEnRequired")),
      },
      {
        name: "displayNameAr",
        label: t("influencers.create.form.displayNameAr"),
        type: "text",
        required: true,
        icon: <Type size={18} />,
        cols: 6,
        validation: z.string().min(1, t("influencers.create.validations.displayNameArRequired")),
      },
      {
        name: "image",
        label: t("influencers.create.form.image"),
        type: "imageApi",
        required: true,
        icon: <ImageIcon size={18} />,
        cols: 12,
        imageUploadConfig: {
          uploadEndpoint: "/upload",
          multiple: false,
        },
        validation: z.string().min(1, t("influencers.create.validations.imageRequired")),
      },
    ];

    const updatedFields = [
      ...baseFields,
      ...(userType === "NEW" ? newUserFields : existingUserFields),
      ...commonFields,
    ];

    setFormFields(updatedFields);
  }, [userType, t]);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    const loadingToast = toast.loading(t("influencers.create.messages.creating"));

    try {
      let payload: any = {
        disPlayName: {
          english: data.displayNameEn,
          arabic: data.displayNameAr,
        },
        image: data.image,
      };

      if (userType === "NEW") {
        payload.newUser = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          password: data.password,
        };
      } else {
        payload.userId = Number(data.userId);
      }

      const response = await CreateMethod(
        "home-page/admin/influencers",
        payload,
        lang
      );

      if (response) {
        toast.dismiss(loadingToast);
        toast.success(t("influencers.create.messages.createSuccess"));
        queryClient.invalidateQueries({ queryKey: ["influencers"] });
        setTimeout(() => navigate("/home-page/influencers"), 1500);
      } else {
        throw new Error();
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(t("influencers.create.messages.createFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen mb-60 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-indigo-950/30 dark:to-purple-950/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/home-page/influencers")}
              className="p-2 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition-colors"
            >
              <ArrowLeft size={24} className="text-slate-600 dark:text-slate-400" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl">
                <Users size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 dark:from-slate-100 dark:via-indigo-100 dark:to-purple-100 bg-clip-text text-transparent">
                  {t("influencers.create.title")}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {t("influencers.create.subtitle")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1.5 bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-[2rem] mb-8 border border-white dark:border-slate-700/50 shadow-inner overflow-hidden">
          <button
            onClick={() => setUserType("NEW")}
            className={`relative flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-black transition-all duration-500 ${
              userType === "NEW" ? "text-indigo-600 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-400"
            }`}
          >
            {userType === "NEW" && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white dark:bg-indigo-600 shadow-xl rounded-[1.5rem]"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <UserPlus size={20} className="relative z-10" />
            <span className="relative z-10 uppercase tracking-wider text-xs">{t("influencers.create.form.newUser")}</span>
          </button>
          <button
            onClick={() => setUserType("EXISTING")}
            className={`relative flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-black transition-all duration-500 ${
              userType === "EXISTING" ? "text-indigo-600 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-400"
            }`}
          >
            {userType === "EXISTING" && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white dark:bg-indigo-600 shadow-xl rounded-[1.5rem]"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <UserCheck size={20} className="relative z-10" />
            <span className="relative z-10 uppercase tracking-wider text-xs">{t("influencers.create.form.existingUser")}</span>
          </button>
        </div>

        {/* Form Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={userType}
            initial={{ opacity: 0, x: userType === "NEW" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: userType === "NEW" ? 20 : -20 }}
            transition={{ duration: 0.3 }}
          >
            <CreateForm
              key={userType}
              title={t("influencers.create.form.title")}
              description={t("influencers.create.form.description")}
              fields={formFields}
              defaultValues={{}}
              onSubmit={handleSubmit}
              onCancel={() => navigate("/home-page/influencers")}
              submitLabel={t("influencers.create.form.actions.create")}
              cancelLabel={t("common.cancel")}
              isLoading={isLoading}
              mode="create"
              fetchOptions={fetchOptions}
              onFieldChange={handleFieldChange}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
