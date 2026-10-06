import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ScrollToTop from "./components/common/ScrollToTop";
import ApplyJob from "./pages/ApplyJob";
import { JobProvider, useJobContext } from "./context/JobContext";

import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import OpeningDetails from "./pages/OpeningDetails";
import Companies from "./pages/Companies";
import CompanyDetails from "./pages/CompanyDetails";
import Categories from "./pages/Categories";
import CandidateDashboard from "./pages/CandidateDashboard";
import CandidateProfile from "./pages/CandidateProfile";
import CandidateResumeView from "./pages/CandidateResumeView";
import PostJob from "./pages/PostJob";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Blog from "./pages/Blog";
import BlogDetails from "./pages/BlogDetails";

import AtsResumeBuilder from "./pages/AtsResumeBuilder";
import MessagingHub from "./pages/MessagingHub";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";

// Employer Suite Pages (Dedicated B2B ATS Platform)
import EmployerLanding from "./pages/employer/EmployerLanding";
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import EmployerJobs from "./pages/employer/EmployerJobs";
import EmployerApplicants from "./pages/employer/EmployerApplicants";
import EmployerApplicantDetails from "./pages/employer/EmployerApplicantDetails";
import EmployerMessages from "./pages/employer/EmployerMessages";
import EmployerProfile from "./pages/employer/EmployerProfile";
import EmployerVerificationPending from "./pages/employer/EmployerVerificationPending";

// Candidate Protected Route Guard
const CandidateProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useJobContext();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return children;
};

// Admin Protected Route Guard
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useJobContext();
  const location = useLocation();

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to={`/admin/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return children;
};

const AppContent = () => {
  const location = useLocation();
  const isEmployerRoute = location.pathname.startsWith('/employer');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  const showCandidateNavbarAndFooter = !isEmployerRoute && !isAdminRoute && !isAuthRoute;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-slate-900">
      <ScrollToTop />
      
      {/* Render Candidate Navbar ONLY on candidate & public routes (excluding employer, admin, and auth pages) */}
      {showCandidateNavbarAndFooter && <Navbar />}

      <main className="flex-grow">
        <Routes>
          {/* Public Browsing Routes (Accessible without login) */}
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/career-opportunities" element={<Jobs />} />
          <Route path="/career-opportunities/:slug" element={<OpeningDetails />} />
          <Route path="/jobs/:slug" element={<OpeningDetails />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:slug" element={<CompanyDetails />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blogs" element={<Blog />} />
          <Route path="/blogs/:slug" element={<BlogDetails />} />

          {/* Apply for Job (Dedicated Page) */}
          <Route path="/apply/:slug" element={<ApplyJob />} />
          <Route path="/jobs/:slug/apply" element={<ApplyJob />} />
          <Route path="/career-opportunities/:slug/apply" element={<ApplyJob />} />

          {/* ATS Resume Builder: Accessible to all (Guests can create/build resumes) */}
          <Route path="/resume-builder" element={<AtsResumeBuilder />} />
          <Route path="/ats-resume" element={<AtsResumeBuilder />} />

          {/* Candidate Auth (Candidate Login & Register) */}
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />

          {/* Candidate-Only Protected Routes (Requires Candidate Login) */}
          <Route path="/dashboard" element={<CandidateProtectedRoute><CandidateProfile /></CandidateProtectedRoute>} />
          <Route path="/profile" element={<CandidateProtectedRoute><CandidateProfile /></CandidateProtectedRoute>} />
          <Route path="/candidate-profile" element={<CandidateProtectedRoute><CandidateProfile /></CandidateProtectedRoute>} />
          <Route path="/candidate-dashboard" element={<CandidateProtectedRoute><CandidateDashboard /></CandidateProtectedRoute>} />
          <Route path="/resume" element={<CandidateProtectedRoute><CandidateResumeView /></CandidateProtectedRoute>} />
          <Route path="/candidate-resume" element={<CandidateProtectedRoute><CandidateResumeView /></CandidateProtectedRoute>} />
          <Route path="/profile/resume" element={<CandidateProtectedRoute><CandidateResumeView /></CandidateProtectedRoute>} />
          <Route path="/messages" element={<CandidateProtectedRoute><MessagingHub /></CandidateProtectedRoute>} />
          <Route path="/inbox" element={<CandidateProtectedRoute><MessagingHub /></CandidateProtectedRoute>} />

          {/* Admin Routes (Dedicated Admin Login & Protected Dashboard) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
          <Route path="/admin/*" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />

          {/* Employer Hiring Solutions & Auth Gate */}
          <Route path="/employer" element={<EmployerLanding />} />
          <Route path="/employer/hire" element={<EmployerLanding />} />

          {/* Dedicated Employer & Recruiter ATS Suite */}
          <Route path="/employer/verification-pending" element={<EmployerVerificationPending />} />
          <Route path="/employer/dashboard" element={<EmployerDashboard />} />
          <Route path="/employer/jobs" element={<EmployerJobs />} />
          <Route path="/employer/applicants" element={<EmployerApplicants />} />
          <Route path="/employer/applicants/:applicantId" element={<EmployerApplicantDetails />} />
          <Route path="/employer/candidates/:applicantId" element={<EmployerApplicantDetails />} />
          <Route path="/employer/messages" element={<EmployerMessages />} />
          <Route path="/employer/post-job" element={<PostJob />} />
          <Route path="/employer/edit-job/:jobId" element={<PostJob />} />
          <Route path="/employer/post-job/:jobId" element={<PostJob />} />
          <Route path="/employer/profile" element={<EmployerProfile />} />

          {/* Legacy redirect for post-job */}
          <Route path="/post-job" element={<Navigate to="/employer/post-job" replace />} />
        </Routes>
      </main>

      {/* Render Candidate Footer ONLY on candidate & public routes (excluding employer, admin, and auth pages) */}
      {showCandidateNavbarAndFooter && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <JobProvider>
      <AppContent />
    </JobProvider>
  );
};

export default App;