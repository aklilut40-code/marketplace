import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
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
} from 'lucide-react';

const Cart = () => {
  const { cart, loading, addToCart, removeFromCart, clearCart, totalAmount } = useCart();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const handleQuantityChange = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      await removeFromCart(productId);
    } else {
      await addToCart(productId, newQty);
    }
  };

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
      navigate(`/orders/${newOrder._id}`, {
        state: { message: 'Order placed successfully!' },
      });
    } catch (err) {
      setCheckoutError(err.message || 'Failed to place order. Please try again.');
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
        <div className="empty-cart-card">
          <ShoppingBag size={56} className="empty-icon" />
          <h2>Your Cart is Empty</h2>
          <p>Explore our wide selection of unique products and start shopping.</p>
          <Link to="/" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-heading">Your Shopping Cart</h1>

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
              <div key={product._id || item._id} className="cart-item-row">
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
                    <div className="stepper-group">
                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(product._id, item.quantity, -1)
                        }
                        className="stepper-btn"
                        title="Decrease"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="stepper-val">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(product._id, item.quantity, 1)
                        }
                        className="stepper-btn"
                        disabled={product.quantity <= item.quantity}
                        title="Increase"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(product._id)}
                      className="cart-remove-btn"
                    >
                      <Trash2 size={16} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                <div className="cart-item-subtotal">
                  ${lineTotal.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Panel */}
        <div className="cart-summary-panel">
          <div className="summary-card">
            <h3>Order Summary</h3>

            <div className="summary-row">
              <span>Subtotal ({items.length} items)</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Standard Shipping</span>
              <span className="text-success">FREE</span>
            </div>

            <div className="summary-row">
              <span>Estimated Taxes</span>
              <span>$0.00</span>
            </div>

            <div className="summary-divider" />

            <div className="summary-row summary-total">
              <span>Order Total</span>
              <span className="total-amount">${totalAmount.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="btn btn-primary btn-block btn-lg"
            >
              {checkingOut ? (
                'Processing Order...'
              ) : (
                <>
                  <span>Place Order</span>
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

