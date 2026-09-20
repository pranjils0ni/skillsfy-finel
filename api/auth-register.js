/**
 * VERCEL SERVERLESS FUNCTION: /api/auth-register
 * Secure Server-Side Student Registration
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

function requestSupabase(method, apiPath, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(apiPath, SUPABASE_PROJECT_URL);
    const postData = body ? JSON.stringify(body) : null;
    const req = https.request(url, {
      method: method,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
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
    if (postData) req.write(postData);
    req.end();
  });
}

module.exports = async (req, res) => {
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
    const { name, email, phone, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, Email and Password are required.'
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();
    const cleanPhone = String(phone || '').trim();
    const cleanPass = String(password).trim();

    if (cleanPass.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // 1. Check duplicate email
    const checkRes = await requestSupabase('GET', `/rest/v1/students?email=ilike.${encodeURIComponent(cleanEmail)}&select=id`);
    if (Array.isArray(checkRes.data) && checkRes.data.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please Sign In.'
      });
    }

    // 2. Insert new student into Supabase
    const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    const affCode = `SF-${formattedName.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5) || 'STUD'}-${Math.floor(100 + Math.random() * 900)}`;

    const insertRes = await requestSupabase('POST', '/rest/v1/students', {
      name: formattedName,
      email: cleanEmail,
      phone: cleanPhone,
      password_hash: cleanPass,
      affiliate_code: affCode,
      city: 'Online',
      status: 'active',
      enrolled_courses: ['standard-course']
    });

    if (insertRes.status >= 400 || !Array.isArray(insertRes.data) || insertRes.data.length === 0) {
      console.error('Insert error in Supabase:', insertRes.data);
      return res.status(500).json({
        success: false,
        message: 'Database registration failed. Please try again.'
      });
    }

    const student = insertRes.data[0];
    const rollNo = 'SF-2026-' + student.id;

    const token = createSignedToken({
      id: student.id,
      name: formattedName,
      email: student.email,
      role: 'student',
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
    });

    const userProfile = {
      id: student.id,
      name: formattedName,
      email: student.email,
      phone: student.phone || '',
      role: 'student',
      rollNo: rollNo,
      roll_no: rollNo,
      avatar: 'assets/logo-badge.png',
      enrolledCourses: ['standard-course'],
      enrolled_courses: ['standard-course'],
      affiliateStats: {
        referralCode: affCode,
        totalEarningsINR: 0,
        availablePayoutINR: 0,
        totalReferrals: 0,
        paidEnrollments: 0
      }
    };

    return res.status(201).json({
      success: true,
      token,
      user: userProfile,
      message: 'Account created successfully! Welcome to Skillsfy.'
    });

  } catch (error) {
    console.error('Server registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal registration service error.'
    });
  }
};
