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
  ChevronDown,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Input } from "./Input";
import { Select } from "./Select";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";

// React Date Range imports
import { DateRangePicker, Range, RangeKeyDict } from "react-date-range";
import { addDays, format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useTranslation } from "react-i18next";

// Types for paginated select
export interface FieldOption {
  label: string;
  value: string | number;
  [key: string]: any;
}

export interface PaginatedSelectConfig {
  endpoint: string;
  searchParam?: string;
  labelKey: string;
  valueKey: string;
  pageSize?: number;
  debounceTime?: number;
  additionalParams?: Record<string, any>;
  transformResponse?: (data: any) => FieldOption[];
}

export interface PaginatedFilterField {
  key: string;
  label: string;
  type: "paginatedSelect";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  paginatedSelectConfig: PaginatedSelectConfig;
  initialValue?: any;
}

interface FilterField {
  key: string;
  label: string;
  type:
    | "text"
    | "select"
    | "date"
    | "date-range"
    | "number"
    | "checkbox"
    | "paginatedSelect";
  options?: { value: string; label: string }[];
  placeholder?: string;
  paginatedSelectConfig?: PaginatedSelectConfig;
  initialValue?: any;
}

interface TableFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilter: (status: string) => void;
  showFilters: boolean;
  show: boolean;
  onShowFiltersChange: (show: boolean) => void;
  onClearFilters: () => void;
  searchPlaceholder?: string;
  filterOptions?: string[];
  filterLabel?: string;
  additionalFilters?: FilterField[];
  filterValues?: Record<string, any>;
  onFilterChange?: (key: string, value: any) => void;
  fetchOptions?: (endpoint: string, params: any) => Promise<any>;
}

// Custom hook for paginated select
function usePaginatedSelect(
  config: PaginatedSelectConfig,
  fetchOptions?: TableFiltersProps["fetchOptions"],
) {
  const [options, setOptions] = useState<FieldOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(
    async (
      pageNum: number,
      searchQuery: string = "",
      reset: boolean = false,
    ) => {
      if (loading || (!hasMore && pageNum > 1 && !reset)) return;

      setLoading(true);
      try {
        const params: any = {
          page: pageNum,
          pageSize: config.pageSize || 10,
          ...config.additionalParams,
        };

        if (searchQuery && config.searchParam) {
          params[config.searchParam] = searchQuery;
        }

        let response;
        if (fetchOptions) {
          response = await fetchOptions(config.endpoint, params);
        } else {
          // Default fetch implementation
          const queryString = new URLSearchParams(params).toString();
          const res = await fetch(`${config.endpoint}?${queryString}`);
          response = await res.json();
        }

        const data = response.data || response.items || response;
        const totalItems =
          response.meta?.total || response.total || data.length;

        let newOptions: FieldOption[];
        if (config.transformResponse) {
          newOptions = config.transformResponse(data);
        } else {
          newOptions = data.map((item: any) => ({
            label: item[config.labelKey],
            value: item[config.valueKey],
            ...item,
          }));
        }

        if (reset) {
          setOptions(newOptions);
        } else {
          setOptions((prev) => [...prev, ...newOptions]);
        }

        setTotal(totalItems);
        setHasMore(newOptions.length === (config.pageSize || 10));
        setPage(pageNum);
      } catch (error) {
        console.error("Error fetching paginated select data:", error);
      } finally {
        setLoading(false);
      }
    },
    [config, loading, hasMore, fetchOptions],
  );

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchData(page + 1, search);
    }
  };

  const handleSearch = useCallback(
    debounce((searchQuery: string) => {
      setSearch(searchQuery);
      setPage(1);
      setOptions([]);
      setHasMore(true);
      fetchData(1, searchQuery, true);
    }, config.debounceTime || 500),
    [config, fetchData],
  );

  // Initial load
  useEffect(() => {
    fetchData(1, "", true);
  }, []);

  return {
    options,
    loading,
    hasMore,
    search,
    setSearch: handleSearch,
    loadMore,
    total,
    refresh: () => fetchData(1, search, true),
  };
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Paginated Select Component
interface PaginatedSelectProps {
  config: PaginatedSelectConfig;
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  disabled?: boolean;
  fetchOptions?: TableFiltersProps["fetchOptions"];
}

