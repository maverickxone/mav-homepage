const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'data/comments.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS comments (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    book       TEXT NOT NULL,
    chapter    TEXT NOT NULL,
    user_id    TEXT NOT NULL,
    username   TEXT NOT NULL,
    content    TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS likes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    book       TEXT NOT NULL,
    chapter    TEXT NOT NULL,
    user_id    TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    UNIQUE(book, chapter, user_id)
  );
`);

const getComments = db.prepare(
  'SELECT id, username, content, created_at FROM comments WHERE book=? AND chapter=? ORDER BY created_at ASC'
);
const getLikeCount = db.prepare(
  'SELECT COUNT(*) as count FROM likes WHERE book=? AND chapter=?'
);
const getUserLiked = db.prepare(
  'SELECT 1 FROM likes WHERE book=? AND chapter=? AND user_id=?'
);
const insertComment = db.prepare(
  'INSERT INTO comments (book, chapter, user_id, username, content, created_at) VALUES (?,?,?,?,?,?)'
);
const countRecentComments = db.prepare(
  'SELECT COUNT(*) as count FROM comments WHERE book=? AND chapter=? AND user_id=? AND created_at > ?'
);
const insertLike = db.prepare(
  'INSERT OR IGNORE INTO likes (book, chapter, user_id, created_at) VALUES (?,?,?,?)'
);
const deleteLike = db.prepare(
  'DELETE FROM likes WHERE book=? AND chapter=? AND user_id=?'
);

module.exports = {
  getComments,
  getLikeCount,
  getUserLiked,
  insertComment,
  countRecentComments,
  insertLike,
  deleteLike,
};
