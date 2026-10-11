import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import {
  ShoppingBag,
  ShoppingCart,
  Package,
  Compass,
  LogOut,
  LogIn,
  UserPlus,
  Store,
  Sparkles,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info('You have logged out.');
    navigate('/');
  };

  const isSellerOrAdmin = user?.role === 'seller' || user?.role === 'admin';

  return (
    <header className="navbar-header glass-header">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon-wrapper">
            <ShoppingBag className="brand-icon" size={20} />
          </div>
          <span className="brand-text">MarketPulse</span>
        </Link>

        <nav className="navbar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}
          >
            <Compass size={17} />
            <span>Discover</span>
          </NavLink>

          {isSellerOrAdmin && (
            <NavLink
              to="/my-products"
              className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}
            >
              <Store size={17} />
              <span>Seller Hub</span>
            </NavLink>
          )}

          {isAuthenticated && (
            <NavLink
              to="/orders"
              className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`}
            >
              <Package size={17} />
              <span>Orders</span>
            </NavLink>
          )}

          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `nav-link cart-nav-link ${isActive ? 'nav-active' : ''}`
            }
          >
            <ShoppingCart size={17} />
            <span>Cart</span>
            {itemCount > 0 && (
              <span className="cart-badge animate-pulse-badge">{itemCount}</span>
            )}
          </NavLink>
        </nav>

        <div className="navbar-auth">
          {isAuthenticated ? (
            <div className="user-profile-menu">
              <div className="user-avatar-badge">
                <span className="user-avatar-initial">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
                <div className="user-meta-info">
                  <span className="user-name">{user.name}</span>
                  <span className={`role-tag role-${user.role}`}>{user.role}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-sm"
                title="Log Out"
              >
                <LogOut size={16} />
                <span className="hide-on-mobile">Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm">
                <LogIn size={15} />
                <span>Login</span>
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm btn-glow">
                <Sparkles size={14} />
                <span>Get Started</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
