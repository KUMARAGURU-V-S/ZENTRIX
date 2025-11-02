import { useState, useEffect } from 'react';
import DashboardLayout from './components/dashboard/DashboardLayout';
import Sidebar from './components/dashboard/Sidebar';
import LoginPage from './pages/LoginPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import SubmissionDetailsPage from './pages/SubmissionDetailsPage';
import ChatPage from './pages/ChatPage';
import './styles/main.css';

import { db, auth } from './firebase.ts';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

console.log("App.tsx loaded");

const API_URL = import.meta.env.VITE_API_URL;

export type Report = {
  id: string;
  username: string;
  platform: 'codeforces' | 'leetcode' | string;
  date: string;
  summary: string;
  performanceMetrics: {
    problemSolved: number;
    averageTime: string;
    accuracy: string;
    languages: string[];
  };
  strengths: string[];
  weaknesses: string[];
  difficultyBreakdown: { difficulty: string; count: number }[];
  codeforcesData?: {
    rating: number;
    rank: string;
    maxRating: number;
    maxRank: string;
    avatar: string;
  };
  leetcodeData?: {
    ranking: string;
    totalSolved: number;
    acceptanceRate: string;
  };
  error?: string;
};

export type ErrorReport = {
  error: string;
};

function App() {
  console.log("App function called");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard'); // New state for navigation
  const [currentReport, setCurrentReport] = useState<Report | ErrorReport | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReports = generatedReports.filter(report =>
    report.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    setLoading(true);
    const q = query(collection(db, "reports"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reports: Report[] = [];
      querySnapshot.forEach((doc) => {
        reports.push({ id: doc.id, ...doc.data() } as Report);
      });
      setGeneratedReports(reports);
      setLoading(false);
    },
    (error) => {
      console.error("Firestore onSnapshot error:", error);
      setGeneratedReports([]); // Clear any old reports
      setLoading(false); // Un-stick the UI on error
    });

    return () => unsubscribe();
  }, [isLoggedIn]);

  const handleGenerateReport = async (username: string, platform: string = 'codeforces') => {
    console.log('Generating report for:', { username, platform });
    setLoading(true);
    setCurrentReport(null);
    try {
      const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ handle: username, platform }),
      });
      const newReport = await response.json();
      console.log('Report response:', newReport);
      // The onSnapshot listener will automatically update the generatedReports state
      setCurrentReport(newReport);
    } catch (error) {
      console.error("Error fetching report:", error);
      setCurrentReport({ error: "Could not generate report. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const clearReport = () => {
    setCurrentReport(null);
    setCurrentPage('dashboard'); // Go back to dashboard after clearing
  };

  const handleSelectSubmission = (submission: Report) => {
    setSelectedSubmission(submission);
    setCurrentPage('submission');
  };

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    setCurrentReport(null); // Clear any open report view
  };

  const renderContent = () => {
    console.log('Rendering page:', currentPage);
    switch (currentPage) {
      case 'dashboard':
        return (
          <DashboardLayout
            currentReport={currentReport}
            loading={loading}
            generatedReports={filteredReports}
            onGenerateReport={handleGenerateReport}
            onClearReport={clearReport}
            onSelectReport={handleSelectSubmission}
            onPageChange={handleNavigation} // Pass handler
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        );
      case 'history':
        return <div className="page-container"><HistoryPage reports={generatedReports} onSelectReport={handleSelectSubmission} /></div>;
      case 'profile':
        return <div className="page-container"><ProfilePage /></div>;
      case 'chat':
        return <div className="page-container"><ChatPage /></div>;
      case 'submission':
        return <div className="page-container"><SubmissionDetailsPage submission={selectedSubmission} onBack={() => setCurrentPage('history')} /></div>;
      default:
        return <div>404 Page Not Found</div>;
    }
  };

  return (
    <>
      {isLoggedIn ? (
        <div className="app-container">
          <Sidebar onPageChange={handleNavigation} />
          <main className="main-content">
            {renderContent()}
          </main>
        </div>
      ) : (
        <LoginPage />
      )}
    </>
  );
}

export default App;
