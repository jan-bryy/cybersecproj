// src/pages/SettingsPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage, IonContent, IonIcon, useIonRouter } from '@ionic/react';
import { arrowBackOutline, chevronForwardOutline, logOutOutline, trashOutline } from 'ionicons/icons';
import { useLogout } from '../hooks/useLogout';
import { deleteAccount } from '../api/account';
import { ApiError, NetworkError } from '../api/client';
import DeleteAccountModal, { CONFIRM_PHRASE } from '../components/DeleteAccountModal';
import './SettingsPage.css';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const ionRouter = useIonRouter();
  const logoutAndClearCart = useLogout();

  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleLogout = async () => {
    await logoutAndClearCart();
    ionRouter.push('/login', 'root', 'replace');
  };

  const closeDelete = () => {
    setShowDelete(false);
    setDeleteError('');
  };

  const handleDeleteAccount = async () => {
    if (isDeleting) return;
    setDeleteError('');
    setIsDeleting(true);

    try {
      await deleteAccount(CONFIRM_PHRASE);

      setShowDelete(false);
      await logoutAndClearCart();
      ionRouter.push('/login', 'root', 'replace');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        // Session already ended: SessionWatcher logs out and clears the cart
        setShowDelete(false);
        return;
      }
      if (err instanceof NetworkError) {
        setDeleteError('No internet connection. Your account was not deleted.');
      } else {
        setDeleteError('Something went wrong. Your account was not deleted.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="settings-content">
        <div className="settings-header">
          <IonIcon icon={arrowBackOutline} className="settings-back-icon" onClick={() => navigate(-1)} />
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
          <div className="settings-row settings-row-danger" onClick={() => setShowDelete(true)}>
            <IonIcon icon={trashOutline} />
            <span>Delete Account</span>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-row settings-row-logout" onClick={handleLogout}>
            <IonIcon icon={logOutOutline} />
            <span>Log Out</span>
          </div>
        </div>

        <DeleteAccountModal
          isOpen={showDelete}
          isDeleting={isDeleting}
          error={deleteError}
          onKeep={closeDelete}
          onConfirm={handleDeleteAccount}
        />
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;