# Zentrix

Zentrix is an AI-powered productivity assistant for competitive programmers. It integrates with platforms like Codeforces and LeetCode to provide comprehensive performance analytics, personalized insights, and intelligent recommendations to enhance coding skills and track progress.

## 📊 Current Status

**Project Completion: ~75%**

✅ **Implemented**: Core report generation, multi-platform support, visual dashboard, browser extension, export features, dark theme, search functionality
⚠️ **In Development**: Real AI chat integration, full authentication, push notifications, advanced analytics
❌ **Missing**: Production deployment, comprehensive testing, security hardening

##  Features

### ✅ Completed Features
- **Multi-Platform Analytics**: Generate detailed reports from Codeforces and LeetCode accounts
- **Performance Insights**: Track rating, problem-solving accuracy, language usage, and difficulty breakdowns
- **Visual Dashboard**: Charts and graphs for progress visualization with Chart.js
- **Browser Extension**: Quick access to reports and analytics (Manifest V3)
- **Export Options**: Download reports as PDF (jsPDF) or CSV (react-csv)
- **Dark Mode**: Professional dark theme with glassmorphism effects
- **Real-time Search**: Filter and search through generated reports
- **Responsive Design**: Mobile and desktop optimized
- **Firebase Integration**: Firestore for data persistence

### 🚧 In Development
- **AI Chat Assistant**: Currently basic keyword-based responses (needs real AI integration)
- **Authentication**: Extension has Firebase auth, web app uses mock login
- **Push Notifications**: Framework ready but not implemented
- **Advanced Analytics**: Trend analysis and comparative insights

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Chart.js, jsPDF, react-csv, Firebase
- **Backend**: Node.js, Express.js, Firebase Firestore, Axios
- **Extension**: React, TypeScript, Vite, Firebase Auth
- **APIs**: Codeforces API, LeetCode Stats API
- **Styling**: Custom CSS with CSS Variables, Google Fonts
- **Deployment**: Vercel config (frontend), Docker (backend)

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project (for database and auth)

## 🚀 Installation & Setup

### Quick Start
1. Clone the repository
2. Set up Firebase project and copy config to relevant files
3. Run backend and frontend

### Backend Setup
```bash
cd backend-api
npm install
# Copy Firebase config to .env (see Configuration section)
npm start
```
Server runs on `http://localhost:3001`

### Frontend Setup
```bash
cd Zentrix_Frontend
cp .env.example .env.local # Create local environment file
npm install
npm run dev
```
App runs on `http://localhost:5173`

### Extension Setup
```bash
cd Zentrix_Extension
npm install
npm run build
# Load the dist folder as unpacked extension in Chrome
```

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Firestore Database and Authentication
3. Get your config from Project Settings > General > Your apps
4. Update the following files with your Firebase config:

**backend-api/.env**:
```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

**Zentrix_Frontend/src/firebase.ts** and **Zentrix_Extension/src/firebase.ts**:
```javascript
const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  // ... rest of config
};
```

## 📖 Usage

### Web Application
1. Open `http://localhost:5173`
2. Navigate through Dashboard, History, Profile, and Chat
3. Generate reports by selecting platform and entering username
4. View detailed analytics with charts and export options
5. Use search to filter reports

### Browser Extension
1. Load extension in Chrome developer mode
2. Click extension icon to open popup
3. Sign up/Login with email
4. Generate reports directly from extension
5. Access main dashboard via link

## 📁 Project Structure

```
zentrix/
├── backend-api/           # Node.js/Express API server
│   ├── server.js         # Main API with endpoints
│   ├── server.test.js    # API tests
│   ├── Dockerfile        # Container config
│   └── package.json
├── Zentrix_Frontend/     # React web application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Main app pages
│   │   ├── styles/       # CSS and styling
│   │   └── firebase.ts   # Firebase config
│   ├── vercel.json       # Deployment config
│   └── package.json
├── Zentrix_Extension/    # Browser extension
│   ├── src/
│   │   ├── Popup.tsx     # Extension popup
│   │   └── firebase.ts   # Firebase config
│   ├── manifest.json     # Extension manifest
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Reports
- `POST /api/reports` - Generate performance report
  - Body: `{ "handle": "username", "platform": "codeforces|leetcode" }`

### Chat
- `POST /api/chat` - AI chat interaction
  - Body: `{ "message": "user message" }`

### Codeforces
- `GET /codeforces/:username` - Get user profile data

## ⚠️ Current Limitations

- **Authentication**: Web app uses mock login (extension has real Firebase auth)
- **AI Chat**: Basic keyword responses (not connected to real AI)
- **User Profiles**: Mock data only
- **Notifications**: Not implemented
- **Security**: API keys exposed (not production-ready)
- **Testing**: Limited test coverage

## 🚀 Future Roadmap

- [ ] Real AI integration (OpenAI/Claude)
- [ ] Full Firebase authentication for web app
- [ ] Push notifications and reminders
- [ ] Advanced analytics and trend analysis
- [ ] User profile management
- [ ] Multi-language support
- [ ] Production deployment
- [ ] Comprehensive testing suite

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Open a Pull Request

## 📄 License

ISC License - see LICENSE file for details
