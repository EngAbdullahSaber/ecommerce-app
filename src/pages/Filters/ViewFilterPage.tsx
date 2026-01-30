// pages/filters/view/[id].tsx - View Filter Page with Translations
"use client";
import { useParams, useNavigate } from "react-router-dom";
import {
  Filter,
  Tag,
  List,
  Link,
  ArrowLeft,
  Info,
  CheckCircle,
  XCircle,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { GetSpecifiedMethod } from "../../services/apis/ApiMethod";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useState } from "react";

// Filter Interface based on your data structure
interface FilterOption {
  id: number;
  attributeId: number;
  value: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

interface FilterAttribute {
  id: number;
  key: string;
  name: string;
  sourcePath: string | null;
  isActive: boolean;
  options: FilterOption[];
  _count: {
    categories: number;
    values: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Fetch filter by ID
const fetchFilterById = async (id: string): Promise<any> => {
  try {
    const response = await GetSpecifiedMethod(`/filter-attributes/${id}`, "en");

    if (!response || !response.data) {
      throw new Error("Filter not found");
    }

    return response.data as FilterAttribute;
  } catch (error) {
    console.error("Error fetching filter:", error);
    throw error;
  }
};

export default function ViewFilterPage() {
  const { t } = useTranslation();
  const params = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const filterId = params.id as string;
  const [copied, setCopied] = useState(false);

  // Fetch filter data
  const {
    data: filter,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["filter", filterId],
    queryFn: () => fetchFilterById(filterId),
    enabled: !!filterId,
  });

  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success(t("filters.view.messages.copied"));
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-violet-50/30 dark:from-slate-950 dark:via-purple-950/30 dark:to-violet-950/30 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/filters")}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors duration-200 group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            {t("filters.view.back")}
          </button>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-purple-600 to-violet-600" />
            <div className="p-8">
              <div className="flex flex-col items-center justify-center py-20 gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {t("filters.view.loading")}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t("filters.view.loadingMessage")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !filter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-violet-50/30 dark:from-slate-950 dark:via-purple-950/30 dark:to-violet-950/30 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/filters")}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors duration-200 group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            {t("filters.view.back")}
          </button>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-red-600 to-orange-600" />
            <div className="p-8">
              <div className="flex flex-col items-center justify-center py-20 gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                    <XCircle size={40} className="text-red-600" />
                  </div>
                </div>
                <div className="text-center space-y-3">
                  <h3 className="text-xl font-bold text-red-600 dark:text-red-400">
                    {t("filters.view.error")}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
                    {t("filters.view.errorMessage")}
                  </p>
                  <button
                    onClick={() => navigate("/filters")}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    {t("filters.view.retry")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-violet-50/30 dark:from-slate-950 dark:via-purple-950/30 dark:to-violet-950/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/filters")}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors duration-200 group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          {t("filters.view.back")}
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-xl">
              <Filter size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-purple-900 to-violet-900 dark:from-slate-100 dark:via-purple-100 dark:to-violet-100 bg-clip-text text-transparent">
                {filter.name}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("filters.view.description")}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/filters/edit/${filterId}`)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {t("filters.view.buttons.edit")}
              </button>
              <button
                onClick={() => navigate("/filters")}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {t("filters.view.buttons.backToList")}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-600 to-violet-600" />
              <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-800/50 dark:to-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-500/10 dark:to-violet-500/10 rounded-lg">
                    <Filter
                      size={20}
                      className="text-purple-600 dark:text-purple-400"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {t("filters.view.basicInfo.title")}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t("filters.view.basicInfo.description")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Key */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      {t("filters.view.fields.key")}
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-mono flex-1">
                        {filter.key}
                      </div>
                      <button
                        onClick={() => copyToClipboard(filter.key)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title={t("filters.view.buttons.copy")}
                      >
                        {copied ? (
                          <Check size={18} className="text-green-600" />
                        ) : (
                          <Copy size={18} className="text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      {t("filters.view.fields.name")}
                    </label>
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300">
                      {filter.name}
                    </div>
                  </div>

                  {/* Source Path */}
                  {filter.sourcePath && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {t("filters.view.fields.sourcePath")}
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-mono flex-1">
                          {filter.sourcePath}
                        </div>
                        <button
                          onClick={() => copyToClipboard(filter.sourcePath!)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title={t("filters.view.buttons.copy")}
                        >
                          <Copy size={18} className="text-slate-400" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      {t("filters.view.fields.status")}
                    </label>
                    <div
                      className={`px-4 py-3 rounded-xl font-medium ${
                        filter.isActive
                          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                          : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                      }`}
                    >
                      {filter.isActive
                        ? t("filters.view.fields.active")
                        : t("filters.view.fields.inactive")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Options Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
              <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-800/50 dark:to-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-lg">
                    <List
                      size={20}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {t("filters.view.options.title")}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t("filters.view.options.description", {
                        count: filter.options.length,
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-4">
                  {filter.options
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((option, index) => (
                      <div
                        key={option.id}
                        className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-500/20 dark:to-violet-500/20 rounded-lg">
                              <Tag
                                size={16}
                                className="text-purple-600 dark:text-purple-400"
                              />
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-white">
                                {t("filters.view.fields.option")} #{index + 1}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {t("filters.page.columns.id")}: {option.id} •{" "}
                                {t("filters.view.fields.sort")}:{" "}
                                {option.sortOrder}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              option.isActive
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                            }`}
                          >
                            {option.isActive
                              ? t("filters.view.fields.active")
                              : t("filters.view.fields.inactive")}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                              {t("filters.view.fields.value")}
                            </label>
                            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-sm">
                              {option.value}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                              {t("filters.view.fields.displayName")}
                            </label>
                            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
                              {option.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Statistics and Metadata */}
          <div className="space-y-6">
            {/* Statistics Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-green-600 to-emerald-600" />
              <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-800/50 dark:to-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 rounded-lg">
                    <Info
                      size={20}
                      className="text-green-600 dark:text-green-400"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {t("filters.view.statistics.title")}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t("filters.view.statistics.description")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                        <div className="w-6 h-6 flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 font-bold">
                            O
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                          {filter.options.length}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {t("filters.view.stats.totalOptions")}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-500/10 dark:to-green-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                        <CheckCircle
                          size={20}
                          className="text-emerald-600 dark:text-emerald-400"
                        />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                          {filter.options.filter((opt) => opt.isActive).length}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {t("filters.view.stats.activeOptions")}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-500/10 dark:to-violet-500/10 rounded-xl border border-purple-200 dark:border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
                        <div className="w-6 h-6 flex items-center justify-center">
                          <span className="text-purple-600 dark:text-purple-400 font-bold">
                            C
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                          {filter._count?.categories || 0}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {t("filters.view.stats.categoriesUsing")}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-500/10 dark:to-rose-500/10 rounded-xl border border-pink-200 dark:border-pink-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-100 dark:bg-pink-500/20 rounded-lg">
                        <div className="w-6 h-6 flex items-center justify-center">
                          <span className="text-pink-600 dark:text-pink-400 font-bold">
                            P
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-pink-700 dark:text-pink-300">
                          {filter._count?.values || 0}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {t("filters.view.stats.productsUsing")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
