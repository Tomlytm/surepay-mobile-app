import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import api from "@/services/api";
import { apiRoutes } from "@/services/api/api-routes";
import { useMutation } from "@tanstack/react-query";

// Define the Transaction interface based on expected API response
export interface Transaction {
  id: number;
  amount: number;
  status: string;
  created_at: string;
  description: string | null;
  network: string;
  payment_transaction_id: string | null;
  phone: string;
  plan_id: number | null;
  reference: string;
  type: string;
  user: any; // Replace 'any' with a proper User interface if available
  user_id: number;
}

interface UseFetchTransactionsParams {
  page?: number;
  limit?: number;
}
interface TransactionsApiResponse {
  data: Transaction[];
  total: number;
  page: number;
  last_page: number;
}
export const useFetchTransactions = ({
  page = 1,
  limit = 20,
}: UseFetchTransactionsParams = {}) => {
  const { data, isLoading, isError, refetch } =
    useQuery<TransactionsApiResponse>({
      queryKey: ["transactions", page, limit],
      queryFn: async () => {
        const response = await api.get({
          url: `${apiRoutes.transactions.get}?page=${page}&limit=${limit}`,
          auth: true,
        });
        return response;
      },
    });

  if (isError) {
    toast.error("Failed to fetch transactions");
  }

  return {
    transactions: data,
    loading: isLoading,
    error: isError,
    refetch,
  };
};
interface UseFetchTransactionByIdParams {
  id: number;
}

export const useFetchTransactionById = ({
  id,
}: UseFetchTransactionByIdParams) => {
  const { data, isLoading, isError, refetch } = useQuery<Transaction>({
    queryKey: ["transaction", id],
    queryFn: async () => {
      const response = await api.get({
        url: `${apiRoutes.transactions.get}/${id}`,
        auth: true,
      });
      return response;
    },
    enabled: !!id,
  });

  if (isError) {
    toast.error("Failed to fetch transaction details");
  }

  return {
    transaction: data,
    loading: isLoading,
    error: isError,
    refetch,
  };
};

interface AirtimePurchaseCardData {
  card_number: string;
  expiry_month: string;
  expiry_year: string;
  security_code: string;
  fistname: string;
  lastname: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  save_card: boolean;
}

interface AirtimePurchasePaymentCharge {
  payment_card: string;
  card_id: number;
  card_data: AirtimePurchaseCardData;
}

export interface AirtimePurchasePayload {
  network: string;
  phone: string;
  amount: number;
  payment_charge: AirtimePurchasePaymentCharge;
  is_beneficiary: boolean;
}
export interface DataPurchasePayload {
  plan_id: string;
  network:string;
  phone: string;
  payment_charge: AirtimePurchasePaymentCharge;
  is_beneficiary: boolean;
}

export const useAirtimePurchase = (
  onSuccess: (response: any) => void,
  onError?: (error: any) => void
) => {
  const { mutateAsync, isPending, isSuccess, data } = useMutation({
    mutationFn: (payload: AirtimePurchasePayload) =>
      api.post({
        url: apiRoutes.transactions.airtimePurchase,
        body: payload,
        auth: true,
      }),
    onSuccess: (response) => {
      // toast.success(response.message || "Airtime purchased successfully");
      onSuccess(response);
    },
    onError: (error: any) => {
      // toast.error(error?.response?.data?.message || "Airtime purchase failed");
      onError?.(error);
    },
  });

  return {
    purchaseAirtime: mutateAsync,
    purchasing: isPending,
    purchased: isSuccess,
    data,
  };
};
export const useDataPurchase = (
  onSuccess: (response: any) => void,
  onError?: (error: any) => void
) => {
  const { mutateAsync, isPending, isSuccess, data } = useMutation({
    mutationFn: (payload: DataPurchasePayload) =>
      api.post({
        url: apiRoutes.transactions.dataPurchase,
        body: payload,
        auth: true,
      }),
    onSuccess: (response) => {
      // toast.success(response.message || "Airtime purchased successfully");
      onSuccess(response);
    },
    onError: (error: any) => {
      // toast.error(error?.response?.data?.message || "Airtime purchase failed");
      onError?.(error);
    },
  });

  return {
    purchaseData: mutateAsync,
    purchasing: isPending,
    purchased: isSuccess,
    data,
  };
};
interface SubmitPinPayload {
  pin: string;
  reference: string;
}

export const useSubmitPin = (
  onSuccess: (response?: any) => void,
  onError?: (error: any) => void
) => {
  const { mutateAsync, isPending, isSuccess, data } = useMutation({
    mutationFn: (payload: SubmitPinPayload) =>
      api.post({
        url: apiRoutes.transactions.submitpin,
        body: payload,
        auth: true,
      }),
    onSuccess: (response) => {
      onSuccess(response);
      console.log(response, 'submitpin')
    },
    onError: (error: any) => {
      onError?.(error);
      console.log(error, 'error')
    },
  });

  return {
    submitPin: mutateAsync,
    submitting: isPending,
    submitted: isSuccess,
    data,
  };
};

interface SubmitOtpPayload {
  otp: string;
  reference: string;
}

export const useSubmitOtp = (
  onSuccess: (response?: any) => void,
  onError?: (error: any) => void
) => {
  const { mutateAsync, isPending, isSuccess, data } = useMutation({
    mutationFn: (payload: SubmitOtpPayload) =>
      api.post({
        url: apiRoutes.transactions.submitotp,
        body: payload,
        auth: true,
      }),
    onSuccess: (response) => {
      onSuccess(response);
      console.log(response, 'submitotp');
    },
    onError: (error: any) => {
      onError?.(error);
      console.log(error, 'error');
    },
  });

  return {
    submitOtp: mutateAsync,
    submitting: isPending,
    submitted: isSuccess,
    data,
  };
};