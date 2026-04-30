// pages/orders.tsx
"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Download,
  DollarSign,
  ShoppingBag,
  Package,
  Clock,
  Eye,
  Trash2,
  Search,
  Plus,
  CreditCard,
  User,
  Phone,
} from "lucide-react";
import { DataTable } from "../../components/shared/DataTable";
import { DeleteDialog } from "../../components/shared/DeleteDialog";
import { useNavigate } from "react-router-dom";
import { GetPanigationMethod, DeleteMethod } from "../../services/apis/ApiMethod";
import { useTranslation } from "react-i18next";
import { useToast } from "../../hooks/useToast";

interface Order {
  id: number;
  displayId: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  grandTotal: string;
  currency: string;
  itemCount: number;
  customerName: string;
  customerPhone: string;
  userId: number;
  guestId: null | number;
  placedAt: string;
}

interface OrdersResponse {
  code: number;
  data: {
    orders: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

function StatsCard({
  icon: Icon,
  title,
  value,
  gradient,
  badge,
}: {
  icon: any;
  title: string;
  value: string | number;
  gradient: string;
  badge?: string;
}) {
  return (
    <div
      className={`relative group rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] ${gradient} dark:shadow-2xl dark:shadow-black/30`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:from-black/10" />
      <div className="relative p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Icon size={20} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
          </div>
          {badge && (
            <div className="px-2 py-1 sm:px-3 sm:py-1 bg-white/20 rounded-full backdrop-blur-sm text-xs font-bold animate-pulse">
              {badge}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-white/80 text-xs sm:text-sm font-semibold tracking-wide">
            {title}
          </p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
            {value}
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
    </div>
  );
}

export default function OrdersPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    order: Order | null;
  }>({
    isOpen: false,
    order: null,
  });

  const { data: response, isLoading } = useQuery<OrdersResponse>({
    queryKey: ["orders", currentPage, pageSize, searchTerm, lang],
    queryFn: () => GetPanigationMethod("/orders/admin", currentPage, pageSize, lang, searchTerm),
  });

  const orders = response?.data?.orders || [];
  const totalItems = response?.data?.total || 0;

  const deleteMutation = useMutation({
    mutationFn: (id: number) => DeleteMethod("/orders", id, lang),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(t("ordersPage.delete.success"));
      setDeleteDialog({ isOpen: false, order: null });
    },
    onError: () => {
      toast.error(t("ordersPage.delete.error"));
    },
  });

  const getStatusConfig = (status: string) => {
    const configs: Record<string, any> = {
      DELIVERED: {
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        text: "text-emerald-700 dark:text-emerald-400",
        dot: "bg-emerald-500",
        border: "border-emerald-200 dark:border-emerald-500/20",
      },
      PROCESSING: {
        bg: "bg-blue-50 dark:bg-blue-500/10",
        text: "text-blue-700 dark:text-blue-400",
        dot: "bg-blue-500",
        border: "border-blue-200 dark:border-blue-500/20",
      },
      PENDING: {
        bg: "bg-amber-50 dark:bg-amber-500/10",
        text: "text-amber-700 dark:text-amber-400",
        dot: "bg-amber-500",
        border: "border-amber-200 dark:border-amber-500/20",
      },
      SHIPPED: {
        bg: "bg-purple-50 dark:bg-purple-500/10",
        text: "text-purple-700 dark:text-purple-400",
        dot: "bg-purple-500",
        border: "border-purple-200 dark:border-purple-500/20",
      },
      CANCELLED: {
        bg: "bg-red-50 dark:bg-red-500/10",
        text: "text-red-700 dark:text-red-400",
        dot: "bg-red-500",
        border: "border-red-200 dark:border-red-500/20",
      },
    };
    return configs[status] || configs.PENDING;
  };

  const columns = [
   
    {
      key: "displayId",
      label: t("ordersPage.table.order"),
      render: (value: string, row: Order) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 dark:text-white">#{value}</span>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            <CreditCard size={10} />
            {t(`ordersPage.payment.${row.paymentMethod}`)}
          </div>
        </div>
      ),
    },
    {
      key: "customerName",
      label: t("ordersPage.table.customer"),
      render: (value: string, row: Order) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <User size={14} className="text-slate-400" />
            {value}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Phone size={12} className="text-slate-400" />
            {row.customerPhone}
          </div>
        </div>
      ),
    },
    {
      key: "itemCount",
      label: t("ordersPage.table.items"),
      align: "center" as const,
      render: (value: number) => (
        <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-sm">
          {value}
        </span>
      ),
    },
    {
      key: "grandTotal",
      label: t("ordersPage.table.amount"),
      align: "right" as const,
      render: (value: string, row: Order) => (
        <div className="flex flex-col items-end">
          <span className="font-black text-lg text-emerald-600 dark:text-emerald-400">
            {Number(value).toLocaleString()} {row.currency}
          </span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
            row.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {t(`ordersPage.payment.${row.paymentStatus}`)}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      label: t("ordersPage.table.status"),
      align: "center" as const,
      render: (value: string) => {
        const config = getStatusConfig(value);
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${config.bg} ${config.text} border ${config.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
            {t(`ordersPage.status.${value}`)}
          </span>
        );
      },
    },
    {
      key: "placedAt",
      label: t("ordersPage.table.date"),
      render: (value: string) => (
        <div className="flex flex-col text-xs text-slate-600 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            {new Date(value).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
          </div>
          <div className="text-[10px] opacity-70">
             {new Date(value).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-900/20 dark:to-purple-900/20 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl">
              <ShoppingBag size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                {t("ordersPage.title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("ordersPage.subtitle")}
              </p>
            </div>
          </div>
          
        </div>

    

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      

          <DataTable
            columns={columns}
            data={orders}
            currentPage={currentPage}
            rowsPerPage={pageSize}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={setPageSize}
            loading={isLoading}
          />
        </div>
      </div>

      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, order: null })}
        onConfirm={() => deleteDialog.order && deleteMutation.mutate(deleteDialog.order.id)}
        title={t("ordersPage.delete.title")}
        description={t("ordersPage.delete.description")}
        itemName={deleteDialog.order?.displayId ? `#${deleteDialog.order.displayId}` : ""}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
