import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import API from '../../services/api';
import {
  Award,
  RotateCcw,
  Search,
  UserCheck,
  Users
} from 'lucide-react';

const DepartmentStudentChart = lazy(() => import('./DepartmentStudentChart'));
import DepartmentSummaryCards, { getDepartmentColor } from './DepartmentSummaryCards';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('/admin/students');
      const data = response.data.data;
      setStudents(data.students);
      setDepartments(data.departments);
      setTotalStudents(data.total_students);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load registered students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students.filter(student => {
      const matchesDepartment = !selectedDepartment || student.department === selectedDepartment;
      const matchesSearch = !query
        || student.name?.toLowerCase().includes(query)
        || student.email?.toLowerCase().includes(query)
        || student.enrollment_number?.toLowerCase().includes(query);
      return matchesDepartment && matchesSearch;
    });
  }, [students, selectedDepartment, search]);

  const chartData = useMemo(() => departments.map((item, index) => ({
    ...item,
    fill: getDepartmentColor(index)
  })), [departments]);

  const selectDepartmentFromChart = (event) => {
    const department = event?.activePayload?.[0]?.payload?.department
      || event?.payload?.department
      || event?.department;
    if (department) setSelectedDepartment(department);
  };

  const selectedDepartmentData = departments.find(item => item.department === selectedDepartment);
  const heading = selectedDepartment
    ? `${selectedDepartment} Students`
    : 'All Registered Students';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Placement analytics</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
            <UserCheck className="h-7 w-7 text-blue-600" /> Registered Students Directory
          </h1>
          <p className="mt-1 text-sm text-slate-500">Explore enrollment and placement readiness across departments.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">
          <Users className="h-4 w-4 text-blue-600" />
          {loading ? 'Loading student totals…' : `${totalStudents.toLocaleString()} registered students`}
        </div>
      </header>

      {error && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <button type="button" onClick={fetchStudents} className="inline-flex items-center gap-2 self-start rounded-lg border border-red-200 bg-white px-3 py-2 font-semibold hover:bg-red-100">
            <RotateCcw className="h-4 w-4" /> Retry
          </button>
        </div>
      )}

      <section aria-labelledby="department-summary-title" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="department-summary-title" className="text-lg font-bold text-slate-900">Department Summary</h2>
            <p className="text-sm text-slate-500">Select a department card or chart bar to filter the directory.</p>
          </div>
          {selectedDepartment && (
            <button type="button" onClick={() => setSelectedDepartment(null)} className="text-sm font-semibold text-blue-700 hover:text-blue-900">
              Clear department filter
            </button>
          )}
        </div>

        <DepartmentSummaryCards
          departments={departments}
          totalStudents={totalStudents}
          selectedDepartment={selectedDepartment}
          onSelectDepartment={setSelectedDepartment}
          loading={loading}
        />
      </section>

      <Suspense fallback={<div className="h-[390px] animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm" />}>
        <DepartmentStudentChart
          chartData={chartData}
          selectedDepartment={selectedDepartment}
          onSelectDepartment={selectDepartmentFromChart}
        />
      </Suspense>

      <section aria-labelledby="student-directory-title" className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="student-directory-title" className="text-xl font-extrabold text-slate-900">{heading}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Showing <span className="font-bold text-slate-800">{filteredStudents.length.toLocaleString()}</span> of {totalStudents.toLocaleString()} students
              {selectedDepartmentData ? ` · ${selectedDepartmentData.percentage}% of enrollment` : ''}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              type="button"
              aria-pressed={!selectedDepartment}
              onClick={() => setSelectedDepartment(null)}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                !selectedDepartment ? 'border-blue-600 bg-blue-600 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700'
              }`}
            >
              <Users className="h-4 w-4" /> All Departments
            </button>
            <label className="relative block w-full sm:w-80">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="search"
                placeholder="Search name, email, roll number..."
                value={search}
                onChange={event => setSearch(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </label>
          </div>
        </div>

        {selectedDepartment && (
          <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm">
            <span className="font-semibold text-blue-900">Filtered by: {selectedDepartment}</span>
            <button type="button" onClick={() => setSelectedDepartment(null)} className="font-semibold text-blue-700 hover:text-blue-900">Clear filter</button>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Roll Number</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">CGPA</th>
                  <th className="px-6 py-4">Batch</th>
                  <th className="px-6 py-4">Applications Submitted</th>
                  <th className="px-6 py-4 text-center">Placement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading
                  ? Array.from({ length: 6 }, (_, index) => (
                    <tr key={index}>
                      {Array.from({ length: 7 }, (_, cell) => <td key={cell} className="px-6 py-5"><div className="h-4 animate-pulse rounded bg-slate-100" /></td>)}
                    </tr>
                  ))
                  : filteredStudents.map(student => (
                    <tr key={student.id} className="transition-colors hover:bg-slate-50/80">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {student.name}
                        <span className="mt-0.5 block text-xs font-normal text-slate-500">{student.email}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-700">{student.enrollment_number}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">{student.department}</td>
                      <td className="px-6 py-4 font-extrabold text-blue-700">{Number(student.cgpa).toFixed(2)}</td>
                      <td className="px-6 py-4 text-xs text-slate-600">{student.graduation_year}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{Number(student.applications_count).toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        {Number(student.selected_count) > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                            <Award className="h-3.5 w-3.5" /> Placed ({student.selected_count})
                          </span>
                        ) : (
                          <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Unplaced</span>
                        )}
                      </td>
                    </tr>
                  ))}
                {!loading && filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-14 text-center">
                      <Search className="mx-auto h-8 w-8 text-slate-300" />
                      <p className="mt-3 font-semibold text-slate-800">
                        {students.length === 0 ? 'No registered students yet' : 'No students match these filters'}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {students.length === 0 ? 'Students will appear here after they register.' : 'Try a different search or select All Departments.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminStudents;
