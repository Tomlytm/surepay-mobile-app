import api from "@/services/api";
import { apiRoutes } from "@/services/api/api-routes";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Toast from "react-native-toast-message";

interface IUpdatePassword {
  email: string;
  token: string;
  password: string;
}

export const useUpdatePassword = (onSuccess?: () => void) => {
  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (data: IUpdatePassword) =>
      api.post({
        url: apiRoutes.auth.updatePassword,
        body: data,
        auth: false,
      }),
    onSuccess: (response) => {
      Toast.show({
        type: 'success',
        text1: 'Password Updated',
        text2: response?.message || 'Password updated successfully',
      });
      onSuccess?.();
    },
    onError: (error) => {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error.response?.data?.message || 'An unexpected error occurred.',
      });
    }
  });
  return {
    updatePassword: mutate,
    updatePasswordLoading: isPending,
    updatePasswordSuccessfully: isSuccess,
  };
};
interface IResetPasswordRequest {
  email: string;
}

export const useRequestPasswordReset = () => {
  const { mutateAsync, isPending, isSuccess, data } = useMutation({
    mutationFn: (body: IResetPasswordRequest) =>
      api.post({
        url: apiRoutes.auth.resetPasswordRequest,
        body,
        auth: false,
      }),
    onSuccess: (response) => {
      Toast.show({
        type: 'success',
        text1: 'Reset Link Sent',
        text2: response.message || 'Password reset link sent to your email.',
      });
    },
    onError: (error) => {
      Toast.show({
        type: 'error',
        text1: 'Reset Request Failed',
        text2: error.response?.data?.message || 'An unexpected error occurred.',
      });
    },
  });

  return {
    requestPasswordReset: mutateAsync,
    requestingPasswordReset: isPending,
    requestedPasswordReset: isSuccess,
    data,
  };
};