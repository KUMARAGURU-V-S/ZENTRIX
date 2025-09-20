import Card from '../components/ui/Card.tsx';
import Button from '../components/ui/Button.tsx';
import { FaHistory } from 'react-icons/fa';

import type { Report } from '../App';

function HistoryPage({ reports, onSelectReport }: { reports: Report[]; onSelectReport: (report: Report) => void }) {
  return (
    <div className="history-page">
      <header className="page-header">
        <h1 className="page-title">History</h1>
        <p className="page-subtitle">View your past performance reports.</p>
      </header>

      <div className="history-list">
        {reports.length > 0 ? (
          reports.map(report => (
            <Card key={report.id} className="report-history-card" onClick={() => onSelectReport(report)}>
              <div className="history-card-content">
                <div>
                  <h3 className="history-card-title">{report.username}</h3>
                  <p className="history-card-date">Generated on {report.date}</p>
                </div>
                <Button onClick={() => onSelectReport(report)}>View Report</Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="empty-history-card">
            <div className="empty-history-content">
              <FaHistory className="empty-history-icon" />
              <h2 className="empty-history-title">No History Yet</h2>
              <p className="empty-history-text">
                It looks like you haven't generated any reports yet.
              </p>
              <Button>
                Generate Your First Report
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default HistoryPage;