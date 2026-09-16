import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter both email and password' });
      return;
    }
    try {
      setLoading(true);
      await signIn(email, password);
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Login Failed', text2: error.message || 'Invalid credentials' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.brand}>LUMINA.</Text>
          <Text style={styles.subtitle}>CONTROL CENTER</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="admin@lumina.com"
              placeholderTextColor="#6b6980"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#6b6980"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0A0A0B" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0B' },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 48 },
  brand: { fontFamily: 'Rajdhani', fontSize: 42, color: '#F5F5F5', fontWeight: 'bold', letterSpacing: 4 },
  subtitle: { fontFamily: 'Inter', fontSize: 14, color: '#c8a96e', letterSpacing: 2, marginTop: 8 },
  card: { backgroundColor: '#161820', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: 'rgba(200,169,110,0.15)' },
  inputGroup: { marginBottom: 20 },
  label: { fontFamily: 'Inter', fontSize: 14, color: '#a3a3a3', marginBottom: 8 },
  input: { backgroundColor: '#1E2028', borderRadius: 8, padding: 16, color: '#F5F5F5', fontFamily: 'Inter', borderWidth: 1, borderColor: 'rgba(200,169,110,0.15)' },
  button: { backgroundColor: '#c8a96e', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 12 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#0A0A0B', fontFamily: 'Inter', fontSize: 16, fontWeight: '600' }
});
