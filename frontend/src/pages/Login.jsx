import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/useToast';
import {
  LogIn,
  ShoppingBag,
  AlertCircle,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fillDemoAccount = (email, password, roleName) => {
    setFormData({ email, password });
    toast.info(`Filled credentials for ${roleName}. Click Sign In!`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      const data = await login(formData);
      toast.success(`Welcome back, ${data.user?.name || 'User'}!`);
      navigate(from, { replace: true });
    } catch (err) {
      const errMsg = err.message || 'Login failed. Please verify email and password.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-panel animate-scale-up">
        {/* Header */}
        <div className="auth-card-header">
          <div className="auth-icon-circle pulse-glow">
            <ShoppingBag size={30} className="text-primary" />
          </div>
          <h2>Welcome Back</h2>
          <p className="text-muted">Sign in to access your orders, cart, and account</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Demo Accounts Quick Select */}
        <div className="demo-accounts-pill-row">
          <span className="demo-pill-label">
            <Sparkles size={14} className="text-accent" />
            <span>Quick Demo:</span>
          </span>
          <button
            type="button"
            onClick={() => fillDemoAccount('customer@example.com', 'password123', 'Customer')}
            className="demo-pill-btn"
          >
            Shopper
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('seller@example.com', 'password123', 'Seller')}
            className="demo-pill-btn"
          >
            Seller
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('admin@example.com', 'password123', 'Admin')}
            className="demo-pill-btn"
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                name="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className="form-input has-icon"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="password">Password</label>
            </div>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="form-input has-icon has-toggle"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-btn"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block btn-lg btn-glow-large"
          >
            {loading ? (
              <>
                <span className="spinner-sm" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In to Account</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-card-footer">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="text-link">
              Create an account
            </Link>
          </p>

          <div className="demo-credentials-box glass-panel">
            <div className="demo-box-header">
              <UserCheck size={14} className="text-primary" />
              <strong>Test Credentials Available</strong>
            </div>
            <div className="demo-creds-list">
              <div><code>customer@example.com</code> / <code>password123</code> (Shopper)</div>
              <div><code>seller@example.com</code> / <code>password123</code> (Merchant)</div>
              <div><code>admin@example.com</code> / <code>password123</code> (Admin)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
