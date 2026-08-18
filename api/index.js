/**
 * VERCEL SERVERLESS ENTRYPOINT
 * Skillsfy Institute of Technology
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });
const app = require('../backend/server');

module.exports = app;
