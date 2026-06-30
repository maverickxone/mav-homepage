// ============================================================
// md2HTML — Core Interactions
// Theme toggle, progress bar, TOC highlighting, collapsible,
// tabs, search, syntax highlighting, reading progress tracker
// ============================================================

(function () {
  'use strict';

  // ---------- localStorage fallback ----------
  let memoryStore = {};
  function safeGetItem(key) {
    try { return localStorage.getItem(key); }
    catch (e) { return memoryStore[key] || null; }
  }
  function safeSetItem(key, value) {
    try { localStorage.setItem(key, value); }
    catch (e) { memoryStore[key] = value; }
  }

  // ---------- 0. Theme, size & style preference ----------
  const root = document.documentElement;
  const savedTheme = safeGetItem('md2html-theme');
  const savedSize = safeGetItem('md2html-size');
  const savedStyle = safeGetItem('md2html-style');
  if (savedTheme === 'dark') root.setAttribute('data-theme', 'dark');
  if (savedSize) root.setAttribute('data-size', savedSize);
  else root.setAttribute('data-size', 'm');
  if (savedStyle && savedStyle !== 'minimal') root.setAttribute('data-style', savedStyle);

  // ---------- 1. Reading progress bar ----------
  const bar = document.getElementById('progress-bar');
  if (bar) {
    const update = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (scrolled / max) * 100 : 0;
      bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ---------- Nav scroll detection ----------
  const topnav = document.getElementById('topnav');
  if (topnav) {
    const onScroll = () => {
      topnav.classList.toggle('scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---------- 2. Copy code blocks ----------
  document.querySelectorAll('pre').forEach((pre) => {
    if (pre.querySelector('.copy-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.addEventListener('click', async () => {
      const code = pre.querySelector('code') || pre;
      const text = code.innerText;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1500);
      } catch { btn.textContent = 'Err'; }
    });
    pre.appendChild(btn);
  });

  // ---------- 3. Sidebar TOC highlighting ----------
  (function () {
    const links = document.querySelectorAll('.sidebar a[href^="#"], .mtoc-drawer a[href^="#"]');
    if (!links.length) return;
    const map = new Map();
    links.forEach((a) => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) {
        if (!map.has(el)) map.set(el, []);
        map.get(el).push(a);
      }
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links.forEach((l) => l.classList.remove('active'));
            (map.get(entry.target) || []).forEach((l) => l.classList.add('active'));
          }
        });
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: 0 }
    );
    map.forEach((_, el) => io.observe(el));
  })();

// ── Comments & Likes (Divider Style) ─────────────────────────────

