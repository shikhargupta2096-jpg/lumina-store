import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Trash2, Edit2 } from 'lucide-react-native';

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete: () => void;
  onEdit?: () => void;
}

export default function SwipeableRow({ children, onDelete, onEdit }: SwipeableRowProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDelete();
    swipeableRef.current?.close();
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onEdit) onEdit();
    swipeableRef.current?.close();
  };

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.8],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.actionsContainer}>
        {onEdit && (
          <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={handleEdit} activeOpacity={0.7}>
            <Animated.View style={{ transform: [{ scale }] }}>
              <Edit2 size={20} color="#c8a96e" />
            </Animated.View>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete} activeOpacity={0.7}>
          <Animated.View style={{ transform: [{ scale }] }}>
            <Trash2 size={20} color="#ef4444" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
      onSwipeableWillOpen={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={styles.container}>
        {children}
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0A0B',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: '100%',
    borderRadius: 12,
    marginLeft: 8,
    borderWidth: 1,
    backgroundColor: '#161820', // Dark panel matching the theme
  },
  editButton: {
    borderColor: 'rgba(200, 169, 110, 0.25)', // Subtle gold border
  },
  deleteButton: {
    borderColor: 'rgba(239, 68, 68, 0.25)', // Subtle red border
  },
});
