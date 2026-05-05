const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, adminOnly, createProject)
  .get(protect, getProjects);

router.route('/:id')
  .put(protect, adminOnly, updateProject)
  .delete(protect, adminOnly, deleteProject);

module.exports = router;
