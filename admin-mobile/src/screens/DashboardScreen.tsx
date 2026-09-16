import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, Package, Mail, Plus, Activity, FolderPlus, FilePlus2, Bell } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import StatCard from '../components/StatCard';
import GlassPanel from '../components/GlassPanel';
import { Colors } from '../constants/theme';
import { useScrollHide } from '../hooks/useScrollHide';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotifications } from '../contexts/NotificationContext';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { unreadCount } = useNotifications();
  const [counts, setCounts] = useState({ categories: 0, products: 0, inquiries: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { onScroll } = useScrollHide();
  const insets = useSafeAreaInsets();

  const fetchStats = async () => {
    try {
      const [catsRes, prodsRes, inqsRes] = await Promise.all([
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('inquiries').select('*', { count: 'exact', head: true })
      ]);

      setCounts({
        categories: catsRes.count || 0,
        products: prodsRes.count || 0,
        inquiries: inqsRes.count || 0,
      });
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load dashboard stats' });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingTop: Math.max(insets.top + 20, 20) }]}
      onScroll={onScroll}
      scrollEventThrottle={16}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Overview</Text>
          <Text style={styles.subtitle}>Welcome back to Lumina Command Center.</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.bellButton}
          onPress={() => navigation.navigate('Notifications')}
          activeOpacity={0.7}
        >
          <Bell size={24} color={Colors.textMain} />
          {unreadCount > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <StatCard 
          icon={<LayoutDashboard size={24} color={Colors.primary} />} 
          value={counts.categories} 
          label="Total Categories"
          onPress={() => navigation.navigate('Categories')}
        />
        <StatCard 
          icon={<Package size={24} color={Colors.primary} />} 
          value={counts.products} 
          label="Total Products"
          onPress={() => navigation.navigate('Products')}
        />
        <StatCard 
          icon={<Mail size={24} color={Colors.primary} />} 
          value={counts.inquiries} 
          label="Total Inquiries"
          onPress={() => navigation.navigate('Inquiries')}
        />
      </View>

      <View style={styles.actionsSection}>
        <View style={styles.actionsTitleRow}>
          <Activity size={18} color={Colors.primary} />
          <Text style={styles.actionsTitle}>Quick Operations</Text>
        </View>
        
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionCard} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Categories', { screen: 'CategoryForm', params: {} })}
          >
            <View style={styles.actionIconWrap}>
              <FolderPlus size={18} color={Colors.textMain} />
            </View>
            <Text style={styles.actionCardTitle}>Collections</Text>
            <Text style={styles.actionCardDesc}>Create new display collections and organize lighting families.</Text>
            <View style={styles.actionBtn}>
              <Plus size={14} color={Colors.bgApp} />
              <Text style={styles.actionBtnText}>Add Category</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Products', { screen: 'ProductForm', params: {} })}
          >
            <View style={styles.actionIconWrap}>
              <FilePlus2 size={18} color={Colors.textMain} />
            </View>
            <Text style={styles.actionCardTitle}>Inventory</Text>
            <Text style={styles.actionCardDesc}>Upload new luxury lighting items, details, and lighting specs.</Text>
            <View style={[styles.actionBtn, { backgroundColor: Colors.primary }]}>
              <Plus size={14} color={Colors.bgApp} />
              <Text style={styles.actionBtnText}>Add Product</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgApp },
  contentContainer: { padding: 20, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 28, fontFamily: 'Rajdhani', color: Colors.textMain, fontWeight: 'bold' },
  subtitle: { fontSize: 14, fontFamily: 'Inter', color: Colors.textSecondary, marginTop: 4 },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(200,169,110,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(200,169,110,0.2)',
    position: 'relative'
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.bgApp,
  },
  badgeText: {
    color: Colors.bgApp,
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 },
  actionsSection: { marginTop: 40 },
  actionsTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  actionsTitle: { fontSize: 18, color: Colors.textMain, fontWeight: '600' },
  actionsGrid: { flexDirection: 'row', gap: 16 },
  actionCard: { 
    flex: 1, backgroundColor: Colors.bgPanelSolid, borderRadius: 12, padding: 20, 
    borderWidth: 1, borderColor: Colors.border, gap: 12
  },
  actionIconWrap: { 
    padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, 
    alignSelf: 'flex-start' 
  },
  actionCardTitle: { fontSize: 16, fontWeight: '600', color: Colors.textMain },
  actionCardDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  actionBtn: { 
    backgroundColor: Colors.border, borderRadius: 8, paddingVertical: 10, 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 
  },
  actionBtnText: { color: Colors.bgApp, fontSize: 13, fontWeight: '600' },
});
