import Card from '../ui/Card';
import Button from '../ui/Button';
import ReportChart from './ReportChart';
import "../../styles/components.css";
import type { Report, ErrorReport } from '../../App';
import jsPDF from 'jspdf';
import { CSVLink } from 'react-csv';

interface ReportPageProps {
  reportData: Report | ErrorReport;
  onBack: () => void;
}

function ReportPage({ reportData, onBack }: ReportPageProps) {
  if ('error' in reportData && reportData.error) {
    return (
      <Card className="error-card">
        <h2 className="error-title">Error</h2>
        <p className="error-message">{reportData.error}</p>
        <Button onClick={onBack} loading={false}>Go Back</Button>
      </Card>
    );
  }

  const data = reportData as Report;

  // Determine the platform from the data available
  const platform = data.platform || (data.codeforcesData ? 'codeforces' : 'unknown');

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Performance Report for ${data.username}`, 10, 10);

    if (platform === 'codeforces' && data.codeforcesData) {
      doc.text(`Rating: ${data.codeforcesData.rating} (${data.codeforcesData.rank})`, 10, 20);
      doc.text(`Max Rating: ${data.codeforcesData.maxRating} (${data.codeforcesData.maxRank})`, 10, 30);
    } else if (platform === 'leetcode' && data.leetcodeData) {
      doc.text(`Ranking: ${data.leetcodeData.ranking}`, 10, 20);
      doc.text(`Total Solved: ${data.leetcodeData.totalSolved}`, 10, 30);
    }

    doc.text(`Problems Solved: ${data.performanceMetrics.problemSolved}`, 10, 40);
    doc.text(`Accuracy: ${data.performanceMetrics.accuracy}`, 10, 50);
    doc.text(`Summary: ${data.summary}`, 10, 60);
    doc.save(`${data.username}_report.pdf`);
  };

  const getCsvData = () => {
    const commonData = [
      ['Metric', 'Value'],
      ['Username', data.username],
      ['Platform', platform],
      ['Problems Solved', data.performanceMetrics.problemSolved],
      ['Accuracy', data.performanceMetrics.accuracy],
      ['Summary', data.summary],
    ];

    if (platform === 'codeforces' && data.codeforcesData) {
      return [
        ...commonData,
        ['Rating', data.codeforcesData.rating],
        ['Rank', data.codeforcesData.rank],
        ['Max Rating', data.codeforcesData.maxRating],
        ['Max Rank', data.codeforcesData.maxRank],
      ];
    }
    // Add LeetCode specific CSV data here if needed
    return commonData;
  };

  return (
    <div className="report-dashboard">
      <header className="report-header">
        <div className="report-header-content">
          {platform === 'codeforces' && data.codeforcesData?.avatar && (
            <img src={data.codeforcesData.avatar} alt={`${data.username}'s avatar`} className="avatar" />
          )}
          <div>
            <h1 className="report-title">Performance Overview</h1>
            <p className="report-subtitle">Report for <span className="username">{data.username}</span></p>
          </div>
        </div>
        <div className="export-buttons">
          <Button onClick={exportToPDF} loading={false}>Export PDF</Button>
          <CSVLink data={getCsvData()} filename={`${data.username}_${platform}_report.csv`}>
            <Button loading={false}>Export CSV</Button>
          </CSVLink>
          <Button onClick={onBack} loading={false}>Go Back</Button>
        </div>
      </header>

      <div className="metrics-grid">
        {platform === 'codeforces' && data.codeforcesData && (
          <>
            <Card className="metric-card">
              <p className="metric-label">Rating</p>
              <h2 className="metric-value">{data.codeforcesData.rating} ({data.codeforcesData.rank})</h2>
            </Card>
            <Card className="metric-card">
              <p className="metric-label">Max Rating</p>
              <h2 className="metric-value">{data.codeforcesData.maxRating} ({data.codeforcesData.maxRank})</h2>
            </Card>
          </>
        )}
        {platform === 'leetcode' && data.leetcodeData && (
           <Card className="metric-card">
             <p className="metric-label">Ranking</p>
             <h2 className="metric-value">{data.leetcodeData.ranking}</h2>
           </Card>
        )}
        <Card className="metric-card">
          <p className="metric-label">Problems Solved</p>
          <h2 className="metric-value">{data.performanceMetrics.problemSolved}</h2>
        </Card>
        <Card className="metric-card">
          <p className="metric-label">Accuracy Rate</p>
          <h2 className="metric-value">{data.performanceMetrics.accuracy || 'N/A'}</h2>
        </Card>
      </div>

      <div className="section-grid">
        <Card className="section-card">
          <h3 className="section-title">Summary</h3>
          <p className="summary-text">{data.summary}</p>
        </Card>
        <Card className="section-card">
          <h3 className="section-title">Difficulty Breakdown</h3>
          <ReportChart data={data.difficultyBreakdown} />
        </Card>
      </div>

      <div className="section-grid">
        <Card className="section-card">
          <h3 className="section-title strengths">Strengths 👍</h3>
          <ul className="strengths-list">
            {data.strengths.map((strength: string, index: number) => (
              <li key={index} className="list-item strength-item">{strength}</li>
            ))}
          </ul>
        </Card>
        <Card className="section-card">
          <h3 className="section-title weaknesses">Weaknesses 👎</h3>
          <ul className="weaknesses-list">
            {data.weaknesses.map((weakness: string, index: number) => (
              <li key={index} className="list-item weakness-item">{weakness}</li>
            ))}
          </ul>
        </Card>
        <Card className="section-card">
          <h3 className="section-title">Languages Used</h3>
          <ul className="languages-list">
            {data.performanceMetrics.languages.map((lang: string, index: number) => (
              <li key={index} className="list-item lang-item">{lang}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default ReportPage;