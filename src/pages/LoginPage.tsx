// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import SuspendedAccountModal from '../components/SuspendedAccountModal';
import './LoginPage.css';

const SUSPENDED_TEST_EMAIL = 'suspended@test.com';

const LoginPage: React.FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSuspendedModal, setShowSuspendedModal] = useState(false);

  const handleLogin = () => {
    if (email === SUSPENDED_TEST_EMAIL) {
      setShowSuspendedModal(true);
      return;
    }
    history.push('/app/home');
  };

  return (
    <IonPage>
      <IonContent fullscreen className="login-content">
        <div className="login-container">
          <div className="login-logo-wrapper">
            <div className="login-logo-bag">🛍️</div>
            <h1 className="login-logo-text">
              <span className="login-logo-shopee">Shopee</span>
            </h1>
          </div>

          <div className="login-form">
            <input
              className="login-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="login-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="login-btn" onClick={handleLogin}>
              LOG IN
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
            Don't have an account? <a href="#" className="login-link-bold">Sign Up</a>
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