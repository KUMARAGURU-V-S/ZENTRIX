import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import type { Report } from '../App';

interface SubmissionDetailsPageProps {
  submission: Report | null;
  onBack: () => void;
}

function SubmissionDetailsPage({ submission, onBack }: SubmissionDetailsPageProps) {
  if (!submission) {
    return (
      <div>
        <h1>No submission selected</h1>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="submission-details-page">
      <header className="page-header">
        <h1 className="page-title">Submission Details</h1>
        <p className="page-subtitle">Code and analysis for {submission.username}</p>
      </header>

      <div className="section-grid">
        <Card className="section-card">
          <h3 className="section-title">Submitted Code</h3>
          <pre className="code-block">
            <code>
              {`// This is a placeholder for the submitted code.
// In a real application, this would be fetched from an API.

function solve(problem) {
  // ...
}
`}
            </code>
          </pre>
        </Card>
        <Card className="section-card">
          <h3 className="section-title">AI Code Review</h3>
          <div className="ai-review">
            <p><strong>Overall:</strong> A solid solution with good performance.</p>
            <ul>
              <li>
                <strong>Readability:</strong> The code is well-structured and easy to follow.
              </li>
              <li>
                <strong>Efficiency:</strong> The time complexity is optimal, but the space complexity could be improved.
              </li>
              <li>
                <strong>Suggestion:</strong> Consider using an in-place approach to reduce memory usage.
              </li>
            </ul>
          </div>
        </Card>
      </div>

      <div className="back-button-container">
        <Button onClick={onBack}>Go Back</Button>
      </div>
    </div>
  );
}

export default SubmissionDetailsPage;