import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { Building2, Briefcase, Users, PlusCircle, ArrowRight, Award, CheckCircle2, Clock, CheckSquare } from 'lucide-react';

const RecruiterDashboard = () => {
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meRes = await API.get('/auth/me');
        const compList = meRes.data.data.user.companies || [];

        if (compList.length > 0) {
          const compDetail = await API.get(`/companies/${compList[0].id}`);
          setCompany(compDetail.data.data.company);
          setJobs(compDetail.data.data.company.jobs || []);
        }
      } catch (err) {
        console.error('Error fetching recruiter dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalApplicants = jobs.reduce((acc, job) => acc + (parseInt(job.total_applications || 0, 10)), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <span className="text-xs font-semibold px-3 py-1 bg-white/10 rounded-full text-blue-300 inline-block mb-2">
            Recruiter Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {company ? company.company_name : 'Recruiter Dashboard'}
          </h1>
          <p className="text-slate-300 text-sm mt-1">Manage corporate job postings, review applicant profiles, and shortlist candidates.</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/recruiter/jobs/create"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow flex items-center gap-2 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Post New Job
          </Link>
          <Link
            to="/recruiter/company"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold transition-all"
          >
            Edit Company Profile
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Job Postings</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{jobs.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company Profile Status</p>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">{company ? 'Active Verified' : 'Setup Required'}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Headquarters Location</p>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">{company?.location || 'Not Specified'}</h3>
          </div>
        </div>
      </div>

      {/* Job Postings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Active Job Drives</h2>
            <p className="text-xs text-slate-500">Manage candidates and view detailed applications</p>
          </div>
          <Link to="/recruiter/jobs" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            Manage All Jobs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 text-sm mb-4">You have not posted any campus jobs yet.</p>
            <Link to="/recruiter/jobs/create" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 inline-flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4" /> Create Your First Job Posting
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Job Title</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Min CGPA</th>
                  <th className="py-3.5 px-4">Deadline</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">{job.title}</td>
                    <td className="py-4 px-4 text-slate-600 text-xs">{job.location}</td>
                    <td className="py-4 px-4 font-bold text-blue-600 text-xs">{parseFloat(job.minimum_cgpa).toFixed(2)}</td>
                    <td className="py-4 px-4 text-slate-500 text-xs">{new Date(job.deadline).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800 uppercase">
                        {job.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/recruiter/jobs/${job.id}/applicants`}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" /> View Applicants
                      </Link>
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

export default RecruiterDashboard;
