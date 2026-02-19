# TrackKr - Quick Start Guide

## 🎉 Your App is Ready!

TrackKr is a smart personal expense manager built with React Native/Expo that helps you understand not just where your money is spent, but **why you spend it**.

## 📱 How to Test the App

### Option 1: Using Expo Go (Recommended)

1. **Install Expo Go** on your Android/iOS device:
   - [Android - Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Get the QR Code**:
   ```bash
   cd /app/frontend
   npm start
   ```
   The QR code will be displayed in the terminal

3. **Scan the QR Code**:
   - Android: Open Expo Go and tap "Scan QR Code"
   - iOS: Use the Camera app to scan, then tap the notification

4. **Start Testing**: The app will load on your device!

### Option 2: Android Emulator

```bash
cd /app/frontend
npm run android
```

### Option 3: Web Version (Limited Features)

```bash
cd /app/frontend  
npm run web
```
Note: SMS detection won't work on web

## 🎯 Features Implemented

### Core Features (MVP)
✅ **SMS Transaction Detection** (Android only)
   - Automatically detects transaction SMS
   - Extracts amount, merchant, date & time
   
✅ **Real-Time Reason Capture Popup** (Main USP)
   - Modal appears instantly after transaction
   - Quick category selection with icons
   - Optional text reason input

✅ **Manual Expense Entry**
   - Add expenses manually when SMS isn't available
   - Full category selection
   - Custom reason notes

✅ **Dashboard Screen**
   - Today's total spending
   - This month's total
   - Recent transactions list
   - Floating "Add Expense" button

✅ **Expense History**
   - Complete list of all expenses
   - Search by merchant or reason
   - Filter by category
   - Delete expenses

✅ **Spending Insights**
   - Pie chart for category distribution
   - Bar chart for spending comparison
   - Key insights & patterns
   - Week and month totals

### Smart Features
✅ **Auto Category Suggestion**
   - Swiggy → Food
   - Uber → Travel
   - Amazon → Shopping
   - And more intelligent mappings

✅ **Budget Limit Alerts**
   - Set daily and monthly budgets
   - Notifications when limits exceeded
   - Budget management in Settings

✅ **Daily Summary Notification**
   - Scheduled for 9 PM daily
   - Shows total spent and category breakdown

## 🗂️ Project Structure

```
TrackKr/
├── frontend/
│   ├── App.tsx                    # Main app component
│   ├── screens/
│   │   ├── DashboardScreen.tsx    # Home screen
│   │   ├── AddExpenseScreen.tsx   # Manual entry
│   │   ├── HistoryScreen.tsx      # All expenses
│   │   ├── InsightsScreen.tsx     # Charts & analytics
│   │   └── SettingsScreen.tsx     # Settings & budget
│   ├── components/
│   │   ├── ReasonCaptureModal.tsx # Real-time popup (USP)
│   │   └── ExpenseCard.tsx        # Expense display
│   ├── services/
│   │   ├── database.ts            # SQLite operations
│   │   ├── sms.ts                 # SMS parsing
│   │   └── notifications.ts       # Push notifications
│   ├── types/
│   │   ├── index.ts               # Data types
│   │   └── navigation.ts          # Navigation types
│   └── utils/
│       └── helpers.ts             # Utility functions
├── backend/
│   └── server.py                  # FastAPI server
└── README.md
```

## 🔑 Key Technical Features

### Database (SQLite)
- **expenses** table: id, amount, merchant, category, reason, date, source
- **budget** table: daily, monthly limits
- Automatic indexing on date and category
- All data stored locally (privacy-first)

### SMS Detection Algorithm
- Keywords: debited, spent, paid, UPI, txn, transaction
- Regex patterns for amount extraction
- Merchant name parsing
- Smart category suggestion based on merchant

### Category Auto-Suggestion
```javascript
Swiggy/Zomato → Food
Uber/Ola → Travel  
Amazon/Flipkart → Shopping
Netflix/Spotify → Entertainment
And many more...
```

## 🎨 UI/UX Highlights

- **Green/Blue Theme**: Finance-friendly colors
- **Card-Based Design**: Clean and modern
- **Bottom Sheet Modal**: Quick reason capture
- **Icon-Based Categories**: Visual recognition
- **Floating Action Button**: Easy expense addition
- **Pull-to-Refresh**: Intuitive data updates

## 🔒 Privacy & Security

- ✅ All data stored locally (SQLite)
- ✅ No external server sync
- ✅ SMS permission required only on Android
- ✅ No sensitive banking details stored
- ✅ User controls all data

## 📊 Example Usage Flow

### Scenario 1: Automatic Transaction Detection (Android)
1. User pays ₹250 at Swiggy via UPI
2. Bank sends transaction SMS
3. TrackKr detects the SMS automatically
4. Popup appears: "You spent ₹250 at Swiggy. Why?"
5. User selects "Food" and adds note: "Dinner"
6. Expense saved with full context ✅

### Scenario 2: Manual Entry
1. User opens TrackKr
2. Taps the + button
3. Enters: ₹80, "Local Vegetable Market", Category: "Shopping"
4. Adds reason: "Weekly groceries"
5. Saves expense ✅

### Scenario 3: Budget Alert
1. User sets daily budget: ₹500
2. Throughout the day, spends ₹550
3. Receives notification: "⚠️ You've exceeded your daily budget!"
4. Can review spending in Insights ✅

## 🧪 Testing the App

### Test SMS Parsing
1. Go to Settings
2. Tap "Test SMS Parsing"
3. View mock transaction messages and parsing results

### Test Manual Entry
1. Tap the + button on Dashboard
2. Enter test data
3. Verify it appears in History

### Test Insights
1. Add multiple expenses in different categories
2. Go to Insights tab
3. View charts and analytics

## 🚀 Production Deployment

### Android APK Build
```bash
cd /app/frontend
eas build --platform android
```

### iOS Build (Requires Mac)
```bash
cd /app/frontend
eas build --platform ios
```

## 📝 Important Notes

### SMS Detection (Android Only)
- Requires `READ_SMS` and `RECEIVE_SMS` permissions
- Declared in app.json
- Not available on iOS due to platform restrictions
- Works in background after initial permission grant

### Notifications
- Requires notification permissions
- Daily summary at 9 PM
- Budget alerts when limits exceeded
- Can be toggled in Settings

### Database
- SQLite database created on first launch
- Location: Device's app data folder
- Automatic table creation and migrations
- Budget defaults: ₹500/day, ₹15,000/month

## 🎯 What Makes TrackKr Different?

Most expense trackers only record **what** you spent. TrackKr captures **why** you spent it, at the exact moment of transaction, making your financial insights more meaningful and actionable.

**Tagline**: "Not just what you spent, but why you spent."

## 🔮 Future Enhancements (Not Yet Implemented)

- Voice input for reason (speech-to-text)
- PDF monthly report export
- Cloud sync with Firebase
- App lock (PIN/fingerprint)
- AI-based spending analysis
- Savings suggestions
- Bill reminders
- Recurring expenses tracking

## 📧 Support

For any issues or questions, please check the logs:
```bash
tail -f /var/log/supervisor/expo.err.log
tail -f /var/log/supervisor/backend.err.log
```

---

**Built with ❤️ using React Native, Expo, and FastAPI**
