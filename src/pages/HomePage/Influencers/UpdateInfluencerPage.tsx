import { useState, useEffect } from "react";
import { z } from "zod";
import {
  Users,
  ArrowLeft,
  Type,
  ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  UpdateMethod,
  GetSpecifiedMethod,
} from "../../../services/apis/ApiMethod";
import { useToast } from "../../../hooks/useToast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CreateForm } from "../../../components/shared/GenericForm/CreateForm";
import { FormField } from "../../../components/shared/GenericForm";

export default function UpdateInfluencerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [isLoading, setIsLoading] = useState(false);

  // Fetch influencer details
  const { data: influencerDetailsResponse, isLoading: isDetailsLoading } = useQuery({
    queryKey: ["influencer-details", id, lang],
    queryFn: () => GetSpecifiedMethod(`home-page/admin/influencers`, lang),
    enabled: !!id,
  });

  // Find the specific influencer in the list
  const influencer = Array.isArray(influencerDetailsResponse?.data)
    ? influencerDetailsResponse.data.find((inf: any) => inf.id.toString() === id)
    : influencerDetailsResponse?.data;

  const [defaultValues, setDefaultValues] = useState<any>(null);

  useEffect(() => {
    if (influencer) {
      setDefaultValues({
        displayNameEn: influencer.disPlayName?.english || "",
        displayNameAr: influencer.disPlayName?.arabic || "",
        image: influencer.image,
        isActive: !!influencer.isActive,
      });
    }
  }, [influencer]);

  const formFields: FormField[] = [
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
      type: "imageApi" as any,
      required: true,
      icon: <ImageIcon size={18} />,
      cols: 12,
      imageUploadConfig: {
        uploadEndpoint: "/upload",
      },
      validation: z.string().min(1, t("influencers.create.validations.imageRequired")),
    },
    {
      name: "isActive",
      label: t("influencers.status.active"),
      type: "checkbox",
      icon: <CheckCircle2 size={18} />,
      cols: 12,
      validation: z.boolean().optional(),
    },
  ];

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    const loadingToast = toast.loading(t("common.loading"));

    try {
      const payload = {
        disPlayName: {
          english: data.displayNameEn,
          arabic: data.displayNameAr,
        },
        image: data.image,
        isActive: !!data.isActive,
      };

      const response = await UpdateMethod(
        "home-page/admin/influencers",
        payload,
        id,
        lang
      );

      if (response) {
        toast.dismiss(loadingToast);
        toast.success(t("common.success"));
        
        queryClient.invalidateQueries({ queryKey: ["influencers"] });
        queryClient.invalidateQueries({ queryKey: ["influencer-details", id] });
        
        setTimeout(() => {
          navigate("/home-page/influencers");
        }, 1500);
      } else {
        throw new Error();
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(t("common.error"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isDetailsLoading || !defaultValues) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

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
                  {t("influencers.editTitle")}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {t("influencers.editSubtitle")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CreateForm
            title={t("influencers.editTitle")}
            description={t("influencers.editSubtitle")}
            fields={formFields}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/home-page/influencers")}
            submitLabel={t("common.saveChanges")}
            cancelLabel={t("common.cancel")}
            isLoading={isLoading}
            mode="edit"
          />
        </div>
      </div>
    </div>
  );
}
