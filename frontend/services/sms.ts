import * as SMS from 'expo-sms';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { SMSTransaction, ExpenseCategory } from '../types';

class SMSService {
  private transactionKeywords = [
    'debited', 'spent', 'paid', 'upi', 'txn', 'transaction',
    'debit', 'payment', 'transferred', 'withdraw'
  ];

  async checkPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      const isAvailable = await SMS.isAvailableAsync();
      return isAvailable;
    } catch (error) {
      console.error('Error checking SMS permission:', error);
      return false;
    }
  }

  isTransactionSMS(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    return this.transactionKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  parseTransaction(message: string): SMSTransaction | null {
    try {
      // Extract amount (various patterns)
      const amountPatterns = [
        /(?:rs\.?|inr|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
        /(?:debited|spent|paid|transferred)\s+(?:rs\.?|inr|₹)?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
        /amount\s+(?:rs\.?|inr|₹)?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
        /(\d+(?:,\d+)*(?:\.\d{2})?)\s+(?:rs\.?|inr|₹)?/i
      ];

      let amount = 0;
      for (const pattern of amountPatterns) {
        const match = message.match(pattern);
        if (match) {
          amount = parseFloat(match[1].replace(/,/g, ''));
          if (amount > 0) break;
        }
      }

      if (amount === 0) return null;

      // Extract merchant/receiver name
      const merchantPatterns = [
        /(?:to|at)\s+([A-Za-z0-9\s]+?)(?:\s+on|\s+via|\s+using|\.|$)/i,
        /(?:paid to|sent to|transferred to)\s+([A-Za-z0-9\s]+?)(?:\s+on|\s+via|\.|$)/i,
        /(?:merchant|receiver):\s*([A-Za-z0-9\s]+?)(?:\s+on|\.|$)/i,
        /UPI-([A-Za-z0-9\s@]+?)(?:\s+on|\.|$)/i
      ];

      let merchant = 'Unknown';
      for (const pattern of merchantPatterns) {
        const match = message.match(pattern);
        if (match && match[1]) {
          merchant = match[1].trim();
          break;
        }
      }

      // Clean up merchant name
      merchant = merchant
        .replace(/\s+/g, ' ')
        .replace(/[^A-Za-z0-9\s@.-]/g, '')
        .substring(0, 50);

      return {
        amount,
        merchant: merchant || 'Unknown',
        date: new Date().toISOString(),
        rawMessage: message
      };
    } catch (error) {
      console.error('Error parsing SMS:', error);
      return null;
    }
  }

  suggestCategory(merchant: string): ExpenseCategory {
    const merchantLower = merchant.toLowerCase();

    // Food
    if (merchantLower.match(/swiggy|zomato|food|restaurant|cafe|pizza|burger|kitchen|dining|eatery|dominos|kfc|mcdonald/)) {
      return 'Food';
    }

    // Travel
    if (merchantLower.match(/uber|ola|rapido|metro|bus|taxi|fuel|petrol|gas|irctc|train|flight|airline|indigo|spicejet/)) {
      return 'Travel';
    }

    // Shopping
    if (merchantLower.match(/amazon|flipkart|myntra|ajio|shop|mall|store|market|retail|bigbasket|grofers|blinkit/)) {
      return 'Shopping';
    }

    // Education
    if (merchantLower.match(/udemy|coursera|unacademy|byju|school|college|university|education|course|tuition|books/)) {
      return 'Education';
    }

    // Bills
    if (merchantLower.match(/electricity|water|gas|mobile|recharge|internet|wifi|broadband|bill|payment|insurance|loan|emi/)) {
      return 'Bills';
    }

    // Entertainment
    if (merchantLower.match(/netflix|prime|hotstar|spotify|movie|theatre|cinema|gaming|game|entertainment|bookmyshow/)) {
      return 'Entertainment';
    }

    // Health
    if (merchantLower.match(/pharma|medicine|hospital|clinic|doctor|health|medical|pharmacy|apollo|medplus/)) {
      return 'Health';
    }

    // Default
    return 'Other';
  }

  // Mock function for testing (since we can't actually read SMS in simulator)
  generateMockSMS(): string[] {
    return [
      'Rs.250 debited from your account at Swiggy on 19-02-2025. UPI Ref: 12345.',
      'Your A/c XX1234 is debited by Rs.80 on 19-Feb-25 for UPI/Auto/Ramesh Fast Food. Available bal: Rs.5420.50',
      'Rs.150.00 paid to Amazon via UPI on 19-02-2025 10:30 AM',
      'Transaction Alert: Rs.500 transferred to UBER on 19/02/2025',
      'Payment of Rs.1200 successful to Netflix via UPI'
    ];
  }
}

export default new SMSService();
