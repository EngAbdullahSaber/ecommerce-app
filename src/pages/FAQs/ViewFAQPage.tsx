import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HelpCircle, Clock, ArrowLeft, Globe, FileText } from "lucide-react";
import { GetSpecifiedMethod } from "../../services/apis/ApiMethod";

interface FAQ {
  id: string;
  questionAr: string;
  questionEn: string;
  questionKu: string;
  answerAr: string;
  answerEn: string;
  answerKu: string;
  createdById: number;
  createdAt: string;
  updatedAt: string;
}

export default function ViewFAQPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [faq, setFaq] = useState<FAQ | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        setIsLoading(true);
        const response = await GetSpecifiedMethod(`faqs/${id}`, lang);
        if (response && response.code === 200) {
          setFaq(response.data);
        }
      } catch (error) {
        console.error("Error fetching FAQ details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchFAQ();
    }
  }, [id, lang]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!faq) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 text-center">
        <HelpCircle size={64} className="text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">FAQ Not Found</h2>
        <button
          onClick={() => navigate("/faqs")}
          className="text-emerald-600 font-semibold hover:underline"
        >
          Back to FAQs List
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-slate-950 dark:via-emerald-950/30 dark:to-teal-950/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/faqs")}
              className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform rtl:rotate-180" />
            </button>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-emerald-900 dark:from-white dark:to-emerald-100 bg-clip-text text-transparent">
                {t("faqsPage.detailsTitle")}
              </h1>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mt-1">
                <Clock size={14} />
                <span className="text-sm">Created on {new Date(faq.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* English Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
            <div className="px-8 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg shadow-lg shadow-emerald-500/20">
                  <Globe size={18} className="text-white" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-widest text-slate-900 dark:text-white">English Version</h3>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <HelpCircle size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Question</span>
                </div>
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-slate-900 dark:text-white font-bold text-lg leading-relaxed">{faq.questionEn}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
                  <FileText size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Answer</span>
                </div>
                <div className="p-6 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{faq.answerEn}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Arabic Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
            <div className="px-8 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between flex-row-reverse">
              <div className="flex items-center gap-3 flex-row-reverse">
                <div className="p-2 bg-emerald-600 rounded-lg shadow-lg shadow-emerald-600/20">
                  <Globe size={18} className="text-white" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-widest text-slate-900 dark:text-white">النسخة العربية</h3>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-3 text-right">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 justify-end">
                  <span className="text-xs font-bold uppercase tracking-wider">السؤال</span>
                  <HelpCircle size={16} />
                </div>
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-slate-900 dark:text-white font-bold text-lg leading-relaxed">{faq.questionAr}</p>
                </div>
              </div>

              <div className="space-y-3 text-right">
                <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 justify-end">
                  <span className="text-xs font-bold uppercase tracking-wider">الإجابة</span>
                  <FileText size={16} />
                </div>
                <div className="p-6 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{faq.answerAr}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Kurdish Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
            <div className="px-8 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between flex-row-reverse">
              <div className="flex items-center gap-3 flex-row-reverse">
                <div className="p-2 bg-teal-600 rounded-lg shadow-lg shadow-teal-600/20">
                  <Globe size={18} className="text-white" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-widest text-slate-900 dark:text-white">وەڵام بە کوردي</h3>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-3 text-right">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 justify-end">
                  <span className="text-xs font-bold uppercase tracking-wider">پسیار</span>
                  <HelpCircle size={16} />
                </div>
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-slate-900 dark:text-white font-bold text-lg leading-relaxed">{faq.questionKu}</p>
                </div>
              </div>

              <div className="space-y-3 text-right">
                <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 justify-end">
                  <span className="text-xs font-bold uppercase tracking-wider">وەڵام</span>
                  <FileText size={16} />
                </div>
                <div className="p-6 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{faq.answerKu}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
