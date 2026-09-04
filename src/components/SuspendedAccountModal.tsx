// src/components/SuspendedAccountModal.tsx
import { IonModal, IonIcon } from '@ionic/react';
import { alertOutline } from 'ionicons/icons';
import './SuspendedAccountModal.css';

interface SuspendedAccountModalProps {
  isOpen: boolean;
  onTryAgain: () => void;
  onContactSupport: () => void;
  onViewDetails: () => void;
}

const SuspendedAccountModal: React.FC<SuspendedAccountModalProps> = ({
  isOpen,
  onTryAgain,
  onContactSupport,
  onViewDetails,
}) => {
  return (
    <IonModal isOpen={isOpen} className="suspended-modal" backdropDismiss={false}>
      <div className="suspended-modal-content">
        <div className="suspended-icon-wrapper">
          <IonIcon icon={alertOutline} className="suspended-icon" />
        </div>

        <h2 className="suspended-title">Your Account Has Been Temporarily Suspended</h2>

        <p className="suspended-description">
          We detected activity involving unauthorized credit card transactions associated with
          your account. To protect users and prevent further unauthorized transactions, access to
          your account has been temporarily restricted.
        </p>

        <div className="suspended-info-box">
          <p className="suspended-info-title">What you can do:</p>
          <ul>
            <li>Check the email sent to your registered Shopee email address for more information.</li>
            <li>If you believe this action was made in error, contact Shopee Support.</li>
          </ul>
          <button className="suspended-btn-outline" onClick={onViewDetails}>
            View Details
          </button>
        </div>

        <button className="suspended-btn-filled" onClick={onTryAgain}>
          Try Again
        </button>
        <button className="suspended-btn-outline-plain" onClick={onContactSupport}>
          Contact Support
        </button>
      </div>
    </IonModal>
  );
};

export default SuspendedAccountModal;