const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  addComment,
} = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, adminOnly, createTask)
  .get(protect, getTasks);

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, adminOnly, deleteTask);

router.route('/:id/comments')
  .post(protect, addComment);

module.exports = router;
