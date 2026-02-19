import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import DatabaseService from '../services/database';
import NotificationService from '../services/notifications';
import SMSService from '../services/sms';
import { Budget } from '../types';
import { formatCurrency } from '../utils/helpers';

const SettingsScreen: React.FC = () => {
  const [dailyBudget, setDailyBudget] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const budget = await DatabaseService.getBudget();
      setDailyBudget(budget.daily.toString());
      setMonthlyBudget(budget.monthly.toString());

      const hasNotifPermission = await NotificationService.requestPermission();
      setNotificationsEnabled(hasNotifPermission);

      const hasSMSPermission = await SMSService.checkPermission();
      setSmsEnabled(hasSMSPermission);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSaveBudget = async () => {
    const daily = parseFloat(dailyBudget);
    const monthly = parseFloat(monthlyBudget);

    if (isNaN(daily) || daily <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid daily budget');
      return;
    }

    if (isNaN(monthly) || monthly <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid monthly budget');
      return;
    }

    setSaving(true);
    try {
      await DatabaseService.updateBudget({ daily, monthly });
      Alert.alert('Success', 'Budget limits updated successfully');
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', 'Failed to update budget');
    } finally {
      setSaving(false);
    }
  };

  const toggleNotifications = async (value: boolean) => {
    if (value) {
      const granted = await NotificationService.requestPermission();
      setNotificationsEnabled(granted);
      if (!granted) {
        Alert.alert(
          'Permission Denied',
          'Please enable notifications in your device settings'
        );
      }
    } else {
      await NotificationService.cancelAllNotifications();
      setNotificationsEnabled(false);
    }
  };

  const handleTestSMS = () => {
    const mockMessages = SMSService.generateMockSMS();
    Alert.alert(
      'Test SMS Messages',
      `Testing with ${mockMessages.length} mock messages:\n\n${mockMessages[0]}`,
      [
        {
          text: 'OK',
          onPress: () => {
            mockMessages.forEach((msg) => {
              const transaction = SMSService.parseTransaction(msg);
              if (transaction) {
                console.log('Parsed:', transaction);
              }
            });
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all expenses? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              const expenses = await DatabaseService.getExpenses();
              for (const expense of expenses) {
                await DatabaseService.deleteExpense(expense.id);
              }
              Alert.alert('Success', 'All expenses deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete expenses');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your preferences</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Budget Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Budget Limits</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Daily Budget</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.input}
                placeholder="500"
                keyboardType="numeric"
                value={dailyBudget}
                onChangeText={setDailyBudget}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Monthly Budget</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.input}
                placeholder="15000"
                keyboardType="numeric"
                value={monthlyBudget}
                onChangeText={setMonthlyBudget}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveBudget}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Budget'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Notifications</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Daily Summary</Text>
              <Text style={styles.settingDescription}>
                Get daily spending summary at 9 PM
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#d1d5db', true: '#6ee7b7' }}
              thumbColor={notificationsEnabled ? '#10b981' : '#f3f4f6'}
            />
          </View>
        </View>

        {/* SMS Detection (Android Only) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 SMS Detection</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto-detect Transactions</Text>
              <Text style={styles.settingDescription}>
                {smsEnabled
                  ? 'SMS detection available'
                  : 'Not available on this device'}
              </Text>
            </View>
            <Text style={styles.statusBadge}>
              {smsEnabled ? '✅ Active' : '❌ Inactive'}
            </Text>
          </View>

          <TouchableOpacity style={styles.testButton} onPress={handleTestSMS}>
            <Text style={styles.testButtonText}>Test SMS Parsing</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ About</Text>

          <View style={styles.infoCard}>
            <Text style={styles.appName}>TrackKr</Text>
            <Text style={styles.appTagline}>
              "Not just what you spent, but why you spent."
            </Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleDanger}>⚠️ Danger Zone</Text>

          <TouchableOpacity style={styles.dangerButton} onPress={handleClearData}>
            <Text style={styles.dangerButtonText}>Clear All Expenses</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#10b981',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#d1fae5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  sectionTitleDanger: {
    fontSize: 18,
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 14,
  },
  saveButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    fontSize: 14,
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
  },
  appVersion: {
    fontSize: 12,
    color: '#9ca3af',
  },
  dangerButton: {
    backgroundColor: '#fee2e2',
    borderWidth: 2,
    borderColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#dc2626',
  },
});

export default SettingsScreen;