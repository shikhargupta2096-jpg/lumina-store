import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase, getImageUrl } from '../supabase';
import { mapCategoryFromDB, mapCategoryToDB } from '../utils/schemaMapper';
import ImageCropper from '../components/ImageCropper';
import { optimizeImage } from '../utils/imageOptimizer';
import toast from 'react-hot-toast';
import { Save, X, Upload, ArrowLeft } from 'lucide-react';

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    subtitle: '',
    shortDesc: '',
    longDesc: '',
    categoryType: 'Indoor Collection',
    tag: '',
    img: '',
    displayOrder: 0
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [imageToCrop, setImageToCrop] = useState(null);
  const [croppedBlob, setCroppedBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchCategory = async () => {
        try {
          const { data, error } = await supabase.from('categories').select('*').eq('id', id).single();
          if (error) throw error;
          if (data) {
            const mapped = mapCategoryFromDB(data);
            setFormData(mapped);
            setPreviewUrl(getImageUrl(mapped.img) || '');
          } else {
            toast.error("Category not found");
            navigate('/categories');
          }
        } catch (error) {
          toast.error("Error fetching category");
        } finally {
          setLoading(false);
        }
      };
      fetchCategory();
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (blob) => {
    setCroppedBlob(blob);
    setPreviewUrl(URL.createObjectURL(blob));
    setImageToCrop(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let relativePath = formData.img;
      
      if (croppedBlob) {
        // Optimize: resize to 1200px, convert to WebP
        const { optimizedBlob } = await optimizeImage(croppedBlob);

        const filename = `categories/${Date.now()}.webp`;
        const { error: uploadError } = await supabase.storage.from('media').upload(filename, optimizedBlob);
        if (uploadError) throw uploadError;
        relativePath = filename;
      }

      const clientData = {
        ...formData,
        img: relativePath
      };

      const dbData = mapCategoryToDB(clientData);

      if (isEdit) {
        const { error } = await supabase.from('categories').update(dbData).eq('id', id);
        if (error) throw error;
        toast.success('Category updated successfully');
      } else {
        const { error } = await supabase.from('categories').insert(dbData);
        if (error) throw error;
        toast.success('Category created successfully');
      }
      navigate('/categories');
    } catch (error) {
      console.error(error);
      toast.error('Error saving category');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-transition">
        <header className="page-header">
          <h1 className="page-title">Loading Details...</h1>
        </header>
        <div className="skeleton form-container-styled" style={{height: '560px'}}></div>
      </div>
    );
  }

  return (
    <div style={{maxWidth: '720px', margin: '0 auto'}} className="page-transition">
      <header className="page-header">
        <div>
          <button type="button" onClick={() => navigate('/categories')} style={{
            display: 'flex', alignItems: 'center', gap: '6px', 
            color: 'var(--text-secondary)', fontSize: '13px', 
            fontWeight: '600', marginBottom: '8px', cursor: 'pointer'
          }}>
            <ArrowLeft size={14} /> Back to list
          </button>
          <h1 className="page-title">{isEdit ? 'Edit Category' : 'New Category'}</h1>
        </div>
        <button type="button" onClick={() => navigate('/categories')} className="btn-secondary">
          <X size={16} /> Cancel
        </button>
      </header>

      <form onSubmit={handleSubmit} className="form-container-styled">
        {!isEdit && (
          <div className="form-group">
            <label className="form-label">Category ID (e.g. chandeliers)</label>
            <input 
              type="text" name="id" className="form-control mono" 
              value={formData.id} onChange={handleChange} required 
              placeholder="unique-category-id"
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Name</label>
          <input 
            type="text" name="name" className="form-control" 
            value={formData.name} onChange={handleChange} required 
            placeholder="Category Name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Subtitle</label>
          <input 
            type="text" name="subtitle" className="form-control" 
            value={formData.subtitle || ''} onChange={handleChange} 
            placeholder="Optional descriptive subtitle"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Short Description</label>
          <textarea 
            name="shortDesc" className="form-control" rows="2"
            value={formData.shortDesc || ''} onChange={handleChange} 
            placeholder="Brief introduction displayed on card widgets"
          ></textarea>
        </div>

        <div className="form-group">
          <label className="form-label">Long Description</label>
          <textarea 
            name="longDesc" className="form-control" rows="4"
            value={formData.longDesc || ''} onChange={handleChange} 
            placeholder="Detailed editorial copy for the category collection page"
          ></textarea>
        </div>

        <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap'}}>
          <div className="form-group" style={{flex: '1 1 200px'}}>
            <label className="form-label">Category Type</label>
            <select name="categoryType" className="form-control" value={formData.categoryType} onChange={handleChange}>
              <option value="Indoor Collection">Indoor Collection</option>
              <option value="Outdoor Collection">Outdoor Collection</option>
            </select>
          </div>
          
          <div className="form-group" style={{flex: '1 1 200px'}}>
            <label className="form-label">Display Tag</label>
            <input 
              type="text" name="tag" className="form-control" placeholder="e.g. Statement Piece, Bestseller"
              value={formData.tag || ''} onChange={handleChange} 
            />
          </div>

          <div className="form-group" style={{flex: '1 1 100px'}}>
            <label className="form-label">Display Order</label>
            <input 
              type="number" name="displayOrder" className="form-control" 
              value={formData.displayOrder || 0} onChange={handleChange} 
            />
          </div>
        </div>

        <div className="form-group" style={{marginTop: '20px'}}>
          <label className="form-label">Category Banner Image (16:9 Ratio)</label>
          <div style={{
            border: '2px dashed var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: 'var(--bg-secondary)',
            transition: 'all 0.25s ease',
            position: 'relative',
            minHeight: '160px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }} className="upload-dropzone">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                opacity: 0, cursor: 'pointer', zIndex: 5
              }}
            />
            {previewUrl ? (
              <div style={{width: '100%'}}>
                <img src={previewUrl} alt="Preview" style={{maxHeight: '280px', width: '100%', borderRadius: 'var(--radius-sm)', objectFit: 'cover'}} />
                <p style={{fontSize: '12px', color: 'var(--text-secondary)', marginTop: '12px'}}>Click or drag image here to replace</p>
              </div>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)'}}>
                <Upload size={28} style={{color: 'var(--gold)'}} />
                <p style={{fontSize: '13px', fontWeight: '600'}}>Select banner file</p>
                <p style={{fontSize: '11px', color: 'var(--text-muted)'}}>Drag & drop image here (16:9 recommended)</p>
              </div>
            )}
          </div>
        </div>

        <div style={{marginTop: '40px', display: 'flex', justifyContent: 'flex-end'}}>
          <button type="submit" className="btn-primary" disabled={saving} style={{padding: '12px 24px'}}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Category'}
          </button>
        </div>
      </form>

      {imageToCrop && (
        <ImageCropper 
          imageSrc={imageToCrop} 
          aspectRatio={16/9} 
          onCropComplete={handleCropComplete}
          onCancel={() => setImageToCrop(null)}
        />
      )}
    </div>
  );
};

export default CategoryForm;
