'use client';

import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';

export default function CartSidebar() {
  const { items, totalPrice, isOpen, setIsOpen, removeItem, updateQuantity } = useCart();
  const router = useRouter();

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(false)}></div>
      <aside className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h3>Votre Panier</h3>
          <button className="cart-close" onClick={() => setIsOpen(false)}>&times;</button>
        </div>
        <div className="cart-items" id="cart-items-container">
          {items.map(item => (
            <div key={item.product_id} className="cart-item">
              <div className="cart-item-info">
                <h4>{item.name}</h4>
                <p>{item.price.toLocaleString('fr-FR')} FCFA</p>
              </div>
              <div className="cart-item-actions">
                <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>+</button>
                <button className="cart-item-remove" onClick={() => removeItem(item.product_id)}>&times;</button>
              </div>
            </div>
          ))}
        </div>
        {items.length === 0 && (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <p>Votre panier est vide</p>
          </div>
        )}
        <div className="cart-footer">
          <div className="cart-total">
            <span>Total</span>
            <span className="amount">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <button
            className="btn btn-primary cart-checkout-btn"
            onClick={() => { setIsOpen(false); router.push('/checkout'); }}
          >
            Passer à la caisse
          </button>
        </div>
      </aside>
    </>
  );
}
