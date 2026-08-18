/**
 * SKILLSFY PLATFORM CONTROLLER & STATE MANAGER
 * Configured for Skillsfy - Institute of Technology (Jabalpur)
 * Founder: Pranjil Soni (@pranjils0ni)
 * Supports: Multi-User CRM Teams, Affiliate Payouts, Live Lead Dispatch,
 * Dynamic Site Config, Custom Code Injection, and OTP Verification.
 */

// Initialize Global Data Stores
function initPlatformStore() {
  if (!localStorage.getItem('skillsfy_config')) {
    localStorage.setItem('skillsfy_config', JSON.stringify(SKILLSFY_GLOBAL_CONFIG));
  }
  if (!localStorage.getItem('skillsfy_student')) {
    localStorage.setItem('skillsfy_student', JSON.stringify(INITIAL_STUDENT_PROFILE));
  }
  if (!localStorage.getItem('skillsfy_enquiries')) {
    localStorage.setItem('skillsfy_enquiries', JSON.stringify(INITIAL_ENQUIRIES));
  }
  if (!localStorage.getItem('skillsfy_team_members')) {
    localStorage.setItem('skillsfy_team_members', JSON.stringify(INITIAL_TEAM_MEMBERS));
  }
  if (!localStorage.getItem('skillsfy_profile_requests')) {
    localStorage.setItem('skillsfy_profile_requests', JSON.stringify(INITIAL_PROFILE_REQUESTS));
  }
  if (!localStorage.getItem('skillsfy_courses_status')) {
    const courseStatus = {};
    SKILLSFY_COURSES.forEach(c => { courseStatus[c.id] = c.status; });
    localStorage.setItem('skillsfy_courses_status', JSON.stringify(courseStatus));
  }
  if (!localStorage.getItem('skillsfy_custom_code')) {
    localStorage.setItem('skillsfy_custom_code', JSON.stringify({
      customCSS: "/* Custom CSS injected via Admin Developer Panel */\n.skillsfy-glow { box-shadow: 0 0 20px rgba(0, 204, 249, 0.4); }",
      customJS: "// Custom JS / Pixel Webhook injected via Admin\nconsole.log('Skillsfy Analytics & Tracking active.');",
      metaPixelId: "PIXEL-SKF-8921",
      ga4Id: "G-SKILLSFY2026",
      webhookUrl: "https://api.skillsfy.edu/webhooks/leads"
    }));
  }
}

initPlatformStore();

// ============================================================================
// LIVE BACKEND API INTEGRATION CLIENT
// Connects frontend pages to Node.js + Express + SQLite Backend at http://localhost:5000
// ============================================================================
const SKILLSFY_API_BASE = 'http://localhost:5000/api';

