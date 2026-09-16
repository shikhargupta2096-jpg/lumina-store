import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';

interface ChipInputProps {
  label?: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

export default function ChipInput({ label, items, onChange, placeholder = 'Add item...' }: ChipInputProps) {
  const [inputText, setInputText] = useState('');

  const handleAdd = () => {
    const trimmed = inputText.trim();
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed]);
      setInputText('');
    }
  };

  const handleRemove = (itemToRemove: string) => {
    onChange(items.filter(item => item !== itemToRemove));
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.chipContainer}>
        {items.map((item, index) => (
          <View key={index} style={styles.chip}>
            <Text style={styles.chipText}>{item}</Text>
            <TouchableOpacity onPress={() => handleRemove(item)} style={styles.removeIcon}>
              <X size={14} color="#c8a96e" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#6b6980"
        value={inputText}
        onChangeText={setInputText}
        onSubmitEditing={handleAdd}
        returnKeyType="done"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#a3a3a3',
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(200, 169, 110, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(200, 169, 110, 0.3)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    color: '#F5F5F5',
    fontSize: 14,
    fontFamily: 'Inter',
    marginRight: 6,
  },
  removeIcon: {
    padding: 2,
  },
  input: {
    backgroundColor: '#1E2028',
    borderWidth: 1,
    borderColor: 'rgba(200, 169, 110, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#F5F5F5',
    fontFamily: 'Inter',
    fontSize: 16,
  },
});
