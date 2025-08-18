import api from "@/services/api";
import { apiRoutes } from "@/services/api/api-routes";
import appConfig from "@/services/app-config";
import { saveLocalStorage } from "@/services/formats";
import { decryptAESKey, getOrCreateRSAKeyPair } from "@/utils/cryptoHelper";
import { formatPublicKey } from "@/utils/format";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

interface ILogin {
  email: string;
  password: string;
}


export const useLogin = (onSuccess?: () => void) => {
  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: async (data: ILogin) => {
      const { privateKey, publicKey } = await getOrCreateRSAKeyPair();
      const formattedPublicKey = formatPublicKey({ key: publicKey });
      const response = await api.post({
        url: apiRoutes.auth.login,
        body: {
          key: formattedPublicKey, // Send RSA public key to server
          email: data.email,
          password: data.password,
        },
        auth: false,
      });

      // Decrypt AES key from server response
      const encryptedAesKey = response?.payload?.key;
      if (!encryptedAesKey) throw new Error("Missing AES Key in response");

      const aesKey = decryptAESKey(encryptedAesKey, privateKey);

      // Optionally save AES key or private key if you need future encrypted communication
      saveLocalStorage(aesKey, appConfig.aesKey); // define this in app-config

      return { ...response, aesKey, privateKey };
    },
    onSuccess: (response) => {
      console.log("Login successful:", response);
      toast.success(response?.message || "Login successful");
      if (response) {
        saveLocalStorage(response?.payload?.token, appConfig.tokenKey);
        saveLocalStorage(
          response?.payload?.refreshToken,
          appConfig.refreshTokenKey
        );
        saveLocalStorage(response, appConfig.userDetails);
        console.log("Decrypted AES Key:", response?.aesKey);
      }
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      toast.error(error?.response?.data?.message || "Login Failed");
    },
  });

  return {
    login: mutate,
    logging: isPending,
    loggedin: isSuccess,
  };
};
