const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, projectId, dueDate } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and projectId are required' });
    }

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      projectId,
      dueDate,
    });

    // Send email and in-app notification if task is assigned to a member
    if (assignedTo) {
      try {
        // Create in-app notification
        await Notification.create({
          recipient: assignedTo,
          message: `You have been assigned a new task: "${task.title}"`,
          relatedTask: task._id,
        });

        const assignedUser = await User.findById(assignedTo);
        if (assignedUser && assignedUser.email) {
          const emailMessage = `
            Hello ${assignedUser.name},
            
            You have been assigned a new task: "${task.title}".
            ${task.description ? `\nDescription: ${task.description}` : ''}
            ${task.dueDate ? `\nDue Date: ${new Date(task.dueDate).toLocaleDateString()}` : ''}
            
            Log in to your Team Task Manager to view and start working on it!
          `;

          await sendEmail({
            email: assignedUser.email,
            subject: `New Task Assigned: ${task.title}`,
            message: emailMessage,
          });
        }
      } catch (err) {
        console.error('Failed to send notifications:', err.message);
      }
    }

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { projectId, assignedTo, status } = req.query;

    // Build filter object based on query params
    let filter = {};
    if (projectId) filter.projectId = projectId;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (status) filter.status = status;

    if (req.user.role === 'admin') {
      // Admin only sees tasks from projects THEY created
      const adminProjects = await Project.find({ createdBy: req.user._id }).select('_id');
      const adminProjectIds = adminProjects.map(p => p._id);

      if (filter.projectId) {
        // Verify the requested project belongs to this admin
        const isOwner = adminProjectIds.some(id => id.toString() === filter.projectId);
        if (!isOwner) return res.status(200).json([]);
      } else {
        filter.projectId = { $in: adminProjectIds };
      }
    } else {
      // STRICT ISOLATION: Members ONLY see tasks specifically assigned to them
      filter.assignedTo = req.user._id;

      const userProjects = await Project.find({ members: req.user._id }).select('_id');
      const projectIds = userProjects.map(p => p._id);

      if (filter.projectId) {
        const isMember = projectIds.some(id => id.toString() === filter.projectId);
        if (!isMember) return res.status(200).json([]);
      } else {
        filter.projectId = { $in: projectIds };
      }
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'name')
      .populate('comments.postedBy', 'name');

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const oldStatus = task.status;
    const { title, description, status, assignedTo, projectId, dueDate } = req.body;

    if (req.user.role === 'admin') {
      // Admin can update everything
      if (title) task.title = title;
      if (description) task.description = description;
      if (assignedTo) task.assignedTo = assignedTo;
      if (projectId) task.projectId = projectId;
      if (dueDate) task.dueDate = dueDate;
      if (status) task.status = status;
    } else {
      // Member can only update status
      if (title || description || assignedTo || projectId || dueDate) {
        return res.status(403).json({ message: 'Members can only update task status' });
      }
      if (status) {
        if (status === 'Completed') {
          return res.status(403).json({ message: 'Members cannot mark tasks as Completed directly. Set to "In Review" instead.' });
        }
        task.status = status;
      }
    }

    await task.save();

    // Generate notifications if status changed to "In Review" by a member
    if (status === 'In Review' && oldStatus !== 'In Review' && req.user.role === 'member') {
      try {
        const admins = await User.find({ role: 'admin' });
        const notifications = admins.map((admin) => ({
          recipient: admin._id,
          message: `${req.user.name} has submitted task "${task.title}" for review.`,
          relatedTask: task._id,
        }));
        await Notification.insertMany(notifications);
      } catch (err) {
        console.error('Failed to create notifications:', err.message);
      }
    }

    // Generate notification for member if an Admin updates the status (e.g. to Rework or Completed)
    if (req.user.role === 'admin' && status && status !== oldStatus && task.assignedTo) {
      // Ensure we don't notify the admin about their own action if they are assigned
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        try {
          await Notification.create({
            recipient: task.assignedTo,
            message: `Admin changed your task "${task.title}" status to ${status}`,
            relatedTask: task._id,
          });
        } catch (err) {
          console.error('Failed to create member notification:', err.message);
        }
      }
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();
    res.status(200).json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add a comment to a task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const comment = {
      text,
      postedBy: req.user._id,
    };

    task.comments.push(comment);
    await task.save();

    // Populate the newly added comment's postedBy field
    const updatedTask = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'name')
      .populate('comments.postedBy', 'name');

    res.status(201).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  addComment,
};
