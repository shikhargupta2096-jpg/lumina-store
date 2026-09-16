import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Check } from 'lucide-react-native';
import { supabase, getImageUrl } from '../lib/supabase';
import { mapProductFromDB, mapProductToDB } from '../utils/schemaMapper';
import Toast from 'react-native-toast-message';
import ImagePickerCrop from '../components/ImagePickerCrop';
import CustomPicker from '../components/CustomPicker';
import ChipInput from '../components/ChipInput';
import { decodeBase64ToArrayBuffer } from '../utils/imageOptimizer';

const BADGE_OPTIONS = ['None', 'New Arrival', 'Bestseller', 'Premium'];
const LIGHTING_OPTIONS = ['Cool White', 'Warm White', 'Yellow', 'RGB'];

export default function ProductFormScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const id = route.params?.id;
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    categoryId: '',
    badge: 'None',
    description: '',
    tags: [] as string[],
    specs: [] as string[],
    lightingVariants: [] as string[],
    image: null as any
  });

  useEffect(() => {
    fetchCategories();
    if (isEdit) fetchProduct();
  }, [id]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name');
    if (data) setCategories(data);
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) {
        const mapped = mapProductFromDB(data);
        const imgPath = mapped.img ? (mapped.img.includes('/') ? mapped.img : `${mapped.categoryId}/${mapped.img}`) : '';
        setFormData({
          id: mapped.id || '',
          name: mapped.name || '',
          categoryId: mapped.categoryId || '',
          badge: mapped.badge || 'None',
          description: mapped.description || '',
          tags: mapped.tags || [],
          specs: mapped.specs || [],
          lightingVariants: mapped.lightingVariants || [],
          image: imgPath ? { uri: getImageUrl(imgPath) } : null
        });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load product' });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const toggleLightingVariant = (variant: string) => {
    setFormData(prev => ({
      ...prev,
      lightingVariants: prev.lightingVariants.includes(variant)
        ? prev.lightingVariants.filter(v => v !== variant)
        : [...prev.lightingVariants, variant]
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.categoryId) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Name and Category are required' });
      return;
    }
    
    try {
      setSaving(true);
      
      let imageUrl = typeof formData.image === 'string' ? formData.image : (formData.image?.uri || '');
      let lqip = '';
      
      if (formData.image && formData.image.base64) {
        const fileName = `products/${Date.now()}.webp`;
        
        const arrayBuffer = decodeBase64ToArrayBuffer(formData.image.base64);
        
        const { error: uploadError } = await supabase.storage.from('media').upload(fileName, arrayBuffer, {
          contentType: 'image/webp'
        });
        if (uploadError) throw uploadError;
        imageUrl = fileName;
        // Basic fallback for LQIP on mobile
        lqip = 'data:image/webp;base64,...'; 
      }

      const payload = mapProductToDB({
        ...formData,
        img: imageUrl,
        lqip
      });

      if (isEdit) {
        const { error } = await supabase.from('products').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
      }

      Toast.show({ type: 'success', text1: 'Success', text2: 'Product saved' });
      navigation.goBack();
    } catch (error: any) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Error', text2: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#c8a96e" /></View>;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#F5F5F5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'Edit Product' : 'New Product'}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <View style={styles.field}>
          <Text style={styles.label}>Image (1:1)</Text>
          <ImagePickerCrop 
            aspectRatio={1} 
            value={formData.image}
            onChange={(img) => setFormData(prev => ({ ...prev, image: img }))}
          />
        </View>

        {!isEdit && (
          <View style={styles.field}>
            <Text style={styles.label}>ID (slug)</Text>
            <TextInput style={styles.input} value={formData.id} onChangeText={v => setFormData(prev => ({...prev, id: v}))} placeholder="e.g. crystal-chandelier" placeholderTextColor="#6b6980" />
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={formData.name} onChangeText={v => setFormData(prev => ({...prev, name: v}))} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          <CustomPicker 
            value={formData.categoryId}
            onChange={v => setFormData(prev => ({...prev, categoryId: v}))}
            options={categories.map(c => ({ label: c.name, value: c.id }))}
            placeholder="Select a category"
          />
        </View>
        
        <View style={styles.field}>
          <Text style={styles.label}>Badge</Text>
          <CustomPicker 
            value={formData.badge}
            onChange={v => setFormData(prev => ({...prev, badge: v}))}
            options={BADGE_OPTIONS.map(b => ({ label: b, value: b }))}
          />
        </View>
        
        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, styles.textArea]} value={formData.description} onChangeText={v => setFormData(prev => ({...prev, description: v}))} multiline numberOfLines={4} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Tags</Text>
          <ChipInput items={formData.tags} onChange={tags => setFormData(prev => ({...prev, tags}))} placeholder="Add tag..." />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Specifications (e.g. 220V)</Text>
          <ChipInput items={formData.specs} onChange={specs => setFormData(prev => ({...prev, specs}))} placeholder="Add spec..." />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Lighting Variants</Text>
          <View style={styles.checkboxGroup}>
            {LIGHTING_OPTIONS.map(opt => (
              <TouchableOpacity key={opt} style={styles.checkbox} onPress={() => toggleLightingVariant(opt)}>
                <View style={[styles.checkSquare, formData.lightingVariants.includes(opt) && styles.checkSquareActive]}>
                  {formData.lightingVariants.includes(opt) && <Check size={14} color="#0A0A0B" />}
                </View>
                <Text style={styles.checkboxText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.floatingActionContainer}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} disabled={saving}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#0A0A0B" /> : <Text style={styles.saveText}>Save</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0B' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16, backgroundColor: '#161820', borderBottomWidth: 1, borderBottomColor: 'rgba(200,169,110,0.15)' },
  backButton: { marginRight: 16, padding: 4 },
  headerTitle: { fontFamily: 'Rajdhani', fontSize: 20, color: '#F5F5F5', fontWeight: 'bold' },
  scroll: { padding: 16, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0B' },
  field: { marginBottom: 16 },
  label: { fontFamily: 'Inter', fontSize: 14, color: '#a3a3a3', marginBottom: 8 },
  input: { backgroundColor: '#1E2028', borderWidth: 1, borderColor: 'rgba(200,169,110,0.15)', borderRadius: 8, padding: 12, color: '#F5F5F5', fontFamily: 'Inter' },
  textArea: { height: 100, textAlignVertical: 'top' },
  floatingActionContainer: { position: 'absolute', bottom: 20, left: 20, right: 20, flexDirection: 'row', gap: 12, zIndex: 10 },
  cancelBtn: { flex: 1, backgroundColor: '#1E2028', padding: 16, borderRadius: 32, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(200,169,110,0.3)' },
  cancelText: { color: '#F5F5F5', fontFamily: 'Inter', fontSize: 16, fontWeight: 'bold' },
  saveBtn: { flex: 1, backgroundColor: '#c8a96e', padding: 16, borderRadius: 32, alignItems: 'center' },
  saveText: { color: '#0A0A0B', fontFamily: 'Inter', fontSize: 16, fontWeight: 'bold' },
  checkboxGroup: { gap: 12 },
  checkbox: { flexDirection: 'row', alignItems: 'center' },
  checkSquare: { width: 24, height: 24, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(200,169,110,0.4)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  checkSquareActive: { backgroundColor: '#c8a96e', borderColor: '#c8a96e' },
  checkboxText: { color: '#F5F5F5', fontFamily: 'Inter', fontSize: 14 }
});
