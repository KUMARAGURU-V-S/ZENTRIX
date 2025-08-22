// filepath: d:\GitHub\ZENTRIX\frontend\my-app\src\Report.jsx

import { useState, useEffect } from "react";
import { db } from "./firebase"; // ✅ import initialized Firestore
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

export default function Report() {
  const [reports, setReports] = useState([]);
  const [reportText, setReportText] = useState("");

  // Add a new report
  const addReport = async () => {
    if (!reportText.trim()) {
      alert("⚠️ Report cannot be empty!");
      return;
    }
    try {
      await addDoc(collection(db, "reports"), {
        report: reportText,
        createdAt: serverTimestamp(),
      });
      setReportText("");
      alert("✅ Report added!");
      fetchReports(); // refresh after adding
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  };

  // 📄 Fetch all documents and their data
  const fetchReports = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "reports"));
      const allReports = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReports(allReports);
    } catch (err) {
      console.error("❌ Error fetching reports:", err.message);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>📑 Firestore Reports</h1>

      <input
        type="text"
        value={reportText}
        onChange={(e) => setReportText(e.target.value)}
        placeholder="Enter your report..."
        style={{ padding: "8px", width: "250px" }}
      />
      <button onClick={addReport} style={{ marginLeft: "10px" }}>
        Add Report
      </button>
      <button onClick={fetchReports} style={{ marginLeft: "10px" }}>
        Refresh
      </button>

      <div style={{ marginTop: "20px" }}>
        {reports.map((r) => (
          <p key={r.id} style={{ 
              padding: "10px", 
              border: "1px solid #ddd", 
              borderRadius: "8px", 
              marginBottom: "10px",
              textAlign: "left",
            }}>
            {r.report || "⚠️ No report field"}
            <br />
            <small>
              {r.createdAt?.toDate
                ? r.createdAt.toDate().toLocaleString()
                : "..."}
            </small>
          </p>
        ))}
      </div>
    </div>
  );
}
