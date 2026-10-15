// src/pages/Home.tsx
import { useEffect, useState } from 'react';
import { IonPage, IonContent, IonIcon, IonBadge, IonSkeletonText } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import {
  searchOutline, cameraOutline, chatbubblesOutline, cartOutline,
  addOutline, walletOutline, calendarOutline, giftOutline, playOutline,
} from 'ionicons/icons';
import { useCart, Product } from '../context/CartContext';
import './Home.css';

const API_URL = import.meta.env.VITE_API_URL;

interface ProductRow {
  id: number | string;
  name: string;
  price: string | number; // Postgres numeric arrives as a string
  image?: string | null;
  image_url?: string | null;
  shop?: string | null;
  variant?: string | null;
}

const toProduct = (r: ProductRow): Product => ({
  id: String(r.id),
  name: r.name,
  price: Number(r.price),
  image: r.image ?? r.image_url ?? 'https://placehold.co/200x200?text=No+Image',
  shop: r.shop ?? undefined,
  variant: r.variant ?? undefined,
});

const MOCK_LIVE = [
  { id: 'l1', title: 'Glow Skincare Live Deals', src: '/images/videos/live1.mp4' },
  { id: 'l2', title: '99 Deals Makeup Sale', src: '/images/videos/live2.mp4' },
];

const MOCK_VIDEOS = [
  { id: 'v1', views: '175.1K', src: '/images/videos/vid1.mp4' },
  { id: 'v2', views: '1.6K', src: '/images/videos/vid2.mp4' },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart, totalItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    fetch(`${API_URL}/api/products`)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((rows: ProductRow[]) => {
        if (cancelled) return;
        setProducts(shuffle(rows.map(toProduct)));
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <IonPage>
      <IonContent fullscreen className="home-content page-enter">
        {/* Sticky header */}
        <header className="home-header">
          <div className="home-search-bar" onClick={() => navigate('/search')}>
            <IonIcon icon={searchOutline} className="home-search-icon" />
            <span className="home-search-placeholder">Search products</span>
            <IonIcon icon={cameraOutline} className="home-camera-icon" />
          </div>
          <button className="home-icon-btn" onClick={() => navigate('/app/cart')} aria-label="Cart">
            <IonIcon icon={cartOutline} />
            {totalItems > 0 && <span className="home-cart-badge">{totalItems}</span>}
          </button>
          <button className="home-icon-btn" aria-label="Messages">
            <IonIcon icon={chatbubblesOutline} />
          </button>
        </header>

        {/* Promo banner */}
        <section className="home-banner">
          <div>
            <p className="home-banner-eyebrow">New here?</p>
            <h2 className="home-banner-title">Free shipping on your first order</h2>
          </div>
          <IonIcon icon={giftOutline} className="home-banner-icon" />
        </section>

        {/* Quick actions */}
        <section className="home-quick">
          <div className="quick-tile">
            <span className="quick-icon quick-icon-primary"><IonIcon icon={walletOutline} /></span>
            <p className="quick-title">VyPay</p>
            <p className="quick-sub">Free transfers</p>
          </div>
          <div className="quick-tile">
            <span className="quick-icon quick-icon-accent"><IonIcon icon={calendarOutline} /></span>
            <p className="quick-title">Check-in</p>
            <p className="quick-sub">Daily rewards</p>
          </div>
          <div className="quick-tile">
            <span className="quick-icon quick-icon-dark"><IonIcon icon={giftOutline} /></span>
            <p className="quick-title">VyRewards</p>
            <p className="quick-sub">Up to ₱1,350</p>
          </div>
        </section>

        {/* Products */}
        <section className="home-section">
          <h3 className="section-title">Just for you</h3>

          {status === 'loading' && (
            <div className="product-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div className="product-card" key={i}>
                  <IonSkeletonText animated style={{ width: '100%', aspectRatio: '1', margin: 0 }} />
                  <div className="product-info">
                    <IonSkeletonText animated style={{ width: '80%', height: '13px', margin: '0 0 8px' }} />
                    <IonSkeletonText animated style={{ width: '40%', height: '15px', margin: 0 }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {status === 'error' && (
            <div className="product-status" role="alert">
              <p>Couldn't load products. Please check your connection.</p>
              <button className="add-to-cart-btn product-retry" onClick={() => setReloadKey((k) => k + 1)}>
                Try Again
              </button>
            </div>
          )}

          {status === 'ready' && (
            <div className="product-grid">
              {products.map((product) => (
                <div className="product-card" key={product.id}>
                  <img src={product.image} alt={product.name} className="product-image" />
                  <div className="product-info">
                    <p className="product-name">{product.name}</p>
                    <div className="product-bottom">
                      <p className="product-price">₱{product.price.toFixed(2)}</p>
                      <button
                        className="product-add"
                        onClick={() => addToCart(product)}
                        aria-label={`Add ${product.name} to cart`}
                      >
                        <IonIcon icon={addOutline} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </IonContent>
    </IonPage>
  );
};

export default Home;