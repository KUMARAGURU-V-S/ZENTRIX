import Card from '../components/ui/Card.tsx';
import Button from '../components/ui/Button.tsx';
import { FaHistory, FaPlus, FaLightbulb, FaEye } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

import type { Report } from '../App';

function HistoryPage({ reports, onSelectReport, onNavigate }: { reports: Report[]; onSelectReport: (report: Report) => void; onNavigate: (page: string) => void }) {
  const [motivationalMessage, setMotivationalMessage] = useState('');

  const messages = [
    "Your coding journey starts with your first report!",
    "Ready to unlock insights about your performance?",
    "Let's turn your code into knowledge!",
    "Every great developer starts somewhere. Begin now!",
    "Discover what your code is telling you!"
  ];

  useEffect(() => {
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMotivationalMessage(randomMessage);
  }, []);

  return (
    <div className="history-page">
      <header className="page-header">
        <h1 className="page-title">History</h1>
        <p className="page-subtitle">View your past performance reports.</p>
      </header>

      <div className="history-list">
        {reports.length > 0 ? (
          reports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="report-history-card" onClick={() => onSelectReport(report)}>
                <div className="history-card-content">
                  <div>
                    <h3 className="history-card-title">{report.username}</h3>
                    <p className="history-card-date">Generated on {report.date}</p>
                  </div>
                  <Button onClick={() => onSelectReport(report)}>View Report</Button>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="empty-history-container">
            {/* Background gradient/radial highlight */}
            <div className="empty-history-background">
              <div className="radial-highlight"></div>
            </div>

            <Card className="empty-history-card">
              <motion.div
                className="empty-history-content"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                {/* Animated illustration */}
                <div className="empty-state-illustration">
                  <motion.div
                    className="illustration-circle"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="illustration-bar bar-1"></div>
                    <div className="illustration-bar bar-2"></div>
                    <div className="illustration-bar bar-3"></div>
                  </motion.div>
                </div>

                {/* Larger animated icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <FaHistory className="empty-history-icon" />
                </motion.div>

                {/* Improved typography */}
                <motion.h2
                  className="empty-history-title"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  No History Yet
                </motion.h2>

                <motion.p
                  className="empty-history-subtitle"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {motivationalMessage}
                </motion.p>

                {/* Description and tutorial link */}
                <motion.div
                  className="report-description"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="description-text">
                    Reports provide detailed insights into your coding performance, including strengths, weaknesses, and personalized recommendations.
                  </p>
                  <a href="#" className="tutorial-link">
                    <FaLightbulb className="tutorial-icon" />
                    Learn more about reports
                  </a>
                </motion.div>

                {/* Primary button with + icon */}
                <motion.div
                  className="button-group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button className="generate-button" onClick={() => onNavigate('dashboard')}>
                    <FaPlus className="button-icon" />
                    Generate Your First Report
                  </Button>

                  {/* Secondary action button */}
                  <Button className="secondary-button">
                    <FaEye className="button-icon" />
                    See Example Report
                  </Button>
                </motion.div>

                {/* Ghost placeholders for future reports */}
                <motion.div
                  className="ghost-placeholders"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ delay: 1, duration: 1 }}
                >
                  <div className="ghost-card"></div>
                  <div className="ghost-card"></div>
                  <div className="ghost-card"></div>
                </motion.div>
              </motion.div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryPage;