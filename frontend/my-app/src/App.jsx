import Report from './Report.jsx';
import { useState } from 'react'
import './App.css'


function App() {
  const [count, setCount] = useState(0)
  const [showReport, setShowReport] = useState(false);

  return (
    <>
      <h1>ZENTRIX </h1>
      <p>Your personal AI asistant for tracking your schedule</p>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={() => setShowReport(true)}>
          Show Firestore Report
        </button>
      </div>
      {showReport && <Report />}
    </>
  )
}

export default App
