/**
 * SKILLSFY PLATFORM DATA REPOSITORY
 * Configured for Skillsfy - Institute of Technology (Jabalpur Center)
 * Founder: Pranjil Soni (@pranjils0ni)
 * Contact: theskillsfy@gmail.com | +91 0000000000
 */

const SKILLSFY_GLOBAL_CONFIG = {
  name: "Skillsfy - Institute of Technology",
  tagline: "Build Skills for the future that matter",
  email: "theskillsfy@gmail.com",
  phone: "+91 0000000000",
  address: "Civic Center, Jabalpur, Madhya Pradesh - 482002, India",
  officeNote: "Currently operating from our flagship Jabalpur Center. Expanding to Bhopal & Indore soon!",
  founder: {
    name: "Pranjil Soni",
    role: "Founder & CEO, Skillsfy Institute",
    avatar: "assets/founder.jpg",
    bio: "Passionate tech educator and digital entrepreneur on a mission to empower youth from Jabalpur and across India with high-income AI, engineering, and digital business skills.",
    socials: {
      instagram: "https://instagram.com/pranjils0ni",
      youtube: "https://youtube.com/@pranjils0ni",
      linkedin: "https://linkedin.com/in/pranjils0ni",
      x: "https://x.com/pranjils0ni"
    }
  },
  socials: {
    instagram: "https://instagram.com/skillsfy",
    youtube: "https://youtube.com/@skillsfy",
    linkedin: "https://linkedin.com/company/skillsfy",
    x: "https://x.com/skillsfy"
  }
};

