// ============================================================
// md2HTML — Core Interactions
// Theme toggle, progress bar, TOC highlighting, collapsible,
// tabs, search, syntax highlighting, reading progress tracker
// ============================================================

(function () {
  'use strict';

  // ---------- 0. Theme & size preference ----------
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('md2html-theme');
  const savedSize = localStorage.getItem('md2html-size');
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

  // ---------- 4. Settings popover (theme + size) ----------
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
        if (mode === 'light') { root.removeAttribute('data-theme'); localStorage.setItem('md2html-theme', 'light'); }
        else { root.setAttribute('data-theme', 'dark'); localStorage.setItem('md2html-theme', 'dark'); }
        syncActive();
      }
      const s = e.target.closest('[data-size-set]');
      if (s) {
        const size = s.getAttribute('data-size-set');
        root.setAttribute('data-size', size);
        localStorage.setItem('md2html-size', size);
        syncActive();
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
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return {};
        return JSON.parse(data) || {};
      } catch { return {}; }
    }

    function setProgress(key, value) {
      try {
        const progress = getProgress();
        progress[key] = value;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
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

})();
