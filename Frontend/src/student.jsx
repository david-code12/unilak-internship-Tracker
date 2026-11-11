import React, { useState } from 'react';
import api from './api';

export default function StudentLogSubmission() {
  // 1. Add faculty to your state tracking
  const [formData, setFormData] = useState({
    studentName: '',
    faculty: '', // New field tracking state
    companyName: '',
    weeklyLog: '',
    regNumber: ''
    
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 2. Submit the log to your backend POST route
    api.post('/api/interns', formData)
      .then((res) => {
        alert('Log successfully submitted!');
        // Reset form
        setFormData({ studentName: '', faculty: '', companyName: '', weeklyLog: '' });
      })
      .catch((err) => {
        console.error(err);
        alert('Failed to submit log.');
      });
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '20px auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <h2>Submit Internship Weekly Log</h2>

      <div>
        <label style={{ display: 'block', fontWeight: 'bold' }}>Full Name:</label>
        <input 
          type="text" 
          name="studentName" 
          value={formData.studentName} 
          onChange={handleChange} 
          required 
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      {/* NEW: Student enters or selects their faculty right here */}
      <div>
        <label style={{ display: 'block', fontWeight: 'bold' }}>Faculty:</label>
        <select 
          name="faculty" 
          value={formData.faculty} 
          onChange={handleChange} 
          required 
          style={{ width: '100%', padding: '8px' }}
        >
          <option value="" disabled>-- Select Your Faculty --</option>
          <option value="Computing">Faculty of Computing & Information Technology</option>
          <option value="Law">Faculty of Law</option>
          <option value="Economic Sciences">Faculty of Economic Sciences & Management</option>
          <option value="Environmental Studies">Faculty of Environmental Studies</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', fontWeight: 'bold' }}>Company Name:</label>
        <input 
          type="text" 
          name="companyName" 
          value={formData.companyName} 
          onChange={handleChange} 
          required 
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontWeight: 'bold' }}>Weekly Log Details:</label>
        <textarea 
          name="weeklyLog" 
          rows="5" 
          value={formData.weeklyLog} 
          onChange={handleChange} 
          required 
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <button type="submit" style={{ padding: '10px', background: '#0056b3', color: 'white', border: 'none', cursor: 'pointer' }}>
        Submit Log
      </button>
    </form>
  );
}
