// src/pages/SettingsPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage, IonContent, IonIcon, useIonRouter, useIonViewWillEnter } from '@ionic/react';
import { arrowBackOutline, chevronForwardOutline, logOutOutline, trashOutline } from 'ionicons/icons';
import { useLogout } from '../hooks/useLogout';
import { deleteAccount, getDeviceConsent, setDeviceConsent } from '../api/account';
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

  const [deviceCheck, setDeviceCheck] = useState<boolean | null>(null); // null = still loading
  const [deviceCheckSaving, setDeviceCheckSaving] = useState(false);
  const [deviceCheckError, setDeviceCheckError] = useState('');

  // Reload each time the page is entered, so it never shows a stale choice
  useIonViewWillEnter(() => {
    setDeviceCheckError('');
    getDeviceConsent()
      .then((res) => setDeviceCheck(res.granted))
      .catch((err) => {
        // 401: SessionWatcher already handles the logout
        if (!(err instanceof ApiError && err.status === 401)) {
          setDeviceCheckError("Couldn't load this setting.");
        }
      });
  });

  const handleDeviceCheckToggle = async () => {
    if (deviceCheck === null || deviceCheckSaving) return;
    const next = !deviceCheck;
    setDeviceCheckError('');
    setDeviceCheckSaving(true);
    setDeviceCheck(next); // update instantly, revert if saving fails

    try {
      await setDeviceConsent(next);
    } catch (err) {
      setDeviceCheck(!next);
      if (err instanceof NetworkError) {
        setDeviceCheckError('No internet connection. Your choice was not saved.');
      } else if (!(err instanceof ApiError && err.status === 401)) {
        setDeviceCheckError('Something went wrong. Your choice was not saved.');
      }
    } finally {
      setDeviceCheckSaving(false);
    }
  };

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
          <div className="settings-row" onClick={() => ionRouter.push('/security')}>
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
          <div className="settings-row">
            <div className="settings-row-text">
              <span>Device security check</span>
              <span className="settings-row-sub">
                Lets Shopee check this device to spot unusual logins
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={deviceCheck === true}
              aria-label="Device security check"
              className="settings-switch"
              disabled={deviceCheck === null || deviceCheckSaving}
              onClick={handleDeviceCheckToggle}
            />
          </div>
          {deviceCheckError && (
            <p className="settings-row-error" role="alert">
              {deviceCheckError}
            </p>
          )}
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