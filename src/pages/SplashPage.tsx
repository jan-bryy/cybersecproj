// src/pages/SplashPage.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { useAuth } from '../context/AuthContext';
import './SplashPage.css';

const SPLASH_DURATION = 2000; // ms

const SplashPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return; // wait until the localStorage check finishes

    const timer = setTimeout(() => {
      if (currentUser) {
        navigate('/app/home', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, [navigate, currentUser, isLoading]);

  return (
    <IonPage>
      <IonContent fullscreen className="splash-content">
        <div className="splash-container">
          <div className="splash-logo-wrapper">
            <img src="/shopeeicon.png" alt="Shopee" className="splash-logo-img" />
          </div>
          <div className="splash-loader">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SplashPage;