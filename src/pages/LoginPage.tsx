// src/pages/LoginPage.tsx
import { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonHeader,
  IonToolbar,
  IonTitle,
} from '@ionic/react';
import SuspendedAccountModal from '../components/SuspendedAccountModal';

// Hardcoded test account for demoing the suspended-account warning
const SUSPENDED_TEST_EMAIL = 'suspended@test.com';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSuspendedModal, setShowSuspendedModal] = useState(false);

  const handleLogin = () => {
    if (email === SUSPENDED_TEST_EMAIL) {
      setShowSuspendedModal(true);
      return;
    }
    // normal login logic goes here later
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Log In</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonInput
          label="Email"
          labelPlacement="floating"
          value={email}
          onIonChange={(e) => setEmail(e.detail.value ?? '')}
        />
        <IonInput
          label="Password"
          labelPlacement="floating"
          type="password"
          value={password}
          onIonChange={(e) => setPassword(e.detail.value ?? '')}
        />
        <IonButton expand="block" onClick={handleLogin}>
          Log In
        </IonButton>

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