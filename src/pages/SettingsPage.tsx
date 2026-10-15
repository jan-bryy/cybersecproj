// src/pages/SettingsPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage, IonContent, IonIcon, useIonRouter, useIonViewWillEnter } from '@ionic/react';
import {
  arrowBackOutline,
  chevronForwardOutline,
  logOutOutline,
  trashOutline,
  shieldCheckmarkOutline,
  notificationsOutline,
  lockClosedOutline,
  phonePortraitOutline,
} from 'ionicons/icons';
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
      <IonContent fullscreen className="settings-content page-enter">
        <header className="settings-header">
          <button className="settings-back-btn" onClick={() => navigate(-1)} aria-label="Back">
            <IonIcon icon={arrowBackOutline} />
          </button>
          <span className="settings-title">Settings</span>
        </header>

        <p className="settings-group-label">Security &amp; privacy</p>
        <div className="settings-section">
          <div className="settings-row settings-row-tap" onClick={() => ionRouter.push('/security')}>
            <span className="settings-icon"><IonIcon icon={shieldCheckmarkOutline} /></span>
            <span className="settings-row-main">Account Security</span>
            <IonIcon icon={chevronForwardOutline} className="settings-chevron" />
          </div>
          <div className="settings-row settings-row-tap">
            <span className="settings-icon"><IonIcon icon={notificationsOutline} /></span>
            <span className="settings-row-main">Notifications</span>
            <IonIcon icon={chevronForwardOutline} className="settings-chevron" />
          </div>
          <div className="settings-row settings-row-tap">
            <span className="settings-icon"><IonIcon icon={lockClosedOutline} /></span>
            <span className="settings-row-main">Privacy</span>
            <IonIcon icon={chevronForwardOutline} className="settings-chevron" />
          </div>
          <div className="settings-row">
            <span className="settings-icon"><IonIcon icon={phonePortraitOutline} /></span>
            <div className="settings-row-text">
              <span className="settings-row-main">Device security check</span>
              <span className="settings-row-sub">
                Lets VyShop check this device to spot unusual logins
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

        <p className="settings-group-label">Account</p>
        <div className="settings-section">
          <div className="settings-row settings-row-tap settings-row-danger" onClick={() => setShowDelete(true)}>
            <span className="settings-icon settings-icon-danger"><IonIcon icon={trashOutline} /></span>
            <span className="settings-row-main">Delete Account</span>
          </div>
          <div className="settings-row settings-row-tap" onClick={handleLogout}>
            <span className="settings-icon settings-icon-dark"><IonIcon icon={logOutOutline} /></span>
            <span className="settings-row-main">Log Out</span>
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