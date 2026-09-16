import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GlassPanel from './GlassPanel';

interface StatCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  accentColor?: string;
  onPress?: () => void;
}

export default function StatCard({ icon, value, label, accentColor = '#c8a96e', onPress }: StatCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={{ flex: 1 }}>
      <GlassPanel style={styles.card}>
        <View style={[styles.glow, { backgroundColor: accentColor }]} />
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            {icon}
          </View>
        </View>
        <View style={styles.content}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      </GlassPanel>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    flex: 1,
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(200, 169, 110, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'column',
  },
  value: {
    fontFamily: 'Rajdhani',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F5F5F5',
    marginBottom: 4,
  },
  label: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#a3a3a3',
  },
});
