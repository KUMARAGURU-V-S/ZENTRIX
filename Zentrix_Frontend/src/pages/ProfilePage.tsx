
import Card from '../components/ui/Card.tsx';
import Button from '../components/ui/Button.tsx';
import { FaUserEdit, FaEnvelope, FaCalendarAlt, FaCode, FaTrophy } from 'react-icons/fa';
import { SiPython, SiJavascript, SiCplusplus, SiRust } from 'react-icons/si';

function ProfilePage() {
  const mockUser = {
    name: "Vasanth S",
    username: "vasanth.s",
    email: "vasanth.s@example.com",
    memberSince: "Jan 1, 2024",
    totalProblemsSolved: 1200,
    rank: "#1,234",
    languages: ["Python", "JavaScript", "C++", "Rust"],
    avatarUrl: "https://i.pravatar.cc/150?img=60", // Placeholder avatar
    coverUrl: "https://placehold.co/1200x300", // Placeholder cover
  };

  const languageIcons: { [key: string]: React.ReactNode } = {
    "Python": <SiPython />,
    "JavaScript": <SiJavascript />,
    "C++": <SiCplusplus />,
    "Rust": <SiRust />,
  };

  return (
    <div className="profile-page">
      <div className="profile-page-container">
        <div className="profile-header">
          <img src={mockUser.coverUrl} alt="Cover" className="profile-cover-image" />
          <div className="profile-header-content">
            <div className="avatar-container">
              <img src={mockUser.avatarUrl} alt="User Avatar" className="avatar" />
            </div>
            <div className="user-info">
              <h1 className="user-name">{mockUser.name}</h1>
              <p className="user-username">@{mockUser.username}</p>
            </div>
            <Button className="edit-profile-btn" icon={<FaUserEdit />}>Edit Profile</Button>
          </div>
        </div>

        <div className="profile-body">
          <div className="profile-grid">
            <div className="profile-grid-left">
              <Card className="profile-details-card">
                <h3 className="card-title">Personal Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <FaEnvelope className="info-icon" />
                    <div>
                      <p className="info-label">Email</p>
                      <p className="info-value">{mockUser.email}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <FaCalendarAlt className="info-icon" />
                    <div>
                      <p className="info-label">Member Since</p>
                      <p className="info-value">{mockUser.memberSince}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="profile-languages-card">
                <h3 className="card-title">Preferred Languages</h3>
                <div className="languages-grid">
                  {mockUser.languages.map((lang) => (
                    <div key={lang} className="language-badge">
                      {languageIcons[lang]}
                      <span>{lang}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="profile-grid-right">
              <Card className="profile-stats-card">
                <h3 className="card-title">Coding Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <FaTrophy className="stat-icon trophy-icon" />
                    <p className="stat-value">{mockUser.totalProblemsSolved}</p>
                    <p className="stat-label">Problems Solved</p>
                  </div>
                  <div className="stat-item">
                    <FaCode className="stat-icon code-icon" />
                    <p className="stat-value">{mockUser.rank}</p>
                    <p className="stat-label">Global Rank</p>
                  </div>
                </div>
              </Card>

              <Card className="contribution-graph-card">
                <h3 className="card-title">Contribution Graph</h3>
                {/* Placeholder for contribution graph */}
                <div className="contribution-graph-placeholder">
                  Contribution graph will be here.
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
