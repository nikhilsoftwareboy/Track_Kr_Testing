# TrackKr 📊

**Tagline:** "Not just what you spent, but why you spent."

A smart personal expense manager that captures the context behind every transaction.

## Features

### Core MVP Features
- 📱 SMS Transaction Detection (Android)
- ⚡ Real-time Reason Capture Popup
- ✍️ Manual Expense Entry
- 📊 Dashboard with Spending Summary
- 📜 Expense History with Filters
- 🔍 Search Functionality

### Smart Features
- 🤖 Auto Category Suggestion
- 📈 Spending Insights & Analytics
- 🔔 Daily Summary Notifications
- 💰 Budget Limit Alerts

## Tech Stack

- **Frontend:** React Native / Expo
- **Backend:** FastAPI
- **Database:** SQLite (Local)
- **Navigation:** React Navigation
- **Charts:** React Native Gifted Charts

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- Expo CLI

### Installation

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt
```

### Running the App

```bash
# Start backend
cd backend
python server.py

# Start frontend (in another terminal)
cd frontend
npm start
```

## Project Structure

```
TrackKr/
├── frontend/          # React Native Expo app
│   ├── app/          # Screen files (expo-router)
│   ├── components/   # Reusable components
│   ├── services/     # Business logic
│   └── types/        # TypeScript types
├── backend/          # FastAPI server
│   └── server.py
└── tests/           # Test files
```

## Privacy & Security

- ✅ All data stored locally
- ✅ No external server sync
- ✅ SMS permissions required (Android only)
- ✅ No sensitive banking data stored

## License

MIT