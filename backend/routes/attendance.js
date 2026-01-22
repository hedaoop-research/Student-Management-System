const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student'); // added

// Mark attendance
router.post('/', async (req, res) => {
  const attendance = new Attendance(req.body);
  try {
    const newAttendance = await attendance.save();
    res.status(201).json(newAttendance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get attendance by student
router.get('/student/:studentId', async (req, res) => {
  try {
    const attendance = await Attendance.find({ studentId: req.params.studentId })
      .sort({ date: -1 });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all attendance (supports ?month=YYYY-MM and ?student=<name|id>)
router.get('/', async (req, res) => {
  try {
    const { month, student } = req.query;
    const filter = {};

    // filter by month: expect YYYY-MM
    if (month) {
      // build start and end of month in UTC
      const [year, mon] = month.split('-').map(Number);
      if (!isNaN(year) && !isNaN(mon)) {
        const start = new Date(Date.UTC(year, mon - 1, 1, 0, 0, 0));
        const end = new Date(Date.UTC(year, mon, 1, 0, 0, 0)); // next month
        filter.date = { $gte: start, $lt: end };
      }
    }

    // filter by student: if student looks like ObjectId use directly, otherwise lookup ids by name regex
    if (student) {
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(student)) {
        filter.studentId = student;
      } else {
        // find student ids that match name (case-insensitive partial)
        const matched = await Student.find({ name: { $regex: student, $options: 'i' } }, { _id: 1 }).lean();
        const ids = matched.map(m => m._id);
        // If no matched students, return empty result
        if (ids.length === 0) {
          return res.json([]);
        }
        filter.studentId = { $in: ids };
      }
    }

    const attendance = await Attendance.find(filter)
      .populate('studentId', 'name email department') // populate only needed fields
      .sort({ date: -1 })
      .lean();

    res.json(attendance);
  } catch (err) {
    console.error('Attendance GET error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get attendance stats
router.get('/stats/:studentId', async (req, res) => {
  try {
    const attendance = await Attendance.find({ studentId: req.params.studentId });
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'Present').length;
    const absent = attendance.filter(a => a.status === 'Absent').length;
    const leave = attendance.filter(a => a.status === 'Leave').length;
    
    res.json({
      total,
      present,
      absent,
      leave,
      percentage: total > 0 ? ((present / total) * 100).toFixed(2) : 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update attendance
router.put('/:id', async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(attendance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete attendance
router.delete('/:id', async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Attendance deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;