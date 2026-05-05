const ProjectCard = ({ project, isAdmin, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative group">
      {isAdmin && (
        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(project)}
            className="text-slate-400 hover:text-primary dark:hover:text-indigo-400 transition-colors"
            title="Edit Project"
          >
            ✎ Edit
          </button>
          <button 
            onClick={() => onDelete(project._id)}
            className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            title="Delete Project"
          >
            🗑️ Delete
          </button>
        </div>
      )}
      
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 pr-8">{project.name}</h3>
      
      <div className="mt-4 space-y-2">
        <div>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Created by: </span>
          <span className="text-sm text-slate-700 dark:text-slate-300">{project.createdBy?.name || 'Unknown'}</span>
        </div>
        
        <div>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Members ({project.members?.length || 0}): </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {project.members && project.members.length > 0 ? (
              project.members.map((member) => (
                <span key={member._id} className="inline-block bg-primary/10 dark:bg-indigo-900/30 text-primary dark:text-indigo-400 border border-transparent dark:border-indigo-800/50 text-xs px-2 py-1 rounded-md">
                  {member.name}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 dark:text-slate-500">No members</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
