import api from "@/services/api";
import { apiRoutes } from "@/services/api/api-routes";
import { useMutation } from "@tanstack/react-query";

export const useResetPassword = (onSuccess?: () => void,onError?: () => void) => {
  const { mutate, isPending, isSuccess, error } = useMutation({
    mutationFn: (data: {
      email: string;
      token: string;
      password: string;
      confirmPassword: string;
    }) =>
      api.post({
        url: apiRoutes.auth.resetPassword,
        body: data,
        auth: false,
      }),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: () => {
      onError?.();
    },
  });
  return {
    resetPassword: mutate,
    resetting: isPending,
    resetSuccessful: isSuccess,
    resetError: error,
  };
};
