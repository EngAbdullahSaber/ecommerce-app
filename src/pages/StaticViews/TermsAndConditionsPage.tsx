import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FileText, Save, RefreshCw, Globe } from "lucide-react";
import { GetSpecifiedMethod, PutMethod } from "../../services/apis/ApiMethod";
import { useToast } from "../../hooks/useToast";
import { useTranslation } from "react-i18next";
import RichTextEditor from "../../components/shared/RichTextEditor";

interface StaticViewData {
  type: string;
  contentArabic: string;
  contentEnglish: string;
  contentSpanish: string;
}

export default function TermsAndConditionsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState<"en" | "ar" | "es">("en");
  const [content, setContent] = useState({
    en: "",
    ar: "",
    es: "",
  });

  const { data: viewResponse, isLoading, refetch } = useQuery({
    queryKey: ["static-view", "TERMS_AND_CONDITIONS"],
    queryFn: () => GetSpecifiedMethod("/static-view/TERMS_AND_CONDITIONS", lang),
  });

  useEffect(() => {
    if (viewResponse?.data) {
      setContent({
        en: viewResponse.data.contentEnglish || "",
        ar: viewResponse.data.contentArabic || "",
        es: viewResponse.data.contentSpanish || "",
      });
    }
  }, [viewResponse]);

  const updateMutation = useMutation({
    mutationFn: (data: StaticViewData) => PutMethod("/static-view", data, lang),
    onSuccess: () => {
      toast.success(lang === "ar" ? "تم تحديث الشروط والأحكام بنجاح" : "Terms and Conditions updated successfully");
      refetch();
    },
    onError: () => {
      toast.error(lang === "ar" ? "فشل تحديث الشروط والأحكام" : "Failed to update Terms and Conditions");
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      type: "TERMS_AND_CONDITIONS",
      contentEnglish: content.en,
      contentArabic: content.ar,
      contentSpanish: content.es,
    });
  };

  const handleContentChange = (val: string) => {
    setContent(prev => ({ ...prev, [activeTab]: val }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-purple-900/20 dark:to-indigo-900/20 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-xl">
              <FileText size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 dark:from-slate-100 dark:via-purple-100 dark:to-indigo-100 bg-clip-text text-transparent">
                {lang === "ar" ? "الشروط والأحكام" : "Terms & Conditions"}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {lang === "ar" ? "إدارة شروط وأحكام الموقع بمختلف اللغات" : "Manage terms and conditions content in different languages"}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="p-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending || isLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Save size={20} />
              {lang === "ar" ? "حفظ التغييرات" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Editor Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-1">
            <button
              onClick={() => setActiveTab("en")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold transition-all ${
                activeTab === "en"
                  ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm"
                  : "text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700/50"
              }`}
            >
              <Globe size={18} />
              English
            </button>
            <button
              onClick={() => setActiveTab("ar")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold transition-all ${
                activeTab === "ar"
                  ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm"
                  : "text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700/50"
              }`}
            >
              <Globe size={18} />
              العربية
            </button>
            <button
              onClick={() => setActiveTab("es")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold transition-all ${
                activeTab === "es"
                  ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm"
                  : "text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700/50"
              }`}
            >
              <Globe size={18} />
              Spanish
            </button>
          </div>

          <div className="p-8">
            <div className="mb-6 flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-800/30">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <FileText size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {activeTab === "en" ? "English Content" : activeTab === "ar" ? "المحتوى العربي" : "Spanish Content"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {lang === "ar" ? "استخدم المحرر أدناه لتنسيق النص" : "Use the editor below to format your content"}
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                <p className="text-slate-500 animate-pulse font-medium">Loading content...</p>
              </div>
            ) : (
              <div className="min-h-[400px] border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:ring-2 ring-purple-500/20 transition-all overflow-hidden">
                <RichTextEditor
                  value={content[activeTab]}
                  onChange={handleContentChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-slate-700/50">
          <div className="flex items-start gap-4 text-sm text-slate-600 dark:text-slate-400">
            <FileText size={20} className="text-purple-500 shrink-0 mt-0.5" />
            <p>
              {lang === "ar" 
                ? "هذه الشروط ملزمة قانونياً لجميع مستخدمي التطبيق. أي تغيير هنا سيظهر فوراً لجميع المستخدمين."
                : "These terms are legally binding for all app users. Any changes here will appear immediately to all users."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
