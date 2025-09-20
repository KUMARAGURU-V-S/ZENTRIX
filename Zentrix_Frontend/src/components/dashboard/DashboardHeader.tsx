import Input from '../ui/Input.tsx';
import { FaSearch, FaBell } from 'react-icons/fa';

function DashboardHeader() {
  const mockUser = {
    name: "Vasanthavel",
    avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_white_no_text.svg", // LeetCode logo
  };

  return (
    <header className="dashboard-header-hi-fi">
      <div className="search-bar-hi-fi">
        <FaSearch className="search-icon-hi-fi" />
        <Input type="text" placeholder="Search reports, users..." className="search-input-hi-fi" />
      </div>
      <div className="header-actions-hi-fi">
        <button className="notifications-btn-hi-fi">
          <FaBell />
        </button>
        <div className="user-profile-hi-fi">
          <img src={mockUser.avatarUrl} alt="User Avatar" className="user-avatar-hi-fi" />
          <span className="user-name-header-hi-fi">{mockUser.name}</span>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;