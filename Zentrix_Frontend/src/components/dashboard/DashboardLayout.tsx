import React, { useState, useEffect } from 'react';
import DashboardHeader from './DashboardHeader.tsx';
import ReportPage from '../reports/ReportPage.tsx';
import RecentReportsList from './RecentReportList';
import Button from '../ui/Button.tsx';
import Input from '../ui/Input.tsx';
import Card from '../ui/Card.tsx';
import Loading from '../ui/Loading.tsx';
import KpiCard from './KpiCard.tsx'; // Import the new component
import PerformanceChart from './PerformanceChart.tsx'; // Import the chart component
import { FaChartLine, FaCheckCircle, FaFileAlt, FaCode } from 'react-icons/fa'; // Import icons
import '../../styles/components.css';
import type { Report, ErrorReport } from '../../App';

function DashboardLayout({
  currentReport,
  loading,
  generatedReports,
  onGenerateReport,
  onClearReport,
  onSelectReport,
  onPageChange: _onPageChange, // New prop (intentionally unused)
  searchQuery,
  onSearchChange,
}: {
  currentReport: Report | ErrorReport | null;
  loading: boolean;
  generatedReports: Report[];
  onGenerateReport: (username: string, platform: string) => void;
  onClearReport: () => void;
  onSelectReport: (report: Report) => void;
  onPageChange: (page: string) => void; // New prop type
  searchQuery: string;
  onSearchChange: (query: string) => void;
}) {
  const [username, setUsername] = useState('');
  const [platform, setPlatform] = useState('codeforces');
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting report generation:', { username, platform });
    console.log('API URL:', import.meta.env.VITE_API_URL);
    console.log('Calling onGenerateReport with:', username, platform);
    console.log('Button clicked - form submitted');
    onGenerateReport(username, platform);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setProgress(0);
      setProgressText('Initializing...');
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 30) {
            setProgressText('Fetching user data...');
            return prev + Math.random() * 5;
          } else if (prev < 60) {
            setProgressText('Analyzing performance...');
            return prev + Math.random() * 3;
          } else if (prev < 90) {
            setProgressText('Generating insights...');
            return prev + Math.random() * 2;
          } else {
            setProgressText('Finalizing report...');
            return Math.min(prev + Math.random() * 1, 95);
          }
        });
      }, 200);
    } else {
      setProgress(100);
      setProgressText('Complete!');
      setTimeout(() => {
        setProgress(0);
        setProgressText('');
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const totalProblemsSolved = generatedReports.reduce((acc, report) => acc + (report.performanceMetrics?.problemSolved || 0), 0);
  const averageAccuracy = generatedReports.length > 0
    ? (generatedReports.reduce((acc, report) => acc + parseFloat(report.performanceMetrics?.accuracy || '0'), 0) / generatedReports.length).toFixed(1) + '%'
    : 'N/A';
  const totalReports = generatedReports.length;

  return (
    <div className="page-content">
      <DashboardHeader searchQuery={searchQuery} onSearchChange={onSearchChange} />
        {!currentReport ? (
          <>
            {loading ? (
              <div className="form-card-container">
                <Card>
                  <Loading
                    size="lg"
                    text="Generating your performance report..."
                    progress={progress}
                    showProgressBar={true}
                    progressText={progressText}
                  />
                </Card>
              </div>
            ) : (
              <>
                {generatedReports.length > 0 && (
                  <>
                    <div className="kpi-grid">
                      <KpiCard title="Total Problems Solved" value={totalProblemsSolved} icon={<FaChartLine />} color="primary" />
                      <KpiCard title="Average Accuracy" value={averageAccuracy} icon={<FaCheckCircle />} color="green" />
                      <KpiCard title="Total Reports" value={totalReports} icon={<FaFileAlt />} color="blue" />
                      <KpiCard title="Most Used Language" value="Python" icon={<FaCode />} color="yellow" />
                    </div>
                    <PerformanceChart reports={generatedReports} />
                  </>
                )}
                <form onSubmit={handleSubmit} className="form-card-container">
                  <Card>
                    <h1 className="form-title">
                      Analyze Your Coding Profile
                    </h1>
                    <p className="form-subtitle">
                      Enter a username to generate a comprehensive performance report.
                    </p>
                    <div className="form-fields">
                      <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="platform-select"
                        disabled={loading}
                      >
                        <option value="codeforces">Codeforces</option>
                        <option value="leetcode">LeetCode</option>
                      </select>
                      <Input
                        type="text"
                        placeholder="Enter Username"
                        value={username}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          console.log('Username change:', e.target.value);
                          setUsername(e.target.value);
                        }}
                        required
                        disabled={loading}
                      />
                      <Button type="submit" loading={loading}>
                        {loading ? 'Analyzing...' : 'Generate Report'}
                      </Button>
                    </div>
                  </Card>
                </form>
              </>
            )}
            {generatedReports.length > 0 && (
              <RecentReportsList
                reports={generatedReports}
                onSelectReport={onSelectReport}
              />
            )}
          </>
        ) : (
          <ReportPage reportData={currentReport} onBack={onClearReport} />
        )}
    </div>
  );
}

export default DashboardLayout;