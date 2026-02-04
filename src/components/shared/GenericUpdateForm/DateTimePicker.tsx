import React, { useState, useRef, useEffect } from "react";
import { Calendar as DatePicker } from "react-date-range";
import { format } from "date-fns";
import { Calendar, X, ChevronDown } from "lucide-react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useTranslation } from "react-i18next";

interface DatePickerProps {
  field: any;
  controllerField: any;
  inputClassName: string;
  readOnly?: boolean;
}

const DatePickerComponent: React.FC<DatePickerProps> = ({
  field,
  controllerField,
  inputClassName,
  readOnly = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const isRTL = currentLang === "ar";
  const [tempDate, setTempDate] = useState<Date | null>(
    field.value ? new Date(field.value) : null,
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleApply = () => {
    if (tempDate) {
      // Format date as YYYY-MM-DD for form submission
      const formattedDate = format(tempDate, "yyyy-MM-dd");
      controllerField.onChange(formattedDate);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempDate(null);
    controllerField.onChange("");
    setIsOpen(false);
  };

  // Get display value for the input
  const getDisplayValue = () => {
    if (field.value) {
      return format(new Date(field.value), "MMM dd, yyyy");
    }
    return t("common.selectDate");
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
      {/* Hidden input for react-hook-form */}
      <input type="hidden" {...controllerField} value={field.value || ""} />

      <div className="relative">
        <button
          type="button"
          onClick={() => !readOnly && setIsOpen(!isOpen)}
          className={`
            w-full px-4 py-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
            placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 
            disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
            border-slate-300 dark:border-slate-600 pr-12 cursor-pointer hover:border-slate-400 dark:hover:border-slate-500
            text-left ${readOnly ? "cursor-not-allowed opacity-50" : ""}
           `}
          disabled={readOnly}
          style={{ paddingLeft: "2.5rem" }}
        >
          <Calendar
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          {getDisplayValue()}
        </button>
        <div
          className="absolute inset-y-0 right-0 flex items-center pr-3"
          style={isRTL ? { right: "auto", left: 0 } : {}}
        >
          {field.value
            ? !readOnly && (
                <button
                  type="button"
                  onClick={handleClear}
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

      {isOpen && !readOnly && (
        <div
          className="absolute z-50 mt-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/40 overflow-hidden"
          style={{
            [isRTL ? "right" : "left"]: 0,
            direction: isRTL ? "rtl" : "ltr",
          }}
        >
          {/* Header with selected date */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-b border-slate-200 dark:border-slate-700">
            <div className="mb-2">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t("common.selectedDate")}
              </div>
              <div className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                {tempDate
                  ? format(tempDate, "MMMM dd, yyyy")
                  : t("common.selectDate")}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("common.singleDate")}
              </div>
            </div>
          </div>

          {/* Calendar Area */}
          <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
            <DatePicker
              date={tempDate || new Date()}
              onChange={(date) => setTempDate(date)}
              color="#3b82f6"
              className={`custom-calendar ${isRTL ? "rtl" : ""}`}
            />
          </div>

          {/* Footer with action buttons */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20">
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <X size={16} />
                {t("common.clear")}
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t("common.apply")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        /* Global styles for react-date-range */
        .custom-calendar {
          --rdp-background-color: transparent !important;
          --rdp-text-color: #1e293b !important;
          --rdp-accent-color: #3b82f6 !important;
          --rdp-hover-color: #f1f5f9 !important;
          --rdp-range-color: #24446e !important;
          font-family: inherit !important;
        }

        .dark .custom-calendar {
          --rdp-background-color: transparent !important;
          --rdp-text-color: #f1f5f9 !important;
          --rdp-accent-color: #3b82f6 !important;
          --rdp-hover-color: #334155 !important;
          --rdp-range-color: #1e3a8a !important;
        }

        /* RTL specific styles */
        .custom-calendar.rtl {
          direction: rtl !important;
        }

        .custom-calendar.rtl .rdrMonthAndYearWrapper {
          flex-direction: row-reverse !important;
        }

        .custom-calendar.rtl .rdrMonthAndYearPickers {
          flex-direction: row-reverse !important;
        }

        .custom-calendar.rtl .rdrMonthAndYearPickers > :first-child {
          margin-left: 8px !important;
          margin-right: 0 !important;
        }

        .custom-calendar.rtl .rdrWeekDays {
          flex-direction: row !important;
        }

        /* Fix for RTL selected days */
        .custom-calendar.rtl .rdrDayStartOfMonth .rdrInRange,
        .custom-calendar.rtl .rdrDayStartOfMonth .rdrEndEdge,
        .custom-calendar.rtl .rdrDayStartOfWeek .rdrInRange,
        .custom-calendar.rtl .rdrDayStartOfWeek .rdrEndEdge {
          border-top-left-radius: 0 !important;
          border-bottom-left-radius: 0 !important;
          border-top-right-radius: 8px !important;
          border-bottom-right-radius: 8px !important;
        }

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
        .custom-calendar:not(.rtl) .rdrDayStartOfMonth .rdrInRange,
        .custom-calendar:not(.rtl) .rdrDayStartOfMonth .rdrEndEdge,
        .custom-calendar:not(.rtl) .rdrDayStartOfWeek .rdrInRange,
        .custom-calendar:not(.rtl) .rdrDayStartOfWeek .rdrEndEdge {
          border-top-left-radius: 8px !important;
          border-bottom-left-radius: 8px !important;
        }

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

        /* Make sure the calendar fills its container */
        .rdrMonth {
          padding: 0 !important;
          width: 100% !important;
        }

        .rdrMonths {
          align-items: center !important;
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

export default DatePickerComponent;
