const StatCard = ({ title, count, type }) => {
  const getColors = () => {
    switch (type) {
      case 'total':
        return 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/30 dark:border-blue-800/50 dark:text-blue-400';
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-100 dark:bg-green-900/30 dark:border-green-800/50 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-100 dark:bg-yellow-900/30 dark:border-yellow-800/50 dark:text-yellow-400';
      case 'overdue':
        return 'text-red-600 bg-red-50 border-red-100 dark:bg-red-900/30 dark:border-red-800/50 dark:text-red-400';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className={`p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all duration-200 ${getColors()}`}>
      <h3 className="font-medium opacity-80 mb-2">{title}</h3>
      <p className="text-4xl font-bold">{count}</p>
    </div>
  );
};

export default StatCard;
