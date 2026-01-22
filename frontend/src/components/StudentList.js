import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/students')
      .then(res => setStudents(res.data || []))
      .catch(err => {
        console.error('Error fetching students:', err);
        setStudents([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const deleteStudent = (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    axios.delete(`http://localhost:5000/api/students/${id}`)
      .then(() => {
        setStudents(prev => prev.filter(s => s._id !== id));
      })
      .catch(err => {
        console.error('Error deleting student:', err);
        alert('Could not delete student.');
      });
  };

  return (
    <div>
      <h2>Students List</h2>
      <div className="add-btn-container">
        <Link to="/add">
          <button>Add New Student</button>
        </Link>
        <button onClick={fetchStudents} style={{ marginLeft: 10 }}>🔄 Refresh</button>
      </div>

      {loading ? (
        <p>Loading students...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Age</th><th>Department</th><th>Email</th><th>Phone</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map(s => (
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td>{s.age}</td>
                  <td>{s.department}</td>
                  <td>{s.email}</td>
                  <td>{s.phone}</td>
                  <td>
                    <Link to={`/edit/${s._id}`}>Edit</Link>
                    <button onClick={() => deleteStudent(s._id)} style={{background: '#dc3545', padding: '5px 10px', marginLeft: '6px'}}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="empty-state">No students found</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default StudentList;