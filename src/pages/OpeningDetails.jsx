import React, { useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  MapPin, 
  Briefcase, 
  IndianRupee, 
  Clock, 
  Calendar, 
  Bookmark, 
  BookmarkCheck, 
  Building2, 
  ShieldCheck, 
  Share2, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  ChevronLeft, 
  Users, 
  AlertTriangle, 
  GraduationCap,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useJobContext } from '../context/JobContext';
import { companiesData } from '../data/companiesData';
import JobCard from '../components/common/JobCard';

const OpeningDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { jobs, isJobSaved, toggleSaveJob, openApplyModal, candidateAppliedJobs = [], isAuthenticated } = useJobContext();

  const job = jobs.find(j => j.slug === slug) || jobs[0];
  const company = companiesData.find(c => c.slug === job.companySlug) || {
    name: job.company,
    industry: job.category,
    headquarters: job.location,
    rating: 4.3,
    openJobsCount: 12,
    description: "A premier verified enterprise hiring on JobPortal.",
    benefits: job.benefits || []
  };

  const saved = isJobSaved(job.id);
  const alreadyApplied = candidateAppliedJobs.some(app => app.jobId === job.id);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('apply') === 'true' && !alreadyApplied) {
      navigate(`/apply/${job.slug || job.id}`);
    }
  }, [location.search, job, alreadyApplied, navigate]);

  const similarJobs = jobs
    .filter(j => j.id !== job.id && (j.category === job.category || j.location === job.location))
    .slice(0, 3);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${job.title} at ${job.company}`,
        text: `Check out this opening for ${job.title} on JobPortal`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Job link copied to clipboard!");
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/jobs" className="hover:text-blue-600 transition-colors">Jobs</Link>
          <span>/</span>
          <span className="text-slate-900 font-bold truncate max-w-xs sm:max-w-md">{job.title}</span>
        </div>

        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Job Search</span>
        </button>

        {/* Main Job Header Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Company & Title */}
            <div className="flex items-start gap-5">
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-black text-white text-xl sm:text-2xl tracking-wider shrink-0 shadow-lg shadow-blue-950/20 bg-gradient-to-br from-slate-950 to-blue-950 border border-slate-800"
              >
                {job.logoText || job.company.substring(0, 3).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  {job.urgent && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      <Zap className="w-3.5 h-3.5 text-blue-600" />
                      Urgent Opening
                    </span>
                  )}
                  {job.featured && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-950 text-white shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      Featured Opportunity
                    </span>
                  )}
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {job.category}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 leading-tight">
                  {job.title}
                </h1>

                <div className="flex items-center gap-3 mt-2 flex-wrap text-sm">
                  <Link 
                    to={`/companies/${job.companySlug || 'infosys-technologies'}`}
                    className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    <span>{job.company}</span>
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </Link>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 flex items-center gap-1 font-medium">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    {job.location} ({job.workMode || 'On-site'})
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 text-xs font-medium">Posted {job.postedDate || 'Recent'}</span>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              <button
                onClick={handleShare}
                className="p-3 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Share Job Opening"
              >
                <Share2 className="w-5 h-5" />
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleSaveJob(job.id, job.title);
                }}
                className={`p-3 rounded-xl border transition-all flex items-center gap-2 text-sm font-bold ${
                  saved
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                {saved ? <BookmarkCheck className="w-5 h-5 fill-white" /> : <Bookmark className="w-5 h-5" />}
                <span className="hidden sm:inline">{saved ? 'Saved' : 'Save'}</span>
              </button>

              {alreadyApplied ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs sm:text-sm px-4 py-3 rounded-xl flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Applied</span>
                  </div>
                  <Link
                    to={`/messages?jobId=${job.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 whitespace-nowrap active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat with Recruiter</span>
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => openApplyModal(job, navigate)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base px-8 py-3.5 rounded-xl shadow-lg shadow-blue-600/25 transition-transform active:scale-95 flex items-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <span>Easy Apply</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>

          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 text-xs sm:text-sm">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-xs block mb-1 font-medium">Offered CTC</span>
              <div className="font-bold text-blue-600 flex items-center gap-1 text-sm sm:text-base">
                <IndianRupee className="w-4 h-4 text-blue-600" />
                <span>{job.salary || 'Best in Industry'}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-xs block mb-1 font-medium">Required Experience</span>
              <div className="font-bold text-slate-900 flex items-center gap-1 text-sm sm:text-base">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>{job.experience || '2+ Years'}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-xs block mb-1 font-medium">Qualification</span>
              <div className="font-bold text-slate-900 flex items-center gap-1 text-sm sm:text-base truncate">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span className="truncate">{job.qualification || 'Graduate'}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 text-xs block mb-1 font-medium">Open Vacancies</span>
              <div className="font-bold text-slate-900 flex items-center gap-1 text-sm sm:text-base">
                <Users className="w-4 h-4 text-blue-600" />
                <span>{job.vacancies || 1} Positions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Job Body */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Overview */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950 mb-3">
                Job Overview
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                {job.overview}
              </p>
            </div>

            {/* Key Responsibilities */}
            {job.responsibilities && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-slate-950 mb-4">
                  Key Roles & Responsibilities
                </h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements & Qualifications */}
            {job.requirements && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-slate-950 mb-4">
                  Candidate Requirements & Qualifications
                </h2>
                <ul className="space-y-3">
                  {job.requirements.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                      <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Required Skills Cloud */}
            {job.skills && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-slate-950 mb-4">
                  Required Skills & Expertise
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {job.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits & Perks */}
            {job.benefits && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-slate-950 mb-4">
                  Compensation Perks & Employee Benefits
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {job.benefits.map((benefit, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                      <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-950 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-1">JobPortal Anti-Fraud Advisory:</strong>
                <span>JobPortal never charges candidates for placement fees, interview deposits, or training charges. All applications are completely free.</span>
              </div>
            </div>

          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Company Overview Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wider mb-4">
                About the Hiring Employer
              </h3>

              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-base tracking-wider shrink-0 bg-gradient-to-br from-slate-950 to-blue-950 border border-slate-800"
                >
                  {job.logoText || job.company.substring(0, 3).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{job.company}</h4>
                  <span className="text-xs text-slate-500 font-medium">{company.industry}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {company.description}
              </p>

              <div className="space-y-2 text-xs text-slate-600 pb-4 border-b border-slate-100 mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Headquarters:</span>
                  <span className="font-semibold text-slate-800">{company.headquarters || job.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Company Size:</span>
                  <span className="font-semibold text-slate-800">{company.employees || '1,000+ Staff'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Employee Rating:</span>
                  <span className="font-bold text-blue-600">{company.rating || 4.3} ★</span>
                </div>
              </div>

              <Link
                to={`/companies/${job.companySlug || 'infosys-technologies'}`}
                className="w-full block text-center py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-blue-200"
              >
                View Company Profile & All {company.openJobsCount || 8} Jobs
              </Link>
            </div>

            {/* Quick Apply CTA Box */}
            <div className="bg-gradient-to-br from-slate-950 to-blue-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
              <h3 className="text-base font-bold text-white mb-2">
                Interested in this position?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-5">
                Apply directly to fast-track your application to the verified hiring lead.
              </p>

              {alreadyApplied ? (
                <div className="space-y-2">
                  <div className="bg-white/10 text-white font-bold text-center py-3 rounded-xl border border-white/20 text-xs">
                    ✓ Application Submitted
                  </div>
                  <Link
                    to={`/messages?jobId=${job.id}`}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat with Recruiter</span>
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => openApplyModal(job, navigate)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-blue-600/25 transition-transform active:scale-95 cursor-pointer"
                >
                  Easy Apply for this Position
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Similar Jobs Section */}
        {similarJobs.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-200">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 mb-6">
              Similar Job Opportunities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarJobs.map(sj => (
                <JobCard key={sj.id} job={sj} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OpeningDetails;