// src/pages/Home.tsx
import { IonPage, IonContent, IonIcon, IonBadge } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { searchOutline, cameraOutline, chatbubblesOutline, cartOutline } from 'ionicons/icons';
import { useCart, Product } from '../context/CartContext';
import { MOCK_PRODUCTS } from '../data/products';
import './Home.css';

const MOCK_LIVE = [
  { id: 'l1', title: 'Glow Skincare Live Deals', thumb: 'https://placehold.co/200x260?text=LIVE' },
  { id: 'l2', title: '99 Deals Makeup Sale', thumb: 'https://placehold.co/200x260?text=LIVE' },
];

const MOCK_VIDEOS = [
  { id: 'v1', views: '175.1K', thumb: 'https://placehold.co/200x260?text=Video' },
  { id: 'v2', views: '1.6K', thumb: 'https://placehold.co/200x260?text=Video' },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart, totalItems } = useCart();

  return (
    <IonPage>
      <IonContent fullscreen className="home-content">
        {/* Top orange header with search bar */}
        <div className="home-header">
          <div className="home-search-bar" onClick={() => navigate('/search')}>
            <IonIcon icon={searchOutline} className="home-search-icon" />
            <span className="home-search-placeholder">Search products</span>
            <IonIcon icon={cameraOutline} className="home-camera-icon" />
          </div>
          <div className="home-cart-icon" onClick={() => navigate('/app/cart')}>
            <IonIcon icon={cartOutline} />
            {totalItems > 0 && <IonBadge color="light" className="home-cart-badge">{totalItems}</IonBadge>}
          </div>
          <IonIcon icon={chatbubblesOutline} className="home-chat-icon" />
        </div>

        {/* Promo strip */}
        <div className="home-promo-strip">
          <div className="promo-item">
            <div className="promo-icon promo-icon-orange">S</div>
            <div>
              <p className="promo-title">ShopeePay</p>
              <p className="promo-sub">Unlimited free transfers</p>
            </div>
          </div>
          <div className="promo-item">
            <div className="promo-icon promo-icon-yellow">C</div>
            <div>
              <p className="promo-title">Check-in</p>
              <p className="promo-sub">Bigger wins daily!</p>
            </div>
          </div>
          <div className="promo-item">
            <div className="promo-icon promo-icon-blue">M</div>
            <div>
              <p className="promo-title">MariBank</p>
              <p className="promo-sub">Get up to ₱1,350</p>
            </div>
          </div>
        </div>

        {/* Shopee Live / Video */}
        <div className="home-live-video-row">
          <div className="live-video-col">
            <p className="section-title">SHOPEE LIVE</p>
            <div className="live-video-cards">
              {MOCK_LIVE.map((l) => (
                <div className="live-card" key={l.id}>
                  <img src={l.thumb} alt={l.title} />
                  <span className="live-badge">LIVE</span>
                  <p className="live-caption">{l.title}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="live-video-col">
            <p className="section-title">SHOPEE VIDEO</p>
            <div className="live-video-cards">
              {MOCK_VIDEOS.map((v) => (
                <div className="live-card" key={v.id}>
                  <img src={v.thumb} alt="video" />
                  <span className="video-views">▶ {v.views}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product grid */}
        <div className="product-grid">
          {MOCK_PRODUCTS.map((product) => (
            <div className="product-card" key={product.id}>
              <img src={product.image} alt={product.name} className="product-image" />
              <div className="product-info">
                <p className="product-name">{product.name}</p>
                <p className="product-price">₱{product.price.toFixed(2)}</p>
                <button className="add-to-cart-btn" onClick={() => addToCart(product)}>
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;