const SKILLSFY_COURSES = [
  {
    id: "standard-course",
    title: "Skillsfy Standard Course: AI + Digital Business Masterclass",
    subtitle: "Stop watching random tutorials. Master 14+ AI tools, automation workflows, full-stack AI apps, and digital business strategies in Hinglish.",
    category: "AI & Digital Business",
    badge: "Flagship Program",
    level: "Beginner to Pro",
    status: "active", // active | coming_soon | disabled
    rating: 4.98,
    reviewsCount: 2840,
    duration: "50+ Hours (8 Weeks)",
    hoursPerWeek: "6-8 hrs/week",
    language: "Hinglish",
    nextCohort: "Starts Next Monday (Limited 50 Seats)",
    priceOriginalINR: 5999,
    priceCurrentINR: 2999,
    couponCode: "SKILLSFY30",
    discountPercent: "50% OFF",
    affiliateCommissionPercent: 25, // 25% commission (₹749.75) for affiliates only
    affiliateCommissionAmount: 750,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    instructor: {
      name: "Pranjil Soni & Skillsfy Tech Fellows",
      role: "Founder, AI Architects & Industry Mentors",
      avatar: "assets/founder.jpg",
      bio: "Hands-on, practical guidance from experienced builders delivering real-world projects and agency monetization frameworks."
    },
    stats: {
      placementRate: "97.8%",
      avgSalaryHike: "+75%",
      handsOnProjects: "14 Practical Projects + 3 Live Capstones"
    },
    overview: "The Standard Course is engineered to take you from a complete beginner to an industry-ready AI practitioner and digital entrepreneur. No fluff, no theory-only lectures—learn by building real portfolio-worthy AI applications.",
    bonuses: [
      { title: "500+ AI Prompt Libraries", value: "₹5,000", desc: "Copy-paste production prompts for ChatGPT, Claude, and Midjourney." },
      { title: "12+ AI Cheatsheets & Architecture Decks", value: "₹4,000", desc: "Quick reference guides for Transformers, RAG, and API integration." },
      { title: "Agency Client Landing Blueprint", value: "₹8,000", desc: "Step-by-step roadmap to get high-paying international freelance clients." }
    ],
    outcomes: [
      "Master 14+ State-of-the-Art AI tools (Google AI Studio, NotebookLM, Claude 3.5, GPT-4o, Gemini Workspace).",
      "Build and deploy Full-Stack AI web applications powered by LLM APIs.",
      "Automate business operations, lead generation, and content workflows with Make/Zapier.",
      "Launch a profitable AI freelance agency or digital product business.",
      "Earn a cryptographically verified Skillsfy Certificate with a unique student roll number."
    ],
    curriculum: [
      {
        moduleNumber: "01",
        title: "Google AI Studio & Generative AI Fundamentals",
        lessonsCount: 5,
        duration: "3.0 Hours",
        lessons: [
          { id: "std-1", title: "1.1 Introduction to Generative AI & Next-Gen LLMs", duration: "15m", type: "video" },
          { id: "std-2", title: "1.2 Setting up Google AI Studio & Gemini Pro Keys", duration: "22m", type: "video" },
          { id: "std-3", title: "1.3 Advanced System Prompting & Temperature Tuning", duration: "35m", type: "video" },
          { id: "std-4", title: "1.4 Practical Lab: Zero-shot & Few-shot Prompt Architectures", duration: "40m", type: "lab" },
          { id: "std-5", title: "1.5 Module 1 Assessment & Quiz", duration: "15m", type: "quiz" }
        ]
      },
      {
        moduleNumber: "02",
        title: "Mastering NotebookLM & Deep Research Synthesis",
        lessonsCount: 4,
        duration: "2.5 Hours",
        lessons: [
          { id: "std-6", title: "2.1 Uploading Complex PDF Documents, URLs & Datasets", duration: "20m", type: "video" },
          { id: "std-7", title: "2.2 Source-Grounded Q&A & Generating AI Podcasts", duration: "30m", type: "video" },
          { id: "std-8", title: "2.3 Research Synthesis for Business & Academic Case Studies", duration: "45m", type: "project" }
        ]
      },
      {
        moduleNumber: "03",
        title: "ChatGPT & GPT-4o Automation Workflows",
        lessonsCount: 8,
        duration: "5.0 Hours",
        lessons: [
          { id: "std-9", title: "3.1 Custom GPTs: Building Domain-Specific AI Bots", duration: "35m", type: "video" },
          { id: "std-10", title: "3.2 Code Interpreter & Advanced Data Analytics", duration: "42m", type: "video" },
          { id: "std-11", title: "3.3 Connecting ChatGPT with Google Sheets & Webhooks", duration: "50m", type: "lab" }
        ]
      },
      {
        moduleNumber: "04",
        title: "Claude AI for High-Level Writing & Coding Mastery",
        lessonsCount: 6,
        duration: "4.0 Hours",
        lessons: [
          { id: "std-12", title: "4.1 Claude 3.5 Sonnet: Artifacts & Interactive UI Apps", duration: "30m", type: "video" },
          { id: "std-13", title: "4.2 Nuanced Copywriting & Technical Documentation", duration: "40m", type: "video" }
        ]
      },
      {
        moduleNumber: "05",
        title: "Gemini Workspace & Enterprise Productivity",
        lessonsCount: 5,
        duration: "3.5 Hours",
        lessons: [
          { id: "std-14", title: "5.1 Automating Google Docs, Sheets & Slides with Gemini", duration: "35m", type: "video" },
          { id: "std-15", title: "5.2 Google Labs, MusicFX & Experimental AI Toolkits", duration: "45m", type: "video" }
        ]
      },
      {
        moduleNumber: "06",
        title: "AI Media Creation: Image, Voice & Video Production",
        lessonsCount: 7,
        duration: "4.5 Hours",
        lessons: [
          { id: "std-16", title: "6.1 Midjourney & DALL-E 3 Photorealistic Prompting", duration: "35m", type: "video" },
          { id: "std-17", title: "6.2 ElevenLabs Voice Cloning & AI Video Avatars (HeyGen)", duration: "45m", type: "project" }
        ]
      },
      {
        moduleNumber: "07",
        title: "Full-Stack AI Web App Development",
        lessonsCount: 8,
        duration: "6.0 Hours",
        lessons: [
          { id: "std-18", title: "7.1 Building a SaaS Wrapper with Next.js & Gemini API", duration: "55m", type: "video" },
          { id: "std-19", title: "7.2 User Authentication, Stripe Payments & Cloud Deploy", duration: "65m", type: "lab" }
        ]
      },
      {
        moduleNumber: "08",
        title: "Digital Business Strategy & High-Ticket Client Acquisition",
        lessonsCount: 6,
        duration: "4.5 Hours",
        lessons: [
          { id: "std-20", title: "8.1 Positioning & Creating Your AI Service Offer", duration: "40m", type: "video" },
          { id: "std-21", title: "8.2 Cold Outreach, Pitch Decks & Closing International Clients", duration: "50m", type: "video" },
          { id: "std-22", title: "8.3 Capstone Project Submission & Verified Certificate Award", duration: "30m", type: "project" }
        ]
      }
    ]
  },
  {
    id: "performance-marketing",
    title: "Performance Marketing & Paid Ads Mastery",
    subtitle: "Scale high-converting Meta Ads, Google PPC, TikTok & YouTube Funnels with AI copy and ROAS tracking.",
    category: "Growth & Marketing",
    badge: "Coming Soon",
    level: "All Levels",
    status: "coming_soon",
    rating: 5.0,
    reviewsCount: 0,
    duration: "6 Weeks",
    hoursPerWeek: "6 hrs/week",
    language: "Hinglish",
    nextCohort: "Launching Soon (Pre-register Open)",
    priceOriginalINR: 4999,
    priceCurrentINR: 2499,
    couponCode: "EARLYBIRD",
    discountPercent: "50% OFF",
    affiliateCommissionPercent: 25,
    affiliateCommissionAmount: 625,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    instructor: {
      name: "Growth Leads & Performance Experts",
      role: "Scaled ₹2Cr+ in D2C & EdTech Ad Spend",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      bio: "Ex-agency media buyers managing multi-million rupee campaigns with laser-targeted CBOs, lookalikes, and conversion API tracking."
    },
    stats: {
      placementRate: "95%",
      avgSalaryHike: "+65%",
      handsOnProjects: "5 Live Ad Campaigns"
    },
    overview: "Master the exact media buying blueprints, creative testing frameworks, and custom landing page funnels used by top 1% performance marketers in India.",
    bonuses: [
      { title: "Top 50 High-Converting Ad Copy Templates", value: "₹3,500", desc: "Proven headlines and hooks for Meta & Google." }
    ],
    outcomes: [
      "Master Meta Ads Manager, CBO strategies, and dynamic creative testing.",
      "Build high-converting landing pages with 8%+ conversion rates.",
      "Configure Google Analytics 4, Tag Manager, and Meta Pixel Conversion API."
    ],
    curriculum: [
      {
        moduleNumber: "01",
        title: "Funnel Architecture & High-Converting Copy",
        lessonsCount: 4,
        duration: "3.0 Hours",
        lessons: [
          { id: "pm-1", title: "1.1 The Anatomy of 5X ROAS Funnels", duration: "30m", type: "video" }
        ]
      }
    ]
  },
  {
    id: "video-editing",
    title: "Advanced Video Editing & Viral Motion Graphics",
    subtitle: "Create viral short-form Reels, YouTube video documentaries, and cinematic commercial edits with Premiere Pro & After Effects.",
    category: "Creative Media",
    badge: "Coming Soon",
    level: "Beginner to Advanced",
    status: "coming_soon",
    rating: 5.0,
    reviewsCount: 0,
    duration: "6 Weeks",
    hoursPerWeek: "6-8 hrs/week",
    language: "Hinglish",
    nextCohort: "Launching Soon (Pre-register Open)",
    priceOriginalINR: 4999,
    priceCurrentINR: 2499,
    couponCode: "EARLYBIRD",
    discountPercent: "50% OFF",
    affiliateCommissionPercent: 25,
    affiliateCommissionAmount: 625,
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80",
    instructor: {
      name: "Top Viral Video Editors & Motion Artists",
      role: "Edited for Creators with 10M+ Combined Views",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      bio: "Mastering storytelling pacing, sound design, custom typography animations, and viral hook editing."
    },
    stats: {
      placementRate: "96%",
      avgSalaryHike: "+70%",
      handsOnProjects: "8 Client-Ready Portfolio Edits"
    },
    overview: "Turn raw footage into retention-heavy viral content. Learn sound engineering, custom color grading, motion graphics, and how to charge ₹15k–₹50k per creator client.",
    bonuses: [
      { title: "20GB+ Sound Effects & Motion Graphics Asset Pack", value: "₹6,000", desc: "Royalty-free swooshes, textures, LUTs, and typography presets." }
    ],
    outcomes: [
      "Master Adobe Premiere Pro, After Effects, and CapCut Pro workflows.",
      "Design retention-holding hooks, seamless transitions, and soundscapes.",
      "Build a portfolio that attracts top creators and corporate clients."
    ],
    curriculum: [
      {
        moduleNumber: "01",
        title: "Pacing, Storytelling & Hook Optimization",
        lessonsCount: 4,
        duration: "3.5 Hours",
        lessons: [
          { id: "ve-1", title: "1.1 The Science of 3-Second Retention Hooks", duration: "35m", type: "video" }
        ]
      }
    ]
  },
  {
    id: "social-media-marketing",
    title: "Organic Social Media Marketing & Personal Branding",
    subtitle: "Grow from 0 to 100K+ organic followers on Instagram, LinkedIn & YouTube. Monitize through brand deals and digital products.",
    category: "Organic Growth",
    badge: "Coming Soon",
    level: "All Levels",
    status: "coming_soon",
    rating: 5.0,
    reviewsCount: 0,
    duration: "4 Weeks",
    hoursPerWeek: "5 hrs/week",
    language: "Hinglish",
    nextCohort: "Launching Soon (Pre-register Open)",
    priceOriginalINR: 3999,
    priceCurrentINR: 1999,
    couponCode: "EARLYBIRD",
    discountPercent: "50% OFF",
    affiliateCommissionPercent: 25,
    affiliateCommissionAmount: 500,
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80",
    instructor: {
      name: "Personal Brand Strategists",
      role: "Grew 500k+ Combined Organic Followers",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      bio: "Specializing in organic content algorithms, viral carousel design, newsletter building, and high-ticket consulting offers."
    },
    stats: {
      placementRate: "94%",
      avgSalaryHike: "+60%",
      handsOnProjects: "3 Live Social Accounts Scaled"
    },
    overview: "Build an unstoppable personal brand that attracts opportunities to you while you sleep. Learn content frameworks, algorithm secrets, and community monetization.",
    bonuses: [
      { title: "365-Day Viral Content Calendar & Hooks", value: "₹4,000", desc: "Never run out of content ideas across LinkedIn and Instagram." }
    ],
    outcomes: [
      "Master Instagram algorithm, carousels, and viral short-form hooks.",
      "Build high-trust LinkedIn personal brands that attract client DMs.",
      "Package your expertise into consulting, coaching, or digital products."
    ],
    curriculum: [
      {
        moduleNumber: "01",
        title: "Content Engine & Algorithm Fundamentals",
        lessonsCount: 4,
        duration: "2.5 Hours",
        lessons: [
          { id: "sm-1", title: "1.1 Profile Optimization & Magnetic Positioning", duration: "30m", type: "video" }
        ]
      }
    ]
  }
];

