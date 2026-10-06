import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Users2, 
  UserCheck, 
  Calendar, 
  Award, 
  TrendingUp, 
  Plus, 
  ArrowRight, 
  Clock, 
  MapPin, 
  Eye, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  ArrowUpRight, 
  Filter,
  Search,
  Video,
  FileText,
  Star,
  ShieldCheck,
  Zap,
  CheckCircle
} from 'lucide-react';
import { useJobContext } from '../../context/JobContext';
import EmployerLayout from './EmployerLayout';

const EmployerDashboard = () => {
  const { 
    myEmployerJobs: jobs = [], 
    myEmployerApplicants: applicants = [], 
    employerProfile,
    user 
  } = useJobContext();

  const compName = user?.employerProfile?.companyName || employerProfile?.companyName || user?.name || 'Enterprise Workspace';
  const recName = user?.name || employerProfile?.recruiterName || 'Talent Lead';

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.status !== 'Paused' && j.status !== 'Closed').length;
  const totalApplicants = applicants.length;
  const appliedCount = applicants.filter(a => a.status === 'Applied' || a.stage === 1).length;
  const underReviewCount = applicants.filter(a => a.status === 'Under Review' || a.stage === 2).length;
  const shortlistedCount = applicants.filter(a => a.status === 'Shortlisted' || a.stage === 3).length;
  const interviewingCount = applicants.filter(a => a.status === 'Interview Scheduled' || a.stage === 4).length;
  const offeredCount = applicants.filter(a => a.status === 'Offered' || a.stage === 5).length;

  const [searchQuery, setSearchQuery] = useState('');

  const recentApplicants = applicants.slice(0, 6);
  const recentJobs = jobs.slice(0, 4);

  return (
    <EmployerLayout>
      <div className="space-y-4">
        
        {/* 1. WELCOME COMMAND RIBBON */}
        <div className="bg-white rounded-3xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Enterprise Recruiter Command Center
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-950">
              Welcome back, {recName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Managing talent acquisition for <strong className="text-slate-800">{compName}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/employer/post-job"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Post a New Job</span>
            </Link>

            <Link
              to="/employer/applicants"
              className="bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Users2 className="w-4 h-4 text-blue-400" />
              <span>Review Pipeline</span>
            </Link>
          </div>
        </div>

        {/* 2. UNIFIED RECRUITMENT PIPELINE & METRICS (Single Row) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <Link
            to="/employer/jobs"
            className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Jobs</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-950">{activeJobs}</div>
              <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                {totalJobs} total postings
              </span>
            </div>
          </Link>

          <Link
            to="/employer/applicants?status=Applied"
            className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Applied</span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-950">{appliedCount}</div>
              <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                New applications
              </span>
            </div>
          </Link>

          <Link
            to="/employer/applicants?status=Under%20Review"
            className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Under Review</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-950">{underReviewCount}</div>
              <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                Initial screening
              </span>
            </div>
          </Link>

          <Link
            to="/employer/applicants?status=Shortlisted"
            className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Shortlisted</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-950">{shortlistedCount}</div>
              <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                Qualified candidates
              </span>
            </div>
          </Link>

          <Link
            to="/employer/applicants?status=Interview%20Scheduled"
            className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Interviews</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-blue-600">{interviewingCount}</div>
              <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                Scheduled rounds
              </span>
            </div>
          </Link>

          <Link
            to="/employer/applicants?status=Offered"
            className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hired / Offered</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600">{offeredCount}</div>
              <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                Offers extended
              </span>
            </div>
          </Link>

        </div>

        {/* 4. MAIN DUAL SPLIT: RECENT APPLICANTS & ACTIVE JOB STATUS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Recent Candidates with ATS Match Scores */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-2 md:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                    <Users2 className="w-5 h-5 text-blue-600" />
                    <span>Recent Applicant Dossiers</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Latest candidate profiles submitted with AI match scores.
                  </p>
                </div>

                <Link
                  to="/employer/applicants"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>View All ({applicants.length})</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {recentApplicants.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No candidate applications received yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentApplicants.map((applicant) => (
                    <div 
                      key={applicant.id}
                      className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-slate-950 text-white flex items-center justify-center font-black text-sm shrink-0">
                          {(applicant.name || applicant.candidateName || 'Candidate').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900">
                              {applicant.name || applicant.candidateName || 'Candidate'}
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              {applicant.atsScore || 92}% Match
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Applied for <strong className="text-slate-800">{applicant.jobTitle}</strong> • {applicant.location}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                          {applicant.status}
                        </span>
                        <Link
                          to={`/employer/applicants/${applicant.id || applicant._id}`}
                          className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Review Profile
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Active Job Postings Overview */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <span>Live Job Postings</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Track open positions and incoming applications.
                  </p>
                </div>

                <Link
                  to="/employer/jobs"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Manage ({jobs.length})</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-3">
                {recentJobs.map((job) => {
                  const jobApplicantsCount = applicants.filter(a => a.jobId === job.id).length;
                  return (
                    <div 
                      key={job.id}
                      className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {job.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                          <span>{job.location}</span>
                          <span>•</span>
                          <span className="text-blue-600 font-semibold">{job.salary || 'Competitive'}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 block mb-1">
                          {jobApplicantsCount} Applicants
                        </span>
                        <span className={`text-[10px] font-bold ${
                          job.status === 'Paused' ? 'text-slate-400' : 'text-emerald-600'
                        }`}>
                          ● {job.status || 'Active'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                to="/employer/post-job"
                className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4 text-blue-400" />
                <span>Publish Another Opening</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </EmployerLayout>
  );
};

export default EmployerDashboard;
