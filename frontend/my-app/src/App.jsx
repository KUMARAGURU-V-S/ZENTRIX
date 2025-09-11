import Report from './Report.jsx';
import Tasks from './Tasks.jsx';
import TaskScheduler from './TaskScheduler.jsx';
import { useState } from 'react'
import './App.css'


function App() {
  const [count, setCount] = useState(0)
  const [showReport, setShowReport] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [showTaskScheduler, setShowTaskScheduler] = useState(false);

  return (
    <>
      <h1>ZENTRIX </h1>
      <p>Your personal AI asistant for tracking your schedule</p>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={() => {setShowReport(true); setShowTasks(false); setShowTaskScheduler(false);}}>
          Show Firestore Report
        </button>
        <button onClick={() => {setShowTasks(true); setShowReport(false); setShowTaskScheduler(false);}}>
          Show Tasks
        </button>
        <button onClick={() => {setShowTaskScheduler(true); setShowReport(false); setShowTasks(false);}}>
          Show Task Scheduler
        </button>
      </div>
      {showReport && <Report />}
      {showTasks && <Tasks />}
      {showTaskScheduler && <TaskScheduler />}
    </>
  )
}

export default App
