 import { X } from "lucide-react";
export const Input = ({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  clearable,
 }: any) => {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl
          text-gray-900 dark:text-gray-100 placeholder:text-gray-400
          focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
          transition-all duration-200 ${className}`}
      />
      {clearable && value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X size={16} className="text-gray-400" />
        </button>
      )}
    </div>
  );
};
