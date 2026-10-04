// src/pages/CheckoutPage.tsx
import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { arrowBackOutline, checkmarkCircle } from 'ionicons/icons';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../api/orders';
import { ApiError, NetworkError } from '../api/client';
import './CheckoutPage.css';

const SHIPPING_FEE = 32;
const peso = (n: number) => `₱${n.toLocaleString('en-PH')}`;

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState('');
  const [placed, setPlaced] = useState<{ orderId: number; total: number } | null>(null);
  const location = useLocation();
  const { items: cartItems, removeFromCart, clearCart } = useCart();
  const ids = (location.state as { ids?: string[] } | null)?.ids;
  const items = ids ? cartItems.filter((i) => ids.includes(i.id)) : cartItems;
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (!placed && items.length === 0) {
    return <Navigate to="/app/cart" replace />;
  }

  const handlePlaceOrder = async () => {
    if (isPlacing) return;
    setError('');
    setIsPlacing(true);

    try {
      const data = await placeOrder(items);
      setPlaced({ orderId: data.orderId, total: data.total });
      if (ids) ids.forEach(removeFromCart);
      else clearCart();
    } catch (err) {
      if (err instanceof NetworkError) {
        setError('No internet connection. Please check your network.');
      } else if (err instanceof ApiError && err.status === 401) {
        // SessionWatcher has already logged the user out and cleared the cart
        navigate('/login', { replace: true });
      } else if (err instanceof ApiError && err.status === 400) {
        setError('Some items are no longer available. Please review your cart.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsPlacing(false);
    }
  };

  if (placed) {
    return (
      <IonPage>
        <IonContent fullscreen className="checkout-content">
          <div className="checkout-success">
            <IonIcon icon={checkmarkCircle} className="checkout-success-icon" />
            <h2>Order Placed!</h2>
            <p>Order #{placed.orderId}</p>
            <p>Pay {peso(placed.total)} on delivery.</p>
            <button
              className="checkout-place-btn"
              onClick={() => navigate('/app/home', { replace: true })}
            >
              Continue Shopping
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const total = totalPrice + SHIPPING_FEE;

  return (
    <IonPage>
      <IonContent fullscreen className="checkout-content">
        <div className="checkout-header">
          <IonIcon icon={arrowBackOutline} className="checkout-back" onClick={() => navigate(-1)} />
          <span className="checkout-title">Checkout</span>
        </div>

        <div className="checkout-card">
          {items.map((item) => (
            <div className="checkout-item" key={item.id}>
              <img src={item.image} alt={item.name} className="checkout-item-img" />
              <div className="checkout-item-info">
                <p className="checkout-item-name">{item.name}</p>
                <p className="checkout-item-price">{peso(item.price)}</p>
              </div>
              <span className="checkout-item-qty">x{item.quantity}</span>
            </div>
          ))}

          <div className="checkout-shipping">
            <p className="checkout-label">Shipping Option</p>
            <div className="checkout-shipping-option">
              <div>
                <strong>Standard Local</strong>
                <p>Arrives in 3-7 days</p>
              </div>
              <span>{peso(SHIPPING_FEE)}</span>
            </div>
          </div>

          <div className="checkout-row checkout-row-total">
            <span>Total {totalItems} Item(s)</span>
            <strong>{peso(total)}</strong>
          </div>
        </div>

        <div className="checkout-card">
          <p className="checkout-label">Payment Methods</p>
          <div className="checkout-pay-row">
            <span>Cash on Delivery</span>
            <span className="checkout-check">✓</span>
          </div>
          <div className="checkout-pay-row checkout-pay-disabled">
            <span>ShopeePay / SPayLater</span>
            <span className="checkout-activate">Activate</span>
          </div>
          <div className="checkout-pay-row checkout-pay-disabled">
            <span>MariBank Savings</span>
            <span className="checkout-activate">Activate</span>
          </div>
        </div>

        <div className="checkout-card">
          <p className="checkout-label">Payment Details</p>
          <div className="checkout-row">
            <span>Merchandise Subtotal</span>
            <span>{peso(totalPrice)}</span>
          </div>
          <div className="checkout-row">
            <span>Shipping Subtotal</span>
            <span>{peso(SHIPPING_FEE)}</span>
          </div>
          <div className="checkout-row checkout-row-total">
            <span>Total Payment</span>
            <strong>{peso(total)}</strong>
          </div>
        </div>

        <div className="checkout-spacer" />
      </IonContent>

      <div className="checkout-footer">
        {error && (
          <p className="checkout-error" role="alert">
            {error}
          </p>
        )}
        <div className="checkout-footer-row">
          <div className="checkout-footer-total">
            Total <strong>{peso(total)}</strong>
          </div>
          <button className="checkout-place-btn" onClick={handlePlaceOrder} disabled={isPlacing}>
            {isPlacing ? 'Placing...' : 'Place Order'}
          </button>
        </div>
      </div>
    </IonPage>
  );
};

export default CheckoutPage;