const PaginatedSelectComponent: React.FC<PaginatedSelectProps> = ({
  config,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  fetchOptions,
}) => {
  const { options, loading, hasMore, search, setSearch, loadMore, total } =
    usePaginatedSelect(config, fetchOptions);

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Find selected option label
  useEffect(() => {
    const selectedOption = options.find((opt) => opt.value === value);
    setSelectedLabel(selectedOption?.label || "");
    if (selectedOption) {
      setInputValue(selectedOption.label);
    }
  }, [value, options]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (!listRef.current || !hasMore || loading) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      loadMore();
    }
  }, [hasMore, loading, loadMore]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSearch(newValue);
    setIsOpen(true);
  };

  const handleSelect = (option: FieldOption) => {
    onChange(option.value);
    setInputValue(option.label);
    setSelectedLabel(option.label);
    setIsOpen(false);
  };

  const clearSelection = () => {
    onChange("");
    setInputValue("");
    setSelectedLabel("");
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleSearchChange}
          onClick={() => setIsOpen(!isOpen)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 
            focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 
            disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
            pr-12 hover:border-blue-500 dark:hover:border-blue-500"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {loading ? (
            <Loader2 size={16} className="animate-spin text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </div>
        {value && (
          <button
            type="button"
            onClick={clearSelection}
            className={`absolute inset-y-0 flex items-center pr-2 text-gray-400 hover:text-red-500 transition-colors`}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg shadow-2xl max-h-64">
          {/* Search header */}
          <div className="p-2 border-b border-gray-200 dark:border-slate-700">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={inputValue}
                onChange={handleSearchChange}
                placeholder={`Search ${total} options...`}
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                autoFocus
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Showing {options.length} of {total} options
            </div>
          </div>

          {/* Options list */}
          <div
            ref={listRef}
            onScroll={handleScroll}
            className="overflow-y-auto max-h-48"
          >
            {options.length === 0 && !loading ? (
              <div className="py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                No options found
              </div>
            ) : (
              options.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={`px-3 py-2 text-sm cursor-pointer transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
                    value === option.value
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{option.label}</span>
                    {value === option.value && (
                      <CheckCircle2
                        size={14}
                        className="text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2"
                      />
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Loading indicator */}
            {loading && (
              <div className="py-2 text-center">
                <Loader2
                  size={16}
                  className="animate-spin text-blue-500 mx-auto"
                />
              </div>
            )}

            {/* Load more indicator */}
            {!loading && hasMore && options.length > 0 && (
              <div className="py-2 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-slate-700">
                Scroll to load more...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export function TableFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilter,
  showFilters,
  show = true,
  onShowFiltersChange,
  onClearFilters,
  searchPlaceholder = "Search anything...",
  filterOptions = ["all", "Delivered", "Processing", "Shipped", "Cancelled"],
  filterLabel = "Status",
  additionalFilters = [],
  filterValues = {},
  onFilterChange,
  fetchOptions,
}: TableFiltersProps) {
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();

  const lang = i18n.language || "en";
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
      case "paginatedSelect":
        return <ChevronDown size={16} />;
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

      case "paginatedSelect":
        return (
          <PaginatedSelectComponent
            config={field.paginatedSelectConfig!}
            value={value}
            onChange={(newValue) => onFilterChange?.(field.key, newValue)}
            placeholder={field.placeholder}
            disabled={field.disabled}
            fetchOptions={fetchOptions}
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
                  showDatePicker === field.key ? null : field.key,
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
                  showDatePicker === field.key ? null : field.key,
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
              <Search
                className={`absolute ${lang === "ar" ? "left-8" : "right-8"} left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors`}
              />
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
          {show && (
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

                <span> {t("common.Filters")}</span>
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
          )}
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
                      {t("common.AdvancedFilters")}
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
