// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { personOutline, lockClosedOutline } from 'ionicons/icons';
import SuspendedAccountModal from '../components/SuspendedAccountModal';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSuspendedModal, setShowSuspendedModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setErrorMessage('');
    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);

    if (result === 'suspended') {
      setShowSuspendedModal(true);
      return;
    }

    if (result === 'invalid') {
      setErrorMessage('Incorrect email or password.');
      return;
    }

    if (result === 'error') {
      setErrorMessage('Something went wrong. Please try again.');
      return;
    }

    navigate('/app/home');
  };

  return (
    <IonPage>
      <IonContent fullscreen className="login-content">
        <div className="login-container">
          <div className="login-logo-wrapper">
            <div className="login-logo-bag">
                <img src="/shopeeicon.png" alt="Shopee" className="login-logo-img" />
            </div>
          </div>

          <div className="login-form">
            <div className="login-input-wrapper">
              <IonIcon icon={personOutline} className="login-input-icon" />
              <input
                className="login-input"
                type="email"
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
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {errorMessage && <p className="login-error">{errorMessage}</p>}

            <button className="login-btn" onClick={handleLogin} disabled={isLoading}>
              {isLoading ? 'LOGGING IN...' : 'LOG IN'}
            </button>

            <div className="login-links">
              <a href="#" className="login-link">Forgot Password?</a>
            </div>
          </div>

          <div className="login-divider">
            <span>or continue with</span>
          </div>

          <div className="login-social">
            <button className="social-btn facebook-btn">Facebook</button>
            <button className="social-btn google-btn">Google</button>
          </div>

          <div className="login-signup">
            Don't have an account?{' '}
            <span className="login-link-bold login-link-disabled">Sign Up</span>
          </div>
        </div>

        <SuspendedAccountModal
          isOpen={showSuspendedModal}
          onTryAgain={() => setShowSuspendedModal(false)}
          onContactSupport={() => console.log('navigate to support')}
          onViewDetails={() => console.log('navigate to details')}
        />
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;