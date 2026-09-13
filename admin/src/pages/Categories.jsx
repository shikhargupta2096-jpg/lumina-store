import React, { useEffect, useState } from 'react';
import { supabase, getImageUrl } from '../supabase';
import { mapCategoryFromDB } from '../utils/schemaMapper';
import { Link } from 'react-router-dom';
import { Plus, Edit3, Trash2, FolderOpen, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageWithSkeleton from '../components/ImageWithSkeleton';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('display_order');
      if (error) throw error;
      setCategories(data.map(mapCategoryFromDB));
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw error;
        toast.success('Category deleted');
        fetchCategories();
      } catch (error) {
        toast.error('Error deleting category');
      }
    }
  };

  if (loading) {
    return (
      <div className="page-transition">
        <header className="page-header">
          <div>
            <h1 className="page-title">Categories</h1>
            <p style={{color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px'}}>Loading catalog categories...</p>
          </div>
          <Link to="/categories/new" className="btn-primary" style={{pointerEvents: 'none', opacity: 0.5}}>
            <Plus size={18} /> Add Category
          </Link>
        </header>
        <div className="skeleton-grid">
          {[1, 2, 3].map(i => (
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

  return (
    <div className="page-transition">
      <header className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p style={{color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px'}}>Manage store departments and display tags.</p>
        </div>
        <Link to="/categories/new" className="btn-primary">
          <Plus size={18} /> Add Category
        </Link>
      </header>

      <div className="data-grid">
        {categories.map((cat, index) => (
          <div 
            key={cat.id} 
            className="data-card" 
            style={{
              animationDelay: `${index * 0.05}s`, 
              animation: 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both'
            }}
          >
            <div style={{position: 'relative', overflow: 'hidden'}}>
              {cat.img ? (
                <ImageWithSkeleton src={getImageUrl(cat.img)} alt={cat.name} className="data-card-img" />
              ) : (
                <div className="data-card-img" style={{backgroundColor: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <span style={{color: 'var(--text-muted)'}}><FolderOpen size={32} /></span>
                </div>
              )}
              {cat.tag && (
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
                  <Sparkles size={10} /> {cat.tag}
                </span>
              )}
            </div>
            
            <div className="data-card-content">
              <div style={{marginBottom: '12px'}}>
                <span style={{
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--gold)',
                  fontWeight: '700',
                  display: 'block',
                  marginBottom: '4px'
                }}>
                  {cat.categoryType}
                </span>
                <h3 className="data-card-title">{cat.name}</h3>
                <p style={{fontSize: '12.5px', color: 'var(--text-secondary)', minHeight: '38px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                  {cat.subtitle || cat.shortDesc || 'No description provided.'}
                </p>
              </div>
              
              <div className="data-card-actions" style={{gap: '8px'}}>
                <Link to={`/categories/edit/${cat.id}`} className="btn-secondary" style={{padding: '8px 12px'}}>
                  <Edit3 size={14} /> Edit
                </Link>
                <button onClick={() => handleDelete(cat.id)} className="btn-danger" style={{padding: '8px 12px'}}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {categories.length === 0 && (
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
            <p style={{color: 'var(--text-secondary)'}}>No categories found in the catalog.</p>
            <Link to="/categories/new" className="btn-primary">Create First Category</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
