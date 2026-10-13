import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as orderApi from '../api/orderApi';
import { Package, Calendar, ChevronRight, ShoppingBag } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderApi.getOrders();
        setOrders(data);
      } catch (err) {
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex-center page-loading">
        <div className="spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">Your Order History</h1>
          <p className="text-muted">Track and review your past purchases</p>
        </div>
      </div>

      {error ? (
        <div className="alert alert-error">{error}</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <Package size={52} className="empty-icon" />
          <h3>No Orders Placed Yet</h3>
          <p>When you purchase items, your order history and receipt details appear here.</p>
          <Link to="/" className="btn btn-primary">
            Explore Marketplace
          </Link>
        </div>
      ) : (
        <div className="orders-list-grid">
          {orders.map((order) => {
            const dateStr = new Date(order.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const itemCount = order.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 0;

            return (
              <div key={order._id} className="order-history-card">
                <div className="order-history-top">
                  <div className="order-info-meta">
                    <span className="order-id-label">Order #{order._id.slice(-8).toUpperCase()}</span>
                    <span className="order-date-meta">
                      <Calendar size={14} />
                      <span>{dateStr}</span>
                    </span>
                  </div>

                  <span className={`status-pill status-${order.status}`}>
                    {order.status}
                  </span>
                </div>

                <div className="order-history-middle">
                  <div className="order-items-preview">
                    {order.items?.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="order-preview-line">
                        <span className="preview-qty">{item.quantity}x</span>
                        <span className="preview-name">{item.name}</span>
                        <span className="preview-price">${Number(item.price).toFixed(2)}</span>
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <div className="preview-more">
                        +{order.items.length - 3} more items...
                      </div>
                    )}
                  </div>
                </div>

                <div className="order-history-bottom">
                  <div className="order-bottom-total">
                    <span className="text-muted">{itemCount} items</span>
                    <span className="total-highlight">
                      ${Number(order.totalPrice).toFixed(2)}
                    </span>
                  </div>

                  <Link to={`/orders/${order._id}`} className="btn btn-secondary btn-sm">
                    <span>View Receipt</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;

