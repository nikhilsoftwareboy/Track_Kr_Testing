import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10b981',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    }

    return false;
  }

  async scheduleDailySummary(totalSpent: number, categoryBreakdown: Record<string, number>) {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) return;

      // Cancel existing daily summaries
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Format category breakdown
      const categories = Object.entries(categoryBreakdown)
        .filter(([_, amount]) => amount > 0)
        .map(([cat, amount]) => `${cat}: ₹${amount.toFixed(0)}`)
        .join(' | ');

      const body = totalSpent > 0
        ? `Today you spent ₹${totalSpent.toFixed(0)}\n${categories}`
        : 'No expenses recorded today';

      // Schedule for 9 PM
      const trigger = {
        hour: 21,
        minute: 0,
        repeats: true,
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily Spending Summary 💰',
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger,
      });

      console.log('Daily summary notification scheduled');
    } catch (error) {
      console.error('Error scheduling daily summary:', error);
    }
  }

  async sendBudgetAlert(type: 'daily' | 'monthly', spent: number, limit: number) {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) return;

      const percentage = (spent / limit) * 100;
      const periodType = type === 'daily' ? 'daily' : 'monthly';

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${type === 'daily' ? '📅' : '📆'} Budget Alert`,
          body: `You've spent ₹${spent.toFixed(0)} (${percentage.toFixed(0)}%) of your ${periodType} budget of ₹${limit}`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Send immediately
      });

      console.log(`Budget alert sent: ${type}`);
    } catch (error) {
      console.error('Error sending budget alert:', error);
    }
  }

  async sendTransactionDetected(amount: number, merchant: string) {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💳 Transaction Detected',
          body: `₹${amount} spent at ${merchant}. Tap to add reason.`,
          sound: true,
          data: { amount, merchant, type: 'transaction' },
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });

      console.log('Transaction notification sent');
    } catch (error) {
      console.error('Error sending transaction notification:', error);
    }
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Setup notification response listener
  setupNotificationListener(callback: (notification: Notifications.Notification) => void) {
    const subscription = Notifications.addNotificationReceivedListener(callback);
    return subscription;
  }

  setupNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ) {
    const subscription = Notifications.addNotificationResponseReceivedListener(callback);
    return subscription;
  }
}

export default new NotificationService();
