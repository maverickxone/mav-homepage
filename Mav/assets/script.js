// Mav's Home — minimal interactions
(function () {
  'use strict';

  // Theme preference
  const root = document.documentElement;
  const saved = localStorage.getItem('mav-theme');
  if (saved === 'dark') root.setAttribute('data-theme', 'dark');

  // Active nav link — match by directory
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    // Extract the directory segment (about, knowledge, timeline, blog)
    const segment = href.match(/(about|knowledge|timeline|blog)/);
    if (segment && path.includes('/' + segment[1] + '/')) {
      a.classList.add('active');
    }
  });
})();
