import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Image, Alert, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase, getImageUrl } from '../lib/supabase';
import { mapCategoryFromDB } from '../utils/schemaMapper';
import { Plus, Edit2, Trash2, FolderOpen } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import SwipeableRow from '../components/SwipeableRow';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { Colors } from '../constants/theme';
import { useScrollHide } from '../hooks/useScrollHide';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();
  const { onScroll } = useScrollHide();
  const insets = useSafeAreaInsets();

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data ? data.map(mapCategoryFromDB) : []);
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to fetch categories' });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [])
  );

  const handleDelete = (id: string) => {
    Alert.alert('Delete Category', 'Are you sure you want to delete this category?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;
            setCategories(prev => prev.filter(c => c.id !== id));
            Toast.show({ type: 'success', text1: 'Success', text2: 'Category deleted' });
          } catch (error) {
            console.error(error);
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to delete category' });
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <SwipeableRow
      onEdit={() => navigation.navigate('CategoryForm', { id: item.id })}
      onDelete={() => handleDelete(item.id)}
    >
      <TouchableOpacity 
        activeOpacity={0.7} 
        onPress={() => navigation.navigate('CategoryForm', { id: item.id })}
      >
        <View style={styles.card}>
          <Image source={{ uri: getImageUrl(item.img) }} style={styles.image} />
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>{item.subtitle}</Text>
            <View style={styles.tags}>
              <Text style={styles.tag}>{item.categoryType}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </SwipeableRow>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={{ padding: 16, paddingTop: Math.max(insets.top + 16, 16), gap: 16 }}>
           <SkeletonLoader width="100%" height={100} borderRadius={12} />
           <SkeletonLoader width="100%" height={100} borderRadius={12} />
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingTop: Math.max(insets.top + 16, 16), paddingBottom: 120 }}
          onScroll={onScroll}
          scrollEventThrottle={16}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#c8a96e" />}
          ListEmptyComponent={<EmptyState icon={<FolderOpen size={32} color="#6b6980" />} message="No categories found. Add your first category to get started." />}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        />
      )}

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('CategoryForm')}
      >
        <Plus color="#0A0A0B" size={28} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0B' },
  card: { backgroundColor: '#161820', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(200,169,110,0.15)', flexDirection: 'row', overflow: 'hidden' },
  image: { width: 100, height: 100, backgroundColor: '#1E2028' },
  info: { flex: 1, padding: 12, justifyContent: 'center' },
  name: { fontFamily: 'Rajdhani', fontSize: 18, color: '#F5F5F5', fontWeight: 'bold' },
  subtitle: { fontFamily: 'Inter', fontSize: 14, color: '#a3a3a3', marginTop: 4 },
  tags: { flexDirection: 'row', marginTop: 8 },
  tag: { backgroundColor: 'rgba(200,169,110,0.1)', color: '#c8a96e', fontSize: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, overflow: 'hidden' },
  fab: { position: 'absolute', bottom: 100, right: 24, width: 64, height: 64, borderRadius: 32, backgroundColor: '#c8a96e', alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#c8a96e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }
});
