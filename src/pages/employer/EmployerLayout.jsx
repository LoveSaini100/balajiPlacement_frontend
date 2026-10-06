import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  Building2, 
  LayoutDashboard, 
  Briefcase, 
  Users2, 
  Plus, 
  Settings, 
  ShieldCheck, 
  ExternalLink,
  Search,
  User,
  Menu,
  X,
  PlusCircle,
  MessageSquare,
  LogOut
} from 'lucide-react';
import { useJobContext } from '../../context/JobContext';

const EmployerLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    employerProfile, 
    user, 
    myEmployerJobs, 
    myEmployerApplicants, 
    myEmployerConversations, 
    logoutEmployer 
  } = useJobContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Verification protection: redirect unapproved employers to pending page
  React.useEffect(() => {
    if (user && user.role === 'employer') {
      const isApproved = user.isApproved && (user.employerProfile?.verificationStatus === 'approved' || user.status === 'approved');
      if (!isApproved) {
        navigate('/employer/verification-pending');
      }
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logoutEmployer();
    navigate('/employer');
  };

  const navItems = [
    { name: 'ATS Dashboard', path: '/employer/dashboard', icon: LayoutDashboard },
    { name: 'Job Postings', path: '/employer/jobs', badge: myEmployerJobs?.length || 0, icon: Briefcase },
    { name: 'Applicant Pipeline', path: '/employer/applicants', badge: myEmployerApplicants?.length || 0, icon: Users2 },
    { name: 'Direct Messages', path: '/employer/messages', badge: myEmployerConversations?.length || 0, icon: MessageSquare },
    { name: 'Post a Job', path: '/employer/post-job', icon: PlusCircle },
    { name: 'Company Profile', path: '/employer/profile', icon: Settings },
  ];

  const isCurrentActive = (item) => {
    if (item.path === '/employer/dashboard') {
      return location.pathname === '/employer/dashboard' || location.pathname === '/employer';
    }
    return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-slate-900 flex flex-col">
      
      {/* 1. ENTERPRISE B2B RECRUITER TOPBAR */}
      <header className="bg-white text-slate-900 border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-4">
            
            {/* Company & Recruiter Identity */}
            <div className="flex items-center gap-3 min-w-0">
              <Link to="/employer/dashboard" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                  {employerProfile.companyName ? employerProfile.companyName.charAt(0).toUpperCase() : 'E'}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-950 leading-tight truncate">
                      {employerProfile.companyName || 'Enterprise Recruiter Workspace'}
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 leading-none shrink-0">
                      <ShieldCheck className="w-3 h-3 text-blue-600" />
                      Verified ATS
                    </span>
                  </div>
                  <p className="hidden sm:block text-xs text-slate-500 font-medium leading-tight truncate">
                    Talent Lead: <strong className="text-slate-800 font-semibold">{employerProfile.recruiterName || 'Vikram Malhotra'}</strong>
                  </p>
                </div>
              </Link>
            </div>

            {/* Right Header Actions & Switch to Candidate Portal */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Link
                to="/employer/post-job"
                className="hidden sm:inline-flex bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Post a Job</span>
              </Link>

              {/* Direct Switch to Candidate Site */}
              <Link
                to="/"
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-950 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 flex items-center gap-1.5 transition-all shadow-2xs whitespace-nowrap"
                title="Return to Candidate Portal"
              >
                <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="hidden sm:inline">Candidate Portal</span>
                <span className="sm:hidden">Candidate</span>
                <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
              </Link>

              {/* Employer Log Out Action */}
              <button
                onClick={handleLogout}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-xs font-bold px-3 py-2 rounded-xl border border-rose-200/80 flex items-center gap-1.5 transition-all shadow-2xs whitespace-nowrap cursor-pointer active:scale-95"
                title="Sign out of Employer ATS"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="hidden sm:inline">Log Out</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100 border border-slate-200 lg:hidden cursor-pointer"
                aria-label="Toggle Recruiter Navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 2. RECRUITER SUB-NAVIGATION TABS (Desktop Only) */}
      <nav className="hidden lg:block bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">  
          <div className="flex items-center gap-6 xl:gap-8 overflow-x-auto scrollbar-none -mb-px">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isCurrentActive(item);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-2 py-3 border-b-2 text-xs sm:text-[13px] whitespace-nowrap transition-all duration-150 ${
                    active
                      ? 'border-blue-600 text-blue-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 font-medium'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none transition-colors ${
                      active 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 p-4 shadow-xl">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isCurrentActive(item);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                    active ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Mobile Sign Out */}
            <div className="pt-2 mt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Sign Out of ATS</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN ATS WORKSPACE CONTENT */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${location.pathname === '/employer/messages' ? 'py-3 sm:py-4' : 'py-4 sm:py-5'} flex-1 w-full`}>
        {children || <Outlet />}
      </main>

      {/* Recruiter Minimal Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        JobPortal Enterprise ATS • Logged in as {employerProfile.recruiterName || 'Talent Lead'} • {employerProfile.companyName || 'Enterprise Recruiter Workspace'}
      </footer>

    </div>
  );
};

export default EmployerLayout;
