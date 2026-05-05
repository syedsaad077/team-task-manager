import { useState, useEffect } from 'react';
import API from '../api/axios';
import StatCard from '../components/StatCard';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await API.get('/tasks');
        setTasks(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) {
    return <div className="p-6 text-slate-500">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const pendingTasks = tasks.filter((t) => t.status === 'Pending' || t.status === 'In Progress' || t.status === 'In Review' || t.status === 'Rework').length;
  
  // Calculate overdue tasks
  const today = new Date();
  const overdueTasks = tasks.filter((t) => {
    if (t.status === 'Completed' || !t.dueDate) return false;
    return new Date(t.dueDate) < today;
  }).length;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Tasks" count={totalTasks} type="total" />
        <StatCard title="Completed" count={completedTasks} type="completed" />
        <StatCard title="Pending" count={pendingTasks} type="pending" />
        <StatCard title="Overdue" count={overdueTasks} type="overdue" />
      </div>
    </div>
  );
};

export default Dashboard;
