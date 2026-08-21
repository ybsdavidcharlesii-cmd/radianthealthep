// Radiant Health and Wellness — shared site scripts

document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      var expanded = links.classList.contains('open');
      toggle.setAttribute('aria-expanded', expanded);
    });

    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        links.classList.remove('open');
      });
    });
  }

  // Mark current page's nav link active
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });

  // Footer year
  var yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Scroll-driven streak: ribbons trace in as the page scrolls, no motion on their own.
  // Progress is lerped toward the scroll target every frame so the reveal glides
  // instead of snapping/stepping with each scroll event.
  var streakPaths = document.querySelectorAll('.site-streak .streak-path');
  if (streakPaths.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Slight per-ribbon stagger so they don't all trace in perfectly in sync
    var staggers = [0, 0.04, -0.03, 0.06];
    var current = [];
    streakPaths.forEach(function (path, i) {
      path.style.setProperty('--streak-length', path.getTotalLength());
      current[i] = 0;
    });

    var targetProgress = 0;
    var readTarget = function () {
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - doc.clientHeight;
      targetProgress = scrollable > 0 ? window.scrollY / scrollable : 0;
    };

    var raf = null;
    var tick = function () {
      var settled = true;
      streakPaths.forEach(function (path, i) {
        var target = Math.max(0, Math.min(1, targetProgress + (staggers[i % staggers.length] || 0)));
        var delta = target - current[i];
        if (Math.abs(delta) > 0.0005) {
          current[i] += delta * 0.08;
          settled = false;
        } else {
          current[i] = target;
        }
        path.style.setProperty('--streak-progress', current[i]);
      });
      raf = settled ? null : window.requestAnimationFrame(tick);
    };

    var requestTick = function () {
      readTarget();
      if (!raf) {
        raf = window.requestAnimationFrame(tick);
      }
    };

    requestTick();
    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick);
  }
});
