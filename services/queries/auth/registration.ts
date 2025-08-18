import api from "@/services/api";
import { apiRoutes } from "@/services/api/api-routes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { toast } from "react-toastify";

interface ISignUP {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
}

export const useSignup = (onSuccess: (user: any) => void, onError?: (error: any) => void) => {
  const { mutateAsync, isPending, isSuccess, data } = useMutation({
    mutationFn: (body: ISignUP) =>
      api.post({
        url: apiRoutes.auth.register,
        body: body,
        auth: false,
      }),
    onSuccess: async (response) => {
      console.log(response, "Registration successful");
      await AsyncStorage.setItem("user", JSON.stringify(response?.user));
      toast.success(response.message || `Registration successful`);
      onSuccess(response?.user);
    },
    onError: (error) => {
      console.log((error as any), "Registration failed");
        onError?.(error as any);
        Toast.show({
          type: 'error',
          text1: 'Signup Failed',
          text2: (error as any).response.data.message || 'An unexpected error occurred.',
        });
      }
  });

  return {
    signUp: mutateAsync,
    signingUp: isPending,
    signedUp: isSuccess,
    data,
  };
};
interface IValidateOTP {
  otp: string;
  email: string | string[];
}

export const useValidateOTP = (user_id: number) => {
  const { mutateAsync, isPending, isSuccess, data } = useMutation({
    mutationFn: (body: IValidateOTP) =>
      api.postWithRootData({
        url: apiRoutes.auth.validate(user_id),
        body: body,
        auth: false,
      }),
    onSuccess: (response) => {
      console.log(response)
      // toast.success(response.message || `OTP validation successful`);
    },

    onError: (error) => {
      console.log(error.response.data.message);
     
    },
  });

  return {
    validateOtp: mutateAsync,
    validatingOtp: isPending,
    validatedOtp: isSuccess,
    data,
  };
};


export const useResendOTP = (user_id: number) => {
  const { mutateAsync, isPending, isSuccess, data } = useMutation({
    mutationFn: () =>
      api.postWithRootData({
        url: apiRoutes.auth.verify(user_id),
        // body: body,
        auth: false,
      }),
    onSuccess: (response) => {
      console.log(response);
      Toast.show({
        type: 'success',
        text1: 'OTP Resent',
        text2: response.message || 'OTP has been resent successfully.',
      });
    },
    onError: (error) => {
      // console.log(error.response.data.message);
      Toast.show({
        type: 'error',
        text1: 'Resend OTP Failed',
        text2: error.response.data.message || 'An unexpected error occurred.',
      });
    },
  });

  return {
    resendOtp: mutateAsync,
    resendingOtp: isPending,
    resentOtp: isSuccess,
    data,
  };
};
interface IOnboardAgent {
  key: string;
  nin: string | null;
  bvn: string | null;
  business_name: string;
  address: string;
  state_id: number;
  city_id: number;
}

interface IOnboardUserIndividual {
  key: string;
}

type IOnboardUser = IOnboardAgent | IOnboardUserIndividual;

export const useOnboardUser = (onSuccess: (response: any) => void, user_id: number, type: "agent" | "individual") => {
  const { mutateAsync, isPending, isSuccess, data } = useMutation({
    mutationFn: (body: IOnboardUser) =>
      api.post({
        url: apiRoutes.auth.onboard(user_id, type),
        body,
        auth: false,
      }),
    onSuccess: (response) => {
      console.log(response, "Onboarding successful");
      Toast.show({
        type: 'success',
        text1: 'Onboarding Successful',
        text2: response.message || 'User onboarded successfully.',
      });
      onSuccess(response);
    },
    onError: (error) => {
      console.error(error, "Onboarding failed");
      Toast.show({
        type: 'error',
        text1: 'Onboarding Failed',
        text2: error.response?.data?.message || 'An unexpected error occurred.',
      });
    },
  });

  return {
    onboardUser: mutateAsync,
    onboardingUser: isPending,
    onboardedUser: isSuccess,
    data,
  };
};
