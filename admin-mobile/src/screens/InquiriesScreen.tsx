import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { mapInquiryFromDB } from '../utils/schemaMapper';
import { Inbox } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import SwipeableRow from '../components/SwipeableRow';
import EmptyState from '../components/EmptyState';
import { Colors } from '../constants/theme';
import { useScrollHide } from '../hooks/useScrollHide';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PAGE_SIZE = 20;

export default function InquiriesScreen() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { onScroll } = useScrollHide();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchInquiries = async (isLoadMore = false) => {
    try {
      const from = isLoadMore ? (page + 1) * PAGE_SIZE : 0;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await supabase
        .from('inquiries')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      const mapped = (data || []).map(mapInquiryFromDB);
      
      if (isLoadMore) {
        setInquiries(prev => [...prev, ...mapped]);
        setPage(page + 1);
      } else {
        setInquiries(mapped);
        setPage(0);
      }

      setHasMore(count ? from + PAGE_SIZE < count : false);
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to fetch inquiries' });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInquiries(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchInquiries(false);
      
      const subscription = supabase
        .channel('public:inquiries')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, () => {
          fetchInquiries(false);
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(subscription);
      };
    }, [])
  );

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'new' ? 'contacted' : currentStatus === 'contacted' ? 'closed' : 'new';
    
    // Optimistic UI update
    setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: nextStatus } : inq));
    
    try {
      const { error } = await supabase.from('inquiries').update({ status: nextStatus }).eq('id', id);
      if (error) throw error;
      Toast.show({ type: 'success', text1: 'Status updated' });
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to update status' });
      // Revert on error
      fetchInquiries(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Inquiry', 'Are you sure you want to delete this inquiry?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from('inquiries').delete().eq('id', id);
            if (error) throw error;
            setInquiries(prev => prev.filter(item => item.id !== id));
            Toast.show({ type: 'success', text1: 'Success', text2: 'Inquiry deleted' });
          } catch (error) {
            console.error(error);
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to delete inquiry' });
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }: { item: any }) => {
    const statusColors = {
      new: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
      contacted: { bg: 'rgba(200, 169, 110, 0.1)', text: '#c8a96e', border: 'rgba(200, 169, 110, 0.3)' },
      closed: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' },
    };
    const sColor = statusColors[(item.status || 'new') as keyof typeof statusColors];

    return (
      <SwipeableRow onDelete={() => handleDelete(item.id)}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.email}>{item.email}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.interest || 'General'}</Text>
              </View>
              <TouchableOpacity 
                onPress={() => handleStatusChange(item.id, item.status || 'new')}
                style={{
                  backgroundColor: sColor.bg,
                  borderColor: sColor.border,
                  borderWidth: 1,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: sColor.text, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {item.status || 'new'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.details} numberOfLines={2}>{item.details}</Text>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </SwipeableRow>
    );
  };

  return (
    <View style={styles.container}>
      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator color="#c8a96e" />
        </View>
      ) : (
        <FlatList
          data={inquiries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingTop: Math.max(insets.top + 16, 16), paddingBottom: 120 }}
          onScroll={onScroll}
          scrollEventThrottle={16}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#c8a96e" />}
          ListEmptyComponent={<EmptyState icon={<Inbox size={32} color="#6b6980" />} message="No inquiries found." />}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          onEndReached={() => {
            if (hasMore && !loading) {
              fetchInquiries(true);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={hasMore && inquiries.length > 0 ? <ActivityIndicator color="#c8a96e" style={{ margin: 16 }} /> : null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0B' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#161820', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(200,169,110,0.15)', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  name: { fontFamily: 'Rajdhani', fontSize: 18, color: '#F5F5F5', fontWeight: 'bold' },
  email: { fontFamily: 'Inter', fontSize: 14, color: '#c8a96e', marginTop: 2 },
  badge: { backgroundColor: 'rgba(200,169,110,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { color: '#c8a96e', fontSize: 12, fontFamily: 'Inter' },
  details: { fontFamily: 'Inter', fontSize: 14, color: '#a3a3a3', marginBottom: 12, lineHeight: 20 },
  date: { fontFamily: 'Inter', fontSize: 12, color: '#475569', alignSelf: 'flex-end' }
});