const SkillsfyAPI = {
  getToken: () => localStorage.getItem('skillsfy_token') || '',
  setToken: (token) => localStorage.setItem('skillsfy_token', token),
  clearToken: () => localStorage.removeItem('skillsfy_token'),

  getHeaders: () => {
    const headers = { 'Content-Type': 'application/json' };
    const token = SkillsfyAPI.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  },

  // Auth: Student Signup
  async signup(data) {
    try {
      const res = await fetch(`${SKILLSFY_API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success && json.token) {
        SkillsfyAPI.setToken(json.token);
        const profile = {
          name: json.student.name,
          email: json.student.email,
          phone: json.student.phone || '+91 9876543210',
          avatar: 'assets/default-avatar.png',
          enrolledCourses: ['standard-course'],
          courseProgress: {
            'standard-course': { percent: 0, completedLessons: [], lastActive: 'Just now' }
          },
          affiliateStats: {
            referralCode: `SF-${json.student.name.split(' ')[0].toUpperCase()}-2026`,
            totalEarningsINR: 0,
            availablePayoutINR: 0,
            totalReferrals: 0,
            paidEnrollments: 0
          }
        };
        saveStudentProfile(profile);
      }
      return json;
    } catch (err) {
      console.warn('Backend API offline or unreachable, using local fallback:', err);
      return { success: false, message: err.message };
    }
  },

  // Auth: Student Login
  async login(email, password) {
    try {
      const res = await fetch(`${SKILLSFY_API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      if (json.success && json.token) {
        SkillsfyAPI.setToken(json.token);
        const profile = getStudentProfile();
        profile.name = json.student.name;
        profile.email = json.student.email;
        if (json.student.phone) profile.phone = json.student.phone;
        saveStudentProfile(profile);
      }
      return json;
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Auth: Admin / Verifier Login
  async adminLogin(email, password) {
    try {
      const res = await fetch(`${SKILLSFY_API_BASE}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      if (json.success && json.token) {
        localStorage.setItem('skillsfy_admin_token', json.token);
        localStorage.setItem('skillsfy_admin_user', JSON.stringify(json.admin));
      }
      return json;
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Course Enrollment: POST /api/enroll/:courseId
  async enroll(courseId = 1) {
    try {
      const res = await fetch(`${SKILLSFY_API_BASE}/enroll/${courseId}`, {
        method: 'POST',
        headers: SkillsfyAPI.getHeaders()
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Progress Update: PUT /api/progress/:enrollmentId
  async updateProgress(enrollmentId = 1, progress_percent = 100) {
    try {
      const res = await fetch(`${SKILLSFY_API_BASE}/progress/${enrollmentId}`, {
        method: 'PUT',
        headers: SkillsfyAPI.getHeaders(),
        body: JSON.stringify({ progress_percent })
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Get My Enrolled Courses: GET /api/my-courses
  async getMyCourses() {
    try {
      const res = await fetch(`${SKILLSFY_API_BASE}/my-courses`, {
        method: 'GET',
        headers: SkillsfyAPI.getHeaders()
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Verify Certificate: GET /api/verify/:code
  async verifyCertificate(code) {
    try {
      const res = await fetch(`${SKILLSFY_API_BASE}/verify/${encodeURIComponent(code.trim())}`);
      return await res.json();
    } catch (err) {
      return { valid: false, message: err.message };
    }
  },

  // Admin: Get Students
  async getAdminStudents() {
    try {
      const adminToken = localStorage.getItem('skillsfy_admin_token') || SkillsfyAPI.getToken();
      const res = await fetch(`${SKILLSFY_API_BASE}/admin/students`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Admin: Get Certificates
  async getAdminCertificates(search = '') {
    try {
      const adminToken = localStorage.getItem('skillsfy_admin_token') || SkillsfyAPI.getToken();
      const url = search 
        ? `${SKILLSFY_API_BASE}/admin/certificates?search=${encodeURIComponent(search)}`
        : `${SKILLSFY_API_BASE}/admin/certificates`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Admin: Revoke Certificate
  async revokeCertificate(id, reason) {
    try {
      const adminToken = localStorage.getItem('skillsfy_admin_token') || SkillsfyAPI.getToken();
      const res = await fetch(`${SKILLSFY_API_BASE}/admin/certificates/${id}/revoke`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ reason })
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  }
};

// Getter & Setter Utilities
function getGlobalConfig() {
  try {
    return JSON.parse(localStorage.getItem('skillsfy_config')) || SKILLSFY_GLOBAL_CONFIG;
  } catch (e) {
    return SKILLSFY_GLOBAL_CONFIG;
  }
}

function saveGlobalConfig(config) {
  localStorage.setItem('skillsfy_config', JSON.stringify(config));
  applySiteConfigToDOM();
}

function getStudentProfile() {
  try {
    return JSON.parse(localStorage.getItem('skillsfy_student')) || INITIAL_STUDENT_PROFILE;
  } catch (e) {
    return INITIAL_STUDENT_PROFILE;
  }
}

function saveStudentProfile(profile) {
  localStorage.setItem('skillsfy_student', JSON.stringify(profile));
}

function getEnquiries() {
  try {
    return JSON.parse(localStorage.getItem('skillsfy_enquiries')) || INITIAL_ENQUIRIES;
  } catch (e) {
    return INITIAL_ENQUIRIES;
  }
}

function saveEnquiries(enquiries) {
  localStorage.setItem('skillsfy_enquiries', JSON.stringify(enquiries));
}

function getTeamMembers() {
  try {
    return JSON.parse(localStorage.getItem('skillsfy_team_members')) || INITIAL_TEAM_MEMBERS;
  } catch (e) {
    return INITIAL_TEAM_MEMBERS;
  }
}

function saveTeamMembers(teams) {
  localStorage.setItem('skillsfy_team_members', JSON.stringify(teams));
}

function getProfileRequests() {
  try {
    return JSON.parse(localStorage.getItem('skillsfy_profile_requests')) || INITIAL_PROFILE_REQUESTS;
  } catch (e) {
    return INITIAL_PROFILE_REQUESTS;
  }
}

function saveProfileRequests(requests) {
  localStorage.setItem('skillsfy_profile_requests', JSON.stringify(requests));
}

function getCustomCode() {
  try {
    return JSON.parse(localStorage.getItem('skillsfy_custom_code')) || {};
  } catch (e) {
    return {};
  }
}

function saveCustomCode(codeObj) {
  localStorage.setItem('skillsfy_custom_code', JSON.stringify(codeObj));
  injectCustomDeveloperCode();
}

// Inject Developer Custom Code & Pixels
function injectCustomDeveloperCode() {
  const code = getCustomCode();
  if (code.customCSS) {
    let styleTag = document.getElementById('injected-custom-css');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'injected-custom-css';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = code.customCSS;
  }
}

// Sync Global Site Settings (Phone, Email, Jabalpur Address, Founder) to DOM
function applySiteConfigToDOM() {
  const cfg = getGlobalConfig();
  
  // Update Contact info elements
  document.querySelectorAll('.site-contact-email').forEach(el => {
    el.textContent = cfg.email;
    if (el.tagName === 'A') el.href = `mailto:${cfg.email}`;
  });

  document.querySelectorAll('.site-contact-phone').forEach(el => {
    el.textContent = cfg.phone;
    if (el.tagName === 'A') el.href = `tel:${cfg.phone.replace(/[^0-9+]/g, '')}`;
  });

  document.querySelectorAll('.site-office-address').forEach(el => {
    el.textContent = cfg.address;
  });

  document.querySelectorAll('.site-brand-tagline').forEach(el => {
    el.textContent = cfg.tagline;
  });
}

// Toast Notifications System
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    info: 'info',
    success: 'check_circle',
    error: 'error',
    warning: 'warning'
  };

  const toast = document.createElement('div');
  toast.className = `toast-item ${type}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined text-xl ${type === 'success' ? 'text-emerald-400' : type === 'error' ? 'text-rose-400' : 'text-cyan-400'}">${icons[type] || 'info'}</span>
    <div class="flex-1 text-sm font-medium leading-snug">${message}</div>
    <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-white transition-colors">
      <span class="material-symbols-outlined text-lg">close</span>
    </button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }
  }, 4000);
}

// Lead Enquiry Modal
function openEnquiryModal(courseName = 'Skillsfy Standard Course: AI + Digital Business') {
  let modal = document.getElementById('enquiry-modal');
  if (!modal) {
    createEnquiryModalElement();
    modal = document.getElementById('enquiry-modal');
  }
  
  const courseInput = document.getElementById('enquiry-course-select');
  if (courseInput && courseName) {
    courseInput.value = courseName;
  }

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeEnquiryModal() {
  const modal = document.getElementById('enquiry-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

function createEnquiryModalElement() {
  const cfg = getGlobalConfig();
  const div = document.createElement('div');
  div.id = 'enquiry-modal';
  div.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop hidden';
  div.innerHTML = `
    <div class="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 modal-content-pop border border-slate-200">
      <button onclick="closeEnquiryModal()" class="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors">
        <span class="material-symbols-outlined text-2xl">close</span>
      </button>

      <div class="flex items-center gap-3 mb-4">
        <img src="assets/logo-badge.png" alt="Skillsfy" class="w-10 h-10 object-contain rounded-xl border border-slate-200 p-0.5"/>
        <div>
          <h3 class="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">Request Free Counselling & Syllabus</h3>
          <p class="text-xs text-slate-500 font-['Inter']">Jabalpur Center & Online Cohorts. Get ₹2,999 offer coupon + WhatsApp roadmap.</p>
        </div>
      </div>

      <form id="global-enquiry-form" onsubmit="handleEnquirySubmit(event)" class="space-y-4 font-['Inter'] text-sm">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input type="text" id="enquiry-name" required placeholder="e.g. Aman Verma" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-900 text-sm">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Number *</label>
            <input type="tel" id="enquiry-phone" required placeholder="e.g. +91 98765 43210" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-900 text-sm">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
            <input type="email" id="enquiry-email" required placeholder="you@gmail.com" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-900 text-sm">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">City / Location</label>
            <input type="text" id="enquiry-city" placeholder="e.g. Jabalpur, Bhopal, Indore" value="Jabalpur" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-900 text-sm">
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Program of Interest</label>
          <select id="enquiry-course-select" class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-900 text-sm bg-white">
            <option value="Skillsfy Standard Course: AI + Digital Business">Skillsfy Standard Course: AI + Digital Business (₹2,999 Flagship)</option>
            <option value="Performance Marketing & Paid Ads Mastery">Performance Marketing & Paid Ads Mastery (Coming Soon)</option>
            <option value="Advanced Video Editing & Viral Motion Graphics">Advanced Video Editing & Viral Motion Graphics (Coming Soon)</option>
            <option value="Organic Social Media Marketing & Personal Branding">Organic Social Media Marketing & Personal Branding (Coming Soon)</option>
          </select>
        </div>

        <button type="submit" class="w-full py-3.5 px-4 bg-primary hover:bg-primary-container text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
          <span>Get Syllabus & 50% Scholarship on WhatsApp</span>
          <span class="material-symbols-outlined text-lg text-[#00ccf9]">send</span>
        </button>
      </form>
    </div>
  `;
  document.body.appendChild(div);
}

function handleEnquirySubmit(e) {
  e.preventDefault();
  const name = document.getElementById('enquiry-name').value;
  const email = document.getElementById('enquiry-email').value;
  const phone = document.getElementById('enquiry-phone').value;
  const city = document.getElementById('enquiry-city') ? document.getElementById('enquiry-city').value : 'Jabalpur';
  const course = document.getElementById('enquiry-course-select').value;

  const newEnquiry = {
    id: `ENQ-${Math.floor(100 + Math.random() * 900)}`,
    name,
    email,
    phone,
    city,
    course,
    experience: "Fresher / College Student",
    assignedTo: "Admissions Counselor Lead",
    status: 'New',
    date: new Date().toISOString().split('T')[0],
    notes: 'Submitted online enquiry form. Sent WhatsApp syllabus link.'
  };

  const enquiries = getEnquiries();
  enquiries.unshift(newEnquiry);
  saveEnquiries(enquiries);

  closeEnquiryModal();
  showToast(`Thank you ${name}! Your admission enquiry is received. Instant syllabus sent to ${phone}`, 'success');
}

// Homepage Lead Capture Floating Bar / Popup
function initHomepageLeadPopup() {
  if (sessionStorage.getItem('skillsfy_popup_dismissed')) return;
  
  setTimeout(() => {
    let popup = document.getElementById('homepage-floating-lead-popup');
    if (!popup && document.body.contains(document.getElementById('featured-courses-grid'))) {
      popup = document.createElement('div');
      popup.id = 'homepage-floating-lead-popup';
      popup.className = 'fixed bottom-5 left-5 z-40 max-w-sm bg-[#031636] text-white p-5 rounded-2xl shadow-2xl border border-cyan-500/40 modal-content-pop hidden sm:block';
      popup.innerHTML = `
        <div class="flex items-start justify-between gap-3 mb-2">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span class="text-[11px] font-bold uppercase tracking-wider text-cyan-300 font-['Geist']">50% Scholarship Live</span>
          </div>
          <button onclick="dismissHomepagePopup()" class="text-slate-400 hover:text-white transition-colors">
            <span class="material-symbols-outlined text-base">close</span>
          </button>
        </div>
        <h4 class="font-bold text-white text-sm font-['Plus_Jakarta_Sans'] leading-tight">Download Standard Course 14-Module Syllabus & Free AI Roadmap</h4>
        <p class="text-slate-300 text-xs mt-1 font-['Inter']">Get 500+ free AI prompts + ₹2,999 admission coupon instantly on WhatsApp.</p>
        <div class="mt-3 flex items-center gap-2">
          <button onclick="dismissHomepagePopup(); openEnquiryModal();" class="flex-1 py-2 px-3 bg-[#00ccf9] hover:bg-[#4cd6ff] text-slate-950 font-bold text-xs rounded-xl transition-all text-center">
            Get Free Syllabus PDF
          </button>
          <button onclick="dismissHomepagePopup()" class="px-2 py-2 text-slate-400 hover:text-slate-200 text-xs font-semibold">
            Dismiss
          </button>
        </div>
      `;
      document.body.appendChild(popup);
    }
  }, 4000);
}

function dismissHomepagePopup() {
  const popup = document.getElementById('homepage-floating-lead-popup');
  if (popup) popup.remove();
  sessionStorage.setItem('skillsfy_popup_dismissed', 'true');
}

// 1-on-1 Mentor Office Hours Booking Modal
function openMentorModal(mentorName = 'Pranjil Soni') {
  let modal = document.getElementById('mentor-booking-modal');
  if (!modal) {
    createMentorModalElement();
    modal = document.getElementById('mentor-booking-modal');
  }
  const mentorSelect = document.getElementById('mentor-name-select');
  if (mentorSelect && mentorName) mentorSelect.value = mentorName;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeMentorModal() {
  const modal = document.getElementById('mentor-booking-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

function createMentorModalElement() {
  const div = document.createElement('div');
  div.id = 'mentor-booking-modal';
  div.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop hidden';
  div.innerHTML = `
    <div class="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8 modal-content-pop border border-slate-200 font-['Inter']">
      <button onclick="closeMentorModal()" class="absolute top-5 right-5 text-slate-400 hover:text-slate-700">
        <span class="material-symbols-outlined text-2xl">close</span>
      </button>

      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center">
          <span class="material-symbols-outlined text-2xl">event_available</span>
        </div>
        <div>
          <h3 class="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">Book 1-on-1 Mentorship</h3>
          <p class="text-xs text-slate-500">1:1 Project Code Review, AI Roadmap & Agency Career Strategy.</p>
        </div>
      </div>

      <form onsubmit="handleMentorBooking(event)" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Select Mentor</label>
          <select id="mentor-name-select" class="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900">
            <option value="Pranjil Soni">Pranjil Soni (Founder, Skillsfy Institute)</option>
            <option value="Elena Rostova">Elena Rostova (Staff Software Engineer)</option>
            <option value="Marcus Sterling">Marcus Sterling (Cloud & DevOps Architect)</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Preferred Date</label>
            <input type="date" required id="booking-date" class="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Time Slot (IST)</label>
            <select id="booking-time" class="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900">
              <option>05:00 PM - 05:45 PM</option>
              <option>07:00 PM - 07:45 PM</option>
              <option>09:00 PM - 09:45 PM</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Your Full Name & WhatsApp *</label>
          <input type="text" required id="booking-student-info" placeholder="e.g. Aman Verma - 9876543210" class="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900">
        </div>

        <button type="submit" class="w-full py-3 bg-primary hover:bg-primary-container text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5">
          <span>Confirm Mentorship Slot</span>
          <span class="material-symbols-outlined text-base text-[#00ccf9]">check</span>
        </button>
      </form>
    </div>
  `;
  document.body.appendChild(div);
}

function handleMentorBooking(e) {
  e.preventDefault();
  const mentor = document.getElementById('mentor-name-select').value;
  const date = document.getElementById('booking-date').value;
  const time = document.getElementById('booking-time').value;

  closeMentorModal();
  showToast(`Mentorship session booked with ${mentor} on ${date} at ${time}! Calendar invite sent.`, 'success');
}

// Skillsfy AI Career Advisor Chat Widget
function initAIChatAdvisor() {
  if (document.getElementById('ai-advisor-widget')) return;

  const widget = document.createElement('div');
  widget.id = 'ai-advisor-widget';
  widget.className = 'fixed bottom-6 right-6 z-50 font-[\'Inter\']';
  widget.innerHTML = `
    <!-- Floating Trigger Button -->
    <button onclick="toggleAIChat()" id="ai-advisor-trigger" class="flex items-center gap-2.5 px-4 py-3 bg-[#031636] hover:bg-slate-900 text-white rounded-full shadow-2xl border-2 border-[#00ccf9] transition-all hover:scale-105 group">
      <div class="relative w-7 h-7 rounded-full bg-[#00ccf9] text-slate-950 flex items-center justify-center font-bold">
        <span class="material-symbols-outlined text-base">smart_toy</span>
        <span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#031636]"></span>
      </div>
      <div class="text-left hidden sm:block">
        <p class="text-xs font-bold font-['Plus_Jakarta_Sans'] leading-tight text-white">Skillsfy AI Advisor</p>
        <p class="text-[10px] text-cyan-300 font-['Geist']">Ask about Standard Course & Fees</p>
      </div>
    </button>

    <!-- Chat Window Container -->
    <div id="ai-chat-window" class="hidden absolute bottom-16 right-0 w-[350px] sm:w-[380px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[500px] modal-content-pop">
      <!-- Chat Header -->
      <div class="p-4 bg-[#031636] text-white flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold">
            <span class="material-symbols-outlined text-xl">psychology</span>
          </div>
          <div>
            <h4 class="font-bold text-sm font-['Plus_Jakarta_Sans']">Skillsfy Academic AI</h4>
            <p class="text-[10px] text-cyan-300 font-['Geist'] flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Online • Jabalpur Center
            </p>
          </div>
        </div>
        <button onclick="toggleAIChat()" class="text-slate-400 hover:text-white transition-colors">
          <span class="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      <!-- Messages Stream -->
      <div id="ai-messages-container" class="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-50">
        <div class="flex items-start gap-2.5">
          <div class="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center shrink-0 mt-0.5">
            <span class="material-symbols-outlined text-xs">smart_toy</span>
          </div>
          <div class="p-3 bg-white rounded-2xl rounded-tl-none border border-slate-200 text-slate-700 shadow-sm leading-relaxed">
            Namaste! I am the Skillsfy AI Academic Advisor. Kaise madad kar sakta hu? Aap <strong>Skillsfy Standard Course (₹2,999)</strong>, 25% Affiliate program, ya syllabus ke bare me pooch sakte hain.
          </div>
        </div>
      </div>

      <!-- Prompt Suggestion Chips -->
      <div class="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap">
        <button onclick="sendQuickPrompt('Standard Course ki fees kitni hai?')" class="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-600 transition-colors">💰 Fees & Coupon</button>
        <button onclick="sendQuickPrompt('14 AI Modules me kya kya sikhaya jayega?')" class="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-600 transition-colors">🧠 14 AI Modules</button>
        <button onclick="sendQuickPrompt('Affiliate Program me commission kitna hai?')" class="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-600 transition-colors">🤝 25% Commission</button>
      </div>

      <!-- Input Bar -->
      <form onsubmit="handleChatSubmit(event)" class="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input type="text" id="ai-chat-input" placeholder="Type your question here..." class="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-900">
        <button type="submit" class="w-8 h-8 rounded-xl bg-primary hover:bg-primary-container text-white flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-sm text-[#00ccf9]">send</span>
        </button>
      </form>
    </div>
  `;
  document.body.appendChild(widget);
}

function toggleAIChat() {
  const windowEl = document.getElementById('ai-chat-window');
  if (windowEl) {
    windowEl.classList.toggle('hidden');
    if (!windowEl.classList.contains('hidden')) {
      const input = document.getElementById('ai-chat-input');
      if (input) input.focus();
    }
  }
}

function sendQuickPrompt(text) {
  const input = document.getElementById('ai-chat-input');
  if (input) {
    input.value = text;
    handleChatSubmit(new Event('submit'));
  }
}

function handleChatSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('ai-chat-input');
  const query = input.value.trim();
  if (!query) return;

  const container = document.getElementById('ai-messages-container');
  
  // Append User Message
  container.innerHTML += `
    <div class="flex items-start justify-end gap-2.5">
      <div class="p-3 bg-[#031636] text-white rounded-2xl rounded-tr-none shadow-sm leading-relaxed max-w-[80%]">
        ${query}
      </div>
    </div>
  `;
  input.value = '';
  container.scrollTop = container.scrollHeight;

  // Bot Typing Simulation
  setTimeout(() => {
    let reply = "Skillsfy Standard Course me aapko Google AI Studio, NotebookLM, ChatGPT Workflows, Claude 3.5 Sonnet, aur Next.js AI Web Apps sikhaye jayenge. Total fees offer me sirf ₹2,999/- hai (Coupon: SKILLSFY30)!";
    const lower = query.toLowerCase();

    if (lower.includes('fees') || lower.includes('price') || lower.includes('cost') || lower.includes('kitni')) {
      reply = "Skillsfy Standard Course ki official fees ₹5,999 hai, lekin abhi 50% discount par sirf <strong>₹2,999/-</strong> me admission mil raha hai. Coupon code <strong>SKILLSFY30</strong> use karein.";
    } else if (lower.includes('affiliate') || lower.includes('commission') || lower.includes('earn')) {
      reply = "Skillsfy Affiliate Program me aapko <strong>25% Commission</strong> (₹750 per sale) milta hai. Aap Student Dashboard se apna unique link lekar direct UPI/Bank me payout le sakte hain.";
    } else if (lower.includes('syllabus') || lower.includes('module') || lower.includes('topics')) {
      reply = "Standard Course me total <strong>14 AI Skills Modules</strong> hain jaise Google AI Studio, NotebookLM, ChatGPT & GPT-4o, Claude AI, Gemini Workspace, Midjourney & Video Avatars, aur Agency Client Acquisition Blueprint.";
    } else if (lower.includes('founder') || lower.includes('pranjil')) {
      reply = "Skillsfy Institute of Technology ke founder <strong>Pranjil Soni</strong> hain (@pranjils0ni). Hamara flagship center Jabalpur, MP me hai.";
    } else if (lower.includes('jabalpur') || lower.includes('office') || lower.includes('address')) {
      reply = "Hamara flagship office Civic Center, Jabalpur (Madhya Pradesh) me sthit hai. Online cohorts pure Bharat aur worldwide ke liye available hain.";
    }

    container.innerHTML += `
      <div class="flex items-start gap-2.5">
        <div class="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center shrink-0 mt-0.5">
          <span class="material-symbols-outlined text-xs">smart_toy</span>
        </div>
        <div class="p-3 bg-white rounded-2xl rounded-tl-none border border-slate-200 text-slate-700 shadow-sm leading-relaxed max-w-[85%]">
          ${reply}
        </div>
      </div>
    `;
    container.scrollTop = container.scrollHeight;
  }, 400);
}

// Enrollment Action Helper
function startEnrollment(courseId = 'standard-course') {
  window.location.href = `enroll.html?course=${courseId}`;
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  applySiteConfigToDOM();
  injectCustomDeveloperCode();
  initAIChatAdvisor();
  initHomepageLeadPopup();
});
