import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FaTachometerAlt, FaHistory, FaUserAlt, FaComments, FaBars, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';
import type { Value } from "react-calendar/dist/shared/types.js";

const generateLoginDates = (numDates: number): Date[] => {
  const dates: Date[] = [];
  const today = new Date();
  for (let i = 0; i < numDates; i++) {
    const randomDaysAgo = Math.floor(Math.random() * 90);
    const randomDate = new Date();
    randomDate.setDate(today.getDate() - randomDaysAgo);
    dates.push(randomDate);
  }
  return dates;
};

const loginDates: Date[] = generateLoginDates(30);

const isSameDay = (a: Date, b: Date) => {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
};

function Sidebar({ onPageChange }: { onPageChange: (page: string) => void }) {
  const [calendarDate, setCalendarDate] = React.useState<Value>(new Date());
  const [activeLink, setActiveLink] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileVisible, setIsMobileVisible] = useState(false);

  const handleCalendarChange = (value: Value) => {
    setCalendarDate(value);
  };

  const handleLinkClick = (page: string) => {
    setActiveLink(page);
    onPageChange(page);
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month' && loginDates.some(d => isSameDay(d, date))) {
      return 'submission-day';
    }
    return null;
  };

  return (
    <motion.aside
      className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileVisible ? 'mobile-visible' : ''}`}
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ boxShadow: "0 0 30px rgba(230, 57, 70, 0.3)" }}
    >
      <div className="sidebar-header">
        <h2 className={isCollapsed ? 'hidden' : ''}>Zentrix</h2>
        <button
          className="sidebar-toggle"
          onClick={() => {
            if (window.innerWidth <= 767) {
              setIsMobileVisible(!isMobileVisible);
            } else {
              setIsCollapsed(!isCollapsed);
            }
          }}
          aria-label={window.innerWidth <= 767 ? (isMobileVisible ? 'Hide sidebar' : 'Show sidebar') : (isCollapsed ? 'Expand sidebar' : 'Collapse sidebar')}
        >
          {window.innerWidth <= 767 ? (isMobileVisible ? <FaTimes /> : <FaBars />) : (isCollapsed ? <FaBars /> : <FaTimes />)}
        </button>
      </div>
      <nav className="nav-menu">
        <ul>
          <li>
            <motion.a
              href="#"
              onClick={() => handleLinkClick('dashboard')}
              className={`nav-link ${activeLink === 'dashboard' ? 'active' : ''}`}
              whileHover={{ scale: 1.05, x: 10 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FaTachometerAlt />
              {!isCollapsed && <span>Dashboard</span>}
            </motion.a>
          </li>
          <li>
            <motion.a
              href="#"
              onClick={() => handleLinkClick('history')}
              className={`nav-link ${activeLink === 'history' ? 'active' : ''}`}
              whileHover={{ scale: 1.05, x: 10 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FaHistory />
              {!isCollapsed && <span>History</span>}
            </motion.a>
          </li>
          <li>
            <motion.a
              href="#"
              onClick={() => handleLinkClick('profile')}
              className={`nav-link ${activeLink === 'profile' ? 'active' : ''}`}
              whileHover={{ scale: 1.05, x: 10 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FaUserAlt />
              {!isCollapsed && <span>Profile</span>}
            </motion.a>
          </li>
          <li>
            <motion.a
              href="#"
              onClick={() => handleLinkClick('chat')}
              className={`nav-link ${activeLink === 'chat' ? 'active' : ''}`}
              whileHover={{ scale: 1.05, x: 10 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FaComments />
              {!isCollapsed && <span>AI Chat</span>}
            </motion.a>
          </li>
        </ul>
      </nav>
      <div className={`calendar-container ${isCollapsed ? 'hidden' : ''}`}>
        <h3>Submission Calendar</h3>
        <Calendar
          onChange={handleCalendarChange}
          value={calendarDate}
          tileClassName={tileClassName}
        />
      </div>
    </motion.aside>
  );
}

export default Sidebar;