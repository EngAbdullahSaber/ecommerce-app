// components/shared/ImageUploader.tsx
"use client";
import { useState, useRef } from "react";
import { Upload, X, Download, FileArchive } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { CreateMethodFormData } from "../../services/apis/ApiMethod";
import { useTranslation } from "react-i18next";

interface ImageUploaderProps {
  value: string | string[];
  onChange: (url: string | string[]) => void;
  onBlur?: () => void;
  maxFiles?: number;
  accept?: string;
  helperText?: string;
  enableZipDownload?: boolean;
  zipFileName?: string;
  onUploadComplete?: (response: any) => void;
  uploadEndpoint?: string;
  lang?: string;
  isMultiple?: boolean;
}

export function ImageUploader({
  value,
  onChange,
  onBlur,
  maxFiles = 1,
  accept = "image/*",
  helperText = "",
  enableZipDownload = true,
  zipFileName = "compressed_images.zip",
  onUploadComplete,
  uploadEndpoint = "/upload/multiple",
  lang = "en",
  isMultiple = false,
}: ImageUploaderProps) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [originalImages, setOriginalImages] = useState<File[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error(t("imageUploader.errors.canvasContext")));
            return;
          }

          let width = img.width;
          let height = img.height;
          const maxWidth = 1200;
          const maxHeight = 1200;
          const quality = 0.8;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error(t("imageUploader.errors.compressFailed")));
              }
            },
            "image/jpeg",
            quality,
          );
        };

        img.onerror = () => {
          reject(new Error(t("imageUploader.errors.loadImage")));
        };
      };

      reader.onerror = () => {
        reject(new Error(t("imageUploader.errors.readFile")));
      };
    });
  };

  const uploadToServer = async (files: File[]): Promise<any> => {
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append("files", file);
    });

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Use CreateMethodFormData
      const response = await CreateMethodFormData(
        uploadEndpoint,
        formData,
        lang,
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response) {
        throw new Error(t("imageUploader.errors.noResponse"));
      }
      console.log("Server response:", response);

      // Call the callback with response data
      if (onUploadComplete) {
        onUploadComplete(response.data?.data?.urls || []);
      }

      return response;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit files based on maxFiles
    const selectedFiles = isMultiple ? files.slice(0, maxFiles) : [files[0]];

    setIsCompressing(true);

    try {
      // Compress images
      const compressedFiles: File[] = [];
      const compressedUrls: string[] = [];

      for (const file of selectedFiles) {
        const compressedBlob = await compressImage(file);
        const compressedFile = new File([compressedBlob], file.name, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        compressedFiles.push(compressedFile);

        // Create preview URL
        const url = URL.createObjectURL(compressedBlob);
        compressedUrls.push(url);
      }

      // Set original images (uncompressed versions)
      setOriginalImages(selectedFiles);

      // Update value with blob URLs for preview (temporary)
      if (isMultiple) {
        onChange(compressedUrls);
      } else {
        onChange(compressedUrls[0]);
      }

      onBlur?.();

      // Upload to server
      const response = await uploadToServer(compressedFiles);

      // After upload, update with server URLs
      if (response?.data?.data?.urls) {
        console.log("Setting server URLs:", response.data.data.urls);
        if (isMultiple) {
          onChange(response.data.data.urls);
        } else {
          onChange(response.data.data.urls[0]);
        }

        // Clean up blob URLs after server URLs are set
        compressedUrls.forEach((url) => URL.revokeObjectURL(url));
      }
    } catch (error) {
      console.error("Error processing images:", error);

      // Fallback to original files
      const urls = selectedFiles.map((file) => URL.createObjectURL(file));

      if (isMultiple) {
        onChange(urls);
      } else {
        onChange(urls[0]);
      }
      setOriginalImages(selectedFiles);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (files.length === 0) return;

    // Limit files based on maxFiles
    const selectedFiles = isMultiple ? files.slice(0, maxFiles) : [files[0]];

    setIsCompressing(true);

    try {
      // Compress images
      const compressedFiles: File[] = [];
      const compressedUrls: string[] = [];

      for (const file of selectedFiles) {
        const compressedBlob = await compressImage(file);
        const compressedFile = new File([compressedBlob], file.name, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        compressedFiles.push(compressedFile);

        // Create preview URL
        const url = URL.createObjectURL(compressedBlob);
        compressedUrls.push(url);
      }

      setOriginalImages(selectedFiles);

      // Update value with blob URLs for preview (temporary)
      if (isMultiple) {
        onChange(compressedUrls);
      } else {
        onChange(compressedUrls[0]);
      }

      onBlur?.();

      // Upload to server
      const response = await uploadToServer(compressedFiles);

      // After upload, update with server URLs
      if (response?.data?.data?.urls) {
        console.log("Setting server URLs from drop:", response.data.data.urls);
        if (isMultiple) {
          onChange(response.data.data.urls);
        } else {
          onChange(response.data.data.urls[0]);
        }

        // Clean up blob URLs after server URLs are set
        compressedUrls.forEach((url) => URL.revokeObjectURL(url));
      }
    } catch (error) {
      console.error("Error processing images:", error);

      const urls = selectedFiles.map((file) => URL.createObjectURL(file));

      if (isMultiple) {
        onChange(urls);
      } else {
        onChange(urls[0]);
      }
      setOriginalImages(selectedFiles);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = (index?: number) => {
    if (isMultiple && Array.isArray(value)) {
      // Remove specific image in multiple mode
      const newUrls = [...value];
      const urlToRemove = newUrls.splice(index || 0, 1)[0];

      // Only revoke if it's a blob URL
      if (urlToRemove && urlToRemove.startsWith("blob:")) {
        URL.revokeObjectURL(urlToRemove);
      }

      onChange(newUrls);

      // Remove from original images
      const newOriginals = [...originalImages];
      newOriginals.splice(index || 0, 1);
      setOriginalImages(newOriginals);
    } else {
      // Single image mode
      if (value && typeof value === "string" && value.startsWith("blob:")) {
        URL.revokeObjectURL(value);
      }
      onChange("");
      setOriginalImages([]);
    }
    onBlur?.();
  };

  const removeAllImages = () => {
    if (isMultiple && Array.isArray(value)) {
      value.forEach((url) => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    } else if (
      value &&
      typeof value === "string" &&
      value.startsWith("blob:")
    ) {
      URL.revokeObjectURL(value);
    }

    onChange(isMultiple ? [] : "");
    setOriginalImages([]);
    onBlur?.();
  };

  const downloadAsZip = async () => {
    if (originalImages.length === 0) return;

    try {
      setIsCompressing(true);

      const zip = new JSZip();

      // Add all compressed images to zip
      for (let i = 0; i < originalImages.length; i++) {
        const originalFile = originalImages[i];
        const compressedBlob = await compressImage(originalFile);

        const fileName = originalFile.name.replace(/\.[^/.]+$/, "");
        zip.file(`${fileName}_compressed.jpg`, compressedBlob);
        zip.file(`${fileName}_original.jpg`, originalFile);
      }

      // Add a readme file
      zip.file(
        "README.txt",
        `${t("imageUploader.zip.readmeTitle")}:
        ${t("imageUploader.zip.totalFiles")}: ${originalImages.length}
        ${t("imageUploader.zip.generated")}: ${new Date().toLocaleString()}
        `,
      );

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, zipFileName);
    } catch (error) {
      console.error("Error creating zip:", error);
      alert(t("imageUploader.errors.zipFailed"));
    } finally {
      setIsCompressing(false);
    }
  };

  const downloadCompressedImage = (index: number = 0) => {
    let url: string | undefined;

    if (isMultiple && Array.isArray(value)) {
      url = value[index];
    } else if (typeof value === "string") {
      url = value;
    }

    if (!url) return;

    const link = document.createElement("a");
    link.href = url;
    link.download = originalImages[index]
      ? originalImages[index].name.replace(/\.[^/.]+$/, "") + "_compressed.jpg"
      : t("imageUploader.download.defaultFileName");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to display images
  const displayValue = () => {
    if (isMultiple) {
      return Array.isArray(value) ? value : [];
    }
    return value && typeof value === "string" ? [value] : [];
  };

  const images = displayValue();

  // Determine grid classes based on number of images
  const gridCols =
    images.length === 1
      ? "grid-cols-1"
      : images.length === 2
        ? "grid-cols-1 md:grid-cols-2"
        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="space-y-4">
      {images.length > 0 ? (
        <div className="space-y-3">
          <div className={`grid ${gridCols} gap-3`}>
            {images.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={import.meta.env.VITE_IMAGE_BASE_URL + url}
                  alt={t("imageUploader.uploadedAlt", { number: index + 1 })}
                  className="w-full h-48 object-cover rounded-lg border-2 border-slate-300 dark:border-slate-600"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  title={t("imageUploader.removeImage")}
                >
                  <X size={16} />
                </button>
                {isMultiple && originalImages[index] && (
                  <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs p-1 rounded">
                    {originalImages[index].name}
                  </div>
                )}
              </div>
            ))}
          </div>

          {(isUploading || isCompressing) && (
            <div className="space-y-2">
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                {isUploading
                  ? t("imageUploader.status.uploading")
                  : t("imageUploader.status.compressing")}
              </p>
            </div>
          )}

          {enableZipDownload && originalImages.length > 0 && (
            <div className="flex gap-2">
              {isMultiple && originalImages.length > 1 && (
                <button
                  type="button"
                  onClick={downloadAsZip}
                  disabled={isCompressing || isUploading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCompressing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {t("imageUploader.status.compressing")}
                    </>
                  ) : (
                    <>
                      <FileArchive size={16} />
                      {t("imageUploader.buttons.downloadZip")}
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => downloadCompressedImage(0)}
                disabled={isCompressing || isUploading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} />
                {isMultiple
                  ? t("imageUploader.buttons.downloadImages")
                  : t("imageUploader.buttons.downloadImage")}
              </button>

              {isMultiple && originalImages.length > 0 && (
                <button
                  type="button"
                  onClick={removeAllImages}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  title={t("imageUploader.removeAllImages")}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}

          {originalImages.length > 0 && (
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>{t("imageUploader.stats.totalFiles")}:</span>
                <span>{originalImages.length}</span>
              </div>
              {originalImages.map((file, index) => (
                <div key={index} className="flex justify-between">
                  <span className="truncate mr-2">{file.name}:</span>
                  <span>
                    {(file.size / 1024).toFixed(2)}{" "}
                    {t("imageUploader.stats.kb")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
              : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {isCompressing || isUploading
              ? isUploading
                ? t("imageUploader.status.uploading")
                : t("imageUploader.status.compressing")
              : t(
                  isMultiple
                    ? "imageUploader.dragDrop.multiple"
                    : "imageUploader.dragDrop.single",
                )}
          </p>
          {(isCompressing || isUploading) && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {isUploading
                  ? t("imageUploader.status.uploadingToServer")
                  : t("imageUploader.status.compressingOptimizing")}
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            id="image-upload"
            disabled={isCompressing || isUploading}
            multiple={isMultiple}
          />
          {!(isCompressing || isUploading) && (
            <label
              htmlFor="image-upload"
              className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
            >
              {t("imageUploader.buttons.browseFiles")}
            </label>
          )}
        </div>
      )}

      {helperText && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      )}

      {enableZipDownload && (
        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p className="font-medium">{t("imageUploader.features.title")}:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>{t("imageUploader.features.compression")}</li>
            <li>{t("imageUploader.features.serverUpload")}</li>
            <li>
              {isMultiple
                ? t("imageUploader.features.multipleFiles")
                : t("imageUploader.features.singleFile")}
            </li>
            <li>{t("imageUploader.features.zipDownload")}</li>
            <li>{t("imageUploader.features.sizeOptimization")}</li>
            <li>{t("imageUploader.features.individualDownload")}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
