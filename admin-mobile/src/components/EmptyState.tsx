import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <Text style={styles.message}>{message}</Text>
      
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 250,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(200, 169, 110, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(200, 169, 110, 0.1)',
  },
  message: {
    color: '#a3a3a3',
    fontSize: 16,
    fontFamily: 'Inter',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: 'rgba(200, 169, 110, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(200, 169, 110, 0.3)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#c8a96e',
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
