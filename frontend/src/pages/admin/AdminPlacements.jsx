import React, { useEffect, useState } from 'react';
import { Award, Pencil, Save, Trash2 } from 'lucide-react';
import API from '../../services/api';

const AdminPlacements = ({ recruiterMode = false }) => {
  const apiBase = recruiterMode ? '/recruiter' : '/admin';
  const [results, setResults] = useState([]);
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState({ application_id: '', result_status: 'offered', package_amount: '', offer_date: '', notes: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [resultResponse, applicationResponse] = await Promise.all([
        API.get(`${apiBase}/placements`),
        API.get(`${apiBase}/applications`)
      ]);
      setResults(resultResponse.data.data.results);
      setApplications(applicationResponse.data.data.applications);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load placement results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  };

  const selectApplication = (event) => {
    const applicationId = event.target.value;
    const existing = results.find(result => String(result.application_id) === applicationId);
    setForm(existing
      ? {
          application_id: applicationId,
          result_status: existing.result_status,
          package_amount: existing.package_amount ?? '',
          offer_date: existing.offer_date ? String(existing.offer_date).slice(0, 10) : '',
          notes: existing.notes || ''
        }
      : { application_id: applicationId, result_status: 'offered', package_amount: '', offer_date: '', notes: '' });
  };

  const saveResult = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await API.post(`${apiBase}/placements`, form);
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save the placement result.');
    } finally {
      setSaving(false);
    }
  };

  const deleteResult = async (id) => {
    if (!window.confirm('Delete this placement result?')) return;
    setError('');
    try {
      await API.delete(`${apiBase}/placements/${id}`);
      if (String(form.application_id) === String(results.find(result => result.id === id)?.application_id)) {
        setForm({ application_id: '', result_status: 'offered', package_amount: '', offer_date: '', notes: '' });
      }
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete the placement result.');
    }
  };

  const editResult = (result) => {
    setForm({
      application_id: result.application_id,
      result_status: result.result_status,
      package_amount: result.package_amount ?? '',
      offer_date: result.offer_date ? String(result.offer_date).slice(0, 10) : '',
      notes: result.notes || ''
    });
  };

  const inputClass = 'w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100';
  const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600';

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
          <Award className="h-7 w-7 text-emerald-600" /> {recruiterMode ? 'Manage placement results' : 'Placement results'}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{recruiterMode ? 'Report offers and outcomes for candidates to your job postings.' : 'View placement outcomes across all recruiter job postings.'}</p>
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {recruiterMode && <form onSubmit={saveResult} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <label className={labelClass} htmlFor="placement_application">Student application</label>
          <select className={inputClass} id="placement_application" name="application_id" value={form.application_id} onChange={selectApplication} required>
            <option value="">Select an application</option>
            {applications.map(application => (
              <option key={application.application_id} value={application.application_id}>
                {application.student_name} — {application.job_title} at {application.company_name} ({application.status})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="result_status">Outcome</label>
          <select className={inputClass} id="result_status" name="result_status" value={form.result_status} onChange={updateField}>
            <option value="offered">Offer made</option>
            <option value="accepted">Offer accepted / placed</option>
            <option value="declined">Offer declined</option>
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="package_amount">Annual package</label>
          <input className={inputClass} id="package_amount" name="package_amount" type="number" min="0" step="0.01" value={form.package_amount} onChange={updateField} placeholder="Optional amount" />
        </div>
        <div>
          <label className={labelClass} htmlFor="offer_date">Offer date</label>
          <input className={inputClass} id="offer_date" name="offer_date" type="date" value={form.offer_date} onChange={updateField} />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <label className={labelClass} htmlFor="placement_notes">Notes</label>
          <input className={inputClass} id="placement_notes" name="notes" value={form.notes} onChange={updateField} placeholder="Optional result details" />
        </div>
        <div className="flex items-end">
          <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-800 disabled:opacity-60">
            <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save result'}
          </button>
        </div>
      </form>}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-bold text-slate-900">Recorded placement outcomes</h2>
        </div>
        {loading ? <p className="p-8 text-center text-sm text-slate-500">Loading results…</p> : results.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No placement results have been recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-emerald-50 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-5 py-3">Student</th><th className="px-5 py-3">Company / Role</th>
                  <th className="px-5 py-3">Outcome</th><th className="px-5 py-3">Package</th><th className="px-5 py-3">Offer date</th>{recruiterMode && <th className="px-5 py-3">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map(result => (
                  <tr key={result.id}>
                    <td className="px-5 py-4"><span className="font-semibold text-slate-900">{result.student_name}</span><span className="block text-xs text-slate-500">{result.student_email}</span></td>
                    <td className="px-5 py-4">{result.company_name}<span className="block text-xs text-slate-500">{result.job_title}</span></td>
                    <td className="px-5 py-4"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-700">{result.result_status}</span></td>
                    <td className="px-5 py-4">{result.package_amount === null ? '—' : Number(result.package_amount).toLocaleString()}</td>
                    <td className="px-5 py-4">{result.offer_date ? new Date(result.offer_date).toLocaleDateString() : '—'}</td>
                    {recruiterMode && <td className="px-5 py-4"><div className="flex gap-2">
                      <button type="button" title="Edit placement result" onClick={() => editResult(result)} className="rounded-lg border border-slate-200 p-2 text-blue-700 hover:bg-blue-50"><Pencil className="h-4 w-4" /></button>
                      <button type="button" title="Delete placement result" onClick={() => deleteResult(result.id)} className="rounded-lg border border-slate-200 p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                    </div></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminPlacements;
