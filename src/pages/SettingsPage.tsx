// src/pages/SettingsPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage, IonContent, IonIcon, useIonRouter } from '@ionic/react';
import { arrowBackOutline, chevronForwardOutline, logOutOutline, trashOutline } from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import { useLogout } from '../hooks/useLogout';
import DeleteAccountModal from '../components/DeleteAccountModal';
import './SettingsPage.css';

const API_URL = import.meta.env.VITE_API_URL;

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const ionRouter = useIonRouter();
  const { token } = useAuth();
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
      const res = await fetch(`${API_URL}/api/account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ confirmation: 'delete-account' }),
      });

      if (res.status === 401) {
        setShowDelete(false);
        await logoutAndClearCart(); // session expired
        ionRouter.push('/login', 'root', 'replace');
        return;
      }
      if (!res.ok) {
        setDeleteError('Something went wrong. Your account was not deleted.');
        return;
      }

      setShowDelete(false);
      await logoutAndClearCart();
      ionRouter.push('/login', 'root', 'replace');
    } catch {
      setDeleteError('No internet connection. Your account was not deleted.');
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