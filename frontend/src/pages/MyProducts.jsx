import React, { useState, useEffect, useCallback } from 'react';
import * as productApi from '../api/productApi';
import { useAuth } from '../context/AuthContext';
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
} from 'lucide-react';

const MyProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
        setSuccessMsg('Product updated successfully!');
      } else {
        const created = await productApi.createProduct(payload);
        setProducts([created, ...products]);
        setSuccessMsg('Product created successfully!');
      }

      setIsCreateModalOpen(false);
      setEditingProduct(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productApi.deleteProduct(productId);
      setProducts(products.filter((p) => p._id !== productId));
      setSuccessMsg('Product deleted successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to delete product');
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
      setUploadingForProduct(null);
      setImageFile(null);
      setSuccessMsg('Image uploaded and attached successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Image upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">Seller Inventory & Products</h1>
          <p className="text-muted">
            Create, update pricing and inventory, and upload product images.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Add New Product</span>
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex-center page-loading">
          <div className="spinner"></div>
          <p>Loading your products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <Package size={52} className="empty-icon" />
          <h3>No Products Listed</h3>
          <p>Start selling by adding your first product catalog listing today.</p>
          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus size={18} />
            <span>Create Your First Product</span>
          </button>
        </div>
      ) : (
        <div className="table-card">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Images</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const thumb = p.images && p.images.length > 0 ? p.images[0] : null;

                return (
                  <tr key={p._id}>
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
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td>
                      <span
                        className={`badge ${
                          p.quantity > 0 ? 'badge-stock' : 'badge-out-of-stock'
                        }`}
                      >
                        {p.quantity} units
                      </span>
                    </td>
                    <td>
                      <div className="image-count-cell">
                        <span>{p.images?.length || 0} image(s)</span>
                        <button
                          onClick={() => setUploadingForProduct(p)}
                          className="btn btn-outline btn-xs"
                          title="Upload Image"
                        >
                          <Upload size={14} />
                          <span>Upload</span>
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
                          onClick={() => handleDelete(p._id)}
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
          <div className="modal-dialog">
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
                <label>Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="form-input"
                  placeholder="e.g. Ergonomic Keyboard"
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
                  placeholder="Key features and details..."
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
                  <label>Quantity In Stock *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    className="form-input"
                    placeholder="20"
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
                  className="btn btn-primary"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload Image */}
      {uploadingForProduct && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3>Upload Product Image</h3>
              <button
                onClick={() => {
                  setUploadingForProduct(null);
                  setImageFile(null);
                }}
                className="btn-icon"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadImage} className="modal-form">
              <p className="text-muted">
                Uploading to: <strong>{uploadingForProduct.name}</strong>
              </p>

              <div className="file-upload-box">
                <input
                  type="file"
                  id="image-file-input"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="file-input-hidden"
                />
                <label htmlFor="image-file-input" className="file-upload-label">
                  <Upload size={32} />
                  <span>
                    {imageFile
                      ? `Selected: ${imageFile.name}`
                      : 'Choose JPEG, PNG, or WEBP image (max 5MB)'}
                  </span>
                </label>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setUploadingForProduct(null);
                    setImageFile(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!imageFile || submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Uploading...' : 'Upload Image'}
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

