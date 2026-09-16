import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Image, Alert, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase, getImageUrl } from '../lib/supabase';
import { mapProductFromDB } from '../utils/schemaMapper';
import { Plus, PackageOpen, Filter } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import SwipeableRow from '../components/SwipeableRow';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import CustomPicker from '../components/CustomPicker';
import { Colors } from '../constants/theme';
import { useScrollHide } from '../hooks/useScrollHide';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProductsScreen() {
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { onScroll } = useScrollHide();
  const insets = useSafeAreaInsets();

  const fetchData = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        supabase.from('categories').select('id, name'),
        supabase.from('products').select(`*, categories(name)`).order('created_at', { ascending: false })
      ]);
      if (catRes.error) throw catRes.error;
      if (prodRes.error) throw prodRes.error;
      
      setCategories(catRes.data || []);
      setProducts(prodRes.data ? prodRes.data.map(mapProductFromDB) : []);
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleDelete = (id: string) => {
    Alert.alert('Delete Product', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            setProducts(prev => prev.filter(p => p.id !== id));
            Toast.show({ type: 'success', text1: 'Success', text2: 'Product deleted' });
          } catch (error) {
            console.error(error);
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to delete product' });
          }
        }
      }
    ]);
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.categoryId === selectedCategory);

  const renderItem = ({ item }: { item: any }) => (
    <SwipeableRow
      onEdit={() => navigation.navigate('ProductForm', { id: item.id })}
      onDelete={() => handleDelete(item.id)}
    >
      <TouchableOpacity 
        activeOpacity={0.7} 
        onPress={() => navigation.navigate('ProductForm', { id: item.id })}
      >
        <View style={styles.card}>
          <Image 
            source={{ uri: getImageUrl(item.img?.includes('/') ? item.img : `${item.categoryId}/${item.img}`) }} 
            style={styles.image} 
          />
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.category}>{item.categoryId}</Text>
            {item.badge !== 'None' && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </SwipeableRow>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <CustomPicker
          value={selectedCategory}
          onChange={setSelectedCategory}
          options={[
            { value: 'all', label: 'All Categories' },
            ...categories.map(c => ({ value: c.id, label: c.name }))
          ]}
          placeholder="Filter by category"
          customTrigger={
            <View style={styles.filterFab}>
              <Filter size={24} color={selectedCategory === 'all' ? '#a3a3a3' : '#c8a96e'} />
            </View>
          }
        />
      </View>

      {loading ? (
        <View style={{ padding: 16, paddingTop: Math.max(insets.top + 16, 16), gap: 16 }}>
           <SkeletonLoader width="100%" height={100} borderRadius={12} />
           <SkeletonLoader width="100%" height={100} borderRadius={12} />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingTop: Math.max(insets.top + 16, 16), paddingBottom: 120 }}
          onScroll={onScroll}
          scrollEventThrottle={16}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#c8a96e" />}
          ListEmptyComponent={<EmptyState icon={<PackageOpen size={32} color="#6b6980" />} message="No products found in this category." />}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        />
      )}

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('ProductForm')}
      >
        <Plus color="#0A0A0B" size={28} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0B' },
  filterContainer: { 
    position: 'absolute', 
    bottom: 176, 
    right: 24, 
    zIndex: 10,
  },
  filterFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E2028',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(200,169,110,0.15)',
  },
  card: { backgroundColor: '#161820', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(200,169,110,0.15)', flexDirection: 'row', overflow: 'hidden' },
  image: { width: 100, height: 100, backgroundColor: '#1E2028' },
  info: { flex: 1, padding: 12, justifyContent: 'center' },
  name: { fontFamily: 'Rajdhani', fontSize: 18, color: '#F5F5F5', fontWeight: 'bold' },
  category: { fontFamily: 'Inter', fontSize: 14, color: '#a3a3a3', marginTop: 4 },
  badgeContainer: { alignSelf: 'flex-start', marginTop: 8, backgroundColor: 'rgba(200,169,110,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { color: '#c8a96e', fontSize: 12, fontFamily: 'Inter' },
  fab: { position: 'absolute', bottom: 100, right: 24, width: 64, height: 64, borderRadius: 32, backgroundColor: '#c8a96e', alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#c8a96e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }
});
