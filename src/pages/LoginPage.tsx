// src/pages/LoginPage.tsx
import { useEffect, useState } from "react";
import { IonPage, IonContent, IonIcon, useIonRouter } from "@ionic/react";
import { personOutline, lockClosedOutline } from "ionicons/icons";
import SuspendedAccountModal from "../components/SuspendedAccountModal";
import UnusualActivityModal from "../components/UnusualActivityModal";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

const ERROR_MESSAGES = {
  invalid: "Incorrect email or password.",
  locked: "Too many failed attempts. Please try again later.",
  network: "No internet connection. Please check your network.",
  error: "Something went wrong. Please try again.",
} as const;

const VERIFY_ERRORS = {
  invalid_code: "Incorrect code. Please try again.",
  locked: "Too many attempts. Please try again in a few minutes.",
  expired: "Your login session expired. Please log in again.",
  network: "No internet connection. Please check your network.",
  error: "Something went wrong. Please try again.",
} as const;

const LoginPage: React.FC = () => {
  const ionRouter = useIonRouter();
  const { login, verifyTwoFactor, currentUser, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSuspendedModal, setShowSuspendedModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showUnusualModal, setShowUnusualModal] = useState(false);  
  const [step, setStep] = useState<"credentials" | "code">("credentials");
  const [codeInput, setCodeInput] = useState("");
  const [useRecovery, setUseRecovery] = useState(false);

  // The ONLY redirect: runs once a session exists (after login or on app start)
  useEffect(() => {
    if (!authLoading && currentUser && ionRouter.routeInfo.pathname === "/login") {
      const dest = currentUser.totpEnabled === true ? "/app/home" : "/2fa-setup";
      ionRouter.push(dest, "root", "replace");
    }
  }, [authLoading, currentUser, ionRouter]);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isLoading) return;
    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result === "success") {
      return; // the effect above redirects once currentUser is set
    }
    if (result === "2fa_required") {
      setPassword("");
      setCodeInput("");
      setUseRecovery(false);
      setStep("code");
      return;
    }
    if (result === "suspended") {
      setShowSuspendedModal(true);
      return;
    }
    if (result === "locked") {
      setPassword("");
      setShowUnusualModal(true);
      return;
    }
    if (result === "invalid") setPassword("");
    setErrorMessage(ERROR_MESSAGES[result]);
  };

  const backToLogin = () => {
    setStep("credentials");
    setCodeInput("");
    setUseRecovery(false);
    setErrorMessage("");
  };

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isLoading) return;
    setErrorMessage("");

    const value = codeInput.trim();
    if (!value) {
      setErrorMessage(useRecovery ? "Enter a recovery code." : "Enter the 6-digit code.");
      return;
    }

    setIsLoading(true);
    const result = await verifyTwoFactor(
      useRecovery ? { recoveryCode: value } : { code: value },
    );
    setIsLoading(false);

    if (result === "success") return; // the redirect effect handles it
    if (result === "expired") {
      backToLogin();
      setErrorMessage(VERIFY_ERRORS.expired);
      return;
    }
    setCodeInput("");
    setErrorMessage(VERIFY_ERRORS[result]);
  };

  return (
    <IonPage>
      <IonContent fullscreen className="login-content page-enter">
        <div className="login-container">
          <div className="login-logo-wrapper">
            <div className="login-logo-bag">
              <img src="/shopeeicon.png" alt="Shopee" className="login-logo-img" />
            </div>
          </div>

          {step === "credentials" ? (
            <form className="login-form" onSubmit={handleLogin} noValidate>
              <div className="login-input-wrapper">
                <IonIcon icon={personOutline} className="login-input-icon" />
                <input
                  className="login-input"
                  type="text"
                  inputMode="email"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  placeholder="No. Handphone/Email/Username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="login-input-wrapper">
                <IonIcon icon={lockClosedOutline} className="login-input-icon" />
                <input
                  className="login-input"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {errorMessage && (
                <p className="login-error" role="alert">
                  {errorMessage}
                </p>
              )}

              <button className="login-btn" type="submit" disabled={isLoading}>
                {isLoading ? "LOGGING IN..." : "LOG IN"}
              </button>

              <div className="login-links">
                <a href="#" className="login-link" onClick={(e) => e.preventDefault()}>
                  Forgot Password?
                </a>
              </div>
            </form>
          ) : (
            <form className="login-form" onSubmit={handleVerify} noValidate>
              <h2 className="login-title">Two-factor authentication</h2>
              <p className="login-hint">
                {useRecovery
                  ? "Enter one of your recovery codes. Each one works only once."
                  : "Enter the 6-digit code from your authenticator app."}
              </p>

              <input
                className="login-code-input"
                type="text"
                inputMode={useRecovery ? "text" : "numeric"}
                autoComplete="one-time-code"
                autoCapitalize="none"
                autoCorrect="off"
                maxLength={useRecovery ? 11 : 6}
                placeholder={useRecovery ? "xxxxx-xxxxx" : "000000"}
                value={codeInput}
                onChange={(e) =>
                  setCodeInput(
                    useRecovery
                      ? e.target.value
                      : e.target.value.replace(/\D/g, "").slice(0, 6),
                  )
                }
                autoFocus
              />

              {errorMessage && (
                <p className="login-error" role="alert">
                  {errorMessage}
                </p>
              )}

              <button className="login-btn" type="submit" disabled={isLoading}>
                {isLoading ? "VERIFYING..." : "VERIFY"}
              </button>

              <div className="login-links login-links-split">
                <button
                  type="button"
                  className="login-link-button"
                  onClick={() => {
                    setUseRecovery(!useRecovery);
                    setCodeInput("");
                    setErrorMessage("");
                  }}
                >
                  {useRecovery ? "Use authenticator code" : "Use a recovery code"}
                </button>
                <button type="button" className="login-link-button" onClick={backToLogin}>
                  Back to login
                </button>
              </div>
            </form>
          )}

          {step === "credentials" && (
            <div className="login-signup">
              Don't have an account?{" "}
              <a
                href="#"
                className="login-link-bold"
                onClick={(e) => {
                  e.preventDefault();
                  ionRouter.push("/signup");
                }}
              >
                Sign Up
              </a>
            </div>
          )}
        </div>

        <SuspendedAccountModal
          isOpen={showSuspendedModal}
          onClose={() => setShowSuspendedModal(false)}
        />
        <UnusualActivityModal
          isOpen={showUnusualModal}
          onClose={() => setShowUnusualModal(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;