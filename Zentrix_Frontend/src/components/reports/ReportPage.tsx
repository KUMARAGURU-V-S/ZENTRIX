import Card from '../ui/Card';
import Button from '../ui/Button';
import ReportChart from './ReportChart';
import "../../styles/components.css";
import type { Report, ErrorReport } from '../../App';
import jsPDF from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';

applyPlugin(jsPDF);
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
    try {
      const doc = new jsPDF();

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

    // Professional Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(197, 163, 47); // Gold color
    doc.text('ZENTRIX', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 10;
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Performance Report', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Generated on ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 20;

    // User Information Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('User Information', 20, yPosition);

    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    // Avatar placeholder (since we can't embed images easily in jsPDF without base64)
    doc.setFillColor(197, 163, 47);
    doc.rect(20, yPosition, 30, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('👤', 35, yPosition + 20, { align: 'center' });

    // User details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Name: ${data.username}`, 60, yPosition + 10);
    doc.text(`Platform: ${platform.charAt(0).toUpperCase() + platform.slice(1)}`, 60, yPosition + 20);

    if (platform === 'codeforces' && data.codeforcesData) {
      doc.text(`Current Rating: ${data.codeforcesData.rating} (${data.codeforcesData.rank})`, 60, yPosition + 30);
      doc.text(`Max Rating: ${data.codeforcesData.maxRating} (${data.codeforcesData.maxRank})`, 60, yPosition + 40);
      yPosition += 50;
    } else if (platform === 'leetcode' && data.leetcodeData) {
      doc.text(`Ranking: ${data.leetcodeData.ranking}`, 60, yPosition + 30);
      doc.text(`Total Solved: ${data.leetcodeData.totalSolved}`, 60, yPosition + 40);
      yPosition += 50;
    } else {
      yPosition += 40;
    }

    // Performance Metrics Table
    yPosition += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Performance Metrics', 20, yPosition);
    yPosition += 10;

    const metricsData = [
      ['Problems Solved', data.performanceMetrics.problemSolved.toString()],
      ['Accuracy Rate', data.performanceMetrics.accuracy || 'N/A'],
      ['Average Time', data.performanceMetrics.averageTime || 'N/A']
    ];

    doc.autoTable({
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: metricsData,
      theme: 'grid',
      headStyles: {
        fillColor: [197, 163, 47],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 5
      },
      margin: { left: 20, right: 20 }
    });

    yPosition = doc.lastAutoTable.finalY + 20;

    // Difficulty Breakdown Table
    if (data.difficultyBreakdown && data.difficultyBreakdown.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Difficulty Breakdown', 20, yPosition);
      yPosition += 10;

      const difficultyData = data.difficultyBreakdown.map(item => [
        item.difficulty,
        item.count.toString()
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['Difficulty', 'Problems Solved']],
        body: difficultyData,
        theme: 'grid',
        headStyles: {
          fillColor: [197, 163, 47],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 5
        },
        margin: { left: 20, right: 20 }
      });

      yPosition = doc.lastAutoTable.finalY + 20;
    }

    // Strengths Section
    if (data.strengths && data.strengths.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 139, 34); // Green color
      doc.text('Strengths', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);

      data.strengths.forEach((strength) => {
        doc.text(`• ${strength}`, 30, yPosition);
        yPosition += 8;
      });

      yPosition += 10;
    }

    // Weaknesses Section
    if (data.weaknesses && data.weaknesses.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 20, 60); // Crimson color
      doc.text('Areas for Improvement', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);

      data.weaknesses.forEach((weakness) => {
        doc.text(`• ${weakness}`, 30, yPosition);
        yPosition += 8;
      });

      yPosition += 10;
    }

    // Languages Used Section
    if (data.performanceMetrics.languages && data.performanceMetrics.languages.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Programming Languages Used', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      data.performanceMetrics.languages.forEach((lang) => {
        doc.text(`• ${lang}`, 30, yPosition);
        yPosition += 8;
      });

      yPosition += 10;
    }

    // Summary Section
    if (data.summary) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const summaryLines = doc.splitTextToSize(data.summary, pageWidth - 40);
      doc.text(summaryLines, 20, yPosition);
    }

    // Footer
    const footerY = pageHeight - 20;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Report generated by Zentrix on ${new Date().toLocaleString()}`, pageWidth / 2, footerY, { align: 'center' });

    doc.save(`${data.username}_zentrix_report.pdf`);
    } catch (error) {
      console.error('Error during PDF export:', error);
      alert('Failed to export PDF. Please check the console for details.');
    }
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