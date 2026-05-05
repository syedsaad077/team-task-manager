import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import StatusBadge from './StatusBadge';

const TaskCard = ({ task, onUpdateStatus, onDelete, onAddComment }) => {
  const { user } = useContext(AuthContext);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  
  const isOverdue = 
    task.dueDate && 
    task.status !== 'Completed' && 
    new Date(task.dueDate) < new Date();

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(task._id, newComment);
    setNewComment('');
  };

  return (
    <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border hover:shadow-lg transition-all duration-200 ${isOverdue ? 'border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/10' : 'border-slate-100 dark:border-slate-700'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">{task.title}</h3>
          <p className="text-sm font-medium text-primary dark:text-indigo-400 mt-1">{task.projectId?.name || 'No Project'}</p>
        </div>
        <StatusBadge status={task.status} />
      </div>

      {task.description && (
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">{task.description}</p>
      )}

      <div className="space-y-2 mt-auto">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Assigned to:</span>
          <span className="text-slate-800 dark:text-slate-200">{task.assignedTo?.name || 'Unassigned'}</span>
        </div>
        
        {task.dueDate && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Due:</span>
            <span className={`${isOverdue ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-800 dark:text-slate-200'}`}>
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center space-x-2">
        <div className="flex-1 flex gap-2">
          {/* Member Buttons */}
          {user?.role === 'member' && (
            <>
              {(task.status === 'Pending' || task.status === 'Rework') && (
                <button 
                  onClick={() => onUpdateStatus(task._id, 'In Progress')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                >
                  Start Working
                </button>
              )}
              {task.status === 'In Progress' && (
                <button 
                  onClick={() => onUpdateStatus(task._id, 'In Review')}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                >
                  Submit for Review
                </button>
              )}
            </>
          )}

          {/* Admin Buttons / Controls */}
          {user?.role === 'admin' && (
            <>
              <select 
                value={task.status} 
                onChange={(e) => onUpdateStatus(task._id, e.target.value)}
                className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-primary outline-none max-w-[130px] bg-white dark:bg-slate-700 dark:text-white cursor-pointer transition-colors"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Rework">Rework</option>
                <option value="Completed">Completed</option>
              </select>
              
              {task.status === 'In Review' && (
                <div className="flex gap-1 ml-1">
                  <button 
                    onClick={() => onUpdateStatus(task._id, 'Completed')}
                    className="bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-400 dark:hover:bg-green-800/80 text-xs font-semibold px-2 py-1.5 rounded-lg transition-colors"
                    title="Approve"
                  >
                    ✓ Approve
                  </button>
                  <button 
                    onClick={() => onUpdateStatus(task._id, 'Rework')}
                    className="bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-400 dark:hover:bg-orange-800/80 text-xs font-semibold px-2 py-1.5 rounded-lg transition-colors"
                    title="Request Rework"
                  >
                    ✗ Rework
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex space-x-2">
          <button 
            onClick={() => setShowComments(!showComments)}
            className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-indigo-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-slate-50 dark:bg-slate-700/50"
          >
            💬 {task.comments?.length || 0}
          </button>
          
          {user?.role === 'admin' && (
            <button 
              onClick={() => onDelete(task._id)}
              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Comments</h4>
          
          <div className="space-y-3 max-h-40 overflow-y-auto mb-3 pr-2">
            {task.comments && task.comments.length > 0 ? (
              task.comments.map((comment, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{comment.postedBy?.name || 'Unknown'}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center italic">No comments yet.</p>
            )}
          </div>

          <form onSubmit={handleCommentSubmit} className="flex space-x-2">
            <input 
              type="text" 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary dark:focus:ring-indigo-500 outline-none dark:bg-slate-700 dark:text-white transition-colors"
            />
            <button 
              type="submit" 
              className="bg-primary dark:bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark dark:hover:bg-indigo-700 transition-colors"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
