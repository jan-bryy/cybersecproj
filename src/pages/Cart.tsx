// src/pages/Cart.tsx
import { useMemo, useState } from 'react';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import {
  arrowBackOutline,
  chevronForwardOutline,
  cartOutline,
  ticketOutline,
} from 'ionicons/icons';
import { CartItem, useCart } from '../context/CartContext';
import './Cart.css';

const peso = (n: number) => `₱${n.toLocaleString('en-PH')}`;

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart } = useCart();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editMode, setEditMode] = useState(false);

  // Group cart lines by shop
  const groups = useMemo(() => {
    const map = new Map<string, CartItem[]>();
    for (const item of items) {
      const shop = item.shop ?? 'Shopee';
      map.set(shop, [...(map.get(shop) ?? []), item]);
    }
    return [...map.entries()];
  }, [items]);

  const selectedItems = items.filter((i) => selected.has(i.id));
  const selectedCount = selectedItems.reduce((sum, i) => sum + i.quantity, 0);
  const selectedTotal = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const allSelected = items.length > 0 && selectedItems.length === items.length;

  const setMany = (ids: string[], on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });

  const deleteSelected = () => {
    selectedItems.forEach((i) => removeFromCart(i.id));
    setSelected(new Set());
    setEditMode(false);
  };

  const checkout = () => {
    if (selectedItems.length === 0) return;
    navigate('/checkout', { state: { ids: selectedItems.map((i) => i.id) } });
  };

  return (
    <IonPage>
      <IonContent fullscreen className="cart-content">
        <div className="cart-header">
          <IonIcon icon={arrowBackOutline} className="cart-back" onClick={() => navigate(-1)} />
          <span className="cart-title">
            Shopping Cart{items.length > 0 && <small> ({items.length})</small>}
          </span>
          {items.length > 0 && (
            <button className="cart-edit-btn" onClick={() => setEditMode((v) => !v)}>
              {editMode ? 'Done' : 'Edit'}
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <IonIcon icon={cartOutline} className="cart-empty-icon" />
            <p className="cart-empty-title">Oops, Your Shopping Cart is Empty</p>
            <p className="cart-empty-sub">Browse our awesome deals now!</p>
            <button className="cart-shop-btn" onClick={() => navigate('/app/home')}>
              Go Shopping Now
            </button>
          </div>
        ) : (
          groups.map(([shop, shopItems]) => {
            const ids = shopItems.map((i) => i.id);
            const shopAll = ids.every((id) => selected.has(id));
            return (
              <div className="cart-shop-card" key={shop}>
                <div className="cart-shop-row">
                  <input
                    type="checkbox"
                    className="cart-check"
                    aria-label={`Select all items from ${shop}`}
                    checked={shopAll}
                    onChange={() => setMany(ids, !shopAll)}
                  />
                  <span className="cart-shop-name">{shop}</span>
                  <IonIcon icon={chevronForwardOutline} className="cart-shop-chevron" />
                </div>

                {shopItems.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <input
                      type="checkbox"
                      className="cart-check"
                      aria-label={`Select ${item.name}`}
                      checked={selected.has(item.id)}
                      onChange={() => setMany([item.id], !selected.has(item.id))}
                    />
                    <img src={item.image} alt={item.name} className="cart-item-img" />
                    <div className="cart-item-info">
                      <p className="cart-item-name">{item.name}</p>
                      <div className="cart-item-variant-row">
                        <span className="cart-item-variant">{item.variant ?? ''}</span>
                        <div className="cart-qty">
                          <button
                            aria-label="Decrease quantity"
                            disabled={item.quantity <= 1}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            aria-label="Increase quantity"
                            disabled={item.quantity >= 99}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <p className="cart-item-price">{peso(item.price)}</p>
                    </div>
                  </div>
                ))}

                <div className="cart-voucher-row">
                  <IonIcon icon={ticketOutline} className="cart-voucher-icon" />
                  <span>Add shop voucher code</span>
                  <IonIcon icon={chevronForwardOutline} />
                </div>
              </div>
            );
          })
        )}
      </IonContent>

      {items.length > 0 && (
        <div className="cart-footer">
          <div className="cart-footer-voucher">
            <IonIcon icon={ticketOutline} className="cart-voucher-icon" />
            <span>Shopee Vouchers</span>
            <span className="cart-footer-voucher-cta">
              Select or enter code <IonIcon icon={chevronForwardOutline} />
            </span>
          </div>

          <div className="cart-footer-main">
            <label className="cart-all">
              <input
                type="checkbox"
                className="cart-check"
                checked={allSelected}
                onChange={() => setMany(items.map((i) => i.id), !allSelected)}
              />
              All
            </label>

            {editMode ? (
              <button
                className="cart-checkout-btn"
                disabled={selectedItems.length === 0}
                onClick={deleteSelected}
              >
                Delete ({selectedItems.length})
              </button>
            ) : (
              <>
                <span className="cart-footer-total">{peso(selectedTotal)}</span>
                <button
                  className="cart-checkout-btn"
                  disabled={selectedItems.length === 0}
                  onClick={checkout}
                >
                  Check Out ({selectedCount})
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </IonPage>
  );
};

export default Cart;