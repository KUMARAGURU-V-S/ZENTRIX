import React, { useState } from 'react';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting report generation:', { username, platform });
    onGenerateReport(username, platform);
  };

  return (
    <>
      <DashboardHeader searchQuery={searchQuery} onSearchChange={onSearchChange} />
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
    </>
  );
}

export default DashboardLayout;