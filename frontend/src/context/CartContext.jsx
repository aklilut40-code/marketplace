import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as cartApi from '../api/cartApi';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [] });
      return;
    }
    try {
      setLoading(true);
      const data = await cartApi.getCart();
      setCart(data || { items: [] });
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please log in to add items to your cart');
    }
    const updatedCart = await cartApi.addToCart({ product: productId, quantity });
    setCart(updatedCart);
    return updatedCart;
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) return;
    const updatedCart = await cartApi.removeFromCart(productId);
    setCart(updatedCart);
    return updatedCart;
  };

  const clearCart = () => {
    setCart({ items: [] });
  };

  const itemCount = cart.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;

  const totalAmount = cart.items?.reduce((total, item) => {
    const price = item.product?.price || 0;
    return total + price * item.quantity;
  }, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount,
        totalAmount,
        addToCart,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

