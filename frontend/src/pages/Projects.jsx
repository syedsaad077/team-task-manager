import { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';

const Projects = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Create/Edit Project State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [createError, setCreateError] = useState('');
  
  // Members State
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/projects');
      setProjects(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/users');
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users for project assignment', err);
    }
  };

  useEffect(() => {
    fetchProjects();
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const handleMemberToggle = (userId) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (!newProjectName.trim()) {
      setCreateError('Project name is required');
      return;
    }

    try {
      if (editingProjectId) {
        await API.put(`/projects/${editingProjectId}`, { 
          name: newProjectName, 
          members: selectedMembers 
        });
      } else {
        await API.post('/projects', { 
          name: newProjectName, 
          members: selectedMembers 
        });
      }
      resetForm();
      fetchProjects(); // Refresh the list
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to save project');
    }
  };

  const resetForm = () => {
    setNewProjectName('');
    setSelectedMembers([]);
    setEditingProjectId(null);
    setShowCreateForm(false);
  };

  const handleEditClick = (project) => {
    setNewProjectName(project.name);
    setSelectedMembers(project.members?.map(m => m._id) || []);
    setEditingProjectId(project._id);
    setShowCreateForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project? This will also delete all tasks associated with it. This action cannot be undone.')) {
      try {
        await API.delete(`/projects/${id}`);
        fetchProjects();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete project');
      }
    }
  };

  if (loading && projects.length === 0) {
    return <div className="p-6 text-slate-500">Loading projects...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Projects</h2>
        {user?.role === 'admin' && (
          <button 
            onClick={() => {
              if (showCreateForm) {
                resetForm();
              } else {
                setShowCreateForm(true);
              }
            }}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors shadow-md"
          >
            {showCreateForm ? 'Cancel' : 'Create Project'}
          </button>
        )}
      </div>

      {error && <div className="text-red-500">{error}</div>}

      {showCreateForm && user?.role === 'admin' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6 max-w-lg transition-colors duration-200">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
            {editingProjectId ? 'Edit Project' : 'New Project'}
          </h3>
          {createError && <div className="text-red-500 text-sm mb-3">{createError}</div>}
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Name *</label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-indigo-500 focus:border-primary outline-none transition-all dark:bg-slate-700 dark:text-white"
                placeholder="Enter project name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Members</label>
              <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-600 rounded-lg p-2 bg-slate-50 dark:bg-slate-700/50 space-y-1">
                {users.map(u => (
                  <label key={u._id} className="flex items-center space-x-3 p-2 hover:bg-white dark:hover:bg-slate-700 rounded cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      checked={selectedMembers.includes(u._id)}
                      onChange={() => handleMemberToggle(u._id)}
                      className="w-4 h-4 text-primary rounded border-slate-300 dark:border-slate-500 focus:ring-primary dark:focus:ring-indigo-500 dark:bg-slate-600"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-200">{u.name} <span className="text-slate-400 dark:text-slate-400 text-xs">({u.email})</span></span>
                  </label>
                ))}
                {users.length === 0 && <div className="text-sm text-slate-500 p-2">No users found.</div>}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark dark:hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors mt-2"
            >
              Save Project
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 && !loading ? (
          <div className="text-slate-500 dark:text-slate-400 col-span-full">No projects found.</div>
        ) : (
          projects.map((project) => (
            <ProjectCard 
              key={project._id} 
              project={project} 
              isAdmin={user?.role === 'admin'}
              onEdit={handleEditClick}
              onDelete={handleDeleteProject}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Projects;
