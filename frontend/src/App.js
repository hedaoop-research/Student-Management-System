import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import StudentList from './components/StudentList';
import StudentForm from './components/StudentForm';
import AttendanceForm from './components/AttendanceForm';
import AttendanceDashboard from './components/AttendanceDashboard';
import './App.css';

function App() {
  return (
    <Router>
      
        <div className='App'>
          <h1 >Student Management System</h1>
          <nav className="navbar">
            <Link to="/"> Students</Link>
            <Link to="/mark-attendance"> Mark Attendance</Link>
            <Link to="/attendance-dashboard"> Dashboard</Link>
          </nav>

          <Routes>
            <Route path="/" element={<StudentList />} />
            <Route path="/add" element={<StudentForm />} />
            <Route path="/edit/:id" element={<StudentForm />} />
            <Route path="/mark-attendance" element={<AttendanceForm />} />
            <Route path="/attendance-dashboard" element={<AttendanceDashboard />} />
          </Routes>
        </div>
    </Router>
  );
}

export default App;
