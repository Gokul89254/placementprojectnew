import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import JobListings from './pages/student/JobListings';
import MyApplications from './pages/student/MyApplications';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import CompanyProfile from './pages/recruiter/CompanyProfile';
import MyJobs from './pages/recruiter/MyJobs';
import CreateEditJob from './pages/recruiter/CreateEditJob';
import ApplicantsManagement from './pages/recruiter/ApplicantsManagement';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminJobs from './pages/admin/AdminJobs';
import AdminApplications from './pages/admin/AdminApplications';
import AdminInterviews from './pages/admin/AdminInterviews';
import AdminPlacements from './pages/admin/AdminPlacements';
import AdminAccount from './pages/admin/AdminAccount';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-blue-50/40 flex flex-col justify-between">
          <Navbar />
          <main className="flex-1 pb-12">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Student Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/profile" element={<StudentProfile />} />
                <Route path="/student/jobs" element={<JobListings />} />
                <Route path="/student/applications" element={<MyApplications />} />
              </Route>

              {/* Recruiter Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
                <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
                <Route path="/recruiter/company" element={<CompanyProfile />} />
                <Route path="/recruiter/jobs" element={<MyJobs />} />
                <Route path="/recruiter/jobs/create" element={<CreateEditJob />} />
                <Route path="/recruiter/jobs/:jobId/edit" element={<CreateEditJob />} />
                <Route path="/recruiter/jobs/:jobId/applicants" element={<ApplicantsManagement />} />
                <Route path="/recruiter/interviews" element={<AdminInterviews recruiterMode />} />
                <Route path="/recruiter/placements" element={<AdminPlacements recruiterMode />} />
              </Route>

              {/* Admin Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/students" element={<AdminStudents />} />
                <Route path="/admin/companies" element={<AdminCompanies />} />
                <Route path="/admin/jobs" element={<AdminJobs />} />
                <Route path="/admin/applications" element={<AdminApplications />} />
                <Route path="/admin/interviews" element={<AdminInterviews />} />
                <Route path="/admin/placements" element={<AdminPlacements />} />
                <Route path="/admin/account" element={<AdminAccount />} />
              </Route>

              {/* Catch-all Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