// Indian Fast-Growing Startups & Tech Brands for Trust Strip
const INDIAN_TECH_PARTNERS = [
  { name: "Swiggy", tag: "Tech Ecosystem" },
  { name: "Zomato", tag: "Product & Growth" },
  { name: "Razorpay", tag: "Fintech & Engineering" },
  { name: "Zepto", tag: "Quick Commerce" },
  { name: "CRED", tag: "High-Performance Tech" },
  { name: "Meesho", tag: "E-Commerce Innovation" },
  { name: "Groww", tag: "Fintech Platforms" },
  { name: "InMobi", tag: "Global AdTech" }
];

const SKILLSFY_TESTIMONIALS = [
  {
    name: "Aman Verma",
    location: "Jabalpur, MP",
    role: "AI Automation Specialist at Indian Tech Startup",
    pastRole: "B.Tech Final Year Student",
    hike: "Placed at ₹8.2 LPA",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
    quote: "Jabalpur me rahke mujhe laga tha ki achhi tech job milna mushkil hai. Pranjil bhaiya ke Skillsfy Standard Course ne Google AI Studio aur Make automations sikha ke mera pura confidence badal diya. 2 mahine me placement mil gaya!"
  },
  {
    name: "Pooja Sharma",
    location: "Bhopal, MP",
    role: "Freelance AI Consultant & Media Creator",
    pastRole: "College Fresher",
    hike: "Earns ₹1.4 Lakh / Month",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    quote: "Standard Course ke sath jo Client Acquisition Blueprint mila usse mujhe 3 freelance clients mile. 14 AI modules itne practical aur Hinglish me hain ki bina coding background ke bhi sab samajh aata hai."
  },
  {
    name: "Rohit Deshmukh",
    location: "Indore, MP",
    role: "Full-Stack AI Developer",
    pastRole: "Junior Web Developer",
    hike: "+85% Salary Leap",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
    quote: "ChatGPT workflows, Claude 3.5 Sonnet aur Next.js AI integrations ne mera standard badha diya. Skillsfy Institute ka support aur practical training sach me 100% genuine hai."
  }
];

