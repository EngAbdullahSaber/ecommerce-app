// hooks/useToast.js
import { toast } from "react-hot-toast";

export const useToast = () => {
  const success = (message: string, options = {}) => {
    return toast.success(message, {
      duration: 1500,
      ...options,
    });
  };

  const error = (message: string, options = {}) => {
    return toast.error(message, {
      duration: 2000,
      ...options,
    });
  };

  const loading = (message: string, options = {}) => {
    return toast.loading(message, {
      ...options,
    });
  };

  const custom = (message: string, options = {}) => {
    return toast(message, {
      duration: 1500,
      ...options,
    });
  };

  const dismiss = (toastId: string) => {
    toast.dismiss(toastId);
  };

  const dismissAll = () => {
    toast.dismiss();
  };

  const promise = (promise: any, messages: any, options = {}) => {
    return toast.promise(promise, messages, {
      duration: 2000,
      ...options,
    });
  };

  return {
    success,
    error,
    loading,
    custom,
    dismiss,
    dismissAll,
    promise,
    toast, // raw toast object if needed
  };
};
