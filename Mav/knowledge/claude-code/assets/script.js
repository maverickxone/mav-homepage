// ============================================================
// Claude Code 使用指南 — interactions
// ============================================================

(function () {
  'use strict';

  // ---------- 0. Theme & size preference ----------
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('cc-theme');
  const savedSize = localStorage.getItem('cc-size');
  if (savedTheme === 'dark') root.setAttribute('data-theme', 'dark');
  if (savedSize) root.setAttribute('data-size', savedSize);
  else root.setAttribute('data-size', 'm');

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

  // ---------- 4. Terminal typing demo ----------
  (function () {
    const demo = document.getElementById('term-demo');
    if (!demo) return;

    const script = [
      { type: 'prompt' },
      { type: 'type', text: 'claude', cls: 't-cmd', speed: 55 },
      { type: 'enter' },
      { type: 'claude', text: '欢迎使用 Claude Code。我可以读写项目文件、运行命令，也可以只陪你聊代码。', delay: 500 },
      { type: 'prompt', delay: 700 },
      { type: 'type', text: '帮我看看 src/ 下有哪些 TypeScript 文件，选三个最重要的解释一下。', cls: 't-user', speed: 26 },
      { type: 'enter' },
      { type: 'dim', text: '调用工具 Glob (**/*.ts)', delay: 450 },
      { type: 'dim', text: '找到 47 个文件', delay: 280 },
      { type: 'dim', text: '调用工具 Read ×3', delay: 380 },
      { type: 'claude', text: '核心三个：index.ts 是入口，router.ts 挂载了所有路由，db.ts 封装了连接池。要我继续深入吗？', delay: 580 },
      { type: 'prompt', delay: 500 },
      { type: 'cursor' },
    ];

    let i = 0;
    let current = null;
    const addLine = () => { const line = document.createElement('div'); demo.appendChild(line); return line; };

    function run() {
      if (i >= script.length) return;
      const step = script[i++];

      if (step.type === 'prompt') {
        setTimeout(() => {
          current = addLine();
          const span = document.createElement('span');
          span.className = 't-prompt';
          current.appendChild(span);
          run();
        }, step.delay || 0);
        return;
      }
      if (step.type === 'type') {
        const span = document.createElement('span');
        span.className = step.cls || 't-user';
        current.appendChild(span);
        let j = 0;
        const tick = () => {
          if (j < step.text.length) {
            span.textContent += step.text[j++];
            setTimeout(tick, step.speed || 30);
          } else run();
        };
        tick();
        return;
      }
      if (step.type === 'enter') { current = null; run(); return; }
      if (step.type === 'claude' || step.type === 'dim') {
        setTimeout(() => {
          const line = addLine();
          const span = document.createElement('span');
          span.className = step.type === 'claude' ? 't-claude' : 't-dim';
          span.textContent = step.text;
          line.appendChild(span);
          run();
        }, step.delay || 0);
        return;
      }
      if (step.type === 'cursor') {
        const line = addLine();
        const span = document.createElement('span');
        span.className = 't-prompt';
        line.appendChild(span);
        const cur = document.createElement('span');
        cur.className = 'cursor';
        line.appendChild(cur);
        return;
      }
    }

    const startObs = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { run(); obs.disconnect(); }
        });
      },
      { threshold: 0.9 }
    );
    startObs.observe(demo);
  })();

  // ---------- 5. Command modal ----------
  (function () {
    const backdrop = document.getElementById('cmd-modal');
    if (!backdrop) return;
    const modalBody = backdrop.querySelector('.modal-body');
    const modalTag = backdrop.querySelector('.tag');
    const modalName = backdrop.querySelector('h3');
    const modalSummary = backdrop.querySelector('.summary');
    const closeBtn = backdrop.querySelector('.modal-close');

    function renderBody(blocks) {
      modalBody.innerHTML = '';
      blocks.forEach((b) => {
        if (b.type === 'p') {
          const p = document.createElement('p');
          p.textContent = b.text;
          modalBody.appendChild(p);
        } else if (b.type === 'h') {
          const h = document.createElement('h4');
          h.textContent = b.text;
          modalBody.appendChild(h);
        } else if (b.type === 'ul') {
          const ul = document.createElement('ul');
          b.items.forEach((it) => {
            const li = document.createElement('li');
            li.textContent = it;
            ul.appendChild(li);
          });
          modalBody.appendChild(ul);
        } else if (b.type === 'code') {
          const pre = document.createElement('pre');
          pre.setAttribute('data-label', b.lang || 'bash');
          const c = document.createElement('code');
          c.textContent = b.text;
          pre.appendChild(c);
          modalBody.appendChild(pre);
        } else if (b.type === 'tip' || b.type === 'warn') {
          const co = document.createElement('div');
          co.className = 'callout ' + (b.type === 'warn' ? 'callout-warn' : 'callout-tip');
          const t = document.createElement('p');
          t.className = 'callout-title';
          t.textContent = b.type === 'warn' ? '注意' : '提示';
          const p = document.createElement('p');
          p.textContent = b.text;
          co.appendChild(t);
          co.appendChild(p);
          modalBody.appendChild(co);
        } else if (b.type === 'table') {
          const wrap = document.createElement('div');
          wrap.className = 'table-wrap';
          const tbl = document.createElement('table');
          if (b.head) {
            const thead = document.createElement('thead');
            const tr = document.createElement('tr');
            b.head.forEach((h) => { const th = document.createElement('th'); th.textContent = h; tr.appendChild(th); });
            thead.appendChild(tr);
            tbl.appendChild(thead);
          }
          const tbody = document.createElement('tbody');
          b.rows.forEach((row) => {
            const tr = document.createElement('tr');
            row.forEach((c) => { const td = document.createElement('td'); td.textContent = c; tr.appendChild(td); });
            tbody.appendChild(tr);
          });
          tbl.appendChild(tbody);
          wrap.appendChild(tbl);
          modalBody.appendChild(wrap);
        }
      });
      // Re-attach copy buttons in modal
      modalBody.querySelectorAll('pre').forEach((pre) => {
        if (pre.querySelector('.copy-btn')) return;
        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.textContent = 'Copy';
        btn.addEventListener('click', async () => {
          const code = pre.querySelector('code') || pre;
          try {
            await navigator.clipboard.writeText(code.innerText);
            btn.textContent = 'Copied'; btn.classList.add('copied');
            setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1500);
          } catch { btn.textContent = 'Err'; }
        });
        pre.appendChild(btn);
      });
    }

    function open(cmd) {
      const data = (window.CC_COMMANDS || {})[cmd];
      if (!data) return;
      modalTag.textContent = data.tag || '';
      modalName.textContent = cmd;
      modalSummary.textContent = data.summary || '';
      renderBody(data.body || []);
      backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
      // Reset scroll after the modal is visible (display:none → flex transition)
      const modal = backdrop.querySelector('.modal');
      requestAnimationFrame(() => {
        modal.scrollTop = 0;
        modalBody.scrollTop = 0;
      });
    }

    function close() {
      backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }

    document.addEventListener('click', (e) => {
      const card = e.target.closest('[data-cmd]');
      if (card) {
        e.preventDefault();
        open(card.getAttribute('data-cmd'));
      }
    });
    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && backdrop.classList.contains('open')) close(); });
  })();

  // ---------- 6. Settings popover (theme + size) ----------
  (function () {
    const btn = document.getElementById('settings-btn');
    const pop = document.getElementById('settings-pop');
    if (!btn || !pop) return;

    function syncActive() {
      pop.querySelectorAll('[data-theme-set]').forEach((b) => {
        b.classList.toggle('active', (root.getAttribute('data-theme') || 'light') === b.getAttribute('data-theme-set'));
      });
      pop.querySelectorAll('[data-size-set]').forEach((b) => {
        b.classList.toggle('active', (root.getAttribute('data-size') || 'm') === b.getAttribute('data-size-set'));
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
        if (mode === 'light') { root.removeAttribute('data-theme'); localStorage.setItem('cc-theme', 'light'); }
        else { root.setAttribute('data-theme', 'dark'); localStorage.setItem('cc-theme', 'dark'); }
        syncActive();
      }
      const s = e.target.closest('[data-size-set]');
      if (s) {
        const size = s.getAttribute('data-size-set');
        root.setAttribute('data-size', size);
        localStorage.setItem('cc-size', size);
        syncActive();
      }
    });
    syncActive();
  })();

  // ---------- 7. Mobile TOC drawer ----------
  (function () {
    const fab = document.getElementById('mtoc-fab');
    const drawer = document.getElementById('mtoc-drawer');
    if (!fab || !drawer) return;

    // Clone sidebar contents into drawer
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

  // ---------- 8. Collapsible sections ----------
  (function () {
    document.querySelectorAll('.collapsible-trigger').forEach(trigger => {
      const contentId = trigger.getAttribute('aria-controls');
      const content = document.getElementById(contentId);
      if (!content) return;

      // Initialize: collapse by default (progressive enhancement)
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

  // ---------- 9. Tab panels ----------
  (function () {
    document.querySelectorAll('.tabs').forEach(tabsContainer => {
      const tablist = tabsContainer.querySelector('[role="tablist"]');
      if (!tablist) return;

      const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
      const panels = tabs.map(tab => {
        const panelId = tab.getAttribute('aria-controls');
        return document.getElementById(panelId);
      }).filter(Boolean);

      // Initialize: hide all panels except the first
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
        if (e.key === 'ArrowRight') {
          newIndex = (currentIndex + 1) % tabs.length;
        } else if (e.key === 'ArrowLeft') {
          newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        } else if (e.key === 'Home') {
          newIndex = 0;
        } else if (e.key === 'End') {
          newIndex = tabs.length - 1;
        } else {
          return;
        }

        e.preventDefault();
        activateTab(newIndex);
      });
    });
  })();

  // ---------- 10. Search overlay ----------
  (function () {
    const overlay = document.getElementById('search-overlay');
    const searchBtn = document.getElementById('search-btn');
    if (!overlay) return;

    const input = overlay.querySelector('.search-input');
    const resultsContainer = overlay.querySelector('.search-results');
    let searchIndex = null;
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

    // Keyboard shortcut: Ctrl+K / Cmd+K
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (overlay.hidden) open(); else close();
      }
      if (e.key === 'Escape' && !overlay.hidden) close();
    });

    if (searchBtn) searchBtn.addEventListener('click', open);

    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    // Close when a result is clicked (so the overlay doesn't linger after navigation)
    resultsContainer.addEventListener('click', (e) => {
      if (e.target.closest('.search-result')) close();
    });

    // Lazy load search index
    async function loadIndex() {
      if (searchIndex) return searchIndex;
      try {
        // Determine base path (are we in chapters/ or root?)
        const isChapter = window.location.pathname.includes('/chapters/');
        const basePath = isChapter ? '../assets/search-index.json' : 'assets/search-index.json';

        const res = await fetch(basePath);
        if (!res.ok) throw new Error('Failed to load index');
        const data = await res.json();

        // Load MiniSearch from CDN if not already loaded
        if (!window.MiniSearch) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/minisearch@6.3.0/dist/umd/index.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        searchIndex = window.MiniSearch.loadJSON(JSON.stringify(data.index), {
          fields: ['title', 'body'],
          storeFields: ['title', 'chapter', 'chapterTitle', 'url']
        });
        return searchIndex;
      } catch (err) {
        resultsContainer.innerHTML = '<div class="search-empty">搜索索引加载失败，请刷新页面重试</div>';
        return null;
      }
    }

    // Search and render results
    async function doSearch(query) {
      if (!query.trim()) {
        resultsContainer.innerHTML = '';
        return;
      }

      const index = await loadIndex();
      if (!index) return;

      const results = index.search(query, {
        prefix: true,
        fuzzy: 0.2,
        boost: { title: 3 }
      });

      if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="search-empty">未找到相关内容</div>';
        return;
      }

      const isChapter = window.location.pathname.includes('/chapters/');
      resultsContainer.innerHTML = results.slice(0, 10).map(r => {
        // Adjust URL based on current location
        const href = isChapter ? (r.url.startsWith('chapters/') ? r.url.replace('chapters/', '') : '../' + r.url) : r.url;
        return `<a class="search-result" href="${href}" role="option">
          <span class="search-result-title">${escapeHtml(r.title)}</span>
          <span class="search-result-chapter">${escapeHtml(r.chapterTitle || r.chapter)}</span>
        </a>`;
      }).join('');
    }

    function escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    // Debounced input
    if (input) {
      input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => doSearch(input.value), 150);
      });

      // Enter navigates to first result
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const firstResult = resultsContainer.querySelector('.search-result');
          if (firstResult) {
            close();
            window.location.href = firstResult.href;
          }
        }
      });
    }
  })();

  // ---------- 11. Syntax highlighting ----------
  (function () {
    if (!window.hljs) return;

    // Highlight all code blocks
    document.querySelectorAll('pre code').forEach(el => {
      // Skip if already highlighted or is ASCII art
      if (el.closest('.ascii') || el.classList.contains('hljs')) return;

      // Try to detect language from data-label or class
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

    // Theme integration: code blocks are always terminal-dark regardless of page theme,
    // so we always keep the dark hljs stylesheet active.
    function syncHljsTheme() {
      const lightSheet = document.getElementById('hljs-light');
      const darkSheet = document.getElementById('hljs-dark');
      if (lightSheet) lightSheet.media = 'not all';
      if (darkSheet) darkSheet.media = '';
    }

    // Initial sync
    syncHljsTheme();

    // Watch for theme changes (observe data-theme attribute)
    const observer = new MutationObserver(syncHljsTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  })();

  // ---------- 12. Reading progress tracker ----------
  (function () {
    const STORAGE_KEY = 'cc-progress';
    
    function getProgress() {
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return {};
        const parsed = JSON.parse(data);
        if (typeof parsed !== 'object' || parsed === null) return {};
        return parsed;
      } catch {
        return {};
      }
    }
    
    function setProgress(key, value) {
      try {
        const progress = getProgress();
        progress[key] = value;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch {
        // localStorage unavailable — silently degrade
      }
    }
    
    // Detect which chapter we're on
    const path = window.location.pathname;
    let chapterKey = null;
    if (path.includes('01-what-is')) chapterKey = '01';
    else if (path.includes('02-daily')) chapterKey = '02';
    else if (path.includes('03-power')) chapterKey = '03';
    else if (path.includes('04-mental')) chapterKey = '04';
    else if (path.includes('05-easter-eggs')) chapterKey = '05';
    else if (path.includes('reference')) chapterKey = 'ref';
    
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
    if (path.endsWith('index.html') || path.endsWith('/') || path === '' || (!path.includes('chapters/'))) {
      const progress = getProgress();
      const cards = document.querySelectorAll('.toc-card');
      const chapterMap = ['01', '02', '03', '04', '05', 'ref'];
      
      cards.forEach((card, i) => {
        const key = chapterMap[i];
        if (key && progress[key]) {
          card.classList.add('completed');
        }
      });
    }
  })();

})();

// ── Comments & Likes ──────────────────────────────────────────────

(function () {
  const API_BASE = '/api';

  function getOrCreateUser() {
    if (!localStorage.getItem('mavUserId')) {
      localStorage.setItem('mavUserId', crypto.randomUUID());
      localStorage.setItem('mavUsername', '读者#' + Math.floor(Math.random() * 9000 + 1000));
    }
    return {
      userId: localStorage.getItem('mavUserId'),
      username: localStorage.getItem('mavUsername'),
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
    var book = loc.book, chapter = loc.chapter;
    var user = getOrCreateUser();
    var userId = user.userId, username = user.username;

    var pager = document.querySelector('.pager');
    if (!pager) return;
    pager.insertAdjacentHTML('afterend', buildCommentsHTML());

    var toggle = document.getElementById('comments-toggle');
    var body = document.getElementById('comments-body');
    var expanded = false;

    toggle.addEventListener('click', function () {
      expanded = !expanded;
      if (expanded) {
        body.classList.add('open');
        fetchComments();
      } else {
        body.classList.remove('open');
      }
    });

    document.getElementById('identity-name').textContent = username;

    document.getElementById('username-edit-btn').addEventListener('click', function () {
      var cur = localStorage.getItem('mavUsername');
      var next = prompt('修改用户名：', cur);
      if (next && next.trim()) {
        var trimmed = next.trim().slice(0, 50);
        localStorage.setItem('mavUsername', trimmed);
        document.getElementById('identity-name').textContent = trimmed;
      }
    });

    var likeBtn = document.getElementById('like-btn');
    likeBtn.addEventListener('click', async function () {
      likeBtn.disabled = true;
      try {
        var r = await fetch(API_BASE + '/likes/' + book + '/' + chapter, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userId }),
        });
        if (r.ok) {
          var data = await r.json();
          document.getElementById('like-count').textContent = data.likeCount;
          likeBtn.classList.toggle('liked', data.liked);
        }
      } finally {
        likeBtn.disabled = false;
      }
    });

    var submitBtn = document.getElementById('comment-submit');
    var input = document.getElementById('comment-input');
    var errorEl = document.getElementById('comment-error');

    submitBtn.addEventListener('click', async function () {
      var content = input.value.trim();
      if (!content) return;
      errorEl.textContent = '';
      submitBtn.disabled = true;
      try {
        var r = await fetch(API_BASE + '/comments/' + book + '/' + chapter, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId,
            username: localStorage.getItem('mavUsername'),
            content: content,
          }),
        });
        if (r.ok) {
          input.value = '';
          await fetchComments();
        } else {
          var data = await r.json();
          errorEl.textContent = data.error || '发送失败，请重试';
        }
      } catch (e) {
        errorEl.textContent = '网络错误，请重试';
      } finally {
        submitBtn.disabled = false;
      }
    });

    async function fetchComments() {
      try {
        var r = await fetch(API_BASE + '/comments/' + book + '/' + chapter + '?userId=' + encodeURIComponent(userId));
        if (!r.ok) return;
        var data = await r.json();
        var label = document.getElementById('comments-divider-label');
        var count = data.comments.length;
        if (label) {
          label.textContent = expanded
            ? (count > 0 ? '收起 ' + count + ' 条留言' : '收起留言')
            : '展开 ' + count + ' 条留言';
        }
        document.getElementById('like-count').textContent = data.likeCount;
        likeBtn.classList.toggle('liked', data.liked);
        renderComments(data.comments);
      } catch (e) {
        // silently ignore
      }
    }

    // Initial load to get comment count
    fetchComments();
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (location.pathname.includes('/chapters/')) {
      initComments();
    }
  });
})();


