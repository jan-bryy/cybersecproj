// src/pages/SettingsPage.tsx
import { useNavigate } from "react-router-dom";
import { IonPage, IonContent, IonIcon, useIonRouter } from "@ionic/react";
import {
  arrowBackOutline,
  chevronForwardOutline,
  logOutOutline,
  trashOutline,
} from "ionicons/icons";
import { useLogout } from "../hooks/useLogout";
import "./SettingsPage.css";

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const logoutAndClearCart = useLogout();
  const ionRouter = useIonRouter();

  const handleLogout = async () => {
    await logoutAndClearCart();
    ionRouter.push('/login', 'root', 'replace');
  };

  const handleDeleteAccount = () => {
    // Account-deletion warning modal wires in here next
    console.log("trigger account deletion warning");
  };

  return (
    <IonPage>
      <IonContent fullscreen className="settings-content">
        <div className="settings-header">
          <IonIcon
            icon={arrowBackOutline}
            className="settings-back-icon"
            onClick={() => navigate(-1)}
          />
          <span className="settings-title">Settings</span>
        </div>

        <div className="settings-section">
          <div className="settings-row">
            <span>Account Security</span>
            <IonIcon icon={chevronForwardOutline} />
          </div>
          <div className="settings-row">
            <span>Notifications</span>
            <IonIcon icon={chevronForwardOutline} />
          </div>
          <div className="settings-row">
            <span>Privacy</span>
            <IonIcon icon={chevronForwardOutline} />
          </div>
        </div>

        <div className="settings-section">
          <div
            className="settings-row settings-row-danger"
            onClick={handleDeleteAccount}
          >
            <IonIcon icon={trashOutline} />
            <span>Delete Account</span>
          </div>
        </div>

        <div className="settings-section">
          <div
            className="settings-row settings-row-logout"
            onClick={handleLogout}
          >
            <IonIcon icon={logOutOutline} />
            <span>Log Out</span>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
