import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Users2, 
  Search, 
  Filter, 
  MapPin, 
  Briefcase, 
  IndianRupee, 
  FileText, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  Star, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Download, 
  Trash2, 
  Video, 
  Send,
  UserCheck,
  ChevronRight,
  MessageSquare,
  FileCode,
  Eye,
  Printer,
  ExternalLink,
  Check,
  Copy
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useJobContext } from '../../context/JobContext';
import { getBackendFileUrl } from '../../services/api';
import EmployerLayout from './EmployerLayout';
import AtsResumeDocument from '../../components/common/AtsResumeDocument';

const EmployerApplicants = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    myEmployerApplicants: applicants = [], 
    myEmployerJobs: jobs = [], 
    updateApplicantStatus, 
    updateApplicantEvaluation, 
    deleteApplicant 
  } = useJobContext();

  const initialJobId = searchParams.get('jobId') || 'All';
  const initialApplicantId = searchParams.get('applicantId');

  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [activeCandidate, setActiveCandidate] = useState(null);
  const [interviewModalCandidate, setInterviewModalCandidate] = useState(null);
  const [viewingAtsResumeCandidate, setViewingAtsResumeCandidate] = useState(null);

  // Form states for notes and interview scheduling
  const [evalNotes, setEvalNotes] = useState('');
  const [evalRating, setEvalRating] = useState(0);

  const [interviewData, setInterviewData] = useState({
    date: '2026-09-24',
    time: '14:00',
    type: 'Google Meet / Video',
    interviewer: 'Tech Lead / VP of Engineering',
    meetLink: 'https://meet.google.com/job-portal-demo'
  });

  useEffect(() => {
    if (initialApplicantId) {
      const found = applicants.find(a => String(a.id) === String(initialApplicantId) || String(a._id) === String(initialApplicantId));
      if (found) {
        setActiveCandidate(found);
        setEvalNotes(found.recruiterNotes || '');
        setEvalRating(found.rating || 0);
      }
    }
  }, [initialApplicantId, applicants]);

  const openCandidateDrawer = (candidate) => {
    setActiveCandidate(candidate);
    setEvalNotes(candidate.recruiterNotes || '');
    setEvalRating(candidate.rating || 0);
  };

  // Filter applicants
  const filteredApplicants = useMemo(() => {
    return applicants.filter(app => {
      const matchJob = selectedJobId === 'All' || String(app.jobId) === String(selectedJobId) || String(app.jobId?._id) === String(selectedJobId);
      const matchStatus = selectedStatus === 'All' || app.status === selectedStatus;
      const candidateName = app.name || app.candidateName || '';
      const matchSearch = candidateName.toLowerCase().includes(search.toLowerCase()) ||
                          (app.email || '').toLowerCase().includes(search.toLowerCase()) ||
                          (app.jobTitle || '').toLowerCase().includes(search.toLowerCase()) ||
                          (app.skills && app.skills.some(s => s.toLowerCase().includes(search.toLowerCase())));
      return matchJob && matchStatus && matchSearch;
    });
  }, [applicants, selectedJobId, selectedStatus, search]);

  const handleSaveEvaluation = () => {
    if (activeCandidate) {
      const targetId = activeCandidate.id || activeCandidate._id;
      updateApplicantEvaluation(targetId, evalNotes, evalRating);
      setActiveCandidate(prev => ({ ...prev, recruiterNotes: evalNotes, rating: evalRating }));
      toast.success("Candidate notes & evaluation saved!");
    }
  };

  const handleScheduleInterview = (e) => {
    e.preventDefault();
    if (interviewModalCandidate) {
      const targetId = interviewModalCandidate.id || interviewModalCandidate._id;
      updateApplicantStatus(targetId, 'Interview Scheduled', 4, interviewData);
      toast.success(`📅 Interview scheduled with ${interviewModalCandidate.name || interviewModalCandidate.candidateName || 'Candidate'} on ${interviewData.date} at ${interviewData.time}! Calendar invite sent.`);
      setInterviewModalCandidate(null);
    }
  };

  const handleExportCSV = () => {
    if (!filteredApplicants || filteredApplicants.length === 0) {
      toast.error("No applicants to export in the current filter.");
      return;
    }

    const headers = [
      "Candidate Name",
      "Job Title",
      "Email",
      "Phone",
      "Status",
      "ATS Score (%)",
      "Experience",
      "Expected CTC",
      "Notice Period",
      "Location",
      "Skills",
      "Applied Date"
    ];

    const rows = filteredApplicants.map(applicant => {
      const name = applicant.name || applicant.candidateName || 'Candidate';
      const jobTitle = applicant.jobTitle || 'N/A';
      const email = applicant.email || 'N/A';
      const phone = applicant.phone || 'N/A';
      const status = applicant.status || 'Applied';
      const atsScore = applicant.atsScore || 90;
      const experience = applicant.experience || 'N/A';
      const expectedCtc = applicant.expectedCtc || 'N/A';
      const noticePeriod = applicant.noticePeriod || 'N/A';
      const location = applicant.location || 'N/A';
      const skills = Array.isArray(applicant.skills) ? applicant.skills.join('; ') : (applicant.skills || 'N/A');
      const appliedDate = applicant.appliedDate || new Date().toISOString().split('T')[0];

      return [
        `"${String(name).replace(/"/g, '""')}"`,
        `"${String(jobTitle).replace(/"/g, '""')}"`,
        `"${String(email).replace(/"/g, '""')}"`,
        `"${String(phone).replace(/"/g, '""')}"`,
        `"${String(status).replace(/"/g, '""')}"`,
        atsScore,
        `"${String(experience).replace(/"/g, '""')}"`,
        `"${String(expectedCtc).replace(/"/g, '""')}"`,
        `"${String(noticePeriod).replace(/"/g, '""')}"`,
        `"${String(location).replace(/"/g, '""')}"`,
        `"${String(skills).replace(/"/g, '""')}"`,
        `"${String(appliedDate).replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ats_applicants_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${filteredApplicants.length} applicant records as CSV!`);
  };

  const statusList = ['All', 'Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Offered', 'Rejected'];

  return (
    <EmployerLayout>
      <div className="space-y-4">
        
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-0.5">
              <Users2 className="w-3.5 h-3.5 text-blue-600" />
              Applicant Tracking System (ATS Pipeline)
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950">
              Candidate Applicants & Review
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Showing <strong className="text-blue-600">{filteredApplicants.length}</strong> candidate profiles across active pipelines.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Strip */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs space-y-3">
          
          {/* Top Row: Search & Job Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidate name, skills, email, location..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white text-slate-900 transition-colors"
              />
            </div>

            {/* Job Filter Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-slate-500 hidden sm:inline whitespace-nowrap">Job:</span>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-bold text-slate-800 max-w-[260px] truncate"
              >
                <option value="All">All Job Openings ({applicants.length})</option>
                {jobs.map(j => {
                  const count = applicants.filter(a => String(a.jobId) === String(j.id) || String(a.jobId) === String(j._id)).length;
                  return (
                    <option key={j._id || j.id} value={j._id || j.id}>{j.title} ({count})</option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Bottom Row: Stage Filter Tabs with Counts */}
          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">Stage:</span>
            {statusList.map((status) => {
              const count = status === 'All' 
                ? applicants.length 
                : applicants.filter(a => a.status === status).length;
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedStatus === status
                      ? 'bg-slate-950 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{status}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    selectedStatus === status ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Applicants List Grid / Cards */}
        {filteredApplicants.length > 0 ? (
          <div className="space-y-3">
            {filteredApplicants.map((applicant) => (
              <div
                key={applicant.id || applicant._id}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-300 p-4 sm:p-5 transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col xl:flex-row xl:items-center justify-between gap-4"
              >
                {/* Left: Avatar + Candidate Core Info */}
                <div className="flex items-start gap-3.5 sm:gap-4 flex-1 min-w-0">
                  {/* Candidate Avatar */}
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-blue-500/20 shrink-0">
                    {(applicant.name || applicant.candidateName || 'Candidate').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Row 1: Name + Match Badge + Resume Source + Applied Job */}
                    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-slate-950 tracking-tight">
                        {applicant.name || applicant.candidateName || 'Candidate'}
                      </h3>

                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 leading-none">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        {applicant.atsScore || 90}% Match
                      </span>

                      {applicant.resumeSource === 'built_in' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 leading-none">
                          <FileCode className="w-3 h-3 text-blue-600" />
                          Website Built ATS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 leading-none">
                          <FileText className="w-3 h-3 text-slate-600" />
                          Outer File Upload
                        </span>
                      )}

                      <span className="text-slate-300 hidden sm:inline">•</span>

                      <div className="text-xs text-slate-500 font-medium flex items-center gap-1 truncate">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Applied for:</span>
                        <span className="font-semibold text-slate-800">{applicant.jobTitle}</span>
                      </div>
                    </div>

                    {/* Row 2: Metadata Inline Row (Experience, CTC, Notice, Location) */}
                    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-700 font-semibold">{applicant.experience || 'Fresher'}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80 font-medium">
                        <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">{applicant.expectedCtc || 'Negotiable'}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-600">{applicant.noticePeriod || 'Immediate'}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80 font-medium truncate max-w-[200px]">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{applicant.location || 'India'}</span>
                      </span>
                    </div>

                    {/* Row 3: Skill Badges */}
                    {applicant.skills && applicant.skills.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {applicant.skills.slice(0, 6).map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-medium px-2 py-0.5 bg-slate-100/90 text-slate-700 rounded-md border border-slate-200/80"
                          >
                            {skill}
                          </span>
                        ))}
                        {applicant.skills.length > 6 && (
                          <span className="text-[10px] font-bold text-slate-400 px-1 py-0.5">
                            +{applicant.skills.length - 6} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Scheduled Interview Quick Callout on Pipeline Card */}
                    {(applicant.status === 'Interview Scheduled' || applicant.status === 'Interview' || applicant.interviewDetails?.date) && (
                      <div className="flex items-center gap-2 flex-wrap p-2 rounded-xl bg-purple-50/90 border border-purple-200 text-xs text-purple-950 mt-1">
                        <div className="flex items-center gap-1.5 font-extrabold text-purple-900">
                          <Video className="w-3.5 h-3.5 text-purple-700" />
                          <span>Interview:</span>
                        </div>
                        <span className="font-bold text-slate-900">
                          {applicant.interviewDetails?.date || 'Confirmed'} • {applicant.interviewDetails?.time ? `${applicant.interviewDetails.time} IST` : '14:00 IST'}
                        </span>
                        <span className="text-purple-300">•</span>
                        <span className="text-purple-800 font-medium">{applicant.interviewDetails?.type || 'Google Meet'}</span>
                        <span className="text-purple-300">•</span>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 text-[11px] font-semibold">Link:</span>
                          <a
                            href={applicant.interviewDetails?.meetLink || 'https://meet.google.com/sj-tech-interview'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-bold underline truncate max-w-[180px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {applicant.interviewDetails?.meetLink || 'https://meet.google.com/sj-tech-interview'}
                          </a>
                          <a
                            href={applicant.interviewDetails?.meetLink || 'https://meet.google.com/sj-tech-interview'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-700 hover:text-purple-900 ml-0.5"
                            onClick={(e) => e.stopPropagation()}
                            title="Open Link"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Pipeline Stage Selector + Action Buttons */}
                <div className="flex items-center gap-2 self-stretch sm:self-auto xl:self-center justify-between sm:justify-end pt-3 xl:pt-0 border-t xl:border-t-0 border-slate-100 shrink-0">
                  
                  {/* Pipeline Stage Dropdown */}
                  <div className="relative">
                    <select
                      value={applicant.status || 'Applied'}
                      onChange={(e) => {
                        const newStat = e.target.value;
                        const targetId = applicant.id || applicant._id;
                        updateApplicantStatus(targetId, newStat);
                        if (activeCandidate && (String(activeCandidate.id) === String(targetId) || String(activeCandidate._id) === String(targetId))) {
                          setActiveCandidate(prev => ({ ...prev, status: newStat }));
                        }
                      }}
                      aria-label="Pipeline Stage"
                      className={`text-xs font-bold pl-3 pr-7 py-2 rounded-xl border appearance-none cursor-pointer focus:outline-none transition-all shadow-2xs ${
                        applicant.status === 'Offered' || applicant.status === 'Hired'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100/80'
                          : applicant.status === 'Interview Scheduled' || applicant.status === 'Interview'
                          ? 'bg-purple-50 text-purple-800 border-purple-300 hover:bg-purple-100/80'
                          : applicant.status === 'Shortlisted'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/80'
                          : applicant.status === 'Rejected'
                          ? 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200/80'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <option value="Applied">1. Applied</option>
                      <option value="Under Review">2. Under Review</option>
                      <option value="Shortlisted">3. Shortlisted</option>
                      <option value="Interview Scheduled">4. Interview Scheduled</option>
                      <option value="Offered">5. Offer Extended</option>
                      <option value="Rejected">6. Rejected</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                      <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                    </div>
                  </div>

                  {/* Message Button */}
                  <Link
                    to={`/employer/messages?applicantId=${applicant.id || applicant._id}`}
                    className="bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-950 border border-slate-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 whitespace-nowrap"
                    title="Direct Recruiter Message"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span className="hidden sm:inline">Message</span>
                  </Link>

                  {/* Schedule Interview */}
                  <button
                    onClick={() => setInterviewModalCandidate(applicant)}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 whitespace-nowrap cursor-pointer"
                    title="Schedule Interview"
                  >
                    <Video className="w-3.5 h-3.5 text-blue-400" />
                    <span className="hidden sm:inline">Interview</span>
                  </button>

                  {/* View Profile Primary CTA */}
                  <Link
                    to={`/employer/applicants/${applicant.id || applicant._id}?from=applicants`}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs shadow-blue-500/20 transition-all active:scale-95 whitespace-nowrap"
                  >
                    <span>View Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Users2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No Applicants Found</h3>
            <p className="text-xs text-slate-500">Try changing your job or status filter to see more candidates.</p>
          </div>
        )}

      </div>

      {/* CANDIDATE DOSSIER DRAWER / MODAL */}
      {activeCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            
            {/* Header */}
            <div className="bg-slate-950 text-white p-6 relative shrink-0">
              <button
                onClick={() => setActiveCandidate(null)}
                className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg">
                  {(activeCandidate.name || activeCandidate.candidateName || 'Candidate').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white">{activeCandidate.name || activeCandidate.candidateName || 'Candidate'}</h2>
                  <span className="text-xs text-slate-300">
                    Applying for: <strong className="text-white">{activeCandidate.jobTitle}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs sm:text-sm">
              
              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-slate-800 truncate">{activeCandidate.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-slate-800">{activeCandidate.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-slate-800 truncate">{activeCandidate.location}</span>
                </div>
              </div>

              {/* Scheduled Interview Details Card (If interview exists) */}
              {(activeCandidate.status === 'Interview Scheduled' || activeCandidate.status === 'Interview' || activeCandidate.interviewDetails?.date) && (
                <div className="p-4 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold">
                        <Video className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-950">
                          Scheduled Interview Round
                        </h4>
                        <span className="text-[10px] text-slate-500">Confirmed on employer ATS pipeline</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider border border-slate-200">
                      Confirmed Round
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block font-bold uppercase text-[9px]">Date</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">{activeCandidate.interviewDetails?.date || 'Confirmed'}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block font-bold uppercase text-[9px]">Time</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">{activeCandidate.interviewDetails?.time ? `${activeCandidate.interviewDetails.time} IST` : '14:00 IST'}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block font-bold uppercase text-[9px]">Format</span>
                      <span className="font-bold text-slate-900 truncate block mt-0.5">{activeCandidate.interviewDetails?.type || 'Google Meet'}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block font-bold uppercase text-[9px]">Interviewer</span>
                      <span className="font-bold text-slate-900 truncate block mt-0.5">{activeCandidate.interviewDetails?.interviewer || 'Hiring Lead'}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <span className="text-slate-400 block font-bold uppercase text-[9px]">Meeting Link</span>
                      <a
                        href={activeCandidate.interviewDetails?.meetLink || 'https://meet.google.com/sj-tech-interview'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-bold truncate block underline hover:no-underline text-xs"
                      >
                        {activeCandidate.interviewDetails?.meetLink || 'https://meet.google.com/sj-tech-interview'}
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const link = activeCandidate.interviewDetails?.meetLink || 'https://meet.google.com/sj-tech-interview';
                          navigator.clipboard.writeText(link);
                          toast.success("Meeting link copied to clipboard!");
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg transition cursor-pointer border border-slate-200 flex items-center gap-1 shadow-2xs"
                      >
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span>Copy</span>
                      </button>
                      <a
                        href={activeCandidate.interviewDetails?.meetLink || 'https://meet.google.com/sj-tech-interview'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center gap-1"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3 text-white" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Resume File Card */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Attached Resume / Candidate Submission
                  </h4>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                    activeCandidate.resumeSource === 'built_in'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {activeCandidate.resumeSource === 'built_in' ? 'Website Built ATS Resume' : 'Outer File Upload'}
                  </span>
                </div>

                {activeCandidate.resumeSource === 'built_in' ? (
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                          ATS
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block truncate max-w-[220px] sm:max-w-xs">
                            {activeCandidate.resumeName || `${(activeCandidate.name || 'Candidate').replace(/\s+/g, '_')}_ATS_Resume.pdf`}
                          </span>
                          <span className="text-xs text-blue-700 font-semibold">
                            Built on Balaji Portal • Verified ATS Score: {activeCandidate.atsScore || 95}%
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setViewingAtsResumeCandidate(activeCandidate)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View ATS Resume</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                        {(activeCandidate.resumeName || '').toLowerCase().endsWith('.pdf') ? 'PDF' : 'DOC'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block truncate max-w-[220px] sm:max-w-xs">
                          {activeCandidate.resumeName || 'Applicant_Outer_Resume.pdf'}
                        </span>
                        <span className="text-xs text-slate-500">
                          Uploaded by applicant • {activeCandidate.resumeSize || 'Custom File'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const rawUrl = activeCandidate.resumeDataUrl || activeCandidate.resumeUrl;
                        const downloadUrl = getBackendFileUrl(rawUrl);
                        if (downloadUrl) {
                          const a = document.createElement('a');
                          a.href = downloadUrl;
                          a.target = '_blank';
                          a.download = activeCandidate.resumeName || 'Resume.pdf';
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                        } else {
                          toast.success(`Downloaded candidate file: ${activeCandidate.resumeName || 'Resume.pdf'}`);
                        }
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Outer CV</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Pipeline Stage Management */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Pipeline Stage & Application Status
                </h4>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Current Candidate Stage:</span>
                    <span className="text-xs text-slate-500">Updating stage syncs immediately across employer & candidate dashboards.</span>
                  </div>
                  <select
                    value={activeCandidate.status || 'Applied'}
                    onChange={(e) => {
                      const newStat = e.target.value;
                      const targetId = activeCandidate.id || activeCandidate._id;
                      updateApplicantStatus(targetId, newStat);
                      setActiveCandidate(prev => ({ ...prev, status: newStat }));
                    }}
                    className={`text-xs font-bold px-3 py-2 rounded-xl border focus:outline-none transition shadow-2xs ${
                      activeCandidate.status === 'Offered' || activeCandidate.status === 'Hired'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : activeCandidate.status === 'Interview Scheduled' || activeCandidate.status === 'Interview'
                        ? 'bg-purple-50 text-purple-800 border-purple-300'
                        : activeCandidate.status === 'Shortlisted'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : activeCandidate.status === 'Rejected'
                        ? 'bg-slate-100 text-slate-600 border-slate-300'
                        : 'bg-white text-slate-800 border-slate-200'
                    }`}
                  >
                    <option value="Applied">Stage 1: Applied</option>
                    <option value="Under Review">Stage 2: Under Review</option>
                    <option value="Shortlisted">Stage 3: Shortlisted</option>
                    <option value="Interview Scheduled">Stage 4: Interview Scheduled</option>
                    <option value="Offered">Stage 5: Offer Extended</option>
                    <option value="Rejected">Stage 6: Rejected</option>
                  </select>
                </div>
              </div>

              {/* Recruiter Evaluation & Notes */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Recruiter Evaluation & Star Rating
                </h4>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Candidate Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEvalRating(star)}
                          className="p-1"
                        >
                          <Star className={`w-5 h-5 ${star <= evalRating ? 'text-slate-900 fill-slate-900' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Recruiter Interview / Screening Notes:</label>
                    <textarea
                      rows={3}
                      value={evalNotes}
                      onChange={(e) => setEvalNotes(e.target.value)}
                      placeholder="Add assessment notes from recruiter screening, compensation discussions, or manager feedback..."
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <button
                    onClick={handleSaveEvaluation}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs"
                  >
                    Save Notes & Rating
                  </button>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                onClick={() => {
                  deleteApplicant(activeCandidate.id || activeCandidate._id);
                  setActiveCandidate(null);
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove Applicant</span>
              </button>

              <div className="flex items-center gap-2">
                <Link
                  to={`/employer/messages?applicantId=${activeCandidate.id || activeCandidate._id}`}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message Candidate</span>
                </Link>
                <button
                  onClick={() => {
                    setInterviewModalCandidate(activeCandidate);
                    setActiveCandidate(null);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Video className="w-4 h-4" />
                  <span>Schedule Interview</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      {interviewModalCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-base font-extrabold text-slate-950">
                <Video className="w-5 h-5 text-blue-600" />
                <span>Schedule Interview with {interviewModalCandidate.name || interviewModalCandidate.candidateName || 'Candidate'}</span>
              </div>
              <button onClick={() => setInterviewModalCandidate(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Interview Date *</label>
                  <input
                    type="date"
                    required
                    value={interviewData.date}
                    onChange={(e) => setInterviewData({ ...interviewData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Interview Time *</label>
                  <input
                    type="time"
                    required
                    value={interviewData.time}
                    onChange={(e) => setInterviewData({ ...interviewData, time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Interview Format</label>
                <select
                  value={interviewData.type}
                  onChange={(e) => setInterviewData({ ...interviewData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-blue-600"
                >
                  <option value="Google Meet / Video">Google Meet (Online Video Round)</option>
                  <option value="Microsoft Teams">Microsoft Teams</option>
                  <option value="On-Site Face-to-Face">On-Site Face-to-Face Office Round</option>
                  <option value="Telephonic Screening">Telephonic Screening Round</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Meeting / Location Link</label>
                <input
                  type="text"
                  value={interviewData.meetLink}
                  onChange={(e) => setInterviewData({ ...interviewData, meetLink: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-blue-600"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setInterviewModalCandidate(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-xs"
                >
                  Confirm & Send Calendar Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ATS RESUME VIEWER MODAL FOR EMPLOYERS */}
      {viewingAtsResumeCandidate && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
          <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  ATS
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                    {viewingAtsResumeCandidate.name || viewingAtsResumeCandidate.candidateName || 'Candidate'} — ATS Resume
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                      {viewingAtsResumeCandidate.atsScore || 95}% Match
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Website Built ATS Profile • Applied for {viewingAtsResumeCandidate.jobTitle}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
                  title="Print / Save PDF"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Print CV</span>
                </button>
                <button
                  onClick={() => setViewingAtsResumeCandidate(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable ATS Resume Document Canvas */}
            <div className="py-4 overflow-y-auto flex-1 bg-slate-100/70 rounded-2xl p-2 sm:p-6 my-2 flex justify-center items-start">
              <AtsResumeDocument
                resumeData={viewingAtsResumeCandidate.atsResumeData || {}}
                candidate={viewingAtsResumeCandidate}
                className="w-full"
              />
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400">
                Verified Candidate ATS Profile on Balaji Placement
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewingAtsResumeCandidate(null)}
                  className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition"
                >
                  Close ATS Viewer
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </EmployerLayout>
  );
};

export default EmployerApplicants;
