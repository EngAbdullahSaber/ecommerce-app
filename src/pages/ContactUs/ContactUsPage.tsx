import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Mail,
  RefreshCw,
  MessageSquare,
  User,
  Clock,
  Eye,
  Trash2,
  X,
} from "lucide-react";
import { DataTable } from "../../components/shared/DataTable";
import { GetPanigationMethod, DeleteMethod } from "../../services/apis/ApiMethod";
import { TableFilters } from "../../components/shared/TableFilters";
import { DeleteDialog } from "../../components/shared/DeleteDialog";
import { useToast } from "../../hooks/useToast";
import { useTranslation } from "react-i18next";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  userId: number | null;
  createdAt: string;
  updatedAt: string;
  user: any | null;
}

interface ContactUsResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: ContactMessage[];
  totalItems: number;
  totalPages: number;
}

function MessageDetailsDialog({
  isOpen,
  onClose,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  message: ContactMessage | null;
}) {
  const { t } = useTranslation();
  if (!isOpen || !message) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 group"
        >
          <X size={20} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
        </button>

        <div className="p-8 space-y-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {t("contactUsPage.detailsTitle")}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {t("contactUsPage.receivedOn")} {new Date(message.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {t("contactUsPage.senderName")}
              </p>
              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <User size={18} className="text-blue-500" />
                <span className="font-semibold text-slate-900 dark:text-white">{message.name}</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {t("contactUsPage.emailAddress")}
              </p>
              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <Mail size={18} className="text-purple-500" />
                <span className="text-slate-700 dark:text-slate-300">{message.email}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t("contactUsPage.messageContent")}
            </p>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 min-h-[150px]">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {message.message}
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              {t("common.Close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactUsPage() {
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    message: ContactMessage | null;
  }>({
    isOpen: false,
    message: null,
  });

  const toast = useToast();

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchContactMessages = async ({
    page,
    pageSize,
    searchTerm,
  }: {
    page: number;
    pageSize: number;
    searchTerm?: string;
  }): Promise<{
    data: ContactMessage[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> => {
    try {
      const response = (await GetPanigationMethod(
        "/contact-us",
        page,
        pageSize,
        lang,
        searchTerm,
      )) as ContactUsResponse;

      return {
        data: response.data || [],
        total: response.totalItems || 0,
        page: page,
        pageSize: pageSize,
        totalPages: response.totalPages || 0,
      };
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      return {
        data: [],
        total: 0,
        page: page,
        pageSize: pageSize,
        totalPages: 0,
      };
    }
  };

  const {
    data: messagesResponse = {
      data: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    },
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["contact-us", currentPage, rowsPerPage, debouncedSearchTerm],
    queryFn: () =>
      fetchContactMessages({
        page: currentPage,
        pageSize: rowsPerPage,
        searchTerm: debouncedSearchTerm,
      }),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => DeleteMethod("/contact-us", id.toString(), lang),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-us"] });
      setDeleteDialog({ isOpen: false, message: null });
      toast.success(t("contactUsPage.deleteSuccess"));
    },
    onError: () => {
      toast.error(t("contactUsPage.deleteError"));
    },
  });

  const handleViewDetails = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsDetailsOpen(true);
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      width: "80px",
      render: (value: number) => (
        <div className="font-bold text-slate-700 dark:text-slate-300">
          #{value}
        </div>
      ),
    },
    {
      key: "name",
      label: t("contactUsPage.senderName"),
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <User size={16} />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">
            {value}
          </span>
        </div>
      ),
    },
    {
      key: "email",
      label: t("contactUsPage.emailAddress"),
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
            <Mail size={16} />
          </div>
          <span className="text-slate-600 dark:text-slate-400">
            {value}
          </span>
        </div>
      ),
    },
    {
      key: "message",
      label: t("contactUsPage.messageContent"),
      render: (value: string) => (
        <div className="max-w-xs">
          <p className="text-sm text-slate-600 dark:text-slate-400 truncate" title={value}>
            {value}
          </p>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: t("common.createdAt"),
      width: "180px",
      render: (value: string) => (
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Clock size={14} />
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {new Date(value).toLocaleDateString()}
            </span>
            <span className="text-xs">
              {new Date(value).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "id",
      label: t("common.actions"),
      width: "120px",
      render: (value: number, row: ContactMessage) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="p-2 bg-slate-100 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-blue-900/30 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-lg transition-all duration-200"
            title={t("common.view")}
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => setDeleteDialog({ isOpen: true, message: row })}
            className="p-2 bg-slate-100 hover:bg-red-100 dark:bg-slate-800 dark:hover:bg-red-900/30 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded-lg transition-all duration-200"
            title={t("common.delete")}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const handleRefresh = () => {
    refetch();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-900/20 dark:to-purple-900/20 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl">
              <MessageSquare size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                {t("contactUsPage.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("contactUsPage.subtitle")}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <RefreshCw
                size={18}
                className={isLoading ? "animate-spin" : ""}
              />
              {t("common.refresh")}
            </button>
          </div>
        </div>

        <TableFilters
          searchTerm={searchTerm}
          show={false}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
          showFilters={showFilters}
          onShowFiltersChange={setShowFilters}
          onClearFilters={clearFilters}
          searchPlaceholder={t("contactUsPage.searchPlaceholder")}
          filterOptions={[]}
          filterLabel={t("common.status")}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              {t("contactUsPage.loading")}
            </p>
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-red-500 mb-4">
              <MessageSquare size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("common.error")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {t("contactUsPage.deleteError")}
            </p>
            <button
              onClick={handleRefresh}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              {t("common.tryAgain")}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && messagesResponse.data.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-blue-500 mb-4">
              <MessageSquare size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("contactUsPage.noMessages")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {debouncedSearchTerm
                ? t("contactUsPage.noResults")
                : t("contactUsPage.noMessagesYet")}
            </p>
          </div>
        )}

        {/* Table Container */}
        {!isLoading && !isError && messagesResponse.data.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <DataTable
              columns={columns}
              data={messagesResponse.data}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              totalItems={messagesResponse.total}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
             />
          </div>
        )}
      </div>

      <MessageDetailsDialog
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        message={selectedMessage}
      />

      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, message: null })}
        onConfirm={() => {
          if (deleteDialog.message) {
            deleteMutation.mutate(deleteDialog.message.id);
          }
        }}
        title={t("contactUsPage.deleteTitle")}
        description={t("contactUsPage.deleteDescription")}
        itemName={deleteDialog.message?.name}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
