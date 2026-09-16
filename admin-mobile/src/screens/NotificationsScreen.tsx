import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Check } from 'lucide-react-native';
import { useNotifications } from '../contexts/NotificationContext';
import { Notification as AppNotification } from '../utils/schemaMapper';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<any>>();
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Realtime channel updates will handle fresh data, but we can wait a bit for visual feedback
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleNotificationPress = async (notification: AppNotification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    navigation.navigate('Main', { screen: 'Inquiries' });
  };

  const renderItem = ({ item }: { item: AppNotification }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          {!item.is_read && <View style={styles.unreadDot} />}
          <Text style={[styles.title, !item.is_read && styles.titleUnread]} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
        <Text style={styles.timestamp}>{getRelativeTime(item.created_at)}</Text>
      </View>
      <Text style={styles.body} numberOfLines={2}>
        {item.body}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#F5F5F5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllReadBtn}>
            <Check size={18} color="#c8a96e" />
            <Text style={styles.markAllReadText}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#c8a96e" />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Bell size={48} color="#6b6980" />
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200,169,110,0.15)',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontFamily: 'Rajdhani',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F5F5F5',
  },
  markAllReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllReadText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#c8a96e',
    marginLeft: 4,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#161820',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(200,169,110,0.15)',
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#c8a96e',
    marginRight: 8,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#a3a3a3',
    fontWeight: '500',
    flex: 1,
  },
  titleUnread: {
    color: '#F5F5F5',
    fontWeight: 'bold',
  },
  timestamp: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#6b6980',
  },
  body: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#a3a3a3',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#a3a3a3',
    marginTop: 16,
  },
});
