// src/pages/Account.tsx
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import {
  personCircleOutline, settingsOutline, cartOutline, chatbubblesOutline,
  chevronForwardOutline, walletOutline, cubeOutline, carOutline, starOutline,
  phonePortraitOutline, diamondOutline, personAddOutline, giftOutline,
  playCircleOutline, cashOutline, ticketOutline, businessOutline,
  cardOutline, shieldCheckmarkOutline,
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
      <IonContent fullscreen className="account-content page-enter">
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
            <button className="account-icon-btn" onClick={() => navigate('/settings')} aria-label="Settings">
              <IonIcon icon={settingsOutline} />
            </button>
            <button className="account-icon-btn" onClick={() => navigate('/app/cart')} aria-label="Cart">
              <IonIcon icon={cartOutline} />
              {totalItems > 0 && <span className="account-cart-badge">{totalItems}</span>}
            </button>
            <button className="account-icon-btn" aria-label="Messages">
              <IonIcon icon={chatbubblesOutline} />
            </button>
          </div>

          <div className="account-vip-banner">
            <span className="account-vip-badge">VyPlus</span>
            <span className="account-vip-text">Get extra 20% off every day</span>
            <IonIcon icon={chevronForwardOutline} />
          </div>
        </div>

        {/* My Purchases (overlaps the header) */}
        <div className="account-section account-section-overlap">
          <div className="account-section-header">
            <span className="account-section-title">My Purchases</span>
            <span className="account-section-link">History <IonIcon icon={chevronForwardOutline} /></span>
          </div>
          <div className="account-purchases-row">
            <div className="account-purchase-item">
              <span className="account-purchase-icon"><IonIcon icon={walletOutline} /></span>
              <span>To Pay</span>
            </div>
            <div className="account-purchase-item">
              <span className="account-purchase-icon"><IonIcon icon={cubeOutline} /></span>
              <span>To Ship</span>
            </div>
            <div className="account-purchase-item">
              <span className="account-purchase-icon"><IonIcon icon={carOutline} /></span>
              <span>To Receive</span>
            </div>
            <div className="account-purchase-item">
              <span className="account-purchase-icon"><IonIcon icon={starOutline} /></span>
              <span>To Rate</span>
            </div>
          </div>
          <div className="account-load-row">
            <div className="account-load-label">
              <IonIcon icon={phonePortraitOutline} />
              <span>Load, Bills &amp; Travel</span>
            </div>
            <span className="account-load-deal">₱1 Data Deals <IonIcon icon={chevronForwardOutline} /></span>
          </div>
        </div>

        {/* Explore More */}
        <div className="account-block">
          <h3 className="account-section-title account-block-title">Explore More</h3>
          <div className="account-rail">
            <div className="account-explore-item">
              <span className="account-explore-icon account-explore-primary"><IonIcon icon={diamondOutline} /></span>
              <span className="account-explore-label">VyPlus</span>
              <span className="account-explore-sub">Become a member</span>
            </div>
            <div className="account-explore-item">
              <span className="account-explore-icon account-explore-accent"><IonIcon icon={personAddOutline} /></span>
              <span className="account-explore-label">Exclusive perks</span>
              <span className="account-explore-sub">Create your profile</span>
            </div>
            <div className="account-explore-item">
              <span className="account-explore-icon account-explore-dark"><IonIcon icon={giftOutline} /></span>
              <span className="account-explore-label">Refer for rewards</span>
              <span className="account-explore-sub">Up to 500 coins</span>
            </div>
            <div className="account-explore-item">
              <span className="account-explore-icon account-explore-primary"><IonIcon icon={playCircleOutline} /></span>
              <span className="account-explore-label">Free videos</span>
              <span className="account-explore-sub">Earn coins daily</span>
            </div>
          </div>
        </div>

        {/* My Wallet */}
        <div className="account-block">
          <h3 className="account-section-title account-block-title">My Wallet</h3>
          <div className="account-wallet-grid">
            <div className="account-wallet-item">
              <span className="account-wallet-icon"><IonIcon icon={walletOutline} /></span>
              <div className="account-wallet-text">
                <span className="account-wallet-name">VyPay</span>
                <button className="account-wallet-btn">Activate</button>
              </div>
            </div>
            <div className="account-wallet-item">
              <span className="account-wallet-icon"><IonIcon icon={cashOutline} /></span>
              <div className="account-wallet-text">
                <span className="account-wallet-name">VyCoins</span>
                <span className="account-wallet-cta">Check in now</span>
              </div>
            </div>
            <div className="account-wallet-item">
              <span className="account-wallet-icon"><IonIcon icon={ticketOutline} /></span>
              <div className="account-wallet-text">
                <span className="account-wallet-name">Vouchers</span>
                <span className="account-wallet-cta">50+ available</span>
              </div>
            </div>
            <div className="account-wallet-item">
              <span className="account-wallet-icon"><IonIcon icon={businessOutline} /></span>
              <div className="account-wallet-text">
                <span className="account-wallet-name">VyBank</span>
                <span className="account-wallet-cta">Download app</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Services */}
        <div className="account-block">
          <div className="account-section-header account-block-title">
            <span className="account-section-title">Financial Services</span>
            <span className="account-section-link">See more <IonIcon icon={chevronForwardOutline} /></span>
          </div>
          <div className="account-financial-grid">
            <div className="account-financial-card">
              <span className="account-financial-icon"><IonIcon icon={cardOutline} /></span>
              <div>
                <p className="account-financial-title">VyLater</p>
                <p className="account-financial-sub">Credit up to ₱50,000</p>
              </div>
            </div>
            <div className="account-financial-card">
              <span className="account-financial-icon"><IonIcon icon={businessOutline} /></span>
              <div>
                <p className="account-financial-title">VyBank</p>
                <p className="account-financial-sub">Up to ₱1,350 in rewards</p>
              </div>
            </div>
            <div className="account-financial-card account-financial-card-wide">
              <span className="account-financial-icon"><IonIcon icon={shieldCheckmarkOutline} /></span>
              <div>
                <p className="account-financial-title">Insurance</p>
                <p className="account-financial-sub">20% savings when you pay with VyPay</p>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Account;