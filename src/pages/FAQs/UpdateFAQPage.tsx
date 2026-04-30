import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HelpCircle, FileText, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { useToast } from "../../hooks/useToast";
import { GetSpecifiedMethod, UpdateMethod } from "../../services/apis/ApiMethod";
import { FormField } from "../../components/shared/GenericUpdateForm";
import { UpdateForm } from "../../components/shared/GenericUpdateForm/UpdateForm";
import { useQueryClient } from "@tanstack/react-query";

export default function UpdateFAQPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const toast = useToast();
  const faqId = params.id as string;
  const queryClient = useQueryClient();

  const fetchFAQById = async (id: string, lang: string) => {
    const response = await GetSpecifiedMethod(`/faqs/${id}`, lang);
    if (!response || response.code !== 200) {
      throw new Error("FAQ not found");
    }
    return response.data;
  };

  const faqFields: FormField[] = [
    {
      name: "questionEn",
      label: t("faqsPage.form.questionEn"),
      type: "textarea",
      placeholder: t("faqsPage.form.placeholderQuestion"),
      required: true,
      icon: <HelpCircle size={18} />,
      cols: 12,
      rows: 2,
      validation: z.string().min(5, t("faqsPage.form.questionMinLength")),
    },
    {
      name: "questionAr",
      label: t("faqsPage.form.questionAr"),
      type: "textarea",
      placeholder: t("faqsPage.form.placeholderQuestion"),
      required: true,
      icon: <HelpCircle size={18} />,
      cols: 12,
      rows: 2,
      validation: z.string().min(5, t("faqsPage.form.questionMinLength")),
    },
    {
      name: "questionKu",
      label: t("faqsPage.form.questionKu"),
      type: "textarea",
      placeholder: t("faqsPage.form.placeholderQuestion"),
      required: true,
      icon: <HelpCircle size={18} />,
      cols: 12,
      rows: 2,
      validation: z.string().min(5, t("faqsPage.form.questionMinLength")),
    },
    {
      name: "answerEn",
      label: t("faqsPage.form.answerEn"),
      type: "textarea",
      placeholder: t("faqsPage.form.placeholderAnswer"),
      required: true,
      icon: <FileText size={18} />,
      cols: 12,
      rows: 4,
      validation: z.string().min(10, t("faqsPage.form.answerMinLength")),
    },
    {
      name: "answerAr",
      label: t("faqsPage.form.answerAr"),
      type: "textarea",
      placeholder: t("faqsPage.form.placeholderAnswer"),
      required: true,
      icon: <FileText size={18} />,
      cols: 12,
      rows: 4,
      validation: z.string().min(10, t("faqsPage.form.answerMinLength")),
    },
    {
      name: "answerKu",
      label: t("faqsPage.form.answerKu"),
      type: "textarea",
      placeholder: t("faqsPage.form.placeholderAnswer"),
      required: true,
      icon: <FileText size={18} />,
      cols: 12,
      rows: 4,
      validation: z.string().min(10, t("faqsPage.form.answerMinLength")),
    },
  ];

  const handleUpdate = async (id: string, data: any) => {
    const response = await UpdateMethod("/faqs", data, id, lang);
    if (!response || response.code !== 200) {
      const errorMsg = lang === "ar" ? response?.message?.arabic : response?.message?.english;
      throw new Error(errorMsg || t("faqsPage.messages.updateError"));
    }
    return response;
  };

  const handleAfterSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["faqs"] });
    toast.success(t("faqsPage.messages.updateSuccess"));
    setTimeout(() => navigate("/faqs"), 1000);
  };

  if (!faqId) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-slate-950 dark:via-emerald-950/30 dark:to-teal-950/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/faqs")}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-6 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">{t("common.back")}</span>
        </button>

        <UpdateForm
          title={t("faqsPage.updateTitle")}
          description={t("faqsPage.form.updateDescription")}
          fields={faqFields}
          entityId={faqId}
          fetchData={(id: string) => fetchFAQById(id, lang)}
          onUpdate={handleUpdate}
          onCancel={() => navigate("/faqs")}
          afterSuccess={handleAfterSuccess}
          submitLabel={t("common.saveChanges")}
          cancelLabel={t("common.cancel")}
        />
      </div>
    </div>
  );
}
