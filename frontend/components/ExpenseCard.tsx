import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Expense } from '../types';
import { formatCurrency, formatDate, getCategoryIcon, getCategoryColor } from '../utils/helpers';

interface ExpenseCardProps {
  expense: Expense;
  onPress?: () => void;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onPress }) => {
  const categoryColor = getCategoryColor(expense.category);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.cardHeader}>
        <View style={styles.leftSection}>
          <View style={[styles.iconContainer, { backgroundColor: categoryColor + '20' }]}>
            <Text style={styles.icon}>{getCategoryIcon(expense.category)}</Text>
          </View>
          
          <View style={styles.infoSection}>
            <Text style={styles.merchant} numberOfLines={1}>
              {expense.merchant}
            </Text>
            <Text style={styles.reason} numberOfLines={1}>
              {expense.reason}
            </Text>
            <Text style={styles.date}>{formatDate(expense.date)}</Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {expense.category}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  infoSection: {
    flex: 1,
  },
  merchant: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  reason: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default ExpenseCard;
