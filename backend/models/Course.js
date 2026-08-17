const db = require('../database/db');

class Course {
  static async getAll(filterActiveOnly = false) {
    const sql = filterActiveOnly
      ? `SELECT * FROM courses WHERE status = 'active' ORDER BY id ASC`
      : `SELECT * FROM courses ORDER BY id ASC`;
    const courses = await db.all(sql);
    return courses.map(c => ({
      ...c,
      video_urls: typeof c.video_urls === 'string' ? JSON.parse(c.video_urls || '[]') : c.video_urls
    }));
  }

  static async findById(id) {
    const course = await db.get(`SELECT * FROM courses WHERE id = ?`, [id]);
    if (!course) return null;
    return {
      ...course,
      video_urls: typeof course.video_urls === 'string' ? JSON.parse(course.video_urls || '[]') : course.video_urls
    };
  }

  static async create({ title, description, instructor, thumbnail_url, video_urls, duration, price = 2999, status = 'active' }) {
    const videosJson = typeof video_urls === 'object' ? JSON.stringify(video_urls) : (video_urls || '[]');
    const res = await db.run(
      `INSERT INTO courses (title, description, instructor, thumbnail_url, video_urls, duration, price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, instructor, thumbnail_url, videosJson, duration, price, status]
    );
    return this.findById(res.lastID);
  }

  static async update(id, { title, description, instructor, thumbnail_url, video_urls, duration, price, status }) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const newVideos = video_urls !== undefined 
      ? (typeof video_urls === 'object' ? JSON.stringify(video_urls) : video_urls)
      : JSON.stringify(existing.video_urls);

    await db.run(
      `UPDATE courses 
       SET title = ?, description = ?, instructor = ?, thumbnail_url = ?, video_urls = ?, duration = ?, price = ?, status = ?
       WHERE id = ?`,
      [
        title || existing.title,
        description !== undefined ? description : existing.description,
        instructor || existing.instructor,
        thumbnail_url || existing.thumbnail_url,
        newVideos,
        duration || existing.duration,
        price !== undefined ? price : existing.price,
        status || existing.status,
        id
      ]
    );
    return this.findById(id);
  }

  static async delete(id) {
    const res = await db.run(`DELETE FROM courses WHERE id = ?`, [id]);
    return res.changes > 0;
  }
}

module.exports = Course;
