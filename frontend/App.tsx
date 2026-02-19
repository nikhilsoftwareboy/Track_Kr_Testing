import React, { useEffect, useState } from 'react';
import { StatusBar, View, StyleSheet, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Services
import DatabaseService from './services/database';
import SMSService from './services/sms';
import NotificationService from './services/notifications';

// Screens
import DashboardScreen from './screens/DashboardScreen';
import HistoryScreen from './screens/HistoryScreen';
import InsightsScreen from './screens/InsightsScreen';
import SettingsScreen from './screens/SettingsScreen';
import AddExpenseScreen from './screens/AddExpenseScreen';

// Components
import ReasonCaptureModal from './components/ReasonCaptureModal';

// Types
import { RootStackParamList, MainTabParamList } from './types/navigation';
import { ExpenseCategory } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <View style={styles.tabIcon}><View style={[styles.iconDot, { backgroundColor: color }]} /></View>,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color }) => <View style={styles.tabIcon}><View style={[styles.iconDot, { backgroundColor: color }]} /></View>,
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          tabBarLabel: 'Insights',
          tabBarIcon: ({ color }) => <View style={styles.tabIcon}><View style={[styles.iconDot, { backgroundColor: color }]} /></View>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <View style={styles.tabIcon}><View style={[styles.iconDot, { backgroundColor: color }]} /></View>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<{
    amount: number;
    merchant: string;
    suggestedCategory: ExpenseCategory;
  } | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await DatabaseService.init();
      console.log('Database initialized');

      // Request permissions
      await NotificationService.requestPermission();
      await SMSService.checkPermission();

      // Setup notification listeners
      NotificationService.setupNotificationResponseListener((response) => {
        const data = response.notification.request.content.data;
        if (data.type === 'transaction' && data.amount && data.merchant) {
          handleTransactionDetected(data.amount, data.merchant);
        }
      });

      setIsReady(true);
    } catch (error) {
      console.error('Error initializing app:', error);
      Alert.alert('Initialization Error', 'Failed to initialize the app');
      setIsReady(true);
    }
  };

  const handleTransactionDetected = (amount: number, merchant: string) => {
    const suggestedCategory = SMSService.suggestCategory(merchant);
    setPendingTransaction({ amount, merchant, suggestedCategory });
    setShowReasonModal(true);
  };

  const handleReasonSubmit = async (category: ExpenseCategory, reason: string) => {
    if (!pendingTransaction) return;

    try {
      await DatabaseService.addExpense({
        amount: pendingTransaction.amount,
        merchant: pendingTransaction.merchant,
        category,
        reason,
        date: new Date().toISOString(),
        source: 'sms',
      });

      setShowReasonModal(false);
      setPendingTransaction(null);
      Alert.alert('Success', 'Expense tracked successfully!');
    } catch (error) {
      console.error('Error saving expense:', error);
      Alert.alert('Error', 'Failed to save expense');
    }
  };

  const handleReasonCancel = () => {
    setShowReasonModal(false);
    setPendingTransaction(null);
  };

  if (!isReady) {
    return <View style={styles.loading} />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#10b981" />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="AddExpense"
            component={AddExpenseScreen}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
        </Stack.Navigator>

        {/* Reason Capture Modal */}
        {pendingTransaction && (
          <ReasonCaptureModal
            visible={showReasonModal}
            amount={pendingTransaction.amount}
            merchant={pendingTransaction.merchant}
            suggestedCategory={pendingTransaction.suggestedCategory}
            onSubmit={handleReasonSubmit}
            onCancel={handleReasonCancel}
          />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#10b981',
  },
  tabIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
