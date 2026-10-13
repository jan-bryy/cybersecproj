// src/pages/Home.tsx
import { useEffect, useState } from 'react';
import { IonPage, IonContent, IonIcon, IonBadge, IonSkeletonText } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { searchOutline, cameraOutline, chatbubblesOutline, cartOutline } from 'ionicons/icons';
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
                  <video
                    src={l.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    style={{ width: '100%', aspectRatio: '3 / 4', objectFit: 'cover', display: 'block' }}
                  />
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
                  <video
                    src={v.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    style={{ width: '100%', aspectRatio: '3 / 4', objectFit: 'cover', display: 'block' }}
                  />
                  <span className="video-views">▶ {v.views}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product grid */}
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
                  <p className="product-price">₱{product.price.toFixed(2)}</p>
                  <button className="add-to-cart-btn" onClick={() => addToCart(product)}>
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;