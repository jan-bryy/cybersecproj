import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonIcon, IonBadge } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { cartOutline } from 'ionicons/icons';
import { useCart, Product } from '../context/CartContext';
import './Home.css';

const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Wireless Earbuds', price: 599, image: 'https://placehold.co/200x200?text=Earbuds' },
  { id: 'p2', name: 'Phone Case', price: 149, image: 'https://placehold.co/200x200?text=Case' },
  { id: 'p3', name: 'USB-C Cable 2m', price: 99, image: 'https://placehold.co/200x200?text=Cable' },
  { id: 'p4', name: 'Power Bank 10000mAh', price: 799, image: 'https://placehold.co/200x200?text=PowerBank' },
  { id: 'p5', name: 'Bluetooth Speaker', price: 1299, image: 'https://placehold.co/200x200?text=Speaker' },
  { id: 'p6', name: 'Laptop Stand', price: 449, image: 'https://placehold.co/200x200?text=Stand' },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart, totalItems } = useCart();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Shopee</IonTitle>
          <div className="home-cart-icon" onClick={() => navigate('/app/cart')}>
            <IonIcon icon={cartOutline} />
            {totalItems > 0 && <IonBadge color="danger" className="home-cart-badge">{totalItems}</IonBadge>}
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="home-content">
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