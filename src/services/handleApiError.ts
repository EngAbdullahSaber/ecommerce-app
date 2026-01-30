import { toast } from "react-hot-toast";

export const handleApiResponseError = (responseData: any) => {
  if (!responseData) {
    toast.error("An unexpected error occurred");
    return;
  }

  // Handle duplicate key error (specific case from your example)
  if (
    responseData.code === 400 &&
    responseData.message?.includes("Duplicate key violation")
  ) {
    toast.error(responseData.message);
    return;
  }

  // Handle array of error objects in message field
  if (Array.isArray(responseData.message)) {
    const errorMessages = responseData.message
      .map((err: any) => {
        const field = err?.field || "";
        const message = err?.message || "Validation error";
        return field ? `${field}: ${message}` : message;
      })
      .join("\n");
    toast.error(errorMessages);
    return;
  }

  // Handle simple string message
  if (typeof responseData.message === "string") {
    toast.error(responseData.message);
    return;
  }

  // Handle top-level error
  if (typeof responseData.error === "string") {
    toast.error(responseData.error);
    return;
  }

  // Fallback error message
  toast.error("An unexpected error occurred");
};

export const handleApiError = (err: any) => {
  if (err?.response) {
    // Handle Axios error response
    handleApiResponseError(err.response.data || err.response);
  } else if (err?.message) {
    toast.error(err.message);
  } else {
    toast.error("An unexpected error occurred");
  }
};