const INITIAL_STUDENT_PROFILE = {
  name: "Pranjil Soni",
  email: "theskillsfy@gmail.com",
  phone: "+91 0000000000",
  studentId: "SF-2026-8942",
  avatar: "assets/founder.jpg",
  currentStreak: 14,
  hoursLearned: 32.5,
  completedLessons: 16,
  avgQuizScore: "98%",
  enrolledCourses: ["standard-course"],
  courseProgress: {
    "standard-course": {
      percent: 65,
      completedLessons: ["std-1", "std-2", "std-3"],
      currentLessonId: "std-4",
      lastActive: "Today at 5:15 PM"
    }
  },
  affiliateStats: {
    referralCode: "SF-PRANJIL-2026",
    referralLink: "http://localhost:3000/enroll.html?ref=SF-PRANJIL-2026",
    commissionRate: "25%",
    totalClicks: 148,
    totalLeads: 24,
    paidEnrollments: 6,
    totalEarningsINR: 4500,
    paidOutINR: 1500,
    pendingPayoutINR: 3000,
    bankDetails: {
      bankName: "State Bank of India",
      accountNumber: "•••• •••• 4821",
      ifsc: "SBIN0001234",
      upiId: "pranjil@upi"
    },
    payoutHistory: [
      { id: "PAY-901", amount: 1500, date: "2026-08-10", method: "UPI (pranjil@upi)", status: "Paid (Transferred)" },
      { id: "PAY-902", amount: 3000, date: "2026-08-16", method: "UPI (pranjil@upi)", status: "Pending Verification" }
    ]
  },
  notes: {
    "std-1": "Generative AI relies on foundation transformer models. Google AI Studio gives direct API access with zero latency!",
    "std-2": "Temperature controls randomness: 0.0 for deterministic code/facts, 0.7 for creative writing."
  },
  certificates: [
    {
      id: "SF-2026-7821",
      courseId: "standard-course",
      title: "Certified AI + Digital Business Specialist",
      issueDate: "August 15, 2026",
      grade: "Grade A+ (98%)",
      verificationUrl: "verify.html?id=SF-2026-7821"
    }
  ]
};

