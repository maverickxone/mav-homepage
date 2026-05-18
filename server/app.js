const express = require('express');
const {
  getComments,
  getLikeCount,
  getUserLiked,
  insertComment,
  countRecentComments,
  insertLike,
  deleteLike,
} = require('./db');

const app = express();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

app.use(express.json());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = ['https://mav-ustc.dev', 'http://localhost', 'http://127.0.0.1'];
  if (!origin || allowed.some(o => origin.startsWith(o))) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/api/comments/:book/:chapter', (req, res) => {
  const { book, chapter } = req.params;
  const { userId } = req.query;

  const comments = getComments.all(book, chapter);
  const likeCount = getLikeCount.get(book, chapter).count;
  const liked = userId ? !!getUserLiked.get(book, chapter, userId) : false;

  res.json({ comments, likeCount, liked });
});

app.post('/api/comments/:book/:chapter', (req, res) => {
  const { book, chapter } = req.params;
  const { userId, username, content } = req.body;

  if (!userId || !username || !content || !content.trim()) {
    return res.status(400).json({ error: '缺少必要字段' });
  }
  if (content.trim().length > 1000) {
    return res.status(400).json({ error: '评论不能超过 1000 字' });
  }

  const since = Date.now() - RATE_LIMIT_WINDOW_MS;
  const recent = countRecentComments.get(book, chapter, userId, since);
  if (recent.count >= RATE_LIMIT_MAX) {
    return res.status(429).json({ error: '评论太频繁，请稍后再试' });
  }

  const now = Date.now();
  const result = insertComment.run(book, chapter, userId, username.trim().slice(0, 50), content.trim(), now);

  res.json({
    id: result.lastInsertRowid,
    username: username.trim().slice(0, 50),
    content: content.trim(),
    created_at: now,
  });
});

app.post('/api/likes/:book/:chapter', (req, res) => {
  const { book, chapter } = req.params;
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: '缺少 userId' });

  const alreadyLiked = !!getUserLiked.get(book, chapter, userId);
  if (alreadyLiked) {
    deleteLike.run(book, chapter, userId);
  } else {
    insertLike.run(book, chapter, userId, Date.now());
  }

  const likeCount = getLikeCount.get(book, chapter).count;
  res.json({ liked: !alreadyLiked, likeCount });
});

module.exports = app;
