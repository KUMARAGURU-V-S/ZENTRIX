import React, { useState } from 'react';
import Sidebar from './Sidebar.tsx';
import DashboardHeader from './DashboardHeader.tsx';
import ReportPage from '../reports/ReportPage.tsx';
import RecentReportsList from './RecentReportList';
import Button from '../ui/Button.tsx';
import Input from '../ui/Input.tsx';
import Card from '../ui/Card.tsx';
import '../../styles/components.css';
import type { Report, ErrorReport } from '../../App';

function DashboardLayout({
  currentReport,
  loading,
  generatedReports,
  onGenerateReport,
  onClearReport,
  onSelectReport,
  onPageChange, // New prop
}: {
  currentReport: Report | ErrorReport | null;
  loading: boolean;
  generatedReports: Report[];
  onGenerateReport: (username: string) => void;
  onClearReport: () => void;
  onSelectReport: (report: Report) => void;
  onPageChange: (page: string) => void; // New prop type
}) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateReport(username);
  };

  return (
    <>
      <Sidebar onPageChange={onPageChange} />
      <main className="main-content">
        <DashboardHeader />
        {!currentReport ? (
          <>
            <form onSubmit={handleSubmit} className="form-card-container">
              <Card>
                <h1 className="form-title">
                  Analyze Your Coding Profile
                </h1>
                <p className="form-subtitle">
                  Enter a username to generate a comprehensive performance report.
                </p>
                <div className="form-fields">
                  <Input
                    type="text"
                    placeholder="Enter LeetCode/HackerRank Username"
                    value={username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Button type="submit" loading={loading}>
                    {loading ? 'Analyzing...' : 'Generate Report'}
                  </Button>
                </div>
              </Card>
            </form>
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
      </main>
    </>
  );
}

export default DashboardLayout;