import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as orderApi from '../api/orderApi';
import { useToast } from '../context/useToast';
import {
  Package,
  Calendar,
  ChevronRight,
  ShoppingBag,
  DollarSign,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  Copy,
  Check,
  AlertCircle,
  Filter,
} from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderApi.getOrders();
        setOrders(data || []);
      } catch (err) {
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCopyId = (e, orderId) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(orderId);
    setCopiedId(orderId);
    toast.success('Order ID copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Metrics summary
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
    const activeOrders = orders.filter(
      (o) => o.status === 'pending' || o.status === 'paid' || o.status === 'shipped'
    ).length;
    return { totalOrders, totalSpent, activeOrders };
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();

      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesStatus;

      const matchesId = order._id.toLowerCase().includes(query);
      const matchesItems = order.items?.some((i) =>
        i.name?.toLowerCase().includes(query)
      );

      return matchesStatus && (matchesId || matchesItems);
    });
  }, [orders, statusFilter, searchQuery]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex-center page-loading">
          <div className="spinner"></div>
          <p>Retrieving your order history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <span className="badge badge-accent mb-2">Purchase History</span>
          <h1 className="page-heading">Your Orders & Receipts</h1>
          <p className="text-muted">Track order progress, view snapshots, and access invoices</p>
        </div>
      </div>

      {error ? (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state glass-panel">
          <div className="empty-icon-circle">
            <Package size={44} className="text-primary" />
          </div>
          <h3>No Orders Placed Yet</h3>
          <p>
            When you complete purchases, your snapshot receipts, status updates, and tracking
            will be displayed right here.
          </p>
          <Link to="/" className="btn btn-primary btn-lg mt-3">
            <ShoppingBag size={18} />
            <span>Start Shopping Now</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Summary Metric Stats */}
          <div className="metrics-grid mb-4">
            <div className="metric-card glass-panel">
              <div className="metric-icon metric-icon-primary">
                <ShoppingBag size={22} />
              </div>
              <div className="metric-details">
                <span className="metric-label">Total Orders</span>
                <strong className="metric-value">{stats.totalOrders}</strong>
              </div>
            </div>

            <div className="metric-card glass-panel">
              <div className="metric-icon metric-icon-success">
                <DollarSign size={22} />
              </div>
              <div className="metric-details">
                <span className="metric-label">Total Spent</span>
                <strong className="metric-value">${stats.totalSpent.toFixed(2)}</strong>
              </div>
            </div>

            <div className="metric-card glass-panel">
              <div className="metric-icon metric-icon-accent">
                <Truck size={22} />
              </div>
              <div className="metric-details">
                <span className="metric-label">Active In-Transit</span>
                <strong className="metric-value">{stats.activeOrders}</strong>
              </div>
            </div>
          </div>

          {/* Interactive Filters Bar */}
          <div className="orders-toolbar glass-panel mb-4">
            <div className="toolbar-search">
              <Search size={18} className="search-icon-muted" />
              <input
                type="text"
                placeholder="Search by Order ID or item title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="toolbar-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="search-clear-btn"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="toolbar-tabs">
              <span className="toolbar-tabs-label">Status:</span>
              {['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`toolbar-tab-pill ${statusFilter === st ? 'active' : ''}`}
                >
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="empty-state glass-panel">
              <Filter size={36} className="text-muted mb-2" />
              <h3>No Matching Orders Found</h3>
              <p>Try resetting your status filter or search keywords.</p>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="btn btn-outline btn-sm mt-3"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="orders-list-grid">
              {filteredOrders.map((order) => {
                const dateStr = new Date(order.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const itemCount = order.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 0;

                return (
                  <div key={order._id} className="order-history-card glass-panel">
                    <div className="order-history-top">
                      <div className="order-info-meta">
                        <div className="order-id-group">
                          <span className="order-id-label">
                            Order #{order._id.slice(-8).toUpperCase()}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyId(e, order._id)}
                            className="order-copy-btn"
                            title="Copy full Order ID"
                          >
                            {copiedId === order._id ? (
                              <Check size={14} className="text-success" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                        <span className="order-date-meta">
                          <Calendar size={14} />
                          <span>{dateStr}</span>
                        </span>
                      </div>

                      <div className="order-status-badge-wrap">
                        <span className={`status-pill status-${order.status}`}>
                          <span className="status-dot"></span>
                          <span className="status-text">{order.status.toUpperCase()}</span>
                        </span>
                      </div>
                    </div>

                    <div className="order-history-middle">
                      <div className="order-items-preview">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="order-preview-line">
                            <span className="preview-qty">{item.quantity}x</span>
                            <span className="preview-name">{item.name}</span>
                            <span className="preview-price">${Number(item.price).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="order-history-bottom">
                      <div className="order-bottom-total">
                        <span className="text-muted">{itemCount} items purchased</span>
                        <div className="total-highlight-row">
                          <span className="total-highlight-label">Total:</span>
                          <span className="total-highlight">
                            ${Number(order.totalPrice).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <Link to={`/orders/${order._id}`} className="btn btn-primary btn-sm order-receipt-btn">
                        <span>View Receipt & Tracking</span>
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Orders;
