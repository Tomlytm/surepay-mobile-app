import api from "@/services/api";
import { apiRoutes } from "@/services/api/api-routes";
import { useQuery } from "@tanstack/react-query";
import Toast from "react-native-toast-message";


type Billers = {
    id: string,
    name: string,
    image: string
}
export const useFetchBillers = () => {

    const { data, isLoading, isError, refetch } = useQuery<Billers[]>(
        {
            queryKey: ["fetchbillers"],
            queryFn: async () => {
                const response = await api.get({
                    url: `${apiRoutes.billers.billers}`,
                    auth: true,
                });
                // console.log("Phone number validation response:", response);
                return response;
            },
            //   enabled: !!planName,
        }
    );

    if (isError) {
        Toast.show({
            type: "error",
            text1: "Error Fetching Billers",
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

type UseFetchBillersByCategoryParams =
    {
        id: string,
        category: string,
        name: string,
        info: string,
        isBouquetService: string,
        image: string,
        status: string
    }

export const useFetchBillersByCategory = (category: string) => {
    const { data, isLoading, isError, refetch } = useQuery<UseFetchBillersByCategoryParams[]>(
        {
            queryKey: ["fetchbillers", category],
            queryFn: async () => {
                const response = await api.get({
                    url: `${apiRoutes.billers.billersByCategory(category)}`,
                    auth: true,
                });
                return response;
            },
            //   enabled: !!planName,
        }
    );

    if (isError) {
        Toast.show({
            type: "error",
            text1: "Error Fetching Billers",
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
type Bouquet = {
    code: string,
    name: string,
    description: string,
    price: string,
    type: string
}

export const useFetchBillersBouquet = (category: string, bouquet_id: string) => {
    console.log("category", category)
    console.log("bouquet_id", bouquet_id)
    const { data, isLoading, isError, refetch } = useQuery<Bouquet[]>(
        {
            queryKey: ["fetchbillers", category, bouquet_id],
            queryFn: async () => {
                const response = await api.get({
                    url: `${apiRoutes.billers.billerBouquet(category, bouquet_id)}`,
                    auth: true,
                });
                return response.bouquets;
            },
            //   enabled: !!planName,
        }
    );

    if (isError) {
        Toast.show({
            type: "error",
            text1: "Error Fetching Billers Bouquet",
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
