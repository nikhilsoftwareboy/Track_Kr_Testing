import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { ExpenseCategory } from '../types';
import { getCategoryIcon, formatCurrency } from '../utils/helpers';

interface ReasonCaptureModalProps {
  visible: boolean;
  amount: number;
  merchant: string;
  suggestedCategory: ExpenseCategory;
  onSubmit: (category: ExpenseCategory, reason: string) => void;
  onCancel: () => void;
}

const categories: ExpenseCategory[] = [
  'Food',
  'Travel',
  'Shopping',
  'Education',
  'Bills',
  'Entertainment',
  'Health',
  'Other',
];

const ReasonCaptureModal: React.FC<ReasonCaptureModalProps> = ({
  visible,
  amount,
  merchant,
  suggestedCategory,
  onSubmit,
  onCancel,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>(suggestedCategory);
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    onSubmit(selectedCategory, reason || 'No reason specified');
    setReason('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onCancel}
        />
        
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Transaction Detected 💳</Text>
            <Text style={styles.transactionInfo}>
              You spent {formatCurrency(amount)} at{'\n'}
              <Text style={styles.merchantName}>{merchant}</Text>
            </Text>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.questionText}>Why did you spend this?</Text>

            <View style={styles.categoryGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.categoryButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={styles.categoryIcon}>{getCategoryIcon(category)}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      selectedCategory === category && styles.categoryLabelActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reasonInput}
              placeholder="Add a note (optional)"
              placeholderTextColor="#9ca3af"
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={3}
              maxLength={100}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>Skip</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Save Expense</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  modalHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  transactionInfo: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  merchantName: {
    fontWeight: '600',
    color: '#10b981',
  },
  modalBody: {
    padding: 24,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  categoryButton: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  categoryIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: '#059669',
    fontWeight: '700',
  },
  reasonInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    fontSize: 16,
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default ReasonCaptureModal;
