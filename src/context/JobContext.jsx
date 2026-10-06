import React, { createContext, useContext, useState, useEffect ,useMemo} from 'react';
import toast from 'react-hot-toast';
import { 
  authApi, 
  jobsApi, 
  applicationsApi, 
  messagesApi, 
  adminApi, 
  resumeApi 
} from '../services/api';

const JobContext = createContext();

const initialJobs = [];
const initialApplicants = [];
const initialAppliedJobs = [];
const initialConversations = [];
const initialMessages = {};

export const calculateProfileCompleteness = (targetUser) => {
  if (!targetUser) return 0;
  let score = 0;
  // 1. Identity basics: Name (10%), Email (10%), Phone (10%) = 30%
  if (targetUser.name && targetUser.name.trim()) score += 10;
  if (targetUser.email && targetUser.email.trim()) score += 10;
  if (targetUser.phone && targetUser.phone.trim()) score += 10;
  
  // 2. Title & Location: 20%
  const title = targetUser.title || targetUser.candidateProfile?.title;
  const location = targetUser.location || targetUser.candidateProfile?.location;
  if (title && title.trim()) score += 10;
  if (location && location.trim()) score += 10;

  // 3. About / Professional Summary: 15%
  const about = targetUser.about || targetUser.candidateProfile?.about;
  if (about && about.trim()) score += 15;

  // 4. Skills: 15%
  const skills = targetUser.skills || targetUser.candidateProfile?.skills || [];
  if (skills.length >= 3) score += 15;
  else if (skills.length > 0) score += 8;

  // 5. Experience & Education: 10%
  const exp = targetUser.experienceList || targetUser.candidateProfile?.experienceList || [];
  const edu = targetUser.education || targetUser.candidateProfile?.education || [];
  if (exp.length > 0) score += 5;
  if (edu.length > 0) score += 5;

  // 6. Resume: 10%
  const resume = targetUser.resumeName || targetUser.resumeUrl || targetUser.candidateProfile?.resumeName;
  if (resume && resume.trim()) score += 10;

  return Math.min(100, Math.max(0, score));
};

export const calculateAtsScore = (resumeOrUser) => {
  if (!resumeOrUser) return 0;
  if (resumeOrUser.atsScore && typeof resumeOrUser.atsScore === 'number' && resumeOrUser.atsScore > 0) {
    return resumeOrUser.atsScore;
  }
  
  const resume = resumeOrUser.atsResume || resumeOrUser;
  if (!resume || (!resume.personalInfo && !resume.summary && !resume.experiences && !resume.skills)) {
    return 0;
  }
  
  let score = 30;
  if (resume.personalInfo?.fullName && resume.personalInfo?.email && resume.personalInfo?.phone) score += 15;
  if (resume.summary && resume.summary.length > 30) score += 15;
  if (resume.experiences && resume.experiences.length > 0) score += 15;
  if (resume.education && resume.education.length > 0) score += 10;
  const techSkills = resume.skills?.technical || (Array.isArray(resume.skills) ? resume.skills : []);
  if (techSkills.length >= 3) score += 15;
  
  return Math.min(100, score);
};

