import { AlertTriangle, X } from "lucide-react";

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  isLoading?: boolean;
  error?: string; // Add error prop
}

export function DeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Confirmation",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName,
  isLoading = false,
  error, // Add error prop
}: DeleteDialogProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      {/* Dialog Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Decorative gradient border top */}
        <div className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>

        {/* Close Button */}
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Close dialog"
        >
          <X
            size={20}
            className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
          />
        </button>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Icon Section */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Animated glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 via-orange-500/30 to-red-500/30 rounded-full blur-xl animate-pulse"></div>

              {/* Icon container */}
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50 border-2 border-red-200 dark:border-red-800/50 flex items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10"></div>
                <AlertTriangle
                  size={32}
                  className="text-red-600 dark:text-red-400 relative z-10"
                  strokeWidth={2}
                />
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center space-y-3">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {description}
              </p>
              {itemName && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {itemName}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-xl animate-in fade-in duration-200">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                  <X className="w-3 h-3 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <p className="text-sm text-red-700 dark:text-red-400 leading-relaxed">
                <span className="font-semibold">Error:</span> {error}
              </p>
            </div>
          )}

          {/* Warning Notice */}
          {!error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400"></div>
                </div>
              </div>
              <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
                <span className="font-semibold">Warning:</span> This action is
                permanent and cannot be undone. All associated data will be
                permanently deleted.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            {/* Cancel Button */}
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {error ? "Close" : "Cancel"}
            </button>

            {/* Delete Button - Only show if no error */}
            {!error && (
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
