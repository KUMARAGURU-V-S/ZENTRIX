import Card from "../ui/Card";
import { FaChevronRight } from "react-icons/fa";
import type { Report } from "../../App";

interface RecentReportsListProps {
  reports: Report[];
  onSelectReport: (report: Report) => void;
}

function RecentReportsList({ reports, onSelectReport }: RecentReportsListProps) {
  return (
    <div className="reports-list-container">
      <h2 className="list-title">Recent Reports</h2>
      <div className="list-container">
        {reports.map((report) => (
          <Card
            key={report.id}
            onClick={() => onSelectReport(report)}
            className="report-card-hover"
          >
            <div className="card-content">
              <div>
                <h3 className="card-title">
                  {report.username}
                </h3>
                <p className="card-subtitle">
                  Generated on {report.date}
                </p>
              </div>
              <FaChevronRight className="chevron-icon" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default RecentReportsList;