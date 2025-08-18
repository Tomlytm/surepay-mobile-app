"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getLocalStorage } from "@/services/formats";
import appConfig from "@/services/app-config";
import { toast } from "react-toastify";

const useAuth = () => {
  const router = useRouter();
  const pathname = usePathname(); // Get the current path
  const user = getLocalStorage(appConfig.userDetails);
  const token = getLocalStorage(appConfig.tokenKey);

  useEffect(() => {
    const validateSession = () => {
      if (!user || !token) {
        toast.error("Invalid Access. Please sign in.");
        router.replace("/");
        return;
      }

      let agencyPath = user?.agency?.toUpperCase();
      switch (user?.agency?.toUpperCase()) {
        case 'NPF':
          agencyPath = '/NPF';
          break;
        case "NCS":
          agencyPath = "/NCS";
          break;
        case "FHC":
          agencyPath = "/FHC";
          break;
        case "SHC":
          agencyPath = "/FCTHC";
          break;
        case "MC":
          agencyPath = "/FCTMC";
          break;
      }

      if (
        (agencyPath && !pathname.includes(agencyPath)) 
        // ||        !pathname.includes("/stakeholders-dashboard/FCTMC/reports/FCTMC/")
      ) {
        toast.error(
          "Access denied. Please sign in with the appropriate agency account."
        );
        router.replace("/");
        return;
      }
    };

    validateSession();
  }, [pathname, router]); // Ensure validation runs when pathname changes
};

export default useAuth;
