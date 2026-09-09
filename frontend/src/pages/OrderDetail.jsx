import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import * as orderApi from '../api/orderApi';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Package,
  Clock,
  Truck,
  Check,
  XCircle,
  AlertCircle,
} from 'lucide-react';

const OrderDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    location.state?.message || ''
  );

  const isSellerOrAdmin = user?.role === 'seller' || user?.role === 'admin';

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await orderApi.getOrderById(id);
        setOrder(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      setUpdatingStatus(true);
      const updated = await orderApi.updateOrderStatus(id, newStatus);
      setOrder(updated);
      setStatusMessage(`Order status updated to ${newStatus}`);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center page-loading">
        <div className="spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page-container">
        <div className="alert alert-error">
          <p>{error || 'Order not found'}</p>
          <Link to="/orders" className="btn btn-secondary btn-sm">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const dateFormatted = new Date(order.createdAt).toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="page-container">
      <Link to="/orders" className="back-link">
        <ArrowLeft size={16} />
        <span>Back to Orders</span>
      </Link>

      {statusMessage && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="receipt-container">
        {/* Header */}
        <div className="receipt-header">
          <div>
            <span className="receipt-sub">Purchase Confirmation</span>
            <h1 className="receipt-title">Order #{order._id.toUpperCase()}</h1>
            <div className="receipt-date">
              <Calendar size={15} />
              <span>Placed on {dateFormatted}</span>
            </div>
          </div>

          <div className="receipt-status-section">
            <span className={`status-pill status-${order.status} status-large`}>
              {order.status}
            </span>

            {/* Seller/Admin Status Control */}
            {isSellerOrAdmin && (
              <div className="admin-status-control">
                <label htmlFor="order-status-select">Change Status:</label>
                <select
                  id="order-status-select"
                  value={order.status}
                  onChange={handleStatusChange}
                  disabled={updatingStatus}
                  className="status-dropdown"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Snapshotted Line Items */}
        <div className="receipt-body">
          <h3>Snapshotted Order Items</h3>
          <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
            Product names and purchase prices are preserved from the moment of purchase.
          </p>

          <table className="receipt-table">
            <thead>
              <tr>
                <th>Item</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Unit Price</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <strong>{item.name}</strong>
                    {item.product && (
                      <div className="item-ref-id">Product Ref: {item.product}</div>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>${Number(item.price).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600 }}>
                  Total Paid:
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.2rem', color: '#16a34a' }}>
                  ${Number(order.totalPrice).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Customer & Delivery Details */}
        <div className="receipt-footer-grid">
          <div className="info-block">
            <h4>Customer Information</h4>
            <p><strong>Name:</strong> {order.user?.name || user?.name || 'Customer'}</p>
            <p><strong>Email:</strong> {order.user?.email || user?.email || 'N/A'}</p>
          </div>

          <div className="info-block">
            <h4>Fulfillment Status</h4>
            <p>
              Status: <strong>{order.status.toUpperCase()}</strong>
            </p>
            <p>Shipping: <strong>Standard Courier (Free)</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

