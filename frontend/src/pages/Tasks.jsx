import { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';

const Tasks = () => {
  const { user } = useContext(AuthContext);
  
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Create Task State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createError, setCreateError] = useState('');

  // Filters State
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProject, setFilterProject] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, projectsRes] = await Promise.all([
        API.get('/tasks', {
          params: {
            ...(filterStatus && { status: filterStatus }),
            ...(filterProject && { projectId: filterProject }),
          }
        }),
        API.get('/projects')
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus, filterProject]);

  const handleCreateTask = async (taskData) => {
    try {
      setCreateError('');
      await API.post('/tasks', taskData);
      setShowCreateForm(false);
      fetchData(); // Refresh list
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus });
      // Optimistically update UI
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await API.delete(`/tasks/${taskId}`);
      // Optimistically update UI
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleAddComment = async (taskId, text) => {
    try {
      const { data } = await API.post(`/tasks/${taskId}/comments`, { text });
      setTasks(tasks.map(t => t._id === taskId ? data : t));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add comment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Tasks</h2>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Filters */}
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="text-sm px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-slate-800 dark:text-slate-200 min-w-[150px] transition-colors"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-slate-800 dark:text-slate-200 transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Rework">Rework</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Admin Create Button */}
          {user?.role === 'admin' && (
            <button 
              onClick={() => setShowCreateForm(true)}
              className="bg-primary hover:bg-primary-dark dark:hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors shadow-md ml-auto sm:ml-0"
            >
              Create Task
            </button>
          )}
        </div>
      </div>

      {error && <div className="text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">{error}</div>}

      {showCreateForm && user?.role === 'admin' && (
        <TaskForm 
          projects={projects}
          onSubmit={handleCreateTask}
          onCancel={() => setShowCreateForm(false)}
          error={createError}
        />
      )}

      {loading ? (
        <div className="text-slate-500 dark:text-slate-400 p-8 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-slate-500 dark:text-slate-400 p-12 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center transition-colors">
          <svg className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-lg font-medium text-slate-600 dark:text-slate-300">No tasks found</p>
          <p className="text-sm mt-1 text-slate-400 dark:text-slate-500">Try adjusting your filters or create a new task.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <TaskCard 
              key={task._id} 
              task={task} 
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDeleteTask}
              onAddComment={handleAddComment}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;
