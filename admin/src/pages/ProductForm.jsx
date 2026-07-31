import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import ImageCropper from '../components/ImageCropper';
import ChipInput from '../components/ChipInput';
import { optimizeImage } from '../utils/imageOptimizer';
import toast from 'react-hot-toast';
import { Save, X, Upload, ArrowLeft } from 'lucide-react';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    desc: '',
    badge: '',
    badgeClass: '',
    tags: [],
    specs: [],
    lightingVariants: [],
    img: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [imageToCrop, setImageToCrop] = useState(null);
  const [croppedBlob, setCroppedBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const LIGHTING_OPTIONS = ['Cool White', 'Warm White', 'Yellow'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catSnap = await getDocs(collection(db, 'categories'));
        const cats = [];
        catSnap.forEach(doc => cats.push({ id: doc.id, name: doc.data().name }));
        setCategories(cats);

        if (isEdit) {
          const docRef = doc(db, 'products', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setFormData(docSnap.data());
            setPreviewUrl(docSnap.data().img || '');
          } else {
            toast.error("Product not found");
            navigate('/products');
          }
        }
      } catch (error) {
        toast.error("Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'badge') {
      let badgeClass = '';
      if (value === 'New Arrival') badgeClass = 'new';
      else if (value === 'Premium') badgeClass = 'premium';
      setFormData(prev => ({ ...prev, badge: value, badgeClass }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLightingChange = (option) => {
    setFormData(prev => {
      const current = prev.lightingVariants || [];
      if (current.includes(option)) {
        return { ...prev, lightingVariants: current.filter(o => o !== option) };
      } else {
        return { ...prev, lightingVariants: [...current, option] };
      }
    });
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
    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }
    
    setSaving(true);
    try {
      let imgUrl = formData.img;
      let lqip = formData.lqip || '';
      
      if (croppedBlob) {
        // Optimize: resize to 1200px, convert to WebP, generate blur placeholder
        const { optimizedBlob, lqip: blurDataUri } = await optimizeImage(croppedBlob);
        lqip = blurDataUri;

        const filename = `products/${Date.now()}.webp`;
        const storageRef = ref(storage, filename);
        await uploadBytes(storageRef, optimizedBlob);
        imgUrl = await getDownloadURL(storageRef);
      }

      const productData = {
        ...formData,
        img: imgUrl,
        lqip,
        updatedAt: new Date()
      };

      if (isEdit) {
        await updateDoc(doc(db, 'products', id), productData);
        toast.success('Product updated successfully');
      } else {
        productData.createdAt = new Date();
        await addDoc(collection(db, 'products'), productData);
        toast.success('Product created successfully');
      }
      navigate('/products');
    } catch (error) {
      console.error(error);
      toast.error('Error saving product');
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
        <div className="skeleton form-container-styled" style={{height: '600px'}}></div>
      </div>
    );
  }

  return (
    <div style={{maxWidth: '720px', margin: '0 auto'}} className="page-transition">
      <header className="page-header">
        <div>
          <button type="button" onClick={() => navigate('/products')} style={{
            display: 'flex', alignItems: 'center', gap: '6px', 
            color: 'var(--text-secondary)', fontSize: '13px', 
            fontWeight: '600', marginBottom: '8px', cursor: 'pointer'
          }}>
            <ArrowLeft size={14} /> Back to list
          </button>
          <h1 className="page-title">{isEdit ? 'Edit Product' : 'New Product'}</h1>
        </div>
        <button type="button" onClick={() => navigate('/products')} className="btn-secondary">
          <X size={16} /> Cancel
        </button>
      </header>

      <form onSubmit={handleSubmit} className="form-container-styled">
        <div className="form-group">
          <label className="form-label">Product Name</label>
          <input 
            type="text" name="name" className="form-control" 
            value={formData.name} onChange={handleChange} required 
            placeholder="Product Name"
          />
        </div>

        <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap'}}>
          <div className="form-group" style={{flex: '1 1 200px'}}>
            <label className="form-label">Category</label>
            <select name="categoryId" className="form-control" value={formData.categoryId} onChange={handleChange} required>
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group" style={{flex: '1 1 200px'}}>
            <label className="form-label">Display Badge</label>
            <select name="badge" className="form-control" value={formData.badge} onChange={handleChange}>
              <option value="">None</option>
              <option value="New Arrival">New Arrival</option>
              <option value="Bestseller">Bestseller</option>
              <option value="Premium">Premium</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea 
            name="desc" className="form-control" rows="4"
            value={formData.desc} onChange={handleChange} required
            placeholder="Product details and visual features..."
          ></textarea>
        </div>

        <ChipInput 
          label="Tags" 
          items={formData.tags || []} 
          onChange={(tags) => setFormData(prev => ({...prev, tags}))} 
          placeholder="e.g. Crystal, Gold Frame, Living Room"
        />

        <ChipInput 
          label="Specifications" 
          items={formData.specs || []} 
          onChange={(specs) => setFormData(prev => ({...prev, specs}))} 
          placeholder="e.g. Height: 60cm, G9 LED Base, K9 Crystals"
        />

        <div className="form-group" style={{marginTop: '24px'}}>
          <label className="form-label">Lighting Options</label>
          <div style={{display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '12px'}}>
            {LIGHTING_OPTIONS.map(opt => (
              <label key={opt} style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                <input 
                  type="checkbox" 
                  checked={(formData.lightingVariants || []).includes(opt)}
                  onChange={() => handleLightingChange(opt)}
                  style={{
                    accentColor: 'var(--gold)',
                    width: '16px', height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{fontSize: '13.5px', color: 'var(--text-primary)', userSelect: 'none'}}>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group" style={{marginTop: '24px'}}>
          <label className="form-label">Product Showcase Image (1:1 Ratio)</label>
          <div style={{
            border: '2px dashed var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: 'var(--bg-secondary)',
            transition: 'all 0.25s ease',
            position: 'relative',
            minHeight: '200px',
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
              <div>
                <img src={previewUrl} alt="Preview" style={{maxHeight: '240px', maxWidth: '240px', borderRadius: 'var(--radius-sm)', objectFit: 'cover'}} />
                <p style={{fontSize: '12px', color: 'var(--text-secondary)', marginTop: '12px'}}>Click or drag image here to replace</p>
              </div>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)'}}>
                <Upload size={28} style={{color: 'var(--gold)'}} />
                <p style={{fontSize: '13px', fontWeight: '600'}}>Select image file</p>
                <p style={{fontSize: '11px', color: 'var(--text-muted)'}}>Drag & drop image here (1:1 square recommended)</p>
              </div>
            )}
          </div>
        </div>

        <div style={{marginTop: '40px', display: 'flex', justifyContent: 'flex-end'}}>
          <button type="submit" className="btn-primary" disabled={saving} style={{padding: '12px 24px'}}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>

      {imageToCrop && (
        <ImageCropper 
          imageSrc={imageToCrop} 
          aspectRatio={1} 
          onCropComplete={handleCropComplete}
          onCancel={() => setImageToCrop(null)}
        />
      )}
    </div>
  );
};

export default ProductForm;
