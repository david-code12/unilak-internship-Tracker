import React, { useState, useEffect } from 'react';
import api from './api';
import './index.css';

export default function HostSupervisorView() {
  const [logs, setLogs] = useState([]);
  const [improvements, setImprovements] = useState({}); // Stores the stage-based improvement comments
  const [ratings, setRatings] = useState({}); // Stores workplace ratings (1-5)
  const [loading, setLoading] = useState(true);

  // 1. Fetch active student logs from your Node/Express server via your API instance
  useEffect(() => {
    api.get('/api/interns')
      .then((res) => {
        setLogs(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Host portal data fetch failure:", err);
        setLoading(false);
      });
  }, []);

  // 2. Track real-time typing of stage-based improvement comments per student ID
  const handleImprovementChange = (id, text) => {
    setImprovements({ ...improvements, [id]: text });
  };

  // 3. Track slider/dropdown adjustments for workplace performance scoring
  const handleRatingChange = (id, score) => {
    setRatings({ ...ratings, [id]: score });
  };

  // 4. Submit Host Evaluation payload (Verification flag, Rating, and Stage Improvement Comment)
  const submitHostFeedback = (id) => {
    const industrialPayload = {
      isVerifiedByHost: true,
      hostRating: parseInt(ratings[id]) || 5,
      hostImprovementNote: improvements[id] || "" // Sends the critical stage-based correction note
    };

    api.put(`/api/interns/${id}`, industrialPayload)
      .then((res) => {
        alert("🏢 Corporate workspace evaluation and stage suggestions saved successfully!");
        // Update local React UI layout state immediately to reflect new database entries
        setLogs(logs.map(log => log.id === id ? res.data.updatedIntern : log));
      })
      .catch((err) => {
        console.error("Failed to submit workplace evaluation:", err);
        alert("Error sending update request to server. Verify your backend put route configuration.");
      });
  };

  if (loading) return <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>Loading assigned intern records...</div>;

  return (
    <div className="dashboard-container" style={{ fontFamily: 'sans-serif', borderLeft: '6px solid #805ad5' }}>
      <h2>Host Organization Portal</h2>
      <h1>Industry / Company Supervisor View</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>Verify daily student presence and submit stage-specific development advice.</p>

      {logs.length === 0 ? (
        <p style={{ padding: '20px', background: '#edf2f7', borderRadius: '4px', textAlign: 'center' }}>No assigned interns found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {logs.map((log) => (
            <div 
              key={log.id} 
              style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}
            >
              {/* Profile Bar Segment */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: '0', color: '#805ad5', fontSize: '1.2rem' }}>{log.studentName}</h3>
                <span style={{ fontSize: '0.85rem', color: '#718096' }}>🆔 Reg: {log.studentRegNumber || 'N/A'}</span>
              </div>

              {/* Student Log Entry Canvas */}
              <p style={{ margin: '5px 0 15px 0', padding: '12px', background: '#f7fafc', borderLeft: '3px solid #cbd5e0', fontStyle: 'italic', color: '#4a5568' }}>
                <strong>Intern Daily Activity:</strong> "{log.weeklyLog}"
              </p>

              <hr style={{ border: 'none', borderTop: '1px dashed #e2e8f0', margin: '15px 0' }} />

              {/* CRITICAL FEATURE: IMPROVEMENT TARGET INPUT FOR CURRENT STAGE */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', color: '#2d3748', marginBottom: '5px' }}>
                  💡 Stage-Based Improvement Needed:
                </label>
                <textarea 
                  rows="2"
                  placeholder="What must this student focus on to improve at this stage? (e.g., Improve speed on server configuration, code documentation, or team reporting...)" 
                  defaultValue={log.hostImprovementNote}
                  onChange={(e) => handleImprovementChange(log.id, e.target.value)}
                  style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #cbd5e0', borderRadius: '4px', fontFamily: 'inherit', fontSize: '14px' }}
                />
              </div>

              {/* Dynamic Workplace Performance Metric Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: '#f7fafc', padding: '12px', borderRadius: '6px' }}>
                
                {/* Score Multiplier Menu */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4a5568' }}>Workplace Performance Score:</label>
                  <select 
                    onChange={(e) => handleRatingChange(log.id, e.target.value)}
                    defaultValue={log.hostRating || 5}
                    style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e0', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
                    <option value="4">⭐⭐⭐⭐ 4 - Very Good</option>
                    <option value="3">⭐⭐⭐ 3 - Good / Fair</option>
                    <option value="2">⭐⭐ 2 - Substandard</option>
                    <option value="1">⭐ 1 - Critical Improvement Required</option>
                  </select>
                </div>

                {/* Tracking Metrics Actions Container */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '0.85rem' }}>
                    {log.isVerifiedByHost ? (
                      <span style={{ color: '#2b6cb0', fontWeight: 'bold', background: '#e2e8f0', padding: '5px 10px', borderRadius: '4px' }}>🏢 Verified & Signed Off</span>
                    ) : (
                      <span style={{ color: '#718096', fontStyle: 'italic' }}>⏳ Awaiting Signature</span>
                    )}
                  </div>

                  <button 
                    onClick={() => submitHostFeedback(log.id)}
                    className="btn btn-approve"
                    style={{ backgroundColor: '#805ad5', padding: '10px 18px', fontSize: '0.9rem' }}
                  >
                    ✔ Verify & Log Assessment
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
