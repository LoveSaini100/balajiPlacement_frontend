import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle2, 
  ArrowLeft, 
  LogOut,
  AlertCircle,
  Lock
} from 'lucide-react';
import logo from '../../assets/logo-bg.png';
import { useJobContext } from '../../context/JobContext';

const EmployerVerificationPending = () => {
  const navigate = useNavigate();
  const { user, employerProfile, logoutEmployer } = useJobContext();
  
  // User info from context or localStorage
  const rejectionInfo = user?.employerProfile?.rejectionReason || '';
  const compName = user?.employerProfile?.companyName || employerProfile?.companyName || 'Your Organization';
  const recName = user?.name || employerProfile?.recruiterName || 'Talent Acquisition Team';
  const recEmail = user?.email || employerProfile?.recruiterEmail || (() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('portal_user') || '{}');
      return savedUser.email || '';
    } catch {
      return '';
    }
  })();
  const compPhone = user?.phone || user?.employerProfile?.companyPhone || employerProfile?.phone || employerProfile?.companyPhone || (() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('portal_user') || '{}');
      return savedUser.phone || savedUser.employerProfile?.companyPhone || '';
    } catch {
      return '';
    }
  })();

  const handleLogout = () => {
    logoutEmployer();
    navigate('/employer');
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Top Navbar Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-200">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Balaji Placement" className="h-9 w-auto" />
          <span className="text-base font-black tracking-tight text-slate-900">
            Balaji<span className="text-blue-600">Placement</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="max-w-2xl mx-auto w-full my-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
          
          {/* Status Header Badge & Title */}
          <div className="text-center space-y-3">
            {rejectionInfo ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-black uppercase tracking-wider shadow-2xs">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Verification Rejected by Administrator</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black uppercase tracking-wider shadow-2xs">
                <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                <span>Employer Verification Pending</span>
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              {rejectionInfo ? 'Registration Requires Review' : 'Registration Under Admin Review'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed font-medium">
              Thank you for registering <strong className="text-slate-900 font-bold">{compName}</strong> on the Balaji Placement Enterprise ATS platform.
            </p>

            {rejectionInfo && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-left text-xs text-rose-800 space-y-1 mt-4">
                <div className="font-bold flex items-center gap-1.5 text-rose-900">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Administrator Rejection Notice:</span>
                </div>
                <p className="font-medium text-rose-700 pl-5.5">{rejectionInfo}</p>
              </div>
            )}
          </div>

          {/* Verification Timeline / Progress Steps */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Verification Lifecycle
            </h3>

            <div className="space-y-3 text-xs">
              {/* Step 1: Completed */}
              <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-emerald-200/80 shadow-2xs">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Step 1: Registration Submitted</span>
                  <span className="text-[11px] text-slate-500">Corporate details for {compName} received successfully.</span>
                </div>
              </div>

              {/* Step 2: Under Review */}
              <div className="flex items-start gap-3 bg-amber-50/70 p-3 rounded-xl border border-amber-200 shadow-2xs">
                <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                </div>
                <div>
                  <span className="font-bold text-amber-950 block">Step 2: Admin Document & Company Verification (1–2 Working Days)</span>
                  <span className="text-[11px] text-amber-800 font-medium">Platform administrators are verifying company authentication, corporate credentials, and hiring legitimacy.</span>
                </div>
              </div>

              {/* Step 3: Pending */}
              <div className="flex items-start gap-3 bg-white/60 p-3 rounded-xl border border-slate-200 opacity-60">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div>
                  <span className="font-bold text-slate-700 block">Step 3: ATS Command Center Access Activation</span>
                  <span className="text-[11px] text-slate-500">Full access to Job Posting, ATS Candidate Pipeline, and Live Messaging will unlock immediately upon approval.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Important Recruiter Instructions Notice */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl p-4 sm:p-5 border border-blue-200/80 text-left space-y-3 shadow-2xs">
            <div className="flex items-center gap-2.5 text-blue-950 font-black text-xs sm:text-sm">
              <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs text-xs font-bold">
                ℹ️
              </div>
              <span>Important Notice for Recruiter / Employer</span>
            </div>
            
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Administrative verification takes approximately <strong className="text-blue-900 font-extrabold">1 to 2 working days</strong>.
            </p>

            <div className="p-3.5 bg-white rounded-xl border border-blue-100 text-xs text-slate-700 space-y-1.5 shadow-2xs">
              <p className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
                <span>💡</span> What to do next:
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                You do <strong>not</strong> need to wait on this screen or monitor for messages. You can safely sign out now and <strong>re-login after 1–2 business days</strong> using your registered email (<span className="font-bold text-slate-800">{recEmail}</span>) and password. Once approved by the Admin, your ATS dashboard will unlock automatically upon sign-in.
              </p>
            </div>
          </div>

          {/* Registered Company Summary Dossier */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Company</span>
              <span className="font-bold text-slate-900 truncate block mt-0.5">{compName}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Recruiter Lead</span>
              <span className="font-bold text-slate-900 truncate block mt-0.5">{recName}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Work Email</span>
              <span className="font-bold text-slate-900 truncate block mt-0.5">{recEmail}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Company Mobile</span>
              <span className="font-bold text-blue-600 truncate block mt-0.5">{compPhone || 'Provided on signup'}</span>
            </div>
          </div>

          {/* Actions Button Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out & Return Later</span>
            </button>

            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition text-center flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Return to Home</span>
            </Link>
          </div>

          {/* Help note */}
          <div className="text-center pt-2">
            <p className="text-[11px] text-slate-400 font-medium">
              Need immediate priority onboarding? Contact our administrative desk at{' '}
              <a href="mailto:info@jobsetu.net" className="text-blue-600 font-bold underline">
                info@jobsetu.net
              </a>{' '}
              or call{' '}
              <a href="tel:+917500055715" className="text-blue-600 font-bold underline">
                +91 75000 55715
              </a>
            </p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs text-slate-400 pt-4">
        © 2026 Balaji Placements Enterprise ATS. Verified Employer Network.
      </div>

    </div>
  );
};

export default EmployerVerificationPending;
