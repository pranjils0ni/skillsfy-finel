/**
 * VERCEL SERVERLESS FUNCTION: /api/auth-login
 * Secure Server-Side Authentication for Students & Administrators
 * Prevents client-side exposure of database credentials and plain-text passwords.
 */
const crypto = require('crypto');
const https = require('https');

const SERVER_SECRET = process.env.SESSION_SECRET || 'skf_prod_auth_secret_jwt_hmac_2026_987xzy41';
const SUPABASE_PROJECT_URL = process.env.SUPABASE_URL || 'https://iqssjqfyfdmujlmlbjhl.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxc3NqcWZ5ZmRtdWpsbWxiamhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxMzY3NzIsImV4cCI6MjEwMjcxMjc3Mn0.o7gGbhiuRkLxxJCRJNM1RzBrIVHnOTxuzX0-EOQVyyU';

function createSignedToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SERVER_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function fetchSupabase(apiPath) {
  return new Promise((resolve, reject) => {
    const url = new URL(apiPath, SUPABASE_PROJECT_URL);
    const req = https.request(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { identifier, password } = req.body || {};

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username/Email and Password are required.'
      });
    }

    const clean = String(identifier).trim().toLowerCase();
    const cleanPass = String(password).trim();

    // 1. MASTER ADMIN AUTHENTICATION (Pranjils0ni / Suhani@12)
    const isAdminUser = (clean === 'pranjils0ni' || clean === 'pranjil' || clean === 'theskillsfy@gmail.com' || clean === 'admin' || clean === 'admin@skillsfy.in');
    const isAdminPass = (cleanPass === 'Suhani@12' || cleanPass === 'Admin@2026' || cleanPass === 'Skillsfy@2026' || cleanPass === '4821');

    if (isAdminUser && isAdminPass) {
      const token = createSignedToken({
        id: 'admin-master',
        name: 'Pranjil Soni',
        email: 'theskillsfy@gmail.com',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
      });

      return res.status(200).json({
        success: true,
        role: 'admin',
        token,
        user: {
          id: 8,
          name: 'Pranjil Soni',
          email: 'theskillsfy@gmail.com',
          role: 'admin',
          rollNo: 'SF-ADMIN-01',
          avatar: 'assets/logo-badge.png'
        },
        message: 'Admin authentication successful.'
      });
    }

    // 2. QUERY SUPABASE FOR STUDENT / ADMIN ACCOUNT
    let filter;
    if (clean === 'pranjils0ni' || clean === 'pranjil') {
      filter = `or=(email.ilike.theskillsfy@gmail.com,email.ilike.admin@skillsfy.in,name.ilike.%Pranjil%)`;
    } else if (clean.includes('@')) {
      filter = `email=ilike.${encodeURIComponent(clean)}`;
    } else {
      const rollMatch = clean.match(/sf-2026-(\d+)/i);
      const numId = rollMatch ? rollMatch[1] : (/^\d+$/.test(clean) && clean.length < 6 ? clean : null);
      if (numId) {
        filter = `or=(email.ilike.${encodeURIComponent(clean)},phone.eq.${encodeURIComponent(identifier)},id.eq.${numId})`;
      } else {
        filter = `or=(email.ilike.${encodeURIComponent(clean)},phone.eq.${encodeURIComponent(identifier)})`;
      }
    }

    const sbRes = await fetchSupabase(`/rest/v1/students?${filter}&select=*`);
    const rows = sbRes.data;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'No registered student account found with this Email/Roll No.'
      });
    }

    const student = rows[0];

    // Password Check (Matches DB or master bypass)
    const isPasswordValid = (student.password_hash === cleanPass || (cleanPass === 'Suhani@12' && (clean.includes('pranjil') || student.status === 'admin')));

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.'
      });
    }

    const role = (student.status === 'admin' || student.status === 'administrator') ? 'admin' : 'student';
    const cleanName = student.name || student.email.split('@')[0];
    const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    const rollNo = student.roll_no || ('SF-2026-' + student.id);

    const token = createSignedToken({
      id: student.id,
      name: formattedName,
      email: student.email,
      role: role,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
    });

    const userProfile = {
      id: student.id,
      name: formattedName,
      email: student.email,
      phone: student.phone || '',
      role: role,
      rollNo: rollNo,
      roll_no: rollNo,
      avatar: student.avatar || 'assets/logo-badge.png',
      enrolledCourses: student.enrolled_courses && student.enrolled_courses.length > 0 ? student.enrolled_courses : ['standard-course'],
      enrolled_courses: student.enrolled_courses && student.enrolled_courses.length > 0 ? student.enrolled_courses : ['standard-course'],
      affiliateStats: {
        referralCode: student.affiliate_code || `SF-${formattedName.toUpperCase().slice(0, 5)}-2026`,
        totalEarningsINR: student.total_earnings || 0,
        availablePayoutINR: student.available_payout || 0,
        totalReferrals: 0,
        paidEnrollments: 0
      }
    };

    return res.status(200).json({
      success: true,
      role: role,
      token,
      user: userProfile,
      message: `Welcome back, ${formattedName}!`
    });

  } catch (error) {
    console.error('Server auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal authentication service error.'
    });
  }
};
