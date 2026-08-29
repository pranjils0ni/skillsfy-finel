const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    let htmlContent = '';
    const localPath = path.join(__dirname, '..', 'article.html');
    const cwdPath = path.join(process.cwd(), 'article.html');

    if (fs.existsSync(localPath)) {
      htmlContent = fs.readFileSync(localPath, 'utf8');
    } else if (fs.existsSync(cwdPath)) {
      htmlContent = fs.readFileSync(cwdPath, 'utf8');
    } else {
      return res.status(404).send('Article template not found');
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).send(htmlContent);
  } catch (err) {
    console.error('Error serving article.html via API:', err);
    return res.status(500).send('Internal Server Error loading article');
  }
};
