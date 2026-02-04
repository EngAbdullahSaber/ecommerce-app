import React, { useState, useEffect, useRef } from "react";
import {
  Loader2,
  Image as ImageIcon,
  Eye,
  Trash2,
  XCircle,
  Upload,
  AlertCircle,
  X,
} from "lucide-react";
import { ImageUploadConfig } from "./types";
import { useTranslation } from "react-i18next";

interface ImageInputProps {
  name: string;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  readOnly?: boolean;
  config?: ImageUploadConfig;
  errors?: any;
  fullWidth?: boolean;
}

export const ImageInputComponent: React.FC<ImageInputProps> = ({
  name,
  value,
  onChange,
  disabled = false,
  readOnly = false,
  config = {},
  errors,
  fullWidth = true,
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, i18n } = useTranslation();

  const {
    uploadEndpoint,
    maxSize = 5 * 1024 * 1024,
    accept = "image/*",
    multiple = false,
    maxFiles = multiple ? 10 : 1,
    preview = true,
    onUpload,
    onRemove,
  } = config;

  // Initialize preview URLs from value
  useEffect(() => {
    if (value) {
      if (Array.isArray(value)) {
        setPreviewUrls(value);
      } else if (typeof value === "string") {
        setPreviewUrls([value]);
      } else if (value instanceof File) {
        const url = URL.createObjectURL(value);
        setPreviewUrls([url]);
      }
    } else {
      setPreviewUrls([]);
    }
  }, [value]);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previewUrls]);

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize) {
      setError(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
      return false;
    }

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return false;
    }

    setError("");
    return true;
  };

  const handleFileUpload = async (file: File): Promise<File | string> => {
    if (onUpload) {
      return await onUpload(file);
    }

    if (uploadEndpoint) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(uploadEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      return data.url || data.path || data.imageUrl;
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || readOnly) return;

    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentCount = Array.isArray(value) ? value.length : value ? 1 : 0;
    if (currentCount + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} file(s) allowed`);
      return;
    }

    for (const file of files) {
      if (!validateFile(file)) {
        return;
      }
    }

    setUploading(true);
    setError("");

    try {
      if (multiple) {
        const newValue = Array.isArray(value) ? [...value, ...files] : files;
        onChange(newValue);
      } else {
        onChange(files[0]);
      }

      const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    } catch (err) {
      setError("Failed to process image(s)");
      console.error("Error:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || readOnly) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Trigger the file input change handler
    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));

    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files;
      fileInputRef.current.dispatchEvent(
        new Event("change", { bubbles: true }),
      );
    }
  };

  const handleRemove = async (index: number) => {
    if (disabled || readOnly) return;

    const urlToRemove = previewUrls[index];
    const isBlobUrl = urlToRemove.startsWith("blob:");

    if (onRemove && !isBlobUrl) {
      try {
        await onRemove(urlToRemove);
      } catch (err) {
        console.error("Remove error:", err);
      }
    }

    if (multiple) {
      const newValue = Array.isArray(value)
        ? value.filter((_, i) => i !== index)
        : [];
      onChange(newValue);
    } else {
      onChange("");
    }

    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));

    if (isBlobUrl) {
      URL.revokeObjectURL(urlToRemove);
    }
  };

  const handleClearAll = () => {
    if (disabled || readOnly) return;

    previewUrls.forEach((url) => {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });

    if (onRemove) {
      previewUrls.forEach((url) => {
        if (!url.startsWith("blob:")) {
          onRemove(url).catch(console.error);
        }
      });
    }

    onChange(multiple ? [] : "");
    setPreviewUrls([]);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current && !disabled && !readOnly) {
      fileInputRef.current.click();
    }
  };

  if (readOnly) {
    return (
      <div className="space-y-3 w-full">
        <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {previewUrls.length === 0
            ? "No images"
            : `${previewUrls.length} image(s)`}
        </div>
        {preview && previewUrls.length > 0 && (
          <div
            className={`grid gap-3 ${fullWidth ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"}`}
          >
            {previewUrls.map((url, index) => (
              <div
                key={index}
                className={`relative rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-sm ${
                  fullWidth ? "w-full" : "aspect-square"
                }`}
                style={fullWidth ? { height: "300px" } : {}}
              >
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => window.open(url, "_blank")}
                  className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-all duration-200 group"
                >
                  <div className="p-2 rounded-full bg-white/90 dark:bg-slate-900/90 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye
                      size={20}
                      className="text-slate-700 dark:text-slate-300"
                    />
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      <div
        onClick={triggerFileInput}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer w-full
          transition-all duration-300
          ${
            disabled || uploading
              ? "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed opacity-60"
              : dragActive
                ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30 shadow-lg scale-[1.02]"
                : errors || error
                  ? "border-red-400 dark:border-red-600 bg-red-50/50 dark:bg-red-950/20 hover:border-red-500 dark:hover:border-red-500"
                  : "border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-slate-900 hover:shadow-lg hover:scale-[1.01]"
          }
        `}
      >
        <div className="flex flex-col items-center justify-center space-y-4 w-full">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              dragActive
                ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl scale-110"
                : uploading
                  ? "bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg"
                  : "bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-950/40"
            }`}
          >
            {uploading ? (
              <Loader2
                size={32}
                className={`animate-spin ${dragActive ? "text-white" : "text-blue-600 dark:text-blue-400"}`}
              />
            ) : (
              <Upload
                size={32}
                className={`${dragActive ? "text-white" : "text-blue-600 dark:text-blue-400"} transition-transform ${dragActive ? "scale-110" : ""}`}
              />
            )}
          </div>

          <div className="w-full space-y-2">
            <div className="font-semibold text-lg text-slate-800 dark:text-slate-200">
              {uploading
                ? t("common.uploading")
                : dragActive
                  ? t("common.dropYourImagesHere")
                  : t("common.uploadImages")}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {multiple
                ? t(`common.Drag&droporclicktouploadupto${maxFiles}files`)
                : t("common.dragAndDropOrClickToUploadAnImage")}
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-500 mt-3">
              <div className="flex items-center gap-1">
                <ImageIcon size={12} />
                <span>{accept || "image/*"}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <span>Max {maxSize / (1024 * 1024)}MB</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {(errors || error) && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <AlertCircle
            size={16}
            className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
          />
          <span className="text-sm text-red-700 dark:text-red-400">
            {error || (errors?.message as string)}
          </span>
        </div>
      )}

      {preview && previewUrls.length > 0 && (
        <div className="space-y-3 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {t("common.uploadedImages")}
              </div>
              <div className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs font-medium text-blue-700 dark:text-blue-300">
                {previewUrls.length}/{maxFiles}
              </div>
            </div>
            {!disabled && previewUrls.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
              >
                <XCircle size={14} />
                {t("common.clearAll")}
              </button>
            )}
          </div>

          <div
            className={`grid gap-4 ${fullWidth ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"}`}
          >
            {previewUrls.map((url, index) => (
              <div
                key={index}
                className={`relative group rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${
                  fullWidth ? "w-full" : ""
                }`}
                style={fullWidth ? { height: "400px" } : { height: "240px" }}
              >
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {/* Image number badge */}
                  <div className="absolute top-3 left-3">
                    <div className="px-2.5 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300">
                      #{index + 1}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(url, "_blank");
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
                    >
                      <Eye
                        size={16}
                        className="text-slate-700 dark:text-slate-300"
                      />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {t("common.view")}
                      </span>
                    </button>
                    {!disabled && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(index);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-500/95 backdrop-blur-sm rounded-lg hover:bg-red-600 transition-all shadow-lg hover:shadow-xl"
                      >
                        <Trash2 size={16} className="text-white" />
                        <span className="text-xs font-medium text-white">
                          {t("common.remove")}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Uploading overlay */}
                {uploading && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 size={24} className="animate-spin text-white" />
                      <span className="text-xs text-white font-medium">
                        {t("common.uploading")}...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!errors && !error && previewUrls.length === 0 && (
        <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2 w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <Upload size={14} />
          <span>{t("common.noImagesUploadedYet")}</span>
        </div>
      )}
    </div>
  );
};
