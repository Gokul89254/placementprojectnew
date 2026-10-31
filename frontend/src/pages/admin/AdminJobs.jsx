import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { CheckSquare } from 'lucide-react';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await API.get('/admin/jobs');
      setJobs(res.data.data.jobs);
    } catch (err) {
      console.error('Error fetching admin jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await API.patch(`/admin/jobs/${jobId}/status`, { status: newStatus });
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update job status.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <CheckSquare className="w-7 h-7 text-blue-600" /> Master Job Postings Control
        </h1>
        <p className="text-slate-500 text-sm mt-1">Approve corporate job drives, modify statuses, or close expired postings.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Company</th>
                <th className="py-4 px-6">Job Title</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6">Package (LPA)</th>
                <th className="py-4 px-6">Min CGPA</th>
                <th className="py-4 px-6">Deadline</th>
                <th className="py-4 px-6">Applicants</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Status Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">{job.company_name}</td>
                  <td className="py-4 px-6 font-semibold text-slate-800">{job.title}</td>
                  <td className="py-4 px-6 text-slate-600 text-xs">{job.location}</td>
                  <td className="py-4 px-6 text-slate-600 text-xs">{job.expected_package === null || job.expected_package === undefined ? 'Not disclosed' : `${Number(job.expected_package).toFixed(2)} LPA`}</td>
                  <td className="py-4 px-6 font-extrabold text-blue-600">{parseFloat(job.minimum_cgpa).toFixed(2)}</td>
                  <td className="py-4 px-6 text-slate-500 text-xs">{new Date(job.deadline).toLocaleDateString()}</td>
                  <td className="py-4 px-6 font-bold text-slate-900">{job.applicants_count}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider ${
                      job.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      job.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      job.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <select
                      value={job.status}
                      onChange={(e) => handleStatusChange(job.id, e.target.value)}
                      className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminJobs;
