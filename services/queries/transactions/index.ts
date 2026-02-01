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

export interface UseFetchTransactionsParams {
  user_id?: number;
  business_id?: number;
  reference?: string;
  start_date?: string; // ISO string
  end_date?: string;   // ISO string
  amount_from?: number;
  amount_to?: number;
  status?: "PENDING" | "SUCCESS" | "FAILED";
  transaction_type?: string;
  network?: "MTN" | "Airtel" | "GLO" | "9Mobile";
  page?: number;
  limit?: number;
}

interface TransactionsApiResponse {
  data: Transaction[];
  total: number;
  page: number;
  last_page: number;
}

export interface TransactionSummaryCategory {
  category: string;
  transaction_types: string[];
  count: number;
  total_amount: number;
}

export interface TransactionSummary {
  summary: TransactionSummaryCategory[];
  total_transactions: number;
  grand_total_amount: number;
  commission_earned: number;
}

// Common interfaces for all transaction types
interface CardData {
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

interface PaymentCharge {
  payment_card: string;
  card_id: number;
  card_data: CardData;
  checkout_type: string;
}

// Payload interfaces for different transaction types
export interface AirtimePurchasePayload {
  network: string;
  phone: string;
  amount: number;
  payment_charge: PaymentCharge;
  is_beneficiary: boolean;
}

export interface DataPurchasePayload {
  plan_id: string;
  network: string;
  phone: string;
  payment_charge: PaymentCharge;
  is_beneficiary: boolean;
}

export interface ElectricityPurchasePayload {
  customer_name: string;
  customer_address: string;
  meter_no: string;
  biller_id: string;
  email_address: string;
  phone: string;
  amount: number;
  payment_charge: PaymentCharge;
}

export interface BetPurchasePayload {
  customer_name: string;
  bet_account_id: string;
  biller_id: string;
  amount: number;
  payment_charge: PaymentCharge;
}

export interface EducationPurchasePayload {
  biller_id: string;
  bouquet_code: string;
  payment_charge: PaymentCharge;
}

export interface InternetPurchasePayload {
  customer_name: string;
  customer_address: string;
  account_id: string;
  biller_id: string;
  bouquet_code: string;
  payment_charge: PaymentCharge;
}

export interface TvPurchasePayload {
  customer_name: string;
  customer_number: string;
  bouquet_code: string;
  addon_code: string;
  smartcard_no: string;
  biller_id: string;
  payment_charge: PaymentCharge;
}

// Query hooks for fetching transactions
export const useFetchTransactions = (params: UseFetchTransactionsParams = {}) => {
  const {
    user_id,
    business_id,
    reference,
    start_date,
    end_date,
    amount_from,
    amount_to,
    status,
    transaction_type,
    network,
    page = 1,
    limit = 20,
  } = params;

  const { data, isLoading, isError, refetch } = useQuery<TransactionsApiResponse>({
    queryKey: [
      "transactions",
      user_id,
      business_id,
      reference,
      start_date,
      end_date,
      amount_from,
      amount_to,
      status,
      transaction_type,
      network,
      page,
      limit,
    ],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (user_id) searchParams.append("user_id", String(user_id));
      if (business_id) searchParams.append("business_id", String(business_id));
      if (reference) searchParams.append("reference", reference);
      if (start_date) searchParams.append("start_date", start_date);
      if (end_date) searchParams.append("end_date", end_date);
      if (amount_from) searchParams.append("amount_from", String(amount_from));
      if (amount_to) searchParams.append("amount_to", String(amount_to));
      if (status) searchParams.append("status", status);
      if (transaction_type) searchParams.append("transaction_type", transaction_type);
      if (network) searchParams.append("network", network);
      searchParams.append("page", String(page));
      searchParams.append("limit", String(limit));

      const response = await api.get({
        url: `${apiRoutes.transactions.get}?${searchParams.toString()}`,
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

export interface UseFetchTransactionSummaryParams {
  start_date?: string;
  end_date?: string;
}

export const useFetchTransactionSummary = (params: UseFetchTransactionSummaryParams = {}) => {
  const { start_date, end_date } = params;
  
  const { data, isLoading, isError, refetch } = useQuery<TransactionSummary>({
    queryKey: ["transaction-summary", start_date, end_date],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      
      if (start_date) searchParams.append("start_date", start_date);
      if (end_date) searchParams.append("end_date", end_date);
      
      const queryString = searchParams.toString();
      const url = queryString ? `${apiRoutes.transactions.summary}?${queryString}` : apiRoutes.transactions.summary;
      
      const response = await api.get({
        url,
        auth: true,
      });
      return response;
    },
  });

  if (isError) {
    toast.error("Failed to fetch transaction summary");
  }

  return {
    summary: data,
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

// Purchase hooks for different transaction types

// 1. Airtime Purchase Hook
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
      onSuccess(response);
    },
    onError: (error: any) => {
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

// 2. Data Purchase Hook
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
      onSuccess(response);
    },
    onError: (error: any) => {
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

// 3. Electricity Purchase Hook
export const useElectricityPurchase = (
  onSuccess: (response: any) => void,
  onError?: (error: any) => void
) => {
  const { mutateAsync, isPending, isSuccess, data } = useMutation({
    mutationFn: (payload: ElectricityPurchasePayload) =>
      api.post({
        url: apiRoutes.transactions.electricityPurchase,
        body: payload,
        auth: true,
      }),
    onSuccess: (response) => {
      onSuccess(response);
    },
    onError: (error: any) => {
      onError?.(error);
    },
  });

  return {
    purchaseElectricity: mutateAsync,
    purchasing: isPending,
    purchased: isSuccess,
    data,
  };
};

// 4. Bet Purchase Hook
export const useBetPurchase = (
  onSuccess: (response: any) => void,
  onError?: (error: any) => void
) => {
  const { mutateAsync, isPending, isSuccess, data } = useMutation({
    mutationFn: (payload: BetPurchasePayload) =>
      api.post({
        url: apiRoutes.transactions.betPurchase,
        body: payload,
        auth: true,
      }),
    onSuccess: (response) => {
      onSuccess(response);
    },
    onError: (error: any) => {
      onError?.(error);
    },
  });

  return {
    purchaseBet: mutateAsync,
    purchasing: isPending,
    purchased: isSuccess,
    data,
  };
};

// 5. Education Purchase Hook
export const useEducationPurchase = (
  onSuccess: (response: any) => void,
  onError?: (error: any) => void
) => {
  const { mutateAsync, isPending, isSuccess, data } = useMutation({
    mutationFn: (payload: EducationPurchasePayload) =>
      api.post({
        url: apiRoutes.transactions.educationPurchase,
        body: payload,
        auth: true,
      }),
    onSuccess: (response) => {
      onSuccess(response);
    },
    onError: (error: any) => {
      onError?.(error);
    },
  });

  return {
    purchaseEducation: mutateAsync,
    purchasing: isPending,
    purchased: isSuccess,
    data,
  };
};

// 6. Internet Purchase Hook
export const useInternetPurchase = (
  onSuccess: (response: any) => void,
  onError?: (error: any) => void
) => {
  const { mutateAsync, isPending, isSuccess, data } = useMutation({
    mutationFn: (payload: InternetPurchasePayload) =>
      api.post({
        url: apiRoutes.transactions.internetPurchase,
        body: payload,
        auth: true,
      }),
    onSuccess: (response) => {
      onSuccess(response);
    },
    onError: (error: any) => {
      onError?.(error);
    },
  });

  return {
    purchaseInternet: mutateAsync,
    purchasing: isPending,
    purchased: isSuccess,
    data,
  };
};

// 7. TV Purchase Hook
export const useTvPurchase = (
  onSuccess: (response: any) => void,
  onError?: (error: any) => void
) => {
  const { mutateAsync, isPending, isSuccess, data } = useMutation({
    mutationFn: (payload: TvPurchasePayload) =>
      api.post({
        url: apiRoutes.transactions.tvPurchase,
        body: payload,
        auth: true,
      }),
    onSuccess: (response) => {
      onSuccess(response);
    },
    onError: (error: any) => {
      onError?.(error);
    },
  });

  return {
    purchaseTv: mutateAsync,
    purchasing: isPending,
    purchased: isSuccess,
    data,
  };
};

// Additional utility hooks

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