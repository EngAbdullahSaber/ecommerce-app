import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  HelpCircle,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Eye,
  Clock,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "../../components/shared/DataTable";
import { GetSpecifiedMethod, DeleteMethod } from "../../services/apis/ApiMethod";
import { DeleteDialog } from "../../components/shared/DeleteDialog";
import { useToast } from "../../hooks/useToast";
import { useTranslation } from "react-i18next";

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

interface FAQsResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: FAQ[];
}

export default function FAQsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    faq: FAQ | null;
  }>({
    isOpen: false,
    faq: null,
  });

  const {
    data: faqsResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["faqs", lang],
    queryFn: () => GetSpecifiedMethod("faqs", lang) as Promise<FAQsResponse>,
    placeholderData: (previousData) => previousData,
  });

  const faqs = faqsResponse?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => DeleteMethod("faqs", id, lang),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      setDeleteDialog({ isOpen: false, faq: null });
      toast.success(t("faqsPage.deleteSuccess"));
    },
    onError: () => {
      toast.error(t("faqsPage.deleteError"));
    },
  });

  const filteredFaqs = faqs.filter(
    (faq) =>
      (faq.questionEn || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (faq.questionAr || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (faq.questionKu || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (faq.answerEn || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (faq.answerAr || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (faq.answerKu || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: "question",
      label: t("faqsPage.question"),
      align: "center" as const,
      render: (_: string, row: FAQ) => {
        const question = lang === "ar" ? row.questionAr : lang === "ku" ? row.questionKu : row.questionEn;
        return (
          <div className="max-w-md mx-auto">
            <p className="font-bold text-slate-900 dark:text-white line-clamp-2">
              {question}
            </p>
          </div>
        );
      },
    },
    {
      key: "answer",
      label: t("faqsPage.answer"),
      align: "center" as const,
      render: (_: string, row: FAQ) => {
        const answer = lang === "ar" ? row.answerAr : lang === "ku" ? row.answerKu : row.answerEn;
        return (
          <div className="max-w-xs mx-auto">
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {answer}
            </p>
          </div>
        );
      },
    },
    {
      key: "createdAt",
      label: t("common.createdAt"),
      width: "180px",
      align: "center" as const,
      render: (value: string) => (
        <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
          <Clock size={14} />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: "id",
      label: t("common.actions"),
      width: "120px",
      align: "center" as const,
      render: (value: string, row: FAQ) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => navigate(`/faqs/view/${row.id}`)}
            className="p-2 bg-slate-100 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-emerald-900/30 text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 rounded-lg transition-all duration-200"
            title={t("common.view")}
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => navigate(`/faqs/edit/${row.id}`)}
            className="p-2 bg-slate-100 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-blue-900/30 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-lg transition-all duration-200"
            title={t("common.edit")}
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => setDeleteDialog({ isOpen: true, faq: row })}
            className="p-2 bg-slate-100 hover:bg-red-100 dark:bg-slate-800 dark:hover:bg-red-900/30 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded-lg transition-all duration-200"
            title={t("common.delete")}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 dark:from-slate-900 dark:via-emerald-900/20 dark:to-teal-900/20 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl">
              <HelpCircle size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-900 dark:from-slate-100 dark:via-emerald-100 dark:to-teal-100 bg-clip-text text-transparent">
                {t("faqsPage.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("faqsPage.subtitle")}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/faqs/create")}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={20} />
              {t("common.add") || "Add New"}
            </button>
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
              {t("common.refresh")}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder={t("faqsPage.searchPlaceholder")}
            className="block w-full ps-11 pe-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              {t("common.loading")}
            </p>
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-red-500 mb-4">
              <HelpCircle size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("common.error")}
            </h3>
            <button
              onClick={() => refetch()}
              className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
            >
              {t("common.tryAgain")}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredFaqs.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-emerald-500 mb-4">
              <HelpCircle size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {lang === "ar" ? "لا توجد أسئلة" : "No FAQs Found"}
            </h3>
          </div>
        )}

        {/* Table Container */}
        {!isLoading && !isError && filteredFaqs.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredFaqs}
              currentPage={1}
              rowsPerPage={Math.max(1, filteredFaqs.length)}
              totalItems={filteredFaqs.length}
              onPageChange={() => {}}
              onRowsPerPageChange={() => {}}
            />
          </div>
        )}
      </div>

      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, faq: null })}
        onConfirm={() => {
          if (deleteDialog.faq) {
            deleteMutation.mutate(deleteDialog.faq.id);
          }
        }}
        title={lang === "ar" ? "حذف السؤال" : "Delete FAQ"}
        description={lang === "ar" ? "هل أنت متأكد من حذف هذا السؤال؟" : "Are you sure you want to delete this FAQ?"}
        itemName={lang === "ar" ? deleteDialog.faq?.questionAr : lang === "ku" ? deleteDialog.faq?.questionKu : deleteDialog.faq?.questionEn}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
