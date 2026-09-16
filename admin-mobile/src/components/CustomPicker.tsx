import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronDown, Check, X } from 'lucide-react-native';

interface Option {
  value: string;
  label: string;
}

interface CustomPickerProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  label?: string;
  customTrigger?: React.ReactNode;
}

export default function CustomPicker({ value, onChange, options, placeholder = 'Select an option', label, customTrigger }: CustomPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (val: string) => {
    onChange(val);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      {customTrigger ? (
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          {customTrigger}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.pickerBox}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[styles.pickerText, !selectedOption && styles.placeholderText]}>
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
          <ChevronDown size={20} color="#a3a3a3" />
        </TouchableOpacity>
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select Option'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#a3a3a3" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.optionRow, item.value === value && styles.optionRowSelected]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={[styles.optionText, item.value === value && styles.optionTextSelected]}>
                    {item.label}
                  </Text>
                  {item.value === value && <Check size={20} color="#c8a96e" />}
                </TouchableOpacity>
              )}
            />
          </SafeAreaView>
        </View>
      </Modal>
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
  pickerBox: {
    backgroundColor: '#1E2028',
    borderWidth: 1,
    borderColor: 'rgba(200, 169, 110, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    color: '#F5F5F5',
    fontSize: 16,
    fontFamily: 'Inter',
  },
  placeholderText: {
    color: '#6b6980',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#161820',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200, 169, 110, 0.1)',
  },
  modalTitle: {
    color: '#F5F5F5',
    fontSize: 18,
    fontFamily: 'Rajdhani',
    fontWeight: 'bold',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionRowSelected: {
    backgroundColor: 'rgba(200, 169, 110, 0.05)',
  },
  optionText: {
    color: '#F5F5F5',
    fontSize: 16,
    fontFamily: 'Inter',
  },
  optionTextSelected: {
    color: '#c8a96e',
    fontWeight: 'bold',
  },
});
