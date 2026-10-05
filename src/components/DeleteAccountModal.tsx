// src/components/DeleteAccountModal.tsx
import { useState } from 'react';
import { IonModal } from '@ionic/react';
import './DeleteAccountModal.css';

export const CONFIRM_PHRASE = 'delete-account';

interface DeleteAccountModalProps {
  isOpen: boolean;
  isDeleting: boolean;
  error: string;
  onKeep: () => void;
  onConfirm: () => void;
}

const TrashIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="delete-icon"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 7h16" />
    <path d="M9.5 7V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2" />
    <path d="M6.5 7l.8 11.2A2 2 0 0 0 9.3 20h5.4a2 2 0 0 0 2-1.8L17.5 7" />
    <path d="M10 11v5M14 11v5" />
  </svg>
);

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
          <TrashIcon />
        </div>

        {step === 'warn' ? (
          <>
            <h2 id="delete-title" className="delete-title">
              Are you sure you want to delete your account?
            </h2>
            <p className="delete-text">This action is permanent and cannot be undone.</p>

            <div className="delete-info">
              <p className="delete-subtitle">You may lose access to</p>
              <ul className="delete-list">
                <li>Order history</li>
                <li>Saved addresses</li>
                <li>Rewards and vouchers</li>
                <li>Account preferences</li>
              </ul>
            </div>

            <button type="button" className="delete-btn-filled" onClick={onKeep}>
              Keep your account
            </button>
            <button type="button" className="delete-btn-text" onClick={() => setStep('confirm')}>
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

            <button type="submit" className="delete-btn-filled" disabled={!matches || isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </button>
            <button type="button" className="delete-btn-text" onClick={onKeep} disabled={isDeleting}>
              Cancel
            </button>
          </form>
        )}
      </div>
    </IonModal>
  );
};

export default DeleteAccountModal;