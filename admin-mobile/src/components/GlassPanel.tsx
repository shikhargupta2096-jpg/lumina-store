import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';

interface GlassPanelProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  className?: string;
}

export default function GlassPanel({ children, style, className }: GlassPanelProps) {
  return (
    <View
      // @ts-ignore
      className={className}
      style={[
        styles.container,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(22, 24, 32, 0.85)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(200, 169, 110, 0.15)',
    overflow: 'hidden',
  },
});
