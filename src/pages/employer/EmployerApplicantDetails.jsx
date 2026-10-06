import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  IndianRupee, 
  Calendar, 
  Clock, 
  Star, 
  ShieldCheck, 
  MessageSquare, 
  Video, 
  Download, 
  Printer, 
  ExternalLink, 
  Trash2, 
  FileText, 
  Sparkles, 
  ChevronRight,
  CheckCircle2,
  Copy,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useJobContext } from '../../context/JobContext';
import { getBackendFileUrl } from '../../services/api';
import EmployerLayout from './EmployerLayout';
import AtsResumeDocument from '../../components/common/AtsResumeDocument';

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'CA';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const EmployerApplicantDetails = () => {
  const { applicantId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromSource = searchParams.get('from') || 'applicants';

  const { 
    applicants = [], 
    conversations = [], 
    updateApplicantStatus, 
    updateApplicantEvaluation, 
    deleteApplicant,
    employerProfile = {}
  } = useJobContext();

  // Find applicant record
  const applicant = applicants.find(
    (a) => String(a.id) === String(applicantId) || 
           String(a._id) === String(applicantId) ||
           (a.applicantEmail && String(a.applicantEmail).toLowerCase() === String(applicantId).toLowerCase()) ||
           (a.email && String(a.email).toLowerCase() === String(applicantId).toLowerCase()) ||
           (a.candidateId && String(a.candidateId?._id || a.candidateId) === String(applicantId))
  );

  // Form states for recruiter evaluation
  const [evalNotes, setEvalNotes] = useState('');
  const [evalRating, setEvalRating] = useState(0);

  // Interview modal state
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewData, setInterviewData] = useState({
    date: '2026-10-05',
    time: '14:00',
    type: 'Google Meet / Video',
    meetLink: 'https://meet.google.com/sj-tech-interview'
  });

  useEffect(() => {
    if (applicant) {
      setEvalNotes(applicant.recruiterNotes || applicant.statusNotes || '');
      setEvalRating(applicant.rating || 0);
      if (applicant.interviewDetails) {
        setInterviewData({
          date: applicant.interviewDetails.date || '2026-10-05',
          time: applicant.interviewDetails.time || '14:00',
          type: applicant.interviewDetails.type || 'Google Meet / Video',
          meetLink: applicant.interviewDetails.meetLink || 'https://meet.google.com/sj-tech-interview'
        });
      }
    }
  }, [applicant]);

  if (!applicant) {
    return (
      <EmployerLayout>
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Applicant Profile Not Found</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            The candidate application you requested may have been archived, removed, or the link is invalid.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/employer/applicants"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Return to Applicants Pipeline
            </Link>
            <Link
              to="/employer/messages"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              View Messages
            </Link>
          </div>
        </div>
      </EmployerLayout>
    );
  }

  const candidateName = applicant.name || applicant.candidateName || applicant.applicantName || 'Candidate';
  const candidateEmail = applicant.email || applicant.applicantEmail || '';
  const candidatePhone = applicant.phone || applicant.applicantPhone || '+91 98765 43210';
  const candidateLocation = applicant.location || 'India';
  const jobTitle = applicant.jobTitle || 'Open Position';
  const atsScore = applicant.atsScore || 92;
  const isBuiltInResume = applicant.resumeSource === 'built_in' || !!applicant.atsResumeData;
  const targetId = applicant.id || applicant._id;

  const handleStageChange = (newStatus) => {
    updateApplicantStatus(targetId, newStatus);
  };

  const handleSaveEvaluation = () => {
    updateApplicantEvaluation(targetId, evalNotes, evalRating);
    toast.success("Recruiter evaluation notes & rating saved!");
  };

  const handleScheduleInterview = (e) => {
    e.preventDefault();
    updateApplicantStatus(targetId, 'Interview Scheduled', 4, interviewData);
    setIsInterviewModalOpen(false);
    toast.success(`📅 Interview scheduled with ${candidateName} on ${interviewData.date} at ${interviewData.time}! Calendar invite generated.`);
  };

  const handleDeleteApplicant = () => {
    if (window.confirm(`Are you sure you want to remove ${candidateName}'s application from your ATS?`)) {
      deleteApplicant(targetId);
      navigate('/employer/applicants');
    }
  };

  return (
    <EmployerLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* TOP NAVIGATION & ACTION BAR */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left: Back & Candidate Title */}
          <div className="flex items-center gap-3.5 min-w-0">
            <button
              onClick={() => {
                if (fromSource === 'messages') {
                  navigate(`/employer/messages?applicantId=${targetId}`);
                } else {
                  navigate('/employer/applicants');
                }
              }}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition shadow-2xs cursor-pointer shrink-0"
              title={fromSource === 'messages' ? 'Return to Recruiter Messages' : 'Return to Applicants Pipeline'}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-slate-950 truncate">
                  {candidateName}
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{atsScore}% ATS Match</span>
                </span>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md shrink-0 ${
                  isBuiltInResume ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {isBuiltInResume ? 'Website Built ATS Resume' : 'Outer File Upload'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5 flex-wrap">
                <span>Applied for: <strong className="text-slate-900 font-bold">{jobTitle}</strong></span>
                <span>•</span>
                <span>{applicant.appliedDate || 'Recent'}</span>
              </p>
            </div>
          </div>

          {/* Right: Pipeline Controls & Primary CTAs */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
            
            {/* Pipeline Stage Selector */}
            <div className="relative">
              <select
                value={applicant.status || 'Applied'}
                onChange={(e) => handleStageChange(e.target.value)}
                className={`text-xs font-bold pl-3 pr-7 py-2.5 rounded-xl border appearance-none cursor-pointer focus:outline-none transition shadow-2xs ${
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
                <option value="Applied">Stage 1: Applied</option>
                <option value="Under Review">Stage 2: Under Review</option>
                <option value="Shortlisted">Stage 3: Shortlisted</option>
                <option value="Interview Scheduled">Stage 4: Interview Scheduled</option>
                <option value="Offered">Stage 5: Offer Extended</option>
                <option value="Rejected">Stage 6: Rejected</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <ChevronRight className="w-3.5 h-3.5 rotate-90" />
              </div>
            </div>

            {/* Message Candidate Button */}
            <Link
              to={`/employer/messages?applicantId=${targetId}`}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-2xs transition active:scale-95 whitespace-nowrap"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              <span>Message</span>
            </Link>

            {/* Schedule Interview CTA */}
            <button
              onClick={() => setIsInterviewModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-2xs transition active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Schedule Interview</span>
            </button>

            {/* Print / Save PDF */}
            <button
              onClick={() => window.print()}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer"
              title="Print / Save PDF"
            >
              <Printer className="w-4 h-4 text-slate-600" />
            </button>
          </div>

        </div>

        {/* SCHEDULED INTERVIEW HIGHLIGHT DOSSIER */}
        {(applicant.status === 'Interview Scheduled' || applicant.status === 'Interview' || applicant.interviewDetails?.date) && (
          <div className="bg-white rounded-2xl p-5 sm:p-6 text-slate-900 shadow-2xs border border-slate-200 animate-in fade-in duration-300 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold shrink-0">
                  <Video className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      📅 Scheduled Interview Round
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Confirmed on ATS
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-950 mt-1">
                    Interview Invitation with {candidateName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Position: <strong className="text-slate-900">{jobTitle}</strong> • Candidate has been notified via dashboard & message thread.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <button
                  type="button"
                  onClick={() => setIsInterviewModalOpen(true)}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reschedule / Update</span>
                </button>
              </div>
            </div>

            {/* Grid of Scheduled Interview Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] font-bold uppercase block tracking-wider">Date</span>
                <span className="text-slate-900 font-extrabold text-xs sm:text-sm mt-0.5 block">
                  {applicant.interviewDetails?.date || 'Confirmed'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] font-bold uppercase block tracking-wider">Time</span>
                <span className="text-slate-900 font-extrabold text-xs sm:text-sm mt-0.5 block">
                  {applicant.interviewDetails?.time ? `${applicant.interviewDetails.time} IST` : '14:00 IST'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] font-bold uppercase block tracking-wider">Format</span>
                <span className="text-slate-900 font-extrabold text-xs sm:text-sm mt-0.5 block truncate">
                  {applicant.interviewDetails?.type || 'Google Meet / Video'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] font-bold uppercase block tracking-wider">Interviewer / Host</span>
                <span className="text-slate-900 font-extrabold text-xs sm:text-sm mt-0.5 block truncate">
                  {applicant.interviewDetails?.interviewer || employerProfile.companyName || 'Hiring Manager'}
                </span>
              </div>
            </div>

            {/* Meeting Link Bar */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0 flex-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase block tracking-wider">Meeting / Joining Link</span>
                <a
                  href={applicant.interviewDetails?.meetLink || 'https://meet.google.com/sj-tech-interview'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-bold truncate block underline hover:no-underline text-xs mt-0.5"
                >
                  {applicant.interviewDetails?.meetLink || 'https://meet.google.com/sj-tech-interview'}
                </a>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const link = applicant.interviewDetails?.meetLink || 'https://meet.google.com/sj-tech-interview';
                    navigator.clipboard.writeText(link);
                    toast.success("Meeting link copied to clipboard!");
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg transition cursor-pointer border border-slate-200 flex items-center gap-1.5 shadow-2xs"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Link</span>
                </button>
                <a
                  href={applicant.interviewDetails?.meetLink || 'https://meet.google.com/sj-tech-interview'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open Meeting Link</span>
                  <ExternalLink className="w-3 h-3 text-white" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* MAIN TWO-COLUMN WORKSPACE: LEFT INFO DOSSIER | RIGHT RESUME DOCUMENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ================= LEFT COLUMN: CANDIDATE INFO & RECRUITER EVALUATION (5 cols) ================= */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Candidate Identity Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-900 text-white flex items-center justify-center font-black text-xl shadow-xs border border-slate-800">
                  {getInitials(candidateName)}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950">{candidateName}</h3>
                  <p className="text-xs font-semibold text-blue-600">{applicant.currentTitle || jobTitle}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Applied to {employerProfile.companyName || 'Company'}</p>
                </div>
              </div>

              {/* Contact Information Grid */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-medium truncate">{candidateEmail || 'No email provided'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-medium">{candidatePhone}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-medium truncate">{candidateLocation}</span>
                </div>
              </div>
            </div>

            {/* 2. Experience & Compensation Key Metrics */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Candidate Profile Metrics
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Experience</span>
                  <span className="text-xs font-bold text-slate-900">{applicant.experience || '1-3 Years'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Expected CTC</span>
                  <span className="text-xs font-bold text-blue-700">{applicant.expectedCtc || 'Negotiable'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Notice Period</span>
                  <span className="text-xs font-bold text-slate-900">{applicant.noticePeriod || 'Immediate'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Current CTC</span>
                  <span className="text-xs font-bold text-slate-900">{applicant.currentCtc || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* 3. Verified Skills */}
            {applicant.skills && applicant.skills.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Verified Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(applicant.skills) ? applicant.skills : [applicant.skills]).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Candidate Cover Letter / Note (If provided) */}
            {applicant.coverLetter && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Candidate Note / Cover Letter
                </h4>
                <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-wrap">
                  {applicant.coverLetter}
                </p>
              </div>
            )}

            {/* 5. Recruiter Screening Notes & 5-Star Evaluation */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Recruiter Screening & Rating
                </h4>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEvalRating(star)}
                      className="p-1 cursor-pointer"
                      title={`Rate ${star} Star${star > 1 ? 's' : ''}`}
                    >
                      <Star className={`w-4 h-4 ${star <= evalRating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Interview / Feedback Notes:
                </label>
                <textarea
                  rows={3}
                  value={evalNotes}
                  onChange={(e) => setEvalNotes(e.target.value)}
                  placeholder="Record assessment notes, salary discussion notes, or interviewer remarks..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleDeleteApplicant}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Applicant</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveEvaluation}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
                >
                  Save Evaluation
                </button>
              </div>
            </div>

            {/* 6. Outer File Download Card (If outer file) */}
            {!isBuiltInResume && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Uploaded Resume File
                </h4>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                      {(applicant.resumeName || '').toLowerCase().endsWith('.pdf') ? 'PDF' : 'DOC'}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block truncate max-w-[220px]">
                        {applicant.resumeName || 'Applicant_Resume.pdf'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {applicant.resumeSize || 'Uploaded File'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const rawUrl = applicant.resumeDataUrl || applicant.resumeUrl;
                      const downloadUrl = getBackendFileUrl(rawUrl);
                      if (downloadUrl) {
                        const a = document.createElement('a');
                        a.href = downloadUrl;
                        a.target = '_blank';
                        a.download = applicant.resumeName || 'Resume.pdf';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      } else {
                        toast.success(`Downloaded candidate file: ${applicant.resumeName || 'Resume.pdf'}`);
                      }
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CV</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* ================= RIGHT COLUMN: COMPLETE RESUME DOCUMENT (7 cols) ================= */}
          <div className="lg:col-span-7 space-y-4">
            
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs">
              
              {/* Document Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-2xs">
                    ATS
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Candidate Resume & Experience Sheet
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {isBuiltInResume ? 'Live standardized ATS single-column document' : 'Uploaded resume submission'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print Document</span>
                </button>
              </div>

              {/* Document Canvas Display */}
              <div className="bg-slate-100/70 p-2 sm:p-6 rounded-2xl border border-slate-200/80">
                <AtsResumeDocument
                  resumeData={applicant.atsResumeData || {}}
                  candidate={applicant}
                  className="w-full shadow-md"
                />
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* SCHEDULE INTERVIEW MODAL */}
      {isInterviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-base font-extrabold text-slate-950">
                <Video className="w-5 h-5 text-blue-600" />
                <span>Schedule Interview with {candidateName}</span>
              </div>
              <button 
                onClick={() => setIsInterviewModalOpen(false)} 
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
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
                  <label className="block font-bold text-slate-700 uppercase mb-1">Interview Time (IST) *</label>
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-blue-600 cursor-pointer"
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
                  onClick={() => setIsInterviewModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-xs cursor-pointer"
                >
                  Confirm & Send Calendar Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </EmployerLayout>
  );
};

export default EmployerApplicantDetails;
