import { useState } from 'react';

const TaskForm = ({ projects, users, onSubmit, onCancel, error }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const taskData = { 
      title, 
      description, 
      projectId 
    };
    if (assignedTo) taskData.assignedTo = assignedTo;
    if (dueDate) taskData.dueDate = dueDate;
    
    onSubmit(taskData);
  };

  // Find the selected project to get its members
  const selectedProject = projects.find(p => p._id === projectId);
  const projectMembers = selectedProject?.members || [];

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-8 w-full max-w-2xl mx-auto transition-colors duration-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Create New Task</h3>
        <button onClick={onCancel} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
          ✕
        </button>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-indigo-500 focus:border-primary outline-none transition-all dark:bg-slate-700 dark:text-white"
            placeholder="E.g., Design Landing Page"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-indigo-500 focus:border-primary outline-none transition-all dark:bg-slate-700 dark:text-white"
            placeholder="Add details about the task..."
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project *</label>
            <select
              required
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value);
                setAssignedTo(''); // Reset assigned to when project changes
              }}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-indigo-500 outline-none bg-white dark:bg-slate-700 dark:text-white transition-colors"
            >
              <option value="">Select a project</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assign To</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-indigo-500 outline-none bg-white dark:bg-slate-700 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 transition-colors"
              disabled={!projectId}
            >
              <option value="">Unassigned</option>
              {projectMembers.map(member => (
                <option key={member._id} value={member._id}>{member.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-indigo-500 outline-none dark:bg-slate-700 dark:text-white transition-colors"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={onCancel}
            className="mr-3 px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary hover:bg-primary-dark dark:hover:bg-indigo-500 text-white rounded-lg shadow-md transition-colors font-medium"
          >
            Create Task
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
