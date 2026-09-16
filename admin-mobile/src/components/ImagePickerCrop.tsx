import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Camera, X } from 'lucide-react-native';

interface ImagePickerCropProps {
  value?: { uri: string; base64?: string } | null;
  onChange: (img: { uri: string; base64?: string } | null) => void;
  aspectRatio?: number;
}

export default function ImagePickerCrop({ value, onChange, aspectRatio = 1 }: ImagePickerCropProps) {
  const [imageUri, setImageUri] = useState<string | null>(value?.uri || null);

  const handlePickImage = async () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: () => launchCamera() },
        { text: 'Choose from Gallery', onPress: () => launchLibrary() },
      ]
    );
  };

  const processImage = async (uri: string) => {
    try {
      // Basic resize
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.WEBP, base64: true }
      );
      
      setImageUri(result.uri);
      onChange({ uri: result.uri, base64: result.base64 });
    } catch (error) {
      console.error("Error processing image:", error);
      Alert.alert('Error', 'Failed to process image');
    }
  };

  const launchCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [aspectRatio * 10, 10], // e.g. 1 means [10, 10]
      quality: 1,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      processImage(result.assets[0].uri);
    }
  };

  const launchLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Gallery permission is required');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [aspectRatio * 10, 10],
      quality: 1,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      processImage(result.assets[0].uri);
    }
  };

  const handleClear = () => {
    setImageUri(null);
    onChange(null);
  };

  return (
    <View style={styles.container}>
      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={[styles.image, { aspectRatio }]} />
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <X size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.uploadArea} onPress={handlePickImage}>
          <Camera size={32} color="#c8a96e" style={{ marginBottom: 12 }} />
          <Text style={styles.uploadText}>Tap to Select Image</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  uploadArea: {
    borderWidth: 1,
    borderColor: 'rgba(200, 169, 110, 0.4)',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: 'rgba(22, 24, 32, 0.5)',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    color: '#c8a96e',
    fontFamily: 'Inter',
    fontSize: 16,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(200, 169, 110, 0.15)',
  },
  image: {
    width: '100%',
  },
  clearButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
