import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as productApi from '../api/productApi';
import * as reviewApi from '../api/reviewApi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/useToast';
import { resolveImageUrl } from '../api/client';
import {
  Star,
  ShoppingCart,
  Check,
  Trash2,
  AlertCircle,
  ArrowLeft,
  Store,
  Tag,
  ShieldCheck,
  Share2,
  Plus,
  Minus,
  Sparkles,
  Truck,
  RotateCcw,
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [productData, reviewsData] = await Promise.all([
        productApi.getProductById(id),
        reviewApi.getProductReviews(id),
      ]);
      setProduct(productData);
      setReviews(reviewsData);
    } catch (err) {
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to add items to your cart');
      navigate('/login');
      return;
    }
    if (!product || product.quantity <= 0) return;

    try {
      setAddingToCart(true);
      await addToCart(product._id, buyQuantity);
      setCartSuccess(true);
      toast.success(`Added ${buyQuantity}x "${product.name}" to your cart!`);
      setTimeout(() => setCartSuccess(false), 2000);
    } catch (err) {
      toast.error(err.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.info('Product link copied to clipboard!');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please log in to leave a review');
      navigate('/login');
      return;
    }
    try {
      setSubmittingReview(true);
      setReviewError('');
      const newReview = await reviewApi.createProductReview(id, {
        rating: Number(reviewRating),
        comment: reviewComment.trim(),
      });
      setReviews([newReview, ...reviews]);
      setReviewComment('');
      setReviewRating(5);
      toast.success('Your customer review has been published!');
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
      toast.error(err.message || 'Could not post review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await reviewApi.deleteProductReview(id, reviewId);
      setReviews(reviews.filter((r) => r._id !== reviewId));
      toast.info('Review was deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete review');
    }
  };

  if (loading) {
    return (
      <div className="flex-center page-loading">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-container">
        <div className="alert alert-error">
          <p>{error || 'Product not found'}</p>
          <Link to="/" className="btn btn-secondary btn-sm">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const userAlreadyReviewed = reviews.some(
    (r) => r.user && (r.user._id === user?.id || r.user._id === user?._id)
  );

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const ratingLabels = {
    1: '1 - Poor',
    2: '2 - Fair',
    3: '3 - Average',
    4: '4 - Very Good',
    5: '5 - Exceptional!',
  };

  const imagesList = product.images && product.images.length > 0 ? product.images : [];

  return (
    <div className="page-container">
      <div className="detail-top-nav">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Marketplace</span>
        </Link>
        <button onClick={handleShare} className="btn btn-ghost btn-sm" title="Share Product">
          <Share2 size={16} />
          <span>Share</span>
        </button>
      </div>

      <div className="product-detail-layout glass-panel">
        {/* Images Gallery */}
        <div className="product-gallery">
          <div className="main-image-container group">
            {imagesList.length > 0 ? (
              <img
                src={resolveImageUrl(imagesList[selectedImage] || imagesList[0])}
                alt={product.name}
                className="main-detail-image zoomable-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
                }}
              />
            ) : (
              <div className="main-image-placeholder">
                <span>No Image Available</span>
              </div>
            )}
          </div>

          {imagesList.length > 1 && (
            <div className="thumbnail-row">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`thumbnail-btn ${selectedImage === idx ? 'active' : ''}`}
                >
                  <img src={resolveImageUrl(img)} alt={`Thumbnail ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="product-info-panel">
          <div className="product-meta-row">
            {product.category && (
              <span className="badge badge-category">
                <Tag size={12} />
                <span>
                  {typeof product.category === 'object'
                    ? product.category.name
                    : 'Category'}
                </span>
              </span>
            )}
            {product.seller && (
              <span className="seller-badge">
                <Store size={14} />
                <span>
                  Sold by{' '}
                  <strong>
                    {typeof product.seller === 'object'
                      ? product.seller.name
                      : 'Seller'}
                  </strong>
                </span>
              </span>
            )}
          </div>

          <h1 className="product-detail-title">{product.name}</h1>

          {/* Rating Summary */}
          <div className="rating-summary-row">
            <div className="stars-cluster">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={18}
                  className={
                    s <= Math.round(Number(averageRating) || 0)
                      ? 'star-filled'
                      : 'star-empty'
                  }
                />
              ))}
            </div>
            <span className="rating-average-text">
              {averageRating ? `${averageRating} / 5` : 'No ratings yet'}
            </span>
            <span className="rating-count-text">({reviews.length} customer reviews)</span>
          </div>

          <div className="price-tag-large">
            <span className="currency-symbol">$</span>
            {Number(product.price).toFixed(2)}
          </div>

          <div className="stock-indicator-panel">
            {product.quantity > 0 ? (
              <span className="stock-available">
                <span className="pulsing-dot" />
                <span>In Stock & Ready to Ship ({product.quantity} units left)</span>
              </span>
            ) : (
              <span className="stock-unavailable">
                <span className="pulsing-dot red" />
                <span>Currently Out of Stock</span>
              </span>
            )}
          </div>

          <div className="product-description-box">
            <h3>Description & Specifications</h3>
            <p>{product.description || 'No detailed description provided.'}</p>
          </div>

          {/* Perks Row */}
          <div className="perks-row">
            <div className="perk-item">
              <Truck size={16} />
              <span>Free Delivery</span>
            </div>
            <div className="perk-item">
              <ShieldCheck size={16} />
              <span>Buyer Protection</span>
            </div>
            <div className="perk-item">
              <RotateCcw size={16} />
              <span>30-Day Returns</span>
            </div>
          </div>

          {/* Add to Cart Actions */}
          <div className="purchase-action-panel">
            <div className="interactive-stepper">
              <button
                type="button"
                onClick={() => setBuyQuantity((prev) => Math.max(1, prev - 1))}
                disabled={product.quantity <= 0 || buyQuantity <= 1}
                className="stepper-action-btn"
              >
                <Minus size={15} />
              </button>
              <span className="stepper-value-display">{buyQuantity}</span>
              <button
                type="button"
                onClick={() =>
                  setBuyQuantity((prev) =>
                    Math.min(product.quantity || 1, prev + 1)
                  )
                }
                disabled={product.quantity <= 0 || buyQuantity >= product.quantity}
                className="stepper-action-btn"
              >
                <Plus size={15} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.quantity <= 0 || addingToCart}
              className={`btn btn-lg btn-glow-large ${
                cartSuccess
                  ? 'btn-success'
                  : product.quantity <= 0
                  ? 'btn-disabled'
                  : 'btn-primary'
              }`}
            >
              {cartSuccess ? (
                <>
                  <Check size={20} className="animate-scale" />
                  <span>Added to Cart!</span>
                </>
              ) : addingToCart ? (
                <span className="spinner-sm" />
              ) : (
                <>
                  <ShoppingCart size={20} />
                  <span>
                    {product.quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="reviews-section glass-panel">
        <div className="reviews-header">
          <div>
            <h2>Verified Customer Reviews</h2>
            <p className="text-muted">Real opinions from verified marketplace shoppers</p>
          </div>
          <span className="badge badge-secondary">{reviews.length} Total</span>
        </div>

        <div className="reviews-layout">
          {/* Review Submission Form */}
          <div className="review-form-card">
            <h3>Share Your Experience</h3>
            {!isAuthenticated ? (
              <div className="review-login-prompt">
                <p>Sign in to your account to post a review for this product.</p>
                <Link to="/login" className="btn btn-outline btn-sm">
                  Sign In to Review
                </Link>
              </div>
            ) : userAlreadyReviewed ? (
              <div className="alert alert-info">
                <Check size={18} />
                <p>Thank you! You have already submitted a review for this product.</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="review-form">
                {reviewError && (
                  <div className="alert alert-error">
                    <AlertCircle size={16} />
                    <span>{reviewError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label>Overall Rating</label>
                  <div className="star-picker-interactive">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = star <= (hoverRating || reviewRating);
                      return (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="star-interactive-btn"
                          aria-label={`Rate ${star} stars`}
                        >
                          <Star
                            size={26}
                            className={active ? 'star-filled interactive' : 'star-empty'}
                          />
                        </button>
                      );
                    })}
                    <span className="star-feedback-label">
                      {ratingLabels[hoverRating || reviewRating]}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="review-comment">Your Review Comment</label>
                  <textarea
                    id="review-comment"
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe what you liked, product quality, fit, or packaging..."
                    className="form-input"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-primary btn-block"
                >
                  {submittingReview ? 'Publishing...' : 'Publish Review'}
                </button>
              </form>
            )}
          </div>

          {/* Reviews List */}
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <div className="empty-reviews">
                <Star size={36} className="empty-icon" />
                <p>No customer reviews yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              reviews.map((rev) => {
                const isAuthor =
                  user &&
                  rev.user &&
                  (rev.user._id === user.id || rev.user._id === user._id);
                const isAdmin = user?.role === 'admin';
                const canDelete = isAuthor || isAdmin;

                return (
                  <div key={rev._id} className="review-item-card">
                    <div className="review-item-header">
                      <div className="review-user-info">
                        <div className="review-avatar">
                          {rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <strong>
                            {typeof rev.user === 'object'
                              ? rev.user.name
                              : 'Verified Customer'}
                          </strong>
                          <div className="stars-cluster">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={14}
                                className={
                                  s <= rev.rating ? 'star-filled' : 'star-empty'
                                }
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="review-item-actions">
                        <span className="review-date">
                          {new Date(rev.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteReview(rev._id)}
                            className="btn-icon btn-icon-danger"
                            title="Delete review"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="review-comment-text">{rev.comment}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
