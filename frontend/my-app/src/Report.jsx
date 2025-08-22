// filepath: d:\GitHub\ZENTRIX\frontend\my-app\src\Report.jsx

import { useState, useEffect } from "react";
import { db } from "./firebase"; // ✅ import initialized Firestore
import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

export default function Report() {
  const [reports, setReports] = useState([]);

  // Add a test report
  const addReport = async () => {
    try {
      await addDoc(collection(db, "reports"), {
        title: "Test Report",
        createdAt: new Date().toISOString(),
      });
      alert("✅ Report added!");
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  };

  // Fetch reports
  const fetchReports = async () => {
    try {
      const snapshot = await getDocs(collection(db, "reports"));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReports(list);
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📑 Firestore Report Test</h2>
      <button onClick={addReport}>Add Report</button>
      <button onClick={fetchReports} style={{ marginLeft: "10px" }}>
        Fetch Reports
      </button>

      <ul style={{ marginTop: "20px" }}>
        {reports.map((r) => (
          <li key={r.id}>
            {r.title} – {r.createdAt}
          </li>
        ))}
      </ul>
    </div>
  );
}
