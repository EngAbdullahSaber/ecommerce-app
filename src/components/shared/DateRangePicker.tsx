import { motion } from "framer-motion";
import { useState } from "react";
import { Calendar, X } from "lucide-react";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DateRangePickerProps {
  value: { start?: Date | null; end?: Date | null };
  onChange: (range: { start: Date | null; end: Date | null }) => void;
  onClose: () => void;
}

export const DateRangePicker = ({
  value,
  onChange,
  onClose,
}: DateRangePickerProps) => {
  const [startDate, setStartDate] = useState<Date | null>(value.start || null);
  const [endDate, setEndDate] = useState<Date | null>(value.end || null);

  const handleApply = () => {
    onChange({ start: startDate, end: endDate });
    onClose();
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    onChange({ start: null, end: null });
    onClose();
  };

  const hasSelection = startDate && endDate;

  // Custom input component for better styling
  const CustomInput = ({ value, onClick, placeholder }: any) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full px-4 py-3 text-left bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-600 transition-all duration-200 text-gray-900 dark:text-white font-medium"
    >
      {value || placeholder}
    </motion.button>
  );

  // Custom day component for better styling
  const CustomDay = ({
    date,
    selected,
    startDate,
    endDate,
    selectable,
    ...props
  }: any) => {
    const isInRange =
      startDate && endDate && date > startDate && date < endDate;
    const isStart = startDate && date.getTime() === startDate.getTime();
    const isEnd = endDate && date.getTime() === endDate.getTime();
    const isToday = date.toDateString() === new Date().toDateString();

    return (
      <motion.div
        whileHover={{ scale: selectable ? 1.1 : 1 }}
        whileTap={{ scale: selectable ? 0.9 : 1 }}
        className={`
          relative h-10 flex items-center justify-center text-sm font-medium transition-all duration-200
          ${
            selected || isStart || isEnd
              ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 z-10 rounded-lg"
              : ""
          }
          ${
            isInRange
              ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300"
              : ""
          }
          ${
            !selected && !isInRange && selectable
              ? "text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-md rounded-lg"
              : ""
          }
          ${
            isToday && !selected
              ? "ring-2 ring-blue-500 ring-inset bg-blue-50 dark:bg-blue-900/20 rounded-lg"
              : ""
          }
          ${
            !selectable
              ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
              : ""
          }
        `}
        {...props}
      >
        {date.getDate()}
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden backdrop-blur-xl bg-white/95 dark:bg-slate-900/95"
    >
      {/* Header */}
      <div className="relative px-8 pt-8 pb-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:20px_20px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"
              >
                <Calendar size={20} className="text-white" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Select Date Range
                </h3>
                <p className="text-blue-100 text-sm mt-1">
                  Choose your start and end dates
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white/80 hover:text-white"
            >
              <X size={20} />
            </motion.button>
          </div>

          {/* Selection preview */}
          <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
            <div className="text-center flex-1">
              <div className="text-xs text-blue-100 font-medium mb-2">FROM</div>
              <motion.div
                key={startDate?.toString()}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-white font-semibold text-lg"
              >
                {startDate ? format(startDate, "MMM dd, yyyy") : "—"}
              </motion.div>
            </div>

            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mx-4 text-white/60"
            >
              →
            </motion.div>

            <div className="text-center flex-1">
              <div className="text-xs text-blue-100 font-medium mb-2">TO</div>
              <motion.div
                key={endDate?.toString()}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-white font-semibold text-lg"
              >
                {endDate ? format(endDate, "MMM dd, yyyy") : "—"}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Date Pickers */}
        <div className="p-8 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Start Date Picker */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Start Date
              </label>
              <DatePicker
                selected={startDate}
                onChange={(date: Date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Select start date"
                customInput={<CustomInput placeholder="Select start date" />}
                renderDayContents={(day, date) => (
                  <CustomDay
                    date={date}
                    selected={
                      startDate && date?.getTime() === startDate.getTime()
                    }
                    startDate={startDate}
                    endDate={endDate}
                  />
                )}
                calendarClassName="!border-0 !shadow-2xl !rounded-2xl dark:!bg-slate-800"
                dayClassName={() => "!rounded-lg"}
                popperClassName="!z-50"
                showPopperArrow={false}
                inline
              />
            </div>

            {/* End Date Picker */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                End Date
              </label>
              <DatePicker
                selected={endDate}
                onChange={(date: Date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                placeholderText="Select end date"
                customInput={<CustomInput placeholder="Select end date" />}
                renderDayContents={(day, date) => (
                  <CustomDay
                    date={date}
                    selected={endDate && date?.getTime() === endDate.getTime()}
                    startDate={startDate}
                    endDate={endDate}
                  />
                )}
                calendarClassName="!border-0 !shadow-2xl !rounded-2xl dark:!bg-slate-800"
                dayClassName={() => "!rounded-lg"}
                popperClassName="!z-50"
                showPopperArrow={false}
                inline
              />
            </div>
          </div>

          {/* Quick Selection Buttons */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Quick Select
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Today", days: 0 },
                { label: "Last 7 Days", days: -7 },
                { label: "Last 30 Days", days: -30 },
                { label: "Last 90 Days", days: -90 },
              ].map(({ label, days }) => (
                <motion.button
                  key={label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const end = new Date();
                    const start = new Date();
                    start.setDate(start.getDate() + days);
                    setStartDate(start);
                    setEndDate(end);
                  }}
                  className="px-4 py-2 text-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors font-medium"
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gradient-to-t from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 border-t border-gray-100 dark:border-slate-700">
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClear}
              className="flex-1 px-6 py-3.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all font-semibold border-2 border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 hover:shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
            >
              Clear All
            </motion.button>
            <motion.button
              whileHover={{
                scale: hasSelection ? 1.02 : 1,
                y: hasSelection ? -1 : 0,
              }}
              whileTap={{ scale: hasSelection ? 0.98 : 1 }}
              onClick={handleApply}
              disabled={!hasSelection}
              className="flex-1 px-6 py-3.5 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl disabled:shadow-md relative overflow-hidden"
            >
              {/* Animated background for enabled state */}
              {hasSelection && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              )}
              <span className="relative z-10">Apply Selection</span>
            </motion.button>
          </div>
        </div>

        {/* Selection hint */}
        {!hasSelection && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400 font-medium"
          >
            Select start and end dates to continue
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
