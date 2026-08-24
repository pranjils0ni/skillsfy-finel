/**
-- VERCEL SERVERLESS FUNCTION: /api/seats
-- Real-time seat inventory calculation from database
*/
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iqssjqfyfdmujlmlbjhl.supabase.co';
    const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxc3NqcWZ5ZmRtdWpsbWxiamhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxMzY3NzIsImV4cCI6MjEwMjcxMjc3Mn0.o7gGbhiuRkLxxJCRJNM1RzBrIVHnOTxuzX0-EOQVyyU';
    const courseSlug = req.query.course || 'workshop-30-aug';

    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    };

    // 1. Fetch course configuration
    let totalSeats = courseSlug === 'workshop-30-aug' ? 150 : 50;
    try {
      const courseRes = await fetch(`${SUPABASE_URL}/rest/v1/courses?slug=eq.${courseSlug}&select=*`, { headers });
      if (courseRes.ok) {
        const courses = await courseRes.json();
        if (Array.isArray(courses) && courses.length > 0 && courses[0].total_seats) {
          totalSeats = parseInt(courses[0].total_seats, 10);
        }
      }
    } catch (e) {}

    // 2. Fetch confirmed paid enrollments
    let filledSeats = 0;
    try {
      if (courseSlug === 'workshop-30-aug') {
        const regRes = await fetch(`${SUPABASE_URL}/rest/v1/workshop_registrations?payment_status=eq.paid&select=id`, { headers });
        if (regRes.ok) {
          const regs = await regRes.json();
          if (Array.isArray(regs)) filledSeats = regs.length;
        }
      } else {
        const enrollRes = await fetch(`${SUPABASE_URL}/rest/v1/enrollments?course_slug=eq.${courseSlug}&status=eq.active&select=id`, { headers });
        if (enrollRes.ok) {
          const enrolls = await enrollRes.json();
          if (Array.isArray(enrolls)) filledSeats = enrolls.length;
        }
      }
    } catch (e) {}

    const availableSeats = Math.max(0, totalSeats - filledSeats);
    const isSoldOut = availableSeats <= 0;

    return res.status(200).json({
      success: true,
      course_slug: courseSlug,
      total_seats: totalSeats,
      filled_seats: filledSeats,
      available_seats: availableSeats,
      is_sold_out: isSoldOut,
      percent_filled: Math.min(100, Math.round((filledSeats / totalSeats) * 100))
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Error fetching seat inventory'
    });
  }
};
