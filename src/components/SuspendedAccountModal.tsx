// src/components/SuspendedAccountModal.tsx
import { IonModal } from "@ionic/react";
import "./SuspendedAccountModal.css";

interface SuspendedAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactSupport: () => void;
  onViewDetails: () => void;
}

const WarningTriangle: React.FC = () => (
  <svg viewBox="0 0 96 70" className="suspended-icon" aria-hidden="true">
    <polygon
      points="48,8 88,62 8,62"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="12"
      strokeLinejoin="round"
    />
    <rect x="44.5" y="26" width="7" height="20" rx="3.5" fill="#fff" />
    <circle cx="48" cy="54" r="4" fill="#fff" />
  </svg>
);

const SuspendedAccountModal: React.FC<SuspendedAccountModalProps> = ({
  isOpen,
  onClose,
  onContactSupport,
  onViewDetails,
}) => {
  return (
    <IonModal
      isOpen={isOpen}
      className="suspended-modal"
      backdropDismiss={false}
      onDidDismiss={onClose}
      aria-labelledby="suspended-title"
      aria-describedby="suspended-description"
    >
      <div className="suspended-modal-content" role="alertdialog">
        <div className="suspended-icon-wrapper">
          <WarningTriangle />
        </div>

        <h2 id="suspended-title" className="suspended-title">
          Your Account Has Been Temporarily Suspended
        </h2>

        <p id="suspended-description" className="suspended-description">
          We detected activity involving unauthorized credit card transactions
          associated with your account. To protect users and prevent further
          unauthorized transactions, access to your account has been temporarily
          restricted.
        </p>

        <div className="suspended-info-box">
          <p className="suspended-info-title">What you can do:</p>
          <ul>
            <li>
              Check the email sent to your registered Shopee email address for
              more information.
            </li>
            <li>
              If you believe this action was made in error, contact Shopee
              Support.
            </li>
          </ul>
          <button
            type="button"
            className="suspended-btn-outline"
            onClick={onViewDetails}
          >
            View Details
          </button>
        </div>

        <button
          type="button"
          className="suspended-btn-filled"
          onClick={onClose}
        >
          Close
        </button>
        <button
          type="button"
          className="suspended-btn-outline-plain"
          onClick={onContactSupport}
        >
          Contact Support
        </button>
      </div>
    </IonModal>
  );
};

export default SuspendedAccountModal;
