// src/components/ContactSupportModal.tsx
import { useState } from "react";
import { IonModal } from "@ionic/react";
import "./ContactSupportModal.css";

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOPICS = [
  "Suspended by mistake",
  "Unauthorized transactions",
  "Something else",
];

const CheckIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    className="contact-icon"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

const ContactSupportModal: React.FC<ContactSupportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"form" | "sending" | "sent">("form");
  const [ticketRef, setTicketRef] = useState("");

  const reset = () => {
    setTopic(TOPICS[0]);
    setMessage("");
    setStatus("form");
    setTicketRef("");
  };

  const canSend = message.trim().length > 0 && status === "form";

  // Mock only: no request is made, it just fakes a short delay
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    setStatus("sending");
    setTimeout(() => {
      setTicketRef(`SP-${Math.floor(100000 + Math.random() * 900000)}`);
      setStatus("sent");
    }, 1200);
  };

  return (
    <IonModal
      isOpen={isOpen}
      className="contact-modal"
      backdropDismiss={false}
      onDidDismiss={() => {
        reset();
        onClose();
      }}
      aria-labelledby="contact-title"
    >
      <div className="contact-modal-content">
        {status === "sent" ? (
          <div className="contact-sent">
            <div className="contact-icon-wrapper contact-icon-success">
              <CheckIcon />
            </div>
            <h2 id="contact-title" className="contact-title">
              Message sent
            </h2>
            <p className="contact-text">
              Our support team will get back to you through your registered
              email address.
            </p>
            <p className="contact-ref">Reference: {ticketRef}</p>
            <button
              type="button"
              className="contact-btn-filled"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={send}>
            <h2 id="contact-title" className="contact-title contact-title-left">
              Contact Support
            </h2>

            <p className="contact-label">Topic</p>
            <div className="contact-chips" role="group" aria-label="Topic">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`contact-chip ${t === topic ? "is-active" : ""}`}
                  aria-pressed={t === topic}
                  onClick={() => setTopic(t)}
                  disabled={status === "sending"}
                >
                  {t}
                </button>
              ))}
            </div>

            <label className="contact-label" htmlFor="contact-message">
              Message
            </label>
            <textarea
              id="contact-message"
              className="contact-textarea"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what happened"
              disabled={status === "sending"}
            />

            <button
              type="submit"
              className="contact-btn-filled"
              disabled={!canSend}
            >
              {status === "sending" ? "Sending..." : "Send"}
            </button>
            <button
              type="button"
              className="contact-btn-text"
              onClick={onClose}
              disabled={status === "sending"}
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </IonModal>
  );
};

export default ContactSupportModal;