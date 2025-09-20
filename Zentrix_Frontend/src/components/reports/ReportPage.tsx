import Card from '../ui/Card';
import Button from '../ui/Button';
import ReportChart from './ReportChart';
import "../../styles/components.css";
import type { Report, ErrorReport } from '../../App';

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

  return (
    <div className="report-dashboard">
      <header className="report-header">
        <h1 className="report-title">Performance Overview</h1>
        <p className="report-subtitle">Report for <span className="username">{data.username}</span></p>
      </header>

      <div className="metrics-grid">
        <Card className="metric-card">
          <p className="metric-label">Problems Solved</p>
          <h2 className="metric-value">{data.performanceMetrics.problemSolved}</h2>
        </Card>
        <Card className="metric-card">
          <p className="metric-label">Avg. Time</p>
          <h2 className="metric-value">{data.performanceMetrics.averageTime}</h2>
        </Card>
        <Card className="metric-card">
          <p className="metric-label">Accuracy Rate</p>
          <h2 className="metric-value">{data.performanceMetrics.accuracy}</h2>
        </Card>
        <Card className="metric-card">
          <p className="metric-label">Languages Used</p>
          <h2 className="metric-value">{data.performanceMetrics.languages.length}</h2>
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
      </div>

      <div className="back-button-container">
        <Button onClick={onBack} loading={false}>Go Back</Button>
      </div>
    </div>
  );
}

export default ReportPage;