(function () {
  const API_BASE = '/api';

  function getOrCreateUser() {
    if (!safeGetItem('mavUserId')) {
      safeSetItem('mavUserId', crypto.randomUUID());
      safeSetItem('mavUsername', '读者#' + Math.floor(Math.random() * 9000 + 1000));
    }
    return {
      userId: safeGetItem('mavUserId'),
      username: safeGetItem('mavUsername'),
    };
  }

  function getBookChapter() {
    const m = location.pathname.match(/\/knowledge\/([^/]+)\/chapters\/([^/]+)\.html/);
    if (!m) return null;
    return { book: m[1], chapter: m[2] };
  }

  function formatTime(ts) {
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function buildCommentsHTML() {
    return '<div class="comments-section">' +
      '<div class="comments-divider" id="comments-toggle">' +
        '<span class="comments-divider-label" id="comments-divider-label">展开 0 条留言</span>' +
      '</div>' +
      '<div class="comments-body" id="comments-body">' +
        '<button class="like-btn" id="like-btn">' +
          '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">' +
            '<path d="M8 13.5S1.5 9.5 1.5 5.5a3 3 0 0 1 6-1 3 3 0 0 1 6 1c0 4-6.5 8-6.5 8z"/>' +
          '</svg>' +
          '<span id="like-count">0</span>' +
        '</button>' +
        '<div class="comments-list" id="comments-list"></div>' +
        '<div class="comment-form">' +
          '<div class="comment-identity">' +
            '<span class="comment-identity-name" id="identity-name"></span>' +
            '<button class="username-edit-btn" id="username-edit-btn">修改用户名</button>' +
          '</div>' +
          '<textarea class="comment-input" id="comment-input" placeholder="写下你的想法…" rows="3"></textarea>' +
          '<div class="comment-form-footer">' +
            '<button class="comment-submit" id="comment-submit">发送</button>' +
          '</div>' +
          '<div class="comment-error" id="comment-error"></div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function renderComments(comments) {
    const list = document.getElementById('comments-list');
    if (!list) return;
    if (comments.length === 0) {
      list.innerHTML = '<p class="comments-empty">还没有评论，来第一个吧。</p>';
      return;
    }
    list.innerHTML = comments.map(function (c) {
      return '<div class="comment-item">' +
        '<div class="comment-meta">' +
          '<span class="comment-username">' + escapeHtml(c.username) + '</span>' +
          '<span class="comment-time">' + formatTime(c.created_at) + '</span>' +
        '</div>' +
        '<div class="comment-content">' + escapeHtml(c.content) + '</div>' +
      '</div>';
    }).join('');
  }

  function initComments() {
    const loc = getBookChapter();
    if (!loc) return;
    const book = loc.book, chapter = loc.chapter;
    const user = getOrCreateUser();
    const userId = user.userId, username = user.username;

    const pager = document.querySelector('.pager');
    if (!pager) return;
    pager.insertAdjacentHTML('afterend', buildCommentsHTML());

    const toggle = document.getElementById('comments-toggle');
    const body = document.getElementById('comments-body');
    let expanded = false;

    toggle.addEventListener('click', function () {
      expanded = !expanded;
      if (expanded) {
        body.classList.add('open');
        fetchComments();
      } else {
        body.classList.remove('open');
      }
      updateLabel();
    });

    document.getElementById('identity-name').textContent = username;

    document.getElementById('username-edit-btn').addEventListener('click', function () {
      const cur = safeGetItem('mavUsername');
      const next = prompt('修改用户名：', cur);
      if (next && next.trim()) {
        const trimmed = next.trim().slice(0, 50);
        safeSetItem('mavUsername', trimmed);
        document.getElementById('identity-name').textContent = trimmed;
      }
    });

    const likeBtn = document.getElementById('like-btn');
    likeBtn.addEventListener('click', async function () {
      likeBtn.disabled = true;
      try {
        const r = await fetch(API_BASE + '/likes/' + book + '/' + chapter, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userId }),
        });
        if (r.ok) {
          const data = await r.json();
          document.getElementById('like-count').textContent = data.likeCount;
          likeBtn.classList.toggle('liked', data.liked);
        }
      } finally {
        likeBtn.disabled = false;
      }
    });

    const submitBtn = document.getElementById('comment-submit');
    const input = document.getElementById('comment-input');
    const errorEl = document.getElementById('comment-error');

    submitBtn.addEventListener('click', async function () {
      const content = input.value.trim();
      if (!content) return;
      errorEl.textContent = '';
      submitBtn.disabled = true;
      try {
        const r = await fetch(API_BASE + '/comments/' + book + '/' + chapter, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId,
            username: safeGetItem('mavUsername'),
            content: content,
          }),
        });
        if (r.ok) {
          input.value = '';
          await fetchComments();
        } else {
          const data = await r.json();
          errorEl.textContent = data.error || '发送失败，请重试';
        }
      } catch (e) {
        errorEl.textContent = '网络错误，请重试';
      } finally {
        submitBtn.disabled = false;
      }
    });

    let commentCount = 0;

    function updateLabel() {
      const label = document.getElementById('comments-divider-label');
      if (label) {
        label.textContent = expanded
          ? (commentCount > 0 ? '收起 ' + commentCount + ' 条留言' : '收起留言')
          : '展开 ' + commentCount + ' 条留言';
      }
    }

    async function fetchComments() {
      try {
        const r = await fetch(API_BASE + '/comments/' + book + '/' + chapter + '?userId=' + encodeURIComponent(userId));
        if (!r.ok) return;
        const data = await r.json();
        commentCount = data.comments.length;
        updateLabel();
        document.getElementById('like-count').textContent = data.likeCount;
        likeBtn.classList.toggle('liked', data.liked);
        renderComments(data.comments);
      } catch (e) {
        // silently ignore
      }
    }

    fetchComments();
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (location.pathname.includes('/chapters/')) {
      initComments();
    }
  });
})();

  // ---------- 4. Settings popover (theme + size + style) ----------
  (function () {
    const btn = document.getElementById('settings-btn');
    const pop = document.getElementById('settings-pop');
    if (!btn || !pop) return;

    // Inject style picker into settings popover
    const styleSection = document.createElement('div');
    styleSection.innerHTML = '<h5>风格</h5><div class="row style-row">' +
      '<button class="seg" data-style-set="minimal">极简</button>' +
      '<button class="seg" data-style-set="azure">Azure</button>' +
      '<button class="seg" data-style-set="cobalt">Cobalt</button>' +
      '</div><div class="row style-row">' +
      '<button class="seg" data-style-set="warm">暖色</button>' +
      '<button class="seg" data-style-set="sepia">Sepia</button>' +
      '<button class="seg" data-style-set="graphite">石墨</button>' +
      '</div>';
    pop.appendChild(styleSection);

    function syncActive() {
      pop.querySelectorAll('[data-theme-set]').forEach((b) => {
        b.classList.toggle('active', (root.getAttribute('data-theme') || 'light') === b.getAttribute('data-theme-set'));
      });
      pop.querySelectorAll('[data-size-set]').forEach((b) => {
        b.classList.toggle('active', (root.getAttribute('data-size') || 'm') === b.getAttribute('data-size-set'));
      });
      const currentStyle = root.getAttribute('data-style') || 'minimal';
      pop.querySelectorAll('[data-style-set]').forEach((b) => {
        b.classList.toggle('active', currentStyle === b.getAttribute('data-style-set'));
      });
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      pop.classList.toggle('open');
      syncActive();
    });
    document.addEventListener('click', (e) => {
      if (!pop.contains(e.target) && !btn.contains(e.target)) pop.classList.remove('open');
    });

    pop.addEventListener('click', (e) => {
      const t = e.target.closest('[data-theme-set]');
      if (t) {
        const mode = t.getAttribute('data-theme-set');
        if (mode === 'light') { root.removeAttribute('data-theme'); safeSetItem('md2html-theme', 'light'); }
        else { root.setAttribute('data-theme', 'dark'); safeSetItem('md2html-theme', 'dark'); }
        syncActive();
      }
      const s = e.target.closest('[data-size-set]');
      if (s) {
        const size = s.getAttribute('data-size-set');
        root.setAttribute('data-size', size);
        safeSetItem('md2html-size', size);
        syncActive();
      }
      const st = e.target.closest('[data-style-set]');
      if (st) {
        const style = st.getAttribute('data-style-set');
        // Add transition class before changing style (user-initiated only)
        root.classList.add('style-transitioning');
        if (style === 'minimal') {
          root.removeAttribute('data-style');
          safeSetItem('md2html-style', 'minimal');
        } else {
          root.setAttribute('data-style', style);
          safeSetItem('md2html-style', style);
        }
        syncActive();
        // Remove transition class after animation completes
        setTimeout(function () {
          root.classList.remove('style-transitioning');
        }, 350);
      }
    });
    syncActive();
  })();

  // ---------- 5. Mobile TOC drawer ----------
  (function () {
    const fab = document.getElementById('mtoc-fab');
    const drawer = document.getElementById('mtoc-drawer');
    if (!fab || !drawer) return;

    const sidebar = document.querySelector('.sidebar');
    const holder = drawer.querySelector('.mtoc-content');
    if (sidebar && holder && !holder.childNodes.length) {
      holder.innerHTML = sidebar.innerHTML;
    }

    fab.addEventListener('click', () => { drawer.classList.add('open'); document.body.style.overflow = 'hidden'; });
    drawer.addEventListener('click', (e) => {
      if (e.target === drawer || e.target.closest('a')) {
        drawer.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  })();

  // ---------- 6. Collapsible sections ----------
  (function () {
    document.querySelectorAll('.collapsible-trigger').forEach(trigger => {
      const contentId = trigger.getAttribute('aria-controls');
      const content = document.getElementById(contentId);
      if (!content) return;

      content.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');

      function toggle() {
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', String(!expanded));
        content.hidden = expanded;
      }

      trigger.addEventListener('click', toggle);
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    });
  })();

  // ---------- 7. Tab panels ----------
  (function () {
    document.querySelectorAll('.tabs').forEach(tabsContainer => {
      const tablist = tabsContainer.querySelector('[role="tablist"]');
      if (!tablist) return;

      const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
      const panels = tabs.map(tab => {
        const panelId = tab.getAttribute('aria-controls');
        return document.getElementById(panelId);
      }).filter(Boolean);

      tabs.forEach((tab, i) => {
        if (i === 0) {
          tab.setAttribute('aria-selected', 'true');
          tab.removeAttribute('tabindex');
        } else {
          tab.setAttribute('aria-selected', 'false');
          tab.setAttribute('tabindex', '-1');
          if (panels[i]) panels[i].hidden = true;
        }
      });

      function activateTab(index) {
        tabs.forEach((tab, i) => {
          const selected = i === index;
          tab.setAttribute('aria-selected', String(selected));
          tab.setAttribute('tabindex', selected ? '0' : '-1');
          if (panels[i]) panels[i].hidden = !selected;
        });
        tabs[index].focus();
      }

      tablist.addEventListener('click', (e) => {
        const tab = e.target.closest('[role="tab"]');
        if (!tab) return;
        const index = tabs.indexOf(tab);
        if (index >= 0) activateTab(index);
      });

      tablist.addEventListener('keydown', (e) => {
        const currentIndex = tabs.indexOf(document.activeElement);
        if (currentIndex < 0) return;
        let newIndex;
        if (e.key === 'ArrowRight') newIndex = (currentIndex + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') newIndex = 0;
        else if (e.key === 'End') newIndex = tabs.length - 1;
        else return;
        e.preventDefault();
        activateTab(newIndex);
      });
    });
  })();

  // ---------- 8. Search overlay ----------
  (function () {
    const overlay = document.getElementById('search-overlay');
    const searchBtn = document.getElementById('search-btn');
    if (!overlay) return;

    const input = overlay.querySelector('.search-input');
    const resultsContainer = overlay.querySelector('.search-results');
    let searchData = null;
    let debounceTimer = null;

    function open() {
      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
      setTimeout(() => input.focus(), 50);
    }

    function close() {
      overlay.hidden = true;
      document.body.style.overflow = '';
      input.value = '';
      resultsContainer.innerHTML = '';
    }

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (overlay.hidden) open(); else close();
      }
      if (e.key === 'Escape' && !overlay.hidden) close();
    });

    if (searchBtn) searchBtn.addEventListener('click', open);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    async function loadIndex() {
      if (searchData) return searchData;
      try {
        const isChapter = window.location.pathname.includes('/chapters/');
        const basePath = isChapter ? '../assets/search-index.json' : 'assets/search-index.json';
        const res = await fetch(basePath);
        if (!res.ok) throw new Error('Failed to load index');
        searchData = await res.json();
        return searchData;
      } catch (err) {
        resultsContainer.innerHTML = '<div class="search-empty">搜索索引加载失败</div>';
        return null;
      }
    }

    async function doSearch(query) {
      if (!query.trim()) { resultsContainer.innerHTML = ''; return; }
      const data = await loadIndex();
      if (!data || !data.documents) return;

      const q = query.toLowerCase();
      const results = data.documents.filter(doc =>
        doc.title.toLowerCase().includes(q) ||
        (doc.body && doc.body.toLowerCase().includes(q))
      );

      if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="search-empty">未找到相关内容</div>';
        return;
      }

      const isChapter = window.location.pathname.includes('/chapters/');
      resultsContainer.innerHTML = results.slice(0, 10).map(r => {
        const href = isChapter ? (r.url.startsWith('chapters/') ? r.url.replace('chapters/', '') : '../' + r.url) : r.url;
        return `<a class="search-result" href="${href}">
          <span class="search-result-title">${escapeHtml(r.title)}</span>
          <span class="search-result-chapter">${escapeHtml(r.chapterTitle || '')}</span>
        </a>`;
      }).join('');
    }

    function escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    if (input) {
      input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => doSearch(input.value), 150);
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const firstResult = resultsContainer.querySelector('.search-result');
          if (firstResult) window.location.href = firstResult.href;
        }
      });
    }
  })();

  // ---------- 9. Syntax highlighting ----------
  (function () {
    if (!window.hljs) return;

    document.querySelectorAll('pre code').forEach(el => {
      if (el.classList.contains('hljs')) return;
      const pre = el.closest('pre');
      const label = pre && pre.getAttribute('data-label');
      if (label) {
        const langMap = {
          'bash': 'bash', 'shell': 'bash', 'sh': 'bash',
          'json': 'json', 'javascript': 'javascript', 'js': 'javascript',
          'typescript': 'typescript', 'ts': 'typescript',
          'yaml': 'yaml', 'yml': 'yaml',
          'python': 'python', 'py': 'python',
          'css': 'css', 'html': 'html'
        };
        const lang = langMap[label.toLowerCase()];
        if (lang) el.classList.add('language-' + lang);
      }
      hljs.highlightElement(el);
    });

    // Code blocks are always terminal-dark regardless of page theme
    function syncHljsTheme() {
      const lightSheet = document.getElementById('hljs-light');
      const darkSheet = document.getElementById('hljs-dark');
      if (lightSheet) lightSheet.media = 'not all';
      if (darkSheet) darkSheet.media = '';
    }
    syncHljsTheme();
    const observer = new MutationObserver(syncHljsTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  })();

  // ---------- 10. Reading progress tracker ----------
  (function () {
    const STORAGE_KEY = 'md2html-progress';

    function getProgress() {
      try {
        const data = safeGetItem(STORAGE_KEY);
        if (!data) return {};
        return JSON.parse(data) || {};
      } catch { return {}; }
    }

    function setProgress(key, value) {
      try {
        const progress = getProgress();
        progress[key] = value;
        safeSetItem(STORAGE_KEY, JSON.stringify(progress));
      } catch {}
    }

    // Detect chapter from URL
    const path = window.location.pathname;
    const chapterMatch = path.match(/(\d{2})-/);
    const chapterKey = chapterMatch ? chapterMatch[1] : null;

    // On chapter pages: track scroll progress
    if (chapterKey) {
      let marked = false;
      const checkScroll = () => {
        if (marked) return;
        const h = document.documentElement;
        const scrolled = h.scrollTop;
        const max = h.scrollHeight - h.clientHeight;
        if (max > 0 && (scrolled / max) >= 0.9) {
          marked = true;
          setProgress(chapterKey, true);
        }
      };
      window.addEventListener('scroll', checkScroll, { passive: true });
      checkScroll();
    }

    // On index page: show completion indicators
    if (!path.includes('/chapters/')) {
      const progress = getProgress();
      document.querySelectorAll('.toc-card').forEach(card => {
        const href = card.getAttribute('href') || '';
        const m = href.match(/(\d{2})-/);
        if (m && progress[m[1]]) {
          card.classList.add('completed');
        }
      });
    }
  })();

  // ---------- 11. Side Panel (Sidenote + Notepad) ----------
  (function () {
    const panel = document.getElementById('side-panel');
    if (!panel) return;

    const tabBtns = panel.querySelectorAll('.side-panel-tab');
    const bodyEl = panel.querySelector('.side-panel-body');
    const closeBtn = panel.querySelector('.side-panel-close');
    const header = panel.querySelector('.side-panel-header');
    const notepadFab = document.getElementById('notepad-fab');

    // Book slug for localStorage key
    const pathParts = window.location.pathname.split('/');
    const knowledgeIdx = pathParts.indexOf('knowledge');
    const bookSlug = knowledgeIdx >= 0 ? pathParts[knowledgeIdx + 1] : 'default';
    const NOTES_KEY = 'md2html-notes-' + bookSlug;

    let currentMode = null; // 'sidenote' or 'notepad'
    let notepadDirty = false;

    // --- Open / Close ---
    function openPanel(mode, content) {
      currentMode = mode;
      panel.classList.add('open');
      panel.classList.remove('typing');

      // Update tabs
      tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
      });

      if (mode === 'sidenote') {
        bodyEl.innerHTML = '<div class="side-panel-sidenote-content">' + content + '</div>';
      } else {
        const saved = safeGetItem(NOTES_KEY) || '';
        bodyEl.innerHTML = '<textarea class="side-panel-notepad" placeholder="随手记点什么...">' + escapeHtml(saved) + '</textarea>';
        const textarea = bodyEl.querySelector('.side-panel-notepad');
        textarea.addEventListener('input', () => {
          safeSetItem(NOTES_KEY, textarea.value);
          notepadDirty = textarea.value.trim().length > 0;
        });
        textarea.addEventListener('focus', () => panel.classList.add('typing'));
        textarea.addEventListener('blur', () => panel.classList.remove('typing'));
        notepadDirty = saved.trim().length > 0;
      }
    }

    function closePanel() {
      panel.classList.remove('open', 'typing');
      currentMode = null;
    }

    function escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    // --- Close button ---
    if (closeBtn) closeBtn.addEventListener('click', closePanel);

    // --- Click outside to close (only in sidenote mode) ---
    document.addEventListener('mousedown', (e) => {
      if (panel.classList.contains('open') && currentMode === 'sidenote' &&
          !panel.contains(e.target) && 
          !e.target.closest('.sidenote-mark') && !e.target.closest('.notepad-fab')) {
        closePanel();
      }
    });

    // --- Tab switching ---
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const mode = btn.dataset.mode;
        if (mode === 'notepad') {
          openPanel('notepad');
        } else if (mode === 'sidenote') {
          // Show tips directory for this page
          openPanel('sidenote', buildTipsDirectory());
        }
      });
    });

    // --- Build tips directory from page content ---
    function buildTipsDirectory() {
      const marks = document.querySelectorAll('.sidenote-mark');
      if (marks.length === 0) {
        return '<p style="color:var(--muted)">本章暂无补充内容</p>';
      }

      let html = '<p style="color:var(--muted);margin-bottom:12px;">点击下方条目跳转到对应位置</p>';
      html += '<div style="display:flex;flex-direction:column;gap:8px;">';

      marks.forEach((mark, i) => {
        // Find nearest heading above this mark
        let heading = '';
        let el = mark;
        while (el) {
          el = el.previousElementSibling || (el.parentElement !== document.body ? el.parentElement : null);
          if (el && /^H[23]$/.test(el.tagName)) {
            heading = el.textContent.trim();
            break;
          }
        }
        if (!heading) {
          // Walk up DOM to find heading
          let parent = mark.closest('h2, h3, li, p');
          let walker = parent || mark;
          while (walker && walker !== document.body) {
            let prev = walker.previousElementSibling;
            while (prev) {
              if (/^H[23]$/.test(prev.tagName)) { heading = prev.textContent.trim(); break; }
              prev = prev.previousElementSibling;
            }
            if (heading) break;
            walker = walker.parentElement;
          }
        }

        // Extract summary from data-note (strip HTML, first 30 chars)
        const rawNote = mark.getAttribute('data-note') || '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = rawNote;
        const summary = tempDiv.textContent.trim().substring(0, 40) + (tempDiv.textContent.length > 40 ? '...' : '');

        html += '<a class="tips-dir-item" data-tips-index="' + i + '" style="display:block;padding:8px 10px;border:1px solid var(--line);border-radius:4px;cursor:pointer;text-decoration:none;transition:background 0.15s;">';
        html += '<div style="font-family:var(--mono);font-size:10px;color:var(--muted);letter-spacing:0.04em;margin-bottom:2px;">' + escapeHtml(heading || '—') + '</div>';
        html += '<div style="font-size:13px;color:var(--ink-2);">' + escapeHtml(summary) + '</div>';
        html += '</a>';
      });

      html += '</div>';
      return html;
    }

    // --- Tips directory click handler (delegated) ---
    bodyEl.addEventListener('click', (e) => {
      const item = e.target.closest('.tips-dir-item');
      if (!item) return;
      const index = parseInt(item.dataset.tipsIndex);
      const marks = document.querySelectorAll('.sidenote-mark');
      if (marks[index]) {
        marks[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Trigger the tips content
        setTimeout(() => {
          const note = marks[index].getAttribute('data-note') || '';
          openPanel('sidenote', note);
        }, 400);
      }
    });

    // --- Sidenote marks ---
    document.querySelectorAll('.sidenote-mark').forEach(mark => {
      mark.addEventListener('click', (e) => {
        e.stopPropagation();
        const note = mark.getAttribute('data-note') || mark.getAttribute('title') || '';
        if (panel.classList.contains('open') && currentMode === 'sidenote') {
          // Toggle off if clicking same mark
          closePanel();
        } else {
          openPanel('sidenote', note);
        }
      });
    });

    // --- Notepad FAB ---
    if (notepadFab) {
      notepadFab.addEventListener('click', (e) => {
        e.stopPropagation();
        if (panel.classList.contains('open') && currentMode === 'notepad') {
          closePanel();
        } else {
          openPanel('notepad');
        }
      });
    }

    // --- Persist panel state across chapters ---
    const PANEL_STATE_KEY = 'md2html-panel-state-' + bookSlug;

    function savePanelState() {
      const state = { open: panel.classList.contains('open'), mode: currentMode };
      safeSetItem(PANEL_STATE_KEY, JSON.stringify(state));
    }

    function restorePanelState() {
      try {
        const raw = safeGetItem(PANEL_STATE_KEY);
        if (!raw) return;
        const state = JSON.parse(raw);
        if (state.open && state.mode === 'notepad') {
          openPanel('notepad');
        }
      } catch {}
    }

    // Override openPanel/closePanel to persist state
    const _origOpen = openPanel;
    const _origClose = closePanel;
    openPanel = function(mode, content) {
      _origOpen(mode, content);
      savePanelState();
    };
    closePanel = function() {
      _origClose();
      savePanelState();
    };

    // Restore on page load
    restorePanelState();

    // --- Link click interception (warn only when leaving this book) ---
    const bookPathPrefix = '/knowledge/' + bookSlug + '/';

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      if (!notepadDirty) return;

      const href = link.getAttribute('href');
      // Skip anchors, javascript:, etc.
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

      // Resolve relative URL to absolute
      const resolved = new URL(href, window.location.href);

      // Check if destination is within the same book
      if (resolved.pathname.includes(bookPathPrefix)) {
        // Same book — let it go, no warning
        return;
      }

      // Leaving the book — ask for confirmation
      const confirmed = window.confirm('你的便利贴还有内容，确定要离开这本书吗？');
      if (!confirmed) {
        e.preventDefault();
      }
    });

    // --- Draggable ---
    let isDragging = false;
    let isResizing = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    if (header) {
      header.addEventListener('mousedown', (e) => {
        // Only drag from header, not from buttons
        if (e.target.closest('button')) return;
        isDragging = true;
        const rect = panel.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        panel.style.transition = 'none';
        e.preventDefault();
      });
    }

    // --- Resizable (bottom-left handle) ---
    const resizeHandle = document.getElementById('side-panel-resize');
    if (resizeHandle) {
      resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        panel.style.transition = 'none';
        e.preventDefault();
        e.stopPropagation();
      });
    }

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const x = e.clientX - dragOffsetX;
        const y = e.clientY - dragOffsetY;
        panel.style.left = x + 'px';
        panel.style.top = y + 'px';
        panel.style.right = 'auto';
      }
      if (isResizing) {
        const rect = panel.getBoundingClientRect();
        // Resize from bottom-left: width grows leftward, height grows downward
        const newWidth = rect.right - e.clientX;
        const newHeight = e.clientY - rect.top;
        if (newWidth >= 240) {
          panel.style.width = newWidth + 'px';
          panel.style.left = e.clientX + 'px';
          panel.style.right = 'auto';
        }
        if (newHeight >= 200) {
          panel.style.height = newHeight + 'px';
        }
      }
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        panel.style.transition = '';
      }
      if (isResizing) {
        isResizing = false;
        panel.style.transition = '';
      }
    });

  })();

})();
