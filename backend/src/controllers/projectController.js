const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res) => {
  try {
    const { name, members } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = await Project.create({
      name,
      members: members || [],
      createdBy: req.user._id,
    });

    // Notify all assigned members
    if (members && members.length > 0) {
      try {
        const Notification = require('../models/Notification');
        const notifications = members.map((memberId) => ({
          recipient: memberId,
          message: `You have been added to a new project: "${project.name}"`,
        }));
        await Notification.insertMany(notifications);
      } catch (err) {
        console.error('Failed to create project notifications:', err.message);
      }
    }

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    let filter = {};
    
    if (req.user.role === 'admin') {
      // Admin only sees projects they created
      filter = { createdBy: req.user._id };
    } else {
      // Member only sees projects they are added to
      filter = { members: req.user._id };
    }

    const projects = await Project.find(filter)
      .populate('members', 'name email role')
      .populate('createdBy', 'name email');

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = async (req, res) => {
  try {
    const { name, members } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const oldMembers = project.members.map(m => m.toString());

    if (name) project.name = name;
    if (members) project.members = members;

    await project.save();

    // Check for newly added members to notify them
    if (members) {
      const newMembers = members.filter(m => !oldMembers.includes(m.toString()));
      if (newMembers.length > 0) {
        try {
          const Notification = require('../models/Notification');
          const notifications = newMembers.map((memberId) => ({
            recipient: memberId,
            message: `You have been added to the project: "${project.name}"`,
          }));
          await Notification.insertMany(notifications);
        } catch (err) {
          console.error('Failed to create update project notifications:', err.message);
        }
      }
    }

    const updatedProject = await Project.findById(req.params.id)
      .populate('members', 'name email role')
      .populate('createdBy', 'name email');

    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.deleteOne();
    
    // Cascade delete tasks associated with this project
    await Task.deleteMany({ projectId: req.params.id });

    res.status(200).json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
};
