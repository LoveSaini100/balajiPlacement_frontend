import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Lock,
  Video,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useJobContext } from '../context/JobContext';

const MessagingHub = () => {
  const { 
    user, 
    conversations = [], 
    candidateConversations = [], 
    candidateAppliedJobs = [], 
    messages, 
    sendMessage, 
    fetchMessagesForConversation 
  } = useJobContext();
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const paramJobId = searchParams.get('jobId');
  const paramConvId = searchParams.get('convId');

  // Available conversations for the user
  const availableConversations = (candidateConversations && candidateConversations.length > 0)
    ? candidateConversations
    : conversations;

  const [selectedConvId, setSelectedConvId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messageContainerRef = useRef(null);

  // Auto select based on query params or first conversation
  useEffect(() => {
    if (availableConversations && availableConversations.length > 0) {
      if (paramJobId) {
        const matchByJob = availableConversations.find(c => {
          const cJobId = String(c.jobId?._id || c.jobId?.id || c.jobId || '');
          return cJobId === String(paramJobId);
        });
        if (matchByJob) {
          setSelectedConvId(matchByJob._id || matchByJob.id);
          return;
        }
      }
      if (paramConvId) {
        const matchByConv = availableConversations.find(c => String(c._id || c.id) === String(paramConvId));
        if (matchByConv) {
          setSelectedConvId(matchByConv._id || matchByConv.id);
          return;
        }
      }
      if (!selectedConvId || !availableConversations.some(c => (c._id || c.id) === selectedConvId)) {
        setSelectedConvId(availableConversations[0]._id || availableConversations[0].id);
      }
    } else {
      setSelectedConvId(null);
    }
  }, [availableConversations, paramJobId, paramConvId]);

  useEffect(() => {
    if (selectedConvId && fetchMessagesForConversation) {
      fetchMessagesForConversation(selectedConvId);
    }
  }, [selectedConvId]);

  const activeConv = availableConversations?.find((c) => (c._id || c.id) === selectedConvId);
  const activeMessages = (messages && selectedConvId && messages[selectedConvId]) || [];

  const scrollToBottom = (smooth = false) => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  // Scroll inner box on switching conversation or new messages
  useEffect(() => {
    if (selectedConvId) {
      const timer = setTimeout(() => {
        scrollToBottom(false);
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [selectedConvId, activeMessages.length]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !selectedConvId) return;

    const textToSend = inputText.trim();
    setInputText('');

    try {
      if (sendMessage) {
        await sendMessage(selectedConvId, textToSend, 'candidate', user?.name || 'Candidate');
        setTimeout(() => scrollToBottom(true), 60);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to deliver message');
    }
  };

  const insertQuickReply = (text) => {
    setInputText(text);
  };

  const filteredConversations = (availableConversations || []).filter((c) => {
    const term = searchQuery.toLowerCase();
    const candidateName = (c.candidateName || c.candidateId?.name || '').toLowerCase();
    const employerName = (c.employerName || c.companyName || c.jobTitle || '').toLowerCase();
    return candidateName.includes(term) || employerName.includes(term);
  });

  return (
    <div className="bg-slate-50 h-[calc(100vh)] py-4 flex flex-col overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col flex-1 min-h-0">
        
        {/* Header Breadcrumb & Title */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-3">
            <Link
              to="/candidate-dashboard"
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 transition shadow-2xs"
              title="Return to Applied Jobs & Candidate Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-950">
                  Applied Job Recruiter Messages
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hidden md:block">
                  Candidate Communication Desk
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct channels between you and verified employers for the jobs you've applied to.
              </p>
            </div>
          </div>
        </div>

        {/* Messaging Two-Column Box */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 h-full">
          
          {/* LEFT LIST: Conversations */}
          <div className="lg:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50 h-full min-h-0 overflow-hidden">
            
            {/* Search Input */}
            <div className="p-3.5 border-b border-slate-200 bg-white shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search applied company or job role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-900 font-medium"
                />
              </div>
            </div>

            {/* Conversation Threads */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-h-0">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">No Applied Employer Chats</p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                      You will get dedicated direct messaging threads with recruiters immediately when you apply for jobs.
                    </p>
                  </div>
                  <Link
                    to="/jobs"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    <span>Browse Jobs & Apply</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const convId = conv._id || conv.id;
                  const isSelected = selectedConvId === convId;
                  const counterpartName = conv.companyName || conv.employerName || 'Hiring Employer';
                  
                  return (
                    <button
                      key={convId}
                      onClick={() => setSelectedConvId(convId)}
                      className={`w-full p-4 text-left transition flex items-start gap-3 hover:bg-white cursor-pointer ${
                        isSelected ? 'bg-white border-l-4 border-l-blue-600 shadow-xs' : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-blue-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs border border-slate-800">
                        {counterpartName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="text-xs font-black text-slate-950 truncate">
                            {counterpartName}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Today'}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-blue-600 truncate mb-1">
                          {conv.jobTitle || 'Applied Position'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {conv.lastMessage || 'Direct ATS recruitment channel'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

          </div>

          {/* RIGHT VIEW: Active Chat Screen */}
          <div className="lg:col-span-8 flex flex-col bg-white h-full min-h-0 overflow-hidden">
            {activeConv ? (
              <>
                {/* Active Chat Header */}
                <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-white flex items-center justify-between shadow-2xs shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                      {(activeConv.companyName || 'E').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-black text-slate-950 truncate">
                          {activeConv.companyName || 'Hiring Employer'}
                        </h3>
                        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                          Official Recruiter Channel
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5 truncate">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">Position: <strong className="text-slate-800">{activeConv.jobTitle}</strong></span>
                      </p>
                    </div>
                  </div>

                  {/* View Job Link */}
                  {activeConv.jobId && (
                    <Link
                      to="/jobs"
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50/70 hover:bg-blue-100/70 px-3 py-1.5 rounded-xl border border-blue-200 transition shrink-0"
                    >
                      View Job Opening
                    </Link>
                  )}
                </div>

                {/* Message Stream (Scrollable Y axis) */}
                <div ref={messageContainerRef} className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/40 min-h-0">

                  {activeMessages.map((msg, idx) => {
                    const isCandidateMe = msg.senderRole === 'candidate' || msg.senderId === user?._id;
                    const isSystem = msg.senderRole === 'system';

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
                        className={`flex flex-col ${isCandidateMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                          {!isCandidateMe && (
                            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                              {(activeConv.companyName || 'R').charAt(0).toUpperCase()}
                            </div>
                          )}
                          
                          <div
                            className={`p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                              isCandidateMe
                                ? 'bg-blue-600 text-white rounded-br-xs shadow-xs shadow-blue-500/10'
                                : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs shadow-2xs'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <span className={`text-[10px] font-bold ${isCandidateMe ? 'text-blue-200' : 'text-slate-600'}`}>
                                {isCandidateMe ? 'You (Candidate)' : `${msg.senderName || activeConv.employerName || activeConv.companyName || 'Recruiter'}`}
                              </span>
                              <span className={`text-[9px] ${isCandidateMe ? 'text-blue-200' : 'text-slate-400'}`}>
                                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                            
                            {/* If message is an interview invite with a meeting link, render a CTA button */}
                            {msg.text.includes('INTERVIEW INVITATION') && (
                              <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap">
                                <span className="text-[11px] font-bold text-purple-700 flex items-center gap-1">
                                  <Video className="w-3.5 h-3.5" />
                                  <span>Interview Scheduled</span>
                                </span>
                                <a
                                  href={msg.text.match(/(https?:\/\/[^\s]+)/)?.[0] || 'https://meet.google.com/sj-tech-interview'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                                >
                                  <span>Join Online Round</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>

                          {isCandidateMe && (
                            <div className="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                              {(user?.name || 'C').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Candidate Quick Action Prompts */}
                <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] shrink-0">
                  <span className="font-bold text-slate-500 flex items-center gap-1 shrink-0 mr-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Quick Replies:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => insertQuickReply(`Thank you for reviewing my profile for the ${activeConv.jobTitle} position. I am very interested and looking forward to the next steps.`)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 font-bold whitespace-nowrap transition cursor-pointer shadow-2xs"
                  >
                    🙏 Thank you for the update
                  </button>
                  <button
                    type="button"
                    onClick={() => insertQuickReply(`I am available for an interview call. Please let me know the preferred date and time.`)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 font-bold whitespace-nowrap transition cursor-pointer shadow-2xs"
                  >
                    📅 Available for Interview
                  </button>
                  <button
                    type="button"
                    onClick={() => insertQuickReply(`Please find my updated details and portfolio for your team's review.`)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 font-bold whitespace-nowrap transition cursor-pointer shadow-2xs"
                  >
                    💼 Shared portfolio details
                  </button>
                </div>

                {/* Message Input Box (Pinned / Fixed at Bottom) */}
                <form onSubmit={handleSend} className="p-3 sm:p-3.5 border-t border-slate-200 bg-white flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    placeholder={`Message ${activeConv.companyName || 'the hiring team'} regarding ${activeConv.jobTitle || 'the position'}...`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 px-4 py-2.5 sm:py-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-600 text-slate-900 font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2.5 sm:p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition active:scale-95 shadow-xs shadow-blue-600/20 cursor-pointer shrink-0"
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
                  <p className="font-bold text-slate-900 text-sm">Select an Applied Job Conversation</p>
                  <p className="max-w-xs mt-1 text-slate-500">
                    Choose an applied company from the left panel to communicate directly with their recruiter.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default MessagingHub;
