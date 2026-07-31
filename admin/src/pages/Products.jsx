import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { Plus, Edit3, Trash2, PackageOpen, Sparkles, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageWithSkeleton from '../components/ImageWithSkeleton';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('all');

  const fetchData = async () => {
    try {
      // Fetch categories for mapping
      const catSnap = await getDocs(collection(db, 'categories'));
      const catMap = {};
      catSnap.forEach(doc => {
        catMap[doc.id] = doc.data().name;
      });
      setCategories(catMap);

      // Fetch products
      const prodSnap = await getDocs(collection(db, 'products'));
      const prods = [];
      prodSnap.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() });
      });
      setProducts(prods);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        toast.success('Product deleted');
        fetchData();
      } catch (error) {
        toast.error('Error deleting product');
      }
    }
  };

  if (loading) {
    return (
      <div className="page-transition">
        <header className="page-header">
          <div>
            <h1 className="page-title">Products</h1>
            <p style={{color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px'}}>Loading catalog inventory...</p>
          </div>
          <Link to="/products/new" className="btn-primary" style={{pointerEvents: 'none', opacity: 0.5}}>
            <Plus size={18} /> Add Product
          </Link>
        </header>
        <div style={{marginBottom: '32px'}}>
          <div className="skeleton" style={{width: '250px', height: '44px', borderRadius: 'var(--radius-sm)'}}></div>
        </div>
        <div className="skeleton-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton-card stagger-1">
              <div className="skeleton skeleton-img" />
              <div className="skeleton-body">
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-text" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const filteredProducts = filterCat === 'all' 
    ? products 
    : products.filter(p => p.categoryId === filterCat);

  return (
    <div className="page-transition">
      <header className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p style={{color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px'}}>Browse and manage luxury lighting items.</p>
        </div>
        <Link to="/products/new" className="btn-primary">
          <Plus size={18} /> Add Product
        </Link>
      </header>

      <div style={{marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px'}}>
        <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
          <span style={{position: 'absolute', left: '14px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center'}}>
            <Filter size={14} />
          </span>
          <select 
            className="form-control" 
            style={{width: '260px', paddingLeft: '38px'}} 
            value={filterCat} 
            onChange={(e) => setFilterCat(e.target.value)}
          >
            <option value="all">All Categories</option>
            {Object.entries(categories).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>
        <span style={{fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: '500'}}>
          Showing {filteredProducts.length} item{filteredProducts.length !== 1 && 's'}
        </span>
      </div>

      <div className="data-grid">
        {filteredProducts.map((prod, index) => (
          <div 
            key={prod.id} 
            className="data-card" 
            style={{
              animationDelay: `${index * 0.04}s`, 
              animation: 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both'
            }}
          >
            <div style={{position: 'relative', overflow: 'hidden'}}>
              {prod.img ? (
                <ImageWithSkeleton src={prod.img} alt={prod.name} blurSrc={prod.lqip} className="data-card-img" />
              ) : (
                <div className="data-card-img" style={{backgroundColor: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <span style={{color: 'var(--text-muted)'}}><PackageOpen size={32} /></span>
                </div>
              )}
              {prod.badge && (
                <span style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  fontSize: '11px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  color: 'var(--gold)',
                  fontWeight: '600',
                  border: '1px solid var(--gold-dim)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Sparkles size={10} /> {prod.badge}
                </span>
              )}
            </div>
            
            <div className="data-card-content">
              <div style={{marginBottom: '16px'}}>
                <span style={{
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-secondary)',
                  fontWeight: '700',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  {categories[prod.categoryId] || prod.categoryId}
                </span>
                <h3 className="data-card-title">{prod.name}</h3>
                
                {/* Visual specifications or tags */}
                {prod.tags && prod.tags.length > 0 && (
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px'}}>
                    {prod.tags.slice(0, 3).map((t, idx) => (
                      <span key={idx} style={{
                        fontSize: '9.5px',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                        padding: '2px 6px',
                        borderRadius: '3px'
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="data-card-actions" style={{gap: '8px'}}>
                <Link to={`/products/edit/${prod.id}`} className="btn-secondary" style={{padding: '8px 12px'}}>
                  <Edit3 size={14} /> Edit
                </Link>
                <button onClick={() => handleDelete(prod.id)} className="btn-danger" style={{padding: '8px 12px'}}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredProducts.length === 0 && (
          <div style={{
            padding: '64px 24px', 
            textAlign: 'center', 
            gridColumn: '1 / -1', 
            backgroundColor: 'var(--bg-card)', 
            borderRadius: 'var(--radius-lg)', 
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <p style={{color: 'var(--text-secondary)'}}>No products found in this category.</p>
            {filterCat !== 'all' && (
              <button onClick={() => setFilterCat('all')} className="btn-secondary">Clear Filter</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
