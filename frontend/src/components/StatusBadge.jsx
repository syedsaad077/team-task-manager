const StatusBadge = ({ status }) => {
  let colors = '';

  switch (status) {
    case 'Pending':
      colors = 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50';
      break;
    case 'In Progress':
      colors = 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50';
      break;
    case 'In Review':
      colors = 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50';
      break;
    case 'Rework':
      colors = 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50';
      break;
    case 'Completed':
      colors = 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50';
      break;
    default:
      colors = 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
