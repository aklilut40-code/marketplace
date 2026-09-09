import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { resolveImageUrl } from '../api/client';
import { ShoppingCart, Check, AlertCircle } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const primaryImage =
    product.images && product.images.length > 0 ? product.images[0] : null;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (product.quantity <= 0) return;

    try {
      setAdding(true);
      setErrorMsg('');
      await addToCart(product._id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add to cart');
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setAdding(false);
    }
  };

  const isOutOfStock = product.quantity <= 0;

  return (
    <div className="product-card">
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
        {isOutOfStock ? (
          <span className="badge badge-out-of-stock">Out of Stock</span>
        ) : (
          <span className="badge badge-stock">{product.quantity} left</span>
        )}
      </Link>

      <div className="product-card-body">
        <div className="product-card-header">
          {product.category && (
            <span className="product-category">
              {typeof product.category === 'object'
                ? product.category.name
                : 'Category'}
            </span>
          )}
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
          {product.description || 'No description provided.'}
        </p>

        <div className="product-card-footer">
          <div className="product-price">${Number(product.price).toFixed(2)}</div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            className={`btn btn-sm ${
              added ? 'btn-success' : isOutOfStock ? 'btn-disabled' : 'btn-primary'
            }`}
          >
            {added ? (
              <>
                <Check size={16} />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="product-card-error">
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

