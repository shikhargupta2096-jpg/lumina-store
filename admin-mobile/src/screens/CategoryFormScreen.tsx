import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { supabase, getImageUrl } from '../lib/supabase';
import { mapCategoryFromDB, mapCategoryToDB } from '../utils/schemaMapper';
import Toast from 'react-native-toast-message';
import ImagePickerCrop from '../components/ImagePickerCrop';
import CustomPicker from '../components/CustomPicker';
import { decodeBase64ToArrayBuffer } from '../utils/imageOptimizer';

export default function CategoryFormScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const id = route.params?.id;
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    subtitle: '',
    shortDesc: '',
    longDesc: '',
    categoryType: 'Indoor Collection',
    tag: '',
    displayOrder: '0',
    image: null as any
  });

  useEffect(() => {
    if (isEdit) fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('categories').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) {
        const mapped = mapCategoryFromDB(data);
        setFormData({
          id: mapped.id || '',
          name: mapped.name || '',
          subtitle: mapped.subtitle || '',
          shortDesc: mapped.shortDesc || '',
          longDesc: mapped.longDesc || '',
          categoryType: mapped.categoryType || 'Indoor Collection',
          tag: mapped.tag || '',
          displayOrder: (mapped.displayOrder || 0).toString(),
          image: mapped.img ? { uri: getImageUrl(mapped.img) } : null
        });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load category' });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.categoryType) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Name and Category Type are required' });
      return;
    }
    
    try {
      setSaving(true);
      
      let imageUrl = typeof formData.image === 'string' ? formData.image : (formData.image?.uri || '');
      
      // If it's a local file URI with base64 data (from image picker)
      if (formData.image && formData.image.base64) {
        const fileName = `categories/${Date.now()}.webp`;
        
        // Convert base64 straight to ArrayBuffer for robust Supabase upload
        const arrayBuffer = decodeBase64ToArrayBuffer(formData.image.base64);
        
        const { error: uploadError } = await supabase.storage.from('media').upload(fileName, arrayBuffer, {
          contentType: 'image/webp'
        });
        if (uploadError) throw uploadError;
        imageUrl = fileName;
      }

      const payload = mapCategoryToDB({
        ...formData,
        displayOrder: parseInt(formData.displayOrder) || 0,
        img: imageUrl
      });

      if (isEdit) {
        const { error } = await supabase.from('categories').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert(payload);
        if (error) throw error;
      }

      Toast.show({ type: 'success', text1: 'Success', text2: 'Category saved' });
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
        <Text style={styles.headerTitle}>{isEdit ? 'Edit Category' : 'New Category'}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <View style={styles.field}>
          <Text style={styles.label}>Image (16:9)</Text>
          <ImagePickerCrop 
            aspectRatio={16/9} 
            value={formData.image}
            onChange={(img) => setFormData(prev => ({ ...prev, image: img }))}
          />
        </View>

        {!isEdit && (
          <View style={styles.field}>
            <Text style={styles.label}>ID (slug)</Text>
            <TextInput style={styles.input} value={formData.id} onChangeText={v => setFormData(prev => ({...prev, id: v}))} placeholder="e.g. table-lamps" placeholderTextColor="#6b6980" />
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={formData.name} onChangeText={v => setFormData(prev => ({...prev, name: v}))} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Subtitle</Text>
          <TextInput style={styles.input} value={formData.subtitle} onChangeText={v => setFormData(prev => ({...prev, subtitle: v}))} />
        </View>
        
        <View style={styles.field}>
          <Text style={styles.label}>Category Type</Text>
          <CustomPicker 
            value={formData.categoryType}
            onChange={v => setFormData(prev => ({...prev, categoryType: v}))}
            options={[{label: 'Indoor Collection', value: 'Indoor Collection'}, {label: 'Outdoor Collection', value: 'Outdoor Collection'}]}
          />
        </View>
        
        <View style={styles.field}>
          <Text style={styles.label}>Tag</Text>
          <TextInput style={styles.input} value={formData.tag} onChangeText={v => setFormData(prev => ({...prev, tag: v}))} />
        </View>
        
        <View style={styles.field}>
          <Text style={styles.label}>Display Order</Text>
          <TextInput style={styles.input} value={formData.displayOrder} onChangeText={v => setFormData(prev => ({...prev, displayOrder: v}))} keyboardType="numeric" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Short Description</Text>
          <TextInput style={[styles.input, styles.textArea]} value={formData.shortDesc} onChangeText={v => setFormData(prev => ({...prev, shortDesc: v}))} multiline numberOfLines={3} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Long Description</Text>
          <TextInput style={[styles.input, styles.textArea]} value={formData.longDesc} onChangeText={v => setFormData(prev => ({...prev, longDesc: v}))} multiline numberOfLines={5} />
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
  saveText: { color: '#0A0A0B', fontFamily: 'Inter', fontSize: 16, fontWeight: 'bold' }
});
