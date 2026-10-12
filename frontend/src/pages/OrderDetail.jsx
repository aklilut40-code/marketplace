import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import * as orderApi from '../api/orderApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/useToast';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Package,
  Clock,
  Truck,
  Check,
  XCircle,
  AlertCircle,
  Copy,
  Printer,
  ShieldCheck,
  CreditCard,
  User,
  Mail,
  Receipt,
  ExternalLink,
} from 'lucide-react';

const ORDER_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'paid', label: 'Payment Confirmed', icon: CreditCard },
  { key: 'shipped', label: 'In Transit / Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

const OrderDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

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

  const handleCopyId = () => {
    if (!order) return;
    navigator.clipboard.writeText(order._id);
    setCopiedId(true);
    toast.success('Order ID copied to clipboard!');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      setUpdatingStatus(true);
      const updated = await orderApi.updateOrderStatus(id, newStatus);
      setOrder(updated);
      toast.success(`Order status successfully updated to ${newStatus.toUpperCase()}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex-center page-loading">
          <div className="spinner"></div>
          <p>Loading invoice & fulfillment details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page-container">
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <div>
            <p><strong>Error:</strong> {error || 'Order record could not be found'}</p>
          </div>
        </div>
        <Link to="/orders" className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          <span>Return to Orders</span>
        </Link>
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

  // Calculate current active step index for progress tracker
  const stepIndex = ORDER_STEPS.findIndex((s) => s.key === order.status.toLowerCase());
  const isCancelled = order.status.toLowerCase() === 'cancelled';

  return (
    <div className="page-container receipt-page">
      {/* Top Navigation & Action Row */}
      <div className="receipt-actions-bar">
        <Link to="/orders" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to All Orders</span>
        </Link>

        <div className="receipt-quick-actions">
          <button
            type="button"
            onClick={handleCopyId}
            className="btn btn-outline btn-sm"
            title="Copy Order ID"
          >
            {copiedId ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            <span>{copiedId ? 'Copied!' : 'Copy ID'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-secondary btn-sm"
            title="Print or Save PDF"
          >
            <Printer size={14} />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Main Receipt Container */}
      <div className="receipt-container glass-panel">
        {/* Receipt Header */}
        <div className="receipt-header">
          <div className="receipt-header-left">
            <div className="receipt-badge-pill">
              <Receipt size={14} />
              <span>Verified Purchase Receipt</span>
            </div>
            <h1 className="receipt-title">Order #{order._id.toUpperCase()}</h1>
            <div className="receipt-date">
              <Calendar size={15} />
              <span>Placed on {dateFormatted}</span>
            </div>
          </div>

          <div className="receipt-status-section">
            <span className={`status-pill status-${order.status} status-large`}>
              <span className="status-dot"></span>
              <span className="status-text">{order.status.toUpperCase()}</span>
            </span>

            {/* Seller/Admin Status Control */}
            {isSellerOrAdmin && (
              <div className="admin-status-control glass-panel">
                <label htmlFor="order-status-select">
                  <ShieldCheck size={14} className="text-primary" />
                  <span>Update Status:</span>
                </label>
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

        {/* Visual Progress Stepper (if not cancelled) */}
        {!isCancelled ? (
          <div className="order-stepper-container">
            <div className="order-stepper">
              {ORDER_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = stepIndex >= idx;
                const isCurrent = stepIndex === idx;

                return (
                  <div
                    key={step.key}
                    className={`stepper-step ${
                      isCompleted ? 'step-completed' : ''
                    } ${isCurrent ? 'step-current' : ''}`}
                  >
                    <div className="stepper-circle">
                      {isCompleted && !isCurrent ? (
                        <Check size={16} />
                      ) : (
                        <Icon size={16} />
                      )}
                    </div>
                    <span className="stepper-label">{step.label}</span>
                    {idx < ORDER_STEPS.length - 1 && (
                      <div
                        className={`stepper-line ${
                          stepIndex > idx ? 'stepper-line-active' : ''
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="cancelled-banner">
            <XCircle size={22} className="text-danger" />
            <div>
              <strong>Order Cancelled</strong>
              <p>This order has been cancelled. Any charges have been refunded according to terms.</p>
            </div>
          </div>
        )}

        {/* Snapshotted Items Table */}
        <div className="receipt-body">
          <div className="receipt-body-header">
            <div>
              <h3>Purchased Line Items</h3>
              <p className="text-muted">
                Product names and unit prices are permanently snapshotted from the time of checkout.
              </p>
            </div>
            <span className="badge badge-secondary">{order.items?.length || 0} Products</span>
          </div>

          <div className="receipt-table-wrapper">
            <table className="receipt-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="text-center">Quantity</th>
                  <th className="text-right">Unit Price</th>
                  <th className="text-right">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="item-details-cell">
                      <strong className="item-name">{item.name}</strong>
                      {item.product && (
                        <div className="item-ref-id">
                          <Link to={`/products/${item.product}`} className="item-ref-link">
                            <span>View catalog item</span>
                            <ExternalLink size={12} />
                          </Link>
                        </div>
                      )}
                    </td>
                    <td className="text-center">
                      <span className="qty-tag">×{item.quantity}</span>
                    </td>
                    <td className="text-right font-mono">
                      ${Number(item.price).toFixed(2)}
                    </td>
                    <td className="text-right font-mono font-bold text-primary">
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="text-right font-medium text-muted">
                    Subtotal:
                  </td>
                  <td className="text-right font-mono font-medium">
                    ${Number(order.totalPrice).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="text-right font-medium text-muted">
                    Shipping & Handling:
                  </td>
                  <td className="text-right font-mono text-success font-medium">
                    FREE
                  </td>
                </tr>
                <tr className="grand-total-row">
                  <td colSpan={3} className="text-right font-bold">
                    Total Amount Paid:
                  </td>
                  <td className="text-right grand-total-amount">
                    ${Number(order.totalPrice).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Customer & Courier Details Footer Grid */}
        <div className="receipt-footer-grid">
          <div className="info-block glass-panel">
            <div className="info-block-header">
              <User size={18} className="text-primary" />
              <h4>Customer Information</h4>
            </div>
            <div className="info-block-content">
              <p>
                <span className="info-label">Name:</span>
                <strong>{order.user?.name || user?.name || 'Valued Customer'}</strong>
              </p>
              <p>
                <span className="info-label">Email:</span>
                <span>{order.user?.email || user?.email || 'N/A'}</span>
              </p>
              <p>
                <span className="info-label">Payment:</span>
                <span className="badge badge-success">Processed (Snapshot ID)</span>
              </p>
            </div>
          </div>

          <div className="info-block glass-panel">
            <div className="info-block-header">
              <Truck size={18} className="text-accent" />
              <h4>Delivery & Fulfillment</h4>
            </div>
            <div className="info-block-content">
              <p>
                <span className="info-label">Method:</span>
                <strong>Priority Standard Courier</strong>
              </p>
              <p>
                <span className="info-label">Status:</span>
                <strong className={`text-${order.status === 'delivered' ? 'success' : 'primary'}`}>
                  {order.status.toUpperCase()}
                </strong>
              </p>
              <p>
                <span className="info-label">Estimated Delivery:</span>
                <span>2 - 4 Business Days</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
