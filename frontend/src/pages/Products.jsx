import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import API from '../services/api';
import { ProductCard } from './Home';
import { ProductCardSkeleton } from '../components/Skeletons';
import { SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, X, Star } from 'lucide-react';

const BRANDS = ['Sony', 'Fossil', 'Nike', 'Bellroy', 'Apple', 'Samsung', 'Adidas'];
const RATINGS = [4, 3, 2, 1];

function Products() {
  const location = useLocation();
  const navigate = useNavigate();

  // API State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters State
  const [keyword, setKeyword] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [ratings, setRatings] = useState('');
  const [sort, setSort] = useState('newest');

  // Mobile Filter Drawer Toggle
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Parse filters from URL on mount and query change
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setKeyword(params.get('keyword') || '');
    
    const catParam = params.get('category');
    setSelectedCategories(catParam ? catParam.split(',') : []);

    const brandParam = params.get('brand');
    setSelectedBrands(brandParam ? brandParam.split(',') : []);

    setMinPrice(params.get('minPrice') || '');
    setMaxPrice(params.get('maxPrice') || '');
    setRatings(params.get('ratings') || '');
    setSort(params.get('sort') || 'newest');
    setCurrentPage(Number(params.get('page')) || 1);
  }, [location.search]);

  // Load Categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get('/categories');
        if (data?.success) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.warn('Could not fetch categories for listing page filters');
      }
    };
    fetchCategories();
  }, []);

  // Fetch products based on state filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        
        if (keyword) params.append('keyword', keyword);
        if (selectedCategories.length > 0) params.append('category', selectedCategories.join(','));
        if (selectedBrands.length > 0) params.append('brand', selectedBrands.join(','));
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (ratings) params.append('ratings', ratings);
        if (sort) params.append('sort', sort);
        params.append('page', currentPage.toString());
        params.append('limit', '12');

        const { data } = await API.get(`/products?${params.toString()}`);
        if (data?.success) {
          setProducts(data.products);
          setTotalPages(data.totalPages || 1);
        }
      } catch (error) {
        console.warn('API error loading products, displaying mock fallbacks');
        // Render mock items if database connection has no active entries
        setProducts([
          { _id: 'prod1', name: 'AeroBuds Pro Max', brand: 'Sony', price: 149.99, discountPrice: 99.99, ratings: 4.8, numOfReviews: 24, images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' }] },
          { _id: 'prod2', name: 'Chrono Sport Watch', brand: 'Fossil', price: 249.99, discountPrice: 199.99, ratings: 4.6, numOfReviews: 18, images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' }] },
          { _id: 'prod3', name: 'Volt Sneakers V2', brand: 'Nike', price: 120.00, discountPrice: 0, ratings: 4.9, numOfReviews: 32, images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' }] },
          { _id: 'prod4', name: 'Sleek Leather Wallet', brand: 'Bellroy', price: 65.00, discountPrice: 49.99, ratings: 4.5, numOfReviews: 12, images: [{ url: 'https://images.unsplash.com/photo-1627124765135-56c607a97750?w=400' }] },
        ]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword, selectedCategories, selectedBrands, minPrice, maxPrice, ratings, sort, currentPage]);

  // Apply filters by push to URL search query
  const applyFilters = (newParams = {}) => {
    const params = new URLSearchParams();
    
    // Maintain current keyword
    if (keyword) params.append('keyword', keyword);

    // Apply Categories
    const cats = newParams.categories !== undefined ? newParams.categories : selectedCategories;
    if (cats.length > 0) params.append('category', cats.join(','));

    // Apply Brands
    const brs = newParams.brands !== undefined ? newParams.brands : selectedBrands;
    if (brs.length > 0) params.append('brand', brs.join(','));

    // Apply Price min/max
    const minP = newParams.minPrice !== undefined ? newParams.minPrice : minPrice;
    const maxP = newParams.maxPrice !== undefined ? newParams.maxPrice : maxPrice;
    if (minP) params.append('minPrice', minP);
    if (maxP) params.append('maxPrice', maxP);

    // Apply Ratings
    const rts = newParams.ratings !== undefined ? newParams.ratings : ratings;
    if (rts) params.append('ratings', rts);

    // Apply Sort
    const srt = newParams.sort !== undefined ? newParams.sort : sort;
    if (srt) params.append('sort', srt);

    // Reset to page 1 on filter edits
    params.append('page', '1');

    navigate(`/products?${params.toString()}`);
  };

  const handleCategoryChange = (catId) => {
    const updated = selectedCategories.includes(catId)
      ? selectedCategories.filter((id) => id !== catId)
      : [...selectedCategories, catId];
    setSelectedCategories(updated);
    applyFilters({ categories: updated });
  };

  const handleBrandChange = (brandName) => {
    const updated = selectedBrands.includes(brandName)
      ? selectedBrands.filter((b) => b !== brandName)
      : [...selectedBrands, brandName];
    setSelectedBrands(updated);
    applyFilters({ brands: updated });
  };

  const clearAllFilters = () => {
    navigate('/products');
    setFilterDrawerOpen(false);
  };

  const changePage = (pageNum) => {
    const params = new URLSearchParams(location.search);
    params.set('page', pageNum.toString());
    navigate(`/products?${params.toString()}`);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col lg:flex-row gap-8">
        
        {/* 1. FILTER SIDEBAR - DESKTOP */}
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
              <SlidersHorizontal size={18} />
              <span>Filters</span>
            </h3>
            <button
              onClick={clearAllFilters}
              className="text-xs text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
            >
              Clear All
            </button>
          </div>

          {/* Categories Filter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Categories</h4>
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <label key={cat._id} className="flex items-center gap-2.5 text-sm text-slate-350 hover:text-slate-100 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat._id)}
                    onChange={() => handleCategoryChange(cat._id)}
                    className="rounded border-slate-700 bg-slate-800 text-violet-600 focus:ring-violet-500/50 w-4 h-4"
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Price Range ($)</h4>
            <div className="flex gap-3">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                onBlur={() => applyFilters({ minPrice })}
                placeholder="Min"
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-slate-150 focus:outline-none"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onBlur={() => applyFilters({ maxPrice })}
                placeholder="Max"
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-slate-150 focus:outline-none"
              />
            </div>
          </div>

          {/* Brands Filter */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Brands</h4>
            <div className="space-y-2.5">
              {BRANDS.map((brand) => (
                <label key={brand} className="flex items-center gap-2.5 text-sm text-slate-350 hover:text-slate-100 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                    className="rounded border-slate-700 bg-slate-800 text-violet-600 focus:ring-violet-500/50 w-4 h-4"
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Ratings Filter */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Rating</h4>
            <div className="space-y-2">
              {RATINGS.map((rate) => (
                <label
                  key={rate}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border cursor-pointer select-none text-xs font-medium transition ${
                    ratings === rate.toString()
                      ? 'bg-violet-650/15 border-violet-500/35 text-violet-300'
                      : 'bg-slate-850/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                  onClick={() => {
                    const nextVal = ratings === rate.toString() ? '' : rate.toString();
                    setRatings(nextVal);
                    applyFilters({ ratings: nextVal });
                  }}
                >
                  <div className="flex items-center text-amber-400">
                    <Star size={11} fill="currentColor" />
                  </div>
                  <span>{rate}★ & Above</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* 2. PRODUCT LIST GRID & SEARCH HEADERS */}
        <section className="flex-1 flex flex-col space-y-6">
          
          {/* Top Actions: Total, Search status, Sort controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-850/30 p-4 border border-slate-800/80 rounded-2xl gap-4">
            <div>
              <p className="text-sm text-slate-400">
                {keyword ? (
                  <>Search results for "<span className="font-semibold text-slate-200">{keyword}</span>"</>
                ) : (
                  <>Showing products from all collections</>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setFilterDrawerOpen(true)}
                className="lg:hidden flex-1 flex items-center justify-center gap-1.5 py-2 px-4 bg-slate-800 border border-slate-700 text-sm font-semibold rounded-xl text-slate-350 cursor-pointer"
              >
                <SlidersHorizontal size={16} />
                <span>Filters</span>
              </button>

              {/* Sort selector */}
              <div className="relative flex-1 sm:flex-none">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <ArrowUpDown size={14} />
                </span>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    applyFilters({ sort: e.target.value });
                  }}
                  className="bg-slate-800 border border-slate-700/85 text-slate-200 text-xs py-2.5 pl-8 pr-8 rounded-xl focus:outline-none appearance-none cursor-pointer w-full"
                >
                  <option value="newest">Sort: Newest</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="ratings">Ratings</option>
                  <option value="reviews">Popularity</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-20 bg-slate-850/10 border border-dashed border-slate-800 rounded-3xl space-y-5">
              <div className="w-16 h-16 bg-slate-800 text-slate-500 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                📭
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-200">No Products Found</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1">
                  We couldn't find any products matching your search keywords or filter selections. Try clearing filters.
                </p>
              </div>
              <button
                onClick={clearAllFilters}
                className="bg-violet-650 hover:bg-violet-550 text-white font-bold py-2.5 px-6 rounded-xl transition cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-6">
              <button
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 bg-slate-800 border border-slate-700/60 rounded-lg text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-slate-450 font-bold">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 bg-slate-800 border border-slate-700/60 rounded-lg text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

        </section>
      </div>

      {/* 3. MOBILE FILTER DRAWER POPUP */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-sm">
          <div className="ml-auto w-80 max-w-full bg-slate-900 border-l border-slate-850 p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h3 className="font-bold text-lg text-slate-100">Filters</h3>
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  className="text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Categories</h4>
                <div className="space-y-2.5 max-h-40 overflow-y-auto">
                  {categories.map((cat) => (
                    <label key={cat._id} className="flex items-center gap-2.5 text-sm text-slate-355 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat._id)}
                        onChange={() => handleCategoryChange(cat._id)}
                        className="rounded bg-slate-800 border-slate-700 text-violet-650"
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Prices */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Price ($)</h4>
                <div className="flex gap-2.5">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    onBlur={() => applyFilters({ minPrice })}
                    placeholder="Min"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-100"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    onBlur={() => applyFilters({ maxPrice })}
                    placeholder="Max"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-100"
                  />
                </div>
              </div>

              {/* Brands */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Brands</h4>
                <div className="space-y-2.5">
                  {BRANDS.map((brand) => (
                    <label key={brand} className="flex items-center gap-2.5 text-sm text-slate-355 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleBrandChange(brand)}
                        className="rounded bg-slate-800 border-slate-700 text-violet-650"
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-8 flex flex-col gap-3">
              <button
                onClick={clearAllFilters}
                className="w-full bg-slate-800 border border-slate-700 py-3 rounded-xl text-slate-300 font-semibold cursor-pointer"
              >
                Clear All
              </button>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-650 py-3 rounded-xl text-white font-semibold cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default Products;
