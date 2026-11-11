

import React, { useState, useEffect } from 'react';
import api from './api';
import './index.css';

export default function UnilakSupervisorView() {
  const [logs, setLogs] = useState([]);
  const [comments, setComments] = useState({});
  const [improvements, setImprovements] = useState({}); 
  const [loading, setLoading] = useState(true);
  const [facultyName, setFacultyName] = useState('');

  useEffect(() => {
    api.get('/api/interns')
      .then((res) => {
        setLogs(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Fetch Error:", err);
        setLoading(false);
      });
  }, []);

  const handleCommentChange = (id, text) => {
    setComments(prev => ({ ...prev, [id]: text }));
  };

  const handleImprovementChange = (id, text) => {
    setImprovements(prev => ({ ...prev, [id]: text }));
  };

  const handleEvaluation = (id, approvalStatus) => {
    const currentLog = logs.find(log => log.id === id) || {};
    
    // Fallback directly to lowercase fields coming from the updated PostgreSQL response
    const supervisorComment = comments[id] !== undefined ? comments[id] : (currentLog.supervisorcomment || "");
    const improvementNote = improvements[id] !== undefined ? improvements[id] : (currentLog.improvementnote || "");

    const evaluationPayload = {
      isApproved: approvalStatus,
      supervisorComment,
      improvementNote
    };

    api.put(`/api/interns/${id}`, evaluationPayload)
      .then((res) => {
        alert(`Evaluation successfully submitted as: ${approvalStatus ? 'APPROVED' : 'REJECTED'}`);
        
        setLogs(prevLogs => prevLogs.map((log) => {
          if (log.id === id) {
            return res.data?.updatedIntern ? res.data.updatedIntern : {
              ...log,
              isapproved: approvalStatus,
              supervisorcomment: evaluationPayload.supervisorComment,
              improvementnote: evaluationPayload.improvementNote
            };
          }
          return log;
        }));

        setComments(prev => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
        setImprovements(prev => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
      })
      .catch((err) => {
        console.error("Evaluation submission error:", err);
        alert("Failed to submit review.");
      });
  };

  if (loading) return <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>Loading student tracking data feed...</div>;

  // Filter logs safely using lowercase data keys from Postgres
  const filteredLogs = logs.filter(log => 
    facultyName ? log.faculty?.toLowerCase().includes(facultyName.toLowerCase()) : true
  );

  return (
    <div className="dashboard-container" style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ borderBottom: '2px solid #0056b3', paddingBottom: '10px', color: '#333' }}>
        UNILAK Internship Supervisor Dashboard
      </h2>

      {/* Filter Toolbar */}
      <div style={{ margin: '20px 0', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label htmlFor="facultyFilter" style={{ fontWeight: 'bold' }}>Filter by Faculty:</label>
        <input
          id="facultyFilter"
          type="text"
          placeholder="e.g., Computing, Law, Economic Sciences"
          value={facultyName}
          onChange={(e) => setFacultyName(e.target.value)}
          style={{ padding: '8px', width: '300px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        {facultyName && (
          <button 
            onClick={() => setFacultyName('')} 
            style={{ padding: '8px 12px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Student Log Cards */}
      {filteredLogs.length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic' }}>No student records found matching the filter criteria.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredLogs.map((student) => {
            // Evaluates textareas targeting lowercase field variations
            const displayComment = comments[student.id] !== undefined ? comments[student.id] : (student.supervisorcomment || '');
            const displayImprovement = improvements[student.id] !== undefined ? improvements[student.id] : (student.improvementnote || '');

            return (
              <div 
                key={student.id} 
                style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '8px', 
                  padding: '20px', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  backgroundColor: student.isapproved === true ? '#f3faf4' : student.isapproved === false ? '#fff5f5' : '#fff'
                }}
              >
                {/* Header Details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', color: '#111' }}>{student.studentname || 'Unknown Student'}</h3>
                    <span style={{ fontSize: '14px', color: '#555', backgroundColor: '#e9ecef', padding: '3px 8px', borderRadius: '12px', marginRight: '10px' }}>
                      {student.faculty || 'Faculty Unassigned'}
                    </span>
                    <span style={{ fontSize: '14px', color: '#666' }}>ID: {student.id}</span>
                  </div>
                  <div>
                    <span style={{ 
                      fontWeight: 'bold', 
                      padding: '5px 10px', 
                      borderRadius: '4px',
                      fontSize: '14px',
                      backgroundColor: student.isapproved === true ? '#2e7d32' : student.isapproved === false ? '#c62828' : '#ed6c02',
                      color: '#fff'
                    }}>
                      {student.isapproved === true ? 'APPROVED' : student.isapproved === false ? 'REJECTED' : 'PENDING REVIEW'}
                    </span>
                  </div>
                </div>

                {/* Body Text */}
                <div style={{ marginBottom: '15px' }}>
                  <strong style={{ display: 'block', marginBottom: '5px' }}>Internship Work Details:</strong>
                  <p style={{ margin: '0', color: '#444', backgroundColor: '#fdfdfd', padding: '10px', borderRadius: '4px', border: '1px solid #f0f0f0' }}>
                    {student.weeklylog || 'No work description provided for this period.'}
                  </p>
                </div>

                {/* Evaluation Controls */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>
                      Supervisor Comment:
                    </label>
                    <textarea
                      rows="3"
                      value={displayComment}
                      onChange={(e) => handleCommentChange(student.id, e.target.value)}
                      placeholder="Provide constructive feedback..."
                      style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>
                      Required Improvement Notes:
                    </label>
                    <textarea
                      rows="3"
                      value={displayImprovement}
                      onChange={(e) => handleImprovementChange(student.id, e.target.value)}
                      placeholder="List specific areas for improvement if necessary..."
                      style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>
                </div>

                {/* Actions Footer */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    onClick={() => handleEvaluation(student.id, false)}
                    style={{ padding: '8px 16px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Reject Work Block
                  </button>
                  <button
                    onClick={() => handleEvaluation(student.id, true)}
                    style={{ padding: '8px 16px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Approve Work Block
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
