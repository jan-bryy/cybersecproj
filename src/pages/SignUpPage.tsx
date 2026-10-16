// src/pages/SignUpPage.tsx
import { useRef, useState } from "react";
import { IonPage, IonContent, IonIcon, useIonRouter } from "@ionic/react";
import { setDeviceConsent } from "../api/account";
import {
  arrowBackOutline,
  helpCircleOutline,
  lockClosedOutline,
  mailOutline,
  personOutline,
  ticketOutline,
} from "ionicons/icons";
import SecureAccountModal from "../components/SecureAccountModal";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css"; // shared input / button / divider / social styles
import "./SignUpPage.css";
import { checkPassword } from "../utils/passwordPolicy";

const ERROR_MESSAGES = {
  email_taken: "This email is already registered. Try logging in instead.",
  invalid: "Please check your details and try again.",
  locked: "Too many attempts. Please try again later.",
  network: "No internet connection. Please check your network.",
  error: "Something went wrong. Please try again.",
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignUpPage: React.FC = () => {
  const ionRouter = useIonRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSecure, setShowSecure] = useState(false);
  const finished = useRef(false);
  const rules = checkPassword(password, name, email);
  const passwordOk = rules.every((r) => r.ok);

  const canSubmit = name.trim() !== "" && email.trim() !== "" && password !== "";

  const handleSignUp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isLoading || !canSubmit) return;
    setErrorMessage("");

    if (!EMAIL_RE.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!passwordOk) {
      setErrorMessage("Your password doesn't meet all the requirements.");
      return;
    }

    setIsLoading(true);
    const result = await register(name, email, password);
    setIsLoading(false);

    if (result === "success") {
      setShowSecure(true); // account created: ask to secure it
      return;
    }
    setErrorMessage(ERROR_MESSAGES[result]);
  };

  // Agree and Not Now both continue into the app. The ref stops the modal's
  // dismiss event from running this a second time.
  const finish = async (agreed: boolean) => {
    if (finished.current) return;
    finished.current = true;
    try {
      await setDeviceConsent(agreed);
    } catch {
      /* never block a new account on saving this choice */
    }
    setShowSecure(false);
    ionRouter.push("/2fa-setup", "root", "replace");
  };

  return (
    <IonPage>
      <IonContent fullscreen className="login-content">
        <div className="signup-header">
          <IonIcon
            icon={arrowBackOutline}
            className="signup-back"
            onClick={() => ionRouter.goBack()}
          />
          <span className="signup-title">Sign Up</span>
          <IonIcon icon={helpCircleOutline} className="signup-help" />
        </div>

        <div className="login-container signup-container">
          <div className="login-logo-wrapper signup-logo">
            <img src="/vyshop-logo.svg" alt="VyShop" className="login-logo-img" />
          </div>

          <div className="signup-voucher">
            <IonIcon icon={ticketOutline} />
            <span>Sign up get free shipping voucher</span>
          </div>

          <form className="login-form" onSubmit={handleSignUp} noValidate>
            <div className="login-input-wrapper">
              <IonIcon icon={personOutline} className="login-input-icon" />
              <input
                className="login-input"
                type="text"
                autoComplete="name"
                placeholder="Name"
                maxLength={50}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="login-input-wrapper">
              <IonIcon icon={mailOutline} className="login-input-icon" />
              <input
                className="login-input"
                type="text"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="login-input-wrapper">
              <IonIcon icon={lockClosedOutline} className="login-input-icon" />
              <input
                className="login-input"
                type="password"
                autoComplete="new-password"
                placeholder="Password"
                maxLength={72}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {password && (
              <ul className="pw-rules" aria-live="polite">
                {rules.map((r) => (
                  <li key={r.id} className={r.ok ? "is-ok" : ""}>
                    {r.ok ? "✓" : "○"} {r.label}
                  </li>
                ))}
              </ul>
            )}

            {errorMessage && (
              <p className="login-error" role="alert">
                {errorMessage}
              </p>
            )}

            <button
              className="login-btn signup-btn"
              type="submit"
              disabled={!canSubmit || isLoading}
            >
              {isLoading ? "CREATING ACCOUNT..." : "Sign Up"}
            </button>
          </form>

          <p className="signup-terms">
            By signing up, you agree to VyShop's{" "}
            <span className="signup-terms-link">Terms of Service</span> &amp;{" "}
            <span className="signup-terms-link">Privacy Policy</span>
          </p>

          <p className="signup-login">
            Already have an account?{" "}
            <a
              href="#"
              className="signup-login-link"
              onClick={(e) => {
                e.preventDefault();
                ionRouter.goBack();
              }}
            >
              Log In
            </a>
          </p>
        </div>

        <SecureAccountModal
          isOpen={showSecure}
          onAgree={() => finish(true)}
          onNotNow={() => finish(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default SignUpPage;