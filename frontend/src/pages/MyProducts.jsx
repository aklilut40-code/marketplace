import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as productApi from '../api/productApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { resolveImageUrl } from '../api/client';
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  Image,
  Package,
  CheckCircle,
  AlertCircle,
  X,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

const MyProducts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingForProduct, setUploadingForProduct] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchMyProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const allProducts = await productApi.getProducts();
      // If admin, can manage all; if seller, only their own
      const myItems =
        user?.role === 'admin'
          ? allProducts
          : allProducts.filter(
              (p) =>
                p.seller &&
                (p.seller._id === user?._id ||
                  p.seller._id === user?.id ||
                  p.seller === user?._id ||
                  p.seller === user?.id)
            );
      setProducts(myItems);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyProducts();
  }, [fetchMyProducts]);

  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.quantity > 0).length;
    const outOfStock = products.filter((p) => p.quantity === 0).length;
    return { total, inStock, outOfStock };
  }, [products]);

  const openCreateModal = () => {
    setFormData({ name: '', description: '', price: '', quantity: '' });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      quantity: product.quantity,
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        quantity: Number(formData.quantity),
      };

      if (editingProduct) {
        const updated = await productApi.updateProduct(editingProduct._id, payload);
        setProducts(products.map((p) => (p._id === updated._id ? updated : p)));
        toast.success(`Product "${updated.name}" updated successfully!`);
      } else {
        const created = await productApi.createProduct(payload);
        setProducts([created, ...products]);
        toast.success(`Product "${created.name}" created successfully!`);
      }

      setIsCreateModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      toast.error(err.message || 'Error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) return;
    try {
      await productApi.deleteProduct(productId);
      setProducts(products.filter((p) => p._id !== productId));
      toast.info(`Deleted product "${productName}"`);
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCloseUploadModal = () => {
    setUploadingForProduct(null);
    setImageFile(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
  };

  const handleUploadImage = async (e) => {
    e.preventDefault();
    if (!imageFile || !uploadingForProduct) return;

    try {
      setSubmitting(true);
      const updated = await productApi.uploadProductImage(
        uploadingForProduct._id,
        imageFile
      );
      setProducts(products.map((p) => (p._id === updated._id ? updated : p)));
      toast.success(`Image uploaded and added to "${uploadingForProduct.name}"!`);
      handleCloseUploadModal();
    } catch (err) {
      toast.error(err.message || 'Image upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">Seller Inventory & Catalog</h1>
          <p className="text-muted">
            Manage your store's listings, adjust real-time stock levels, and upload imagery.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary btn-glow">
          <Plus size={18} />
          <span>New Product</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="seller-stats-grid">
        <div className="seller-stat-card glass-panel">
          <div className="stat-icon-circle blue">
            <Layers size={20} />
          </div>
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Listings</div>
          </div>
        </div>

        <div className="seller-stat-card glass-panel">
          <div className="stat-icon-circle green">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="stat-value">{stats.inStock}</div>
            <div className="stat-label">Active In Stock</div>
          </div>
        </div>

        <div className="seller-stat-card glass-panel">
          <div className="stat-icon-circle amber">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="stat-value">{stats.outOfStock}</div>
            <div className="stat-label">Out of Stock</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex-center page-loading">
          <div className="spinner"></div>
          <p>Loading your catalog...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state glass-panel">
          <Package size={52} className="empty-icon" />
          <h3>No Products Listed Yet</h3>
          <p>Kickstart your store by listing your first product with prices and stock count.</p>
          <button onClick={openCreateModal} className="btn btn-primary btn-glow">
            <Plus size={18} />
            <span>Create First Product</span>
          </button>
        </div>
      ) : (
        <div className="table-card glass-panel">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock Status</th>
                <th>Images</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const thumb = p.images && p.images.length > 0 ? p.images[0] : null;

                return (
                  <tr key={p._id} className="inventory-row">
                    <td>
                      <div className="table-product-cell">
                        <div className="table-thumb">
                          {thumb ? (
                            <img
                              src={resolveImageUrl(thumb)}
                              alt={p.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=60';
                              }}
                            />
                          ) : (
                            <div className="table-thumb-placeholder">
                              <Image size={18} />
                            </div>
                          )}
                        </div>
                        <div>
                          <strong>{p.name}</strong>
                          <p className="text-muted text-clamp-1">
                            {p.description || 'No description'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="price-td">${Number(p.price).toFixed(2)}</td>
                    <td>
                      <span
                        className={`badge ${
                          p.quantity > 0 ? 'badge-stock' : 'badge-out-of-stock'
                        }`}
                      >
                        <span className="pulsing-dot" />
                        {p.quantity} units
                      </span>
                    </td>
                    <td>
                      <div className="image-count-cell">
                        <span className="image-counter-tag">{p.images?.length || 0}</span>
                        <button
                          onClick={() => setUploadingForProduct(p)}
                          className="btn btn-secondary btn-xs"
                          title="Upload Image"
                        >
                          <Upload size={13} />
                          <span>Add Photo</span>
                        </button>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions">
                        <button
                          onClick={() => openEditModal(p)}
                          className="btn-icon"
                          title="Edit Product"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id, p.name)}
                          className="btn-icon btn-icon-danger"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Create / Edit Product */}
      {(isCreateModalOpen || editingProduct) && (
        <div className="modal-backdrop">
          <div className="modal-dialog glass-panel animate-scale-up">
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Product' : 'Create New Product'}</h3>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingProduct(null);
                }}
                className="btn-icon"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="modal-form">
              <div className="form-group">
                <label>Product Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="form-input"
                  placeholder="e.g. Ergonomic Mechanical Keyboard"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="form-input"
                  placeholder="Describe key features, materials, and details..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="form-input"
                    placeholder="99.99"
                  />
                </div>

                <div className="form-group">
                  <label>Initial Stock (Units) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    className="form-input"
                    placeholder="25"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-glow"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload Image with Live Preview */}
      {uploadingForProduct && (
        <div className="modal-backdrop">
          <div className="modal-dialog glass-panel animate-scale-up">
            <div className="modal-header">
              <h3>Upload Product Photo</h3>
              <button
                onClick={handleCloseUploadModal}
                className="btn-icon"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadImage} className="modal-form">
              <p className="text-muted" style={{ marginBottom: '1rem' }}>
                Uploading to: <strong>{uploadingForProduct.name}</strong>
              </p>

              {imagePreviewUrl ? (
                <div className="image-preview-container">
                  <img
                    src={imagePreviewUrl}
                    alt="Preview"
                    className="image-live-preview"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreviewUrl(null);
                    }}
                    className="btn btn-secondary btn-xs mt-2"
                  >
                    Choose Different Image
                  </button>
                </div>
              ) : (
                <div className="file-upload-box">
                  <input
                    type="file"
                    id="image-file-input"
                    accept="image/jpeg,image/png,image/webp"
                    required
                    onChange={handleFileChange}
                    className="file-input-hidden"
                  />
                  <label htmlFor="image-file-input" className="file-upload-label">
                    <div className="upload-icon-pulse">
                      <Upload size={32} />
                    </div>
                    <strong>Click to upload an image</strong>
                    <span className="text-muted text-xs">
                      Supported: JPEG, PNG, WEBP (Maximum 5MB)
                    </span>
                  </label>
                </div>
              )}

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseUploadModal}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!imageFile || submitting}
                  className="btn btn-primary btn-glow"
                >
                  {submitting ? 'Uploading...' : 'Confirm & Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProducts;
