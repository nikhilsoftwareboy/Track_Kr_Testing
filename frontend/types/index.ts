export interface Expense {
  id: number;
  amount: number;
  merchant: string;
  category: ExpenseCategory;
  reason: string;
  date: string;
  source: 'sms' | 'manual';
}

export type ExpenseCategory = 
  | 'Food' 
  | 'Travel' 
  | 'Shopping' 
  | 'Education' 
  | 'Bills' 
  | 'Entertainment'
  | 'Health'
  | 'Other';

export interface Budget {
  daily: number;
  monthly: number;
}

export interface SpendingSummary {
  today: number;
  week: number;
  month: number;
  byCategory: Record<ExpenseCategory, number>;
}

export interface CategorySuggestion {
  category: ExpenseCategory;
  confidence: number;
}

export interface SMSTransaction {
  amount: number;
  merchant: string;
  date: string;
  rawMessage: string;
}