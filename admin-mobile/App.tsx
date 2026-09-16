import React from 'react';
import './global.css';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { StyleSheet, View, Text } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/constants/theme';

// Custom toast config matching the Lumina dark theme
const toastConfig = {
  success: ({ text1, text2 }: any) => (
    <View style={[toastStyles.container, toastStyles.success]}>
      <Text style={toastStyles.title}>{text1}</Text>
      {text2 ? <Text style={toastStyles.message}>{text2}</Text> : null}
    </View>
  ),
  error: ({ text1, text2 }: any) => (
    <View style={[toastStyles.container, toastStyles.error]}>
      <Text style={toastStyles.title}>{text1}</Text>
      {text2 ? <Text style={toastStyles.message}>{text2}</Text> : null}
    </View>
  ),
  info: ({ text1, text2 }: any) => (
    <View style={[toastStyles.container, toastStyles.info]}>
      <Text style={toastStyles.title}>{text1}</Text>
      {text2 ? <Text style={toastStyles.message}>{text2}</Text> : null}
    </View>
  ),
};

const toastStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    minWidth: 280,
  },
  success: {
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  error: {
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  info: {
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    borderColor: 'rgba(200, 169, 110, 0.3)',
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  message: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AuthProvider>
          <NotificationProvider>
            <StatusBar style="light" />
            <AppNavigator />
            <Toast config={toastConfig} topOffset={60} />
          </NotificationProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgApp,
  },
});
