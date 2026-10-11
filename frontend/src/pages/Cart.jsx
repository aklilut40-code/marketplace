import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/useToast';
import * as orderApi from '../api/orderApi';
import { resolveImageUrl } from '../api/client';
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Plus,
  Minus,
  AlertCircle,
  Truck,
  Tag,
  CheckCircle,
} from 'lucide-react';

const Cart = () => {
  const { cart, loading, addToCart, removeFromCart, clearCart, totalAmount } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');

  const freeShippingThreshold = 100;
  const progressPercent = Math.min(100, (totalAmount / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - totalAmount);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    if (promoCode.trim().toUpperCase() === 'SAVE10') {
      setDiscountPercent(0.1);
      setAppliedPromo('SAVE10 (10% off)');
      toast.success('Promo code SAVE10 applied! 10% discount added.');
    } else if (promoCode.trim().toUpperCase() === 'MARKET20') {
      setDiscountPercent(0.2);
      setAppliedPromo('MARKET20 (20% off)');
      toast.success('Promo code MARKET20 applied! 20% discount added.');
    } else {
      toast.error('Invalid promo code. Try "SAVE10" or "MARKET20".');
    }
    setPromoCode('');
  };

  const handleQuantityChange = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      await removeFromCart(productId);
      toast.info('Item removed from cart');
    } else {
      await addToCart(productId, newQty);
    }
  };

  const handleRemove = async (productId, productName) => {
    await removeFromCart(productId);
    toast.info(`Removed "${productName || 'Item'}" from cart`);
  };

  const discountAmount = totalAmount * discountPercent;
  const finalTotal = Math.max(0, totalAmount - discountAmount);

  const handleCheckout = async () => {
    if (!cart.items || cart.items.length === 0) return;

    try {
      setCheckingOut(true);
      setCheckoutError('');

      const orderPayload = {
        items: cart.items.map((item) => ({
          product: typeof item.product === 'object' ? item.product._id : item.product,
          quantity: item.quantity,
        })),
      };

      const newOrder = await orderApi.createOrder(orderPayload);
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${newOrder._id}`, {
        state: { message: 'Order placed successfully!' },
      });
    } catch (err) {
      setCheckoutError(err.message || 'Failed to place order. Please check item stock.');
      toast.error(err.message || 'Could not complete order');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center page-loading">
        <div className="spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  const items = cart.items || [];

  if (items.length === 0) {
    return (
      <div className="page-container">
        <div className="empty-cart-card glass-panel">
          <div className="empty-icon-circle">
            <ShoppingBag size={48} className="empty-icon" />
          </div>
          <h2>Your Cart is Currently Empty</h2>
          <p>You haven't added any products to your cart yet. Discover curated items today.</p>
          <Link to="/" className="btn btn-primary btn-lg btn-glow">
            Explore Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="cart-header-section">
        <h1 className="page-heading">Your Shopping Bag</h1>
        <span className="cart-items-counter">
          {items.reduce((s, i) => s + (i.quantity || 1), 0)} items in total
        </span>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="shipping-progress-banner glass-panel">
        <div className="shipping-progress-header">
          <div className="shipping-label">
            <Truck size={18} className="shipping-truck-icon" />
            <span>
              {remainingForFreeShipping === 0 ? (
                <strong>You've unlocked FREE Premium Shipping! 🎉</strong>
              ) : (
                <>
                  Add <strong>${remainingForFreeShipping.toFixed(2)}</strong> more to unlock <strong>FREE Shipping</strong>!
                </>
              )}
            </span>
          </div>
          <span className="shipping-percent-text">{Math.round(progressPercent)}%</span>
        </div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {checkoutError && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{checkoutError}</span>
        </div>
      )}

      <div className="cart-grid-layout">
        {/* Cart Items List */}
        <div className="cart-items-panel">
          {items.map((item) => {
            const product = item.product || {};
            const image =
              product.images && product.images.length > 0
                ? product.images[0]
                : null;
            const lineTotal = (product.price || 0) * item.quantity;

            return (
              <div key={product._id || item._id} className="cart-item-row glass-panel">
                <div className="cart-item-thumb">
                  {image ? (
                    <img
                      src={resolveImageUrl(image)}
                      alt={product.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=60';
                      }}
                    />
                  ) : (
                    <div className="cart-item-no-thumb">No Image</div>
                  )}
                </div>

                <div className="cart-item-details">
                  <Link
                    to={`/products/${product._id}`}
                    className="cart-item-title"
                  >
                    {product.name || 'Product'}
                  </Link>

                  <div className="cart-item-unit-price">
                    ${Number(product.price || 0).toFixed(2)} each
                  </div>

                  <div className="cart-item-controls">
                    <div className="stepper-group interactive-stepper-sm">
                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(product._id, item.quantity, -1)
                        }
                        className="stepper-btn"
                        title="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="stepper-val">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(product._id, item.quantity, 1)
                        }
                        className="stepper-btn"
                        disabled={product.quantity <= item.quantity}
                        title="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(product._id, product.name)}
                      className="cart-remove-btn"
                    >
                      <Trash2 size={15} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                <div className="cart-item-subtotal">
                  <span className="subtotal-label">Subtotal</span>
                  <span className="subtotal-number">${lineTotal.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Panel */}
        <div className="cart-summary-panel">
          <div className="summary-card glass-panel">
            <h3>Order Summary</h3>

            <div className="summary-row">
              <span>Items Subtotal</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>

            {discountPercent > 0 && (
              <div className="summary-row discount-row">
                <span>Discount ({appliedPromo})</span>
                <span className="text-success">-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="summary-row">
              <span>Estimated Shipping</span>
              <span className="text-success font-semibold">
                {remainingForFreeShipping === 0 ? 'FREE' : '$5.00'}
              </span>
            </div>

            <div className="summary-row">
              <span>Estimated Sales Tax</span>
              <span>$0.00</span>
            </div>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="promo-input-row">
              <input
                type="text"
                placeholder="Promo Code (try SAVE10)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="promo-input"
              />
              <button type="submit" className="btn btn-secondary btn-sm">
                Apply
              </button>
            </form>

            <div className="summary-divider" />

            <div className="summary-row summary-total">
              <span>Total Amount</span>
              <span className="total-amount">${finalTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="btn btn-primary btn-block btn-lg btn-glow"
            >
              {checkingOut ? (
                'Processing Order...'
              ) : (
                <>
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="summary-guarantee">
              <ShieldCheck size={16} />
              <span>Safe & Secure 256-Bit SSL Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
