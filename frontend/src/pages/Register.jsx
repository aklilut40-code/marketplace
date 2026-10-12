import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/useToast';
import {
  UserPlus,
  ShoppingBag,
  AlertCircle,
  Eye,
  EyeOff,
  Store,
  User,
  Lock,
  Mail,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData({ ...formData, role: selectedRole });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError('Password must contain at least 6 characters');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await register(formData);
      toast.success(`Account created! Welcome, ${formData.name}`);
      navigate('/');
    } catch (err) {
      const msg = err.message || 'Registration failed. Please check your information.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Simple visual password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: '' };
    if (pwd.length < 6) return { score: 1, text: 'Too short (min 6 chars)', color: 'var(--danger)' };
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) {
      return { score: 3, text: 'Strong password', color: 'var(--success)' };
    }
    return { score: 2, text: 'Good password', color: 'var(--warning)' };
  };

  const strength = getPasswordStrength(formData.password);

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-panel animate-scale-up">
        {/* Header */}
        <div className="auth-card-header">
          <div className="auth-icon-circle pulse-glow">
            <UserPlus size={30} className="text-primary" />
          </div>
          <h2>Join MarketPulse</h2>
          <p className="text-muted">Create your personal shopping or seller account</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Account Role Selector Cards */}
          <div className="role-selector-container">
            <label className="role-selector-label">I want to join as a:</label>
            <div className="role-cards-grid">
              <div
                onClick={() => handleRoleSelect('customer')}
                className={`role-card ${formData.role === 'customer' ? 'selected' : ''}`}
                role="button"
                tabIndex={0}
              >
                <div className="role-card-icon">
                  <ShoppingBag size={20} />
                </div>
                <div className="role-card-text">
                  <strong>Shopper</strong>
                  <span>Browse items & buy products</span>
                </div>
                {formData.role === 'customer' && (
                  <CheckCircle2 size={16} className="role-check-icon text-primary" />
                )}
              </div>

              <div
                onClick={() => handleRoleSelect('seller')}
                className={`role-card ${formData.role === 'seller' ? 'selected' : ''}`}
                role="button"
                tabIndex={0}
              >
                <div className="role-card-icon">
                  <Store size={20} />
                </div>
                <div className="role-card-text">
                  <strong>Merchant</strong>
                  <span>List products & sell online</span>
                </div>
                {formData.role === 'seller' && (
                  <CheckCircle2 size={16} className="role-check-icon text-primary" />
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                id="name"
                type="text"
                name="name"
                required
                placeholder="e.g. Jane Doe"
                value={formData.name}
                onChange={handleChange}
                className="form-input has-icon"
              />
            </div>
          </div>

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
              {formData.password && (
                <span className="password-strength-hint" style={{ color: strength.color }}>
                  {strength.text}
                </span>
              )}
            </div>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Create Free Account</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-card-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="text-link">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
