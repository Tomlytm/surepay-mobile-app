import api from "@/services/api";
import { apiRoutes } from "@/services/api/api-routes";
import { useQuery } from "@tanstack/react-query";
import Toast from "react-native-toast-message";



export const useFetchPlans = (planName: string) => {
  
  const { data, isLoading, isError, refetch } = useQuery<any>(
    {
      queryKey: ["fetchplans", planName],
      queryFn: async () => {
        const response = await api.get({
          url: `${apiRoutes.plans.plans(planName)}`,
          auth: true,
        });
        // console.log("Phone number validation response:", response);
        return response;
      },
      enabled: !!planName,
    }
  );

  if (isError) {
    Toast.show({
      type: "error",
      text1: "Error Fetching Plans",
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