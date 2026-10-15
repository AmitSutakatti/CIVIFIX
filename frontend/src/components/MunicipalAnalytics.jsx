import { useState, useEffect } from 'react';
import { municipalAPI } from '../services/municipal/api';
import toast from 'react-hot-toast';
// import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, BarChart3 } from 'lucide-react';

const MunicipalAnalytics = ({ municipalOffice }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await municipalAPI.getAnalytics();
      setAnalytics(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch analytics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  // Prepare category data for pie chart
  const categoryColors = {
    road: '#3b82f6',
    drainage: '#8b5cf6',
    electricity: '#f59e0b',
    garbage: '#ef4444',
    water: '#06b6d4',
    streetlight: '#f97316',
    parks: '#22c55e',
    other: '#6b7280',
  };

  const categoryData = Object.entries(analytics.categoryStats || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: categoryColors[name] || '#6b7280',
  }));

  // Prepare monthly trend data for bar chart
  const monthlyData = Object.entries(analytics.monthlyTrend || {}).map(([month, value]) => ({
    month: month.split('-')[1] + '/' + month.split('-')[0].slice(-2), // Format as MM/YY
    complaints: value,
  }));

  const getCategoryLabel = (category) => {
    const categories = {
      road: 'Road Issues',
      drainage: 'Drainage',
      electricity: 'Electricity',
      garbage: 'Garbage',
      water: 'Water',
      streetlight: 'Street Light',
      parks: 'Parks',
      other: 'Other',
    };
    return categories[category] || category;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Complaints</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analytics.totalComplaints || 0}
              </p>
            </div>
            <BarChart3 className="w-12 h-12 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg Resolution Time</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analytics.avgResolutionTime || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">days</p>
            </div>
            <Clock className="w-12 h-12 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Contractors</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {Object.keys(analytics.contractorStats || {}).length}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Charts - Temporarily replaced with tables until recharts is installed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Complaints by Category</h3>
          {categoryData.length > 0 ? (
            <div className="space-y-3">
              {categoryData.map((entry, index) => {
                const total = categoryData.reduce((sum, item) => sum + item.value, 0);
                const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">{entry.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${percentage}%`, backgroundColor: entry.color }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-16 text-right">
                        {entry.value} ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Trend</h3>
          {monthlyData.length > 0 ? (
            <div className="space-y-3">
              {monthlyData.map((entry, index) => {
                const maxValue = Math.max(...monthlyData.map(d => d.complaints));
                const percentage = maxValue > 0 ? (entry.complaints / maxValue) * 100 : 0;
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{entry.month}</span>
                      <span className="text-sm font-bold text-gray-900">{entry.complaints} complaints</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Contractor Performance */}
      {Object.keys(analytics.contractorStats || {}).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Contractor Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Contractor ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total Jobs
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Completed
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Completion Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(analytics.contractorStats).map(([id, stats]) => {
                  const completionRate =
                    stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0;
                  return (
                    <tr key={id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        #{id.slice(-6)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{stats.total}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{stats.completed}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${completionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-700 font-medium">{completionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MunicipalAnalytics;
