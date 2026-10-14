import { useEffect, useState } from "react";
import { IonPage, IonContent, useIonRouter } from "@ionic/react";
import { useAuth } from "../context/AuthContext";
import { ApiError, NetworkError } from "../api/client";
import { startTwoFactorSetup, confirmTwoFactorSetup } from "../api/twofa";
import "./LoginPage.css";
import "./TwoFactorSetupPage.css";

type Step = "intro" | "scan" | "recovery";

const TwoFactorSetupPage: React.FC = () => {
  const ionRouter = useIonRouter();
  const { currentUser, isLoading: authLoading, markTwoFactorEnabled } = useAuth();
  const [step, setStep] = useState<Step>("intro");
  const [qr, setQr] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [code, setCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !currentUser) ionRouter.push("/login", "root", "replace");
  }, [authLoading, currentUser, ionRouter]);

  const goHome = () => ionRouter.push("/app/home", "root", "replace");

  const handleStart = async () => {
    if (isLoading) return;
    setErrorMessage("");
    setIsLoading(true);
    try {
      const data = await startTwoFactorSetup();
      setQr(data.qr);
      setManualKey(data.manualKey);
      setStep("scan");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        await markTwoFactorEnabled(); // already enrolled (e.g. old stored session)
        goHome();
        return;
      }
      setErrorMessage(
        err instanceof NetworkError
          ? "No internet connection. Please check your network."
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isLoading) return;
    setErrorMessage("");
    if (code.length !== 6) {
      setErrorMessage("Enter the 6-digit code.");
      return;
    }
    setIsLoading(true);
    try {
      const data = await confirmTwoFactorSetup(code);
      setRecoveryCodes(data.recoveryCodes);
      setStep("recovery");
    } catch (err) {
      setCode("");
      if (err instanceof NetworkError) {
        setErrorMessage("No internet connection. Please check your network.");
      } else if (err instanceof ApiError && err.status === 400) {
        setErrorMessage("Incorrect code. Please try again.");
      } else if (err instanceof ApiError && err.status === 429) {
        setErrorMessage("Too many attempts. Please try again in a few minutes.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(recoveryCodes.join("\n"));
      setCopied(true);
    } catch {
      setErrorMessage("Couldn't copy. Please write the codes down instead.");
    }
  };

  const handleDone = async () => {
    await markTwoFactorEnabled();
    goHome();
  };

  return (
    <IonPage>
      <IonContent fullscreen className="login-content page-enter">
        <div className="login-container">
          {step === "intro" && (
            <div className="login-form">
              <h2 className="login-title">Set up two-factor authentication</h2>
              <p className="login-hint">
                To keep your account safe, we require a second step when you log in.
                You'll need an authenticator app such as Google Authenticator.
              </p>
              {errorMessage && <p className="login-error" role="alert">{errorMessage}</p>}
              <button className="login-btn" onClick={handleStart} disabled={isLoading}>
                {isLoading ? "PLEASE WAIT..." : "CONTINUE"}
              </button>
            </div>
          )}

          {step === "scan" && (
            <form className="login-form" onSubmit={handleConfirm} noValidate>
              <h2 className="login-title">Scan the QR code</h2>
              <p className="login-hint">
                Open your authenticator app, add an account, and scan this code.
              </p>
              <img className="setup-qr" src={qr} alt="QR code for your authenticator app" />
              <p className="login-hint">
                Can't scan? Enter this key manually:
                <br />
                <span className="setup-key">{manualKey}</span>
              </p>
              <input
                className="login-code-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
              {errorMessage && <p className="login-error" role="alert">{errorMessage}</p>}
              <button className="login-btn" type="submit" disabled={isLoading}>
                {isLoading ? "VERIFYING..." : "VERIFY"}
              </button>
            </form>
          )}

          {step === "recovery" && (
            <div className="login-form">
              <h2 className="login-title">Save your recovery codes</h2>
              <p className="login-hint">
                If you lose your phone, these codes are the only way back in. Each works
                once. We won't show them again.
              </p>
              <div className="recovery-grid">
                {recoveryCodes.map((c) => (
                  <span key={c} className="recovery-code">{c}</span>
                ))}
              </div>
              <button type="button" className="login-link-button setup-copy" onClick={handleCopy}>
                {copied ? "Copied" : "Copy all codes"}
              </button>
              <label className="setup-check">
                <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
                <span>I've saved these codes somewhere safe</span>
              </label>
              {errorMessage && <p className="login-error" role="alert">{errorMessage}</p>}
              <button className="login-btn" onClick={handleDone} disabled={!saved}>
                DONE
              </button>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TwoFactorSetupPage;