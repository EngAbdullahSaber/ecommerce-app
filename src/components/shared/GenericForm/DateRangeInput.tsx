import React, { useState, useEffect, useRef } from "react";
import { DateRange, Calendar as RangeCalendar } from "react-date-range";
import { format } from "date-fns";
import { Calendar, X, ChevronDown } from "lucide-react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRangeConfig } from "./types";
import { useTranslation } from "react-i18next";

interface DateRangeInputProps {
  name: string;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  readOnly?: boolean;
  config?: DateRangeConfig;
  errors?: any;
  placeholder?: string;
  isRTL?: boolean; // Add RTL support
}

export const DateRangeInputComponent: React.FC<DateRangeInputProps> = ({
  name,
  value,
  onChange,
  disabled = false,
  readOnly = false,
  config = {},
  errors,
  placeholder = "Select date(s)",
  isRTL = false, // Default to LTR
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  isRTL = currentLang !== "ar" ? true : false;
  const [singleDate, setSingleDate] = useState<Date | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    range = true,
    minDate,
    maxDate,
    showTimePicker = false,
    timeFormat = "hh:mm a",
    timeIntervals = 30,
  } = config;

  // Initialize from value
  useEffect(() => {
    if (value) {
      if (range) {
        if (typeof value === "object" && value.startDate && value.endDate) {
          setDateRange({
            startDate: new Date(value.startDate),
            endDate: new Date(value.endDate),
          });
        } else if (Array.isArray(value) && value.length === 2) {
          setDateRange({
            startDate: new Date(value[0]),
            endDate: new Date(value[1]),
          });
        } else if (value.startDate || value.endDate) {
          setDateRange({
            startDate: value.startDate ? new Date(value.startDate) : null,
            endDate: value.endDate ? new Date(value.endDate) : null,
          });
        }
      } else {
        setSingleDate(value ? new Date(value) : null);
      }
    }
  }, [value, range]);

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

  const handleRangeSelect = (ranges: any) => {
    const selection = ranges.selection;
    const newRange = {
      startDate: selection.startDate,
      endDate: selection.endDate,
    };

    setDateRange(newRange);

    if (range) {
      onChange(newRange);
    } else {
      onChange(selection.startDate);
    }
  };

  const handleSingleDateSelect = (date: Date) => {
    setSingleDate(date);
    onChange(date);
  };

  const clearSelection = () => {
    if (range) {
      setDateRange({ startDate: null, endDate: null });
      onChange({ startDate: null, endDate: null });
    } else {
      setSingleDate(null);
      onChange(null);
    }
  };

  const applySelection = () => {
    setIsOpen(false);
  };

  // Format display value
  const getDisplayValue = () => {
    if (readOnly) {
      if (range && dateRange.startDate && dateRange.endDate) {
        return `${format(dateRange.startDate, "MMM dd, yyyy")} - ${format(
          dateRange.endDate,
          "MMM dd, yyyy",
        )}`;
      } else if (!range && singleDate) {
        return format(singleDate, "MMM dd, yyyy");
      }
      return placeholder;
    }

    if (range) {
      if (dateRange.startDate && dateRange.endDate) {
        return `${format(dateRange.startDate, "MMM dd, yyyy")} - ${format(
          dateRange.endDate,
          "MMM dd, yyyy",
        )}`;
      } else if (dateRange.startDate) {
        return `${format(dateRange.startDate, "MMM dd, yyyy")} - Select end date`;
      }
    } else if (singleDate) {
      return format(singleDate, "MMM dd, yyyy");
    }

    return placeholder;
  };

  // For read-only mode
  if (readOnly) {
    return (
      <div
        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {getDisplayValue()}
      </div>
    );
  }

  return (
    <div
      className="relative w-full"
      ref={dropdownRef}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="relative">
        <input
          type="text"
          value={getDisplayValue()}
          onClick={() => !disabled && !readOnly && setIsOpen(!isOpen)}
          placeholder={placeholder}
          disabled={disabled || readOnly}
          readOnly
          className="w-full px-4 py-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 
            focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 
            disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
            border-slate-300 dark:border-slate-600 pr-12 cursor-pointer hover:border-slate-400 dark:hover:border-slate-500"
        />
        <div
          className="absolute inset-y-0 right-0 flex items-center pr-3"
          style={isRTL ? { right: "auto", left: 0 } : {}}
        >
          {dateRange.startDate || singleDate
            ? !disabled &&
              !readOnly && (
                <button
                  type="button"
                  onClick={clearSelection}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors mr-1"
                  title="Clear selection"
                >
                  <X size={16} />
                </button>
              )
            : null}
          <ChevronDown
            size={18}
            className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {isOpen && !disabled && !readOnly && (
        <div
          className="absolute z-50 mt-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/40 overflow-hidden"
          style={{
            [isRTL ? "right" : "left"]: 0,
            direction: isRTL ? "rtl" : "ltr",
          }}
        >
          {/* Header with selected range */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-b border-slate-200 dark:border-slate-700">
            <div className="mb-2">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {range ? "Selected Range" : "Selected Date"}
              </div>
              <div className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                {range
                  ? dateRange.startDate && dateRange.endDate
                    ? `${format(dateRange.startDate, "MMM dd, yyyy")} - ${format(
                        dateRange.endDate,
                        "MMM dd, yyyy",
                      )}`
                    : dateRange.startDate
                      ? `${format(dateRange.startDate, "MMM dd, yyyy")} - Select end date`
                      : "Select a date range"
                  : singleDate
                    ? format(singleDate, "MMMM dd, yyyy")
                    : "Select a date"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300">
                {range ? "Date Range" : "Single Date"}
              </div>
            </div>
          </div>

          {/* Calendar Area */}
          <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
            {range ? (
              <DateRange
                ranges={[
                  {
                    startDate: dateRange.startDate || new Date(),
                    endDate: dateRange.endDate || new Date(),
                    key: "selection",
                  },
                ]}
                onChange={handleRangeSelect}
                moveRangeOnFirstSelection={false}
                retainEndDateOnFirstSelection={true}
                months={1}
                direction="horizontal"
                minDate={minDate}
                maxDate={maxDate}
                showDateDisplay={false}
                showPreview={true}
                showMonthAndYearPickers={true}
                rangeColors={["#3b82f6"]}
                className={`custom-date-range ${isRTL ? "rtl" : ""}`}
                editableDateInputs={true}
                monthDisplayFormat="MMMM yyyy"
                weekdayDisplayFormat="EEEEEE"
              />
            ) : (
              <RangeCalendar
                date={singleDate || new Date()}
                onChange={handleSingleDateSelect}
                minDate={minDate}
                maxDate={maxDate}
                color="#3b82f6"
                className={`custom-calendar ${isRTL ? "rtl" : ""}`}
              />
            )}
          </div>

          {/* Footer with action buttons */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20">
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={clearSelection}
                className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <X size={16} />
                Clear
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors hover:scale-[1.02] active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applySelection}
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {errors && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
          <X size={12} />
          {errors.message}
        </p>
      )}

      <style jsx global>{`
        /* Global styles for react-date-range */
        .custom-date-range,
        .custom-calendar {
          --rdp-background-color: transparent !important;
          --rdp-text-color: #1e293b !important;
          --rdp-accent-color: #3b82f6 !important;
          --rdp-hover-color: #f1f5f9 !important;
          --rdp-range-color: #24446e !important;
          font-family: inherit !important;
        }

        .dark .custom-date-range,
        .dark .custom-calendar {
          --rdp-background-color: transparent !important;
          --rdp-text-color: #f1f5f9 !important;
          --rdp-accent-color: #3b82f6 !important;
          --rdp-hover-color: #334155 !important;
          --rdp-range-color: #1e3a8a !important;
        }

        /* RTL specific styles */
        .custom-date-range.rtl,
        .custom-calendar.rtl {
          direction: rtl !important;
        }

        .custom-date-range.rtl .rdrMonthAndYearWrapper,
        .custom-calendar.rtl .rdrMonthAndYearWrapper {
          flex-direction: row-reverse !important;
        }

        .custom-date-range.rtl .rdrMonthAndYearPickers,
        .custom-calendar.rtl .rdrMonthAndYearPickers {
          flex-direction: row-reverse !important;
        }

        .custom-date-range.rtl .rdrMonthPicker,
        .custom-calendar.rtl .rdrMonthPicker {
          margin-left: 8px !important;
          margin-right: 0 !important;
        }

        .custom-date-range.rtl .rdrMonthAndYearPickers > :first-child {
          margin-left: 8px !important;
          margin-right: 0 !important;
        }

        .custom-date-range.rtl .rdrWeekDays,
        .custom-calendar.rtl .rdrWeekDays {
          flex-direction: row !important;
        }

        /* Fix for RTL selected days */
        .custom-date-range.rtl .rdrDayStartOfMonth .rdrInRange,
        .custom-date-range.rtl .rdrDayStartOfMonth .rdrEndEdge,
        .custom-date-range.rtl .rdrDayStartOfWeek .rdrInRange,
        .custom-date-range.rtl .rdrDayStartOfWeek .rdrEndEdge,
        .custom-calendar.rtl .rdrDayStartOfMonth .rdrInRange,
        .custom-calendar.rtl .rdrDayStartOfMonth .rdrEndEdge,
        .custom-calendar.rtl .rdrDayStartOfWeek .rdrInRange,
        .custom-calendar.rtl .rdrDayStartOfWeek .rdrEndEdge {
          border-top-left-radius: 0 !important;
          border-bottom-left-radius: 0 !important;
          border-top-right-radius: 8px !important;
          border-bottom-right-radius: 8px !important;
        }

        .custom-date-range.rtl .rdrDayEndOfMonth .rdrInRange,
        .custom-date-range.rtl .rdrDayEndOfMonth .rdrStartEdge,
        .custom-date-range.rtl .rdrDayEndOfWeek .rdrInRange,
        .custom-date-range.rtl .rdrDayEndOfWeek .rdrStartEdge,
        .custom-calendar.rtl .rdrDayEndOfMonth .rdrInRange,
        .custom-calendar.rtl .rdrDayEndOfMonth .rdrStartEdge,
        .custom-calendar.rtl .rdrDayEndOfWeek .rdrInRange,
        .custom-calendar.rtl .rdrDayEndOfWeek .rdrStartEdge {
          border-top-right-radius: 0 !important;
          border-bottom-right-radius: 0 !important;
          border-top-left-radius: 8px !important;
          border-bottom-left-radius: 8px !important;
        }

        /* RTL navigation buttons */
        .custom-date-range.rtl .rdrNextPrevButton,
        .custom-calendar.rtl .rdrNextPrevButton {
          transform: scaleX(-1) !important;
        }

        /* Hide default date display */
        .rdrDateDisplayWrapper {
          display: none !important;
        }

        /* Calendar wrapper */
        .rdrCalendarWrapper {
          background: transparent !important;
          border-radius: 12px !important;
          color: inherit !important;
          width: 100% !important;
        }

        /* Month and year picker */
        .rdrMonthAndYearWrapper {
          padding: 0 0 16px 0 !important;
          border: none !important;
          background: transparent !important;
          height: auto !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
        }

        .rdrMonthAndYearPickers {
          font-weight: 600 !important;
          font-size: 16px !important;
          color: var(--rdp-text-color) !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }

        .rdrMonthPicker select,
        .rdrYearPicker select {
          background: var(--rdp-background-color) !important;
          color: var(--rdp-text-color) !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          padding: 6px 10px !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
          appearance: none !important;
          padding-right: 28px !important;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") !important;
          background-position: right 0.5rem center !important;
          background-repeat: no-repeat !important;
          background-size: 1.5em 1.5em !important;
        }

        .rtl .rdrMonthPicker select,
        .rtl .rdrYearPicker select {
          padding-left: 28px !important;
          padding-right: 10px !important;
          background-position: left 0.5rem center !important;
        }

        .dark .rdrMonthPicker select,
        .dark .rdrYearPicker select {
          border-color: #475569 !important;
          background: #1e293b !important;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23cbd5e1' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") !important;
        }

        .rdrMonthPicker select:hover,
        .rdrYearPicker select:hover {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        /* Week days */
        .rdrWeekDay {
          color: var(--rdp-text-color) !important;
          opacity: 0.6 !important;
          font-weight: 500 !important;
          font-size: 12px !important;
          padding: 8px 0 !important;
        }

        /* Days */
        .rdrDay {
          color: var(--rdp-text-color) !important;
          height: 40px !important;
          width: 40px !important;
        }

        .rdrDayNumber {
          font-size: 14px !important;
          font-weight: 500 !important;
          color: var(--rdp-text-color) !important;
          top: 0 !important;
          bottom: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .rdrDayToday .rdrDayNumber span:after {
          background: var(--rdp-accent-color) !important;
          width: 4px !important;
          height: 4px !important;
          border-radius: 50% !important;
          bottom: 6px !important;
        }

        /* Hover state */
        .rdrDayHovered,
        .rdrDay:hover:not(.rdrDayPassive) {
          background: var(--rdp-hover-color) !important;
          border-radius: 8px !important;
        }

        /* Selected range */
        .rdrInRange,
        .rdrStartEdge,
        .rdrEndEdge,
        .rdrDayStartPreview,
        .rdrDayEndPreview,
        .rdrDayInPreview {
          background: var(--rdp-range-color) !important;
        }

        /* Selected day */
        .rdrSelected {
          background: var(--rdp-accent-color) !important;
          border-radius: 8px !important;
          color: white !important;
        }

        .rdrSelected .rdrDayNumber span {
          color: white !important;
          font-weight: 600 !important;
        }

        /* Start and end edges */
        .custom-date-range:not(.rtl) .rdrDayStartOfMonth .rdrInRange,
        .custom-date-range:not(.rtl) .rdrDayStartOfMonth .rdrEndEdge,
        .custom-date-range:not(.rtl) .rdrDayStartOfWeek .rdrInRange,
        .custom-date-range:not(.rtl) .rdrDayStartOfWeek .rdrEndEdge,
        .custom-calendar:not(.rtl) .rdrDayStartOfMonth .rdrInRange,
        .custom-calendar:not(.rtl) .rdrDayStartOfMonth .rdrEndEdge,
        .custom-calendar:not(.rtl) .rdrDayStartOfWeek .rdrInRange,
        .custom-calendar:not(.rtl) .rdrDayStartOfWeek .rdrEndEdge {
          border-top-left-radius: 8px !important;
          border-bottom-left-radius: 8px !important;
        }

        .custom-date-range:not(.rtl) .rdrDayEndOfMonth .rdrInRange,
        .custom-date-range:not(.rtl) .rdrDayEndOfMonth .rdrStartEdge,
        .custom-date-range:not(.rtl) .rdrDayEndOfWeek .rdrInRange,
        .custom-date-range:not(.rtl) .rdrDayEndOfWeek .rdrStartEdge,
        .custom-calendar:not(.rtl) .rdrDayEndOfMonth .rdrInRange,
        .custom-calendar:not(.rtl) .rdrDayEndOfMonth .rdrStartEdge,
        .custom-calendar:not(.rtl) .rdrDayEndOfWeek .rdrInRange,
        .custom-calendar:not(.rtl) .rdrDayEndOfWeek .rdrStartEdge {
          border-top-right-radius: 8px !important;
          border-bottom-right-radius: 8px !important;
        }

        /* Disabled days */
        .rdrDayDisabled {
          background: transparent !important;
          color: #94a3b8 !important;
          cursor: not-allowed !important;
        }

        .dark .rdrDayDisabled {
          color: #64748b !important;
        }

        .rdrDayDisabled .rdrDayNumber span {
          color: inherit !important;
        }

        /* Passive days (from other months) */
        .rdrDayPassive {
          opacity: 0.3 !important;
        }

        /* Month name */
        .rdrMonthName {
          text-align: center !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          color: #64748b !important;
          padding: 8px 0 !important;
          margin-bottom: 8px !important;
        }

        .dark .rdrMonthName {
          color: #94a3b8 !important;
        }

        /* Navigation buttons */
        .rdrMonthAndYearPickers button {
          background: transparent !important;
          border: none !important;
          color: #64748b !important;
          cursor: pointer !important;
          padding: 8px !important;
          border-radius: 6px !important;
          transition: all 0.2s !important;
        }

        .dark .rdrMonthAndYearPickers button {
          color: #94a3b8 !important;
        }

        .rdrMonthAndYearPickers button:hover {
          background: rgba(59, 130, 246, 0.1) !important;
          color: #3b82f6 !important;
        }

        .dark .rdrMonthAndYearPickers button:hover {
          background: rgba(59, 130, 246, 0.2) !important;
          color: #60a5fa !important;
        }

        /* Custom scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }

        .dark .custom-scrollbar {
          scrollbar-color: #475569 transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* DateRange specific */
        .rdrDateRangeWrapper {
          border-radius: 12px !important;
          overflow: hidden !important;
        }

        /* Make sure the calendar fills its container */
        .rdrMonth {
          padding: 0 !important;
          width: 100% !important;
        }

        .rdrMonths {
          align-items: center !important;
        }

        /* Preview range */
        .rdrDayStartPreview,
        .rdrDayEndPreview,
        .rdrDayInPreview {
          border-radius: 0 !important;
        }

        /* Input fields for editable dates */
        .rdrDateInput {
          background: var(--rdp-background-color) !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          color: var(--rdp-text-color) !important;
        }

        .dark .rdrDateInput {
          border-color: #475569 !important;
        }

        .rdrDateInput input {
          color: var(--rdp-text-color) !important;
          background: transparent !important;
        }
      `}</style>
    </div>
  );
};
