// src/components/SecureAccountModal.tsx
import { IonModal } from "@ionic/react";
import "./SecureAccountModal.css";

interface SecureAccountModalProps {
  isOpen: boolean;
  onAgree: () => void;
  onNotNow: () => void;
}

const ShieldCheckIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="secure-icon"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3l7 3v5.5c0 4.3-2.9 7.9-7 9.5-4.1-1.6-7-5.2-7-9.5V6l7-3z" />
    <path d="M8.8 12.2l2.2 2.2 4.2-4.4" />
  </svg>
);

const SecureAccountModal: React.FC<SecureAccountModalProps> = ({
  isOpen,
  onAgree,
  onNotNow,
}) => {
  return (
    <IonModal
      isOpen={isOpen}
      className="secure-modal"
      backdropDismiss={false}
      onDidDismiss={onNotNow}
    >
      <div
        className="secure-modal-content"
        role="alertdialog"
        aria-labelledby="secure-title"
        aria-describedby="secure-description"
      >
        <div className="secure-icon-wrapper">
          <ShieldCheckIcon />
        </div>

        <h2 id="secure-title" className="secure-title">
          Secure Your Account
        </h2>

        <p id="secure-description" className="secure-description">
          Shopee would like to access your device data to ensure your account
          is safe.
        </p>

        <button type="button" className="secure-btn-filled" onClick={onAgree}>
          Agree
        </button>
        <button type="button" className="secure-btn-text" onClick={onNotNow}>
          Not Now
        </button>
      </div>
    </IonModal>
  );
};

export default SecureAccountModal;