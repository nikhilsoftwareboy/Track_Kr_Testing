import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import DatabaseService from '../services/database';
import { getThisWeek, getThisMonth, formatCurrency, getCategoryColor } from '../utils/helpers';

const { width } = Dimensions.get('window');

interface CategoryData {
  label: string;
  value: number;
  color: string;
  text: string;
}

const InsightsScreen: React.FC = () => {
  const [weekTotal, setWeekTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);

  const loadInsights = async () => {
    try {
      const week = getThisWeek();
      const month = getThisMonth();

      const weekAmount = await DatabaseService.getTotalByDateRange(week.start, week.end);
      const monthAmount = await DatabaseService.getTotalByDateRange(month.start, month.end);
      const categories = await DatabaseService.getCategoryTotals(month.start, month.end);

      setWeekTotal(weekAmount);
      setMonthTotal(monthAmount);
      setCategoryTotals(categories);
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadInsights();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInsights();
    setRefreshing(false);
  };

  // Prepare chart data
  const pieData: CategoryData[] = Object.entries(categoryTotals)
    .filter(([_, amount]) => amount > 0)
    .map(([category, amount]) => ({
      label: category,
      value: amount,
      color: getCategoryColor(category),
      text: `₹${amount.toFixed(0)}`,
    }))
    .sort((a, b) => b.value - a.value);

  const barData = pieData.map((item) => ({
    value: item.value,
    label: item.label.slice(0, 3),
    frontColor: item.color,
    spacing: 2,
  }));

  const topCategory = pieData.length > 0 ? pieData[0] : null;
  const categoryPercentages = pieData.map((item) => ({
    ...item,
    percentage: monthTotal > 0 ? ((item.value / monthTotal) * 100).toFixed(1) : 0,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Spending Insights</Text>
        <Text style={styles.subtitle}>Your financial overview</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
        }
      >
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>This Week</Text>
            <Text style={styles.summaryValue}>{formatCurrency(weekTotal)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>This Month</Text>
            <Text style={styles.summaryValue}>{formatCurrency(monthTotal)}</Text>
          </View>
        </View>

        {monthTotal > 0 ? (
          <>
            {/* Insights */}
            {topCategory && (
              <View style={styles.insightCard}>
                <Text style={styles.insightTitle}>📈 Key Insight</Text>
                <Text style={styles.insightText}>
                  Your highest spending category is{' '}
                  <Text style={[styles.insightHighlight, { color: topCategory.color }]}>
                    {topCategory.label}
                  </Text>
                  {' '}with {formatCurrency(topCategory.value)} spent this month.
                </Text>
              </View>
            )}

            {/* Pie Chart */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Category Distribution</Text>
              <View style={styles.pieChartContainer}>
                <PieChart
                  data={pieData}
                  radius={100}
                  innerRadius={60}
                  innerCircleColor="#f9fafb"
                  centerLabelComponent={() => (
                    <View style={styles.centerLabel}>
                      <Text style={styles.centerLabelAmount}>
                        {formatCurrency(monthTotal)}
                      </Text>
                      <Text style={styles.centerLabelText}>Total</Text>
                    </View>
                  )}
                />
              </View>

              {/* Legend */}
              <View style={styles.legend}>
                {categoryPercentages.map((item) => (
                  <View key={item.label} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={styles.legendText}>
                      {item.label}: {item.percentage}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Bar Chart */}
            {barData.length > 0 && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Spending by Category</Text>
                <View style={styles.barChartContainer}>
                  <BarChart
                    data={barData}
                    width={width - 80}
                    height={200}
                    barWidth={32}
                    spacing={24}
                    roundedTop
                    roundedBottom
                    hideRules
                    xAxisThickness={0}
                    yAxisThickness={0}
                    yAxisTextStyle={{ color: '#9ca3af' }}
                    noOfSections={3}
                    maxValue={Math.max(...barData.map((d) => d.value)) * 1.2}
                  />
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No data yet</Text>
            <Text style={styles.emptySubtitle}>
              Start tracking expenses to see your spending insights
            </Text>
          </View>
        )}
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
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  insightCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 16,
    color: '#78350f',
    lineHeight: 24,
  },
  insightHighlight: {
    fontWeight: '700',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  pieChartContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  centerLabel: {
    alignItems: 'center',
  },
  centerLabelAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  centerLabelText: {
    fontSize: 12,
    color: '#6b7280',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  barChartContainer: {
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default InsightsScreen;