import { useEffect } from "react";
import { useIonRouter } from "@ionic/react";
import { setSetupRequiredHandler } from "../api/client";

const TwoFactorGate: React.FC = () => {
  const ionRouter = useIonRouter();

  useEffect(() => {
    setSetupRequiredHandler(() => {
      if (ionRouter.routeInfo.pathname !== "/2fa-setup") {
        ionRouter.push("/2fa-setup", "root", "replace");
      }
    });
    return () => setSetupRequiredHandler(null);
  }, [ionRouter]);

  return null;
};

export default TwoFactorGate;