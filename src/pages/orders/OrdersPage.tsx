// pages/orders.tsx - Fixed version
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
  Edit,
  Trash2,
  Mail,
  Search,
  Filter,
  Plus,
} from "lucide-react";
import { DataTable } from "../../components/shared/DataTable";
import { useTable } from "../../hooks/useTable";
import { DeleteDialog } from "../../components/shared/DeleteDialog";
import { useNavigate } from "react-router-dom";
import { TableFilters } from "../../components/shared/TableFilters";

// Enhanced Stats Card Component with Dark Mode
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
      {/* Animated gradient overlay */}
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

      {/* Bottom glow */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
    </div>
  );
}

// Mock API functions
const fetchOrders = async (): Promise<Order[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return [
    {
      id: 1,
      orderNumber: "#ORD-2024-001",
      customer: {
        image: "https://i.pravatar.cc/150?img=1",
        name: "Lindsey Curtis",
        email: "lindsey.c@email.com",
      },
      product: "Premium Wireless Headphones",
      quantity: 2,
      amount: 398.0,
      status: "Delivered",
      date: "2024-10-28",
      paymentMethod: "Credit Card",
    },
    {
      id: 2,
      orderNumber: "#ORD-2024-002",
      customer: {
        image: "https://i.pravatar.cc/150?img=2",
        name: "Kaiya George",
        email: "kaiya.g@email.com",
      },
      product: "Smart Watch Series 8",
      quantity: 1,
      amount: 599.99,
      status: "Processing",
      date: "2024-10-29",
      paymentMethod: "PayPal",
    },
    {
      id: 3,
      orderNumber: "#ORD-2024-003",
      customer: {
        image: "https://i.pravatar.cc/150?img=3",
        name: "Zain Geidt",
        email: "zain.g@email.com",
      },
      product: "Laptop Stand & Keyboard",
      quantity: 1,
      amount: 127.5,
      status: "Shipped",
      date: "2024-10-27",
      paymentMethod: "Credit Card",
    },
    {
      id: 4,
      orderNumber: "#ORD-2024-004",
      customer: {
        image: "https://i.pravatar.cc/150?img=4",
        name: "Abram Schleifer",
        email: "abram.s@email.com",
      },
      product: "4K Webcam Pro",
      quantity: 3,
      amount: 447.0,
      status: "Cancelled",
      date: "2024-10-26",
      paymentMethod: "Apple Pay",
    },
    {
      id: 5,
      orderNumber: "#ORD-2024-005",
      customer: {
        image: "https://i.pravatar.cc/150?img=5",
        name: "Carla George",
        email: "carla.g@email.com",
      },
      product: "Ergonomic Office Chair",
      quantity: 1,
      amount: 289.0,
      status: "Delivered",
      date: "2024-10-30",
      paymentMethod: "Credit Card",
    },
    {
      id: 6,
      orderNumber: "#ORD-2024-006",
      customer: {
        image: "https://i.pravatar.cc/150?img=6",
        name: "Marcus Chen",
        email: "marcus.c@email.com",
      },
      product: "Mechanical Keyboard RGB",
      quantity: 2,
      amount: 278.0,
      status: "Processing",
      date: "2024-10-31",
      paymentMethod: "PayPal",
    },
  ];
};

const deleteOrder = async (orderId: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  console.log(`Deleting order with ID: ${orderId}`);
};

const exportOrders = async (filters: any): Promise<Blob> => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const data = JSON.stringify(filters, null, 2);
  return new Blob([data], { type: "application/json" });
};

const getStatusConfig = (status: string) => {
  const configs = {
    Delivered: {
      bg: "bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-500/10 dark:to-green-500/10 dark:border-emerald-500/20",
      text: "text-emerald-700 dark:text-emerald-400",
      dot: "bg-emerald-500",
      border: "border-emerald-200 dark:border-emerald-500/20",
    },
    Processing: {
      bg: "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-500/10 dark:to-cyan-500/10 dark:border-blue-500/20",
      text: "text-blue-700 dark:text-blue-400",
      dot: "bg-blue-500",
      border: "border-blue-200 dark:border-blue-500/20",
    },
    Shipped: {
      bg: "bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 dark:border-purple-500/20",
      text: "text-purple-700 dark:text-purple-400",
      dot: "bg-purple-500",
      border: "border-purple-200 dark:border-purple-500/20",
    },
    Cancelled: {
      bg: "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-500/10 dark:to-orange-500/10 dark:border-red-500/20",
      text: "text-red-700 dark:text-red-400",
      dot: "bg-red-500",
      border: "border-red-200 dark:border-red-500/20",
    },
  };
  return configs[status as keyof typeof configs] || configs.Processing;
};

const calculateStats = (data: Order[]) => {
  const total = data.reduce((sum, order) => sum + order.amount, 0);
  const delivered = data.filter((o) => o.status === "Delivered").length;
  const processing = data.filter((o) => o.status === "Processing").length;
  return {
    totalRevenue: total,
    totalOrders: data.length,
    delivered,
    processing,
  };
};

