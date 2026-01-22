import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

function StudentForm() {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    department: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`http://localhost:5000/api/students/${id}`)
        .then(res => {
          const d = res.data;
          setFormData({
            name: d.name || '',
            age: d.age || '',
            department: d.department || '',
            email: d.email || '',
            phone: d.phone || ''
          });
        })
        .catch(err => console.error('Error fetching student:', err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    setError('');
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isNameValid = (name) => {
    return typeof name === 'string' && !/\d/.test(name);
  };

  const isPhoneValid = (value) => {
    if (!value) return true; // allow empty phone; change if required
    const pn = parsePhoneNumberFromString(value); // prefer user to enter +country format, or pass default country if needed
    return !!pn && pn.isPossible() && pn.isValid();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!isNameValid(formData.name)) {
      setError('Name must not contain numbers');
      return;
    }
    if (!isPhoneValid(formData.phone)) {
      setError('Phone number is invalid or too long for the country. Include country code (e.g. +91) or use a correct local format.');
      return;
    }

    setLoading(true);
    const req = id
      ? axios.put(`http://localhost:5000/api/students/${id}`, formData)
      : axios.post('http://localhost:5000/api/students', formData);

    req.then(() => {
        navigate('/');
      })
      .catch(err => {
        const msg = err?.response?.data?.message || 'Error saving student.';
        setError(msg);
        console.error('Error saving student:', err);
      })
      .finally(() => setLoading(false));
  };

  // show error above the form
  return (
    <div style={{ maxWidth: '600px', margin: '20px auto' }}>
      <h2>{id ? 'Edit Student' : 'Add New Student'}</h2>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {loading && <p>Loading...</p>}
      <form onSubmit={handleSubmit}>
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
        <input name="age" type="number" value={formData.age} onChange={handleChange} placeholder="Age" required />
        <input name="department" value={formData.department} onChange={handleChange} placeholder="Department" required />
        <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
        <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" required />
        <div className="form-buttons">
          <button type="submit" disabled={loading}>{id ? 'Update' : 'Add'} Student</button>
          <button type="button" onClick={() => navigate('/')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
export default StudentForm;