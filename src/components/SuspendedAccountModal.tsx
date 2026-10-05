// src/components/SuspendedAccountModal.tsx
import { IonModal } from "@ionic/react";
import "./SuspendedAccountModal.css";

interface SuspendedAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactSupport: () => void;
  onViewDetails: () => void;
}

const LockIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="suspended-icon"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="5" y="11" width="14" height="9" rx="2.5" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    <circle cx="12" cy="15.5" r="1.1" fill="currentColor" stroke="none" />
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
          <LockIcon />
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
          <p className="suspended-info-title">What you can do</p>
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
            className="suspended-btn-link"
            onClick={onViewDetails}
          >
            View Details
          </button>
        </div>

        <button
          type="button"
          className="suspended-btn-filled"
          onClick={onContactSupport}
        >
          Contact Support
        </button>
        <button
          type="button"
          className="suspended-btn-text"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </IonModal>
  );
};

export default SuspendedAccountModal;