/**
 * CERTIFICATE GENERATION SERVICE
 * SkillsFy Institute of Technology
 * Automatically creates Unique Code, QR Code, PDF Certificate & SHA-256 Hash.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const Certificate = require('../models/Certificate');

// Ensure certificates output folder exists
const CERT_DIR = path.join(__dirname, '../certificates');
if (!fs.existsSync(CERT_DIR)) {
  fs.mkdirSync(CERT_DIR, { recursive: true });
}

class CertificateService {
  /**
   * Generate a unique certificate code in format: SKF-2026-XXXXX
   */
  static generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomPart = '';
    for (let i = 0; i < 5; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `SKF-2026-${randomPart}`;
  }

  /**
   * Generate a cryptographic SHA-256 validation hash
   */
  static generateHash(code, studentId, courseId, date) {
    const secret = process.env.JWT_SECRET || 'skillsfy_cert_secret_2026';
    const payload = `${code}|${studentId}|${courseId}|${date}|${secret}`;
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  /**
   * Generate QR Code PNG file
   */
  static async generateQRCode(code, verifyUrl) {
    const qrFilename = `qr_${code}.png`;
    const qrPath = path.join(CERT_DIR, qrFilename);

    await QRCode.toFile(qrPath, verifyUrl, {
      color: {
        dark: '#031636',
        light: '#ffffff'
      },
      width: 250,
      margin: 1
    });

    return {
      qrPath,
      relativeQrPath: `certificates/${qrFilename}`
    };
  }

  /**
   * Generate High-Quality Landscape PDF Certificate
   */
  static generatePDF({ studentName, courseTitle, code, issuedDate, hash, qrPath }) {
    return new Promise((resolve, reject) => {
      const pdfFilename = `cert_${code}.pdf`;
      const pdfPath = path.join(CERT_DIR, pdfFilename);

      // Create landscape document (A4: 841.89 x 595.28)
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margin: 0
      });

      const writeStream = fs.createWriteStream(pdfPath);
      doc.pipe(writeStream);

      const pageWidth = 841.89;
      const pageHeight = 595.28;

      // 1. Background Surface
      doc.rect(0, 0, pageWidth, pageHeight).fill('#faf8ff');

      // 2. Elegant Geometric Borders
      doc.rect(20, 20, pageWidth - 40, pageHeight - 40)
         .lineWidth(4)
         .stroke('#031636');

      doc.rect(26, 26, pageWidth - 52, pageHeight - 52)
         .lineWidth(1)
         .stroke('#00ccf9');

      // Corner accent triangles
      doc.polygon([20, 20], [60, 20], [20, 60]).fill('#031636');
      doc.polygon([pageWidth - 20, 20], [pageWidth - 60, 20], [pageWidth - 20, 60]).fill('#031636');
      doc.polygon([20, pageHeight - 20], [60, pageHeight - 20], [20, pageHeight - 60]).fill('#031636');
      doc.polygon([pageWidth - 20, pageHeight - 20], [pageWidth - 60, pageHeight - 20], [pageWidth - 20, pageHeight - 60]).fill('#031636');

      // 3. Header: Institute Brand
      doc.fillColor('#031636')
         .font('Helvetica-Bold')
         .fontSize(28)
         .text('SKILLSFY INSTITUTE OF TECHNOLOGY', 0, 55, { align: 'center' });

      doc.fillColor('#00677f')
         .font('Helvetica')
         .fontSize(11)
         .text('BUILD SKILLS FOR THE FUTURE THAT MATTER • VERIFIED ACADEMIC CREDENTIAL', 0, 88, { align: 'center' });

      // Horizontal Divider Ribbon
      doc.moveTo(180, 108).lineTo(pageWidth - 180, 108).lineWidth(1.5).stroke('#00ccf9');

      // 4. Main Certificate Text
      doc.fillColor('#75777f')
         .font('Helvetica-Bold')
         .fontSize(13)
         .text('THIS IS TO CERTIFY THAT', 0, 135, { align: 'center' });

      // Student Name (Prominent)
      doc.fillColor('#031636')
         .font('Helvetica-Bold')
         .fontSize(32)
         .text(studentName, 0, 165, { align: 'center' });

      // Underline for student name
      doc.moveTo(220, 205).lineTo(pageWidth - 220, 205).lineWidth(1).stroke('#d8e2ff');

      // Certification body
      doc.fillColor('#44474e')
         .font('Helvetica')
         .fontSize(13)
         .text('has successfully completed all rigorous curriculum modules, hands-on lab capstones,', 0, 225, { align: 'center' })
         .text('and standardized assessments for the specialized professional track in', 0, 245, { align: 'center' });

      // Course Name
      doc.fillColor('#00677f')
         .font('Helvetica-Bold')
         .fontSize(22)
         .text(courseTitle, 0, 275, { align: 'center' });

      // 5. Bottom Section: Signatures, Issue Date, QR Code & Security Stamp
      const bottomY = 385;

      // Left Column: Issue Details & Certificate Code
      doc.fillColor('#031636')
         .font('Helvetica-Bold')
         .fontSize(11)
         .text('ISSUE DATE:', 60, bottomY)
         .font('Helvetica')
         .text(issuedDate, 140, bottomY);

      doc.font('Helvetica-Bold')
         .text('CERTIFICATE ID:', 60, bottomY + 20)
         .fillColor('#00677f')
         .text(code, 175, bottomY + 20);

      doc.fillColor('#75777f')
         .font('Helvetica')
         .fontSize(8)
         .text(`SECURITY HASH: ${hash.substring(0, 36)}...`, 60, bottomY + 45);

      // Center Column: Authorized Signatory
      doc.moveTo(340, bottomY + 40).lineTo(500, bottomY + 40).lineWidth(1).stroke('#031636');
      doc.fillColor('#031636')
         .font('Helvetica-Bold')
         .fontSize(12)
         .text('Pranjil Soni', 340, bottomY + 15, { width: 160, align: 'center' })
         .fontSize(9)
         .font('Helvetica')
         .text('Founder & Academic Dean', 340, bottomY + 46, { width: 160, align: 'center' });

      // Right Column: Embed Generated QR Code
      if (fs.existsSync(qrPath)) {
        doc.image(qrPath, pageWidth - 165, bottomY - 25, { width: 95, height: 95 });
        doc.fillColor('#031636')
           .font('Helvetica-Bold')
           .fontSize(8)
           .text('SCAN TO VERIFY', pageWidth - 165, bottomY + 75, { width: 95, align: 'center' });
      }

      // Finalize and close PDF
      doc.end();

      writeStream.on('finish', () => {
        resolve({
          pdfPath,
          relativePdfPath: `certificates/${pdfFilename}`
        });
      });

      writeStream.on('error', reject);
    });
  }

  /**
   * Automated Full Certificate Flow for an Enrollment
   */
  static async issueCertificateForEnrollment(enrollment) {
    // Check if certificate already exists
    const existing = await Certificate.findByEnrollmentId(enrollment.id);
    if (existing) return existing;

    const code = this.generateCode();
    const formattedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const hash = this.generateHash(code, enrollment.student_id, enrollment.course_id, formattedDate);
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const verifyUrl = `${baseUrl}/verify?code=${code}`;

    // 1. Generate QR Code
    const { qrPath, relativeQrPath } = await this.generateQRCode(code, verifyUrl);

    // 2. Generate PDF Certificate
    const { relativePdfPath } = await this.generatePDF({
      studentName: enrollment.student_name,
      courseTitle: enrollment.course_title,
      code,
      issuedDate: formattedDate,
      hash,
      qrPath
    });

    // 3. Save to Database
    const certificate = await Certificate.create({
      certificate_code: code,
      student_id: enrollment.student_id,
      course_id: enrollment.course_id,
      enrollment_id: enrollment.id,
      pdf_path: relativePdfPath,
      qr_code_path: relativeQrPath,
      verification_hash: hash
    });

    console.log(`🎓 Auto-generated verified certificate [${code}] for student ${enrollment.student_name}`);
    return certificate;
  }
}

module.exports = CertificateService;
