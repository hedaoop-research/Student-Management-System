import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const BACKEND = 'http://localhost:5000'; // ensure backend origin

function AttendanceDashboard() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(''); // format YYYY-MM
  const [search, setSearch] = useState('');
  const debounceRef = useRef(null);

  const fetchAttendance = async (m = month, s = search) => {
    setLoading(true);
    try {
      const params = {};
      if (m) params.month = m;
      if (s) params.student = s;
      const res = await axios.get(`${BACKEND}/api/attendance`, { params });
      setAttendance(res.data || []);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance('', ''); // initial load: all records
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounce when search or month change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchAttendance(month, search);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, month]);

  const deleteAttendance = (id) => {
    if (!window.confirm('Delete this attendance record?')) return;
    axios.delete(`${BACKEND}/api/attendance/${id}`)
      .then(() => setAttendance(prev => prev.filter(a => a._id !== id)))
      .catch(err => {
        console.error('Error deleting attendance:', err);
        alert('Could not delete record.');
      });
  };

  const statusColor = (s) => {
    if (s === 'Present') return '#d4edda';
    if (s === 'Absent') return '#f8d7da';
    if (s === 'Leave') return '#fff3cd';
    return '#fff';
  };

  return (
    <div>
      <h2>📊 Attendance Dashboard</h2>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <label>
          Month:
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{ marginLeft: 8 }}
          />
        </label>

        <label>
          Search student:
          <input
            type="search"
            placeholder="Name or ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginLeft: 8 }}
          />
        </label>

        <button onClick={() => fetchAttendance(month, search)}>🔄 Apply</button>
        <button onClick={() => { setMonth(''); setSearch(''); fetchAttendance('', ''); }}>Reset</button>
      </div>

      {loading ? <p>Loading attendance...</p> : (
        <table>
          <thead>
            <tr>
              <th>Student</th><th>Date</th><th>Status</th><th>Remarks</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {attendance.length ? attendance.map(a => (
              <tr key={a._id} style={{ backgroundColor: statusColor(a.status) }}>
                <td>{a.studentId?.name || (a.studentId || 'Unknown')}</td>
                <td>{new Date(a.date).toLocaleDateString()}</td>
                <td><strong>{a.status}</strong></td>
                <td>{a.remarks || '-'}</td>
                <td>
                  <button onClick={() => deleteAttendance(a._id)} style={{background:'#dc3545', color:'#fff', padding:'6px 10px'}}>Delete</button>
                </td>
              </tr>
            )) : <tr><td colSpan="5" className="empty-state">No attendance records</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AttendanceDashboard;