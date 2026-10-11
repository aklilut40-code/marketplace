import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as productApi from '../api/productApi';
import ProductCard from '../components/ProductCard';
import {
  Search,
  PackageX,
  Sparkles,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  X,
  Shield,
  Zap,
  TrendingUp,
} from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (activeCategory) params.category = activeCategory;

      const data = await productApi.getProducts(params);
      setProducts(data);

      // Extract unique categories from products
      const catsMap = new Map();
      data.forEach((p) => {
        if (p.category && typeof p.category === 'object' && p.category._id) {
          catsMap.set(p.category._id, p.category.name);
        }
      });
      if (catsMap.size > 0 && categories.length === 0) {
        setCategories(
          Array.from(catsMap.entries()).map(([id, name]) => ({ id, name }))
        );
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory, categories.length]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleClearSearch = () => {
    setSearch('');
  };

  // Filter & Sort client-side
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    if (inStockOnly) {
      result = result.filter((p) => p.quantity > 0);
    }

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, inStockOnly, sortBy]);

  return (
    <div className="page-container">
      {/* Modern Interactive Hero */}
      <section className="hero-banner modern-hero">
        <div className="hero-content">
          <div className="hero-tag">
            <Sparkles size={15} />
            <span>Curated Independent Market</span>
          </div>
          <h1 className="hero-title">
            Discover Quality Craftsmanship & Extraordinary Finds
          </h1>
          <p className="hero-subtitle">
            Support passionate creators, shop authentic pieces, and experience frictionless commerce.
          </p>

          <form onSubmit={handleSearchSubmit} className="hero-search-form">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search products by title, keyword, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="search-clear-btn"
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-glow">
              Explore
            </button>
          </form>

          {/* Interactive Feature Highlights */}
          <div className="hero-highlights">
            <div className="highlight-pill">
              <Shield size={14} className="highlight-icon" />
              <span>Buyer Protection</span>
            </div>
            <div className="highlight-pill">
              <Zap size={14} className="highlight-icon" />
              <span>Direct-from-Seller</span>
            </div>
            <div className="highlight-pill">
              <TrendingUp size={14} className="highlight-icon" />
              <span>Verified Reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Category Filter Bar */}
      {categories.length > 0 && (
        <div className="category-filter-bar">
          <button
            onClick={() => setActiveCategory('')}
            className={`category-pill ${activeCategory === '' ? 'active' : ''}`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`category-pill ${
                activeCategory === cat.id ? 'active' : ''
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Control Bar: Counts, In-Stock Filter & Sorting */}
      <div className="feed-controls-bar">
        <div className="feed-title-meta">
          <h2>
            {activeCategory
              ? `${
                  categories.find((c) => c.id === activeCategory)?.name ||
                  'Category'
                } Catalog`
              : search
              ? `Results for "${search}"`
              : 'Featured Marketplace'}
          </h2>
          <span className="feed-count-badge">
            {filteredAndSortedProducts.length} items available
          </span>
        </div>

        <div className="feed-actions">
          {/* In Stock Switch */}
          <label className="toggle-switch-label">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="toggle-checkbox"
            />
            <span className="toggle-track">
              <span className="toggle-thumb" />
            </span>
            <span className="toggle-text">In Stock Only</span>
          </label>

          {/* Sort Dropdown */}
          <div className="sort-wrapper">
            <ArrowUpDown size={15} className="sort-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Product Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="product-grid">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="skeleton-card">
              <div className="skeleton-image" />
              <div className="skeleton-line title" />
              <div className="skeleton-line desc" />
              <div className="skeleton-line price" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <p>{error}</p>
          <button onClick={fetchProducts} className="btn btn-sm btn-secondary">
            Retry
          </button>
        </div>
      ) : filteredAndSortedProducts.length === 0 ? (
        <div className="empty-state">
          <PackageX size={48} className="empty-icon" />
          <h3>No matching products</h3>
          <p>
            {inStockOnly
              ? 'There are no currently in-stock products matching your filters.'
              : 'Try searching with different keywords or switching category filters.'}
          </p>
          {(search || activeCategory || inStockOnly) && (
            <button
              onClick={() => {
                setSearch('');
                setActiveCategory('');
                setInStockOnly(false);
              }}
              className="btn btn-primary btn-sm"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="product-grid">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