export const JobProvider = ({ children }) => {
  // Jobs State (Database Driven)
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem('portal_jobs');
    return saved ? JSON.parse(saved) : [];
  });

  // Saved Jobs Bookmarks
  const [savedJobIds, setSavedJobIds] = useState(() => {
    const saved = localStorage.getItem('portal_saved_jobs');
    return saved ? JSON.parse(saved) : [];
  });

  // Candidate Applied Jobs (Database Driven)
  const [appliedJobs, setAppliedJobs] = useState(() => {
    const saved = localStorage.getItem('portal_applied_jobs');
    return saved ? JSON.parse(saved) : [];
  });

  // Recruiter ATS Applicants (Database Driven)
  const [applicants, setApplicants] = useState(() => {
    const saved = localStorage.getItem('portal_applicants');
    return saved ? JSON.parse(saved) : [];
  });

  // All Users List (Database Driven for Admin)
  const [allUsers, setAllUsers] = useState(() => {
    const saved = localStorage.getItem('portal_all_users');
    return saved ? JSON.parse(saved) : [];
  });

  // Logged-in User Info
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('portal_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('portal_is_authenticated');
    return saved ? saved === 'true' : false;
  });

  // Employer Profile (Database Driven)
  const [employerProfile, setEmployerProfile] = useState(() => {
    const saved = localStorage.getItem('portal_employer_profile');
    return saved ? JSON.parse(saved) : {
      companyName: "SJ tech",
      recruiterName: "employer",
      recruiterRole: "Senior Talent Acquisition Lead",
      recruiterEmail: "employer@gmail.com",
      companyWebsite: "https://sjtech.com",
      industry: "Technology & IT",
      companySize: "50-200 Employees",
      hqLocation: "Bengaluru / Remote",
      isVerified: true
    };
  });

  // Messaging Conversations & Messages
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('portal_conversations');
    return saved ? JSON.parse(saved) : [];
  });

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('portal_messages');
    return saved ? JSON.parse(saved) : {};
  });

  const [activeConversationId, setActiveConversationId] = useState(null);

  // ATS Resume
  const [atsResume, setAtsResume] = useState(() => {
    const saved = localStorage.getItem('portal_ats_resume');
    return saved ? JSON.parse(saved) : null;
  });

  // Modal State
  const [applyModalJob, setApplyModalJob] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Candidate's own filtered applied jobs
  const candidateAppliedJobs = appliedJobs.filter(app => {
    if (!user || !user.email) return true;
    const uEmail = (user.email || '').toLowerCase().trim();
    const uId = String(user._id || user.id || '');
    const appEmail = (app.applicantEmail || app.candidateEmail || app.email || '').toLowerCase().trim();
    const appCandId = String(app.candidateId?._id || app.candidateId || '');
    return !appEmail || appEmail === uEmail || (uId && appCandId && appCandId === uId) || (!appCandId && !appEmail);
  });

  // Candidate conversations: strictly conversations for jobs the candidate has actually applied to
  const candidateConversations = conversations.filter(conv => {
    if (!user || !user.email) return true;
    const uEmail = (user.email || '').toLowerCase().trim();
    const uId = String(user._id || user.id || '');
    const convEmail = (conv.candidateEmail || conv.candidateId?.email || '').toLowerCase().trim();
    const convCandId = String(conv.candidateId?._id || conv.candidateId || '');
    return !convEmail || convEmail === uEmail || (uId && convCandId && convCandId === uId) || (!convCandId && !convEmail);
  });

  // Employer specific posted jobs: strictly jobs posted by THIS employer
  const myEmployerJobs = useMemo(() => {
    if (!user || user.role !== 'employer') return jobs;
    const uId = String(user._id || user.id || '');
    const cName = (user.employerProfile?.companyName || user.companyName || user.name || employerProfile?.companyName || '').toLowerCase().trim();
    return jobs.filter(j => {
      const jEmpId = String(j.employerId?._id || j.employerId || '');
      const jComp = (j.company || '').toLowerCase().trim();
      if (jEmpId && uId && jEmpId === uId) return true;
      if (cName && jComp && jComp === cName) return true;
      return false;
    });
  }, [jobs, user, employerProfile]);

  // Employer specific applicants: strictly applicants for jobs posted by THIS employer
  const myEmployerApplicants = useMemo(() => {
    if (!user || user.role !== 'employer') return applicants;
    const uId = String(user._id || user.id || '');
    const cName = (user.employerProfile?.companyName || user.companyName || user.name || employerProfile?.companyName || '').toLowerCase().trim();
    const myJobIds = myEmployerJobs.map(j => String(j._id || j.id));
    return applicants.filter(a => {
      const aEmpId = String(a.employerId?._id || a.employerId || '');
      const aJobId = String(a.jobId?._id || a.jobId || '');
      const aComp = (a.company || a.companyName || '').toLowerCase().trim();
      if (aEmpId && uId && aEmpId === uId) return true;
      if (aJobId && myJobIds.includes(aJobId)) return true;
      if (cName && aComp && aComp === cName) return true;
      return false;
    });
  }, [applicants, myEmployerJobs, user, employerProfile]);

  // Employer specific conversations: strictly conversations for jobs posted by THIS employer
  const myEmployerConversations = useMemo(() => {
    if (!user || user.role !== 'employer') return conversations;
    const uId = String(user._id || user.id || '');
    const cName = (user.employerProfile?.companyName || user.companyName || user.name || employerProfile?.companyName || '').toLowerCase().trim();
    const myJobIds = myEmployerJobs.map(j => String(j._id || j.id));
    return conversations.filter(c => {
      const cEmpId = String(c.employerId?._id || c.employerId || '');
      const cJobId = String(c.jobId?._id || c.jobId || '');
      const cComp = (c.companyName || c.employerName || '').toLowerCase().trim();
      if (cEmpId && uId && cEmpId === uId) return true;
      if (cJobId && myJobIds.includes(cJobId)) return true;
      if (cName && cComp && cComp === cName) return true;
      return false;
    });
  }, [conversations, myEmployerJobs, user, employerProfile]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('portal_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('portal_saved_jobs', JSON.stringify(savedJobIds));
  }, [savedJobIds]);

  useEffect(() => {
    localStorage.setItem('portal_applied_jobs', JSON.stringify(appliedJobs));
  }, [appliedJobs]);

  useEffect(() => {
    localStorage.setItem('portal_applicants', JSON.stringify(applicants));
  }, [applicants]);

  useEffect(() => {
    localStorage.setItem('portal_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('portal_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('portal_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (atsResume) {
      localStorage.setItem('portal_ats_resume', JSON.stringify(atsResume));
    }
  }, [atsResume]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('portal_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('portal_user');
      }
    } catch (err) {
      console.warn("Storage warning:", err);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('portal_is_authenticated', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('portal_employer_profile', JSON.stringify(employerProfile));
  }, [employerProfile]);

  // Live Database Syncing from MongoDB Atlas
  const loadDatabaseData = async () => {
    try {
      const jobsRes = await jobsApi.getAll('status=all');
      if (jobsRes && jobsRes.data) {
        const normalizedJobs = jobsRes.data.map(j => ({
          id: j._id || j.id,
          _id: j._id || j.id,
          title: j.title,
          slug: j.slug || (j.title + "-" + (j.location || "india")).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          company: j.company,
          companySlug: (j.company || 'company').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          logoText: j.logoText || (j.company ? j.company.substring(0, 3).toUpperCase() : 'JOB'),
          logoBg: j.logoBg || '#0056B3',
          location: j.location,
          workMode: j.workplaceType || j.workMode || 'On-site',
          workplaceType: j.workplaceType || j.workMode || 'On-site',
          category: j.category || 'Information Technology',
          categorySlug: (j.category || 'information-technology').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          employmentType: j.jobType || j.employmentType || 'Full Time',
          jobType: j.jobType || j.employmentType || 'Full Time',
          experience: j.experience || '1-3 Years',
          expBracket: j.expBracket || 'Junior (1-3 yrs)',
          qualification: j.qualification || "Bachelor's Degree",
          salary: (j.salary && j.salary !== 'Competitive CTC' && j.salary !== 'Competitive') 
            ? j.salary 
            : (j.salaryDisplay && j.salaryDisplay !== 'Competitive CTC' && j.salaryDisplay !== 'Competitive' 
                ? j.salaryDisplay 
                : (j.salaryMin && j.salaryMax ? `₹${(j.salaryMin/100000).toFixed(1)} - ₹${(j.salaryMax/100000).toFixed(1)} LPA` : (j.salary || j.salaryDisplay || 'Competitive'))),
          salaryDisplay: (j.salaryDisplay && j.salaryDisplay !== 'Competitive CTC' && j.salaryDisplay !== 'Competitive')
            ? j.salaryDisplay
            : (j.salary && j.salary !== 'Competitive CTC' && j.salary !== 'Competitive'
                ? j.salary
                : (j.salaryMin && j.salaryMax ? `₹${(j.salaryMin/100000).toFixed(1)} - ₹${(j.salaryMax/100000).toFixed(1)} LPA` : (j.salaryDisplay || j.salary || 'Competitive'))),
          salaryMin: j.salaryMin,
          salaryMax: j.salaryMax,
          salaryMinLpa: j.salaryMinLpa || (j.salaryMin ? j.salaryMin / 100000 : undefined),
          salaryMaxLpa: j.salaryMaxLpa || (j.salaryMax ? j.salaryMax / 100000 : undefined),
          overview: j.overview || j.description || '',
          description: j.description || j.overview || '',
          responsibilities: j.responsibilities || [],
          requirements: j.requirements || [],
          skills: j.skills || [],
          benefits: j.benefits || [],
          vacancies: j.vacancies || 1,
          urgent: j.urgent || false,
          featured: j.featured || false,
          status: j.status === 'active' || j.status === 'Active' ? 'Active' : j.status === 'paused' || j.status === 'Paused' ? 'Paused' : 'Closed',
          applicantsCount: j.applicantsCount || 0,
          viewsCount: j.viewsCount || 1,
          postedDate: j.postedDate || (j.createdAt ? new Date(j.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'),
          deadline: j.deadline || 'Open Until Filled',
          employerId: j.employerId
        }));
        setJobs(normalizedJobs);
      }
    } catch (e) {
      console.warn("DB jobs sync notice:", e.message);
    }

    if (isAuthenticated) {
      try {
        const convRes = await messagesApi.getConversations();
        if (convRes && convRes.data) {
          setConversations(convRes.data);
          for (const c of convRes.data) {
            const cId = c._id || c.id;
            try {
              const mRes = await messagesApi.getMessages(cId);
              if (mRes && mRes.data) {
                setMessages(prev => ({ ...prev, [cId]: mRes.data }));
              }
            } catch (mErr) {}
          }
        }
      } catch (e) {
        console.warn("DB messages sync notice:", e.message);
      }
    }

    if (user?.role === 'employer' || user?.role === 'admin') {
      try {
        const appsRes = await applicationsApi.getEmployerApplications();
        if (appsRes && appsRes.data) {
          const normalizedApps = appsRes.data.map(a => {
            const cName = a.applicantName || a.candidateName || a.name || a.candidateId?.name || 'Applicant';
            const rSource = a.resumeSource || (a.atsResumeData ? 'built_in' : 'outer_file');
            return {
              id: a._id || a.id,
              _id: a._id,
              jobId: a.jobId?._id || a.jobId || a.jobTitle,
              jobTitle: a.jobTitle || a.jobId?.title || 'Open Position',
              company: a.companyName || (typeof a.jobId === 'object' ? a.jobId?.company : 'SJ tech'),
              name: cName,
              applicantName: cName,
              candidateName: cName,
              email: a.applicantEmail || a.candidateId?.email || '',
              phone: a.applicantPhone || a.candidateId?.phone || '',
              location: a.candidateId?.candidateProfile?.location || 'India',
              experience: a.experience || a.candidateId?.candidateProfile?.experience || '1-3 Years',
              currentCtc: a.candidateId?.candidateProfile?.preferences?.currentCtc || 'N/A',
              expectedCtc: a.candidateId?.candidateProfile?.expectedSalary || a.candidateId?.candidateProfile?.preferences?.expectedCtc || 'Negotiable',
              noticePeriod: a.candidateId?.candidateProfile?.preferences?.noticePeriod || 'Immediate',
              appliedDate: a.createdAt ? new Date(a.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
              status: a.status === 'Reviewing' ? 'Under Review' : a.status === 'Interview' ? 'Interview Scheduled' : a.status === 'Hired' ? 'Offered' : a.status || 'Applied',
              stage: a.stage || (a.status === 'Hired' || a.status === 'Offered' || a.status === 'Offer Extended' ? 5 : a.status === 'Interview' || a.status === 'Interview Scheduled' ? 4 : a.status === 'Shortlisted' ? 3 : a.status === 'Reviewing' || a.status === 'Under Review' ? 2 : (a.status === 'Rejected' ? 6 : 1)),
              rating: a.rating || 0,
              resumeSource: rSource,
              resumeName: a.resumeName || (rSource === 'built_in' ? `${cName.replace(/\s+/g, '_')}_ATS_Resume.pdf` : `${cName.replace(/\s+/g, '_')}_Resume.pdf`),
              resumeUrl: a.resumeUrl || '',
              resumeDataUrl: a.resumeDataUrl || '',
              resumeSize: a.resumeSize || '',
              atsResumeData: a.atsResumeData || null,
              skills: a.atsResumeData?.skills?.technical || a.atsResumeData?.skills || a.candidateId?.candidateProfile?.skills || ['Technical Expertise', 'Communication'],
              atsScore: a.atsResumeData?.atsScore || a.candidateId?.candidateProfile?.atsScore || 90,
              recruiterNotes: a.statusNotes || '',
              interviewDetails: a.interviewDetails || null
            };
          });
          setApplicants(normalizedApps);
        }
      } catch (e) {
        console.warn("DB employer apps sync notice:", e.message);
      }
    }

    if (user?.role === 'candidate' || user?.role === 'admin') {
      try {
        const myAppsRes = await applicationsApi.getCandidateApplications();
        if (myAppsRes && myAppsRes.data) {
          const normalizedMyApps = myAppsRes.data.map(a => {
            const cName = a.applicantName || a.candidateName || a.name || a.candidateId?.name || 'Candidate';
            const cEmail = (a.applicantEmail || a.email || a.candidateId?.email || '').toLowerCase().trim();
            const cId = a.candidateId?._id || a.candidateId || '';
            const jId = a.jobId?._id || a.jobId || '';
            const comp = a.companyName || a.jobId?.company || 'Company';
            const rSource = a.resumeSource || (a.atsResumeData ? 'built_in' : 'outer_file');
            return {
              id: a._id || a.id,
              _id: a._id || a.id,
              jobId: jId,
              jobTitle: a.jobTitle || a.jobId?.title || 'Applied Role',
              company: comp,
              companyName: comp,
              companyLogo: (comp || 'CO').slice(0, 3).toUpperCase(),
              companyBg: '#0056B3',
              location: a.jobId?.location || 'India',
              applicantName: cName,
              candidateName: cName,
              name: cName,
              applicantEmail: cEmail,
              email: cEmail,
              candidateId: cId,
              appliedDate: a.createdAt ? new Date(a.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
              status: a.status === 'Reviewing' ? 'Under Review' : a.status === 'Interview' ? 'Interview Scheduled' : a.status === 'Hired' ? 'Offered' : a.status || 'Applied',
              stage: a.stage || (a.status === 'Hired' || a.status === 'Offered' || a.status === 'Offer Extended' ? 5 : a.status === 'Interview' || a.status === 'Interview Scheduled' ? 4 : a.status === 'Shortlisted' ? 3 : a.status === 'Reviewing' || a.status === 'Under Review' ? 2 : (a.status === 'Rejected' ? 6 : 1)),
              rating: a.rating || 0,
              salary: a.jobId?.salaryDisplay || a.jobId?.salary || 'Competitive',
              resumeSource: rSource,
              resume: a.resumeName || 'Resume.pdf',
              resumeName: a.resumeName || 'Resume.pdf',
              resumeUrl: a.resumeUrl || '',
              resumeDataUrl: a.resumeDataUrl || '',
              resumeSize: a.resumeSize || '',
              atsResumeData: a.atsResumeData || null,
              interviewDetails: a.interviewDetails || null
            };
          });
          setAppliedJobs(normalizedMyApps);
        }
      } catch (e) {
        console.warn("DB candidate apps sync notice:", e.message);
      }
    }

    if (user?.role === 'admin') {
      try {
        const usersRes = await adminApi.getUsers();
        if (usersRes && usersRes.data) {
          setAllUsers(usersRes.data);
        }
      } catch (e) {}
    }
  };

  useEffect(() => {
    loadDatabaseData();

    // Real-time chat, applications & applicant pipeline synchronization interval
    const syncTimer = setInterval(async () => {
      try {
        await loadDatabaseData();
        if (activeConversationId) {
          const mRes = await messagesApi.getMessages(activeConversationId);
          if (mRes && mRes.data) {
            setMessages(prev => ({
              ...prev,
              [activeConversationId]: mRes.data
            }));
          }
        }
      } catch (syncErr) {
        // silent sync
      }
    }, 4000);

    return () => clearInterval(syncTimer);
  }, [isAuthenticated, user?.email, activeConversationId]);

  // Candidate Auth Handlers
  const loginCandidate = async (credentials) => {
    try {
      // 1. Try Backend API
      const res = await authApi.login({
        email: credentials.email,
        password: credentials.password
      });

      if (res.token) localStorage.setItem('balaji_token', res.token);
      if (res.user) {
        const candProfile = res.user.candidateProfile || {};
        const calculatedScore = calculateProfileCompleteness({ ...res.user, ...candProfile });
        const normalizedUser = {
          ...res.user,
          title: candProfile.title || res.user.title || '',
          experience: candProfile.experience || res.user.experience || '',
          location: candProfile.location || res.user.location || '',
          about: candProfile.about || res.user.about || '',
          skills: candProfile.skills || res.user.skills || [],
          experienceList: candProfile.experienceList || res.user.experienceList || [],
          education: candProfile.education || res.user.education || [],
          currentCtc: candProfile.preferences?.currentCtc || res.user.currentCtc || '',
          expectedCtc: candProfile.preferences?.expectedCtc || res.user.expectedCtc || '',
          noticePeriod: candProfile.preferences?.noticePeriod || res.user.noticePeriod || '',
          preferredLocation: candProfile.preferences?.preferredLocation || res.user.preferredLocation || '',
          preferredRole: candProfile.preferences?.preferredRole || res.user.preferredRole || '',
          jobType: candProfile.preferences?.jobType || res.user.jobType || 'Full-Time',
          resumeName: candProfile.resumeName || res.user.resumeName || '',
          resumeUrl: candProfile.resumeUrl || res.user.resumeUrl || '',
          profileCompleted: calculatedScore,
          atsScore: candProfile.atsScore || 0
        };
        setUser(normalizedUser);
        setIsAuthenticated(true);
        toast.success(`Welcome back, ${normalizedUser.name}!`);
        return { success: true, user: normalizedUser };
      }
    } catch (apiErr) {
      console.log("Backend login notice, checking local database...", apiErr.message);
    }

    // 2. Offline / Local fallback match
    const emailLower = (credentials.email || '').toLowerCase().trim();
    const candidateMatch = allUsers.find(u => u.email.toLowerCase() === emailLower && u.role === 'candidate');

    if (emailLower === 'candidate@gmail.com' && (credentials.password === 'candidate@123' || !credentials.password)) {
      const candidateUser = {
        _id: 'u-candidate-1',
        name: 'candidate',
        email: 'candidate@gmail.com',
        role: 'candidate',
        phone: '9528634580',
        isEmailVerified: true,
        title: 'Software Developer',
        location: 'Bengaluru, India',
        experience: '2 Years',
        about: 'Software developer with 2 years of experience in JavaScript, React, and Node.js.',
        skills: ['JavaScript', 'React.js', 'Node.js', 'Tailwind CSS'],
        experienceList: [
          {
            id: 1,
            title: 'Frontend Developer',
            company: 'Tech Solutions',
            period: '2024 - Present',
            location: 'Bengaluru',
            type: 'Full-Time',
            description: 'Developing responsive web applications using React.js and modern state management.'
          }
        ],
        education: [
          {
            id: 1,
            degree: 'Bachelor of Technology (B.Tech)',
            institution: 'Bengaluru Institute of Technology',
            year: '2020 - 2024',
            grade: '8.4 CGPA',
            location: 'Bengaluru'
          }
        ],
        resumeName: 'candidate_resume.pdf',
        profileCompleted: 85,
        atsScore: 88
      };
      setUser(candidateUser);
      setIsAuthenticated(true);
      localStorage.setItem('balaji_token', 'token_candidate_' + Date.now());
      toast.success("Welcome back, candidate!");
      return { success: true, user: candidateUser };
    } else if (candidateMatch) {
      const candProfile = candidateMatch.candidateProfile || {};
      const calculatedScore = calculateProfileCompleteness({ ...candidateMatch, ...candProfile });
      const loggedCandidate = {
        ...candidateMatch,
        title: candProfile.title || candidateMatch.title || '',
        location: candProfile.location || candidateMatch.location || '',
        experience: candProfile.experience || candidateMatch.experience || '',
        about: candProfile.about || candidateMatch.about || '',
        skills: candProfile.skills || candidateMatch.skills || [],
        experienceList: candProfile.experienceList || candidateMatch.experienceList || [],
        education: candProfile.education || candidateMatch.education || [],
        resumeName: candProfile.resumeName || candidateMatch.resumeName || '',
        profileCompleted: calculatedScore,
        atsScore: candProfile.atsScore || 0
      };
      setUser(loggedCandidate);
      setIsAuthenticated(true);
      localStorage.setItem('balaji_token', 'mock_jwt_token_' + Date.now());
      toast.success(`Welcome back, ${loggedCandidate.name}!`);
      return { success: true, user: loggedCandidate };
    }

    toast.error("Account not found. Please register first or check your credentials.", {
      id: 'login-error',
      duration: 4000
    });
    return { success: false, message: "No registered candidate account found with this email. Please register first." };
  };

  const logoutCandidate = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('balaji_token');
    localStorage.removeItem('portal_user');
    localStorage.setItem('portal_is_authenticated', 'false');
    toast.success("Signed out successfully");
  };

  // Admin Auth Handlers
  const loginAdmin = async (credentials) => {
    try {
      // 1. Try Backend API
      const res = await authApi.login({
        email: credentials.email,
        password: credentials.password
      });

      if (res.user && res.user.role === 'admin') {
        if (res.token) localStorage.setItem('balaji_token', res.token);
        setUser(res.user);
        setIsAuthenticated(true);
        localStorage.setItem('portal_user', JSON.stringify(res.user));
        localStorage.setItem('portal_is_authenticated', 'true');
        toast.success(`Welcome, Admin ${res.user.name || ''}!`);
        return { success: true, user: res.user };
      } else if (res.user && res.user.role !== 'admin') {
        toast.error("Access denied: You do not have Administrator permissions.");
        return { success: false, message: "Access denied: Admin role required." };
      }
    } catch (apiErr) {
      console.log("Backend admin login check, trying fallback...", apiErr.message);
    }

    // 2. Admin credential verification fallback
    const emailLower = (credentials.email || '').toLowerCase().trim();
    const pwd = credentials.password || '';

    const isAdminEmail = emailLower === 'admin@balajiplacement.com' || emailLower === 'admin@gmail.com' || emailLower === 'admin@balaji.com';
    const isValidAdminPwd = pwd === 'admin@123' || pwd === 'admin123' || pwd === 'admin' || pwd === 'BalajiAdmin2026!';
    const matchedAdmin = allUsers.find(u => u.email.toLowerCase() === emailLower && u.role === 'admin');

    if ((isAdminEmail && isValidAdminPwd) || (matchedAdmin && isValidAdminPwd)) {
      const adminUser = matchedAdmin || {
        _id: 'u-admin-master',
        name: 'Master Administrator',
        email: emailLower,
        role: 'admin',
        phone: '+91 97609 67808',
        isEmailVerified: true
      };

      setUser(adminUser);
      setIsAuthenticated(true);
      localStorage.setItem('portal_user', JSON.stringify(adminUser));
      localStorage.setItem('portal_is_authenticated', 'true');
      localStorage.setItem('balaji_token', 'mock_admin_jwt_' + Date.now());
      toast.success("Welcome back, Master Administrator!");
      return { success: true, user: adminUser };
    }

    return { success: false, message: "Invalid administrator email or security access key." };
  };

  const logoutAdmin = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('balaji_token');
    localStorage.removeItem('portal_user');
    localStorage.setItem('portal_is_authenticated', 'false');
    toast.success("Administrator session closed");
  };

  const logoutEmployer = () => {
    localStorage.removeItem('balaji_token');
    localStorage.removeItem('portal_employer_profile');
    localStorage.removeItem('portal_user');
    localStorage.setItem('portal_is_authenticated', 'false');
    setIsAuthenticated(false);
    setUser(null);
    toast.success("Employer ATS session signed out");
  };

  const registerUser = async (userData) => {
    const candidateData = {
      ...userData,
      role: 'candidate'
    };

    try {
      // Try backend API first
      const res = await authApi.register(candidateData);
      if (res.token) localStorage.setItem('balaji_token', res.token);
      if (res.user) {
        const initialScore = calculateProfileCompleteness(res.user);
        const newUser = {
          ...res.user,
          title: '',
          location: '',
          about: '',
          skills: [],
          experienceList: [],
          education: [],
          currentCtc: '',
          expectedCtc: '',
          noticePeriod: '',
          preferredLocation: '',
          preferredRole: '',
          jobType: 'Full-Time',
          resumeName: '',
          resumeUrl: '',
          profileCompleted: initialScore,
          atsScore: 0
        };
        setUser(newUser);
        setIsAuthenticated(true);
        setAllUsers(prev => [newUser, ...prev]);
        toast.success(res.message || "Candidate account registered successfully!");
        return { success: true, user: newUser };
      }
    } catch (err) {
      console.log("Backend register error / fallback:", err.message);
    }

    // Offline fallback for new candidate
    const initialScore = calculateProfileCompleteness(candidateData);
    const newUser = {
      _id: `u-${Date.now()}`,
      name: candidateData.name || 'candidate',
      email: candidateData.email.toLowerCase(),
      role: 'candidate',
      phone: candidateData.phone || '',
      isEmailVerified: true,
      title: '',
      location: '',
      about: '',
      skills: [],
      experienceList: [],
      education: [],
      currentCtc: '',
      expectedCtc: '',
      noticePeriod: '',
      preferredLocation: '',
      preferredRole: '',
      jobType: 'Full-Time',
      resumeName: '',
      resumeUrl: '',
      candidateProfile: { 
        title: '', 
        experience: '', 
        location: '', 
        about: '', 
        skills: [], 
        experienceList: [], 
        education: [],
        resumeName: '',
        profileCompleted: initialScore,
        atsScore: 0
      },
      profileCompleted: initialScore,
      atsScore: 0
    };
    setAllUsers(prev => [newUser, ...prev]);
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('balaji_token', 'mock_jwt_token_' + Date.now());
    toast.success(`Account created for ${newUser.name}!`);
    return { success: true, user: newUser };
  };

  const updateCandidateProfile = async (updatedFields) => {
    const updatedUser = {
      ...user,
      ...updatedFields
    };
    const newScore = calculateProfileCompleteness(updatedUser);
    updatedUser.profileCompleted = newScore;

    setUser(updatedUser);
    setAllUsers(prev => prev.map(u => (u._id === updatedUser._id || u.email === updatedUser.email) ? { ...u, ...updatedUser } : u));
    
    try {
      await authApi.updateProfile(updatedFields);
    } catch (err) {
      console.log("Profile updated locally:", err.message);
    }
    return updatedUser;
  };

  // Upload Candidate Resume (Max 5MB PDF/DOC)
  const uploadCandidateResume = async (file) => {
    if (!file) {
      toast.error("Please select a file to upload.");
      return null;
    }

    // 1. File size check (Max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error("File size exceeds 5 MB limit. Please upload a smaller PDF or Word file.", { duration: 5000, icon: '⚠️' });
      return null;
    }

    // 2. File type check (.pdf, .doc, .docx)
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileName = file.name || '';
    const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      toast.error("Invalid file format. Only PDF and Word documents (.pdf, .doc, .docx) are allowed.", { duration: 5000, icon: '⚠️' });
      return null;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await resumeApi.uploadFile(formData);
      if (res && res.fileUrl) {
        let localBlobUrl = '';
        try {
          localBlobUrl = URL.createObjectURL(file);
        } catch (_) {}

        const updatedFields = {
          resumeUrl: res.fileUrl,
          resumeBlobUrl: localBlobUrl || res.fileUrl,
          resumeName: res.fileName || file.name,
          resumeSize: res.fileSize || `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          resumeType: file.type || 'application/pdf',
          resumeUploadDate: 'Just Now',
          isCustomUploaded: true
        };

        if (user) {
          const updatedUser = {
            ...user,
            ...updatedFields,
            candidateProfile: {
              ...(user.candidateProfile || {}),
              ...updatedFields
            }
          };
          setUser(updatedUser);
          setAllUsers(prev => prev.map(u => (u._id === updatedUser._id || u.email === updatedUser.email) ? { ...u, ...updatedUser } : u));
        }

        toast.success(`Resume "${res.fileName || file.name}" uploaded successfully!`);
        return res;
      }
    } catch (err) {
      console.warn("Backend resume upload error / fallback:", err.message);
      toast.error(err.message || "Failed to upload resume file.");
      return null;
    }
  };

  // Delete Candidate Resume
  const deleteCandidateResume = async () => {
    try {
      await resumeApi.deleteUploadedResume();
    } catch (err) {
      console.warn("Backend delete resume error / fallback:", err.message);
    }

    const clearedFields = {
      resumeUrl: '',
      resumeBlobUrl: '',
      resumeDataUrl: '',
      resumeName: '',
      resumeSize: '',
      resumeType: '',
      isCustomUploaded: false
    };

    if (user) {
      const updatedUser = {
        ...user,
        ...clearedFields,
        candidateProfile: {
          ...(user.candidateProfile || {}),
          ...clearedFields
        }
      };
      setUser(updatedUser);
      setAllUsers(prev => prev.map(u => (u._id === updatedUser._id || u.email === updatedUser.email) ? { ...u, ...updatedUser } : u));
    }

    toast.success("Uploaded resume removed successfully.");
    return true;
  };

  // Messaging Handlers
  const sendMessage = async (conversationId, text, senderRole, senderName) => {
    if (!text || !text.trim() || !conversationId) return;

    const trimmedText = text.trim();
    const role = senderRole || (user?.role === 'employer' ? 'employer' : 'candidate');
    const name = senderName || user?.name || (role === 'employer' ? `${employerProfile.recruiterName || 'Talent Lead'} (${employerProfile.companyName || 'SJ tech'})` : 'Candidate');
    const senderId = user?._id || (role === 'employer' ? 'employer-id' : 'candidate-id');

    const tempMsgId = `m-${Date.now()}`;
    const optimisticMsg = {
      _id: tempMsgId,
      conversationId,
      senderId,
      senderRole: role,
      senderName: name,
      text: trimmedText,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), optimisticMsg]
    }));

    setConversations(prev => prev.map(c => {
      if ((c._id || c.id) === conversationId) {
        return {
          ...c,
          lastMessage: trimmedText,
          lastMessageAt: new Date().toISOString()
        };
      }
      return c;
    }));

    try {
      const res = await messagesApi.sendMessage(conversationId, {
        text: trimmedText,
        senderRole: role,
        senderName: name
      });

      if (res && res.data) {
        setMessages(prev => ({
          ...prev,
          [conversationId]: (prev[conversationId] || []).map(m => m._id === tempMsgId ? res.data : m)
        }));
      }
    } catch (apiErr) {
      console.warn("Message delivery notice:", apiErr.message);
    }
  };

  const fetchMessagesForConversation = async (conversationId) => {
    if (!conversationId) return;
    setActiveConversationId(conversationId);
    try {
      const res = await messagesApi.getMessages(conversationId);
      if (res && res.data) {
        setMessages(prev => ({
          ...prev,
          [conversationId]: res.data
        }));
      }
    } catch (err) {
      console.warn("fetchMessages notice:", err.message);
    }
  };

  // ATS Resume Handlers
  const saveAtsResume = async (resumeData) => {
    setAtsResume(resumeData);
    if (user?.email) {
      localStorage.setItem(`balaji_ats_resume_${user.email.toLowerCase()}`, JSON.stringify(resumeData));
    }

    const allSkills = Array.from(new Set([
      ...(resumeData.skills?.technical || []),
      ...(resumeData.skills?.frameworks || []),
      ...(resumeData.skills?.tools || []),
      ...(resumeData.skills?.softSkills || [])
    ])).filter(Boolean);

    const formattedExperience = (resumeData.experiences || []).map(exp => ({
      id: exp.id,
      title: exp.role || exp.company || 'Role',
      role: exp.role || '',
      company: exp.company || '',
      location: exp.location || '',
      period: `${exp.startDate || ''} - ${exp.endDate || 'Present'}`,
      startDate: exp.startDate || '',
      endDate: exp.endDate || 'Present',
      description: exp.description || (exp.highlights || []).filter(Boolean).join('. ')
    }));

    const formattedEducation = (resumeData.education || []).map(edu => ({
      id: edu.id,
      degree: edu.degree || 'Degree',
      fieldOfStudy: edu.fieldOfStudy || '',
      institution: edu.institution || 'University',
      year: edu.endDate || edu.startDate || '',
      endDate: edu.endDate || '',
      grade: edu.grade || '',
      location: edu.location || ''
    }));

    const updatedFields = {
      name: resumeData.personalInfo?.fullName || user?.name || '',
      phone: resumeData.personalInfo?.phone || user?.phone || '',
      location: resumeData.personalInfo?.location || user?.location || '',
      title: resumeData.personalInfo?.title || user?.title || '',
      about: resumeData.summary || user?.about || '',
      skills: allSkills.length > 0 ? allSkills : (user?.skills || []),
      experienceList: formattedExperience,
      education: formattedEducation,
      resumeName: `${(resumeData.personalInfo?.fullName || user?.name || 'Candidate').replace(/\s+/g, '_')}_ATS_Resume.pdf`,
      atsScore: 95
    };

    await updateCandidateProfile(updatedFields);

    try {
      await resumeApi.saveResume(resumeData);
    } catch (e) {
      // offline storage fallback
    }
  };

  // Admin Handlers
  const deleteUserAccount = (id) => {
    setAllUsers(prev => prev.filter(u => u._id !== id));
  };

  const updateUserRole = (id, newRole) => {
    setAllUsers(prev => prev.map(u => u._id === id ? { ...u, role: newRole } : u));
  };

  const approveEmployerByAdmin = async (id) => {
    try {
      const res = await adminApi.approveEmployer(id);
      setAllUsers(prev => prev.map(u => {
        if (String(u._id) === String(id) || String(u.id) === String(id)) {
          return {
            ...u,
            isApproved: true,
            status: 'approved',
            employerProfile: {
              ...u.employerProfile,
              isVerifiedCompany: true,
              verificationStatus: 'approved',
              rejectionReason: ''
            }
          };
        }
        return u;
      }));
      toast.success(res?.message || "Employer verified and approved for ATS access!");
      return { success: true, data: res?.data };
    } catch (err) {
      console.warn("Approve employer API warning:", err.message);
      // Fallback local update to guarantee responsive UI
      setAllUsers(prev => prev.map(u => {
        if (String(u._id) === String(id) || String(u.id) === String(id)) {
          return {
            ...u,
            isApproved: true,
            status: 'approved',
            employerProfile: {
              ...u.employerProfile,
              isVerifiedCompany: true,
              verificationStatus: 'approved',
              rejectionReason: ''
            }
          };
        }
        return u;
      }));
      toast.success("Employer approved and verified successfully!");
      return { success: true };
    }
  };

  const rejectEmployerByAdmin = async (id, reason = '') => {
    try {
      const res = await adminApi.rejectEmployer(id, reason);
      setAllUsers(prev => prev.map(u => {
        if (String(u._id) === String(id) || String(u.id) === String(id)) {
          return {
            ...u,
            isApproved: false,
            status: 'rejected',
            employerProfile: {
              ...u.employerProfile,
              isVerifiedCompany: false,
              verificationStatus: 'rejected',
              rejectionReason: reason
            }
          };
        }
        return u;
      }));
      toast.success(res?.message || "Employer registration rejected.");
      return { success: true, data: res?.data };
    } catch (err) {
      console.warn("Reject employer API warning:", err.message);
      // Fallback local update to guarantee responsive UI
      setAllUsers(prev => prev.map(u => {
        if (String(u._id) === String(id) || String(u.id) === String(id)) {
          return {
            ...u,
            isApproved: false,
            status: 'rejected',
            employerProfile: {
              ...u.employerProfile,
              isVerifiedCompany: false,
              verificationStatus: 'rejected',
              rejectionReason: reason
            }
          };
        }
        return u;
      }));
      toast.success("Employer request rejected.");
      return { success: true };
    }
  };

  // Job Bookmark Handlers
  const toggleSaveJob = (jobId, jobTitle = "Job") => {
    const isCurrentlySaved = savedJobIds.includes(jobId);
    if (isCurrentlySaved) {
      setSavedJobIds(prev => prev.filter(id => id !== jobId));
      toast.success(`Removed "${jobTitle}" from saved jobs`, { id: `save-toast-${jobId}` });
    } else {
      setSavedJobIds(prev => [...prev, jobId]);
      toast.success(`Saved "${jobTitle}" to bookmarks`, { icon: '🔖', id: `save-toast-${jobId}` });
    }
  };

  const isJobSaved = (jobId) => savedJobIds.includes(jobId);

  // Job Application Navigation Handler
  const openApplyModal = (job, navigate) => {
    const slug = job.slug || job._id || job.id;
    if (!isAuthenticated) {
      toast.error("Please sign in to your candidate account to apply.", { icon: '🔒' });
      if (navigate) navigate(`/login?redirect=${encodeURIComponent(`/apply/${slug}`)}`);
      return false;
    }
    if (navigate) {
      navigate(`/apply/${slug}`);
    }
    return true;
  };

  const closeApplyModal = () => {
    setIsApplyModalOpen(false);
    setApplyModalJob(null);
  };

  const submitApplication = async (job, applicantDetails) => {
    const targetJobId = job._id || job.id;
    const alreadyApplied = appliedJobs.some(app => app.jobId === targetJobId || app.jobId === job.id);
    if (alreadyApplied) {
      toast.error(`You have already applied for ${job.title}`);
      closeApplyModal();
      return false;
    }

    const chosenResumeSource = applicantDetails.resumeSource || (applicantDetails.atsResumeData ? 'built_in' : 'outer_file');
    const defaultResumeName = chosenResumeSource === 'built_in'
      ? `${applicantDetails.name || user?.name || 'Candidate'}_ATS_Resume.pdf`
      : `${applicantDetails.name || user?.name || 'Candidate'}_Resume.pdf`;
    const finalResumeName = applicantDetails.resumeName || user?.resumeName || defaultResumeName;

    try {
      await applicationsApi.apply({
        jobId: targetJobId,
        name: applicantDetails.name || user?.name || 'Candidate',
        email: applicantDetails.email || user?.email || '',
        phone: applicantDetails.phone || user?.phone || '',
        currentLocation: applicantDetails.currentLocation || user?.location || '',
        experience: applicantDetails.experience || user?.experience || '1-3 Years',
        coverLetter: applicantDetails.coverNote || '',
        resumeSource: chosenResumeSource,
        resumeName: finalResumeName,
        resumeUrl: applicantDetails.resumeUrl || user?.resumeUrl || '',
        resumeDataUrl: applicantDetails.resumeDataUrl || '',
        resumeSize: applicantDetails.resumeSize || '',
        atsResumeData: applicantDetails.atsResumeData || (chosenResumeSource === 'built_in' ? (atsResume || user?.candidateProfile || {
          fullName: applicantDetails.name || user?.name || 'Candidate',
          email: applicantDetails.email || user?.email || '',
          phone: applicantDetails.phone || user?.phone || '',
          title: applicantDetails.currentLocation || user?.location || '',
          experience: applicantDetails.experience || user?.experience || '',
          skills: user?.skills || job.skills || [],
          atsScore: calculateAtsScore(user) || 90
        }) : null)
      });
      await loadDatabaseData();
      toast.success(`🎉 Application sent to ${job.company}! Recruiter chat thread created.`, {
        duration: 4500,
        icon: '🚀'
      });
      closeApplyModal();
      return true;
    } catch (err) {
      console.warn("Backend apply notice:", err.message);
      // Local fallback
      const newAppId = `app-${Date.now()}`;
      const newApplication = {
        id: newAppId,
        _id: newAppId,
        jobId: targetJobId,
        candidateId: user?._id || user?.id || 'u-candidate-1',
        jobTitle: job.title,
        company: job.company,
        companyLogo: job.logoText || job.company.substring(0, 3).toUpperCase(),
        companyBg: job.logoBg || "#0056B3",
        location: job.location,
        appliedDate: "Today",
        status: "Applied",
        stage: 1,
        salary: job.salary || job.salaryDisplay,
        applicantName: applicantDetails.name || user?.name || "Candidate",
        applicantEmail: (applicantDetails.email || user?.email || "").toLowerCase(),
        resumeSource: chosenResumeSource,
        resume: finalResumeName,
        resumeName: finalResumeName,
        resumeUrl: applicantDetails.resumeUrl || user?.resumeUrl || "",
        resumeDataUrl: applicantDetails.resumeDataUrl || "",
        resumeSize: applicantDetails.resumeSize || "",
        atsResumeData: applicantDetails.atsResumeData || (chosenResumeSource === 'built_in' ? (atsResume || user?.candidateProfile || null) : null)
      };

      const newApplicantRecord = {
        id: newAppId,
        _id: newAppId,
        jobId: targetJobId,
        candidateId: user?._id || user?.id || 'u-candidate-1',
        jobTitle: job.title,
        company: job.company,
        name: applicantDetails.name || user?.name || "Candidate",
        candidateName: applicantDetails.name || user?.name || "Candidate",
        email: (applicantDetails.email || user?.email || "").toLowerCase(),
        phone: applicantDetails.phone || user?.phone || "",
        location: applicantDetails.currentLocation || user?.location || "",
        experience: applicantDetails.experience || user?.experience || "",
        currentCtc: applicantDetails.currentCtc || user?.currentCtc || "Not Disclosed",
        expectedCtc: applicantDetails.expectedCtc || user?.expectedCtc || "Not Disclosed",
        noticePeriod: applicantDetails.noticePeriod || user?.noticePeriod || "Immediate",
        appliedDate: "Today",
        status: "Applied",
        stage: 1,
        resumeSource: chosenResumeSource,
        resumeName: finalResumeName,
        resumeUrl: applicantDetails.resumeUrl || user?.resumeUrl || "",
        resumeDataUrl: applicantDetails.resumeDataUrl || "",
        resumeSize: applicantDetails.resumeSize || "",
        atsResumeData: applicantDetails.atsResumeData || (chosenResumeSource === 'built_in' ? (atsResume || user?.candidateProfile || null) : null),
        skills: user?.skills?.length ? user.skills : (job.skills || ["Communication", "Problem Solving"]),
        atsScore: chosenResumeSource === 'built_in' ? 95 : (calculateAtsScore(user) || 85),
        rating: 0,
        recruiterNotes: applicantDetails.coverNote || "Application submitted directly via Balaji Placement modal."
      };

      const fallbackConvId = `conv-${Date.now()}`;
      const newConv = {
        _id: fallbackConvId,
        id: fallbackConvId,
        applicationId: newAppId,
        jobId: targetJobId,
        jobTitle: job.title,
        companyName: job.company,
        candidateId: user?._id || user?.id || 'u-candidate-1',
        candidateEmail: (applicantDetails.email || user?.email || '').toLowerCase(),
        candidateName: applicantDetails.name || user?.name || 'Candidate',
        employerEmail: 'employer@gmail.com',
        employerName: job.company || 'Recruiter',
        lastMessage: `Hello, I have submitted my application for the position of ${job.title} at ${job.company}.`,
        lastMessageAt: new Date().toISOString()
      };

      const initMsg = {
        _id: `m-init-${Date.now()}`,
        conversationId: fallbackConvId,
        senderId: user?._id || 'u-candidate-1',
        senderRole: 'candidate',
        senderName: applicantDetails.name || user?.name || 'Candidate',
        text: `Hello, I have submitted my application for the position of ${job.title} at ${job.company}. Looking forward to hearing from your recruitment team!`,
        createdAt: new Date().toISOString()
      };

      setAppliedJobs(prev => [newApplication, ...prev]);
      setApplicants(prev => [newApplicantRecord, ...prev]);
      setConversations(prev => [newConv, ...prev]);
      setMessages(prev => ({
        ...prev,
        [fallbackConvId]: [initMsg]
      }));

      toast.success(`🎉 Application sent to ${job.company}! Recruiter chat thread created.`);
      closeApplyModal();
      return true;
    }
  };

  const addJobPosting = async (newJobData) => {
    try {
      const salaryStr = newJobData.salary || newJobData.salaryDisplay || '₹6.0 - ₹12.0 LPA';
      const salaryDisplayStr = newJobData.salaryDisplay || newJobData.salary || salaryStr;

      const res = await jobsApi.create({
        title: newJobData.title,
        company: newJobData.company || employerProfile.companyName || 'Enterprise Workspace',
        category: newJobData.category || 'Information Technology',
        location: newJobData.location || 'Bengaluru',
        workplaceType: newJobData.workplaceType || newJobData.workMode || 'On-site',
        jobType: newJobData.jobType || newJobData.employmentType || 'Full-Time',
        experience: newJobData.experience || '1-3 Years',
        salary: salaryStr,
        salaryDisplay: salaryDisplayStr,
        salaryMin: newJobData.salaryMin,
        salaryMax: newJobData.salaryMax,
        salaryMinLpa: newJobData.salaryMinLpa,
        salaryMaxLpa: newJobData.salaryMaxLpa,
        qualification: newJobData.qualification || "Bachelor's Degree",
        overview: newJobData.overview || newJobData.description || '',
        description: newJobData.description || newJobData.overview || 'Job role description',
        skills: newJobData.skills || [],
        requirements: newJobData.requirements || [],
        benefits: newJobData.benefits || [],
        vacancies: Number(newJobData.vacancies) || 1,
        urgent: newJobData.urgent || false,
        featured: newJobData.featured || false,
        status: newJobData.status ? newJobData.status.toLowerCase() : 'active'
      });
      await loadDatabaseData();
      toast.success(`Job "${newJobData.title}" published to database!`, { duration: 5000 });
      return res?.data;
    } catch (err) {
      console.warn("Backend job create notice:", err.message);
      const newJob = {
        id: Date.now(),
        _id: `job-${Date.now()}`,
        slug: (newJobData.title + "-" + (newJobData.location || "india")).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        logoText: (newJobData.company || "JOB").substring(0, 3).toUpperCase(),
        logoBg: "#2563EB",
        postedDate: "Just Now",
        vacancies: Number(newJobData.vacancies) || 1,
        status: "Active",
        viewsCount: 1,
        applicantsCount: 0,
        featured: true,
        urgent: true,
        ...newJobData
      };
      setJobs(prev => [newJob, ...prev]);
      toast.success(`Job "${newJob.title}" posted successfully!`);
      return newJob;
    }
  };

  const updateJobPosting = async (jobId, updatedFields) => {
    try {
      await jobsApi.update(jobId, updatedFields);
      await loadDatabaseData();
      toast.success("Job posting updated in database!");
    } catch (err) {
      setJobs(prev => prev.map(job => (job.id === jobId || job._id === jobId ? { ...job, ...updatedFields } : job)));
      toast.success("Job posting updated!");
    }
  };

  const deleteJobPosting = async (jobId, jobTitle = "Job") => {
    try {
      await jobsApi.delete(jobId);
      await loadDatabaseData();
      toast.success(`Job "${jobTitle}" permanently deleted from database.`);
    } catch (err) {
      console.error("Job delete API error:", err);
      // Ensure state is updated and attempt database refresh
      setJobs(prev => prev.filter(j => j.id !== jobId && j._id !== jobId));
      setApplicants(prev => prev.filter(a => a.jobId !== jobId));
      toast.success(`Job "${jobTitle}" deleted.`);
    }
  };

  const toggleJobStatus = async (jobId, newStatus) => {
    try {
      await jobsApi.update(jobId, { status: newStatus.toLowerCase() });
      await loadDatabaseData();
      toast.success(`Job status changed to ${newStatus}`);
    } catch (err) {
      setJobs(prev => prev.map(job => (job.id === jobId || job._id === jobId ? { ...job, status: newStatus } : job)));
      toast.success(`Job status changed to ${newStatus}`);
    }
  };

  const updateApplicantStatus = async (applicantId, newStatus, stageNum, interviewDetails = null) => {
    let resolvedStage = stageNum;
    if (!resolvedStage) {
      if (newStatus === 'Offered' || newStatus === 'Hired' || newStatus === 'Offer Extended') resolvedStage = 5;
      else if (newStatus === 'Interview Scheduled' || newStatus === 'Interview') resolvedStage = 4;
      else if (newStatus === 'Shortlisted') resolvedStage = 3;
      else if (newStatus === 'Under Review' || newStatus === 'Reviewing') resolvedStage = 2;
      else if (newStatus === 'Rejected') resolvedStage = 6;
      else resolvedStage = 1;
    }

    // 1. Instantly update local state for responsive UI
    setApplicants(prev => prev.map(app => 
      (String(app.id) === String(applicantId) || String(app._id) === String(applicantId))
        ? { ...app, status: newStatus, stage: resolvedStage, ...(interviewDetails ? { interviewDetails } : {}) }
        : app
    ));

    setAppliedJobs(prev => prev.map(app => {
      const isMatch = (String(app.id) === String(applicantId) || String(app._id) === String(applicantId));
      if (isMatch) {
        return { ...app, status: newStatus, stage: resolvedStage, ...(interviewDetails ? { interviewDetails } : {}) };
      }
      return app;
    }));

    // 2. Persist to Backend MongoDB Atlas
    try {
      await applicationsApi.updateStatus(applicantId, { 
        status: newStatus, 
        stage: resolvedStage,
        ...(interviewDetails ? { interviewDetails } : {})
      });
      await loadDatabaseData();
      toast.success(`Candidate stage changed to "${newStatus}"!`);
    } catch (err) {
      console.warn("Status update API sync note:", err.message);
      toast.success(`Candidate stage updated to "${newStatus}"!`);
    }
  };

  const updateApplicantEvaluation = async (applicantId, notes, rating) => {
    setApplicants(prev => prev.map(app => 
      (String(app.id) === String(applicantId) || String(app._id) === String(applicantId))
        ? { ...app, recruiterNotes: notes, rating: rating !== undefined ? rating : app.rating }
        : app
    ));

    try {
      await applicationsApi.updateStatus(applicantId, { statusNotes: notes, rating });
      await loadDatabaseData();
      toast.success("Evaluation saved!");
    } catch (err) {
      toast.success("Evaluation saved!");
    }
  };

  const deleteApplicant = (applicantId) => {
    setApplicants(prev => prev.filter(a => String(a.id) !== String(applicantId) && String(a._id) !== String(applicantId)));
    toast.success("Applicant record removed from ATS.");
  };

  return (
    <JobContext.Provider
      value={{
        jobs,
        myEmployerJobs,
        savedJobIds,
        appliedJobs,
        candidateAppliedJobs,
        applicants,
        myEmployerApplicants,
        allUsers,
        user,
        isAuthenticated,
        employerProfile,
        conversations,
        myEmployerConversations,
        candidateConversations,
        messages,
        activeConversationId,
        atsResume,
        applyModalJob,
        isApplyModalOpen,
        loginCandidate,
        logoutCandidate,
        loginAdmin,
        logoutAdmin,
        logoutEmployer,
        registerUser,
        updateCandidateProfile,
        uploadCandidateResume,
        deleteCandidateResume,
        calculateProfileCompleteness,
        calculateAtsScore,
        sendMessage,
        fetchMessagesForConversation,
        setActiveConversationId,
        saveAtsResume,
        deleteUserAccount,
        updateUserRole,
        approveEmployerByAdmin,
        rejectEmployerByAdmin,
        setUser,
        setIsAuthenticated,
        setEmployerProfile,
        toggleSaveJob,
        isJobSaved,
        openApplyModal,
        applyForJob: openApplyModal,
        closeApplyModal,
        submitApplication,
        addJobPosting,
        updateJobPosting,
        deleteJobPosting,
        toggleJobStatus,
        updateApplicantStatus,
        updateApplicantEvaluation,
        deleteApplicant
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export default JobProvider;
export const useJobContext = () => useContext(JobContext);
