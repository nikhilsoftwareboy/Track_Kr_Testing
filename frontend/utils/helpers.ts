import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

export const formatDate = (date: string | Date): string => {
  return format(new Date(date), 'dd MMM yyyy');
};

export const formatDateTime = (date: string | Date): string => {
  return format(new Date(date), 'dd MMM yyyy, hh:mm a');
};

export const getToday = (): { start: string; end: string } => {
  const now = new Date();
  return {
    start: startOfDay(now).toISOString(),
    end: endOfDay(now).toISOString(),
  };
};

export const getThisWeek = (): { start: string; end: string } => {
  const now = new Date();
  return {
    start: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
    end: endOfWeek(now, { weekStartsOn: 1 }).toISOString(),
  };
};

export const getThisMonth = (): { start: string; end: string } => {
  const now = new Date();
  return {
    start: startOfMonth(now).toISOString(),
    end: endOfMonth(now).toISOString(),
  };
};

export const getLast7Days = (): { start: string; end: string } => {
  const now = new Date();
  return {
    start: subDays(now, 7).toISOString(),
    end: now.toISOString(),
  };
};

export const getLast30Days = (): { start: string; end: string } => {
  const now = new Date();
  return {
    start: subDays(now, 30).toISOString(),
    end: now.toISOString(),
  };
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    Food: '#10b981',
    Travel: '#3b82f6',
    Shopping: '#f59e0b',
    Education: '#8b5cf6',
    Bills: '#ef4444',
    Entertainment: '#ec4899',
    Health: '#14b8a6',
    Other: '#6b7280',
  };

  return colors[category] || colors.Other;
};

export const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    Food: '🍔',
    Travel: '🚗',
    Shopping: '🛍️',
    Education: '📚',
    Bills: '💳',
    Entertainment: '🎬',
    Health: '🏥',
    Other: '📌',
  };

  return icons[category] || icons.Other;
};