const INITIAL_TEAM_MEMBERS = [
  {
    id: "TM-001",
    name: "Pranjil Soni",
    email: "theskillsfy@gmail.com",
    role: "Super Admin",
    phone: "+91 0000000000",
    status: "Active",
    assignedLeads: 45,
    permissions: "Full Access"
  },
  {
    id: "TM-002",
    name: "Admissions Counselor Lead",
    email: "counselor@skillsfy.edu",
    role: "Lead Counselor & Telecaller",
    phone: "+91 98765 00001",
    status: "Active",
    assignedLeads: 18,
    permissions: "View Assigned Leads & Log Calls"
  },
  {
    id: "TM-003",
    name: "Operations & Handover Manager",
    email: "operations@skillsfy.edu",
    role: "Task & Team Dispatcher",
    phone: "+91 98765 00002",
    status: "Active",
    assignedLeads: 12,
    permissions: "Lead Assignment & Handover"
  },
  {
    id: "TM-004",
    name: "Affiliate Finance Manager",
    email: "finance@skillsfy.edu",
    role: "Affiliate Payout Manager",
    phone: "+91 98765 00003",
    status: "Active",
    assignedLeads: 0,
    permissions: "Approve/Reject Affiliate Payouts"
  }
];

const INITIAL_ENQUIRIES = [
  {
    id: "ENQ-101",
    name: "Vikram Malhotra",
    email: "vikram.m@gmail.com",
    phone: "+91 98765 43210",
    city: "Jabalpur",
    course: "Skillsfy Standard Course: AI + Digital Business",
    experience: "College Student / Fresher",
    assignedTo: "Admissions Counselor Lead",
    status: "New",
    date: "2026-08-17",
    notes: "Requested syllabus PDF on WhatsApp. Interested in ₹2,999 Standard Course."
  },
  {
    id: "ENQ-102",
    name: "Anjali Gupta",
    email: "anjali.g@gmail.com",
    phone: "+91 98123 45678",
    city: "Bhopal",
    course: "Skillsfy Standard Course: AI + Digital Business",
    experience: "Working Professional (1-2 yrs)",
    assignedTo: "Operations & Handover Manager",
    status: "Contacted",
    date: "2026-08-16",
    notes: "Counselor called. Sent coupon code SKILLSFY30 for ₹2,999 admission."
  },
  {
    id: "ENQ-103",
    name: "Rohit Deshmukh",
    email: "rohit.d@techsys.com",
    phone: "+91 99221 13344",
    city: "Indore",
    course: "Skillsfy Standard Course: AI + Digital Business",
    experience: "Freelance Creator",
    assignedTo: "Admissions Counselor Lead",
    status: "Enrolled",
    date: "2026-08-15",
    notes: "Admitted into Standard Course. UPI Payment verified (₹2,999)."
  }
];