export default function OrdersPage() {
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    order: Order | null;
  }>({
    isOpen: false,
    order: null,
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setDeleteDialog({ isOpen: false, order: null });
    },
  });

  const exportMutation = useMutation({
    mutationFn: exportOrders,
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });

  const table = useTable({ initialData: orders, initialRowsPerPage: 5 });
  const stats = calculateStats(orders);

  const columns = [
    {
      key: "actions",
      label: "Actions",
      width: "120px",
      render: (value: any, row: Order) => (
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleAction("view", row)}
              className="p-2 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 dark:from-blue-500/10 dark:to-cyan-500/10 dark:hover:from-blue-500/20 dark:hover:to-cyan-500/20 text-blue-600 dark:text-blue-400 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg border border-blue-200/50 dark:border-blue-500/20"
              title="View order"
            >
              <Eye size={14} className="sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => handleAction("edit", row)}
              className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 dark:from-amber-500/10 dark:to-orange-500/10 dark:hover:from-amber-500/20 dark:hover:to-orange-500/20 text-amber-600 dark:text-amber-400 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg border border-amber-200/50 dark:border-amber-500/20"
              title="Edit order"
            >
              <Edit size={14} className="sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => handleAction("delete", row)}
              className="p-2 bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 dark:from-red-500/10 dark:to-pink-500/10 dark:hover:from-red-500/20 dark:hover:to-pink-500/20 text-red-600 dark:text-red-400 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg border border-red-200/50 dark:border-red-500/20"
              title="Delete order"
            >
              <Trash2 size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      ),
    },
    {
      key: "orderNumber",
      label: "Order",
      render: (value: string, row: Order) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
            {value}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {row.paymentMethod}
          </span>
        </div>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (value: any) => (
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden ring-2 ring-slate-200 dark:ring-slate-700 shadow-md">
            <img
              src={value.image}
              alt={value.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base truncate">
              {value.name}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
              <Mail size={10} />
              <span className="truncate">{value.email}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "product",
      label: "Product",
      render: (value: string) => (
        <div className="text-sm font-medium text-slate-900 dark:text-white max-w-[120px] sm:max-w-xs truncate">
          {value}
        </div>
      ),
    },
    {
      key: "quantity",
      label: "Qty",
      align: "center" as const,
      render: (value: number) => (
        <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-600 rounded-xl font-bold text-sm shadow-sm">
          {value}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      align: "right" as const,
      render: (value: number) => (
        <span className="font-bold text-base sm:text-lg bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          ${value.toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      align: "center" as const,
      render: (value: string) => {
        const config = getStatusConfig(value);
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold ${config.bg} ${config.text} border ${config.border} shadow-sm`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`}
            />
            <span className="hidden sm:inline">{value}</span>
            <span className="sm:hidden">
              {value === "Processing"
                ? "Proc"
                : value === "Delivered"
                ? "Deliv"
                : value === "Shipped"
                ? "Ship"
                : value === "Cancelled"
                ? "Cancel"
                : value}
            </span>
          </span>
        );
      },
    },
    {
      key: "date",
      label: "Date",
      render: (value: string) => (
        <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
          {new Date(value).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
  ];

  const handleAction = (action: string, row: Order) => {
    if (action === "delete") {
      setDeleteDialog({ isOpen: true, order: row });
    } else if (action === "view") {
      navigate(`/view-order/${row.id}`);
    } else if (action === "edit") {
      navigate(`/update-order/${row.id}`);
    }
  };

  const handleCreateOrder = () => {
    navigate("/create-order");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-900/20 dark:to-purple-900/20 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl">
              <ShoppingBag size={24} className="sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-slate-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                Orders Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base">
                Track and manage your e-commerce orders
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Bar for Mobile */}
            <div className="sm:hidden relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Create Order Button */}
            <button
              onClick={handleCreateOrder}
              className="flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base"
            >
              <Plus size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Create Order</span>
              <span className="sm:hidden">Create</span>
            </button>

            <button
              onClick={() => exportMutation.mutate({})}
              disabled={exportMutation.isPending}
              className="flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base"
            >
              {exportMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Exporting...</span>
                  <span className="sm:hidden">Exporting</span>
                </>
              ) : (
                <>
                  <Download size={18} className="sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Export Orders</span>
                  <span className="sm:hidden">Export</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatsCard
            icon={DollarSign}
            title="Total Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
            badge="+12%"
          />
          <StatsCard
            icon={ShoppingBag}
            title="Total Orders"
            value={stats.totalOrders}
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <StatsCard
            icon={Package}
            title="Delivered"
            value={stats.delivered}
            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatsCard
            icon={Clock}
            title="Processing"
            value={stats.processing}
            gradient="bg-gradient-to-br from-amber-500 to-amber-600"
          />
        </div>

        {/* Table Container */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl dark:shadow-2xl dark:shadow-black/30 overflow-hidden">
          {/* Table Filters */}
          <TableFilters
            searchTerm={table.searchTerm}
            onSearchChange={table.setSearchTerm}
            statusFilter={table.statusFilter}
            onStatusFilter={table.setStatusFilter}
            showFilters={table.showFilters}
            onShowFiltersChange={table.setShowFilters}
            onClearFilters={table.clearFilters}
            searchPlaceholder="Search users..."
            filterOptions={["all", "Active", "Inactive"]}
            filterLabel="Status:"
          />
          {/* Table */}
          <DataTable
            columns={columns}
            data={table.filteredData}
            currentPage={table.currentPage}
            rowsPerPage={table.rowsPerPage}
            totalItems={table.totalItems}
            onPageChange={table.setCurrentPage}
            onRowsPerPageChange={table.setRowsPerPage}
          />
        </div>
      </div>

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, order: null })}
        onConfirm={() => {
          if (deleteDialog.order) {
            deleteMutation.mutate(deleteDialog.order.id);
          }
        }}
        title="Delete Order"
        description="Are you sure you want to delete this order? This action cannot be undone."
        itemName={deleteDialog.order?.orderNumber}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
