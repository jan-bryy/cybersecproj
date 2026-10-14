import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IonPage, IonContent, IonIcon, useIonViewWillEnter } from "@ionic/react";
import { arrowBackOutline } from "ionicons/icons";
import { ApiError, NetworkError } from "../api/client";
import { getTwoFactorStatus, regenerateRecoveryCodes } from "../api/twofa";
import "./LoginPage.css";
import "./SettingsPage.css";
import "./TwoFactorSetupPage.css";

type View = "overview" | "confirm" | "codes";

const AccountSecurityPage: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("overview");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [code, setCode] = useState("");
  const [newCodes, setNewCodes] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Reload every time the page is entered
  useIonViewWillEnter(() => {
    setView("overview");
    setCode("");
    setNewCodes([]);
    setSaved(false);
    setCopied(false);
    setErrorMessage("");
    getTwoFactorStatus()
      .then((res) => setRemaining(res.recoveryRemaining))
      .catch((err) => {
        // 401: SessionWatcher already handles the logout
        if (!(err instanceof ApiError && err.status === 401)) {
          setErrorMessage("Couldn't load your security settings.");
        }
      });
  });

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isLoading) return;
    setErrorMessage("");
    if (code.length !== 6) {
      setErrorMessage("Enter the 6-digit code.");
      return;
    }
    setIsLoading(true);
    try {
      const data = await regenerateRecoveryCodes(code);
      setNewCodes(data.recoveryCodes);
      setRemaining(data.recoveryCodes.length);
      setSaved(false);
      setCopied(false);
      setView("codes");
    } catch (err) {
      setCode("");
      if (err instanceof NetworkError) {
        setErrorMessage("No internet connection. Please check your network.");
      } else if (err instanceof ApiError && err.status === 400) {
        setErrorMessage("Incorrect code. If you just logged in, wait for the code to change and try again.");
      } else if (err instanceof ApiError && err.status === 429) {
        setErrorMessage("Too many attempts. Please try again in a few minutes.");
      } else if (!(err instanceof ApiError && err.status === 401)) {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(newCodes.join("\n"));
      setCopied(true);
    } catch {
      setErrorMessage("Couldn't copy. Please write the codes down instead.");
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="settings-content">
        <div className="settings-header">
          {view !== "codes" && (
            <IonIcon
              icon={arrowBackOutline}
              className="settings-back-icon"
              onClick={() => (view === "confirm" ? setView("overview") : navigate(-1))}
            />
          )}
          <span className="settings-title">Account Security</span>
        </div>

        {view === "overview" && (
          <div className="settings-section">
            <div className="settings-row">
              <div className="settings-row-text">
                <span>Two-factor authentication</span>
                <span className="settings-row-sub">On. Required for your account.</span>
              </div>
            </div>
            <div
              className="settings-row"
              onClick={() => {
                setErrorMessage("");
                setCode("");
                setView("confirm");
              }}
            >
              <div className="settings-row-text">
                <span>Recovery codes</span>
                <span className="settings-row-sub">
                  {remaining === null
                    ? "Loading..."
                    : `${remaining} unused. Tap to generate new ones.`}
                </span>
              </div>
            </div>
            {errorMessage && <p className="settings-row-error" role="alert">{errorMessage}</p>}
          </div>
        )}

        {view === "confirm" && (
          <form className="login-form" style={{ padding: 24 }} onSubmit={handleGenerate} noValidate>
            <h2 className="login-title">Generate new recovery codes</h2>
            <p className="login-hint">
              Enter the 6-digit code from your authenticator app. Your old recovery codes will
              stop working.
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
              autoFocus
            />
            {errorMessage && <p className="login-error" role="alert">{errorMessage}</p>}
            <button className="login-btn" type="submit" disabled={isLoading}>
              {isLoading ? "PLEASE WAIT..." : "GENERATE"}
            </button>
          </form>
        )}

        {view === "codes" && (
          <div className="login-form" style={{ padding: 24 }}>
            <h2 className="login-title">Save your new recovery codes</h2>
            <p className="login-hint">
              Each code works once. The old ones no longer work, and we won't show these again.
            </p>
            <div className="recovery-grid">
              {newCodes.map((c) => (
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
            <button className="login-btn" onClick={() => setView("overview")} disabled={!saved}>
              DONE
            </button>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AccountSecurityPage;