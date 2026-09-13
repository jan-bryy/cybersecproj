import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { arrowBackOutline, cameraOutline, micOutline, searchOutline } from 'ionicons/icons';
import { useCart, Product } from '../context/CartContext';
import './SearchPage.css';

const SUGGESTED_PRODUCTS: Product[] = [
  { id: 's1', name: 'Salt Spray For Hair', price: 249, image: 'https://placehold.co/200x200?text=Salt+Spray' },
  { id: 's2', name: 'Cardigan For Men', price: 399, image: 'https://placehold.co/200x200?text=Cardigan' },
  { id: 's3', name: 'Shaver For Men Rechargeable', price: 599, image: 'https://placehold.co/200x200?text=Shaver' },
  { id: 's4', name: 'Sleeping Mask For Women', price: 129, image: 'https://placehold.co/200x200?text=Sleep+Mask' },
  { id: 's5', name: 'Chinese Fan', price: 89, image: 'https://placehold.co/200x200?text=Fan' },
  { id: 's6', name: 'Wallet For Men', price: 349, image: 'https://placehold.co/200x200?text=Wallet' },
];

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [query, setQuery] = useState('');

  return (
    <IonPage>
      <IonContent fullscreen className="search-content">
        <div className="search-bar-row">
          <IonIcon icon={arrowBackOutline} className="search-back-icon" onClick={() => navigate(-1)} />
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Redmi Note 14 Case"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <div className="search-input-icons">
              <IonIcon icon={cameraOutline} />
              <IonIcon icon={micOutline} />
            </div>
          </div>
          <button className="search-go-btn">
            <IonIcon icon={searchOutline} />
          </button>
        </div>

        <div className="search-suggestions">
          <p className="search-suggestions-title">Search Suggestions</p>
          <div className="search-suggestions-grid">
            {SUGGESTED_PRODUCTS.map((product) => (
              <div
                className="suggestion-card"
                key={product.id}
                onClick={() => addToCart(product)}
              >
                <img src={product.image} alt={product.name} />
                <p className="suggestion-name">{product.name}</p>
              </div>
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SearchPage;