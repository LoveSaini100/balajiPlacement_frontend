import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from "../../assets/logo-bg.png";
import { 
  Briefcase, 
  User, 
  Menu, 
  X, 
  ArrowRight,
  PhoneCall,
  Building2,
  Bookmark,
  LogOut,
  LogIn,
  UserPlus,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  FileText,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { useJobContext } from '../../context/JobContext';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);

  const { candidateAppliedJobs = [], savedJobIds, isAuthenticated, user, logoutCandidate } = useJobContext();

  // Scroll listener for sticky navbar shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Find Jobs', path: '/jobs' },
    { name: 'Companies', path: '/companies' },
    { name: 'Categories', path: '/categories' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && (location.pathname === path || (path === '/jobs' && location.pathname.startsWith('/career-opportunities')))) return true;
    if (path !== '/' && path !== '/jobs' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    logoutCandidate();
  };

  return (
    <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-200 border-b ${
      scrolled ? 'border-slate-200 shadow-sm' : 'border-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center shrink-0 group py-1.5 focus:outline-none">
            <img 
              src={logo} 
              alt="Balaji Placement" 
              className="h-10 sm:h-11 md:h-16 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]" 
            />
          </Link>

          {/* Desktop Candidate Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`whitespace-nowrap text-sm transition-colors duration-150 ${
                    active
                      ? 'text-blue-600 font-bold'
                      : 'text-slate-600 hover:text-blue-600 font-medium'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Menu: Profile Dropdown (if logged in) or Login Button (if not) + Employer Link */}
          <div className="hidden lg:flex items-center gap-3.5 shrink-0">
            
            {isAuthenticated ? (
              /* ── LOGGED IN: PROFILE ICON & FULL CANDIDATE DROPDOWN ── */
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                    profileDropdownOpen 
                      ? 'border-blue-500 bg-blue-50/70 text-blue-700 shadow-sm' 
                      : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700 hover:border-slate-300'
                  }`}
                  aria-label="Candidate Profile Menu"
                  aria-expanded={profileDropdownOpen}
                >
                  {/* Profile Icon / Initials */}
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                    {(user?.name || 'C').charAt(0).toUpperCase()}
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold max-w-[110px] truncate">
                      {user?.name?.split(' ')[0] || 'Candidate'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                  </div>

                  {/* Badge if applied jobs exist */}
                  {candidateAppliedJobs.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </button>

                {/* Candidate Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    
                    {/* User Header */}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-blue-900 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                          {(user?.name || 'Candidate').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-black text-slate-950 truncate">
                              {user?.name || 'candidate'}
                            </p>
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {user?.email || 'candidate@gmail.com'}
                          </p>
                          <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            {user?.title || 'Verified Candidate'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Candidate Menu Links */}
                    <div className="p-1.5 space-y-0.5">
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <User className="w-4 h-4 text-blue-600" />
                          <span>Candidate Profile</span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">View</span>
                      </Link>

                      <Link
                        to="/resume-builder"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors bg-blue-50/40"
                      >
                        <div className="flex items-center gap-2.5">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          <span>ATS Resume Builder</span>
                        </div>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">100% ATS</span>
                      </Link>

                      <Link
                        to="/messages"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Briefcase className="w-4 h-4 text-emerald-600" />
                          <span>Recruiter Messages</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">Chat</span>
                      </Link>

                      <Link
                        to="/profile?tab=applied"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Briefcase className="w-4 h-4 text-indigo-600" />
                          <span>Applied Jobs</span>
                        </div>
                        {candidateAppliedJobs.length > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            {candidateAppliedJobs.length}
                          </span>
                        )}
                      </Link>

                      <Link
                        to="/profile?tab=saved"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Bookmark className="w-4 h-4 text-amber-600" />
                          <span>Saved Bookmarks</span>
                        </div>
                        {savedJobIds.length > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                            {savedJobIds.length}
                          </span>
                        )}
                      </Link>

                      <Link
                        to="/profile?tab=preferences"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Sliders className="w-4 h-4 text-purple-600" />
                          <span>Preferences & Alerts</span>
                        </div>
                      </Link>
                    </div>

                    {/* Sign Out Action */}
                    <div className="p-1.5 border-t border-slate-100 mt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            ) : (
              /* ── NOT LOGGED IN: CANDIDATE SIGN IN BUTTON ── */
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Candidate Sign In</span>
              </Link>
            )}

            <span className="h-4 w-px bg-slate-200" />

            {/* Switcher to Employer Workspace */}
            <Link
              to="/employer"
              className="whitespace-nowrap flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 text-xs font-bold px-3.5 py-2 rounded-xl border border-blue-200 shadow-2xs transition-all active:scale-95"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>For Employers</span>
            </Link>
          </div>

          {/* Mobile Right Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="p-1.5 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 flex items-center justify-center"
                aria-label="Candidate Profile"
                title="Candidate Profile"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[11px] font-black">
                  {(user?.name || 'C').charAt(0).toUpperCase()}
                </div>
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}

            <Link
              to="/employer"
              className="hidden sm:inline-flex whitespace-nowrap bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-xl items-center gap-1 border border-blue-200 shadow-2xs"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Employers</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200 transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-150">
          
          {/* Mobile Candidate Profile Box */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 mb-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      {(user?.name || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-950">
                        {user?.name || 'candidate'}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {user?.email || 'candidate@gmail.com'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={logoutCandidate}
                    className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs font-bold cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] font-bold pt-2 border-t border-slate-200">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-slate-800 hover:text-blue-600 truncate"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/resume-builder"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-slate-800 hover:text-blue-600 truncate"
                  >
                    CV Builder
                  </Link>
                  <Link
                    to="/profile?tab=applied"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-1.5 px-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 hover:text-blue-600 flex items-center justify-center gap-1 truncate"
                  >
                    <span>Applied</span>
                    {candidateAppliedJobs.length > 0 && (
                      <span className="px-1.5 py-0.2 bg-blue-600 text-white text-[9px] rounded-full">
                        {candidateAppliedJobs.length}
                      </span>
                    )}
                  </Link>
                </div>
              </>
            ) : (
              <div>
                <p className="text-xs font-bold text-slate-900 mb-1">Candidate Account</p>
                <p className="text-[11px] text-slate-500 mb-3">Sign in to submit 1-click applications and manage your profile.</p>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Candidate Sign In</span>
                </Link>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="whitespace-nowrap">{link.name}</span>
                  <ArrowRight className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                </Link>
              );
            })}
          </div>

          <div className="h-px bg-slate-100 my-3" />

          {/* Switch to Employer Workspace in Mobile */}
          <Link
            to="/employer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors whitespace-nowrap mb-3 shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Switch to Employer Workspace</span>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-600" />
          </Link>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span className="text-slate-400 font-medium">Verified Placement Network</span>
            <a href="tel:+919760967808" className="flex items-center gap-1 text-blue-600 font-semibold whitespace-nowrap">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>+91 97609 67808</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;