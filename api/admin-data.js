/**
 * VERCEL SERVERLESS FUNCTION: /api/admin-data
 * Strictly Protected Master Data Endpoint
 * Requires Cryptographically Signed Admin Bearer Token.
 * DevTools inspection yields ZERO data without this valid token.
 */
const crypto = require('crypto');
const https = require('https');

const SERVER_SECRET = process.env.SESSION_SECRET || 'skf_prod_auth_secret_jwt_hmac_2026_987xzy41';
const SUPABASE_PROJECT_URL = process.env.SUPABASE_URL || 'https://iqssjqfyfdmujlmlbjhl.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxc3NqcWZ5ZmRtdWpsbWxiamhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxMzY3NzIsImV4cCI6MjEwMjcxMjc3Mn0.o7gGbhiuRkLxxJCRJNM1RzBrIVHnOTxuzX0-EOQVyyU';

function verifySignedToken(tokenString) {
  if (!tokenString || typeof tokenString !== 'string') return null;
  const parts = tokenString.split('.');
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', SERVER_SECRET).update(`${header}.${body}`).digest('base64url');

  if (signature !== expectedSignature) {
    return null; // Tampered or invalid signature
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch (e) {
    return null;
  }
}

function fetchSupabaseTable(table, query = 'select=*') {
  return new Promise((resolve) => {
    const url = new URL(`/rest/v1/${table}?${query}`, SUPABASE_PROJECT_URL);
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
          resolve(JSON.parse(data));
        } catch (e) {
          resolve([]);
        }
      });
    });
    req.on('error', () => resolve([]));
    req.end();
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. EXTRACT & VERIFY BEARER TOKEN
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Missing Authorization Bearer Token. Admin privileges required.'
    });
  }

  const payload = verifySignedToken(token);
  if (!payload || payload.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access Denied: Invalid or expired Administrator cryptographic token.'
    });
  }

  // 2. TOKEN IS VALID ADMIN - FETCH ALL PLATFORM DATA
  try {
    const [payments, workshopRegs, studentsRaw, courses, coupons, blogs, enquiries] = await Promise.all([
      fetchSupabaseTable('payments', 'order=created_at.desc&select=*'),
      fetchSupabaseTable('workshop_registrations', 'order=created_at.desc&select=*'),
      fetchSupabaseTable('students', 'order=created_at.desc&select=*'),
      fetchSupabaseTable('courses', 'select=*'),
      fetchSupabaseTable('coupons', 'select=*'),
      fetchSupabaseTable('blogs', 'select=*'),
      fetchSupabaseTable('enquiries', 'order=created_at.desc&select=*')
    ]);

    // Sanitize student records to prevent leaking passwords
    const studentsSanitized = Array.isArray(studentsRaw) ? studentsRaw.map(s => {
      const copy = { ...s };
      delete copy.password_hash;
      return copy;
    }) : [];

    return res.status(200).json({
      success: true,
      admin: {
        name: payload.name || 'Pranjil Soni',
        email: payload.email || 'theskillsfy@gmail.com',
        verifiedAt: new Date().toISOString()
      },
      data: {
        payments: Array.isArray(payments) ? payments : [],
        workshop_registrations: Array.isArray(workshopRegs) ? workshopRegs : [],
        students: studentsSanitized,
        courses: Array.isArray(courses) ? courses : [],
        coupons: Array.isArray(coupons) ? coupons : [],
        blogs: Array.isArray(blogs) ? blogs : [],
        enquiries: Array.isArray(enquiries) ? enquiries : []
      }
    });

  } catch (error) {
    console.error('Admin data fetch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to aggregate administrative platform data.'
    });
  }
};
