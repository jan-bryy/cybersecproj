// src/components/DeleteAccountModal.tsx
import { useState } from 'react';
import { IonModal } from '@ionic/react';
import WarningTriangle from './WarningTriangle';
import './DeleteAccountModal.css';

export const CONFIRM_PHRASE = 'delete-account';

interface DeleteAccountModalProps {
  isOpen: boolean;
  isDeleting: boolean;
  error: string;
  onKeep: () => void;
  onConfirm: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  isDeleting,
  error,
  onKeep,
  onConfirm,
}) => {
  const [step, setStep] = useState<'warn' | 'confirm'>('warn');
  const [typed, setTyped] = useState('');

  const reset = () => {
    setStep('warn');
    setTyped('');
  };

    const keep = () => {
    onKeep(); 
    };

  const matches = typed.trim() === CONFIRM_PHRASE;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (matches && !isDeleting) onConfirm();
  };

  return (
    <IonModal
    isOpen={isOpen}
    className="delete-modal"
    backdropDismiss={false}
    canDismiss={!isDeleting}
    onDidDismiss={() => {
        reset();
        onKeep();
    }}
    aria-labelledby="delete-title"
    >
      <div className="delete-modal-content" role="alertdialog">
        <div className="delete-icon-wrapper">
          <WarningTriangle className="delete-icon" />
        </div>

        {step === 'warn' ? (
          <>
            <h2 id="delete-title" className="delete-title">
              Are you sure you want to delete your account?
            </h2>
            <p className="delete-text">This action is permanent and cannot be undone.</p>

            <p className="delete-subtitle">You may lose access to:</p>
            <ul className="delete-list">
              <li>Order history</li>
              <li>Saved addresses</li>
              <li>Rewards and vouchers</li>
              <li>Account preferences</li>
            </ul>

            <button type="button" className="delete-btn-outline" onClick={keep}>
              Keep your account
            </button>
            <button type="button" className="delete-btn-filled" onClick={() => setStep('confirm')}>
              Permanently Delete
            </button>
          </>
        ) : (
          <form onSubmit={submit}>
            <h2 id="delete-title" className="delete-title">
              Confirm account deletion
            </h2>
            <p className="delete-text">
              To continue, type <strong className="delete-phrase">{CONFIRM_PHRASE}</strong> below.
            </p>

            <input
              className="delete-input"
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={CONFIRM_PHRASE}
              aria-label={`Type ${CONFIRM_PHRASE} to confirm`}
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              disabled={isDeleting}
            />

            {error && (
              <p className="delete-error" role="alert">
                {error}
              </p>
            )}

            <button type="button" className="delete-btn-outline" onClick={keep} disabled={isDeleting}>
              Cancel
            </button>
            <button type="submit" className="delete-btn-filled" disabled={!matches || isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </button>
          </form>
        )}
      </div>
    </IonModal>
  );
};

export default DeleteAccountModal;