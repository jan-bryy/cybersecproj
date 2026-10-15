// src/pages/CheckoutPage.tsx
import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import {
  arrowBackOutline,
  checkmarkCircle,
  checkmark,
  cashOutline,
  cardOutline,
  walletOutline,
  businessOutline,
  carOutline,
} from 'ionicons/icons';
import { useCart } from '../context/CartContext';
import { placeOrder, isCheckoutRejected, PaymentMethod } from '../api/orders';
import { ApiError, NetworkError } from '../api/client';
import CheckoutRejectedModal from '../components/CheckoutRejectedModal';
import './CheckoutPage.css';

const SHIPPING_FEE = 32;
const peso = (n: number) => `₱${n.toLocaleString('en-PH')}`;

// 4242424242424242 -> "4242 4242 4242 4242"
const formatCard = (raw: string) =>
  raw.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim();

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState('');
  const [placed, setPlaced] = useState<{
    orderId: number;
    total: number;
    method: PaymentMethod;
  } | null>(null);
  const location = useLocation();
  const { items: cartItems, removeFromCart, clearCart } = useCart();
  const ids = (location.state as { ids?: string[] } | null)?.ids;
  const items = ids ? cartItems.filter((i) => ids.includes(i.id)) : cartItems;
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const [showRejected, setShowRejected] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [cardNumber, setCardNumber] = useState('');

  if (!placed && items.length === 0) {
    return <Navigate to="/app/cart" replace />;
  }

  const handlePlaceOrder = async () => {
    if (isPlacing) return;
    setError('');

    const digits = cardNumber.replace(/\s/g, '');
    if (paymentMethod === 'card' && !/^\d{13,19}$/.test(digits)) {
      setError('Please enter a valid card number.');
      return;
    }

    setIsPlacing(true);

    try {
      const data = await placeOrder(
        items,
        paymentMethod,
        paymentMethod === 'card' ? digits : undefined,
      );
      setPlaced({ orderId: data.orderId, total: data.total, method: paymentMethod });
      setCardNumber('');
      if (ids) ids.forEach(removeFromCart);
      else clearCart();
    } catch (err) {
      if (err instanceof NetworkError) {
        setError('No internet connection. Please check your network.');
      } else if (err instanceof ApiError && err.status === 401) {
        // SessionWatcher has already logged the user out and cleared the cart
        navigate('/login', { replace: true });
      } else if (isCheckoutRejected(err)) {
        // M04: the server flagged this checkout as unusual activity
        setShowRejected(true);
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
        <IonContent fullscreen className="checkout-content page-enter">
          <div className="checkout-success">
            <span className="checkout-success-circle">
              <IonIcon icon={checkmarkCircle} className="checkout-success-icon" />
            </span>
            <h2>Order placed!</h2>
            <p className="checkout-success-sub">Thanks for shopping with VyShop.</p>

            <div className="checkout-success-card">
              <div className="checkout-row">
                <span>Order number</span>
                <strong>#{placed.orderId}</strong>
              </div>
              <div className="checkout-row">
                <span>{placed.method === 'card' ? 'Paid by card' : 'Pay on delivery'}</span>
                <strong>{peso(placed.total)}</strong>
              </div>
            </div>

            <button
              className="checkout-place-btn checkout-success-btn"
              onClick={() => navigate('/app/home', { replace: true })}
            >
              Continue shopping
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const total = totalPrice + SHIPPING_FEE;
  return (
    <IonPage>
      <IonContent fullscreen className="checkout-content page-enter">
        <header className="checkout-header">
          <button className="checkout-back-btn" onClick={() => navigate(-1)} aria-label="Back">
            <IonIcon icon={arrowBackOutline} />
          </button>
          <span className="checkout-title">Checkout</span>
        </header>

        {/* Order summary */}
        <div className="checkout-card">
          <p className="checkout-label">Order summary</p>
          {items.map((item) => (
            <div className="checkout-item" key={item.id}>
              <img src={item.image} alt={item.name} className="checkout-item-img" />
              <div className="checkout-item-info">
                <p className="checkout-item-name">{item.name}</p>
                <p className="checkout-item-price">{peso(item.price)}</p>
              </div>
              <span className="checkout-item-qty">×{item.quantity}</span>
            </div>
          ))}

          <div className="checkout-shipping">
            <p className="checkout-label">Shipping option</p>
            <div className="checkout-shipping-option">
              <span className="checkout-pay-icon"><IonIcon icon={carOutline} /></span>
              <div className="checkout-shipping-text">
                <strong>Standard Local</strong>
                <p>Arrives in 3-7 days</p>
              </div>
              <span className="checkout-shipping-fee">{peso(SHIPPING_FEE)}</span>
            </div>
          </div>

          <div className="checkout-row checkout-row-total">
            <span>Total {totalItems} item(s)</span>
            <strong>{peso(total)}</strong>
          </div>
        </div>

        {/* Payment methods */}
        <div className="checkout-card">
          <p className="checkout-label">Payment method</p>

          <div
            className="checkout-pay-row checkout-pay-option"
            role="radio"
            aria-checked={paymentMethod === 'cod'}
            tabIndex={0}
            onClick={() => setPaymentMethod('cod')}
          >
            <span className="checkout-pay-icon"><IonIcon icon={cashOutline} /></span>
            <span className="checkout-pay-name">Cash on Delivery</span>
            <span className={paymentMethod === 'cod' ? 'checkout-check' : 'checkout-radio'}>
              {paymentMethod === 'cod' && <IonIcon icon={checkmark} />}
            </span>
          </div>

          <div
            className="checkout-pay-row checkout-pay-option"
            role="radio"
            aria-checked={paymentMethod === 'card'}
            tabIndex={0}
            onClick={() => setPaymentMethod('card')}
          >
            <span className="checkout-pay-icon"><IonIcon icon={cardOutline} /></span>
            <span className="checkout-pay-name">Credit / Debit Card</span>
            <span className={paymentMethod === 'card' ? 'checkout-check' : 'checkout-radio'}>
              {paymentMethod === 'card' && <IonIcon icon={checkmark} />}
            </span>
          </div>

          {paymentMethod === 'card' && (
            <div className="checkout-card-field">
              <input
                className="checkout-card-input"
                type="text"
                inputMode="numeric"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCard(e.target.value))}
                placeholder="Card number"
                aria-label="Card number"
                autoComplete="off"
                spellCheck={false}
                disabled={isPlacing}
              />
              {/* Demo hint: remove before submitting */}
              <p className="checkout-card-hint">Demo: 4000 0000 0000 0259 gets flagged</p>
            </div>
          )}

          <div className="checkout-pay-row checkout-pay-disabled">
            <span className="checkout-pay-icon"><IonIcon icon={walletOutline} /></span>
            <span className="checkout-pay-name">VyPay / VyLater</span>
            <span className="checkout-activate">Activate</span>
          </div>
          <div className="checkout-pay-row checkout-pay-disabled">
            <span className="checkout-pay-icon"><IonIcon icon={businessOutline} /></span>
            <span className="checkout-pay-name">VyBank Savings</span>
            <span className="checkout-activate">Activate</span>
          </div>
        </div>

        {/* Payment details */}
        <div className="checkout-card">
          <p className="checkout-label">Payment details</p>
          <div className="checkout-row">
            <span>Merchandise subtotal</span>
            <span>{peso(totalPrice)}</span>
          </div>
          <div className="checkout-row">
            <span>Shipping subtotal</span>
            <span>{peso(SHIPPING_FEE)}</span>
          </div>
          <div className="checkout-row checkout-row-total">
            <span>Total payment</span>
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
            <span>Total</span>
            <strong>{peso(total)}</strong>
          </div>
          <button className="checkout-place-btn" onClick={handlePlaceOrder} disabled={isPlacing}>
            {isPlacing ? 'Placing...' : 'Place order'}
          </button>
        </div>
      </div>

      <CheckoutRejectedModal
        isOpen={showRejected}
        onClose={() => setShowRejected(false)}
      />
    </IonPage>
  );
};

export default CheckoutPage;