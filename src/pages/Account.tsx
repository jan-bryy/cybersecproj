// src/pages/Account.tsx
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import {
  personCircleOutline,
  settingsOutline,
  cartOutline,
  chatbubblesOutline,
  chevronForwardOutline,
  walletOutline,
  cubeOutline,
  carOutline,
  starOutline,
  phonePortraitOutline,
} from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Account.css';

const Account: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { totalItems } = useCart();

  return (
    <IonPage>
      <IonContent fullscreen className="account-content">
        {/* Header */}
        <div className="account-header">
          <div className="account-header-top">
            <IonIcon icon={personCircleOutline} className="account-avatar" />
            <div className="account-user-info">
              <div className="account-name-row">
                <span className="account-name">{currentUser?.name ?? 'Guest'}</span>
                <span className="account-tier-badge">Silver <IonIcon icon={chevronForwardOutline} /></span>
              </div>
              <div className="account-follow-row">
                <span>1 Following</span>
                <span>0 Followers</span>
              </div>
            </div>
            <IonIcon icon={settingsOutline} className="account-header-icon" onClick={() => navigate('/settings')} />
            <div className="account-cart-icon" onClick={() => navigate('/app/cart')}>
              <IonIcon icon={cartOutline} className="account-header-icon" />
              {totalItems > 0 && <span className="account-cart-badge">{totalItems}</span>}
            </div>
            <IonIcon icon={chatbubblesOutline} className="account-header-icon" />
          </div>
          <div className="account-vip-banner">
            <span className="account-vip-badge">VIP+</span>
            <span className="account-vip-text">Get Extra 20% Off Every Day</span>
            <IonIcon icon={chevronForwardOutline} />
          </div>
        </div>

        {/* My Purchases */}
        <div className="account-section">
          <div className="account-section-header">
            <span className="account-section-title">My Purchases</span>
            <span className="account-section-link">View Purchase History <IonIcon icon={chevronForwardOutline} /></span>
          </div>
          <div className="account-purchases-row">
            <div className="account-purchase-item">
              <IonIcon icon={walletOutline} />
              <span>To Pay</span>
            </div>
            <div className="account-purchase-item">
              <IonIcon icon={cubeOutline} />
              <span>To Ship</span>
            </div>
            <div className="account-purchase-item">
              <IonIcon icon={carOutline} />
              <span>To Receive</span>
            </div>
            <div className="account-purchase-item">
              <IonIcon icon={starOutline} />
              <span>To Rate</span>
            </div>
          </div>
          <div className="account-divider" />
          <div className="account-load-row">
            <div className="account-load-label">
              <IonIcon icon={phonePortraitOutline} />
              <span>Load, Bills & Travel</span>
            </div>
            <span className="account-load-deal">₱1 Data Deals <IonIcon icon={chevronForwardOutline} /></span>
          </div>
        </div>

        {/* Explore More */}
        <div className="account-section">
          <span className="account-section-title">Explore More</span>
          <div className="account-explore-grid">
            <div className="account-explore-item">
              <div className="account-explore-icon account-explore-vip">VIP+</div>
              <span className="account-explore-label">ShopeeVIP+</span>
              <span className="account-explore-sub">Become a member</span>
            </div>
            <div className="account-explore-item">
              <div className="account-explore-icon account-explore-orange">AC</div>
              <span className="account-explore-label">Exclusive perks!</span>
              <span className="account-explore-sub">Create your profile now</span>
            </div>
            <div className="account-explore-item">
              <div className="account-explore-icon account-explore-orange">🎁</div>
              <span className="account-explore-label">Refer For Rewards</span>
              <span className="account-explore-sub">Up to 500 coins</span>
            </div>
            <div className="account-explore-item">
              <div className="account-explore-icon account-explore-red">▶</div>
              <span className="account-explore-label">FREE Dramas</span>
              <span className="account-explore-sub">Watch 5 Mins! Up to 200 Coins Daily!</span>
            </div>
          </div>
        </div>

        {/* My Wallet */}
        <div className="account-section">
          <span className="account-section-title">My Wallet</span>
          <div className="account-wallet-grid">
            <div className="account-wallet-item">
              <div className="account-wallet-icon">S</div>
              <span>ShopeePay</span>
              <button className="account-wallet-btn">Activate</button>
            </div>
            <div className="account-wallet-item">
              <div className="account-wallet-icon">S</div>
              <span>Coins</span>
              <span className="account-wallet-cta">Check in now!</span>
            </div>
            <div className="account-wallet-item">
              <div className="account-wallet-icon">🎫</div>
              <span>Vouchers</span>
              <span className="account-wallet-cta">50+ Vouchers</span>
            </div>
            <div className="account-wallet-item">
              <div className="account-wallet-icon">M</div>
              <span>MariBank</span>
              <span className="account-wallet-cta">Download App</span>
            </div>
          </div>
        </div>

        {/* Financial Services */}
        <div className="account-section">
          <div className="account-section-header">
            <span className="account-section-title">Financial Services</span>
            <span className="account-section-link">See More <IonIcon icon={chevronForwardOutline} /></span>
          </div>
          <div className="account-financial-grid">
            <div className="account-financial-card">
              <span className="account-financial-icon">💳</span>
              <div>
                <p className="account-financial-title">SPayLater</p>
                <p className="account-financial-sub">Credit up to ₱50,000</p>
              </div>
            </div>
            <div className="account-financial-card">
              <span className="account-financial-icon">M</span>
              <div>
                <p className="account-financial-title">MariBank</p>
                <p className="account-financial-sub">Get up to ₱1,350 in rewards</p>
              </div>
            </div>
            <div className="account-financial-card account-financial-card-wide">
              <span className="account-financial-icon">🛡️</span>
              <div>
                <p className="account-financial-title">Insurance</p>
                <p className="account-financial-sub">20% savings, pay with ShopeePay/MariBank</p>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Account;