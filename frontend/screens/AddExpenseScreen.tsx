import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { ExpenseCategory } from '../types';
import DatabaseService from '../services/database';
import NotificationService from '../services/notifications';
import { getCategoryIcon, getCategoryColor } from '../utils/helpers';

type AddExpenseScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddExpense'>;
type AddExpenseScreenRouteProp = RouteProp<RootStackParamList, 'AddExpense'>;

interface AddExpenseScreenProps {
  navigation: AddExpenseScreenNavigationProp;
  route: AddExpenseScreenRouteProp;
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

const AddExpenseScreen: React.FC<AddExpenseScreenProps> = ({ navigation, route }) => {
  const params = route.params || {};
  
  const [amount, setAmount] = useState(params.prefilledAmount?.toString() || '');
  const [merchant, setMerchant] = useState(params.prefilledMerchant || '');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>('Other');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (!merchant.trim()) {
      Alert.alert('Missing Merchant', 'Please enter merchant name');
      return;
    }

    setSaving(true);

    try {
      await DatabaseService.addExpense({
        amount: parseFloat(amount),
        merchant: merchant.trim(),
        category: selectedCategory,
        reason: reason.trim() || 'No reason specified',
        date: new Date().toISOString(),
        source: params.fromSMS ? 'sms' : 'manual',
      });

      // Check budget
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();
      const todayTotal = await DatabaseService.getTotalByDateRange(todayStart, todayEnd);
      
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59).toISOString();
      const monthTotal = await DatabaseService.getTotalByDateRange(monthStart, monthEnd);

      const budget = await DatabaseService.getBudget();

      if (todayTotal > budget.daily) {
        await NotificationService.sendBudgetAlert('daily', todayTotal, budget.daily);
      }

      if (monthTotal > budget.monthly) {
        await NotificationService.sendBudgetAlert('monthly', monthTotal, budget.monthly);
      }

      Alert.alert('Success', 'Expense added successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error saving expense:', error);
      Alert.alert('Error', 'Failed to save expense');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Add Expense</Text>
          <Text style={styles.subtitle}>Track your spending with context</Text>
        </View>

        <View style={styles.form}>
          {/* Amount Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount *</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor="#d1d5db"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>

          {/* Merchant Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Merchant / Store *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Where did you spend?"
              placeholderTextColor="#9ca3af"
              value={merchant}
              onChangeText={setMerchant}
            />
          </View>

          {/* Category Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && {
                      backgroundColor: getCategoryColor(category) + '30',
                      borderColor: getCategoryColor(category),
                    },
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={styles.categoryIcon}>{getCategoryIcon(category)}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      selectedCategory === category && {
                        color: getCategoryColor(category),
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Reason Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reason (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Why did you spend this?"
              placeholderTextColor="#9ca3af"
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
              maxLength={100}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Expense'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#10b981',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#d1fae5',
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingHorizontal: 20,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10b981',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    paddingVertical: 16,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
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
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingVertical: 18,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#10b981',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default AddExpenseScreen;
