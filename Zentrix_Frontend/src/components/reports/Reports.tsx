import Card from "../ui/Card";
import Button from "../ui/Button";
import ReportChart from "./ReportChart";

type ReportProps = {
  reportData: {
    error?: string;
    username: string;
    performanceMetrics: {
      problemSolved: number;
      averageTime: string | number;
      accuracy: string | number;
      languages: string[];
    };
    summary: string;
    difficultyBreakdown: Record<string, number>; // Example: { easy: 10, medium: 5, hard: 2 }
    strengths: string[];
    weaknesses: string[];
  };
  onBack: () => void;
};

function Report({ reportData, onBack }: ReportProps) {
  if (reportData.error) {
    return (
      <Card className="text-center text-red-400">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p>{reportData.error}</p>
        <Button onClick={onBack}>
          Go Back
        </Button>
      </Card>
    );
  }

  const difficultyData = Object.entries(reportData.difficultyBreakdown).map(
    ([difficulty, count]) => ({
      difficulty,
      count,
    })
  );

  return (
    <div className="space-y-8">
      <header className="border-b border-gray-700 pb-6 mb-8">
        <h1 className="text-4xl font-extrabold text-white">
          Performance Overview
        </h1>
        <p className="text-md text-gray-400 mt-2">
          Report for{" "}
          <span className="font-bold text-primary">{reportData.username}</span>
        </p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center">
          <p className="text-sm text-gray-400">Problems Solved</p>
          <h2 className="text-5xl font-extrabold mt-2 text-primary">
            {reportData.performanceMetrics.problemSolved}
          </h2>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-400">Avg. Time</p>
          <h2 className="text-5xl font-extrabold mt-2 text-primary">
            {reportData.performanceMetrics.averageTime}
          </h2>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-400">Accuracy Rate</p>
          <h2 className="text-5xl font-extrabold mt-2 text-primary">
            {reportData.performanceMetrics.accuracy}
          </h2>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-gray-400">Languages Used</p>
          <h2 className="text-5xl font-extrabold mt-2 text-primary">
            {reportData.performanceMetrics.languages.length}
          </h2>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-bold mb-4 text-white">Summary</h3>
          <p className="text-gray-300 leading-relaxed">{reportData.summary}</p>
        </Card>
        <Card>
          <h3 className="text-xl font-bold mb-4 text-white">
            Difficulty Breakdown
          </h3>
          <ReportChart data={difficultyData} />
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-bold mb-4 text-primary">Strengths 👍</h3>
          <ul className="list-none p-0 space-y-3">
            {reportData.strengths.map((strength, index) => (
              <li
                key={index}
                className="bg-gray-700 p-3 rounded-lg border-l-4 border-primary"
              >
                {strength}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="text-xl font-bold mb-4 text-primary">Weaknesses 👎</h3>
          <ul className="list-none p-0 space-y-3">
            {reportData.weaknesses.map((weakness, index) => (
              <li
                key={index}
                className="bg-gray-700 p-3 rounded-lg border-l-4 border-red-500"
              >
                {weakness}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="text-center mt-8">
        <Button onClick={onBack}>Go Back</Button>
      </div>
    </div>
  );
}

export default Report;
