const db = require('../database/db');

class Admin {
  static async findByEmail(email) {
    return db.get(`SELECT * FROM admins WHERE email = ?`, [email.toLowerCase().trim()]);
  }

  static async findById(id) {
    return db.get(`SELECT id, name, email, role, created_at FROM admins WHERE id = ?`, [id]);
  }

  static async create({ name, email, password_hash, role = 'admin' }) {
    const res = await db.run(
      `INSERT INTO admins (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      [name, email.toLowerCase().trim(), password_hash, role]
    );
    return this.findById(res.lastID);
  }

  static async getAll() {
    return db.all(`SELECT id, name, email, role, created_at FROM admins ORDER BY created_at ASC`);
  }
}

module.exports = Admin;
