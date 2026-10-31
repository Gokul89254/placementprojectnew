import React, { useEffect, useState } from 'react';
import { CalendarDays, Pencil, Plus, Trash2 } from 'lucide-react';
import API from '../../services/api';

const emptyForm = {
  application_id: '',
  round_name: '',
  scheduled_at: '',
  mode: 'online',
  location: '',
  meeting_link: '',
  notes: '',
  status: 'scheduled'
};

const AdminInterviews = ({ recruiterMode = false }) => {
  const apiBase = recruiterMode ? '/recruiter' : '/admin';
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [interviewResponse, applicationResponse] = await Promise.all([
        API.get(`${apiBase}/interviews`),
        API.get(`${apiBase}/applications`)
      ]);
      setInterviews(interviewResponse.data.data.interviews);
      setApplications(applicationResponse.data.data.applications);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load interview schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateField = (event) => {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const editInterview = (interview) => {
    setForm({
      application_id: interview.application_id,
      round_name: interview.round_name,
      scheduled_at: interview.scheduled_at,
      mode: interview.mode,
      location: interview.location || '',
      meeting_link: interview.meeting_link || '',
      notes: interview.notes || '',
      status: interview.status
    });
    setEditingId(interview.id);
    setError('');
  };

  const saveInterview = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await API.put(`${apiBase}/interviews/${editingId}`, form);
      } else {
        await API.post(`${apiBase}/interviews`, form);
      }
      resetForm();
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save the interview schedule.');
    } finally {
      setSaving(false);
    }
  };

  const deleteInterview = async (id) => {
    if (!window.confirm('Delete this interview schedule?')) return;
    setError('');
    try {
      await API.delete(`${apiBase}/interviews/${id}`);
      await loadData();
      if (editingId === id) resetForm();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete the interview schedule.');
    }
  };

  const inputClass = 'w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100';
  const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600';

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
          <CalendarDays className="h-7 w-7 text-blue-600" /> {recruiterMode ? 'Manage interview schedules' : 'Interview schedules'}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{recruiterMode ? 'Schedule and track interviews for applications to your job postings.' : 'View interview schedules across recruiter job postings.'}</p>
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {recruiterMode && <form onSubmit={saveInterview} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <label className={labelClass} htmlFor="application_id">Student application</label>
          <select className={inputClass} id="application_id" name="application_id" value={form.application_id} onChange={updateField} required>
            <option value="">Select an application</option>
            {applications.map(application => (
              <option key={application.application_id} value={application.application_id}>
                {application.student_name} — {application.job_title} at {application.company_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="round_name">Interview round</label>
          <input className={inputClass} id="round_name" name="round_name" value={form.round_name} onChange={updateField} placeholder="Technical interview" required />
        </div>
        <div>
          <label className={labelClass} htmlFor="scheduled_at">Date and time</label>
          <input className={inputClass} id="scheduled_at" name="scheduled_at" type="datetime-local" value={form.scheduled_at} onChange={updateField} required />
        </div>
        <div>
          <label className={labelClass} htmlFor="mode">Interview mode</label>
          <select className={inputClass} id="mode" name="mode" value={form.mode} onChange={updateField}>
            <option value="online">Online</option>
            <option value="in_person">In person</option>
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="location">Location</label>
          <input className={inputClass} id="location" name="location" value={form.location} onChange={updateField} placeholder="Office / campus location" />
        </div>
        <div>
          <label className={labelClass} htmlFor="meeting_link">Meeting link</label>
          <input className={inputClass} id="meeting_link" name="meeting_link" type="url" value={form.meeting_link} onChange={updateField} placeholder="https://..." />
        </div>
        <div>
          <label className={labelClass} htmlFor="status">Status</label>
          <select className={inputClass} id="status" name="status" value={form.status} onChange={updateField}>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="md:col-span-2 lg:col-span-4">
          <label className={labelClass} htmlFor="notes">Notes</label>
          <textarea className={inputClass} id="notes" name="notes" value={form.notes} onChange={updateField} rows="2" placeholder="Optional instructions for the candidate" />
        </div>
        <div className="flex gap-2 md:col-span-2 lg:col-span-4">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-800 disabled:opacity-60">
            <Plus className="h-4 w-4" /> {saving ? 'Saving…' : editingId ? 'Update schedule' : 'Schedule interview'}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel edit</button>}
        </div>
      </form>}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-bold text-slate-900">Scheduled interviews</h2>
        </div>
        {loading ? <p className="p-8 text-center text-sm text-slate-500">Loading interviews…</p> : interviews.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No interviews are scheduled yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-blue-50 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-5 py-3">Student / Job</th><th className="px-5 py-3">Round</th>
                  <th className="px-5 py-3">Date / Mode</th><th className="px-5 py-3">Status</th>{recruiterMode && <th className="px-5 py-3">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {interviews.map(interview => (
                  <tr key={interview.id}>
                    <td className="px-5 py-4"><span className="font-semibold text-slate-900">{interview.student_name}</span><span className="block text-xs text-slate-500">{interview.job_title} · {interview.company_name}</span></td>
                    <td className="px-5 py-4">{interview.round_name}</td>
                    <td className="px-5 py-4">{new Date(interview.scheduled_at).toLocaleString()}<span className="block text-xs capitalize text-slate-500">{interview.mode.replace('_', ' ')}{interview.location ? ` · ${interview.location}` : ''}</span></td>
                    <td className="px-5 py-4"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-700">{interview.status}</span></td>
                    {recruiterMode && <td className="px-5 py-4"><div className="flex gap-2">
                      <button type="button" title="Edit interview" onClick={() => editInterview(interview)} className="rounded-lg border border-slate-200 p-2 text-blue-700 hover:bg-blue-50"><Pencil className="h-4 w-4" /></button>
                      <button type="button" title="Delete interview" onClick={() => deleteInterview(interview.id)} className="rounded-lg border border-slate-200 p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
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

export default AdminInterviews;