const INITIAL_PROFILE_REQUESTS = [
  {
    id: "REQ-301",
    studentId: "SF-2026-8942",
    currentName: "Pranjil Soni",
    requestedName: "Pranjil Soni",
    currentEmail: "theskillsfy@gmail.com",
    requestedEmail: "theskillsfy@gmail.com",
    requestedPhone: "+91 98765 43210",
    reason: "Updating official contact phone number for WhatsApp class links.",
    otpVerified: true,
    status: "Pending Approval",
    date: "2026-08-17"
  }
];

const LMS_QUIZ_SAMPLE = {
  title: "Knowledge Check: Generative AI & Google AI Studio",
  questions: [
    {
      id: "q1",
      question: "In Google AI Studio and LLM APIs, what does lowering the 'Temperature' parameter to 0.0 achieve?",
      options: [
        "It makes the response completely random and creative.",
        "It makes the output deterministic, factual, and strictly reproducible.",
        "It turns off the model's safety filters.",
        "It speeds up GPU training time."
      ],
      correctIndex: 1,
      explanation: "A low temperature (0.0) selects the highest probability tokens, producing consistent, factual, and repeatable answers ideal for code and data analysis."
    },
    {
      id: "q2",
      question: "What is the primary advantage of NotebookLM over standard chatbots?",
      options: [
        "It generates 3D video animations automatically.",
        "It grounds all answers strictly in your uploaded PDF/source documents with exact citations, preventing hallucinations.",
        "It does not require internet connection.",
        "It only works with voice commands."
      ],
      correctIndex: 1,
      explanation: "NotebookLM is a source-grounded research notebook that cites exact source paragraphs from your uploaded notes, research papers, and documents."
    },
    {
      id: "q3",
      question: "How do 25% Affiliate Commissions benefit Skillsfy students and partners?",
      options: [
        "Students earn 25% (₹750) on every peer referred to the ₹2,999 Standard Course, withdrawing directly to UPI/Bank.",
        "It gives free pizza deliveries.",
        "It slows down website traffic.",
        "It creates Bitcoin blockchain miners."
      ],
      correctIndex: 0,
      explanation: "Skillsfy partners earn a generous 25% commission (₹750 per sale) for sharing real learning skills with their network, cleared directly via UPI or Bank transfer."
    }
  ]
};
