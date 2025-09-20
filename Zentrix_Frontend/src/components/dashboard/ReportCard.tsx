import Card from '../ui/Card';
import { FaChevronRight } from 'react-icons/fa';
import type { Report } from '../../App';

type ReportCardProps = {
  report: Report;
  onSelectReport: (report: Report) => void;
};

function ReportCard({ report, onSelectReport }: ReportCardProps) {
  return (
    <Card className="report-card" onClick={() => onSelectReport(report)}>
      <div className="report-info">
        <h3>Report for {report.username}</h3>
        <p>Generated on {report.date}</p>
      </div>
      <FaChevronRight className="icon" />
    </Card>
  );
}

export default ReportCard;