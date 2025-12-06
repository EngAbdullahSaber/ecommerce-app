// components/shared/TableFilters.tsx
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  Sparkles,
  Calendar,
  Hash,
  Type,
} from "lucide-react";
import { Input } from "./Input";
import { Select } from "./Select";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

// React Date Range imports
import { DateRangePicker, Range, RangeKeyDict } from "react-date-range";
import { addDays, format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

interface FilterField {
  key: string;
  label: string;
  type: "text" | "select" | "date" | "date-range" | "number" | "checkbox";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface TableFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilter: (status: string) => void;
  showFilters: boolean;
  onShowFiltersChange: (show: boolean) => void;
  onClearFilters: () => void;
  searchPlaceholder?: string;
  filterOptions?: string[];
  filterLabel?: string;
  additionalFilters?: FilterField[];
  filterValues?: Record<string, any>;
  onFilterChange?: (key: string, value: any) => void;
}

export function TableFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilter,
  showFilters,
  onShowFiltersChange,
  onClearFilters,
  searchPlaceholder = "Search anything...",
  filterOptions = ["all", "Delivered", "Processing", "Shipped", "Cancelled"],
  filterLabel = "Status",
  additionalFilters = [],
  filterValues = {},
  onFilterChange,
}: TableFiltersProps) {
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setShowDatePicker(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasActiveFilters =
    searchTerm !== "" ||
    statusFilter !== "all" ||
    additionalFilters.some((filter) => {
      const value = filterValues[filter.key];
      return value !== undefined && value !== "" && value !== null;
    });

  const activeCount =
    (searchTerm ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    additionalFilters.filter((filter) => {
      const value = filterValues[filter.key];
      return value !== undefined && value !== "" && value !== null;
    }).length;

  const getFilterIcon = (type: string) => {
    switch (type) {
      case "date":
      case "date-range":
        return <Calendar size={16} />;
      case "number":
        return <Hash size={16} />;
      case "text":
      default:
        return <Type size={16} />;
    }
  };

  // Format date range for display
  const formatDateRangeDisplay = (range: any): string => {
    if (!range?.startDate || !range?.endDate) return "";

    const start = range.startDate;
    const end = range.endDate;

    if (range.startDate.getTime() === range.endDate.getTime()) {
      return format(start, "MMM dd, yyyy");
    }

    return `${format(start, "MMM dd, yyyy")} - ${format(end, "MMM dd, yyyy")}`;
  };

  // Handle date range change
  const handleDateRangeChange = (key: string, ranges: RangeKeyDict) => {
    const range = ranges.selection;
    onFilterChange?.(key, {
      startDate: range.startDate,
      endDate: range.endDate,
      key: range.key,
    });
  };

  // Handle single date change
  const handleDateChange = (key: string, ranges: RangeKeyDict) => {
    const range = ranges.selection;
    onFilterChange?.(key, {
      startDate: range.startDate,
      endDate: range.startDate, // Same date for single date selection
      key: range.key,
    });
  };

  // Clear date selection
  const clearDateSelection = (key: string) => {
    onFilterChange?.(key, null);
    setShowDatePicker(null);
  };

  const renderFilter = (field: FilterField) => {
    const value = filterValues[field.key];

    switch (field.type) {
      case "select":
        return (
          <Select
            value={value}
            onChange={(newValue: string) =>
              onFilterChange?.(field.key, newValue)
            }
            options={field.options || []}
            placeholder={field.placeholder}
          />
        );

      case "date":
        const displayDate = value?.startDate
          ? format(new Date(value.startDate), "MMM dd, yyyy")
          : "";

        return (
          <div ref={datePickerRef} className="relative">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() =>
                setShowDatePicker(
                  showDatePicker === field.key ? null : field.key
                )
              }
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-left hover:border-blue-500 dark:hover:border-blue-500 transition-colors flex items-center justify-between group"
            >
              <span
                className={
                  displayDate
                    ? "text-gray-900 dark:text-white text-sm"
                    : "text-gray-500 text-sm"
                }
              >
                {displayDate || field.placeholder || "Select date"}
              </span>
              <Calendar
                size={16}
                className="text-gray-400 group-hover:text-blue-500 transition-colors"
              />
            </motion.button>

            {showDatePicker === field.key && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute z-50 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 p-4"
              >
                <DateRangePicker
                  onChange={(ranges: RangeKeyDict) =>
                    handleDateChange(field.key, ranges)
                  }
                  moveRangeOnFirstSelection={false}
                  months={1}
                  direction="horizontal"
                  ranges={[
                    {
                      startDate: value?.startDate
                        ? new Date(value.startDate)
                        : new Date(),
                      endDate: value?.startDate
                        ? new Date(value.startDate)
                        : new Date(),
                      key: "selection",
                    },
                  ]}
                  rangeColors={["#3b82f6"]}
                  className="rounded-lg"
                />

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <button
                    onClick={() => clearDateSelection(field.key)}
                    className="flex-1 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowDatePicker(null)}
                    className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Apply
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        );

      case "date-range":
        const displayRange = value ? formatDateRangeDisplay(value) : "";

        return (
          <div ref={datePickerRef} className="relative">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() =>
                setShowDatePicker(
                  showDatePicker === field.key ? null : field.key
                )
              }
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-left hover:border-blue-500 dark:hover:border-blue-500 transition-colors flex items-center justify-between group"
            >
              <span
                className={
                  displayRange
                    ? "text-gray-900 dark:text-white text-sm"
                    : "text-gray-500 text-sm"
                }
              >
                {displayRange || field.placeholder || "Select date range"}
              </span>
              <Calendar
                size={16}
                className="text-gray-400 group-hover:text-blue-500 transition-colors"
              />
            </motion.button>

            {showDatePicker === field.key && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute z-50 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 p-4"
              >
                <DateRangePicker
                  onChange={(ranges: RangeKeyDict) =>
                    handleDateRangeChange(field.key, ranges)
                  }
                  moveRangeOnFirstSelection={false}
                  months={2}
                  direction="horizontal"
                  ranges={[
                    {
                      startDate: value?.startDate
                        ? new Date(value.startDate)
                        : new Date(),
                      endDate: value?.endDate
                        ? new Date(value.endDate)
                        : addDays(new Date(), 7),
                      key: "selection",
                    },
                  ]}
                  rangeColors={["#3b82f6"]}
                  className="rounded-lg"
                />

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <button
                    onClick={() => clearDateSelection(field.key)}
                    className="flex-1 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowDatePicker(null)}
                    className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Apply
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        );

      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={(val: string) => onFilterChange?.(field.key, val)}
            placeholder={field.placeholder}
            removeWrapper
          />
        );

      case "checkbox":
        return (
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => onFilterChange?.(field.key, e.target.checked)}
              className="peer sr-only"
            />
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="relative w-5 h-5 border-2 border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all duration-200 flex items-center justify-center group-hover:border-blue-400"
            >
              <AnimatePresence>
                {value && (
                  <motion.svg
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              {field.label}
            </span>
          </label>
        );

      case "text":
      default:
        return (
          <Input
            value={value}
            onChange={(val: string) => onFilterChange?.(field.key, val)}
            placeholder={field.placeholder}
            removeWrapper
          />
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
      <div className="px-6 py-5">
        {/* Top Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 w-full max-w-xl"
          >
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                value={searchTerm}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
                className="pl-11 pr-4 py-2.5 w-full bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 dark:focus:border-blue-500 rounded-lg transition-all"
                clearable
                removeWrapper
                variant="bordered"
              />
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2.5"
          >
            <motion.button
              onClick={() => onShowFiltersChange(!showFilters)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2
                transition-all duration-200
                ${
                  showFilters || hasActiveFilters
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                    : "bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700"
                }
              `}
            >
              <SlidersHorizontal size={18} />
              <span>Filters</span>
              <AnimatePresence>
                {activeCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-white text-blue-600 rounded-full text-xs font-bold"
                  >
                    {activeCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <AnimatePresence>
              {hasActiveFilters && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClearFilters}
                  className="px-4 py-2.5 rounded-lg font-semibold text-sm bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-all flex items-center gap-2"
                >
                  <X size={18} />
                  <span>Clear</span>
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 24 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 overflow-hidden"
            >
              {/* Status Pills */}
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Filter
                      size={16}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                    {filterLabel}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.map((status) => {
                    const active = statusFilter === status;
                    return (
                      <motion.button
                        key={status}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onStatusFilter(status)}
                        className={`
                          px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                          ${
                            active
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700"
                          }
                        `}
                      >
                        {status === "all" ? "All" : status}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Advanced Filters */}
              {additionalFilters.length > 0 && (
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Sparkles
                        size={16}
                        className="text-purple-600 dark:text-purple-400"
                      />
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                      Advanced Filters
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {additionalFilters.map((field) => (
                      <div key={field.key}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-gray-500 dark:text-gray-400">
                            {getFilterIcon(field.type)}
                          </div>
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            {field.label}
                          </label>
                        </div>
                        {renderFilter(field)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
