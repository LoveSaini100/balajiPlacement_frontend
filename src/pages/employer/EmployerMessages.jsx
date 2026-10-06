import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Briefcase, 
  ArrowLeft,
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Building2,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Star,
  CheckCircle2,
  CheckCircle,
  Video,
  ExternalLink,
  ChevronRight,
  X,
  Award,
  Filter,
  Plus,
  RefreshCw,
  Eye,
  Download,
  Trash2,
  Printer
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

const EmployerMessages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryApplicantId = searchParams.get('applicantId');
  const queryJobId = searchParams.get('jobId');

  const { 
    user, 
    employerProfile, 
    myEmployerApplicants: applicants = [], 
    myEmployerJobs: jobs = [], 
    myEmployerConversations: conversations = [], 
    messages = {}, 
    sendMessage, 
    fetchMessagesForConversation,
    updateApplicantStatus,
    updateApplicantEvaluation,
    deleteApplicant,
    setConversations,
    setMessages
  } = useJobContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState('All');
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewDate, setInterviewDate] = useState('2026-09-30');
  const [interviewTime, setInterviewTime] = useState('14:30');
  const [interviewMode, setInterviewMode] = useState('Google Meet / Video Call');
  const [evalNotes, setEvalNotes] = useState('');
  const [evalRating, setEvalRating] = useState(0);
  const [viewingAtsResumeCandidate, setViewingAtsResumeCandidate] = useState(null);
  const messageContainerRef = useRef(null);

  // Build unified live channels from database applicants and conversations
  const candidateChannels = useMemo(() => {
    const channelsMap = new Map();

    // 1. Process all applicants from Database / Context
    applicants.forEach(app => {
      const candidateName = 
        app.applicantName || 
        app.candidateName || 
        app.name || 
        app.candidateId?.name || 
        (app.email ? app.email.split('@')[0] : 'Applicant');

      const candidateEmail = app.applicantEmail || app.email || app.candidateId?.email || '';
      const appId = String(app._id || app.id);
      const jId = String(app.jobId?._id || app.jobId || '');

      // Match with database conversation
      const existingConv = conversations.find(
        c => (c.applicationId && String(c.applicationId) === appId) ||
             (c.applicantId && String(c.applicantId) === appId) ||
             (c.jobId && String(c.jobId?._id || c.jobId) === jId && 
              ((c.candidateEmail && candidateEmail && c.candidateEmail.toLowerCase() === candidateEmail.toLowerCase()) ||
               (c.candidateId && String(c.candidateId?._id || c.candidateId) === String(app.candidateId?._id || app.candidateId))))
      );

      const convId = existingConv ? (existingConv._id || existingConv.id) : appId;
      const rSource = app.resumeSource || (app.atsResumeData ? 'built_in' : 'outer_file');
      const rName = app.resumeName || (rSource === 'built_in' ? `${candidateName.replace(/\s+/g, '_')}_ATS_Resume.pdf` : `${candidateName.replace(/\s+/g, '_')}_Resume.pdf`);

      channelsMap.set(appId, {
        id: appId,
        _id: appId,
        convId: convId,
        applicantId: appId,
        candidateName: candidateName,
        name: candidateName,
        candidateEmail: candidateEmail,
        email: candidateEmail,
        candidatePhone: app.applicantPhone || app.phone || app.candidateId?.phone || '+91 98765 43210',
        phone: app.applicantPhone || app.phone || app.candidateId?.phone || '+91 98765 43210',
        candidateLocation: app.location || app.candidateId?.candidateProfile?.location || 'India',
        location: app.location || app.candidateId?.candidateProfile?.location || 'India',
        jobId: app.jobId,
        jobTitle: app.jobTitle || 'Open Position',
        companyName: app.company || app.companyName || employerProfile.companyName || 'SJ tech',
        experience: app.experience || '3+ Years',
        expectedCtc: app.expectedCtc || 'Negotiable',
        currentCtc: app.currentCtc || 'N/A',
        noticePeriod: app.noticePeriod || 'Immediate',
        skills: app.skills || ['Technical Competence', 'Problem Solving'],
        atsScore: app.atsScore || 92,
        status: app.status || 'Applied',
        stage: app.stage || 1,
        resumeSource: rSource,
        resumeName: rName,
        resumeUrl: app.resumeUrl || '',
        resumeDataUrl: app.resumeDataUrl || '',
        resumeSize: app.resumeSize || '',
        atsResumeData: app.atsResumeData || null,
        coverLetter: app.coverLetter || '',
        recruiterNotes: app.recruiterNotes || app.statusNotes || '',
        rating: app.rating || 0,
        appliedDate: app.appliedDate || 'Recent',
        lastMessage: existingConv?.lastMessage || `Application received for ${app.jobTitle || 'role'}`,
        lastMessageAt: existingConv?.lastMessageAt || new Date().toISOString()
      });
    });

    // 2. Include any conversation from database that might not be directly in applicants state
    conversations.forEach(c => {
      const convKey = String(c.applicationId || c._id || c.id);

      if (!channelsMap.has(convKey)) {
        const candidateEmail = c.candidateEmail || c.candidateId?.email || '';
        const candidateName = c.candidateName || c.candidateId?.name || (candidateEmail ? candidateEmail.split('@')[0] : 'Candidate');

        channelsMap.set(convKey, {
          id: c._id || c.id,
          _id: c._id || c.id,
          convId: c._id || c.id,
          applicantId: c.applicationId || c.applicantId || c._id || c.id,
          candidateName: candidateName,
          name: candidateName,
          candidateEmail: candidateEmail,
          email: candidateEmail,
          candidatePhone: c.candidateId?.phone || '+91 98765 43210',
          phone: c.candidateId?.phone || '+91 98765 43210',
          candidateLocation: c.candidateId?.candidateProfile?.location || 'India',
          location: c.candidateId?.candidateProfile?.location || 'India',
          jobId: c.jobId?._id || c.jobId,
          jobTitle: c.jobTitle || c.jobId?.title || 'Open Position',
          companyName: c.companyName || employerProfile.companyName || 'SJ tech',
          experience: '3+ Years',
          expectedCtc: 'Negotiable',
          currentCtc: 'N/A',
          noticePeriod: 'Immediate',
          skills: ['Technical Expertise', 'Communication'],
          atsScore: 90,
          status: 'Under Review',
          stage: 2,
          resumeSource: 'built_in',
          resumeName: `${candidateName.replace(/\s+/g, '_')}_ATS_Resume.pdf`,
          resumeUrl: '',
          resumeDataUrl: '',
          resumeSize: '',
          atsResumeData: null,
          coverLetter: '',
          recruiterNotes: '',
          rating: 0,
          appliedDate: 'Recent',
          lastMessage: c.lastMessage || 'Direct ATS recruitment channel',
          lastMessageAt: c.lastMessageAt || new Date().toISOString()
        });
      }
    });

    return Array.from(channelsMap.values());
  }, [applicants, conversations, employerProfile]);

  // Set initial selected candidate
  useEffect(() => {
    if (candidateChannels.length > 0) {
      if (queryApplicantId) {
        const found = candidateChannels.find(c => 
          String(c.id) === String(queryApplicantId) || 
          String(c._id) === String(queryApplicantId) ||
          String(c.applicantId) === String(queryApplicantId) ||
          String(c.convId) === String(queryApplicantId)
        );
        if (found) {
          setSelectedCandidateId(found.id);
          return;
        }
      }
      if (queryJobId) {
        const found = candidateChannels.find(c => String(c.jobId?._id || c.jobId) === String(queryJobId));
        if (found) {
          setSelectedCandidateId(found.id);
          return;
        }
      }
      if (!selectedCandidateId || !candidateChannels.some(c => c.id === selectedCandidateId)) {
        setSelectedCandidateId(candidateChannels[0].id);
      }
    } else {
      setSelectedCandidateId(null);
    }
  }, [candidateChannels, queryApplicantId, queryJobId]);

  const activeChannel = candidateChannels.find(c => c.id === selectedCandidateId);

  // Fetch or ensure messages exist for this conversation
  // Fetch messages for active conversation
  useEffect(() => {
    if (activeChannel?.convId && fetchMessagesForConversation) {
      fetchMessagesForConversation(activeChannel.convId);
    }
  }, [activeChannel?.convId]);

  const activeMessages = (activeChannel && messages && messages[activeChannel.convId]) || [];

  const scrollToBottom = (smooth = false) => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  useEffect(() => {
    if (selectedCandidateId) {
      const timer = setTimeout(() => {
        scrollToBottom(false);
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [selectedCandidateId, activeMessages.length]);

  // Filter channels by search and stage
  const filteredChannels = useMemo(() => {
    return candidateChannels.filter(c => {
      const term = searchQuery.toLowerCase();
      const matchSearch = 
        c.candidateName.toLowerCase().includes(term) ||
        c.jobTitle.toLowerCase().includes(term) ||
        (c.skills && c.skills.some(s => s.toLowerCase().includes(term)));

      const matchStage = filterStage === 'All' || c.status === filterStage;
      return matchSearch && matchStage;
    });
  }, [candidateChannels, searchQuery, filterStage]);

  // Send message handler
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeChannel) return;

    const textToSend = inputText.trim();
    setInputText('');

    const convId = activeChannel.convId;
    const recruiterSenderName = `${employerProfile.recruiterName || 'Talent Lead'} (${employerProfile.companyName || 'SJ tech'})`;

    if (sendMessage) {
      await sendMessage(convId, textToSend, 'employer', recruiterSenderName);
      setTimeout(() => scrollToBottom(true), 60);
    }

    toast.success(`Message sent to ${activeChannel.candidateName}`, { icon: '💬' });
  };

  // Quick action templates
  const insertTemplate = (type) => {
    if (!activeChannel) return;
    const cName = activeChannel.candidateName.split(' ')[0] || 'Candidate';
    const role = activeChannel.jobTitle;
    const company = employerProfile.companyName || 'SJ tech';

    let text = '';
    if (type === 'interview') {
      text = `Hi ${cName}, we reviewed your profile for the ${role} opening at ${company} and would like to invite you for a 30-minute technical interview. Please let us know your availability over the next few days!`;
    } else if (type === 'portfolio') {
      text = `Hi ${cName}, could you please share your updated portfolio, GitHub link, or references for our technical review?`;
    } else if (type === 'shortlisted') {
      text = `Hi ${cName}, congratulations! Your application for the ${role} position at ${company} has been shortlisted. We will share the interview schedule soon.`;
    } else if (type === 'offer') {
      text = `Congratulations ${cName}! The hiring panel at ${company} is delighted to extend a formal job offer for the ${role} position. We look forward to welcoming you aboard!`;
    }

    setInputText(text);
  };

  // Status changer directly from chat desk
  const handleStatusChange = (newStatus) => {
    if (!activeChannel) return;
    let stageNum = 1;
    if (newStatus === 'Under Review') stageNum = 2;
    if (newStatus === 'Shortlisted') stageNum = 3;
    if (newStatus === 'Interview Scheduled') stageNum = 4;
    if (newStatus === 'Offered') stageNum = 5;
    if (newStatus === 'Rejected') stageNum = 6;

    const targetAppId = activeChannel.applicantId || activeChannel.id || activeChannel._id;
    if (updateApplicantStatus && targetAppId) {
      updateApplicantStatus(targetAppId, newStatus, stageNum);
    }
    activeChannel.status = newStatus;
    activeChannel.stage = stageNum;

    // Post an automated system audit event to the chat
    const auditMsg = {
      _id: `m-audit-${Date.now()}`,
      conversationId: activeChannel.convId,
      senderId: 'system',
      senderRole: 'system',
      senderName: 'ATS Pipeline Update',
      text: `🔔 Candidate application stage changed to "${newStatus}" by ${employerProfile.recruiterName || 'Talent Lead'}.`,
      createdAt: new Date().toISOString()
    };

    if (setMessages) {
      setMessages(prev => ({
        ...prev,
        [activeChannel.convId]: [...(prev[activeChannel.convId] || []), auditMsg]
      }));
    }

    toast.success(`Candidate status updated to "${newStatus}"`);
  };

  const openDossierModal = () => {
    if (activeChannel) {
      setEvalNotes(activeChannel.recruiterNotes || '');
      setEvalRating(activeChannel.rating || 0);
      setIsDossierModalOpen(true);
    }
  };

  const handleSaveEvaluation = () => {
    if (activeChannel) {
      const targetId = activeChannel.applicantId || activeChannel.id || activeChannel._id;
      if (updateApplicantEvaluation) {
        updateApplicantEvaluation(targetId, evalNotes, evalRating);
      }
      activeChannel.recruiterNotes = evalNotes;
      activeChannel.rating = evalRating;
      toast.success("Candidate notes & evaluation saved!");
    }
  };

  // Schedule Interview action
  const handleConfirmScheduleInterview = async (e) => {
    e.preventDefault();
    if (!activeChannel) return;

    const interviewPayload = {
      date: interviewDate,
      time: interviewTime,
      type: interviewMode,
      meetLink: 'https://meet.google.com/sj-tech-interview',
      interviewer: `${employerProfile.recruiterName || 'Talent Lead'} (${employerProfile.companyName || 'SJ tech'})`
    };

    const targetId = activeChannel.applicantId || activeChannel.id || activeChannel._id;
    if (updateApplicantStatus) {
      await updateApplicantStatus(targetId, 'Interview Scheduled', 4, interviewPayload);
    }
    setIsInterviewModalOpen(false);

    const inviteMsg = `📅 INTERVIEW INVITATION:\n\nRole: ${activeChannel.jobTitle}\nDate: ${interviewDate}\nTime: ${interviewTime} IST\nFormat: ${interviewMode}\nMeeting Link: https://meet.google.com/sj-tech-interview\nInterviewer: ${interviewPayload.interviewer}\n\nLooking forward to speaking with you!`;
    const recruiterSenderName = `${employerProfile.recruiterName || 'Talent Lead'} (${employerProfile.companyName || 'SJ tech'})`;

    if (sendMessage) {
      await sendMessage(activeChannel.convId, inviteMsg, 'employer', recruiterSenderName);
    }

    toast.success(`Interview scheduled & invite sent to ${activeChannel.candidateName}!`, { duration: 5000, icon: '📅' });
  };

  return (
    <EmployerLayout>
      <div className="flex flex-col h-[calc(100vh-140px)] min-h-[620px] max-w-7xl mx-auto w-full pb-4">
        
        {/* TOP RECRUITER HEADER (Compact & Clean) */}
        <div className="flex items-center justify-between gap-4 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-2xs mb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-950">
                Candidate ATS Messaging Desk
              </h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Live Recruiter Channels
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct real-time communication with active applicants for <strong className="text-slate-800">{employerProfile.companyName || 'SJ tech'}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/employer/applicants"
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition flex items-center gap-1.5 shadow-2xs"
            >
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Pipeline ({applicants.length})</span>
            </Link>
            <Link
              to="/employer/post-job"
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-xs shadow-blue-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Job</span>
            </Link>
          </div>
        </div>

        {/* MESSAGING WORKSPACE MAIN CONTAINER (Fills all available height) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0">
          
          {/* ================= LEFT SIDEBAR: CANDIDATE APPLICANTS (4 cols) ================= */}
          <div className="lg:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50 h-full min-h-0">
            
            {/* Search & Stage Filters */}
            <div className="p-3 border-b border-slate-200 bg-white space-y-2 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search candidate by name, job, skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-medium"
                />
              </div>

              {/* Stage Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
                {['All', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Offered'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStage(st)}
                    className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition cursor-pointer ${
                      filterStage === st
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'Interview Scheduled' ? 'Interview' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Candidate Channel List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-h-0">
              {filteredChannels.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">No Candidate Channels Found</p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                      Applicants who apply for your posted openings at {employerProfile.companyName || 'SJ tech'} will appear here.
                    </p>
                  </div>
                  <Link
                    to="/employer/applicants"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    <span>View Applicant Pipeline</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                filteredChannels.map((cand) => {
                  const isSelected = selectedCandidateId === cand.id;
                  const initials = getInitials(cand.candidateName);

                  return (
                    <button
                      key={cand.id}
                      onClick={() => setSelectedCandidateId(cand.id)}
                      className={`w-full p-3.5 text-left transition flex items-start gap-3 hover:bg-white cursor-pointer ${
                        isSelected ? 'bg-white border-l-4 border-l-blue-600 shadow-xs' : ''
                      }`}
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-blue-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs border border-slate-800 relative">
                        {initials}
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>

                      {/* Info & Status */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="text-xs font-black text-slate-950 truncate">
                            {cand.candidateName}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium shrink-0">
                            {cand.lastMessageAt ? new Date(cand.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Today'}
                          </span>
                        </div>

                        <p className="text-[11px] font-bold text-blue-600 truncate mb-1">
                          {cand.jobTitle}
                        </p>

                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                            cand.atsScore >= 80 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : cand.atsScore >= 50
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {cand.atsScore || 90}% Match
                          </span>
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                            {cand.status || 'Applied'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 truncate">
                          {cand.lastMessage}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

          </div>

          {/* ================= RIGHT MAIN ATS CHAT DESK (8 cols) ================= */}
          <div className="lg:col-span-8 flex flex-col bg-white h-full min-h-0">
            {activeChannel ? (
              <>
                {/* 1. RECRUITER CANDIDATE DOSSIER TOPBAR (Un-squished & Perfectly Aligned) */}
                <div className="p-2 border-b border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs shrink-0">
                  
                  {/* Left: Candidate Identity */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                      {getInitials(activeChannel.candidateName)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-black text-slate-950 truncate">
                          {activeChannel.candidateName}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                          {activeChannel.atsScore}% ATS Match
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 font-medium flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="font-bold text-blue-600">{activeChannel.jobTitle}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500">{activeChannel.experience} exp</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Recruiter Live ATS Actions */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                    {/* Fast Status Dropdown */}
                    <select
                      value={activeChannel.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
                    >
                      <option value="Applied">Stage: Applied</option>
                      <option value="Under Review">Stage: Under Review</option>
                      <option value="Shortlisted">Stage: Shortlisted</option>
                      <option value="Interview Scheduled">Stage: Interview Scheduled</option>
                      <option value="Offered">Stage: Offer Extended</option>
                      <option value="Rejected">Stage: Rejected</option>
                    </select>

                    {/* Schedule Interview */}
                    <button
                      onClick={() => setIsInterviewModalOpen(true)}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      title="Schedule Interview Meeting"
                    >
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      <span>Interview</span>
                    </button>

                    {/* View Profile / CV Full Dedicated Page */}
                    <Link
                      to={`/employer/applicants/${activeChannel.applicantId || activeChannel.id || activeChannel._id}?from=messages`}
                      className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      title="View Full Candidate Application & Resume Document"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Profile</span>
                    </Link>
                  </div>

                </div>

                {/* 2. LIVE CHAT MESSAGES STREAM (Ample Vertical Space) */}
                <div ref={messageContainerRef} className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50 min-h-0">

                  {activeMessages.map((msg, idx) => {
                    const isSystem = msg.senderRole === 'system';
                    const isRecruiter = msg.senderRole === 'employer' || msg.senderId === user?._id || msg.senderId === 'employer-admin';
                    
                    if (isSystem) {
                      return (
                        <div key={msg._id || idx} className="flex justify-center my-2">
                          <div className="bg-slate-200/90 text-slate-700 text-[11px] font-semibold px-4 py-1.5 rounded-full shadow-2xs max-w-md text-center">
                            {msg.text}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg._id || idx}
                        className={`flex flex-col ${isRecruiter ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                          {/* Candidate Avatar (Left) */}
                          {!isRecruiter && (
                            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                              {getInitials(activeChannel.candidateName)}
                            </div>
                          )}

                          {/* Message Bubble */}
                          <div
                            className={`p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-2xs ${
                              isRecruiter
                                ? 'bg-blue-600 text-white rounded-br-xs shadow-blue-500/10'
                                : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 mb-1.5">
                              <span className={`text-[10px] font-bold ${isRecruiter ? 'text-blue-200' : 'text-slate-600'}`}>
                                {isRecruiter ? `You (${employerProfile.recruiterName || 'Recruiter'} - ${employerProfile.companyName || 'SJ tech'})` : `${activeChannel.candidateName} (Candidate)`}
                              </span>
                              <span className={`text-[9px] ${isRecruiter ? 'text-blue-200' : 'text-slate-400'}`}>
                                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          </div>

                          {/* Recruiter Avatar (Right) */}
                          {isRecruiter && (
                            <div className="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                              {(employerProfile.recruiterName || 'E').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 3. RECRUITER 1-CLICK QUICK ACTION TEMPLATES */}
                <div className="px-4 py-2 bg-slate-100/80 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] shrink-0">
                  <span className="font-bold text-slate-500 flex items-center gap-1 shrink-0 mr-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Quick Replies:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => insertTemplate('interview')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 font-bold whitespace-nowrap transition cursor-pointer shadow-2xs"
                  >
                    📅 Invite for Interview
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTemplate('portfolio')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 font-bold whitespace-nowrap transition cursor-pointer shadow-2xs"
                  >
                    📄 Request Portfolio / Code
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTemplate('shortlisted')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 font-bold whitespace-nowrap transition cursor-pointer shadow-2xs"
                  >
                    ✅ Shortlisted Notice
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTemplate('offer')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 font-bold whitespace-nowrap transition cursor-pointer shadow-2xs"
                  >
                    🎉 Extend Job Offer
                  </button>
                </div>

                {/* 4. RECRUITER MESSAGE COMPOSER */}
                <form onSubmit={handleSend} className="p-3.5 border-t border-slate-200 bg-white flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    placeholder={`Message ${activeChannel.candidateName} directly regarding ${activeChannel.jobTitle}...`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-600 text-slate-900 font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition active:scale-95 shadow-xs shadow-blue-600/20 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 text-xs space-y-3">
                <div className="w-14 h-14 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Select a Candidate Channel</p>
                  <p className="max-w-xs mt-1 text-slate-500 leading-relaxed">
                    Choose an active applicant from the left roster to view their recruitment chat thread and schedule interviews.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ================= MODAL 1: CANDIDATE PROFILE & DOSSIER (MATCHES APPLICANTS TAB) ================= */}
      {isDossierModalOpen && activeChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            
            {/* Header */}
            <div className="bg-slate-950 text-white p-6 relative shrink-0">
              <button
                onClick={() => setIsDossierModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg">
                  {getInitials(activeChannel.candidateName)}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white">{activeChannel.candidateName}</h2>
                  <span className="text-xs text-slate-300">
                    Applying for: <strong className="text-white">{activeChannel.jobTitle}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs sm:text-sm">
              
              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-medium text-slate-800 truncate">{activeChannel.candidateEmail || activeChannel.email || 'Email not provided'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-medium text-slate-800">{activeChannel.candidatePhone || activeChannel.phone || '+91 98765 43210'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-medium text-slate-800 truncate">{activeChannel.candidateLocation || activeChannel.location || 'India'}</span>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Experience</span>
                  <span className="text-xs font-bold text-slate-900">{activeChannel.experience || '1-3 Years'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Expected CTC</span>
                  <span className="text-xs font-bold text-blue-700">{activeChannel.expectedCtc || 'Negotiable'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Notice Period</span>
                  <span className="text-xs font-bold text-slate-900">{activeChannel.noticePeriod || 'Immediate'}</span>
                </div>
              </div>

              {/* Skills */}
              {activeChannel.skills && activeChannel.skills.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Verified Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeChannel.skills.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold">
                        {s}
                      </span>
                    ))}
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
                    activeChannel.resumeSource === 'built_in'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {activeChannel.resumeSource === 'built_in' ? 'Website Built ATS Resume' : 'Outer File Upload'}
                  </span>
                </div>

                {activeChannel.resumeSource === 'built_in' ? (
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                          ATS
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block truncate max-w-[220px] sm:max-w-xs">
                            {activeChannel.resumeName || `${(activeChannel.candidateName || 'Candidate').replace(/\s+/g, '_')}_ATS_Resume.pdf`}
                          </span>
                          <span className="text-xs text-blue-700 font-semibold">
                            Built on Balaji Portal • Verified ATS Score: {activeChannel.atsScore || 95}%
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setViewingAtsResumeCandidate(activeChannel)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
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
                        {(activeChannel.resumeName || '').toLowerCase().endsWith('.pdf') ? 'PDF' : 'DOC'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block truncate max-w-[220px] sm:max-w-xs">
                          {activeChannel.resumeName || 'Applicant_Outer_Resume.pdf'}
                        </span>
                        <span className="text-xs text-slate-500">
                          Uploaded by applicant • {activeChannel.resumeSize || 'Custom File'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const rawUrl = activeChannel.resumeDataUrl || activeChannel.resumeUrl;
                        const downloadUrl = getBackendFileUrl(rawUrl);
                        if (downloadUrl) {
                          const a = document.createElement('a');
                          a.href = downloadUrl;
                          a.target = '_blank';
                          a.download = activeChannel.resumeName || 'Resume.pdf';
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                        } else {
                          toast.success(`Downloaded candidate file: ${activeChannel.resumeName || 'Resume.pdf'}`);
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
                    value={activeChannel.status || 'Applied'}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className={`text-xs font-bold px-3 py-2 rounded-xl border focus:outline-none transition shadow-2xs cursor-pointer ${
                      activeChannel.status === 'Offered' || activeChannel.status === 'Hired'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : activeChannel.status === 'Interview Scheduled' || activeChannel.status === 'Interview'
                        ? 'bg-purple-50 text-purple-800 border-purple-300'
                        : activeChannel.status === 'Shortlisted'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : activeChannel.status === 'Rejected'
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
                          className="p-1 cursor-pointer"
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
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs cursor-pointer"
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
                  const targetId = activeChannel.applicantId || activeChannel.id || activeChannel._id;
                  if (deleteApplicant && targetId) {
                    deleteApplicant(targetId);
                  }
                  setIsDossierModalOpen(false);
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove Applicant</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDossierModalOpen(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Return to Chat</span>
                </button>
                <button
                  onClick={() => {
                    setIsDossierModalOpen(false);
                    setIsInterviewModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>Schedule Interview</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL 1B: ATS RESUME VIEWER MODAL FOR EMPLOYERS ================= */}
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
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                  title="Print / Save PDF"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Print CV</span>
                </button>
                <button
                  onClick={() => setViewingAtsResumeCandidate(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
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
                  className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition cursor-pointer"
                >
                  Close ATS Viewer
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL 2: SCHEDULE INTERVIEW ================= */}
      {isInterviewModalOpen && activeChannel && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Schedule Interview</h3>
                  <p className="text-xs text-slate-500 font-medium">With {activeChannel.candidateName} for {activeChannel.jobTitle}</p>
                </div>
              </div>
              <button
                onClick={() => setIsInterviewModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmScheduleInterview} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Interview Date</label>
                  <input
                    type="date"
                    required
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Interview Time (IST)</label>
                  <input
                    type="time"
                    required
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Interview Mode</label>
                <select
                  value={interviewMode}
                  onChange={(e) => setInterviewMode(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium cursor-pointer"
                >
                  <option value="Google Meet / Video Call">Google Meet / Video Call</option>
                  <option value="Technical Coding Round (Live IDE)">Technical Coding Round (Live IDE)</option>
                  <option value="In-Person Office Interview">In-Person Office Interview</option>
                  <option value="Telephonic Screening">Telephonic Screening</option>
                </select>
              </div>

              <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 text-xs text-slate-700">
                <p className="font-bold text-blue-900 mb-0.5">Automated Calendar & Chat Notification</p>
                <p className="text-[11px] text-slate-600">
                  Submitting this will automatically advance candidate pipeline stage to <strong>"Interview Scheduled"</strong> and send meeting coordinates into the candidate's chat thread.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInterviewModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Confirm & Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </EmployerLayout>
  );
};

export default EmployerMessages;
