// src/pages/SearchPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage, IonContent, IonIcon, IonSkeletonText } from '@ionic/react';
import { arrowBackOutline, searchOutline, closeCircle, addOutline } from 'ionicons/icons';
import { Product, useCart } from '../context/CartContext';
import { fetchProducts } from '../api/products';
import './SearchPage.css';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    fetchProducts()
      .then((list) => {
        if (cancelled) return;
        setProducts(list);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const term = query.trim().toLowerCase();
  const visible = term
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.shop ?? '').toLowerCase().includes(term)
      )
    : products;

  return (
    <IonPage>
      <IonContent fullscreen className="search-content page-enter">
        <header className="search-header">
          <button className="search-back-btn" onClick={() => navigate(-1)} aria-label="Back">
            <IonIcon icon={arrowBackOutline} />
          </button>
          <div className="search-field">
            <IonIcon icon={searchOutline} className="search-field-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search products"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button className="search-clear" onClick={() => setQuery('')} aria-label="Clear search">
                <IonIcon icon={closeCircle} />
              </button>
            )}
          </div>
        </header>

        <section className="search-results">
          <div className="search-results-head">
            <h3 className="search-results-title">
              {term ? `Results for "${query.trim()}"` : 'Browse all'}
            </h3>
            {status === 'ready' && (
              <span className="search-results-count">{visible.length} items</span>
            )}
          </div>

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
            <div className="search-status" role="alert">
              <p>Couldn't load products. Please check your connection.</p>
              <button className="search-retry" onClick={() => setReloadKey((k) => k + 1)}>
                Try Again
              </button>
            </div>
          )}

          {status === 'ready' && visible.length === 0 && (
            <div className="search-empty">
              <span className="search-empty-icon"><IonIcon icon={searchOutline} /></span>
              <p className="search-empty-title">No products found</p>
              <p className="search-empty-sub">Try a different keyword or check the spelling.</p>
            </div>
          )}

          {status === 'ready' && visible.length > 0 && (
            <div className="product-grid">
              {visible.map((product) => (
                <div className="product-card" key={product.id}>
                  <div className="product-image-wrap">
                    <img src={product.image} alt={product.name} className="product-image" />
                    <button
                      className="product-add"
                      onClick={() => addToCart(product)}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <IonIcon icon={addOutline} />
                    </button>
                  </div>
                  <div className="product-info">
                    <p className="product-name">{product.name}</p>
                    <p className="product-price">₱{product.price.toFixed(2)}</p>
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

export default SearchPage;