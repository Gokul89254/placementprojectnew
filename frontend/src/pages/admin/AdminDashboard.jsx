import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { GraduationCap, Building2, Briefcase, FileText, CheckCircle2, Award, Clock, ArrowRight, ShieldCheck, CheckSquare, CalendarDays } from 'lucide-react';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [dashRes, jobsRes] = await Promise.all([
        API.get('/admin/dashboard'),
        API.get('/admin/jobs')
      ]);

      setMetrics(dashRes.data.data.metrics);
      setJobs(jobsRes.data.data.jobs);
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApproveJob = async (jobId, newStatus) => {
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

  const pendingJobs = jobs.filter(j => j.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-md flex justify-between items-center">
        <div>
          <span className="text-xs font-semibold px-3 py-1 bg-white/10 rounded-full text-emerald-300 inline-block mb-2">
            Placement Cell Oversight
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">System Administration Overview</h1>
          <p className="text-blue-100 text-sm mt-1">Monitor campus recruitment metrics, manage registered users, and approve corporate job postings.</p>
        </div>
      </div>

      {/* Platform Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Students</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{metrics?.total_students}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Companies</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{metrics?.total_companies}</h3>
          <Link to="/admin/companies" className="mt-2 inline-flex text-xs font-semibold text-blue-600 hover:text-blue-700">
            {metrics?.pending_companies_count || 0} pending approval
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Jobs</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{metrics?.total_jobs}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Applications</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{metrics?.total_applications}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-amber-600 uppercase">Shortlisted</p>
          <h3 className="text-2xl font-bold text-amber-700 mt-1">{metrics?.total_shortlisted}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase">Selections</p>
          <h3 className="text-2xl font-bold text-emerald-700 mt-1">{metrics?.total_selected}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-blue-600 uppercase">Scheduled Interviews</p>
          <h3 className="text-2xl font-bold text-blue-700 mt-1">{metrics?.scheduled_interviews}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase">Accepted Offers</p>
          <h3 className="text-2xl font-bold text-emerald-700 mt-1">{metrics?.total_placements}</h3>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/admin/interviews" className="flex items-center justify-between rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:bg-blue-50/50">
          <span className="flex items-center gap-3"><CalendarDays className="h-5 w-5 text-blue-700" /><span><span className="block font-bold text-slate-900">View interview schedules</span><span className="text-xs text-slate-500">Review recruiter-managed interview rounds</span></span></span>
          <ArrowRight className="h-4 w-4 text-blue-700" />
        </Link>
        <Link to="/admin/placements" className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/50">
          <span className="flex items-center gap-3"><Award className="h-5 w-5 text-emerald-700" /><span><span className="block font-bold text-slate-900">View placement results</span><span className="text-xs text-slate-500">Review outcomes reported by recruiters</span></span></span>
          <ArrowRight className="h-4 w-4 text-emerald-700" />
        </Link>
      </div>

      {/* Job Approval Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-600" /> Pending Corporate Job Approvals
            </h2>
            <p className="text-xs text-slate-500">Review job posting details before publishing to students</p>
          </div>
          <Link to="/admin/jobs" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View All Job Postings <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingJobs.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-sm">
            <p className="font-semibold text-emerald-700">All pending job postings are approved and verified!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Company</th>
                  <th className="py-3.5 px-4">Job Title</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Min CGPA</th>
                  <th className="py-3.5 px-4">Deadline</th>
                  <th className="py-3.5 px-4 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {pendingJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/80">
                    <td className="py-4 px-4 font-bold text-slate-900">{job.company_name}</td>
                    <td className="py-4 px-4 font-semibold text-slate-800">{job.title}</td>
                    <td className="py-4 px-4 text-slate-600 text-xs">{job.location}</td>
                    <td className="py-4 px-4 font-bold text-blue-600 text-xs">{parseFloat(job.minimum_cgpa).toFixed(2)}</td>
                    <td className="py-4 px-4 text-slate-500 text-xs">{new Date(job.deadline).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleApproveJob(job.id, 'approved')}
                          className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-bold transition-colors shadow-sm"
                        >
                          Approve Job
                        </button>
                        <button
                          onClick={() => handleApproveJob(job.id, 'rejected')}
                          className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
