import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { resolveImageUrl } from '../api/client';
import { ShoppingCart, Check, Eye } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const primaryImage =
    product.images && product.images.length > 0 ? product.images[0] : null;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Please log in to add items to your cart');
      navigate('/login');
      return;
    }

    if (product.quantity <= 0) return;

    try {
      setAdding(true);
      await addToCart(product._id, 1);
      setAdded(true);
      toast.success(`Added "${product.name}" to your cart!`);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      toast.error(err.message || 'Failed to add item to cart');
    } finally {
      setAdding(false);
    }
  };

  const isOutOfStock = product.quantity <= 0;

  return (
    <div className="product-card group">
      <Link to={`/products/${product._id}`} className="product-card-image-link">
        {primaryImage ? (
          <img
            src={resolveImageUrl(primaryImage)}
            alt={product.name}
            className="product-card-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
            }}
          />
        ) : (
          <div className="product-card-placeholder">
            <span>No Image Available</span>
          </div>
        )}

        {/* Floating Category Pill */}
        {product.category && (
          <span className="glass-pill top-left">
            {typeof product.category === 'object'
              ? product.category.name
              : 'Product'}
          </span>
        )}

        {/* Stock Status Indicator */}
        <div className={`stock-status-pill ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
          <span className="pulsing-dot" />
          <span>{isOutOfStock ? 'Sold Out' : `${product.quantity} in stock`}</span>
        </div>

        {/* Hover Quick View Button */}
        <div className="card-quick-overlay">
          <span className="btn btn-xs btn-glass">
            <Eye size={14} />
            <span>Quick View</span>
          </span>
        </div>
      </Link>

      <div className="product-card-body">
        <div className="product-card-header">
          {product.seller && (
            <span className="product-seller">
              by {typeof product.seller === 'object' ? product.seller.name : 'Seller'}
            </span>
          )}
        </div>

        <Link to={`/products/${product._id}`} className="product-card-title">
          <h3>{product.name}</h3>
        </Link>

        <p className="product-card-description">
          {product.description || 'Crafted with premium quality and precision.'}
        </p>

        <div className="product-card-footer">
          <div className="price-container">
            <span className="price-currency">$</span>
            <span className="product-price">{Number(product.price).toFixed(2)}</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            className={`btn btn-sm btn-interactive-cart ${
              added ? 'btn-success' : isOutOfStock ? 'btn-disabled' : 'btn-primary'
            }`}
          >
            {added ? (
              <>
                <Check size={16} className="animate-scale" />
                <span>Added!</span>
              </>
            ) : adding ? (
              <span className="spinner-sm" />
            ) : (
              <>
                <ShoppingCart size={16} />
                <span>{isOutOfStock ? 'Unavailable' : 'Add to Cart'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
