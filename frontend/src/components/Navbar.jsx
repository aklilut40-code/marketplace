import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ShoppingCart, Package, Tag, LogOut, LogIn, UserPlus, Store } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isSellerOrAdmin = user?.role === 'seller' || user?.role === 'admin';

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <ShoppingBag className="brand-icon" />
          <span>MarketPulse</span>
        </Link>

        <nav className="navbar-nav">
          <Link to="/" className="nav-link">
            <Tag size={18} />
            <span>Explore</span>
          </Link>

          {isSellerOrAdmin && (
            <Link to="/my-products" className="nav-link">
              <Store size={18} />
              <span>My Products</span>
            </Link>
          )}

          {isAuthenticated && (
            <Link to="/orders" className="nav-link">
              <Package size={18} />
              <span>Orders</span>
            </Link>
          )}

          <Link to="/cart" className="nav-link cart-nav-link">
            <ShoppingCart size={18} />
            <span>Cart</span>
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>
        </nav>

        <div className="navbar-auth">
          {isAuthenticated ? (
            <div className="user-profile-menu">
              <div className="user-meta">
                <span className="user-name">{user.name}</span>
                <span className={`badge badge-${user.role}`}>{user.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log Out"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline btn-sm">
                <LogIn size={16} />
                <span>Login</span>
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={16} />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

