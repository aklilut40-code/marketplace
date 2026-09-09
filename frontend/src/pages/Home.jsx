import React, { useState, useEffect, useCallback } from 'react';
import * as productApi from '../api/productApi';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, PackageX, Sparkles } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [categories, setCategories] = useState([]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (activeCategory) params.category = activeCategory;

      const data = await productApi.getProducts(params);
      setProducts(data);

      // Extract unique categories from products if not already loaded
      const catsMap = new Map();
      data.forEach((p) => {
        if (p.category && typeof p.category === 'object' && p.category._id) {
          catsMap.set(p.category._id, p.category.name);
        }
      });
      if (catsMap.size > 0 && categories.length === 0) {
        setCategories(Array.from(catsMap.entries()).map(([id, name]) => ({ id, name })));
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

  return (
    <div className="page-container">
      <section className="hero-banner">
        <div className="hero-content">
          <div className="hero-tag">
            <Sparkles size={16} />
            <span>Discover Handcrafted & Verified Products</span>
          </div>
          <h1 className="hero-title">
            The Modern Marketplace for Creators & Shoppers
          </h1>
          <p className="hero-subtitle">
            Explore curated collections from verified independent sellers worldwide.
          </p>

          <form onSubmit={handleSearchSubmit} className="hero-search-form">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search products by title or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Categories Filter Tabs */}
      {categories.length > 0 && (
        <div className="category-filter-bar">
          <button
            onClick={() => setActiveCategory('')}
            className={`category-pill ${activeCategory === '' ? 'active' : ''}`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`category-pill ${activeCategory === cat.id ? 'active' : ''}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Main Feed Content */}
      <div className="feed-header">
        <h2>
          {activeCategory
            ? `${categories.find((c) => c.id === activeCategory)?.name || 'Filtered'} Products`
            : search
            ? `Search results for "${search}"`
            : 'All Marketplace Listings'}
        </h2>
        <span className="feed-count">{products.length} items found</span>
      </div>

      {loading ? (
        <div className="flex-center feed-loading">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <p>{error}</p>
          <button onClick={fetchProducts} className="btn btn-sm btn-secondary">
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <PackageX size={48} className="empty-icon" />
          <h3>No products found</h3>
          <p>Try refining your search terms or clearing the category filter.</p>
          {(search || activeCategory) && (
            <button
              onClick={() => {
                setSearch('');
                setActiveCategory('');
              }}
              className="btn btn-secondary"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;

