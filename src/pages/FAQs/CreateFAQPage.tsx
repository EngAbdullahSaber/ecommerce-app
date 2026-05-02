import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HelpCircle, FileText, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { useToast } from "../../hooks/useToast";
import { CreateMethod } from "../../services/apis/ApiMethod";
import { FormField } from "../../components/shared/GenericForm";
 import { useQueryClient } from "@tanstack/react-query";
import { GenericForm } from "../../components/shared/GenericForm";

export default function CreateFAQPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const toast = useToast();
  const queryClient = useQueryClient();

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

  const handleSubmit = async (data: any) => {
    try {
      const response = await CreateMethod("faqs", data, lang);

      if (response && (response.code === 200 || response.code === 201)) {
        toast.success(t("faqsPage.messages.createSuccess"));
        queryClient.invalidateQueries({ queryKey: ["faqs"] });
        
        // Return to the list page after a short delay
        setTimeout(() => {
          navigate("/faqs");
        }, 1500);
      } else {
        const errorMsg = lang === "ar" ? response?.message?.arabic : response?.message?.english;
        throw new Error(errorMsg || t("faqsPage.messages.createError"));
      }
    } catch (error: any) {
      toast.error(error.message || t("faqsPage.messages.createError"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-slate-950 dark:via-emerald-950/30 dark:to-teal-950/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/faqs")}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-6 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform rtl:rotate-180" />
          <span className="font-semibold">{t("common.back")}</span>
        </button>

        <GenericForm
          title={t("faqsPage.createTitle")}
          description={t("faqsPage.form.createDescription")}
          fields={faqFields}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/faqs")}
          submitLabel={t("common.create")}
          cancelLabel={t("common.cancel")}
        />
      </div>
    </div>
  );
}
