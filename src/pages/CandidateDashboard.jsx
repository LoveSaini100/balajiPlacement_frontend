import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Bookmark, 
  FileText, 
  Bell, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  IndianRupee, 
  Sparkles, 
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  UploadCloud,
  ArrowRight,
  MessageSquare,
  Video,
  Calendar,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useJobContext } from '../context/JobContext';
import JobCard from '../components/common/JobCard';

const CandidateDashboard = () => {
  const { 
    candidateAppliedJobs = [], 
    savedJobIds = [], 
    jobs = [], 
    user, 
    updateCandidateProfile, 
    calculateProfileCompleteness, 
    calculateAtsScore 
  } = useJobContext();
  const [activeTab, setActiveTab] = useState('applied');

  const savedJobsList = jobs.filter(j => savedJobIds.includes(j.id) || savedJobIds.includes(j._id));

  const [alerts, setAlerts] = useState({
    techJobs: true,
    bengaluruJobs: true,
    remoteJobs: true,
    salaryHikes: false,
    whatsappUpdates: true
  });

  const handleToggleAlert = (key) => {
    setAlerts(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      toast.success("Job alert preferences updated!");
      return updated;
    });
  };

  const handleResumeUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const blobUrl = URL.createObjectURL(file);
      const fileSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target.result;
        if (updateCandidateProfile) {
          await updateCandidateProfile({
            resumeName: file.name,
            resumeUrl: blobUrl,
            resumeBlobUrl: blobUrl,
            resumeDataUrl: dataUrl,
            resumeType: file.type || (isPdf ? 'application/pdf' : 'application/octet-stream'),
            resumeSize: fileSize,
            resumeUploadDate: 'Just Now',
            isCustomUploaded: true
          });
        }
        toast.success(`Resume "${file.name}" uploaded successfully!`);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentCompleteness = calculateProfileCompleteness ? calculateProfileCompleteness(user) : (user?.profileCompleted || 0);
  const atsScore = calculateAtsScore ? calculateAtsScore(user) : (user?.atsScore || 0);
  const hasResume = !!(user?.resumeName || user?.resumeUrl);

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* User Profile Info */}
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-slate-950 to-blue-950 text-white flex items-center justify-center font-black text-2xl tracking-wider shadow-lg shadow-blue-950/20 shrink-0 border border-slate-800">
                {(user?.name || 'C').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-950">
                    {user?.name || 'Candidate'}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Verified Jobseeker
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-slate-600">
                  {user?.title ? (
                    <>
                      {user.title} {user?.experience ? `• ${user.experience} Experience` : ''}
                    </>
                  ) : (
                    <span className="text-slate-400 italic">No job title added</span>
                  )}
                </p>

                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    {user?.location || 'Location not specified'}
                  </span>
                  <span>•</span>
                  <span>{user?.email || 'No email'}</span>
                  {user?.phone && (
                    <>
                      <span>•</span>
                      <span>{user.phone}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Strength Meter */}
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 lg:min-w-[280px]">
              <div className={`w-12 h-12 rounded-full border-4 ${currentCompleteness >= 70 ? 'border-emerald-500 text-emerald-700' : 'border-blue-600 text-blue-700'} flex items-center justify-center font-black text-slate-900 text-sm shrink-0 bg-white`}>
                {currentCompleteness}%
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-slate-900 block">
                  Profile Strength: {currentCompleteness >= 70 ? 'Strong' : currentCompleteness >= 40 ? 'Moderate' : 'Basic'}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {currentCompleteness < 70 ? 'Complete your bio, skills & resume' : 'Top candidate ranking for recruiter searches.'}
                </span>
              </div>
            </div>

          </div>

          {/* Quick Tabs Nav */}
          <div className="flex items-center gap-2 overflow-x-auto pt-6 mt-6 border-t border-slate-100 scrollbar-none">
            <button
              onClick={() => setActiveTab('applied')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'applied'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Applied Jobs ({candidateAppliedJobs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'saved'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved Jobs ({savedJobsList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('resume')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'resume'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Resume & ATS Score</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'alerts'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Job Alerts</span>
            </button>
          </div>
        </div>



        {/* TAB 1: APPLIED JOBS PIPELINE */}
        {activeTab === 'applied' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-950">
                  Applied Applications Tracker
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track live status updates directly from employer ATS pipelines.
                </p>
              </div>

              <Link
                to="/jobs"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Browse More Jobs</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {candidateAppliedJobs.length > 0 ? (
              <div className="space-y-4">
                {candidateAppliedJobs.map((app, index) => {
                  const isInterview = app.stage === 4 || app.status === 'Interview Scheduled' || app.status === 'Interview' || app.interviewDetails?.date;

                  return (
                    <div 
                      key={index}
                      className="p-5 rounded-2xl border border-slate-200 hover:border-blue-500/50 bg-slate-50/50 transition-all flex flex-col gap-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-sm shrink-0 shadow-sm bg-gradient-to-br from-slate-900 to-blue-950 border border-slate-800"
                          >
                            {app.companyLogo || app.company?.substring(0, 3).toUpperCase()}
                          </div>

                          <div>
                            <h3 className="text-base font-bold text-slate-950">
                              {app.jobTitle}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-slate-600 mt-1 flex-wrap">
                              <span className="font-bold text-slate-900">{app.company}</span>
                              {app.location && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                                    {app.location}
                                  </span>
                                </>
                              )}
                              {app.salary && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 text-blue-600 font-bold">
                                    <IndianRupee className="w-3.5 h-3.5" />
                                    {app.salary}
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-[11px] text-slate-400 font-medium">
                                Applied on {app.appliedDate || 'Recent'}
                              </span>
                              <span>•</span>
                              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                📄 {app.resumeSource === 'built_in' ? 'Website Built ATS Resume' : (app.resumeName || 'Uploaded File')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Pipeline Badge & Chat Action */}
                        <div className="flex items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200 flex-wrap">
                          <div className="flex flex-col items-start md:items-end">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Status</span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mt-1 shadow-2xs ${
                              app.stage === 5 || app.status === 'Offered' || app.status === 'Hired' || app.status === 'Offer Extended'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                                : isInterview
                                ? 'bg-purple-100 text-purple-900 border border-purple-300 font-extrabold'
                                : app.stage === 3 || app.status === 'Shortlisted'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : app.stage === 2 || app.status === 'Under Review' || app.status === 'Reviewing'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : app.stage === 6 || app.status === 'Rejected'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-800 border border-slate-200'
                            }`}>
                              <Clock className="w-3.5 h-3.5 text-blue-500" />
                              {app.status === 'Reviewing' ? 'Under Review' : app.status === 'Interview' ? 'Interview Scheduled' : app.status === 'Hired' ? 'Offer Extended' : (app.status || 'Applied')}
                            </span>
                          </div>

                          <Link
                            to={`/messages?jobId=${app.jobId}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 transition shadow-2xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Chat</span>
                          </Link>
                        </div>
                      </div>

                      {/* Scheduled Interview Callout Banner inside application card */}
                      {isInterview && (
                        <div className="p-4 rounded-2xl bg-purple-50/90 border border-purple-200 text-xs text-purple-950 space-y-3">
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
                                <Video className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <span className="font-extrabold text-purple-900 block text-xs">
                                  Interview Round with {app.company}
                                </span>
                                <span className="text-[10px] text-purple-700 font-medium">Scheduled by employer ATS</span>
                              </div>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-200/80 text-purple-900 text-[10px] font-black uppercase tracking-wider">
                              Confirmed Round
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                            <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                              <span className="text-slate-400 block font-bold uppercase text-[9px]">Date</span>
                              <span className="font-bold text-slate-900 mt-0.5 block">{app.interviewDetails?.date || 'Confirmed'}</span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                              <span className="text-slate-400 block font-bold uppercase text-[9px]">Time</span>
                              <span className="font-bold text-slate-900 mt-0.5 block">{app.interviewDetails?.time ? `${app.interviewDetails.time} IST` : '14:00 IST'}</span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                              <span className="text-slate-400 block font-bold uppercase text-[9px]">Format</span>
                              <span className="font-bold text-purple-900 truncate block mt-0.5">{app.interviewDetails?.type || 'Google Meet'}</span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                              <span className="text-slate-400 block font-bold uppercase text-[9px]">Interviewer</span>
                              <span className="font-bold text-slate-900 truncate block mt-0.5">{app.interviewDetails?.interviewer || 'Tech Lead'}</span>
                            </div>
                          </div>

                          {/* Meeting Link row */}
                          <div className="bg-white p-2.5 rounded-xl border border-purple-100 flex items-center justify-between gap-3 flex-wrap">
                            <div className="min-w-0 flex-1">
                              <span className="text-slate-400 block font-bold uppercase text-[9px]">Meeting Link</span>
                              <a
                                href={app.interviewDetails?.meetLink || 'https://meet.google.com/sj-tech-interview'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 font-semibold truncate block underline hover:no-underline text-[11px]"
                              >
                                {app.interviewDetails?.meetLink || 'https://meet.google.com/sj-tech-interview'}
                              </a>
                            </div>
                            <a
                              href={app.interviewDetails?.meetLink || 'https://meet.google.com/sj-tech-interview'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-700 hover:text-purple-900 font-bold text-xs inline-flex items-center gap-1 shrink-0 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition"
                            >
                              <span>Open Link</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 mb-1">No Applications Submitted Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">Start applying to top verified roles with our 1-click fast track application.</p>
                <Link to="/jobs" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl inline-block shadow-md shadow-blue-600/20">
                  Browse Jobs
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SAVED JOBS */}
        {activeTab === 'saved' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-950">
                  Saved Job Bookmarks ({savedJobsList.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Positions you are monitoring. Apply whenever you are ready.
                </p>
              </div>
            </div>

            {savedJobsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedJobsList.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 mb-1">No Bookmarked Jobs</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">Click the bookmark icon on any job card to save it for later review.</p>
                <Link to="/jobs" className="bg-blue-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl inline-block shadow-md shadow-blue-600/20">
                  Search Openings
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RESUME & ATS SCORE */}
        {activeTab === 'resume' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-950 mb-1">
                Resume Manager & ATS Score
              </h2>
              <p className="text-xs text-slate-500">
                Keep your default CV up to date. Verified recruiters parse this file when reviewing your applications.
              </p>
            </div>

            {/* Current Active Resume */}
            {hasResume ? (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                    PDF
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{user?.resumeName || 'Active Resume'}</h4>
                    <span className="text-xs text-slate-500 font-medium">
                      {user?.resumeSize || 'Standard Size'} • {user?.isCustomUploaded ? 'Uploaded Document' : 'Generated Resume'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors shadow-md shadow-blue-600/20">
                    <span>Replace Resume</span>
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
                  </label>
                  <Link
                    to="/resume"
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
                  >
                    View
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">No Resume Attached Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Upload your CV in PDF format or create one using our ATS resume generator.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <label className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer shadow-xs">
                    <span>Upload Resume</span>
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
                  </label>
                  <Link
                    to="/resume-builder"
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl"
                  >
                    Build Resume
                  </Link>
                </div>
              </div>
            )}

            {/* ATS Score Breakdown */}
            <div className="p-6 rounded-2xl border border-blue-200 bg-blue-50/50">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${atsScore > 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'} flex items-center justify-center font-black text-sm shadow-md shadow-blue-600/20`}>
                  {atsScore > 0 ? atsScore : '—'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-950">
                    {atsScore > 0 ? `ATS Match Score (${atsScore} / 100)` : 'ATS Match Score Not Available'}
                  </h4>
                  <span className="text-xs text-slate-600">
                    {atsScore > 0 ? 'Calculated based on your verified profile skills and resume structure.' : 'Upload or build a resume to calculate your ATS compliance score.'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 mt-4 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${user?.experienceList?.length ? 'text-emerald-600' : 'text-slate-400'} shrink-0`} />
                  <span>Work Experience history ({user?.experienceList?.length || 0} entries)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${user?.education?.length ? 'text-emerald-600' : 'text-slate-400'} shrink-0`} />
                  <span>Education & Academic records ({user?.education?.length || 0} entries)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${(user?.skills?.length || 0) >= 3 ? 'text-emerald-600' : 'text-slate-400'} shrink-0`} />
                  <span>Technical & domain skills ({user?.skills?.length || 0} added)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${hasResume ? 'text-emerald-600' : 'text-slate-400'} shrink-0`} />
                  <span>Default CV file attached ({hasResume ? 'Yes' : 'No'})</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: JOB ALERTS */}
        {activeTab === 'alerts' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg sm:text-xl font-black text-slate-950 mb-1">
              Job Alert Preferences
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Get notified via email and WhatsApp whenever verified employers post openings matching your profile.
            </p>

            <div className="space-y-4 max-w-xl">
              {[
                { key: 'techJobs', title: 'Tech & Software Development Roles', desc: 'React, Node, Full Stack, Python, DevOps' },
                { key: 'bengaluruJobs', title: 'Jobs in Bengaluru & Hybrid Openings', desc: 'Receive instant notifications for regional openings' },
                { key: 'remoteJobs', title: '100% Remote / Work from Home Roles', desc: 'Pan-India remote verified jobs' },
                { key: 'whatsappUpdates', title: 'Instant WhatsApp Application Status Updates', desc: 'Get interview invites on your mobile number' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={alerts[item.key]}
                    onChange={() => handleToggleAlert(item.key)}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CandidateDashboard;
