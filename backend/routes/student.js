const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// helper: reject names that contain any digit
const isNameValid = (name) => {
  return typeof name === 'string' && !/\d/.test(name);
};

// GET all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single student
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE student
router.post('/', async (req, res) => {
  // server-side validation
  if (!isNameValid(req.body.name)) {
    return res.status(400).json({ message: 'Name must not contain numbers' });
  }

  const student = new Student(req.body);
  try {
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE student
router.put('/:id', async (req, res) => {
  try {
    // server-side validation for updates (if name provided)
    if (req.body.name && !isNameValid(req.body.name)) {
      return res.status(400).json({ message: 'Name must not contain numbers' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    Object.assign(student, req.body);
    const updatedStudent = await student.save();
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE student
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted', student });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
