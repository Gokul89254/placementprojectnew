import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Building2, MapPin, Trash2 } from 'lucide-react';

const getRequestErrorMessage = (error, action) => {
  const status = error.response?.status;
  const serverMessage = error.response?.data?.message;
  if (serverMessage) return `${action}: ${serverMessage}`;
  if (status === 404) return `${action} (HTTP 404). Restart the backend server and refresh to load the latest admin routes.`;
  if (status) return `${action} (HTTP ${status}).`;
  return `${action} Check that the backend server is running.`;
};

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const [companyResult, recruiterResult] = await Promise.allSettled([
          API.get('/admin/companies'),
          API.get('/admin/recruiters')
        ]);

        if (companyResult.status === 'fulfilled') {
          setCompanies(companyResult.value.data.data.companies);
        } else {
          setError(getRequestErrorMessage(companyResult.reason, 'Unable to load companies.'));
        }

        if (recruiterResult.status === 'fulfilled') {
          setRecruiters(recruiterResult.value.data.data.recruiters);
        } else {
          setError(currentError => currentError
            ? `${currentError} ${getRequestErrorMessage(recruiterResult.reason, 'Unable to load recruiters.')}`
            : getRequestErrorMessage(recruiterResult.reason, 'Unable to load recruiters.'));
        }
      } catch (requestError) {
        setError(getRequestErrorMessage(requestError, 'Unable to load admin data.'));
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const deleteCompany = async (company) => {
    if (!window.confirm(`Delete ${company.company_name} and all its jobs and applications?`)) return;
    setDeleting(`company-${company.id}`);
    setError('');
    try {
      await API.delete(`/admin/companies/${company.id}`);
      setCompanies(current => current.filter(item => item.id !== company.id));
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError, 'Unable to delete the company.'));
    } finally {
      setDeleting('');
    }
  };

  const updateCompanyStatus = async (company, status) => {
    setDeleting(`status-${company.id}`);
    setError('');
    try {
      const response = await API.patch(`/admin/companies/${company.id}/status`, { status });
      setCompanies(current => current.map(item => (
        item.id === company.id ? { ...item, ...response.data.data.company } : item
      )));
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError, 'Unable to update company status.'));
    } finally {
      setDeleting('');
    }
  };

  const deleteRecruiter = async (recruiter) => {
    if (!window.confirm(`Delete recruiter ${recruiter.name} and all their companies, jobs, and applications?`)) return;
    setDeleting(`recruiter-${recruiter.id}`);
    setError('');
    try {
      await API.delete(`/admin/recruiters/${recruiter.id}`);
      setRecruiters(current => current.filter(item => item.id !== recruiter.id));
      setCompanies(current => current.filter(item => String(item.recruiter_id) !== String(recruiter.id)));
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError, 'Unable to delete the recruiter.'));
    } finally {
      setDeleting('');
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
          <Building2 className="w-7 h-7 text-blue-600" /> Corporate Recruiting Partners
        </h1>
        <p className="text-slate-500 text-sm mt-1">Review and approve company profiles before recruiters can post jobs.</p>
      </div>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map(comp => (
          <div key={comp.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-slate-900 text-lg mb-1">{comp.company_name}</h3>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                  comp.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                  comp.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-amber-100 text-amber-800'
                }`}>{comp.status}</span>
              </div>
              <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {comp.location || 'Location Not Specified'}
              </p>
              <p className="text-xs text-slate-600 line-clamp-3 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed mb-4">
                {comp.description || 'No detailed company overview provided yet.'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-slate-900">Recruiter: {comp.recruiter_name}</span>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-full">
                {comp.total_jobs_posted} Jobs Posted
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['approved', 'rejected', 'pending'].filter(status => status !== comp.status).map(status => (
                <button
                  key={status}
                  type="button"
                  disabled={Boolean(deleting)}
                  onClick={() => updateCompanyStatus(comp, status)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize disabled:opacity-50 ${
                    status === 'approved' ? 'bg-emerald-600 text-white hover:bg-emerald-700' :
                    status === 'rejected' ? 'border border-red-200 text-red-700 hover:bg-red-50' :
                    'border border-amber-200 text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  {deleting === `status-${comp.id}` ? 'Saving…' : status === 'pending' ? 'Set pending' : status}
                </button>
              ))}
              <button
                type="button"
                disabled={Boolean(deleting)}
                onClick={() => deleteCompany(comp)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {deleting === `company-${comp.id}` ? 'Deleting…' : 'Delete company'}
              </button>
            </div>
          </div>
        ))}
        {companies.length === 0 && <p className="text-sm text-slate-500">No companies are registered.</p>}
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Recruiters</h2>
          <p className="text-sm text-slate-500">Manage recruiter accounts and their associated companies.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recruiters.map(recruiter => (
            <div key={recruiter.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{recruiter.name}</p>
                <p className="truncate text-sm text-slate-500">{recruiter.email}</p>
              </div>
              <button
                type="button"
                disabled={Boolean(deleting)}
                onClick={() => deleteRecruiter(recruiter)}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {deleting === `recruiter-${recruiter.id}` ? 'Deleting…' : 'Delete recruiter'}
              </button>
            </div>
          ))}
          {recruiters.length === 0 && <p className="text-sm text-slate-500">No recruiters are registered.</p>}
        </div>
      </section>
    </div>
  );
};

export default AdminCompanies;
