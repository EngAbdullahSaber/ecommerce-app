// components/shared/GenericView.tsx
"use client";
import React, { useState, useEffect } from "react";
import {
  X,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  Share2,
  Copy,
  Check,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Package,
  FileText,
  ExternalLink,
} from "lucide-react";

// Field Types for Display
export type ViewFieldType =
  | "text"
  | "email"
  | "phone"
  | "number"
  | "currency"
  | "date"
  | "datetime"
  | "time"
  | "boolean"
  | "badge"
  | "image"
  | "link"
  | "list"
  | "json"
  | "html"
  | "custom";

export interface ViewSection {
  title: string;
  description?: string;
  fields: ViewField[];
  columns?: 1 | 2 | 3 | 4; // Number of columns for this section
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface ViewField {
  name: string;
  label: string;
  type: ViewFieldType;
  icon?: React.ReactNode;
  format?: (value: any) => string; // Custom formatter
  render?: (value: any, data: any) => React.ReactNode; // Custom render
  badge?: {
    success?: string[];
    warning?: string[];
    error?: string[];
    info?: string[];
  };
  copyable?: boolean; // Show copy button
  linkTo?: (value: any) => string; // For link type
  className?: string;
  hide?: (data: any) => boolean; // Conditionally hide field
}

export interface GenericViewProps<T = any> {
  title: string;
  subtitle?: string;
  entityId: string | number;
  fetchData: (id: string | number) => Promise<T>;
  sections: ViewSection[];
  onBack?: () => void;
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
  onDownload?: (data: T) => void;
  onShare?: (data: T) => void;
  showActions?: boolean;
  className?: string;
  headerComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
}

export function GenericView<T = any>({
  title,
  subtitle,
  entityId,
  fetchData,
  sections,
  onBack,
  onEdit,
  onDelete,
  onDownload,
  onShare,
  showActions = true,
  className = "",
  headerComponent,
  footerComponent,
}: GenericViewProps<T>) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set(
      sections
        .map((_, i) => (sections[i].defaultExpanded !== false ? i : -1))
        .filter((i) => i >= 0)
    )
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchData(entityId);
        setData(result);
      } catch (err: any) {
        console.error("Failed to fetch data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [entityId, fetchData]);

  const handleCopy = async (value: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const formatValue = (field: ViewField, value: any, fullData: any) => {
    if (value === null || value === undefined) {
      return <span className="text-slate-400 italic">Not provided</span>;
    }

    // Custom render takes precedence
    if (field.render) {
      return field.render(value, fullData);
    }

    // Custom format
    if (field.format) {
      return field.format(value);
    }

    switch (field.type) {
      case "email":
        return (
          <a
            href={`mailto:${value}`}
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
          >
            <Mail size={14} />
            {value}
          </a>
        );

      case "phone":
        return (
          <a
            href={`tel:${value}`}
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
          >
            <Phone size={14} />
            {value}
          </a>
        );

      case "link":
        const url = field.linkTo ? field.linkTo(value) : value;
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
          >
            {value}
            <ExternalLink size={14} />
          </a>
        );

      case "currency":
        return (
          <span className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ${typeof value === "number" ? value.toFixed(2) : value}
          </span>
        );

      case "number":
        return <span className="font-semibold">{value.toLocaleString()}</span>;

      case "date":
        return (
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Calendar size={14} className="text-slate-400" />
            {new Date(value).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        );

      case "datetime":
        return (
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Clock size={14} className="text-slate-400" />
            {new Date(value).toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        );

      case "time":
        return (
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Clock size={14} className="text-slate-400" />
            {new Date(value).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        );

      case "boolean":
        return value ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold">
            <Check size={14} />
            Yes
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-sm font-semibold">
            <X size={14} />
            No
          </span>
        );

      case "badge":
        let badgeClass =
          "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300";
        if (field.badge?.success?.includes(value)) {
          badgeClass =
            "bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-500/10 dark:to-green-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20";
        } else if (field.badge?.warning?.includes(value)) {
          badgeClass =
            "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20";
        } else if (field.badge?.error?.includes(value)) {
          badgeClass =
            "bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-500/10 dark:to-pink-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20";
        } else if (field.badge?.info?.includes(value)) {
          badgeClass =
            "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-500/10 dark:to-cyan-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20";
        }
        return (
          <span
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold ${badgeClass}`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {value}
          </span>
        );

      case "image":
        return (
          <img
            src={value}
            alt={field.label}
            className="w-32 h-32 object-cover rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-md"
          />
        );

      case "list":
        const items = Array.isArray(value) ? value : [];
        return (
          <ul className="space-y-1">
            {items.map((item, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {item}
              </li>
            ))}
          </ul>
        );

      case "json":
        return (
          <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded-lg overflow-x-auto border border-slate-200 dark:border-slate-700">
            {JSON.stringify(value, null, 2)}
          </pre>
        );

      case "html":
        return <div dangerouslySetInnerHTML={{ __html: value }} />;

      default:
        return (
          <span className="text-slate-900 dark:text-white">
            {String(value)}
          </span>
        );
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
          <div className="p-8">
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <Loader2 size={40} className="text-blue-600 animate-spin" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl animate-pulse" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Loading Details...
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Please wait
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !data) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-red-600 via-orange-600 to-red-600" />
          <div className="p-8">
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                  <AlertTriangle size={40} className="text-red-600" />
                </div>
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400">
                  Failed to Load
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {error || "Data not found"}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl opacity-0 group-hover:opacity-10 blur-xl transition-all duration-500" />

      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
        {/* Top Gradient Bar */}
        <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-800/50 dark:to-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 group/back"
                >
                  <ArrowLeft
                    size={20}
                    className="text-slate-600 dark:text-slate-400 group-hover/back:-translate-x-1 transition-transform duration-300"
                  />
                </button>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {showActions && (
              <div className="flex items-center gap-2">
                {onShare && (
                  <button
                    onClick={() => onShare(data)}
                    className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 group/share"
                    title="Share"
                  >
                    <Share2
                      size={18}
                      className="text-slate-600 dark:text-slate-400 group-hover/share:scale-110 transition-transform"
                    />
                  </button>
                )}
                {onDownload && (
                  <button
                    onClick={() => onDownload(data)}
                    className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 group/download"
                    title="Download"
                  >
                    <Download
                      size={18}
                      className="text-slate-600 dark:text-slate-400 group-hover/download:scale-110 transition-transform"
                    />
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => onEdit(entityId)}
                    className="p-2.5 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 dark:from-blue-500/10 dark:to-blue-600/10 dark:hover:from-blue-500/20 dark:hover:to-blue-600/20 text-blue-600 dark:text-blue-400 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg border border-blue-200/50 dark:border-blue-500/20 shadow-sm"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(entityId)}
                    className="p-2.5 bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 dark:from-red-500/10 dark:to-red-600/10 dark:hover:from-red-500/20 dark:hover:to-red-600/20 text-red-600 dark:text-red-400 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg border border-red-200/50 dark:border-red-500/20 shadow-sm"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Custom Header Component */}
          {headerComponent && <div className="mt-4">{headerComponent}</div>}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {sections.map((section, sectionIndex) => {
            const isExpanded = expandedSections.has(sectionIndex);
            const gridCols = section.columns || 2;

            return (
              <div
                key={sectionIndex}
                className="bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-800/30 dark:to-slate-900/30 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden"
              >
                {/* Section Header */}
                <div
                  className={`px-5 py-4 border-b border-slate-200/80 dark:border-slate-800/80 ${
                    section.collapsible
                      ? "cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                      : ""
                  } transition-colors duration-200`}
                  onClick={() =>
                    section.collapsible && toggleSection(sectionIndex)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {section.title}
                      </h3>
                      {section.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {section.description}
                        </p>
                      )}
                    </div>
                    {section.collapsible && (
                      <div
                        className={`transform transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      >
                        <svg
                          className="w-5 h-5 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section Content */}
                {(!section.collapsible || isExpanded) && (
                  <div
                    className={`p-5 grid grid-cols-1 ${
                      gridCols === 2
                        ? "md:grid-cols-2"
                        : gridCols === 3
                        ? "md:grid-cols-3"
                        : gridCols === 4
                        ? "md:grid-cols-4"
                        : ""
                    } gap-6`}
                  >
                    {section.fields.map((field) => {
                      // Check if field should be hidden
                      if (field.hide && field.hide(data)) {
                        return null;
                      }

                      const value = (data as any)[field.name];

                      return (
                        <div key={field.name} className={field.className || ""}>
                          <div className="flex items-center gap-2 mb-2">
                            {field.icon && (
                              <div className="text-slate-400">{field.icon}</div>
                            )}
                            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                              {field.label}
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              {formatValue(field, value, data)}
                            </div>
                            {field.copyable && value && (
                              <button
                                onClick={() =>
                                  handleCopy(String(value), field.name)
                                }
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 group/copy"
                                title="Copy"
                              >
                                {copiedField === field.name ? (
                                  <Check size={14} className="text-green-600" />
                                ) : (
                                  <Copy
                                    size={14}
                                    className="text-slate-400 group-hover/copy:text-slate-600 dark:group-hover/copy:text-slate-300"
                                  />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Custom Footer Component */}
        {footerComponent && (
          <div className="px-6 py-5 border-t border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-800/30 dark:to-slate-900/30">
            {footerComponent}
          </div>
        )}
      </div>
    </div>
  );
}
