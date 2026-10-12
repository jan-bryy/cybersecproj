// src/components/CheckoutRejectedModal.tsx
import { useState } from "react";
import { IonModal } from "@ionic/react";
import ContactSupportModal from "./ContactSupportModal";
import "./CheckoutRejectedModal.css";

interface CheckoutRejectedModalProps {
  isOpen: boolean;
  onClose: () => void;
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

const SafeLockIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="rejected-safe-icon"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="5" y="11" width="14" height="9" rx="2.5" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

const CheckoutRejectedModal: React.FC<CheckoutRejectedModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [showContact, setShowContact] = useState(false);

  return (
    <>
      <IonModal
        isOpen={isOpen && !showContact}
        className="rejected-modal"
        backdropDismiss={false}
        onDidDismiss={() => {
          if (!showContact) onClose();
        }}
      >
        <div
          className="rejected-modal-content"
          role="alertdialog"
          aria-labelledby="rejected-title"
          aria-describedby="rejected-description"
        >
          <div className="rejected-icon-wrapper">
            <ShieldIcon />
          </div>

          <h2 id="rejected-title" className="rejected-title">
            Checkout temporary unavailable
          </h2>

          <p id="rejected-description" className="rejected-description">
            We detected an unusual activity on your account that prevent us
            from completing this order.
          </p>

          <div className="rejected-info">
            <p className="rejected-subtitle">Why is this happening?</p>
            <p className="rejected-info-text">
              For your account security, our system flagged this checkout
              because of one or more of the following:
            </p>
            <ul className="rejected-list">
              <li>Order placed from a new or unrecognized device or location</li>
              <li>
                Multiple failed payment method attempts or a sudden change in
                payment method
              </li>
              <li>
                Unusual checkout behavior (e.g., many checkouts in a short
                time).
              </li>
            </ul>
          </div>

          <div className="rejected-safe">
            <SafeLockIcon />
            <div>
              <p className="rejected-safe-title">Your account is safe.</p>
              <p className="rejected-safe-text">
                No changes were made to your account.
              </p>
            </div>
          </div>

          <button type="button" className="rejected-btn-filled" onClick={onClose}>
            Try Again
          </button>
          <button
            type="button"
            className="rejected-btn-text"
            onClick={() => setShowContact(true)}
          >
            Contact Support
          </button>
        </div>
      </IonModal>

      <ContactSupportModal
        isOpen={showContact}
        onClose={() => setShowContact(false)}
      />
    </>
  );
};

export default CheckoutRejectedModal;