import { useState } from "react";
import { IonModal } from "@ionic/react";
import ContactSupportModal from "./ContactSupportModal";
import "./SuspendedAccountModal.css";

interface UnusualActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShieldIcon: React.FC = () => (
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
    <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z" />
    <path d="M12 8.5v4" />
    <circle cx="12" cy="15.5" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

const UnusualActivityModal: React.FC<UnusualActivityModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [showContact, setShowContact] = useState(false);

  return (
    <>
      <IonModal
        isOpen={isOpen && !showContact}
        className="suspended-modal"
        backdropDismiss={false}
        onDidDismiss={() => {
          if (!showContact) onClose();
        }}
        aria-labelledby="unusual-title"
        aria-describedby="unusual-description"
      >
        <div className="suspended-modal-content" role="alertdialog">
          <div className="suspended-icon-wrapper">
            <ShieldIcon />
          </div>

          <h2 id="unusual-title" className="suspended-title">
            Login Failed (F02)
          </h2>

          <p id="unusual-description" className="suspended-description">
            Your login attempt has been rejected due to unusual activities in
            your account. If you think this is a mistake please contact us 
            or try again later
          </p>

          <button type="button" className="suspended-btn-filled" onClick={onClose}>
            OK
          </button>
          <button
            type="button"
            className="suspended-btn-text"
            onClick={() => setShowContact(true)}
          >
            Learn More
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

export default UnusualActivityModal;