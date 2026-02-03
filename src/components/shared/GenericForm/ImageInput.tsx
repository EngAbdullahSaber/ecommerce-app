import React, { useState, useEffect, useRef } from "react";
import {
  Loader2,
  Image as ImageIcon,
  Eye,
  Trash2,
  XCircle,
  Upload,
  AlertCircle,
} from "lucide-react";
import { ImageUploadConfig } from "./types";

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
  fullWidth = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {previewUrls.length === 0
            ? "No images"
            : `${previewUrls.length} image(s)`}
        </div>
        {preview && previewUrls.length > 0 && (
          <div
            className={`grid gap-2 ${fullWidth ? "grid-cols-1" : "grid-cols-3 sm:grid-cols-4 md:grid-cols-5"}`}
          >
            {previewUrls.map((url, index) => (
              <div
                key={index}
                className={`relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 ${
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
                  className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors group"
                >
                  <Eye
                    size={20}
                    className="text-white/0 group-hover:text-white/80 transition-colors"
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full">
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
        className={`
          relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer w-full
          transition-all duration-300 hover:shadow-lg
          ${
            disabled || uploading
              ? "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed opacity-60"
              : errors || error
                ? "border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-950/20 hover:border-red-400 dark:hover:border-red-600"
                : "border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-600 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/80"
          }
        `}
      >
        <div className="flex flex-col items-center justify-center space-y-3 w-full">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
            {uploading ? (
              <Loader2
                size={24}
                className="animate-spin text-blue-600 dark:text-blue-400"
              />
            ) : (
              <ImageIcon
                size={24}
                className="text-blue-600 dark:text-blue-400"
              />
            )}
          </div>
          <div className="w-full">
            <div className="font-medium text-slate-800 dark:text-slate-200">
              {uploading ? "Uploading..." : "Click to upload images"}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {multiple
                ? `Drag & drop or click to upload (max ${maxFiles} files)`
                : "Drag & drop or click to upload"}
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Supported: {accept || "image/*"} • Max: {maxSize / (1024 * 1024)}
              MB
            </div>
          </div>
        </div>
      </div>

      {(errors || error) && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 w-full">
          <AlertCircle size={16} />
          <span>{error || (errors?.message as string)}</span>
        </div>
      )}

      {preview && previewUrls.length > 0 && (
        <div className="space-y-3 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Uploaded Images ({previewUrls.length}/{maxFiles})
            </div>
            {!disabled && previewUrls.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <XCircle size={14} />
                Clear All
              </button>
            )}
          </div>

          <div
            className={`grid gap-3 ${fullWidth ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"}`}
          >
            {previewUrls.map((url, index) => (
              <div
                key={index}
                className={`relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 ${
                  fullWidth ? "w-full" : ""
                }`}
                style={fullWidth ? { height: "400px" } : { height: "200px" }}
              >
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => window.open(url, "_blank")}
                      className="p-1.5 bg-white/90 dark:bg-slate-900/90 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
                    >
                      <Eye
                        size={14}
                        className="text-slate-700 dark:text-slate-300"
                      />
                    </button>
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        className="p-1.5 bg-red-500/90 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={14} className="text-white" />
                      </button>
                    )}
                  </div>
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 size={20} className="animate-spin text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!errors && !error && previewUrls.length === 0 && (
        <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 w-full">
          <Upload size={14} />
          <span>Upload images by clicking above or dragging and dropping</span>
        </div>
      )}
    </div>
  );
};
