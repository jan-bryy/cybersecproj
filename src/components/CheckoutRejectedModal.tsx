// src/components/CheckoutRejectedModal.tsx
import { IonModal } from '@ionic/react';
import './CheckoutRejectedModal.css';

interface CheckoutRejectedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLearnMore: () => void;
}

const ShieldIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="rejected-icon"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3l7 3v5.5c0 4.3-2.9 7.9-7 9.5-4.1-1.6-7-5.2-7-9.5V6l7-3z" />
    <path d="M12 8.5v4" />
    <circle cx="12" cy="15.6" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

const CheckoutRejectedModal: React.FC<CheckoutRejectedModalProps> = ({
  isOpen,
  onClose,
  onLearnMore,
}) => {
  return (
    <IonModal
      isOpen={isOpen}
      className="rejected-modal"
      backdropDismiss={false}
      onDidDismiss={onClose}
      aria-labelledby="rejected-message"
    >
      <div className="rejected-modal-content" role="alertdialog">
        <div className="rejected-icon-wrapper">
          <ShieldIcon />
        </div>

        <span className="rejected-code">M04</span>

        <p id="rejected-message" className="rejected-message">
          Your checkout attempt has been rejected due to unusual activities in
          your account. Please make sure you comply with Shopee policies.
        </p>

        <button type="button" className="rejected-btn-filled" onClick={onClose}>
          OK
        </button>
        <button type="button" className="rejected-btn-text" onClick={onLearnMore}>
          Learn More
        </button>
      </div>
    </IonModal>
  );
};

export default CheckoutRejectedModal;