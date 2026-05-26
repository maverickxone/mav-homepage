// ============================================================
// Mermaid.js initialization
// Converts <pre><code class="language-mermaid"> blocks into rendered diagrams
// ============================================================
(function () {
  'use strict';

  var blocks = document.querySelectorAll('pre > code.language-mermaid');
  if (!blocks.length) return;

  // Load mermaid from CDN
  var script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mermaid/11.4.1/mermaid.min.js';
  script.onload = function () {
    // Detect theme
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      fontFamily: 'Inter, sans-serif',
      fontSize: 13,
      flowchart: { useMaxWidth: true, htmlLabels: true },
      sequence: { useMaxWidth: true },
      themeVariables: isDark
        ? { primaryColor: '#2a2a2a', primaryTextColor: '#e0e0e0', lineColor: '#666' }
        : { primaryColor: '#fafaf5', primaryTextColor: '#1a1a1a', lineColor: '#ccc' }
    });

    // Convert code blocks to mermaid containers
    blocks.forEach(function (code, i) {
      var pre = code.parentElement;
      var container = document.createElement('div');
      container.className = 'mermaid';
      container.textContent = code.textContent;
      pre.parentNode.replaceChild(container, pre);
    });

    // Render
    mermaid.run();
  };
  document.head.appendChild(script);
})();
