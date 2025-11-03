
import Card from '../components/ui/Card.tsx';
import Button from '../components/ui/Button.tsx';
import { FaUserEdit, FaEnvelope, FaCalendarAlt, FaCode, FaTrophy, FaMedal, FaFire, FaBrain, FaGithub, FaLinkedin, FaChartLine, FaStar } from 'react-icons/fa';
import { SiPython, SiJavascript, SiCplusplus, SiRust } from 'react-icons/si';
import { motion, animate } from 'framer-motion';
import { useEffect, useState } from 'react';

function ProfilePage() {
  const [animatedProblems, setAnimatedProblems] = useState(0);
  const [animatedRank, setAnimatedRank] = useState(0);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailsForm, setShowDetailsForm] = useState(false);

  useEffect(() => {
    // Simulate fetching user data
    const fetchUser = async () => {
      // Replace with your actual API call
      const mockUser = {
        name: "Vasanth S",
        username: "vasanth.s",
        email: "vasanth.s@example.com",
        memberSince: "Jan 1, 2024",
        totalProblemsSolved: 1200,
        rank: "#1,234",
        languages: ["Python", "JavaScript", "C++", "Rust"],
        avatarUrl: "https://i.pravatar.cc/150?img=60", // Placeholder avatar
        coverUrl: "https://placehold.co/1700x500", // Placeholder cover
        badges: ["Top Contributor", "Problem Solver", "Code Master"],
        streak: 45,
        achievements: ["First 100 Problems", "Speed Demon", "Consistent Coder"],
        contributionData: Array.from({ length: 365 }, () => Math.floor(Math.random() * 5)), // Mock contribution data
        githubUrl: "https://github.com/vasanths",
        linkedinUrl: "https://linkedin.com/in/vasanths",
        codingPlatformDetails: null, // or {}
      };

      setTimeout(() => {
        setUser(mockUser);
        if (!mockUser.codingPlatformDetails) {
          setShowDetailsForm(true);
        }
        setIsLoading(false);
      }, 1500);
    };

    fetchUser();
  }, []);

  // Animated counters
  useEffect(() => {
    if (user) {
      const controls = animate(0, user.totalProblemsSolved, {
        duration: 2,
        onUpdate: (value) => setAnimatedProblems(Math.floor(value)),
      });
      return controls.stop;
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const controls = animate(0, parseInt(user.rank.slice(1)), {
        duration: 2,
        onUpdate: (value) => setAnimatedRank(Math.floor(value)),
      });
      return controls.stop;
    }
  }, [user]);

  const languageIcons: { [key: string]: React.ReactNode } = {
    "Python": <SiPython />,
    "JavaScript": <SiJavascript />,
    "C++": <SiCplusplus />,
    "Rust": <SiRust />,
  };

  return (
    <motion.div
      className="profile-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="profile-page-container">
        <motion.div
          className="profile-header"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="profile-cover-container">
            <img src={mockUser.coverUrl} alt="Cover" className="profile-cover-image" />
            <div className="profile-cover-overlay"></div>
            <div className="profile-cover-pattern"></div>
            <motion.div
              className="edit-profile-banner-btn"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              whileHover={{ scale: 1.1 }}
            >
              <Button className="edit-profile-btn" icon={<FaUserEdit />}>Edit Profile</Button>
            </motion.div>
          </div>
          <div className="profile-header-content">
            <motion.div
              className="avatar-container"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img src={mockUser.avatarUrl} alt="User Avatar" className="avatar" />
              <div className="avatar-glow"></div>
            </motion.div>
            <div className="user-info">
              <motion.h1
                className="user-name"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {mockUser.name}
              </motion.h1>
              <motion.p
                className="user-username"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                @{mockUser.username}
              </motion.p>
              <motion.div
                className="social-links"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <a href={mockUser.githubUrl} target="_blank" rel="noopener noreferrer" className="social-link">
                  <FaGithub />
                </a>
                <a href={mockUser.linkedinUrl} target="_blank" rel="noopener noreferrer" className="social-link">
                  <FaLinkedin />
                </a>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="profile-body"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="profile-grid">
            <div className="profile-grid-left">
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <Card className="profile-details-card card-hover">
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
              </motion.div>

              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <Card className="profile-languages-card card-hover">
                  <h3 className="card-title">Preferred Languages</h3>
                  <div className="languages-grid">
                    {mockUser.languages.map((lang, index) => (
                      <motion.div
                        key={lang}
                        className="language-badge"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, delay: 1.6 + index * 0.1 }}
                      >
                        {languageIcons[lang]}
                        <span>{lang}</span>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* New Achievement Badges Card */}
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.6 }}
              >
                <Card className="profile-achievements-card card-hover">
                  <h3 className="card-title">Achievements</h3>
                  <div className="achievements-grid">
                    {mockUser.achievements.map((achievement, index) => (
                      <motion.div
                        key={achievement}
                        className="achievement-item"
                        whileHover={{ scale: 1.05 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.8 + index * 0.1 }}
                      >
                        <FaMedal className="achievement-icon" />
                        <span>{achievement}</span>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>

            <div className="profile-grid-right">
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <Card className="profile-stats-card card-hover priority-card">
                  <h3 className="card-title">
                    <FaChartLine className="stats-icon" />
                    Coding Statistics
                  </h3>
                  <div className="stats-grid">
                    <motion.div
                      className="stat-item clickable-stat"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.4 }}
                      onClick={() => alert('Problems Solved: Detailed view coming soon!')}
                    >
                      <FaTrophy className="stat-icon trophy-icon" />
                      <motion.p
                        className="stat-value"
                        key={animatedProblems}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {animatedProblems.toLocaleString()}
                      </motion.p>
                      <p className="stat-label">Problems Solved</p>
                    </motion.div>
                    <motion.div
                      className="stat-item clickable-stat"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.6 }}
                      onClick={() => alert('Global Rank: Detailed view coming soon!')}
                    >
                      <FaCode className="stat-icon code-icon" />
                      <motion.p
                        className="stat-value"
                        key={animatedRank}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        #{animatedRank.toLocaleString()}
                      </motion.p>
                      <p className="stat-label">Global Rank</p>
                    </motion.div>
                  </div>
                  <div className="streak-progress-widget">
                    <div className="streak-circle">
                      <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle
                          cx="40"
                          cy="40"
                          r="35"
                          fill="none"
                          stroke="rgba(230, 57, 70, 0.2)"
                          strokeWidth="6"
                        />
                        <motion.circle
                          cx="40"
                          cy="40"
                          r="35"
                          fill="none"
                          stroke="var(--primary-color)"
                          strokeWidth="6"
                          strokeDasharray={`${2 * Math.PI * 35}`}
                          strokeDashoffset={`${2 * Math.PI * 35 * (1 - mockUser.streak / 100)}`}
                          initial={{ strokeDashoffset: `${2 * Math.PI * 35}` }}
                          animate={{ strokeDashoffset: `${2 * Math.PI * 35 * (1 - mockUser.streak / 100)}` }}
                          transition={{ duration: 2, delay: 1.8 }}
                          strokeLinecap="round"
                          transform="rotate(-90 40 40)"
                        />
                      </svg>
                      <div className="streak-content">
                        <FaFire className="streak-icon" />
                        <span className="streak-number">{mockUser.streak}</span>
                        <span className="streak-label">days</span>
                      </div>
                    </div>
                    <p className="streak-text">Current Streak</p>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <Card className="contribution-graph-card card-hover">
                  <h3 className="card-title">
                    <FaStar className="contribution-icon" />
                    Contribution Graph
                  </h3>
                  <div className="contribution-graph-container">
                    <div className="contribution-graph">
                      {mockUser.contributionData.map((level, index) => (
                        <motion.div
                          key={index}
                          className={`contribution-cell level-${level}`}
                          whileHover={{ scale: 1.2 }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, delay: 1.6 + index * 0.001 }}
                        />
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* New AI Summary Card */}
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.6 }}
              >
                <Card className="ai-summary-card card-hover enhanced-ai-card">
                  <h3 className="card-title ai-gradient-title">
                    <FaBrain className="ai-icon" />
                    AI Summary
                  </h3>
                  <p className="ai-summary-text enhanced-text">
                    Vasanth demonstrates exceptional problem-solving skills with a focus on algorithmic efficiency.
                    Their consistent performance and diverse language proficiency make them a valuable contributor to the coding community.
                  </p>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default ProfilePage;

