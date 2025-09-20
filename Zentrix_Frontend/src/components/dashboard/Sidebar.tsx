import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FaTachometerAlt, FaHistory, FaUserAlt } from 'react-icons/fa';
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

  const handleCalendarChange = (value: Value) => {
    setCalendarDate(value);
  };

  const handleLinkClick = (page: string) => {
    setActiveLink(page);
    onPageChange(page);
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month' && loginDates.some(d => isSameDay(d, date))) {
      return 'logged-in-day';
    }
    return null;
  };

  return (
    <aside className="sidebar">
      <h2>Zentrix</h2>
      <nav className="nav-menu">
        <ul>
          <li>
            <a href="#" onClick={() => handleLinkClick('dashboard')} className={`nav-link ${activeLink === 'dashboard' ? 'active' : ''}`}>
              <FaTachometerAlt />
              Dashboard
            </a>
          </li>
          <li>
            <a href="#" onClick={() => handleLinkClick('history')} className={`nav-link ${activeLink === 'history' ? 'active' : ''}`}>
              <FaHistory />
              History
            </a>
          </li>
          <li>
            <a href="#" onClick={() => handleLinkClick('profile')} className={`nav-link ${activeLink === 'profile' ? 'active' : ''}`}>
              <FaUserAlt />
              Profile
            </a>
          </li>
        </ul>
      </nav>
      <div className="calendar-container">
        <h3>Submission Calendar</h3>
        <Calendar 
          onChange={handleCalendarChange} 
          value={calendarDate}
          tileClassName={tileClassName}
        />
      </div>
    </aside>
  );
}

export default Sidebar;