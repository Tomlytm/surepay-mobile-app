import api from "@/services/api";
import { apiRoutes } from "@/services/api/api-routes";
import { useQuery } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

interface State {
  id: number;
  name: string;
  // Add other fields if present in the API response
}

export const useFetchStates = () => {
  const { data, isLoading, isError, refetch } = useQuery<State[]>({
    queryKey: ["utility-states"],
    queryFn: async () => {
      const response = await api.get({
        url: apiRoutes.utility.states,
        auth: false,
      });

      console.log(response, "Fetched states successfully");
      return response;
    },
    // onError is not supported directly in useQuery options; handle errors below
  });
  if (isError) {
    Toast.show({
      type: "error",
      text1: "Error Fetching States",
      text2: "An unexpected error occurred.",
    });
  }

  return {
    states: data,
    loading: isLoading,
    error: isError,
    refetch,
  };
};
interface City {
  id: number;
  name: string;
  // Add other fields if present in the API response
}

export const useFetchCities = (stateId: number) => {
  console.log("Fetching cities for stateId:", stateId);
  const { data, isLoading, isError, refetch } = useQuery<City[]>({
    queryKey: ["utility-cities", stateId],
    queryFn: async () => {
      const response = await api.get({
        url: `${apiRoutes.utility.cities(stateId)}`,
        auth: false,
      });
      return response;
    },
    enabled: !!stateId,
  });
  if (isError) {
    Toast.show({
      type: "error",
      text1: "Error Fetching Cities",
      text2: "An unexpected error occurred.",
    });
  }

  return {
    cities: data,
    loading: isLoading,
    error: isError,
    refetch,
  };
};


export const useValidatePhoneNumber = (phoneNumber: string) => {
  
  const { data, isLoading, isError, refetch } = useQuery<"9mobile" | "mtn" | "airtel" | "glo">(
    {
      queryKey: ["validate-phone-number", phoneNumber],
      queryFn: async () => {
        const response = await api.get({
          url: `${apiRoutes.utility.validatePhone(phoneNumber)}`,
          auth: true,
        });
        console.log("Phone number validation response:", response);
        return response;
      },
      enabled: !!phoneNumber,
    }
  );

  if (isError) {
    Toast.show({
      type: "error",
      text1: "Error Validating Phone Number",
      text2: "An unexpected error occurred.",
    });
  }

  return {
    data,
    loading: isLoading,
    error: isError,
    refetch,
  };
};

