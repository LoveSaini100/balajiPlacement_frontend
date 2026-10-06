import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Briefcase, 
  Search, 
  Eye, 
  Building2, 
  X, 
  ChevronRight, 
  Mail, 
  MapPin, 
  Globe, 
  Menu, 
  BarChart3, 
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  UserCheck,
  Users2,
  FileText,
  Trash2,
  Sparkles,
  Printer,
  Filter,
  TrendingUp,
  Settings,
  Info,
  LogOut,
  Download,
  Plus,
  MessageSquare,
  Activity,
  Phone,
  PhoneCall
} from 'lucide-react';
import toast from 'react-hot-toast';
import logo from '../../assets/logo-bg.png';
import { useJobContext } from '../../context/JobContext';
import { companiesData } from '../../data/companiesData';
import { adminApi, jobsApi, applicationsApi, getBackendFileUrl } from '../../services/api';
import AtsResumeDocument from '../../components/common/AtsResumeDocument';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { 
    jobs, 
    allUsers = [],
    applicants: contextApplicants = [],
    approveEmployerByAdmin,
    rejectEmployerByAdmin,
    logoutAdmin 
  } = useJobContext();

  // Navigation State
  const [activeSection, setActiveSection] = useState('dashboard'); // dashboard, employers, users, jobs, applications, companies, inquiries, settings
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Modals & Drilldown State
  const [selectedJobDetails, setSelectedJobDetails] = useState(null);
  const [selectedCompanyView, setSelectedCompanyView] = useState(null);
  const [selectedCompanyModal, setSelectedCompanyModal] = useState(null);

  // Filters State for Companies
  const [companySearch, setCompanySearch] = useState('');
  const [companyIndustryFilter, setCompanyIndustryFilter] = useState('All');
  const [companyVerificationFilter, setCompanyVerificationFilter] = useState('All');

  // Filters State for Jobs
  const [jobSearch, setJobSearch] = useState('');
  const [jobCompanyFilter, setJobCompanyFilter] = useState('All');
  const [jobCategoryFilter, setJobCategoryFilter] = useState('All');
  const [jobLocationFilter, setJobLocationFilter] = useState('All');

  // Live Database Sync State (MongoDB Atlas)
  const [dbStats, setDbStats] = useState(null);
  const [dbUsers, setDbUsers] = useState([]);
  const [dbEmployers, setDbEmployers] = useState([]);
  const [dbApplications, setDbApplications] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingEmployers, setIsLoadingEmployers] = useState(false);

  // User Management State
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [userSearch, setUserSearch] = useState('');
  const [selectedCandidateResume, setSelectedCandidateResume] = useState(null);

  // Application Pipeline State
  const [applicationStatusFilter, setApplicationStatusFilter] = useState('All');
  const [applicationSearch, setApplicationSearch] = useState('');

  // Employer Verification State
  const [employerStatusFilter, setEmployerStatusFilter] = useState('All');
  const [employerSearch, setEmployerSearch] = useState('');
  const [rejectingEmployer, setRejectingEmployer] = useState(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');

  // Master live synchronizer with MongoDB Atlas
  const loadAllAdminData = async (showToast = false) => {
    setIsSyncing(true);
    try {
      const [statsRes, usersRes, empRes, appsRes] = await Promise.allSettled([
        adminApi.getStats(),
        adminApi.getUsers(),
        adminApi.getEmployers(),
        applicationsApi.getEmployerApplications()
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        setDbStats(statsRes.value.data);
      }
      if (usersRes.status === 'fulfilled' && usersRes.value?.data) {
        setDbUsers(usersRes.value.data);
      }
      if (empRes.status === 'fulfilled' && empRes.value?.data) {
        setDbEmployers(empRes.value.data);
      }
      if (appsRes.status === 'fulfilled' && appsRes.value?.data) {
        setDbApplications(appsRes.value.data);
      }
      if (showToast) {
        toast.success("Live database metrics synchronized from MongoDB Atlas!", { duration: 4000 });
      }
    } catch (err) {
      console.warn("Live admin data sync notice:", err.message);
    } finally {
      setIsSyncing(false);
      setIsLoadingEmployers(false);
    }
  };

  React.useEffect(() => {
    loadAllAdminData(false);
  }, []);

  // Combined Employers (API + Context)
  const combinedEmployers = useMemo(() => {
    const list = [...dbEmployers];
    allUsers.filter(u => u.role === 'employer').forEach(u => {
      const exists = list.some(e => String(e._id || e.id) === String(u._id || u.id) || e.email?.toLowerCase() === u.email?.toLowerCase());
      if (!exists) list.push(u);
    });
    return list;
  }, [dbEmployers, allUsers]);

  const pendingEmployersCount = combinedEmployers.filter(e => 
    !e.isApproved || e.employerProfile?.verificationStatus === 'pending' || e.status === 'pending'
  ).length;

  // Filtered Employers
  const filteredEmployers = useMemo(() => {
    return combinedEmployers.filter(emp => {
      const cName = (emp.employerProfile?.companyName || emp.companyName || emp.name || '').toLowerCase();
      const rName = (emp.name || '').toLowerCase();
      const rEmail = (emp.email || '').toLowerCase();
      const rPhone = (emp.phone || emp.employerProfile?.companyPhone || '').toLowerCase();
      const q = employerSearch.toLowerCase();
      const matchSearch = cName.includes(q) || rName.includes(q) || rEmail.includes(q) || rPhone.includes(q);

      const isApproved = emp.isApproved && (emp.employerProfile?.verificationStatus === 'approved' || emp.status === 'approved');
      const isRejected = emp.employerProfile?.verificationStatus === 'rejected' || emp.status === 'rejected';
      const isPending = !isApproved && !isRejected;

      let matchFilter = true;
      if (employerStatusFilter === 'Pending') matchFilter = isPending;
      else if (employerStatusFilter === 'Approved') matchFilter = isApproved;
      else if (employerStatusFilter === 'Rejected') matchFilter = isRejected;

      return matchSearch && matchFilter;
    });
  }, [combinedEmployers, employerSearch, employerStatusFilter]);

  // Combined Users List (API + Context)
  const combinedUsers = useMemo(() => {
    const list = [...dbUsers];
    allUsers.forEach(u => {
      const exists = list.some(e => String(e._id || e.id) === String(u._id || u.id) || e.email?.toLowerCase() === u.email?.toLowerCase());
      if (!exists) list.push(u);
    });
    return list;
  }, [dbUsers, allUsers]);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return combinedUsers.filter(u => {
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const phone = (u.phone || '').toLowerCase();
      const title = (u.candidateProfile?.title || u.title || '').toLowerCase();
      const comp = (u.employerProfile?.companyName || u.companyName || '').toLowerCase();
      const q = userSearch.toLowerCase();

      const matchSearch = !q || name.includes(q) || email.includes(q) || phone.includes(q) || title.includes(q) || comp.includes(q);
      const matchRole = userRoleFilter === 'All' || u.role === userRoleFilter.toLowerCase();

      return matchSearch && matchRole;
    });
  }, [combinedUsers, userSearch, userRoleFilter]);

  // Combined Applications List (API + Context)
  const combinedApplications = useMemo(() => {
    const list = [...dbApplications];
    contextApplicants.forEach(a => {
      const exists = list.some(item => String(item._id || item.id) === String(a._id || a.id));
      if (!exists) list.push(a);
    });
    return list;
  }, [dbApplications, contextApplicants]);

  // Filtered Applications List
  const filteredApplications = useMemo(() => {
    return combinedApplications.filter(app => {
      const cName = (app.applicantName || app.name || app.candidateName || '').toLowerCase();
      const email = (app.applicantEmail || app.email || '').toLowerCase();
      const jobTitle = (app.jobTitle || app.jobId?.title || '').toLowerCase();
      const comp = (app.companyName || app.company || '').toLowerCase();
      const q = applicationSearch.toLowerCase();

      const matchSearch = !q || cName.includes(q) || email.includes(q) || jobTitle.includes(q) || comp.includes(q);
      const currentStatus = (app.status || 'Applied').toLowerCase();
      const matchStatus = applicationStatusFilter === 'All' || 
        (applicationStatusFilter === 'Applied' && (currentStatus === 'applied' || app.stage === 1)) ||
        (applicationStatusFilter === 'Under Review' && (currentStatus.includes('review') || app.stage === 2)) ||
        (applicationStatusFilter === 'Shortlisted' && (currentStatus.includes('shortlist') || app.stage === 3)) ||
        (applicationStatusFilter === 'Interview' && (currentStatus.includes('interview') || app.stage === 4)) ||
        (applicationStatusFilter === 'Hired' && (currentStatus.includes('hired') || currentStatus.includes('offer') || app.stage === 5));

      return matchSearch && matchStatus;
    });
  }, [combinedApplications, applicationSearch, applicationStatusFilter]);

  const handleApproveEmployerClick = async (employerId) => {
    const res = await approveEmployerByAdmin(employerId);
    if (res?.success) {
      setDbEmployers(prev => prev.map(e => (String(e._id) === String(employerId) || String(e.id) === String(employerId)) ? { ...e, isApproved: true, status: 'approved', employerProfile: { ...e.employerProfile, isVerifiedCompany: true, verificationStatus: 'approved' } } : e));
      loadAllAdminData(false);
    }
  };

  const handleRejectEmployerClick = async (employerId, reason) => {
    const res = await rejectEmployerByAdmin(employerId, reason);
    if (res?.success) {
      setDbEmployers(prev => prev.map(e => (String(e._id) === String(employerId) || String(e.id) === String(employerId)) ? { ...e, isApproved: false, status: 'rejected', employerProfile: { ...e.employerProfile, isVerifiedCompany: false, verificationStatus: 'rejected', rejectionReason: reason } } : e));
      setRejectingEmployer(null);
      setRejectionReasonText('');
      loadAllAdminData(false);
    }
  };

  const handleDeleteUserClick = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}" from the database?`)) return;
    try {
      await adminApi.deleteUser(userId);
      setDbUsers(prev => prev.filter(u => String(u._id || u.id) !== String(userId)));
      toast.success(`User "${userName}" removed from database.`);
      loadAllAdminData(false);
    } catch (err) {
      toast.error(err.message || "Failed to delete user");
    }
  };

  // Inquiries State
  const [inquiries, setInquiries] = useState([
    {
      id: 'inq-101',
      clientName: 'Sun Pharmaceutical Industries',
      contactPerson: 'Dr. Vivek Mehra',
      email: 'hiring.pune@sunpharma.com',
      phone: '+91 98231 44550',
      serviceRequested: 'Bulk Production Chemist & QA Hiring (40+ Roles)',
      estimatedPositions: 45,
      date: '28 Sep 2026',
      status: 'In Discussion',
      notes: 'Initial requirements shared. Scheduled Zoom discussion for commercial agreement.'
    },
    {
      id: 'inq-102',
      clientName: 'Capgemini Technology Services',
      contactPerson: 'Pooja Iyer',
      email: 'pooja.iyer@capgemini.com',
      phone: '+91 98112 33445',
      serviceRequested: 'Senior Full Stack & Cloud Engineers Recruitment',
      estimatedPositions: 15,
      date: '27 Sep 2026',
      status: 'New Lead',
      notes: 'Inquiry received via Contact form requesting immediate talent sourcing.'
    },
    {
      id: 'inq-103',
      clientName: 'Bajaj Auto Precision Ltd',
      contactPerson: 'Rajesh Kulkarni',
      email: 'talent@bajajauto.co.in',
      phone: '+91 97654 11223',
      serviceRequested: 'Chakan Plant Mechanical & Quality Engineers Hiring',
      estimatedPositions: 30,
      date: '25 Sep 2026',
      status: 'Onboarded Partner',
      notes: 'Agreement signed. Jobs posted live on portal.'
    },
    {
      id: 'inq-104',
      clientName: 'Cognizant Digital Works',
      contactPerson: 'Arun Nair',
      email: 'arun.nair@cognizant.com',
      phone: '+91 99001 88776',
      serviceRequested: 'React & Node.js Developer Pool (Campus & Lateral)',
      estimatedPositions: 25,
      date: '22 Sep 2026',
      status: 'Proposal Sent',
      notes: 'Proposal sent with talent delivery timeline and rate card.'
    }
  ]);

  const [inquiryFilterStatus, setInquiryFilterStatus] = useState('All');

  // Portal Settings & Audit State
  const [settings, setSettings] = useState({
    portalName: 'Balaji Placements Corporate Governance',
    adminEmail: 'info@jobsetu.net',
    supportPhone: '+91 75000 55715',
    maintenanceMode: false,
    autoEmailAlerts: true,
    allowPublicRegistration: true
  });

  const [auditLogs] = useState([
    { id: 1, action: 'Admin Login Successful', user: 'admin@balajiplacement.com', ip: '192.168.1.25', timestamp: 'Today, 02:45 PM', status: 'Success' },
    { id: 2, action: 'Company Verification Status Updated', user: 'admin@balajiplacement.com', ip: '192.168.1.25', timestamp: 'Today, 01:20 PM', status: 'Verified' },
    { id: 3, action: 'Platform Analytics Synchronized', user: 'System Worker', ip: '127.0.0.1', timestamp: 'Today, 11:00 AM', status: 'Success' },
    { id: 4, action: 'Database Index Optimization', user: 'MongoDB Atlas', ip: 'Cluster-0', timestamp: 'Yesterday, 11:30 PM', status: 'Completed' }
  ]);

  // Verification status overrides stored in state
  const [verifiedCompanyOverrides, setVerifiedCompanyOverrides] = useState({});

  // Base Companies list combining companiesData and any custom employers from jobs
  const companiesList = useMemo(() => {
    const map = new Map();

    companiesData.forEach(comp => {
      const isVerified = verifiedCompanyOverrides[comp.id] !== undefined 
        ? verifiedCompanyOverrides[comp.id] 
        : (comp.verified !== false);

      map.set(comp.name.toLowerCase().trim(), {
        id: comp.id,
        name: comp.name,
        slug: comp.slug,
        logoText: comp.logoText || comp.name.slice(0, 3).toUpperCase(),
        logoBg: comp.logoBg || '#0056B3',
        industry: comp.industry || 'Information Technology',
        location: comp.headquarters || comp.locations?.[0] || 'India',
        locations: comp.locations || [comp.headquarters || 'India'],
        website: comp.website || 'https://www.balajiplacement.com',
        recruiter: `careers@${comp.slug?.replace(/-/g, '') || 'company'}.com`,
        employees: comp.employees || '10,000+ employees',
        founded: comp.founded || '2000',
        tagline: comp.tagline || 'Leading Enterprise Partner',
        description: comp.description || 'Verified hiring organization on Balaji Placements.',
        verified: isVerified
      });
    });

    jobs.forEach(j => {
      const compName = (j.company || '').trim();
      if (compName && !map.has(compName.toLowerCase())) {
        const slug = compName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const id = `comp-${slug}`;
        const isVerified = verifiedCompanyOverrides[id] !== undefined 
          ? verifiedCompanyOverrides[id] 
          : true;

        map.set(compName.toLowerCase(), {
          id: id,
          name: compName,
          slug: slug,
          logoText: compName.slice(0, 3).toUpperCase(),
          logoBg: '#1E293B',
          industry: j.category || 'General Industry',
          location: j.location || 'India',
          locations: [j.location || 'India'],
          website: 'https://www.balajiplacement.com',
          recruiter: `hr@${slug}.com`,
          employees: '1,000+ employees',
          founded: '2010',
          tagline: `Official recruiter profile for ${compName}`,
          description: `${compName} is actively hiring verified talent across India.`,
          verified: isVerified
        });
      }
    });

    return Array.from(map.values()).map(comp => {
      const compJobs = jobs.filter(j => {
        const jComp = (j.company || '').toLowerCase().trim();
        const cName = comp.name.toLowerCase().trim();
        const cSlug = (comp.slug || '').toLowerCase().trim();
        const jSlug = (j.companySlug || '').toLowerCase().trim();
        return jComp === cName || (jSlug && jSlug === cSlug) || jComp.includes(cName) || cName.includes(jComp);
      });

      return {
        ...comp,
        uploadedJobs: compJobs,
        jobsCount: compJobs.length
      };
    });
  }, [jobs, verifiedCompanyOverrides]);

  // Toggle company verification
  const handleToggleVerification = (companyId, companyName) => {
    setVerifiedCompanyOverrides(prev => {
      const current = prev[companyId] !== undefined ? prev[companyId] : true;
      const next = !current;
      toast.success(next ? `Partner "${companyName}" verified & authenticated!` : `Verification paused for "${companyName}"`);
      return { ...prev, [companyId]: next };
    });
  };

  // Unique Industries & Locations
  const uniqueIndustries = useMemo(() => {
    const set = new Set(companiesList.map(c => c.industry).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [companiesList]);

  const uniqueJobCategories = useMemo(() => {
    const set = new Set(jobs.map(j => j.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [jobs]);

  const uniqueJobLocations = useMemo(() => {
    const set = new Set(jobs.map(j => j.location).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [jobs]);

  const uniqueCompanies = useMemo(() => {
    return ['All', ...companiesList.map(c => c.name)];
  }, [companiesList]);

  // Filtered Companies
  const filteredCompanies = useMemo(() => {
    return companiesList.filter(comp => {
      const query = (companySearch || globalSearch).toLowerCase().trim();
      const matchesSearch = !query || 
        comp.name.toLowerCase().includes(query) ||
        comp.industry.toLowerCase().includes(query) ||
        comp.location.toLowerCase().includes(query);
      const matchesIndustry = companyIndustryFilter === 'All' || comp.industry === companyIndustryFilter;
      const matchesVerified = companyVerificationFilter === 'All' || 
        (companyVerificationFilter === 'Verified' ? comp.verified : !comp.verified);
      return matchesSearch && matchesIndustry && matchesVerified;
    });
  }, [companiesList, companySearch, globalSearch, companyIndustryFilter, companyVerificationFilter]);

  // Filtered Jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const query = (jobSearch || globalSearch).toLowerCase().trim();
      const matchesSearch = !query || 
        (job.title && job.title.toLowerCase().includes(query)) ||
        (job.company && job.company.toLowerCase().includes(query)) ||
        (job.location && job.location.toLowerCase().includes(query)) ||
        (job.category && job.category.toLowerCase().includes(query));
      
      const matchesCompany = jobCompanyFilter === 'All' || 
        (job.company && job.company.toLowerCase() === jobCompanyFilter.toLowerCase());
      const matchesCategory = jobCategoryFilter === 'All' || job.category === jobCategoryFilter;
      const matchesLocation = jobLocationFilter === 'All' || job.location === jobLocationFilter;

      return matchesSearch && matchesCompany && matchesCategory && matchesLocation;
    });
  }, [jobs, jobSearch, globalSearch, jobCompanyFilter, jobCategoryFilter, jobLocationFilter]);

  // Filtered Inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter(inq => {
      const matchesStatus = inquiryFilterStatus === 'All' || inq.status === inquiryFilterStatus;
      const query = globalSearch.toLowerCase().trim();
      const matchesSearch = !query || 
        inq.clientName.toLowerCase().includes(query) ||
        inq.contactPerson.toLowerCase().includes(query) ||
        inq.serviceRequested.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [inquiries, inquiryFilterStatus, globalSearch]);

  // Skill Demand Breakdown from Live Jobs
  const skillDemandAnalytics = useMemo(() => {
    const counts = {};
    jobs.forEach(j => {
      const skillsArr = Array.isArray(j.skills) 
        ? j.skills 
        : (typeof j.skills === 'string' ? j.skills.split(',') : []);
      skillsArr.forEach(s => {
        const cleaned = s.trim();
        if (cleaned) {
          counts[cleaned] = (counts[cleaned] || 0) + 1;
        }
      });
    });

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return sorted.length > 0 ? sorted : [
      ['React.js', 14],
      ['Node.js', 12],
      ['Java / Spring', 10],
      ['Python / AI', 9],
      ['Cloud / AWS', 8],
      ['Quality & Testing', 7]
    ];
  }, [jobs]);

  // Top Hiring Hubs / Cities
  const topHiringHubs = useMemo(() => {
    const counts = {};
    jobs.forEach(j => {
      const loc = (j.location || 'Pune').split(',')[0].trim();
      counts[loc] = (counts[loc] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [jobs]);

  // Dashboard Stats Calculations
  const stats = useMemo(() => {
    const totalCompanies = companiesList.length;
    const verifiedCompanies = companiesList.filter(c => c.verified).length;
    const totalUploadedJobs = jobs.length;
    const activeJobs = jobs.filter(j => (j.status || 'Active') === 'Active').length;
    const pendingInquiries = inquiries.filter(i => i.status === 'New Lead' || i.status === 'In Discussion').length;

    return {
      totalCompanies,
      verifiedCompanies,
      totalUploadedJobs,
      activeJobs,
      pendingInquiries
    };
  }, [companiesList, jobs, inquiries]);

  // CSV Export Handler
  const handleExportCompaniesCSV = () => {
    const headers = ["Company Name", "Industry", "HQ Location", "Recruiter Email", "Website", "Uploaded Jobs Count", "Verification"];
    const rows = companiesList.map(c => [
      `"${c.name}"`,
      `"${c.industry}"`,
      `"${c.location}"`,
      `"${c.recruiter}"`,
      `"${c.website}"`,
      c.jobsCount,
      c.verified ? "Verified Partner" : "Pending Verification"
    ].join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `balaji_partner_companies_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Partner companies directory exported as CSV!");
  };

  const handleExportJobsCSV = () => {
    const headers = ["Job Title", "Company", "Category", "Location", "Work Mode", "Salary", "Experience", "Status"];
    const rows = jobs.map(j => [
      `"${j.title}"`,
      `"${j.company || 'Enterprise Partner'}"`,
      `"${j.category || 'General'}"`,
      `"${j.location}"`,
      `"${j.workMode || j.jobType || 'Full-Time'}"`,
      `"${j.salary || 'Competitive'}"`,
      `"${j.experience || '2+ Years'}"`,
      `"${j.status || 'Active'}"`
    ].join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `balaji_uploaded_jobs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("All uploaded jobs exported as CSV!");
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    toast.success('Admin portal configuration and security parameters updated!');
  };

  const handleUpdateInquiryStatus = (inquiryId, newStatus) => {
    setInquiries(prev => prev.map(i => i.id === inquiryId ? { ...i, status: newStatus } : i));
    toast.success(`Inquiry status changed to: ${newStatus}`);
  };

  // Nav items definition
  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: BarChart3, badge: null },
    { id: 'employers', label: 'Employer Approvals', icon: ShieldCheck, badge: pendingEmployersCount },
    { id: 'users', label: 'Users & Candidates', icon: Users2, badge: (dbStats?.totalCandidates || dbUsers.filter(u => u.role === 'candidate').length) },
    { id: 'jobs', label: 'Uploaded Jobs', icon: Briefcase, badge: (dbStats?.totalJobs || jobs.length) },
    { id: 'applications', label: 'ATS Pipeline', icon: UserCheck, badge: (dbStats?.totalApplications || combinedApplications.length) },
    { id: 'companies', label: 'Partner Companies', icon: Building2, badge: companiesList.length },
    { id: 'inquiries', label: 'Client Inquiries', icon: MessageSquare, badge: stats.pendingInquiries },
    { id: 'settings', label: 'Security & Settings', icon: Settings, badge: null }
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-[#090D16] flex flex-col font-sans antialiased">
      
      {/* ── TOP NAVBAR ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Left: Mobile Toggle & Brand */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                aria-label="Toggle Navigation Sidebar"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link to="/admin" className="flex items-center gap-3 group">
                <img 
                  src={logo} 
                  alt="Balaji Placements" 
                  className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105" 
                />
              </Link>
            </div>

            {/* Center: Global Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Quick search companies, uploaded jobs, client inquiries..."
                  value={globalSearch}
                  onChange={(e) => {
                    setGlobalSearch(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-[#2563EB] rounded-xl outline-none text-slate-900 transition-all font-medium"
                />
                {globalSearch && (
                  <button 
                    onClick={() => setGlobalSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Right: Live Status, Quick Links & Admin User */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Online Pill */}
              <div className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>MongoDB Atlas Live</span>
              </div>

              {/* Candidate Portal Link */}
              <Link
                to="/"
                className="hidden lg:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 transition-all shadow-2xs"
                title="View Live Jobseeker Site"
              >
                <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Jobseeker Site</span>
              </Link>

              {/* Employer Portal Link */}
              <Link
                to="/employer/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 transition-all shadow-2xs"
                title="View Employer Portal"
              >
                <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Employer ATS</span>
              </Link>

              {/* Live Refresh Status */}
              <button
                onClick={() => loadAllAdminData(true)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                title="Refresh Live Database Data"
                aria-label="Refresh status"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-[#2563EB]' : ''}`} />
              </button>

              {/* Admin Avatar & Logout */}
              <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2563EB] to-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  A
                </div>
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-950 leading-tight">Master Admin</span>
                  <span className="text-[10px] text-slate-400 font-medium leading-tight">Governance Console</span>
                </div>
                <button
                  onClick={() => {
                    logoutAdmin();
                    navigate('/admin/login');
                  }}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer ml-1"
                  title="Log out of Admin Console"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* ── MAIN DASHBOARD BODY (Sidebar + Content) ── */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 gap-6">
        
        {/* ── SIDEBAR NAVIGATION (Desktop & Mobile Drawer) ── */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 p-4 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:w-60 lg:p-0 lg:bg-transparent lg:border-r-0 lg:z-auto shrink-0
          ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}>
          
          {/* Mobile Sidebar Close Button */}
          <div className="flex items-center justify-between lg:hidden mb-4 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
              <span className="text-sm font-bold text-slate-950">Admin Menu</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white lg:rounded-2xl lg:border lg:border-slate-200 lg:p-2.5 lg:shadow-xs space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Governance Menu
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSelectedCompanyView(null);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      active ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#2563EB]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Actions Card */}
          <div className="hidden lg:block mt-4 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs text-xs space-y-2.5">
            <div className="flex items-center gap-2 text-[#2563EB] font-bold">
              <Download className="w-3.5 h-3.5" />
              <span>Export Platform Data</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Download clean CSV records of corporate partners and active job requisitions.
            </p>
            <div className="space-y-1.5 pt-1">
              <button
                onClick={handleExportCompaniesCSV}
                className="w-full py-1.5 px-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#2563EB] font-semibold text-[11px] rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Building2 className="w-3 h-3" />
                <span>Companies CSV</span>
              </button>
              <button
                onClick={handleExportJobsCSV}
                className="w-full py-1.5 px-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#2563EB] font-semibold text-[11px] rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Briefcase className="w-3 h-3" />
                <span>Uploaded Jobs CSV</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT WORKSPACE ── */}
        <main className="flex-1 min-w-0 space-y-6">
          
          <AnimatePresence mode="wait">
            
            {/* ══════════════════════════════════════════════════════
                1. SECTION: DASHBOARD OVERVIEW & MARKET INTELLIGENCE
               ══════════════════════════════════════════════════════ */}
            {activeSection === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* Welcome Banner */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Balaji Placements Executive Oversight
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                      Platform Operations & Market Intelligence
                    </h1>
                    <p className="text-xs text-slate-500">
                      Real-time visibility into hiring partner companies, uploaded job openings, and inbound corporate inquiries.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setActiveSection('inquiries');
                      }}
                      className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Client Inquiries ({stats.pendingInquiries})</span>
                    </button>
                  </div>
                </div>

                {/* KPI Metrics Strip (Live MongoDB Atlas Database) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                  
                  {/* Card 1: Registered Candidates */}
                  <div 
                    onClick={() => {
                      setActiveSection('users');
                      setUserRoleFilter('candidate');
                    }}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#2563EB] hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500">Registered Candidates</span>
                      <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold">
                        <Users2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-950">
                      {dbStats?.totalCandidates ?? dbUsers.filter(u => u.role === 'candidate').length}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                      <span className="text-blue-600 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                        {dbUsers.filter(u => u.role === 'candidate' && (u.candidateProfile?.resumeUrl || u.candidateProfile?.resumeName || u.resumeName)).length} Verified Resumes
                      </span>
                      <span className="text-slate-400 group-hover:text-[#2563EB] font-bold">Inspect →</span>
                    </div>
                  </div>

                  {/* Card 2: Registered Employers & Verification Queue */}
                  <div 
                    onClick={() => setActiveSection('employers')}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#2563EB] hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500">Registered Employers</span>
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <Building2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-950">
                      {dbStats?.totalEmployers ?? combinedEmployers.length}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                      <span className={`font-bold ${pendingEmployersCount > 0 ? 'text-amber-600 font-extrabold' : 'text-emerald-600'}`}>
                        {pendingEmployersCount > 0 ? `⏳ ${pendingEmployersCount} Pending Approval` : `✓ All Verified`}
                      </span>
                      <span className="text-slate-400 group-hover:text-[#2563EB] font-bold">Approvals →</span>
                    </div>
                  </div>

                  {/* Card 3: Uploaded Jobs */}
                  <div 
                    onClick={() => setActiveSection('jobs')}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#2563EB] hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500">Live Database Jobs</span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <Briefcase className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-950">
                      {dbStats?.totalJobs ?? jobs.length}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                      <span className="text-emerald-600 font-bold">
                        {dbStats?.activeJobs ?? jobs.filter(j => (j.status || 'Active') === 'Active').length} Active Requisitions
                      </span>
                      <span className="text-slate-400 group-hover:text-[#2563EB] font-bold">Browse →</span>
                    </div>
                  </div>

                  {/* Card 4: Candidate Applications & ATS Pipeline */}
                  <div 
                    onClick={() => setActiveSection('applications')}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#2563EB] hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500">Candidate Applications</span>
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        <UserCheck className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-950">
                      {dbStats?.totalApplications ?? combinedApplications.length}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                      <span className="text-purple-600 font-bold">
                        {dbStats?.pipeline?.hired ?? combinedApplications.filter(a => a.status === 'Hired' || a.stage === 5).length} Placed / Hired
                      </span>
                      <span className="text-slate-400 group-hover:text-[#2563EB] font-bold">Pipeline →</span>
                    </div>
                  </div>

                </div>

                {/* Market Intelligence Strip: Top Skills in Demand & Top Cities */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Skill Demand Breakdown */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#2563EB]" />
                        <h3 className="text-sm font-extrabold text-slate-950">Top Skills in Corporate Demand</h3>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">Aggregated from Live Jobs</span>
                    </div>

                    <div className="space-y-2.5">
                      {skillDemandAnalytics.map(([skill, count], idx) => {
                        const maxCount = skillDemandAnalytics[0][1] || 1;
                        const percent = Math.round((count / maxCount) * 100);
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span className="text-slate-800">{skill}</span>
                              <span className="text-[#2563EB] font-bold">{count} Openings</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-[#2563EB] to-blue-500 rounded-full transition-all duration-500" 
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top Hiring Hubs / Cities */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          <h3 className="text-sm font-extrabold text-slate-950">Primary Hiring Locations</h3>
                        </div>
                        <span className="text-[11px] font-bold text-slate-400">Active Job Hubs</span>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {topHiringHubs.map(([city, count], idx) => (
                          <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                                {idx + 1}
                              </div>
                              <span className="font-bold text-slate-900">{city}</span>
                            </div>
                            <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              {count} Jobs Listed
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Live Maharashtra, Delhi NCR & Bengaluru Hubs</span>
                      <span className="text-emerald-600 font-bold">100% Operational</span>
                    </div>
                  </div>

                </div>

                {/* Split Overview: Partner Companies Preview & Recently Uploaded Jobs */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Top Hiring Partner Companies */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#2563EB]" />
                          <h3 className="text-sm font-extrabold text-slate-950">Top Hiring Partner Companies</h3>
                        </div>
                        <button 
                          onClick={() => {
                            setActiveSection('companies');
                            setSelectedCompanyView(null);
                          }}
                          className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                        >
                          View all ({companiesList.length}) →
                        </button>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {companiesList.slice(0, 5).map((comp) => (
                          <div key={comp.id} className="py-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-900 to-blue-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                {comp.logoText || comp.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h4 className="text-xs font-bold text-slate-900 truncate">{comp.name}</h4>
                                  {comp.verified && (
                                    <span className="text-[10px] text-emerald-600 font-bold">✓</span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 truncate">{comp.industry} • {comp.location}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedCompanyView(comp);
                                setActiveSection('companies');
                              }}
                              className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-blue-200 shrink-0 hover:bg-blue-100 cursor-pointer"
                            >
                              {comp.jobsCount} Jobs →
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recently Uploaded Jobs */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-emerald-600" />
                          <h3 className="text-sm font-extrabold text-slate-950">Recently Uploaded Jobs</h3>
                        </div>
                        <button 
                          onClick={() => {
                            setActiveSection('jobs');
                          }}
                          className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                        >
                          View all ({jobs.length}) →
                        </button>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {jobs.slice(0, 5).map((job, jIdx) => (
                          <div key={job.id || job._id || jIdx} className="py-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                                <Briefcase className="w-4 h-4 text-[#2563EB]" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-900 truncate">{job.title}</h4>
                                <p className="text-[11px] text-slate-500 truncate">{job.company} • {job.location}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                {job.salary || 'Competitive'}
                              </span>
                              <button
                                onClick={() => setSelectedJobDetails(job)}
                                className="p-1.5 text-slate-500 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="View Job Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════
                2. SECTION: COMPANIES DIRECTORY & THEIR UPLOADED JOBS
               ══════════════════════════════════════════════════════ */}
            {activeSection === 'companies' && (
              <motion.div
                key="companies"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {!selectedCompanyView ? (
                  <div className="space-y-4">
                    
                    {/* Header Banner */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-0.5">
                          <Building2 className="w-3.5 h-3.5" />
                          Hiring Partners Directory & KYB Verification
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-950">Partner Companies & Employers</h2>
                        <p className="text-xs text-slate-500">
                          Verify partner companies, inspect uploaded job requisitions, and review official recruiter contacts.
                        </p>
                      </div>

                      <button
                        onClick={handleExportCompaniesCSV}
                        className="bg-[#EFF6FF] hover:bg-blue-100 text-[#2563EB] text-xs font-bold px-3.5 py-2 rounded-xl border border-blue-200 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                      <div className="relative w-full">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Filter companies by name, location, keyword..."
                          value={companySearch}
                          onChange={(e) => setCompanySearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#2563EB] rounded-xl outline-none text-slate-900 font-medium"
                        />
                        {companySearch && (
                          <button 
                            onClick={() => setCompanySearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Industry Domain</label>
                          <select
                            value={companyIndustryFilter}
                            onChange={(e) => setCompanyIndustryFilter(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800"
                          >
                            {uniqueIndustries.map(ind => (
                              <option key={ind} value={ind}>{ind}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Verification Status</label>
                          <select
                            value={companyVerificationFilter}
                            onChange={(e) => setCompanyVerificationFilter(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800"
                          >
                            <option value="All">All Verification Statuses</option>
                            <option value="Verified">Verified Trusted Partners Only</option>
                            <option value="Pending">Pending Review Only</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Companies Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredCompanies.map((comp) => (
                        <div 
                          key={comp.id} 
                          className="bg-white rounded-2xl border border-slate-200 hover:border-[#2563EB] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3.5 group"
                        >
                          
                          {/* Company Header & Verification Toggle */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-900 to-blue-900 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                                {comp.logoText || comp.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs sm:text-[13px] font-bold text-slate-950 truncate">{comp.name}</h4>
                                <p className="text-[11px] text-slate-500 truncate">{comp.industry}</p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleToggleVerification(comp.id, comp.name)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 transition-colors cursor-pointer ${
                                comp.verified
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                              }`}
                              title="Click to toggle Partner Verification status"
                            >
                              {comp.verified ? '✓ Verified Partner' : '⏳ Pending Review'}
                            </button>
                          </div>

                          {/* Uploaded Jobs Metric */}
                          <div className="bg-[#EFF6FF] p-2.5 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                            <span className="text-slate-600 text-xs font-semibold">Uploaded Job Requisitions</span>
                            <span className="text-sm font-black text-[#2563EB]">{comp.jobsCount} Openings</span>
                          </div>

                          {/* Company Info Box */}
                          <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">HQ Location:</span>
                              <span className="font-semibold text-slate-800">{comp.location}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Official Contact:</span>
                              <span className="font-medium text-slate-700 truncate max-w-[140px]">{comp.recruiter}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-1 border-t border-slate-100 flex items-center gap-2">
                            <button
                              onClick={() => setSelectedCompanyView(comp)}
                              className="flex-1 py-2 px-3 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <span>Inspect Uploaded Jobs ({comp.jobsCount})</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setSelectedCompanyModal(comp)}
                              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                              title="Company Dossier Details"
                            >
                              <Info className="w-4 h-4" />
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>

                    {filteredCompanies.length === 0 && (
                      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
                        <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                        <h4 className="text-sm font-bold text-slate-800">No companies matched search</h4>
                        <p className="text-xs text-slate-500">Try adjusting your filters or search keywords.</p>
                      </div>
                    )}

                  </div>
                ) : (
                  
                  /* ── TIER 2: DEDICATED COMPANY DETAIL PAGE (Inspect All Uploaded Jobs for Selected Company) ── */
                  <div className="space-y-5">
                    
                    {/* Back Navigation Bar */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setSelectedCompanyView(null)}
                        className="inline-flex items-center gap-2 text-xs font-bold text-[#2563EB] hover:text-blue-800 bg-white hover:bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-200 shadow-2xs transition-colors cursor-pointer"
                      >
                        <span>← Back to All Companies</span>
                      </button>

                      <button
                        onClick={() => handleToggleVerification(selectedCompanyView.id, selectedCompanyView.name)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                          selectedCompanyView.verified
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {selectedCompanyView.verified ? '✓ Verified Partner Company' : '⏳ Pending Verification'}
                      </button>
                    </div>

                    {/* Company Profile Header Banner */}
                    <div className="bg-gradient-to-r from-[#1E40AF] via-[#2563EB] to-[#3B82F6] text-white rounded-2xl p-6 shadow-md border border-blue-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white text-[#2563EB] flex items-center justify-center font-black text-xl shadow-md">
                          {selectedCompanyView.logoText || selectedCompanyView.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-xl sm:text-2xl font-black text-white">{selectedCompanyView.name}</h1>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                              {selectedCompanyView.industry}
                            </span>
                          </div>
                          <p className="text-xs text-blue-100 mt-1">
                            HQ Location: <strong>{selectedCompanyView.location}</strong> • Recruiter Email: <strong>{selectedCompanyView.recruiter}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="bg-white/15 backdrop-blur-xs px-4 py-2 rounded-xl border border-white/20 text-right">
                        <span className="text-[10px] text-blue-100 font-bold block uppercase tracking-wider">Uploaded Jobs</span>
                        <span className="text-lg font-black text-white">{selectedCompanyView.uploadedJobs.length} Positions</span>
                      </div>
                    </div>

                    {/* Company Information Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-bold text-slate-500">Industry & Sector</span>
                        <div className="text-sm font-extrabold text-slate-900 mt-1">{selectedCompanyView.industry}</div>
                        <span className="text-[11px] text-slate-400 font-medium">Domain categorization</span>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-bold text-slate-500">Corporate HQ & Locations</span>
                        <div className="text-sm font-extrabold text-slate-900 mt-1">{selectedCompanyView.location}</div>
                        <span className="text-[11px] text-slate-400 font-medium">{selectedCompanyView.locations?.join(', ') || 'India'}</span>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                        <span className="text-xs font-bold text-slate-500">Official Website</span>
                        <div className="text-sm font-extrabold text-[#2563EB] mt-1 truncate">
                          {selectedCompanyView.website}
                        </div>
                        <span className="text-[11px] text-slate-400">Company Portal</span>
                      </div>
                    </div>

                    {/* ALL UPLOADED JOBS BY THIS COMPANY (Read-Only) */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                      <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm sm:text-base font-extrabold text-slate-950">
                            Uploaded Jobs by {selectedCompanyView.name} ({selectedCompanyView.uploadedJobs.length})
                          </h3>
                          <p className="text-xs text-slate-500">All live positions and job requisitions uploaded by this company.</p>
                        </div>

                        <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
                          View Only
                        </span>
                      </div>

                      {selectedCompanyView.uploadedJobs.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                              <tr>
                                <th className="p-4">Position Title</th>
                                <th className="p-4">Location & Work Mode</th>
                                <th className="p-4">Compensation</th>
                                <th className="p-4">Experience</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {selectedCompanyView.uploadedJobs.map((job, idx) => (
                                <tr key={job.id || job._id || idx} className="hover:bg-slate-50/70 transition-colors">
                                  <td className="p-4">
                                    <div className="font-bold text-slate-900 text-xs sm:text-[13px]">{job.title}</div>
                                    <div className="text-slate-500 text-[11px]">{job.category || selectedCompanyView.industry}</div>
                                  </td>
                                  <td className="p-4">
                                    <div className="text-slate-800 font-medium">{job.location}</div>
                                    <div className="text-slate-400 text-[11px]">{job.workMode || job.jobType || 'Full-Time'}</div>
                                  </td>
                                  <td className="p-4">
                                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                      {job.salary || 'Competitive CTC'}
                                    </span>
                                  </td>
                                  <td className="p-4 text-slate-700 font-medium">
                                    {job.experience || '2+ Years'}
                                  </td>
                                  <td className="p-4">
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                                      (job.status || 'Active') === 'Active'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-slate-100 text-slate-600 border-slate-300'
                                    }`}>
                                      {job.status || 'Active'}
                                    </span>
                                  </td>
                                  <td className="p-4 text-right">
                                    <button
                                      onClick={() => setSelectedJobDetails(job)}
                                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#2563EB] font-bold text-xs rounded-xl border border-blue-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>View Specs</span>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-8 text-center space-y-2">
                          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                          <h4 className="text-sm font-bold text-slate-800">No jobs uploaded yet</h4>
                          <p className="text-xs text-slate-500">This partner company currently has no active uploaded job postings.</p>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════
                3. SECTION: ALL UPLOADED JOBS (Centralized View)
               ══════════════════════════════════════════════════════ */}
            {activeSection === 'jobs' && (
              <motion.div
                key="jobs"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Header */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-0.5">
                      <Briefcase className="w-3.5 h-3.5" />
                      Platform Requisitions Central Hub
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-950">All Uploaded Company Jobs</h2>
                    <p className="text-xs text-slate-500">
                      Centralized view of all job openings uploaded across all hiring partner companies.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportJobsCSV}
                      className="bg-[#EFF6FF] hover:bg-blue-100 text-[#2563EB] text-xs font-bold px-3.5 py-2 rounded-xl border border-blue-200 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Jobs CSV</span>
                    </button>
                  </div>
                </div>

                {/* Filters Bar */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="relative w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search jobs by title, company, skills, or location..."
                      value={jobSearch}
                      onChange={(e) => setJobSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#2563EB] rounded-xl outline-none text-slate-900 font-medium"
                    />
                    {jobSearch && (
                      <button 
                        onClick={() => setJobSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Company</label>
                      <select
                        value={jobCompanyFilter}
                        onChange={(e) => setJobCompanyFilter(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800"
                      >
                        {uniqueCompanies.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category / Domain</label>
                      <select
                        value={jobCategoryFilter}
                        onChange={(e) => setJobCategoryFilter(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800"
                      >
                        {uniqueJobCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Location</label>
                      <select
                        value={jobLocationFilter}
                        onChange={(e) => setJobLocationFilter(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800"
                      >
                        {uniqueJobLocations.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Uploaded Jobs Table (Read-Only) */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-4">Job Title & Category</th>
                          <th className="p-4">Hiring Company</th>
                          <th className="p-4">Location & Mode</th>
                          <th className="p-4">Compensation</th>
                          <th className="p-4">Experience</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredJobs.map((job, idx) => (
                          <tr key={job.id || job._id || idx} className="hover:bg-slate-50/70 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-slate-900 text-xs sm:text-[13px]">{job.title}</div>
                              <div className="text-slate-500 text-[11px]">{job.category || 'General'}</div>
                            </td>
                            <td className="p-4 font-semibold text-slate-900">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
                                <span>{job.company || 'Enterprise Partner'}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-slate-800 font-medium">{job.location}</div>
                              <div className="text-slate-400 text-[11px]">{job.workMode || job.jobType || 'Full Time'}</div>
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {job.salary || 'Competitive'}
                              </span>
                            </td>
                            <td className="p-4 text-slate-700 font-medium">
                              {job.experience || '2+ Years'}
                            </td>
                            <td className="p-4">
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                                (job.status || 'Active') === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-300'
                              }`}>
                                {job.status || 'Active'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => setSelectedJobDetails(job)}
                                className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-[#2563EB] hover:text-blue-700 font-bold text-xs rounded-xl border border-slate-200 hover:border-blue-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Inspect</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredJobs.length === 0 && (
                    <div className="p-8 text-center space-y-2">
                      <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                      <h4 className="text-sm font-bold text-slate-800">No jobs matched criteria</h4>
                      <p className="text-xs text-slate-500">Try clearing filters or changing search keywords.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════
                4. SECTION: INBOUND CLIENT INQUIRIES & HIRING LEADS
               ══════════════════════════════════════════════════════ */}
            {activeSection === 'inquiries' && (
              <motion.div
                key="inquiries"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Header */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-0.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Corporate Hiring Pipeline & Inquiries
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-950">Inbound Client Hiring Leads</h2>
                    <p className="text-xs text-slate-500">
                      Requests received from companies seeking bulk hiring, specialized tech talent, and placement partnerships.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={inquiryFilterStatus}
                      onChange={(e) => setInquiryFilterStatus(e.target.value)}
                      className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                    >
                      <option value="All">All Inquiries ({inquiries.length})</option>
                      <option value="New Lead">New Leads Only</option>
                      <option value="In Discussion">In Discussion</option>
                      <option value="Proposal Sent">Proposal Sent</option>
                      <option value="Onboarded Partner">Onboarded Partners</option>
                    </select>
                  </div>
                </div>

                {/* Inquiries Cards / Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-4">Client Organization</th>
                          <th className="p-4">Contact Person & Info</th>
                          <th className="p-4">Hiring Requirement</th>
                          <th className="p-4">Estimated Openings</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredInquiries.map((inq) => (
                          <tr key={inq.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-slate-900 text-xs sm:text-[13px]">{inq.clientName}</div>
                              <div className="text-slate-400 text-[11px]">Received: {inq.date}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-semibold text-slate-800">{inq.contactPerson}</div>
                              <div className="text-slate-500 text-[11px]">{inq.email} • {inq.phone}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-medium text-slate-800 max-w-xs truncate">{inq.serviceRequested}</div>
                              <div className="text-slate-400 text-[11px] truncate max-w-xs">{inq.notes}</div>
                            </td>
                            <td className="p-4 font-black text-[#2563EB]">
                              {inq.estimatedPositions} Positions
                            </td>
                            <td className="p-4">
                              <select
                                value={inq.status}
                                onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value)}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer ${
                                  inq.status === 'Onboarded Partner'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : inq.status === 'New Lead'
                                    ? 'bg-blue-50 text-[#2563EB] border-blue-200'
                                    : inq.status === 'Proposal Sent'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                <option value="New Lead">New Lead</option>
                                <option value="In Discussion">In Discussion</option>
                                <option value="Proposal Sent">Proposal Sent</option>
                                <option value="Onboarded Partner">Onboarded Partner</option>
                              </select>
                            </td>
                            <td className="p-4 text-right">
                              <a
                                href={`mailto:${inq.email}?subject=Balaji%20Placements%20-%20Hiring%20Partnership%20Discussion`}
                                className="px-3 py-1.5 bg-[#EFF6FF] hover:bg-blue-100 text-[#2563EB] font-bold text-xs rounded-xl border border-blue-200 inline-flex items-center gap-1.5 transition-colors"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>Reply</span>
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredInquiries.length === 0 && (
                    <div className="p-8 text-center space-y-2">
                      <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                      <h4 className="text-sm font-bold text-slate-800">No client inquiries found</h4>
                      <p className="text-xs text-slate-500">Inbound corporate inquiries will appear here.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}



            {/* ══════════════════════════════════════════════════════
                6. SECTION: SETTINGS, AUDIT LOGS & GOVERNANCE
               ══════════════════════════════════════════════════════ */}
            {activeSection === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
                  <h2 className="text-lg sm:text-xl font-black text-slate-950">Platform Settings & Security Governance</h2>
                  <p className="text-xs text-slate-500">
                    Configure placement portal parameters, review admin security audit logs, and manage governance policies.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left 2 Cols: Portal Settings Form */}
                  <div className="lg:col-span-2">
                    <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
                      <h3 className="text-sm font-extrabold text-slate-950 border-b border-slate-100 pb-2.5">
                        Portal Configuration Parameters
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Placement Portal Title</label>
                          <input
                            type="text"
                            value={settings.portalName}
                            onChange={(e) => setSettings({ ...settings, portalName: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#2563EB]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Super Admin Email</label>
                          <input
                            type="email"
                            value={settings.adminEmail}
                            onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#2563EB]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Hotline</label>
                          <input
                            type="text"
                            value={settings.supportPhone}
                            onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#2563EB]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Admin Access Policy</label>
                          <div className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium">
                            Read-Only Job Specs (Zero Interference Policy)
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Automations & Access Flags</h4>
                        
                        <label className="flex items-center gap-3 text-xs font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.autoEmailAlerts}
                            onChange={(e) => setSettings({ ...settings, autoEmailAlerts: e.target.checked })}
                            className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB]"
                          />
                          <span>Send immediate email alert when employer registers new hiring requisition</span>
                        </label>

                        <label className="flex items-center gap-3 text-xs font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.allowPublicRegistration}
                            onChange={(e) => setSettings({ ...settings, allowPublicRegistration: e.target.checked })}
                            className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB]"
                          />
                          <span>Allow open public registration for new partner hiring companies</span>
                        </label>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                          type="submit"
                          className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                        >
                          Save Parameters
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Right Col: Admin Security Audit Logs */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-600" />
                        <h3 className="text-sm font-extrabold text-slate-950">Security Audit Logs</h3>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        Live Tracking
                      </span>
                    </div>

                    <div className="space-y-3">
                      {auditLogs.map((log) => (
                        <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-slate-900">
                            <span>{log.action}</span>
                            <span className="text-emerald-700 text-[10px] font-extrabold">{log.status}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {log.user} • IP: {log.ip}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {log.timestamp}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════
                7. SECTION: EMPLOYER VERIFICATION & ACCESS GOVERNANCE
               ══════════════════════════════════════════════════════ */}
            {activeSection === 'employers' && (
              <motion.div
                key="employers"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Header Banner */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Corporate Verification & ATS Governance
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-950">Employer Verification Requests</h2>
                    <p className="text-xs text-slate-500">
                      Review registered recruiters and corporate organizations before granting ATS Command Center and Job Posting access.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadAllAdminData(true)}
                      className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Reload Employers"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                {/* Status Summary KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div 
                    onClick={() => setEmployerStatusFilter('All')}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      employerStatusFilter === 'All'
                        ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Employers</span>
                    <span className="text-2xl font-black text-slate-900 mt-1 block">{combinedEmployers.length}</span>
                  </div>

                  <div 
                    onClick={() => setEmployerStatusFilter('Pending')}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      employerStatusFilter === 'Pending'
                        ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20'
                        : 'bg-white border-slate-200 hover:border-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Pending Review</span>
                      {pendingEmployersCount > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      )}
                    </div>
                    <span className="text-2xl font-black text-amber-700 mt-1 block">{pendingEmployersCount}</span>
                  </div>

                  <div 
                    onClick={() => setEmployerStatusFilter('Approved')}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      employerStatusFilter === 'Approved'
                        ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:border-emerald-200'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Verified / Approved</span>
                    <span className="text-2xl font-black text-emerald-700 mt-1 block">
                      {combinedEmployers.filter(e => e.isApproved && e.employerProfile?.verificationStatus === 'approved').length}
                    </span>
                  </div>

                  <div 
                    onClick={() => setEmployerStatusFilter('Rejected')}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      employerStatusFilter === 'Rejected'
                        ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20'
                        : 'bg-white border-slate-200 hover:border-rose-200'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Rejected</span>
                    <span className="text-2xl font-black text-rose-700 mt-1 block">
                      {combinedEmployers.filter(e => e.employerProfile?.verificationStatus === 'rejected' || e.status === 'rejected').length}
                    </span>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filter by company name, recruiter, email..."
                      value={employerSearch}
                      onChange={(e) => setEmployerSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#2563EB] focus:bg-white transition-all font-medium text-slate-900"
                    />
                    {employerSearch && (
                      <button onClick={() => setEmployerSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setEmployerStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                          employerStatusFilter === status
                            ? 'bg-slate-950 text-white shadow-xs'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {status}
                        {status === 'Pending' && pendingEmployersCount > 0 && (
                          <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-extrabold">
                            {pendingEmployersCount}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Employers List Cards */}
                <div className="space-y-3">
                  {filteredEmployers.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2 shadow-xs">
                      <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                      <h4 className="text-sm font-bold text-slate-800">No employers found</h4>
                      <p className="text-xs text-slate-500">No employer accounts match your selected filter criteria.</p>
                    </div>
                  ) : (
                    filteredEmployers.map((emp) => {
                      const empId = emp._id || emp.id;
                      const cName = emp.employerProfile?.companyName || emp.companyName || emp.name || 'Organization';
                      const rName = emp.name || 'Recruiter Lead';
                      const rEmail = emp.email || '';
                      const rPhone = emp.phone || emp.employerProfile?.companyPhone || '';
                      const isApproved = emp.isApproved && (emp.employerProfile?.verificationStatus === 'approved' || emp.status === 'approved');
                      const isRejected = emp.employerProfile?.verificationStatus === 'rejected' || emp.status === 'rejected';
                      const isPending = !isApproved && !isRejected;

                      const postedJobsCount = jobs.filter(j => {
                        const jEmpId = String(j.employerId?._id || j.employerId || '');
                        const jComp = (j.company || '').toLowerCase().trim();
                        return (jEmpId && jEmpId === String(empId)) || (cName && jComp === cName.toLowerCase().trim());
                      }).length;

                      const regDate = emp.createdAt ? new Date(emp.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';

                      return (
                        <div 
                          key={empId}
                          className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition-all ${
                            isPending ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            
                            {/* Company / Recruiter Info */}
                            <div className="flex items-start gap-3.5 min-w-0">
                              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base shrink-0 ${
                                isApproved 
                                  ? 'bg-emerald-600 text-white shadow-emerald-500/20 shadow-sm'
                                  : isRejected
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-amber-500 text-white shadow-amber-500/20 shadow-sm'
                              }`}>
                                {cName.charAt(0).toUpperCase()}
                              </div>

                              <div className="min-w-0 space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-sm sm:text-base font-extrabold text-slate-950 truncate">
                                    {cName}
                                  </h3>
                                  
                                  {isPending && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                      <Clock className="w-3 h-3 text-amber-700 animate-spin" />
                                      Pending Admin Verification
                                    </span>
                                  )}
                                  {isApproved && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                      Verified & Approved ATS
                                    </span>
                                  )}
                                  {isRejected && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300">
                                      <XCircle className="w-3 h-3 text-rose-700" />
                                      Rejected
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2.5 text-xs text-slate-500 flex-wrap">
                                  <span className="font-semibold text-slate-700">Talent Lead: {rName}</span>
                                  <span>•</span>
                                  <span className="text-slate-600 font-medium">{rEmail}</span>
                                  
                                  {rPhone ? (
                                    <>
                                      <span>•</span>
                                      <a
                                        href={`tel:${rPhone}`}
                                        className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200 transition-colors shadow-2xs"
                                        title="Click to call and verify employer"
                                      >
                                        <PhoneCall className="w-3 h-3 text-blue-600" />
                                        <span>{rPhone}</span>
                                        <span className="text-[10px] text-blue-500 font-normal">(Verify Call)</span>
                                      </a>
                                    </>
                                  ) : (
                                    <>
                                      <span>•</span>
                                      <span className="text-slate-400 italic text-[11px]">No mobile provided</span>
                                    </>
                                  )}

                                  <span>•</span>
                                  <span>Registered: {regDate}</span>
                                  <span>•</span>
                                  <span className="font-bold text-[#2563EB]">{postedJobsCount} Jobs Active</span>
                                </div>

                                {isRejected && emp.employerProfile?.rejectionReason && (
                                  <div className="mt-1 text-[11px] text-rose-700 font-medium bg-rose-50 p-2 rounded-lg border border-rose-200/80">
                                    <strong>Rejection Reason:</strong> {emp.employerProfile.rejectionReason}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                              {!isApproved && (
                                <button
                                  onClick={() => handleApproveEmployerClick(empId)}
                                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Approve Access</span>
                                </button>
                              )}

                              {!isRejected && (
                                <button
                                  onClick={() => {
                                    setRejectingEmployer(emp);
                                    setRejectionReasonText('');
                                  }}
                                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 font-bold text-xs rounded-xl transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                                >
                                  <XCircle className="w-4 h-4" />
                                  <span>{isApproved ? 'Revoke / Reject' : 'Reject Request'}</span>
                                </button>
                              )}

                              {isApproved && (
                                <span className="text-[11px] font-bold text-emerald-700 px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-200">
                                  Active ATS Recruiter
                                </span>
                              )}
                            </div>

                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════
                8. SECTION: REGISTERED USERS & CANDIDATE DIRECTORY
               ══════════════════════════════════════════════════════ */}
            {activeSection === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Header Banner */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-0.5">
                      <Users2 className="w-3.5 h-3.5" />
                      MongoDB Atlas User Governance
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-950">Registered Users & Candidates</h2>
                    <p className="text-xs text-slate-500">
                      Live directory of all candidate profiles, recruiter accounts, and administrators stored in the database.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadAllAdminData(true)}
                      className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Reload Users"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#2563EB]' : ''}`} />
                      <span>Sync DB</span>
                    </button>
                  </div>
                </div>

                {/* User Count Summary KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div 
                    onClick={() => setUserRoleFilter('All')}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      userRoleFilter === 'All'
                        ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Database Users</span>
                    <span className="text-2xl font-black text-slate-900 mt-1 block">{combinedUsers.length}</span>
                  </div>

                  <div 
                    onClick={() => setUserRoleFilter('candidate')}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      userRoleFilter.toLowerCase() === 'candidate'
                        ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-blue-200'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">Job Candidates</span>
                    <span className="text-2xl font-black text-blue-700 mt-1 block">
                      {combinedUsers.filter(u => u.role === 'candidate').length}
                    </span>
                  </div>

                  <div 
                    onClick={() => setUserRoleFilter('employer')}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      userRoleFilter.toLowerCase() === 'employer'
                        ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20'
                        : 'bg-white border-slate-200 hover:border-amber-200'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Employer Leads</span>
                    <span className="text-2xl font-black text-amber-700 mt-1 block">
                      {combinedUsers.filter(u => u.role === 'employer').length}
                    </span>
                  </div>

                  <div 
                    onClick={() => setUserRoleFilter('admin')}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      userRoleFilter.toLowerCase() === 'admin'
                        ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:border-emerald-200'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Administrators</span>
                    <span className="text-2xl font-black text-emerald-700 mt-1 block">
                      {combinedUsers.filter(u => u.role === 'admin').length}
                    </span>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search users by name, email, phone, role..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#2563EB] focus:bg-white transition-all font-medium text-slate-900"
                    />
                    {userSearch && (
                      <button onClick={() => setUserSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    {[
                      { label: 'All Users', value: 'All' },
                      { label: 'Candidates', value: 'candidate' },
                      { label: 'Employers', value: 'employer' },
                      { label: 'Admins', value: 'admin' }
                    ].map((tab) => (
                      <button
                        key={tab.value}
                        onClick={() => setUserRoleFilter(tab.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                          userRoleFilter.toLowerCase() === tab.value.toLowerCase()
                            ? 'bg-slate-950 text-white shadow-xs'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Users List */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-3.5">User Identity</th>
                          <th className="p-3.5">Role</th>
                          <th className="p-3.5">Contact Details</th>
                          <th className="p-3.5">Profile Info / Company</th>
                          <th className="p-3.5">Registration Date</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-10 text-center text-slate-400">
                              No registered users found matching the search criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => {
                            const uId = u._id || u.id;
                            const regDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';
                            const isCandidate = u.role === 'candidate';
                            const isEmployer = u.role === 'employer';
                            const isAdmin = u.role === 'admin';
                            const candProfile = u.candidateProfile || {};
                            const empProfile = u.employerProfile || {};
                            const hasResume = isCandidate && (candProfile.resumeUrl || candProfile.resumeName || u.resumeName);

                            return (
                              <tr key={uId} className="hover:bg-slate-50/60 transition-colors">
                                
                                {/* Identity */}
                                <td className="p-3.5">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                      isAdmin 
                                        ? 'bg-purple-600 text-white' 
                                        : isEmployer 
                                        ? 'bg-amber-500 text-white' 
                                        : 'bg-blue-600 text-white'
                                    }`}>
                                      {(u.name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <span className="font-extrabold text-slate-900 block leading-tight">
                                        {u.name || 'User'}
                                      </span>
                                      <span className="text-[11px] text-slate-400">ID: {String(uId).slice(-6)}</span>
                                    </div>
                                  </div>
                                </td>

                                {/* Role Badge */}
                                <td className="p-3.5">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px] border capitalize ${
                                    isAdmin 
                                      ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                      : isEmployer 
                                      ? 'bg-amber-50 text-amber-800 border-amber-200' 
                                      : 'bg-blue-50 text-blue-700 border-blue-200'
                                  }`}>
                                    {u.role || 'candidate'}
                                  </span>
                                </td>

                                {/* Contact Details */}
                                <td className="p-3.5 space-y-0.5">
                                  <div className="font-semibold text-slate-800 flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    <span>{u.email}</span>
                                  </div>
                                  {u.phone && (
                                    <div className="text-[11px] text-slate-500">
                                      📞 {u.phone}
                                    </div>
                                  )}
                                </td>

                                {/* Profile info / Company */}
                                <td className="p-3.5">
                                  {isCandidate && (
                                    <div className="space-y-0.5">
                                      <span className="font-bold text-slate-800 block text-[11px]">
                                        {candProfile.title || u.title || 'Software Developer'}
                                      </span>
                                      <span className="text-[10px] text-slate-500">
                                        {candProfile.location || u.location || 'India'} • {candProfile.experience || u.experience || '1-3 Yrs'}
                                      </span>
                                    </div>
                                  )}
                                  {isEmployer && (
                                    <div>
                                      <span className="font-bold text-slate-900 block text-[11px]">
                                        {empProfile.companyName || u.companyName || 'Enterprise Company'}
                                      </span>
                                      <span className={`text-[10px] font-bold ${
                                        u.isApproved ? 'text-emerald-600' : 'text-amber-600'
                                      }`}>
                                        {u.isApproved ? '✓ Verified ATS Recruiter' : '⏳ Pending Approval'}
                                      </span>
                                    </div>
                                  )}
                                  {isAdmin && (
                                    <span className="text-[11px] font-bold text-purple-700">Platform Governance Admin</span>
                                  )}
                                </td>

                                {/* Registered Date */}
                                <td className="p-3.5 text-slate-500 font-medium text-[11px]">
                                  {regDate}
                                </td>

                                {/* Actions */}
                                <td className="p-3.5 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {hasResume && (
                                      <button
                                        onClick={() => {
                                          if (candProfile.atsResumeData) {
                                            setSelectedCandidateResume(candProfile.atsResumeData);
                                          } else if (candProfile.resumeUrl) {
                                            window.open(getBackendFileUrl(candProfile.resumeUrl), '_blank');
                                          } else {
                                            toast("Resume attached to user dossier", { icon: '📄' });
                                          }
                                        }}
                                        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                                        title="View Candidate Resume"
                                      >
                                        <FileText className="w-4 h-4" />
                                      </button>
                                    )}

                                    {!isAdmin && (
                                      <button
                                        onClick={() => handleDeleteUserClick(uId, u.name || u.email)}
                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                        title="Delete User from Database"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </td>

                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════
                9. SECTION: MASTER ATS APPLICATION PIPELINE
               ══════════════════════════════════════════════════════ */}
            {activeSection === 'applications' && (
              <motion.div
                key="applications"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Header Banner */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-0.5">
                      <UserCheck className="w-3.5 h-3.5" />
                      Live Applicant Tracking System (ATS)
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-950">Master ATS Application Pipeline</h2>
                    <p className="text-xs text-slate-500">
                      Cross-organizational candidate applications submitted for all active job postings in MongoDB Atlas.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadAllAdminData(true)}
                      className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Sync Pipeline"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#2563EB]' : ''}`} />
                      <span>Sync Pipeline</span>
                    </button>
                  </div>
                </div>

                {/* Pipeline Stage KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'Total Submitted', val: combinedApplications.length, filter: 'All', color: 'slate' },
                    { label: 'Applied', val: combinedApplications.filter(a => a.status === 'Applied' || a.stage === 1).length, filter: 'Applied', color: 'blue' },
                    { label: 'Under Review', val: combinedApplications.filter(a => a.status === 'Under Review' || a.status === 'Reviewing' || a.stage === 2).length, filter: 'Under Review', color: 'amber' },
                    { label: 'Shortlisted', val: combinedApplications.filter(a => a.status === 'Shortlisted' || a.stage === 3).length, filter: 'Shortlisted', color: 'indigo' },
                    { label: 'Interviews', val: combinedApplications.filter(a => a.status === 'Interview Scheduled' || a.status === 'Interview' || a.stage === 4).length, filter: 'Interview', color: 'purple' },
                    { label: 'Hired / Offered', val: combinedApplications.filter(a => a.status === 'Hired' || a.status === 'Offered' || a.stage === 5).length, filter: 'Hired', color: 'emerald' },
                  ].map((kpi, idx) => (
                    <div
                      key={idx}
                      onClick={() => setApplicationStatusFilter(kpi.filter)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        applicationStatusFilter === kpi.filter
                          ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{kpi.label}</span>
                      <span className="text-xl font-black text-slate-900 mt-1 block">{kpi.val}</span>
                    </div>
                  ))}
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search applications by candidate, role, company..."
                      value={applicationSearch}
                      onChange={(e) => setApplicationSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#2563EB] focus:bg-white transition-all font-medium text-slate-900"
                    />
                    {applicationSearch && (
                      <button onClick={() => setApplicationSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    {['All', 'Applied', 'Under Review', 'Shortlisted', 'Interview', 'Hired'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setApplicationStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                          applicationStatusFilter === status
                            ? 'bg-slate-950 text-white shadow-xs'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Applications Dossier Cards */}
                <div className="space-y-3">
                  {filteredApplications.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2 shadow-xs">
                      <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
                      <h4 className="text-sm font-bold text-slate-800">No applications found</h4>
                      <p className="text-xs text-slate-500">No candidate applications match your filter criteria.</p>
                    </div>
                  ) : (
                    filteredApplications.map((app) => {
                      const appId = app._id || app.id;
                      const cName = app.applicantName || app.name || app.candidateName || 'Candidate';
                      const cEmail = app.applicantEmail || app.email || '';
                      const jTitle = app.jobTitle || app.jobId?.title || 'Open Role';
                      const comp = app.companyName || app.company || 'Enterprise Partner';
                      const appliedDate = app.createdAt ? new Date(app.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';

                      return (
                        <div 
                          key={appId}
                          className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-3.5 min-w-0">
                            <div className="w-11 h-11 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-black text-sm shrink-0">
                              {cName.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-extrabold text-slate-950">{cName}</h4>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                  {app.atsScore || 90}% ATS Match
                                </span>
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                  app.stage === 5 || app.status === 'Hired'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : app.stage === 4 || app.status?.includes('Interview')
                                    ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                    : app.stage === 3 || app.status === 'Shortlisted'
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : app.stage === 2 || app.status?.includes('Review')
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                  {app.status || 'Applied'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2.5 text-xs text-slate-500 flex-wrap">
                                <span>Applied for <strong className="text-slate-800 font-semibold">{jTitle}</strong></span>
                                <span>•</span>
                                <span className="text-[#2563EB] font-bold">{comp}</span>
                                <span>•</span>
                                <span>{cEmail}</span>
                                <span>•</span>
                                <span>Submitted: {appliedDate}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            {(app.atsResumeData || app.resumeUrl || app.resumeName) && (
                              <button
                                onClick={() => {
                                  if (app.atsResumeData) {
                                    setSelectedCandidateResume(app.atsResumeData);
                                  } else if (app.resumeUrl) {
                                    window.open(getBackendFileUrl(app.resumeUrl), '_blank');
                                  } else {
                                    toast.success("Resume downloaded / opened");
                                  }
                                }}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#2563EB] font-bold text-xs rounded-xl border border-blue-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>View Resume</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </motion.div>
            )}

          </AnimatePresence>

        </main>
      </div>

      {/* ── REJECTION REASON MODAL ── */}
      {rejectingEmployer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600 font-black text-sm">
                <AlertCircle className="w-5 h-5" />
                <span>Reject Employer Registration</span>
              </div>
              <button 
                onClick={() => setRejectingEmployer(null)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Please specify the reason for rejecting <strong className="text-slate-900">{rejectingEmployer.employerProfile?.companyName || rejectingEmployer.companyName || rejectingEmployer.name}</strong>. The employer will be notified of this reason upon login.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Rejection Reason / Feedback</label>
              <textarea
                rows={3}
                value={rejectionReasonText}
                onChange={(e) => setRejectionReasonText(e.target.value)}
                placeholder="e.g., Unverified corporate domain, missing official tax registration, or contact details failed verification."
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 focus:bg-white text-slate-900 font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                'Unverified corporate domain',
                'Incomplete company credentials',
                'Duplicate account found',
                'Contact details failed verification'
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setRejectionReasonText(suggestion)}
                  className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingEmployer(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRejectEmployerClick(rejectingEmployer._id || rejectingEmployer.id, rejectionReasonText || 'Company verification details could not be validated.')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODALS (STRICTLY READ-ONLY INSPECTION) ── */}

      {/* 1. READ-ONLY JOB SPECIFICATIONS MODAL */}
      {selectedJobDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1E40AF] via-[#2563EB] to-[#3B82F6] text-white p-6 relative">
              <button
                onClick={() => setSelectedJobDetails(null)}
                className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white text-[#2563EB] flex items-center justify-center font-bold text-base shadow-md">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-white">{selectedJobDetails.title}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                      {selectedJobDetails.category || 'Requisition'}
                    </span>
                  </div>
                  <p className="text-xs text-blue-100 mt-0.5">
                    Company: <strong>{selectedJobDetails.company || 'Enterprise Partner'}</strong> • Location: <strong>{selectedJobDetails.location}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
              
              {/* Key Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Compensation</span>
                  <span className="font-black text-emerald-700">{selectedJobDetails.salary || 'Competitive'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Experience</span>
                  <span className="font-semibold text-slate-900">{selectedJobDetails.experience || '2+ Years'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Work Mode</span>
                  <span className="font-semibold text-slate-900">{selectedJobDetails.workMode || 'Full Time'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Posting Status</span>
                  <span className="font-bold text-emerald-700">{selectedJobDetails.status || 'Active'}</span>
                </div>
              </div>

              {/* Required Skills */}
              {selectedJobDetails.skills && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Required Skills & Technologies</h4>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(Array.isArray(selectedJobDetails.skills) ? selectedJobDetails.skills : selectedJobDetails.skills.split(',')).map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-blue-50 text-[#2563EB] font-bold text-[11px] rounded-lg border border-blue-200">
                        {typeof s === 'string' ? s.trim() : s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Job Description */}
              <div>
                <h4 className="font-bold text-slate-900 mb-1.5">Job Overview & Description</h4>
                <div className="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 whitespace-pre-line text-xs">
                  {selectedJobDetails.description || 'No detailed description provided by the employer for this posting.'}
                </div>
              </div>

              {/* Responsibilities if available */}
              {selectedJobDetails.responsibilities && selectedJobDetails.responsibilities.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1.5">Key Responsibilities</h4>
                  <ul className="list-disc list-inside text-slate-600 space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    {selectedJobDetails.responsibilities.map((resp, rIdx) => (
                      <li key={rIdx}>{resp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/career-opportunities/${selectedJobDetails.id || selectedJobDetails._id || selectedJobDetails.slug || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>View Public Post</span>
                </Link>

                <button
                  onClick={() => setSelectedJobDetails(null)}
                  className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 2. READ-ONLY COMPANY PROFILE MODAL */}
      {selectedCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1E40AF] via-[#2563EB] to-[#3B82F6] text-white p-6 relative">
              <button
                onClick={() => setSelectedCompanyModal(null)}
                className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white text-[#2563EB] flex items-center justify-center font-bold text-base shadow-md">
                  {selectedCompanyModal.logoText || selectedCompanyModal.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{selectedCompanyModal.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                      {selectedCompanyModal.verified ? 'Verified' : 'Registered'}
                    </span>
                  </div>
                  <p className="text-xs text-blue-100">{selectedCompanyModal.industry} • {selectedCompanyModal.location}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Recruiter Contact</span>
                  <span className="font-semibold text-slate-900">{selectedCompanyModal.recruiter}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Corporate Website</span>
                  <span className="font-semibold text-[#2563EB] truncate block">{selectedCompanyModal.website}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Workforce Size</span>
                  <span className="font-semibold text-slate-900">{selectedCompanyModal.employees || '1,000+ employees'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Active Uploaded Jobs</span>
                  <span className="font-bold text-[#2563EB]">{selectedCompanyModal.jobsCount} Openings</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1.5">Company Profile & Overview</h4>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {selectedCompanyModal.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedCompanyView(selectedCompanyModal);
                    setSelectedCompanyModal(null);
                    setActiveSection('companies');
                  }}
                  className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Inspect All {selectedCompanyModal.jobsCount} Jobs</span>
                </button>

                <button
                  onClick={() => setSelectedCompanyModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}



      {/* 4. CANDIDATE ATS RESUME VIEWER MODAL */}
      {selectedCandidateResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-blue-400" />
                <span className="font-extrabold text-sm">Official Candidate ATS Resume Dossier</span>
              </div>
              <button
                onClick={() => setSelectedCandidateResume(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
              <div className="w-full max-w-3xl bg-white rounded-xl shadow-md p-6">
                <AtsResumeDocument resumeData={selectedCandidateResume} />
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Verified Candidate Portfolio</span>
              <button
                onClick={() => setSelectedCandidateResume(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        Balaji Placements Administration Console • Corporate Governance & Platform Intelligence • System Security Level: High
      </footer>

    </div>
  );
};

export default AdminDashboard;
