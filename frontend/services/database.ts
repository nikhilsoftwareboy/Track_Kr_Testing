import * as SQLite from 'expo-sqlite';
import { Expense, Budget } from '../types';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    try {
      this.db = await SQLite.openDatabaseAsync('trackkr.db');
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async createTables() {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        merchant TEXT NOT NULL,
        category TEXT NOT NULL,
        reason TEXT NOT NULL,
        date TEXT NOT NULL,
        source TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS budget (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        daily REAL DEFAULT 500,
        monthly REAL DEFAULT 15000
      );

      CREATE INDEX IF NOT EXISTS idx_date ON expenses(date);
      CREATE INDEX IF NOT EXISTS idx_category ON expenses(category);
    `);

    // Initialize budget if not exists
    const budgetExists = await this.db.getFirstAsync('SELECT * FROM budget WHERE id = 1');
    if (!budgetExists) {
      await this.db.runAsync(
        'INSERT INTO budget (id, daily, monthly) VALUES (1, 500, 15000)'
      );
    }
  }

  async addExpense(expense: Omit<Expense, 'id'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.runAsync(
      `INSERT INTO expenses (amount, merchant, category, reason, date, source) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [expense.amount, expense.merchant, expense.category, expense.reason, expense.date, expense.source]
    );

    return result.lastInsertRowId;
  }

  async getExpenses(limit?: number): Promise<Expense[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = limit 
      ? `SELECT * FROM expenses ORDER BY date DESC LIMIT ${limit}`
      : 'SELECT * FROM expenses ORDER BY date DESC';

    const rows = await this.db.getAllAsync<Expense>(query);
    return rows;
  }

  async getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.getAllAsync<Expense>(
      'SELECT * FROM expenses WHERE date BETWEEN ? AND ? ORDER BY date DESC',
      [startDate, endDate]
    );

    return rows;
  }

  async getExpensesByCategory(category: string): Promise<Expense[]> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.getAllAsync<Expense>(
      'SELECT * FROM expenses WHERE category = ? ORDER BY date DESC',
      [category]
    );

    return rows;
  }

  async getTotalByDateRange(startDate: string, endDate: string): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync<{ total: number }>(
      'SELECT SUM(amount) as total FROM expenses WHERE date BETWEEN ? AND ?',
      [startDate, endDate]
    );

    return result?.total || 0;
  }

  async getCategoryTotals(startDate: string, endDate: string): Promise<Record<string, number>> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.getAllAsync<{ category: string; total: number }>(
      'SELECT category, SUM(amount) as total FROM expenses WHERE date BETWEEN ? AND ? GROUP BY category',
      [startDate, endDate]
    );

    const totals: Record<string, number> = {};
    rows.forEach(row => {
      totals[row.category] = row.total;
    });

    return totals;
  }

  async deleteExpense(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
  }

  async updateBudget(budget: Budget): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      'UPDATE budget SET daily = ?, monthly = ? WHERE id = 1',
      [budget.daily, budget.monthly]
    );
  }

  async getBudget(): Promise<Budget> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync<Budget>(
      'SELECT daily, monthly FROM budget WHERE id = 1'
    );

    return result || { daily: 500, monthly: 15000 };
  }

  async searchExpenses(searchTerm: string): Promise<Expense[]> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.getAllAsync<Expense>(
      'SELECT * FROM expenses WHERE merchant LIKE ? OR reason LIKE ? ORDER BY date DESC',
      [`%${searchTerm}%`, `%${searchTerm}%`]
    );

    return rows;
  }
}

export default new DatabaseService();
