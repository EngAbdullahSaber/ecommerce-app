import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Layout, 
  RefreshCw, 
  ArrowLeft, 
  Settings, 
  Grid, 
  Plus, 
  Trash2, 
  X,
  ChevronRight,
  Hash,
  Calendar,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  Package,
  Image as ImageIcon,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from "lucide-react";
import { GetSpecifiedMethod, DeleteMethod } from "../../../services/apis/ApiMethod";
import { DeleteDialog } from "../../../components/shared/DeleteDialog";
import { useToast } from "../../../hooks/useToast";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

interface Collection {
  id: number;
  categorySectionId: number;
  collectionId: number;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Section {
  id: number;
  title: string;
  type: string;
  refId: number;
  isActive: boolean;
  key: string;
  keyAr: string;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  collections: Collection[];
}

interface SectionsResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: {
    sections: Section[];
  };
}

export default function ParentCategorySectionsPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    section: Section | null;
  }>({
    isOpen: false,
    section: null,
  });

  const [deleteCollectionDialog, setDeleteCollectionDialog] = useState<{
    isOpen: boolean;
    sectionId: number | null;
    collectionId: number | null;
    collectionImage?: string;
  }>({
    isOpen: false,
    sectionId: null,
    collectionId: null,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "SPECIFIC_CATEGORIES" | "SPECIFIC_BRANDS" | "SPECIFIC_FILTERS">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"order" | "name" | "collections">("order");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [expandedSections, setExpandedSections] = useState<number[]>([]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const deleteCollectionMutation = useMutation({
    mutationFn: ({ sectionId, collectionId }: { sectionId: number, collectionId: number }) => 
      DeleteMethod(`categories/${id}/sections/${sectionId}/collections`, collectionId.toString(), "en"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-sections", id] });
      setDeleteCollectionDialog({ isOpen: false, sectionId: null, collectionId: null });
      toast.success(t("categorySections.deleteCollection.success"));
    },
    onError: (error: any) => {
      console.error("Error deleting collection item:", error);
      toast.error(t("categorySections.deleteCollection.error"));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (sectionId: number) =>
      DeleteMethod(`categories/${id}/sections`, sectionId.toString(), "en"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-sections", id] });
      setDeleteDialog({ isOpen: false, section: null });
      toast.success(t("categorySections.delete.success"));
    },
    onError: (error: any) => {
      console.error("Error deleting section:", error);
      toast.error(t("categorySections.delete.error"));
    }
  });

  const fetchSections = async (): Promise<Section[]> => {
    try {
      const response = (await GetSpecifiedMethod(
        `categories/${id}/sections`,
        "en"
      )) as SectionsResponse;

      if (!response || response.code !== 200) {
        throw new Error(
          response?.message?.english || t("categorySections.errorMessage")
        );
      }

      return response.data?.sections || [];
    } catch (error) {
      console.error("Error fetching sections:", error);
      toast.error(t("categorySections.errorMessage"));
      return [];
    }
  };

  const {
    data: sections = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["category-sections", id],
    queryFn: fetchSections,
    enabled: !!id,
  });

  const handleRefresh = () => {
    refetch();
  };

  const toggleSectionExpand = (sectionId: number) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const formatImageUrl = (url: string) => {
    if (!url || url === "undefined/images/" || url.includes("undefined")) {
      return "/placeholder-category.png";
    }
    if (url.startsWith("http")) {
      return url;
    }
    return import.meta.env.VITE_IMAGE_BASE_URL
      ? `${import.meta.env.VITE_IMAGE_BASE_URL}/${url.replace(/^\/+/, "")}`
      : url;
  };

  // Filter and sort sections
  const filteredSections = sections.filter(section => {
    const matchesSearch = section.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                         section.key.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    const matchesType = typeFilter === "all" ? true : section.type === typeFilter;
    const matchesStatus = statusFilter === "all" ? true : 
                         statusFilter === "active" ? section.isActive : !section.isActive;
    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === "order") {
      return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
    } else if (sortBy === "name") {
      return sortOrder === "asc" 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else {
      return sortOrder === "asc" 
        ? a.collections.length - b.collections.length
        : b.collections.length - a.collections.length;
    }
  });

  const totalCollections = sections.reduce((sum, section) => sum + section.collections.length, 0);
  const activeSections = sections.filter(s => s.isActive).length;
  const inactiveSections = sections.filter(s => !s.isActive).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="max-w-[1600px] mx-auto p-6 md:p-8 lg:p-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/parent-categories")}
                className="group p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
                  <Layout size={32} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                  {t("categorySections.title")}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                  {t("categorySections.description", { category: id })}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="group relative px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-medium shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-700 disabled:opacity-50"
              >
                <RefreshCw 
                  size={18} 
                  className={`${isLoading ? "animate-spin" : "group-hover:rotate-180"} transition-all duration-500`} 
                />
              </button>

              <button
                onClick={() => navigate(`/parent-categories/sections/${id}/create`)}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-300 active:scale-95"
              >
                <Plus size={18} />
                <span>{t("categorySections.create.title")}</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-8">
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Sections</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{sections.length}</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                  <Layers size={24} className="text-blue-500" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{activeSections}</p>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                  <Eye size={24} className="text-emerald-500" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Inactive</p>
                  <p className="text-3xl font-bold text-slate-500 dark:text-slate-400 mt-1">{inactiveSections}</p>
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl">
                  <EyeOff size={24} className="text-slate-500" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Collections</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">{totalCollections}</p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
                  <Package size={24} className="text-purple-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search sections by name or key..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
         

            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                  statusFilter === "all"
                    ? "bg-slate-600 text-white shadow-md"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                  statusFilter === "active"
                    ? "bg-emerald-500 text-white shadow-md"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter("inactive")}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                  statusFilter === "inactive"
                    ? "bg-slate-500 text-white shadow-md"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                Inactive
              </button>
            </div>

            {/* Sort Controls */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="order">Sort by ID</option>
                <option value="name">Sort by Name</option>
                <option value="collections">Sort by Collections</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                {sortOrder === "asc" ? <SortAsc size={20} /> : <SortDesc size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-white dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-700" />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-full w-fit mx-auto mb-6">
              <Layout size={48} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {t("categorySections.errorTitle")}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
              {t("categorySections.errorMessage")}
            </p>
            <button
              onClick={handleRefresh}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all active:scale-95"
            >
              {t("common.tryAgain")}
            </button>
          </div>
        )}

        {/* Sections List */}
        {!isLoading && !isError && (
          <>
            {filteredSections.length > 0 ? (
              <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {filteredSections.map((section, index) => (
                    <motion.div
                      key={section.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-300 overflow-hidden"
                    >
                      {/* Gradient Border Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-[1px] -z-10" />
                      
                      <div className="relative p-6">
                        {/* Section Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                                section.type === "SPECIFIC_CATEGORIES"
                                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                  : section.type === "SPECIFIC_BRANDS"
                                  ? "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
                                  : "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                              }`}>
                                {section.type === "SPECIFIC_CATEGORIES" ? "Categories" :
                                 section.type === "SPECIFIC_BRANDS" ? "Brands" : "Filters"}
                              </div>
                              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                                section.isActive
                                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                  : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                              }`}>
                                {section.isActive ? (
                                  <>
                                    <Eye size={12} />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <EyeOff size={12} />
                                    Inactive
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                <Hash size={12} className="text-slate-400" />
                                <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                                  ID: {section.id}
                                </span>
                              </div>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                              {section.title}
                            </h3>
                            
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs font-mono">
                                  {section.key}
                                </code>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                <Calendar size={14} />
                                <span className="text-xs">
                                  Updated: {new Date(section.updatedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleSectionExpand(section.id)}
                              className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-all"
                              title={expandedSections.includes(section.id) ? "Collapse" : "Expand"}
                            >
                              <ChevronRightIcon 
                                size={18} 
                                className={`transition-transform duration-300 ${
                                  expandedSections.includes(section.id) ? "rotate-90" : ""
                                }`}
                              />
                            </button>
                            <button
                              onClick={() => navigate(`/parent-categories/sections/${id}/update/${section.id}`)}
                              className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all"
                              title="Edit Section"
                            >
                              <Settings size={18} />
                            </button>
                            <button
                              onClick={() => setDeleteDialog({ isOpen: true, section: section })}
                              className="p-2.5 bg-red-50 dark:bg-red-500/10 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
                              title="Delete Section"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                        {/* Collections Section */}
                        <AnimatePresence>
                          {expandedSections.includes(section.id) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                  <Package size={18} className="text-slate-400" />
                                  <h4 className="font-bold text-slate-700 dark:text-slate-300">
                                    Collections
                                  </h4>
                                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-semibold">
                                    {section.collections.length}
                                  </span>
                                </div>
                              </div>
                              
                              {section.collections.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                  {section.collections.map((col) => (
                                    <div
                                      key={col.id}
                                      className="group/item relative"
                                    >
                                      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 group-hover/item:border-blue-400 transition-all shadow-sm hover:shadow-lg">
                                        <img
                                          src={formatImageUrl(col.image || "")}
                                          alt={`Collection ${col.collectionId}`}
                                          className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = "https://placehold.co/300x300/e2e8f0/94a3b8?text=No+Image";
                                          }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity flex flex-col items-center justify-end p-3">
                                          <span className="text-white text-xs font-bold bg-blue-600/80 px-2 py-1 rounded-lg mb-2">
                                            ID: {col.collectionId}
                                          </span>
                                          <button
                                            onClick={() => setDeleteCollectionDialog({
                                              isOpen: true,
                                              sectionId: section.id,
                                              collectionId: col.id,
                                              collectionImage: col.image || undefined
                                            })}
                                            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-all"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                  <Package size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                                  <p className="text-sm text-slate-500 dark:text-slate-400">
                                    No collections in this section
                                  </p>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700">
                <div className="p-6 bg-slate-100 dark:bg-slate-700 rounded-full w-fit mx-auto mb-6">
                  <Layout size={64} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {t("categorySections.noSections")}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "No sections have been configured for this category yet."}
                </p>
                {!searchTerm && typeFilter === "all" && statusFilter === "all" && (
                  <button
                    onClick={() => navigate(`/parent-categories/sections/${id}/create`)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    <Plus size={18} />
                    Create First Section
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Section Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, section: null })}
        onConfirm={() => {
          if (deleteDialog.section) {
            deleteMutation.mutate(deleteDialog.section.id);
          }
        }}
        title={t("categorySections.delete.title")}
        description={t("categorySections.delete.description")}
        itemName={deleteDialog.section?.title || ""}
        isLoading={deleteMutation.isPending}
      />

      {/* Delete Collection Dialog */}
      <DeleteDialog
        isOpen={deleteCollectionDialog.isOpen}
        onClose={() => setDeleteCollectionDialog({ isOpen: false, sectionId: null, collectionId: null })}
        onConfirm={() => {
          if (deleteCollectionDialog.sectionId && deleteCollectionDialog.collectionId) {
            deleteCollectionMutation.mutate({ 
              sectionId: deleteCollectionDialog.sectionId, 
              collectionId: deleteCollectionDialog.collectionId 
            });
          }
        }}
        title={t("categorySections.deleteCollection.title")}
        description={t("categorySections.deleteCollection.description")}
        itemName={t("categorySections.fields.collections")}
        isLoading={deleteCollectionMutation.isPending}
      />
    </div>
  );
}