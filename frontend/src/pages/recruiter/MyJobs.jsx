import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { Briefcase, PlusCircle, Users, Trash2, Edit, Award, MapPin, Calendar } from 'lucide-react';

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyJobs = async () => {
    try {
      const meRes = await API.get('/auth/me');
      const companies = meRes.data.data.user.companies || [];

      if (companies.length > 0) {
        const compDetail = await API.get(`/companies/${companies[0].id}`);
        setJobs(compDetail.data.data.company.jobs || []);
      }
    } catch (err) {
      console.error('Error fetching recruiter jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? All related candidate applications will also be deleted.')) {
      return;
    }

    try {
      await API.delete(`/jobs/${jobId}`);
      setJobs(jobs.filter(j => j.id !== jobId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete job posting.');
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-blue-600" /> Manage Corporate Job Postings
          </h1>
          <p className="text-slate-500 text-sm mt-1">New postings are sent to an admin for review and appear to students only after approval.</p>
        </div>
        <Link
          to="/recruiter/jobs/create"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow flex items-center gap-2 transition-all"
        >
          <PlusCircle className="w-4 h-4" /> Post New Job
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
            <p className="text-sm">No active job postings. Click "Post New Job" to initiate a campus placement drive.</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 text-lg">{job.title}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                    job.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                    job.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                    job.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {job.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600 mb-4">
                  <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location} ({job.employment_type})</p>
                  <p className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> Package: <span className="font-bold text-slate-900">{job.expected_package === null || job.expected_package === undefined ? 'Not disclosed' : `${Number(job.expected_package).toFixed(2)} LPA`}</span></p>
                  <p className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-slate-400" /> Min CGPA: <span className="font-bold text-slate-900">{parseFloat(job.minimum_cgpa).toFixed(2)}</span></p>
                  <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {job.required_skills && job.required_skills.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded border border-blue-100">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/recruiter/jobs/${job.id}/applicants`}
                    className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors"
                  >
                    <Users className="w-3.5 h-3.5" /> Applicants
                  </Link>
                  <Link
                    to={`/recruiter/jobs/${job.id}/edit`}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyJobs;
