import { useState, useEffect } from 'react';
import DashboardLayout from './components/dashboard/DashboardLayout.tsx';
import LoginPage from './pages/LoginPage.tsx';
import HistoryPage from './pages/HistoryPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import SubmissionDetailsPage from './pages/SubmissionDetailsPage.tsx';
import './styles/main.css';

import { db } from './firebase.js';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const API_URL = 'http://localhost:3001/api';

export type Report = {
  id: string;
  username: string;
  date: string;
  summary: string;
  performanceMetrics: {
    problemSolved: number;
    averageTime: string | number;
    accuracy: string | number;
    languages: string[];
  };
  strengths: string[];
  weaknesses: string[];
  difficultyBreakdown: { difficulty: string; count: number }[];
  error?: string;
};

export type ErrorReport = {
  error: string;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard'); // New state for navigation
  const [currentReport, setCurrentReport] = useState<Report | ErrorReport | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<Report[]>([]);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "reports"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reports: Report[] = [];
      querySnapshot.forEach((doc) => {
        reports.push({ id: doc.id, ...doc.data() } as Report);
      });
      setGeneratedReports(reports);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGenerateReport = async (username: string) => {
    setLoading(true);
    setCurrentReport(null);
    try {
      const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ handle: username }),
      });
      const newReport = await response.json();
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
  
  const handleLogin = () => {
    setIsLoggedIn(true);
  };
  
  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    setCurrentReport(null); // Clear any open report view
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <DashboardLayout
            currentReport={currentReport}
            loading={loading}
            generatedReports={generatedReports}
            onGenerateReport={handleGenerateReport}
            onClearReport={clearReport}
            onSelectReport={handleSelectSubmission}
            onPageChange={handleNavigation} // Pass handler
          />
        );
      case 'history':
        return <HistoryPage reports={generatedReports} onSelectReport={handleSelectSubmission} />;
      case 'profile':
        return <ProfilePage />;
      case 'submission':
        return <SubmissionDetailsPage submission={selectedSubmission} onBack={() => setCurrentPage('history')} />;
      default:
        return <div>404 Page Not Found</div>;
    }
  };

  return (
    <>
      {isLoggedIn ? (
        renderContent()
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;
