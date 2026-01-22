import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AttendanceForm() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Present');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/api/students')
      .then(res => setStudents(res.data || []))
      .catch(err => {
        console.error('Error fetching students:', err);
        setStudents([]);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert('Please select a student');
      return;
    }
    setLoading(true);
    axios.post('http://localhost:5000/api/attendance', {
      studentId: selectedStudent,
      date: new Date(date),
      status,
      remarks
    })
    .then(() => {
      alert('Attendance marked successfully!');
      setSelectedStudent('');
      setStatus('Present');
      setRemarks('');
      setDate(new Date().toISOString().split('T')[0]);
    })
    .catch(err => {
      console.error('Error marking attendance:', err);
      alert('Could not mark attendance.');
    })
    .finally(() => setLoading(false));
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto' }}>
      <h2>✅ Mark Attendance</h2>
      <form onSubmit={handleSubmit}>
        <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} required>
          <option value="">Select Student</option>
          {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>

        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>Present</option>
          <option>Absent</option>
          <option>Leave</option>
        </select>

        <input type="text" placeholder="Remarks (optional)" value={remarks} onChange={(e) => setRemarks(e.target.value)} />

        <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Mark Attendance'}</button>
      </form>
    </div>
  );
}

export default AttendanceForm;