// ── Side Panel (Sidenote + Notepad) ──────────────────────────────

(function () {
  const panel = document.getElementById('side-panel');
  if (!panel) return;

  const tabBtns = panel.querySelectorAll('.side-panel-tab');
  const bodyEl = panel.querySelector('.side-panel-body');
  const closeBtn = panel.querySelector('.side-panel-close');
  const header = panel.querySelector('.side-panel-header');
  const notepadFab = document.getElementById('notepad-fab');

  const pathParts = window.location.pathname.split('/');
  const knowledgeIdx = pathParts.indexOf('knowledge');
  const bookSlug = knowledgeIdx >= 0 ? pathParts[knowledgeIdx + 1] : 'default';
  const NOTES_KEY = 'md2html-notes-' + bookSlug;

  let currentMode = null;
  let notepadDirty = false;

  function openPanel(mode, content) {
    currentMode = mode;
    panel.classList.add('open');
    panel.classList.remove('typing');

    tabBtns.forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    if (mode === 'sidenote') {
      bodyEl.innerHTML = '<div class="side-panel-sidenote-content">' + content + '</div>';
    } else {
      var saved = localStorage.getItem(NOTES_KEY) || '';
      bodyEl.innerHTML = '<textarea class="side-panel-notepad" placeholder="随手记点什么...">' + escapeHtml(saved) + '</textarea>';
      var textarea = bodyEl.querySelector('.side-panel-notepad');
      textarea.addEventListener('input', function () {
        localStorage.setItem(NOTES_KEY, textarea.value);
        notepadDirty = textarea.value.trim().length > 0;
      });
      textarea.addEventListener('focus', function () { panel.classList.add('typing'); });
      textarea.addEventListener('blur', function () { panel.classList.remove('typing'); });
      notepadDirty = saved.trim().length > 0;
    }
  }

  function closePanel() {
    panel.classList.remove('open', 'typing');
    currentMode = null;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  if (closeBtn) closeBtn.addEventListener('click', closePanel);

  document.addEventListener('mousedown', function (e) {
    if (panel.classList.contains('open') && currentMode === 'sidenote' &&
        !panel.contains(e.target) &&
        !e.target.closest('.sidenote-mark') && !e.target.closest('.notepad-fab')) {
      closePanel();
    }
  });

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var mode = btn.dataset.mode;
      if (mode === 'notepad') {
        openPanel('notepad');
      } else if (mode === 'sidenote') {
        openPanel('sidenote', buildTipsDirectory());
      }
    });
  });

  function buildTipsDirectory() {
    var marks = document.querySelectorAll('.sidenote-mark');
    if (marks.length === 0) {
      return '<p style="color:var(--muted)">本章暂无补充内容</p>';
    }

    var html = '<p style="color:var(--muted);margin-bottom:12px;">点击下方条目跳转到对应位置</p>';
    html += '<div style="display:flex;flex-direction:column;gap:8px;">';

    marks.forEach(function (mark, i) {
      var heading = '';
      var el = mark;
      while (el) {
        el = el.previousElementSibling || (el.parentElement !== document.body ? el.parentElement : null);
        if (el && /^H[23]$/.test(el.tagName)) {
          heading = el.textContent.trim();
          break;
        }
      }
      if (!heading) {
        var walker = mark.closest('h2, h3, li, p') || mark;
        while (walker && walker !== document.body) {
          var prev = walker.previousElementSibling;
          while (prev) {
            if (/^H[23]$/.test(prev.tagName)) { heading = prev.textContent.trim(); break; }
            prev = prev.previousElementSibling;
          }
          if (heading) break;
          walker = walker.parentElement;
        }
      }

      var rawNote = mark.getAttribute('data-note') || '';
      var tempDiv = document.createElement('div');
      tempDiv.innerHTML = rawNote;
      var summary = tempDiv.textContent.trim().substring(0, 40) + (tempDiv.textContent.length > 40 ? '...' : '');

      html += '<a class="tips-dir-item" data-tips-index="' + i + '" style="display:block;padding:8px 10px;border:1px solid var(--line);border-radius:4px;cursor:pointer;text-decoration:none;transition:background 0.15s;">';
      html += '<div style="font-family:var(--mono);font-size:10px;color:var(--muted);letter-spacing:0.04em;margin-bottom:2px;">' + escapeHtml(heading || '—') + '</div>';
      html += '<div style="font-size:13px;color:var(--ink-2);">' + escapeHtml(summary) + '</div>';
      html += '</a>';
    });

    html += '</div>';
    return html;
  }

  bodyEl.addEventListener('click', function (e) {
    var item = e.target.closest('.tips-dir-item');
    if (!item) return;
    var index = parseInt(item.dataset.tipsIndex);
    var marks = document.querySelectorAll('.sidenote-mark');
    if (marks[index]) {
      marks[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(function () {
        var note = marks[index].getAttribute('data-note') || '';
        openPanel('sidenote', note);
      }, 400);
    }
  });

  document.querySelectorAll('.sidenote-mark').forEach(function (mark) {
    mark.addEventListener('click', function (e) {
      e.stopPropagation();
      var note = mark.getAttribute('data-note') || mark.getAttribute('title') || '';
      if (panel.classList.contains('open') && currentMode === 'sidenote') {
        closePanel();
      } else {
        openPanel('sidenote', note);
      }
    });
  });

  if (notepadFab) {
    notepadFab.addEventListener('click', function (e) {
      e.stopPropagation();
      if (panel.classList.contains('open') && currentMode === 'notepad') {
        closePanel();
      } else {
        openPanel('notepad');
      }
    });
  }

  // Persist panel state
  var PANEL_STATE_KEY = 'md2html-panel-state-' + bookSlug;

  var _origOpen = openPanel;
  var _origClose = closePanel;
  openPanel = function (mode, content) {
    _origOpen(mode, content);
    localStorage.setItem(PANEL_STATE_KEY, JSON.stringify({ open: true, mode: mode }));
  };
  closePanel = function () {
    _origClose();
    localStorage.setItem(PANEL_STATE_KEY, JSON.stringify({ open: false, mode: null }));
  };

  // Restore notepad on load
  try {
    var raw = localStorage.getItem(PANEL_STATE_KEY);
    if (raw) {
      var state = JSON.parse(raw);
      if (state.open && state.mode === 'notepad') {
        openPanel('notepad');
      }
    }
  } catch (e) {}

  // Warn before leaving book if notepad has content
  var bookPathPrefix = '/knowledge/' + bookSlug + '/';
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href]');
    if (!link) return;
    if (!notepadDirty) return;
    var href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
    var resolved = new URL(href, window.location.href);
    if (resolved.pathname.includes(bookPathPrefix)) return;
    var confirmed = window.confirm('你的便利贴还有内容，确定要离开这本书吗？');
    if (!confirmed) e.preventDefault();
  });

  // Draggable
  var isDragging = false;
  var isResizing = false;
  var dragOffsetX = 0;
  var dragOffsetY = 0;

  if (header) {
    header.addEventListener('mousedown', function (e) {
      if (e.target.closest('button')) return;
      isDragging = true;
      var rect = panel.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
      panel.style.transition = 'none';
      e.preventDefault();
    });
  }

  var resizeHandle = document.getElementById('side-panel-resize');
  if (resizeHandle) {
    resizeHandle.addEventListener('mousedown', function (e) {
      isResizing = true;
      panel.style.transition = 'none';
      e.preventDefault();
      e.stopPropagation();
    });
  }

  document.addEventListener('mousemove', function (e) {
    if (isDragging) {
      panel.style.left = (e.clientX - dragOffsetX) + 'px';
      panel.style.top = (e.clientY - dragOffsetY) + 'px';
      panel.style.right = 'auto';
    }
    if (isResizing) {
      var rect = panel.getBoundingClientRect();
      var newWidth = rect.right - e.clientX;
      var newHeight = e.clientY - rect.top;
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

  document.addEventListener('mouseup', function () {
    if (isDragging) { isDragging = false; panel.style.transition = ''; }
    if (isResizing) { isResizing = false; panel.style.transition = ''; }
  });
})();
