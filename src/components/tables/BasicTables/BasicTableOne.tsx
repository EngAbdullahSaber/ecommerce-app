"use client";
import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  X,
  SlidersHorizontal,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Clock,
  Package,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

interface Order {
  id: number;
  orderNumber: string;
  customer: {
    image: string;
    name: string;
    email: string;
  };
  product: string;
  quantity: number;
  amount: number;
  status: string;
  date: string;
  paymentMethod: string;
}

const tableData: Order[] = [
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
  {
    id: 7,
    orderNumber: "#ORD-2024-007",
    customer: {
      image: "https://i.pravatar.cc/150?img=7",
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
    },
    product: "Wireless Mouse Pro",
    quantity: 1,
    amount: 79.99,
    status: "Shipped",
    date: "2024-10-25",
    paymentMethod: "Credit Card",
  },
  {
    id: 8,
    orderNumber: "#ORD-2024-008",
    customer: {
      image: "https://i.pravatar.cc/150?img=8",
      name: "David Park",
      email: "david.p@email.com",
    },
    product: "USB-C Hub 7-in-1",
    quantity: 4,
    amount: 356.0,
    status: "Delivered",
    date: "2024-10-29",
    paymentMethod: "Google Pay",
  },
];

export default function EcommerceOrdersTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  // Calculate stats
  const stats = useMemo(() => {
    const total = tableData.reduce((sum, order) => sum + order.amount, 0);
    const delivered = tableData.filter((o) => o.status === "Delivered").length;
    const processing = tableData.filter(
      (o) => o.status === "Processing"
    ).length;
    return {
      totalRevenue: total,
      totalOrders: tableData.length,
      delivered,
      processing,
    };
  }, []);

  // Filter and search logic
  const filteredData = useMemo(() => {
    return tableData.filter((order) => {
      const matchesSearch =
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all";

  const getStatusConfig = (status: string) => {
    const configs = {
      Delivered: {
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        text: "text-emerald-700 dark:text-emerald-400",
        dot: "bg-emerald-500",
      },
      Processing: {
        bg: "bg-blue-50 dark:bg-blue-500/10",
        text: "text-blue-700 dark:text-blue-400",
        dot: "bg-blue-500",
      },
      Shipped: {
        bg: "bg-purple-50 dark:bg-purple-500/10",
        text: "text-purple-700 dark:text-purple-400",
        dot: "bg-purple-500",
      },
      Cancelled: {
        bg: "bg-red-50 dark:bg-red-500/10",
        text: "text-red-700 dark:text-red-400",
        dot: "bg-red-500",
      },
    };
    return configs[status] || configs.Processing;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Orders Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track and manage all your e-commerce orders
            </p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200">
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <DollarSign size={20} />
              </div>
              <TrendingUp size={18} className="opacity-75" />
            </div>
            <div className="space-y-1">
              <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold">
                ${stats.totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <ShoppingBag size={20} />
              </div>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                +12%
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-emerald-100 text-sm font-medium">
                Total Orders
              </p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-purple-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <Package size={20} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-purple-100 text-sm font-medium">Delivered</p>
              <p className="text-2xl font-bold">{stats.delivered}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white shadow-lg shadow-amber-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <Clock size={20} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-amber-100 text-sm font-medium">Processing</p>
              <p className="text-2xl font-bold">{stats.processing}</p>
            </div>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
          {/* Filter Section */}
          <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-900">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search orders, customers, products..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-gray-500 transition-all shadow-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Filter Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-xl border transition-all ${
                    showFilters || hasActiveFilters
                      ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-750"
                  }`}
                >
                  <SlidersHorizontal size={18} />
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <span className="flex items-center justify-center w-5 h-5 text-xs bg-blue-600 text-white rounded-full font-semibold">
                      {(searchTerm ? 1 : 0) + (statusFilter !== "all" ? 1 : 0)}
                    </span>
                  )}
                </button>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <X size={18} />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Expandable Filter Options */}
            {showFilters && (
              <div className="mt-5 pt-5 border-t border-gray-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200">
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Filter
                      size={18}
                      className="text-gray-500 dark:text-gray-400"
                    />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Status:
                    </span>
                  </div>
                  {[
                    "all",
                    "Delivered",
                    "Processing",
                    "Shipped",
                    "Cancelled",
                  ].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusFilter(status)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        statusFilter === status
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-750"
                      }`}
                    >
                      {status === "all" ? "All Orders" : status}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="px-6 py-3 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {startIndex + 1}-{Math.min(endIndex, filteredData.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {filteredData.length}
              </span>{" "}
              orders
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {currentData.length > 0 ? (
                  currentData.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 dark:text-white text-sm">
                              {order.orderNumber}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {order.paymentMethod}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-slate-700 flex-shrink-0">
                              <img
                                src={order.customer.image}
                                alt={order.customer.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                {order.customer.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {order.customer.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white font-medium max-w-xs truncate">
                            {order.product}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg text-sm font-semibold">
                            {order.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-base font-bold text-gray-900 dark:text-white">
                            ${order.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}
                            />
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {new Date(order.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="relative inline-block">
                            <button
                              onClick={() =>
                                setActiveDropdown(
                                  activeDropdown === order.id ? null : order.id
                                )
                              }
                              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <MoreVertical
                                size={18}
                                className="text-gray-500 dark:text-gray-400"
                              />
                            </button>
                            {activeDropdown === order.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 z-10 py-1">
                                <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-750 flex items-center gap-2 transition-colors">
                                  <Eye size={16} />
                                  View Details
                                </button>
                                <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-750 flex items-center gap-2 transition-colors">
                                  <Edit size={16} />
                                  Edit Order
                                </button>
                                <button className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors">
                                  <Trash2 size={16} />
                                  Cancel Order
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-750 flex items-center justify-center">
                          <Search
                            className="text-gray-400 dark:text-gray-500"
                            size={32}
                          />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                            No orders found
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Try adjusting your search or filters
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Rows Per Page */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Rows per page:
                  </span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) =>
                      handleRowsPerPageChange(Number(e.target.value))
                    }
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-all cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800 transition-all"
                  >
                    <ChevronsLeft size={18} />
                  </button>

                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800 transition-all"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        if (totalPages <= 7) return true;
                        if (page === 1 || page === totalPages) return true;
                        if (page >= currentPage - 1 && page <= currentPage + 1)
                          return true;
                        return false;
                      })
                      .map((page, index, array) => {
                        const prevPage = array[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;

                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && (
                              <span className="px-2 text-gray-500 dark:text-gray-400">
                                ...
                              </span>
                            )}
                            <button
                              onClick={() => goToPage(page)}
                              className={`min-w-[40px] px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                                currentPage === page
                                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                                  : "border border-gray-200 text-gray-700 hover:bg-white dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800"
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800 transition-all"
                  >
                    <ChevronRight size={18} />
                  </button>

                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800 transition-all"
                  >
                    <ChevronsRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
