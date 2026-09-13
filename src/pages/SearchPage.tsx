import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { arrowBackOutline, cameraOutline, micOutline, searchOutline } from 'ionicons/icons';
import { useCart, Product } from '../context/CartContext';
import { MOCK_PRODUCTS } from '../data/products';
import './SearchPage.css';

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
            {MOCK_PRODUCTS.map((product) => (
            <div className="suggestion-card" key={product.id} onClick={() => addToCart(product)}>
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