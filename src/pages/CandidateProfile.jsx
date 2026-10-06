import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Briefcase, 
  Bookmark, 
  FileText, 
  Bell, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle,
  User,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Edit3,
  Plus,
  Trash2,
  UploadCloud,
  Download,
  Eye,
  Sliders,
  Check,
  X,
  Layers,
  ArrowRight,
  AlertCircle,
  MessageSquare,
  Video,
  Calendar,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useJobContext } from '../context/JobContext';
import { getBackendFileUrl } from '../services/api';
import JobCard from '../components/common/JobCard';

const CandidateProfile = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  const { 
    candidateAppliedJobs = [], 
    savedJobIds = [], 
    jobs = [], 
    user, 
    updateCandidateProfile, 
    uploadCandidateResume,
    deleteCandidateResume,
    calculateProfileCompleteness, 
    calculateAtsScore 
  } = useJobContext();

  const savedJobsList = jobs.filter(j => savedJobIds.includes(j.id));

  // Edit Modals & Forms State
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  
  // Form states
  const [basicForm, setBasicForm] = useState({
    name: user?.name || '',
    title: user?.title || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    experience: user?.experience || '',
    dob: user?.dob || '',
    gender: user?.gender || ''
  });

  const [aboutForm, setAboutForm] = useState(user?.about || '');

  const [preferencesForm, setPreferencesForm] = useState({
    currentCtc: user?.currentCtc || '',
    expectedCtc: user?.expectedCtc || '',
    noticePeriod: user?.noticePeriod || '',
    preferredLocation: user?.preferredLocation || '',
    preferredRole: user?.preferredRole || '',
    jobType: user?.jobType || 'Full-Time'
  });

  const [newSkill, setNewSkill] = useState('');

  // Sync form states when user changes in context
  useEffect(() => {
    if (user) {
      setBasicForm({
        name: user.name || '',
        title: user.title || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        experience: user.experience || '',
        dob: user.dob || '',
        gender: user.gender || ''
      });
      setAboutForm(user.about || '');
      setPreferencesForm({
        currentCtc: user.currentCtc || '',
        expectedCtc: user.expectedCtc || '',
        noticePeriod: user.noticePeriod || '',
        preferredLocation: user.preferredLocation || '',
        preferredRole: user.preferredRole || '',
        jobType: user.jobType || 'Full-Time'
      });
    }
  }, [user]);

  const [expForm, setExpForm] = useState({
    title: '',
    company: '',
    period: '',
    location: '',
    type: 'Full-Time',
    description: ''
  });

  const [eduForm, setEduForm] = useState({
    degree: '',
    institution: '',
    year: '',
    grade: '',
    location: ''
  });

  const [alerts, setAlerts] = useState({
    techJobs: true,
    bengaluruJobs: true,
    remoteJobs: true,
    salaryHikes: false,
    whatsappUpdates: true,
    recruiterViews: true
  });

  const [appliedStatusFilter, setAppliedStatusFilter] = useState('all');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleToggleAlert = (key) => {
    setAlerts(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      toast.success("Job alert preferences updated!");
      return updated;
    });
  };

  const handleSaveBasic = async (e) => {
    e.preventDefault();
    if (updateCandidateProfile) {
      await updateCandidateProfile(basicForm);
    }
    setIsEditingBasic(false);
    toast.success("Profile details saved to database!");
  };

  const handleSaveAbout = async (e) => {
    e.preventDefault();
    if (updateCandidateProfile) {
      await updateCandidateProfile({ about: aboutForm });
    }
    setIsEditingAbout(false);
    toast.success("Professional bio updated!");
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    if (updateCandidateProfile) {
      await updateCandidateProfile({ 
        preferences: preferencesForm,
        ...preferencesForm 
      });
    }
    setIsEditingPreferences(false);
    toast.success("Career preferences saved!");
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    const currentSkills = user?.skills || [];
    if (currentSkills.map(s => s.toLowerCase()).includes(newSkill.trim().toLowerCase())) {
      toast.error("Skill already exists in your profile!");
      return;
    }
    const updatedSkills = [...currentSkills, newSkill.trim()];
    if (updateCandidateProfile) {
      await updateCandidateProfile({ skills: updatedSkills });
    }
    setNewSkill('');
    toast.success(`Added "${newSkill.trim()}"`);
  };

  const handleRemoveSkill = async (skillToRemove) => {
    const updatedSkills = (user?.skills || []).filter(s => s !== skillToRemove);
    if (updateCandidateProfile) {
      await updateCandidateProfile({ skills: updatedSkills });
    }
    toast.success(`Removed "${skillToRemove}"`);
  };

  const handleAddExperience = async (e) => {
    e.preventDefault();
    if (!expForm.title || !expForm.company) {
      toast.error("Please enter role title and company name.");
      return;
    }
    const newEntry = {
      id: Date.now(),
      ...expForm
    };
    const updated = [newEntry, ...(user?.experienceList || [])];
    if (updateCandidateProfile) {
      await updateCandidateProfile({ experienceList: updated });
    }
    setIsAddingExperience(false);
    setExpForm({ title: '', company: '', period: '', location: '', type: 'Full-Time', description: '' });
    toast.success("Work experience added!");
  };

  const handleDeleteExperience = async (id) => {
    const updated = (user?.experienceList || []).filter(item => item.id !== id);
    if (updateCandidateProfile) {
      await updateCandidateProfile({ experienceList: updated });
    }
    toast.success("Experience record removed.");
  };

  const handleAddEducation = async (e) => {
    e.preventDefault();
    if (!eduForm.degree || !eduForm.institution) {
      toast.error("Please enter degree and institution.");
      return;
    }
    const newEntry = {
      id: Date.now(),
      ...eduForm
    };
    const updated = [newEntry, ...(user?.education || [])];
    if (updateCandidateProfile) {
      await updateCandidateProfile({ education: updated });
    }
    setIsAddingEducation(false);
    setEduForm({ degree: '', institution: '', year: '', grade: '', location: '' });
    toast.success("Education record added!");
  };

  const handleDeleteEducation = async (id) => {
    const updated = (user?.education || []).filter(item => item.id !== id);
    if (updateCandidateProfile) {
      await updateCandidateProfile({ education: updated });
    }
    toast.success("Education record deleted.");
  };

  // Upload handler with validation and server sync
  const handleResumeUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (uploadCandidateResume) {
        const res = await uploadCandidateResume(file);
        if (res) {
          navigate('/resume');
        }
      }
      e.target.value = '';
    }
  };

  const handleDownloadResume = () => {
    const rawUrl = user?.resumeBlobUrl || user?.resumeDataUrl || user?.resumeUrl;
    const downloadUrl = getBackendFileUrl(rawUrl);
    if (downloadUrl) {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.target = '_blank';
      a.download = user?.resumeName || 'Resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`Downloading ${user?.resumeName || 'Resume.pdf'}`);
    } else {
      toast.error("No uploaded resume found. Please upload or create a resume first.");
    }
  };

  // Dynamic calculations based strictly on current user DB record
  const currentCompleteness = calculateProfileCompleteness ? calculateProfileCompleteness(user) : (user?.profileCompleted || 0);
  const atsScore = calculateAtsScore ? calculateAtsScore(user) : (user?.atsScore || 0);
  const hasResume = !!(user?.resumeName || user?.resumeUrl);
  const isPdfFile = user?.resumeName ? user.resumeName.toLowerCase().endsWith('.pdf') : false;
  const isImageFile = user?.resumeType ? user.resumeType.startsWith('image/') : false;

  const filteredAppliedJobs = candidateAppliedJobs.filter(app => {
    if (appliedStatusFilter === 'all') return true;
    if (appliedStatusFilter === 'review') return (app.status || '').toLowerCase().includes('review') || (app.status || '').toLowerCase().includes('applied');
    if (appliedStatusFilter === 'shortlisted') return (app.status || '').toLowerCase().includes('shortlist');
    if (appliedStatusFilter === 'interview') return (app.status || '').toLowerCase().includes('interview');
    if (appliedStatusFilter === 'offered') return (app.status || '').toLowerCase().includes('offer');
    return true;
  });

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-6 sm:py-8">
      <Helmet>
        <title>{user?.name || 'Candidate Profile'} | JobPortal India</title>
        <meta name="description" content="View and manage your candidate profile, applied jobs, resume, and career preferences on JobPortal." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-8 space-y-6">
        
        {/* ── 1. CANDIDATE PROFILE HERO HEADER CARD ── */}
        <div className="bg-white rounded-3xl border border-slate-200 p-3 sm:p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/60 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* User Profile Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-900 text-white flex items-center justify-center font-black text-3xl tracking-wider shadow-xl shadow-slate-900/10 shrink-0 border-2 border-slate-800">
                {(user?.name || 'Candidate').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-950">
                    {user?.name || 'Candidate'}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Verified Jobseeker
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Open to Work
                  </span>
                </div>

                <p className="text-sm font-bold text-slate-700">
                  {user?.title ? (
                    <>
                      {user.title} {user?.experience ? <><span className="text-slate-400 font-normal">•</span> {user.experience} Experience</> : null}
                    </>
                  ) : (
                    <span className="text-slate-400 italic">No job title added yet</span>
                  )}
                </p>

                <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-500 flex-wrap font-medium">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    {user?.location || 'Location not specified'}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    {user?.email || 'No email provided'}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    {user?.phone || 'No phone provided'}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Strength Meter & Quick Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className={`w-12 h-12 rounded-full border-4 ${currentCompleteness >= 70 ? 'border-emerald-500 text-emerald-700' : 'border-blue-600 text-blue-700'} flex items-center justify-center font-black text-xs shrink-0 bg-white shadow-xs`}>
                  {currentCompleteness}%
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-950 block">
                    Profile Completeness: {currentCompleteness >= 70 ? 'Strong' : currentCompleteness >= 40 ? 'Moderate' : 'Basic'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {currentCompleteness < 70 ? 'Add skills, bio & resume to reach 100%' : 'Excellent profile score for recruiter visibility'}
                  </span>
                </div>
              </div>

              {/* Action Buttons Header */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <button
                  onClick={() => setIsEditingBasic(true)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>

                <Link
                  to="/resume"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>Resume Viewer</span>
                </Link>

                <label className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer border border-slate-200 transition">
                  <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                  <span>Upload CV</span>
                  <input type="file" accept=".pdf,.doc,.docx,image/*" onChange={handleResumeUpload} className="hidden" />
                </label>
              </div>
            </div>

          </div>

          {/* Quick Metrics Bar (Real Data Scoped to Logged In User) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2 pt-4 border-t border-slate-100">
            <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 text-center sm:text-left">
              <span className="text-xs font-semibold text-slate-500 block">Applied Jobs</span>
              <span className="text-xl font-black text-slate-950 mt-0.5 block">{candidateAppliedJobs.length}</span>
            </div>
            <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 text-center sm:text-left">
              <span className="text-xs font-semibold text-slate-500 block">Shortlisted / Active</span>
              <span className="text-xl font-black text-blue-600 mt-0.5 block">
                {candidateAppliedJobs.filter(a => a.stage >= 2 || a.status === 'Shortlisted').length}
              </span>
            </div>
            <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 text-center sm:text-left">
              <span className="text-xs font-semibold text-slate-500 block">Saved Bookmarks</span>
              <span className="text-xl font-black text-slate-950 mt-0.5 block">{savedJobIds.length}</span>
            </div>
            <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 text-center sm:text-left">
              <span className="text-xs font-semibold text-slate-500 block">ATS Resume Score</span>
              <span className={`text-xl font-black mt-0.5 block ${atsScore > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {atsScore > 0 ? `${atsScore} / 100` : '— / 100'}
              </span>
            </div>
          </div>
        </div>

        {/* ── 2. NAVIGATION TABS ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 text-sm font-bold no-scrollbar">
          <button
            onClick={() => handleTabChange('profile')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-950 hover:bg-slate-100/50 rounded-t-xl'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Information</span>
          </button>

          <button
            onClick={() => handleTabChange('applied')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'applied'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-950 hover:bg-slate-100/50 rounded-t-xl'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Applied Jobs</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-black">
              {candidateAppliedJobs.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('saved')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'saved'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-950 hover:bg-slate-100/50 rounded-t-xl'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved Jobs</span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-full font-bold">
              {savedJobIds.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('preferences')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'preferences'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-950 hover:bg-slate-100/50 rounded-t-xl'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Career Preferences & Alerts</span>
          </button>
        </div>

        {/* ── TAB CONTENT: PROFILE INFORMATION ── */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column (8 cols): Summary, Skills, Experience, Education */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Professional Bio / Summary */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg font-black text-slate-950">About & Professional Summary</h2>
                  </div>
                  <button
                    onClick={() => {
                      setAboutForm(user?.about || '');
                      setIsEditingAbout(!isEditingAbout);
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingAbout ? 'Cancel' : (user?.about ? 'Edit' : 'Add Bio')}</span>
                  </button>
                </div>

                {isEditingAbout ? (
                  <form onSubmit={handleSaveAbout} className="space-y-3">
                    <textarea
                      rows={4}
                      value={aboutForm}
                      onChange={(e) => setAboutForm(e.target.value)}
                      placeholder="Write a concise overview of your background, technical skills, and career achievements..."
                      className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingAbout(false)}
                        className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                      >
                        Save Summary
                      </button>
                    </div>
                  </form>
                ) : user?.about ? (
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    {user.about}
                  </p>
                ) : (
                  <div className="py-4 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-xs text-slate-400">No professional summary added yet.</p>
                    <button 
                      onClick={() => setIsEditingAbout(true)}
                      className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                    >
                      + Add a bio to boost profile completeness
                    </button>
                  </div>
                )}
              </div>

              {/* Skills & Technologies */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Layers className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg font-black text-slate-950">Key Skills & Core Competencies</h2>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    {(user?.skills || []).length} Skills Added
                  </span>
                </div>

                {/* Add skill input */}
                <form onSubmit={handleAddSkill} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a new skill (e.g. React, Node.js, SQL, Python)..."
                    className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Skill</span>
                  </button>
                </form>

                {(user?.skills || []).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-700 text-xs font-bold border border-slate-200 transition group"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-slate-400 hover:text-red-600 p-0.5 transition"
                          title={`Remove ${skill}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-xs text-slate-400">No skills added yet.</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Add 3 or more skills above to improve job matching.</p>
                  </div>
                )}
              </div>

              {/* Work Experience */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg font-black text-slate-950">Work Experience</h2>
                  </div>
                  <button
                    onClick={() => setIsAddingExperience(!isAddingExperience)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingExperience ? 'Cancel' : 'Add Experience'}</span>
                  </button>
                </div>

                {isAddingExperience && (
                  <form onSubmit={handleAddExperience} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Add New Employment Record</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Job Title *</label>
                        <input
                          type="text"
                          required
                          value={expForm.title}
                          onChange={(e) => setExpForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g. Senior Frontend Engineer"
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Company Name *</label>
                        <input
                          type="text"
                          required
                          value={expForm.company}
                          onChange={(e) => setExpForm(prev => ({ ...prev, company: e.target.value }))}
                          placeholder="e.g. Infosys / Tech Solutions"
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Duration / Period</label>
                        <input
                          type="text"
                          value={expForm.period}
                          onChange={(e) => setExpForm(prev => ({ ...prev, period: e.target.value }))}
                          placeholder="e.g. 2024 - Present"
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Location</label>
                        <input
                          type="text"
                          value={expForm.location}
                          onChange={(e) => setExpForm(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="e.g. Bengaluru / Remote"
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Key Responsibilities & Achievements</label>
                      <textarea
                        rows={3}
                        value={expForm.description}
                        onChange={(e) => setExpForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your role, projects, and key accomplishments..."
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingExperience(false)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                      >
                        Save Experience
                      </button>
                    </div>
                  </form>
                )}

                {(user?.experienceList || []).length > 0 ? (
                  <div className="space-y-4">
                    {user.experienceList.map((exp) => (
                      <div key={exp.id || exp.title} className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-blue-200 transition">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-sm sm:text-base font-bold text-slate-950">{exp.title}</h3>
                            <p className="text-xs font-bold text-blue-700 mt-0.5">{exp.company}</p>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium mt-1">
                              {exp.period && <span>{exp.period}</span>}
                              {exp.location && <><span>•</span><span>{exp.location}</span></>}
                              {exp.type && <><span>•</span><span className="px-2 py-0.2 rounded-md bg-slate-200 text-slate-700 font-semibold">{exp.type}</span></>}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteExperience(exp.id)}
                            className="text-slate-400 hover:text-red-600 p-1 transition"
                            title="Delete Experience"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {exp.description && (
                          <p className="text-xs text-slate-600 mt-3 leading-relaxed border-t border-slate-200/60 pt-2.5 font-normal">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-xs text-slate-400">No work experience records added yet.</p>
                    <button 
                      onClick={() => setIsAddingExperience(true)}
                      className="mt-2 text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add your past or current job experience</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Education */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg font-black text-slate-950">Education & Qualifications</h2>
                  </div>
                  <button
                    onClick={() => setIsAddingEducation(!isAddingEducation)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingEducation ? 'Cancel' : 'Add Education'}</span>
                  </button>
                </div>

                {isAddingEducation && (
                  <form onSubmit={handleAddEducation} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Add Academic Degree</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Degree / Course *</label>
                        <input
                          type="text"
                          required
                          value={eduForm.degree}
                          onChange={(e) => setEduForm(prev => ({ ...prev, degree: e.target.value }))}
                          placeholder="e.g. B.Tech in Computer Science / BCA / MCA"
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">College / University *</label>
                        <input
                          type="text"
                          required
                          value={eduForm.institution}
                          onChange={(e) => setEduForm(prev => ({ ...prev, institution: e.target.value }))}
                          placeholder="e.g. Delhi University / State Engineering College"
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Passing Year / Duration</label>
                        <input
                          type="text"
                          value={eduForm.year}
                          onChange={(e) => setEduForm(prev => ({ ...prev, year: e.target.value }))}
                          placeholder="e.g. 2020 - 2024"
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Grade / CGPA / %</label>
                        <input
                          type="text"
                          value={eduForm.grade}
                          onChange={(e) => setEduForm(prev => ({ ...prev, grade: e.target.value }))}
                          placeholder="e.g. 8.2 CGPA or 78%"
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingEducation(false)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                      >
                        Save Education
                      </button>
                    </div>
                  </form>
                )}

                {(user?.education || []).length > 0 ? (
                  <div className="space-y-4">
                    {user.education.map((edu) => (
                      <div key={edu.id || edu.degree} className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200 flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-950">{edu.degree}</h3>
                          <p className="text-xs font-semibold text-slate-700 mt-0.5">{edu.institution}</p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium mt-1">
                            {edu.year && <span>{edu.year}</span>}
                            {edu.grade && (
                              <>
                                <span>•</span>
                                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded">{edu.grade}</span>
                              </>
                            )}
                            {edu.location && (
                              <>
                                <span>•</span>
                                <span>{edu.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteEducation(edu.id)}
                          className="text-slate-400 hover:text-red-600 p-1 transition"
                          title="Delete Education"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-xs text-slate-400">No education records added yet.</p>
                    <button 
                      onClick={() => setIsAddingEducation(true)}
                      className="mt-2 text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add your college degree or qualification</span>
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column (4 cols): Resume Hub, Career Preferences, Contact Info */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* ── RESUME / CV CARD WITH FULL PREVIEW OPTION ── */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-950">Resume / CV Document</h3>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${hasResume ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                    {hasResume ? 'Active Resume' : 'No Resume'}
                  </span>
                </div>

                {hasResume ? (
                  <>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition group flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                          {isPdfFile ? 'PDF' : isImageFile ? 'IMG' : 'DOC'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-950 truncate">
                            {user.resumeName || 'Candidate_Resume.pdf'}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {user.resumeSize || 'Standard Document'} • {user.isCustomUploaded ? 'Custom Uploaded' : 'ATS Generated'}
                          </p>
                        </div>
                      </div>

                      <Link
                        to="/resume"
                        className="p-2 rounded-lg bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 shadow-2xs hover:border-blue-200 transition flex items-center justify-center"
                        title="View Resume on Dedicated Page"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <label className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition shadow-xs">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Replace</span>
                        <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
                      </label>

                      <button
                        type="button"
                        onClick={handleDownloadResume}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>

                      <button
                        type="button"
                        onClick={deleteCandidateResume}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold border border-red-200 transition cursor-pointer"
                        title="Delete uploaded resume"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-6 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">No Resume Attached</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Upload your existing CV or create one in 2 minutes.</p>
                    </div>
                    <div className="flex flex-col gap-2 pt-1">
                      <label className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition shadow-xs">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload PDF Resume</span>
                        <input type="file" accept=".pdf,.doc,.docx,image/*" onChange={handleResumeUpload} className="hidden" />
                      </label>
                      <Link
                        to="/resume-builder"
                        className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                      >
                        <span>Build ATS Resume</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-2 text-xs text-blue-900">
                  <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Your resume is automatically attached when you 1-click apply to jobs.</span>
                </div>
              </div>

              {/* Career Preferences Summary */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-950">Compensation & Preferences</h3>
                  <button
                    onClick={() => handleTabChange('preferences')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Current CTC</span>
                    <span className="font-bold text-slate-900">{user?.currentCtc || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Expected CTC</span>
                    <span className="font-bold text-blue-600">{user?.expectedCtc || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Notice Period</span>
                    <span className="font-bold text-emerald-600">{user?.noticePeriod || 'Immediate'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Job Type</span>
                    <span className="font-bold text-slate-900">{user?.jobType || 'Full-Time'}</span>
                  </div>
                  <div className="py-1.5">
                    <span className="text-slate-500 block mb-1">Preferred Locations</span>
                    <span className="font-semibold text-slate-800">{user?.preferredLocation || 'Open to all locations / Remote'}</span>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-950">Personal Details</h3>
                  <button
                    onClick={() => setIsEditingBasic(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Date of Birth</span>
                    <span className="font-bold text-slate-900">{user?.dob || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Gender</span>
                    <span className="font-bold text-slate-900">{user?.gender || 'Not specified'}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ── TAB CONTENT: APPLIED JOBS (SCOPED TO CANDIDATE ACCOUNT) ── */}
        {activeTab === 'applied' && (
          <div className="space-y-6">
            
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500 mr-2">Filter Status:</span>
                {[
                  { id: 'all', label: 'All', count: candidateAppliedJobs.length },
                  { id: 'review', label: 'Under Review', count: candidateAppliedJobs.filter(a => (a.stage || 1) <= 2).length },
                  { id: 'shortlisted', label: 'Shortlisted', count: candidateAppliedJobs.filter(a => a.stage === 3 || a.status === 'Shortlisted').length },
                  { id: 'interview', label: 'Interview Scheduled', count: candidateAppliedJobs.filter(a => a.stage === 4).length },
                  { id: 'offered', label: 'Offered', count: candidateAppliedJobs.filter(a => a.stage === 5).length }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setAppliedStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      appliedStatusFilter === tab.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              <Link
                to="/jobs"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
              >
                <span>Find More Jobs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Applications List */}
            {filteredAppliedJobs.length > 0 ? (
              <div className="space-y-4">
                {filteredAppliedJobs.map((app, idx) => {
                  const stage = app.stage || 1;
                  return (
                    <div 
                      key={idx}
                      className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-blue-200 transition space-y-6"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        
                        {/* Company & Role */}
                        <div className="flex items-start gap-4">
                          <div 
                            className="w-12 h-12 rounded-xl text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0"
                            style={{ backgroundColor: app.companyBg || '#090D16' }}
                          >
                            {app.companyLogo || app.company?.substring(0, 3).toUpperCase()}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="text-base sm:text-lg font-black text-slate-950">
                                {app.jobTitle}
                              </h3>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                <Clock className="w-3 h-3 text-blue-600" />
                                {app.status || 'Applied'}
                              </span>
                            </div>

                            <p className="text-xs font-bold text-slate-700">
                              {app.company} {app.location ? <><span className="text-slate-400 font-normal">•</span> {app.location}</> : null}
                            </p>

                            <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500 font-medium">
                              <span>Applied on: <strong className="text-slate-800">{app.appliedDate || 'Recent'}</strong></span>
                              {app.salary && (
                                <>
                                  <span>•</span>
                                  <span>Salary: <strong className="text-slate-800">{app.salary}</strong></span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/messages?jobId=${app.jobId}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 transition shadow-2xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Chat with Employer</span>
                          </Link>
                          <Link
                            to="/jobs"
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition"
                          >
                            Browse Jobs
                          </Link>
                        </div>
                      </div>

                      {/* Interview Scheduled Notification & Details Card */}
                      {(stage === 4 || app.status === 'Interview Scheduled' || app.status === 'Interview' || app.interviewDetails?.date) && (
                        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50/60 to-blue-50 border-2 border-purple-300 shadow-sm animate-in fade-in duration-300 space-y-3">
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                <Video className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-xs sm:text-sm font-extrabold text-purple-950 flex items-center gap-1.5">
                                  <span>Interview Scheduled by Recruiter</span>
                                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black uppercase">
                                    Confirmed
                                  </span>
                                </h4>
                                <p className="text-[11px] text-purple-700 font-medium">
                                  The hiring team at {app.company} has scheduled a round with you.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Interview Details Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                            <div className="bg-white/90 p-2.5 rounded-xl border border-purple-100">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">Date</span>
                              <span className="font-extrabold text-slate-900 block mt-0.5">
                                {app.interviewDetails?.date || 'Upcoming Soon'}
                              </span>
                            </div>

                            <div className="bg-white/90 p-2.5 rounded-xl border border-purple-100">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">Time</span>
                              <span className="font-extrabold text-slate-900 block mt-0.5">
                                {app.interviewDetails?.time ? `${app.interviewDetails.time} IST` : '14:00 IST'}
                              </span>
                            </div>

                            <div className="bg-white/90 p-2.5 rounded-xl border border-purple-100">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">Format</span>
                              <span className="font-extrabold text-purple-900 block mt-0.5 truncate">
                                {app.interviewDetails?.type || 'Google Meet (Video)'}
                              </span>
                            </div>

                            <div className="bg-white/90 p-2.5 rounded-xl border border-purple-100">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">Interviewer</span>
                              <span className="font-extrabold text-slate-900 block mt-0.5 truncate">
                                {app.interviewDetails?.interviewer || 'Tech Hiring Lead'}
                              </span>
                            </div>
                          </div>

                          {/* Meeting Link row */}
                          <div className="bg-white/90 p-2.5 rounded-xl border border-purple-100 flex items-center justify-between gap-3 flex-wrap">
                            <div className="min-w-0 flex-1">
                              <span className="text-slate-400 block font-bold uppercase text-[9px]">Meeting Link</span>
                              <a
                                href={app.interviewDetails?.meetLink || 'https://meet.google.com/sj-tech-interview'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 font-semibold truncate block underline hover:no-underline text-xs"
                              >
                                {app.interviewDetails?.meetLink || 'https://meet.google.com/sj-tech-interview'}
                              </a>
                            </div>
                            <a
                              href={app.interviewDetails?.meetLink || 'https://meet.google.com/sj-tech-interview'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-700 hover:text-purple-900 font-bold text-xs inline-flex items-center gap-1 shrink-0 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition"
                            >
                              <span>Open Link</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      )}

                      {/* 5-Step Visual Application Pipeline */}
                      <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                          Live Recruitment Stage
                        </p>
                        <div className="grid grid-cols-5 gap-2 text-center">
                          {[
                            { num: 1, label: 'Applied' },
                            { num: 2, label: 'Under Review' },
                            { num: 3, label: 'Shortlisted' },
                            { num: 4, label: 'Interview' },
                            { num: 5, label: 'Offered' }
                          ].map((step) => {
                            const isCompleted = stage >= step.num;
                            const isCurrent = stage === step.num;
                            return (
                              <div key={step.num} className="flex flex-col items-center">
                                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-xs transition ${
                                  isCompleted
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-slate-200 text-slate-500'
                                } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}>
                                  {isCompleted ? <Check className="w-4 h-4" /> : step.num}
                                </div>
                                <span className={`text-[10px] sm:text-[11px] mt-1.5 font-bold ${
                                  isCompleted ? 'text-slate-900' : 'text-slate-400'
                                }`}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-950">No applications submitted yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-6">
                  Explore verified job listings and submit fast-track 1-click applications directly to employers.
                </p>
                <Link
                  to="/jobs"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-xs hover:bg-blue-700 transition"
                >
                  <span>Explore Open Jobs</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

          </div>
        )}

        {/* ── TAB CONTENT: SAVED JOBS ── */}
        {activeTab === 'saved' && (
          <div>
            {savedJobsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedJobsList.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
                <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-950">No saved jobs yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-6">
                  Bookmark interesting job openings to easily review and apply to them later.
                </p>
                <Link
                  to="/jobs"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-xs hover:bg-blue-700 transition"
                >
                  <span>Browse Job Openings</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ── TAB CONTENT: PREFERENCES & ALERTS ── */}
        {activeTab === 'preferences' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Career Expectations Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-black text-slate-950">Career & Compensation Preferences</h2>
                </div>
              </div>

              <form onSubmit={handleSavePreferences} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Target Job Role</label>
                    <input
                      type="text"
                      value={preferencesForm.preferredRole}
                      onChange={(e) => setPreferencesForm(prev => ({ ...prev, preferredRole: e.target.value }))}
                      placeholder="e.g. Software Developer / Frontend Engineer"
                      className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Preferred Employment Type</label>
                    <select
                      value={preferencesForm.jobType}
                      onChange={(e) => setPreferencesForm(prev => ({ ...prev, jobType: e.target.value }))}
                      className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                    >
                      <option value="Full-Time">Full-Time Permanent</option>
                      <option value="Remote / Hybrid">Remote / Hybrid</option>
                      <option value="Contract / Freelance">Contract / Freelance</option>
                      <option value="Part-Time">Part-Time</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Current CTC (Annual)</label>
                    <input
                      type="text"
                      value={preferencesForm.currentCtc}
                      onChange={(e) => setPreferencesForm(prev => ({ ...prev, currentCtc: e.target.value }))}
                      placeholder="e.g. ₹6.0 LPA"
                      className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Expected CTC (Annual)</label>
                    <input
                      type="text"
                      value={preferencesForm.expectedCtc}
                      onChange={(e) => setPreferencesForm(prev => ({ ...prev, expectedCtc: e.target.value }))}
                      placeholder="e.g. ₹10.0 LPA"
                      className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Notice Period</label>
                    <select
                      value={preferencesForm.noticePeriod}
                      onChange={(e) => setPreferencesForm(prev => ({ ...prev, noticePeriod: e.target.value }))}
                      className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                    >
                      <option value="">Select notice duration</option>
                      <option value="Immediate">Immediate / Serving Notice</option>
                      <option value="15 Days">15 Days</option>
                      <option value="30 Days">30 Days</option>
                      <option value="60 Days">60 Days</option>
                      <option value="90 Days">90 Days</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Preferred Work Locations</label>
                    <input
                      type="text"
                      value={preferencesForm.preferredLocation}
                      onChange={(e) => setPreferencesForm(prev => ({ ...prev, preferredLocation: e.target.value }))}
                      placeholder="e.g. Bengaluru, Hyderabad, Remote"
                      className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                  >
                    Save Career Preferences
                  </button>
                </div>
              </form>
            </div>

            {/* Instant Alerts & Notification Settings */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Bell className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-black text-slate-950">Job Alerts & Updates</h2>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'whatsappUpdates', title: 'WhatsApp Direct Alerts', desc: 'Get interview calls & application updates on WhatsApp.' },
                  { key: 'techJobs', title: 'Matching Role Notifications', desc: 'Instant email when verified jobs matching your skills are posted.' },
                  { key: 'remoteJobs', title: 'Remote & Hybrid Opportunities', desc: 'Weekly digest of high-paying remote positions across India.' },
                  { key: 'salaryHikes', title: 'Salary Insights & Benchmark', desc: 'Updates when companies update compensation in your sector.' },
                  { key: 'recruiterViews', title: 'Recruiter Profile Views', desc: 'Notify me when enterprise recruiters inspect my resume.' }
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="pr-4">
                      <p className="text-xs font-bold text-slate-900">{item.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleAlert(item.key)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 shrink-0 ${
                        alerts[item.key] ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ── EDIT BASIC DETAILS MODAL ── */}
      {isEditingBasic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-950">Edit Profile Details</h3>
              <button onClick={() => setIsEditingBasic(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBasic} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={basicForm.name}
                    onChange={(e) => setBasicForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Headline / Target Role</label>
                  <input
                    type="text"
                    value={basicForm.title}
                    onChange={(e) => setBasicForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Software Engineer / Python Dev"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={basicForm.email}
                    onChange={(e) => setBasicForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={basicForm.phone}
                    onChange={(e) => setBasicForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Current City / Location</label>
                  <input
                    type="text"
                    value={basicForm.location}
                    onChange={(e) => setBasicForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Bengaluru, Karnataka"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Total Experience</label>
                  <input
                    type="text"
                    value={basicForm.experience}
                    onChange={(e) => setBasicForm(prev => ({ ...prev, experience: e.target.value }))}
                    placeholder="e.g. 1 Year / Fresher"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditingBasic(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CandidateProfile;
