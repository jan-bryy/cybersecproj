// src/pages/SearchPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { arrowBackOutline, searchOutline } from 'ionicons/icons';
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
      <IonContent fullscreen className="search-content">
        <div className="search-header">
          <IonIcon icon={arrowBackOutline} className="search-back-icon" onClick={() => navigate(-1)} />
          <input
            type="text"
            className="search-input"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <IonIcon icon={searchOutline} className="search-go-icon" />
        </div>

        <div className="search-suggestions">
          <p className="search-suggestions-title">
            {term ? `Results for "${query.trim()}"` : 'Search Suggestions'}
          </p>

          {status === 'loading' && <p className="search-status">Loading products...</p>}

          {status === 'error' && (
            <div className="search-status" role="alert">
              <p>Couldn't load products. Please check your connection.</p>
              <button className="search-retry" onClick={() => setReloadKey((k) => k + 1)}>
                Try Again
              </button>
            </div>
          )}

          {status === 'ready' && visible.length === 0 && (
            <p className="search-status">No products found.</p>
          )}

          {status === 'ready' && visible.length > 0 && (
            <div className="search-suggestions-grid">
              {visible.map((product) => (
                <div className="suggestion-card" key={product.id} onClick={() => addToCart(product)}>
                  <img src={product.image} alt={product.name} />
                  <p className="suggestion-name">{product.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SearchPage;