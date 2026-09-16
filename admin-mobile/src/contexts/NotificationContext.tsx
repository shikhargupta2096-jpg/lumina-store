import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { mapNotificationFromDB, Notification as AppNotification } from '../utils/schemaMapper';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        if (data) {
          const mapped = data.map(mapNotificationFromDB);
          setNotifications(mapped);
          setUnreadCount(mapped.filter(n => !n.is_read).length);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    const channel = supabase
      .channel(`public:notifications:user_id=eq.${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = mapNotificationFromDB(payload.new as any);
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => {
            const nextCount = prev + 1;
            Notifications.setBadgeCountAsync(nextCount);
            return nextCount;
          });
          
          Toast.show({
            type: 'info',
            text1: newNotification.title,
            text2: newNotification.body,
          });
          
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  useEffect(() => {
    const registerForPushNotificationsAsync = async () => {
      if (!Device.isDevice) {
        console.log('Must use physical device for Push Notifications');
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
        });
        const token = tokenData.data;

        if (user?.id) {
          await supabase.from('push_tokens').upsert(
            {
              user_id: user.id,
              token,
              platform: Platform.OS,
            },
            { onConflict: 'token' }
          );
        }
      } catch (error) {
        console.error('Error getting push token:', error);
      }

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#c8a96e',
        });
      }
    };

    if (user?.id) {
      registerForPushNotificationsAsync();
    }
  }, [user?.id]);

  useEffect(() => {
    Notifications.setBadgeCountAsync(unreadCount);
  }, [unreadCount]);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, loading }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
