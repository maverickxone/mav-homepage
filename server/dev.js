// 本地开发服务器：同时托管静态文件 + API，无需 Nginx
const express = require('express');
const path = require('path');
const app = require('./app');

app.use(express.static(path.join(__dirname, '../Mav')));

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Dev server: http://localhost:${PORT}`);
  console.log(`示例页面: http://localhost:${PORT}/knowledge/browser-war/chapters/01-browser-history.html`);
});
