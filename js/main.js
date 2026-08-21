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

  // Scroll-driven streak: flowing ribbons spanning the full page height, built to
  // match the real document length so waves stay proportioned on every page (short
  // or long). They scroll normally with content; only the drawn-in portion of each
  // ribbon is tied to scroll position, so motion happens only as you scroll.
  var streakSvg = document.querySelector('.site-streak svg');
  if (streakSvg && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var VIEW_WIDTH = 320;
    var WAVELENGTH = 220; // vertical distance per S-curve — keeps waves the same visual size on any page

    // Build one wavy ribbon as an SVG path string, offset/scaled per ribbon for variety.
    // Walks a continuously advancing sine wave (not just toggling between two points)
    // so the curve is never a straight/degenerate line — that would leave the ribbon's
    // bounding box zero-width, which breaks its gradient fill in some browsers.
    var xAt = function (centerX, amplitude, t) {
      return centerX + Math.sin(t) * amplitude;
    };
    var buildRibbonPath = function (docHeight, centerX, amplitude, phase) {
      var top = -60;
      var bottom = docHeight + 60;
      var t = phase;
      var x = xAt(centerX, amplitude, t);
      var d = 'M ' + x.toFixed(1) + ' ' + top.toFixed(1);
      var y = top;
      while (y < bottom) {
        var nextY = Math.min(y + WAVELENGTH, bottom);
        var segFrac = (nextY - y) / WAVELENGTH;
        var midY = y + (nextY - y) / 2;
        var tMid = t + (Math.PI * segFrac) / 2;
        var tNext = t + Math.PI * segFrac;
        var nextX = xAt(centerX, amplitude, tNext);
        var midX = xAt(centerX, amplitude, tMid);
        // Control points bracket the midpoint so the curve actually bows through
        // it, rather than just interpolating x linearly between the endpoints.
        var cp1X = x + (midX - x) * 1.3;
        var cp2X = nextX + (midX - nextX) * 1.3;
        d += ' C ' + cp1X.toFixed(1) + ' ' + midY.toFixed(1) + ', ' +
             cp2X.toFixed(1) + ' ' + midY.toFixed(1) + ', ' +
             nextX.toFixed(1) + ' ' + nextY.toFixed(1);
        x = nextX;
        y = nextY;
        t = tNext;
      }
      return d;
    };

    var ribbonDefs = [
      { cls: 'streak-path--1', centerX: 190, amplitude: 70, phase: 0 },
      { cls: 'streak-path--2', centerX: 150, amplitude: 60, phase: 0.6 },
      { cls: 'streak-path--3', centerX: 220, amplitude: 55, phase: 1.4 },
      { cls: 'streak-path--4', centerX: 130, amplitude: 45, phase: 2.1 }
    ];

    var streakWrap = document.querySelector('.site-streak');
    var goldGradient = document.getElementById('streakGradientGold');
    var tealGradient = document.getElementById('streakGradientTeal');
    var streakPaths = [];
    var buildPaths = function () {
      var docHeight = document.documentElement.scrollHeight;
      // Percentage heights don't resolve reliably against an auto-height <body>,
      // so size the wrapper and SVG in pixels explicitly rather than via CSS %.
      streakWrap.style.height = docHeight + 'px';
      streakSvg.style.height = docHeight + 'px';
      streakSvg.setAttribute('viewBox', '0 0 ' + VIEW_WIDTH + ' ' + docHeight);
      // Gradients use userSpaceOnUse (not the default objectBoundingBox) because a
      // ribbon can be momentarily straight/degenerate, which makes bounding-box
      // gradients fail to paint at all — keep their span matched to the real page.
      if (goldGradient) goldGradient.setAttribute('y2', docHeight);
      if (tealGradient) tealGradient.setAttribute('y2', docHeight);
      streakSvg.querySelectorAll('.streak-path').forEach(function (el) { el.remove(); });
      streakPaths = ribbonDefs.map(function (def) {
        var el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        el.setAttribute('class', 'streak-path ' + def.cls);
        el.setAttribute('d', buildRibbonPath(docHeight, def.centerX, def.amplitude, def.phase));
        streakSvg.appendChild(el);
        return el;
      });
    };

    var pathLengths = [];
    var cacheLengths = function () {
      pathLengths = streakPaths.map(function (path) {
        var len = path.getTotalLength();
        // Plain numeric SVG presentation attributes — avoids a CSS calc()/var()
        // chain resolving to an invalid typed length on some engines.
        path.setAttribute('stroke-dasharray', len);
        return len;
      });
    };

    buildPaths();
    cacheLengths();

    // Slight per-ribbon stagger so they don't all trace in perfectly in sync
    var staggers = [0, 0.04, -0.03, 0.06];
    var current = [0, 0, 0, 0];

    var targetProgress = 0;
    var readTarget = function () {
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - doc.clientHeight;
      targetProgress = scrollable > 0 ? window.scrollY / scrollable : 0;
    };

    // Always keep at least this many px of ribbon visible from the top, so a
    // short page (where 5% of the path is only a few dozen px, hidden behind the
    // sticky header) still shows a real stretch of ribbon on load.
    var MIN_VISIBLE_PX = 220;
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
        var len = pathLengths[i] || 0;
        var minVisible = len > 0 ? Math.min(1, MIN_VISIBLE_PX / len) : 0;
        var visible = Math.max(current[i], minVisible);
        path.setAttribute('stroke-dashoffset', len * (1 - visible));
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

    var rebuild = function () {
      buildPaths();
      cacheLengths();
      requestTick();
    };

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(rebuild, 150);
    });

    // Fonts/images loading in after DOMContentLoaded can change the document's
    // real height — rebuild once everything has settled so the ribbons span the
    // page correctly instead of a too-early, too-short measurement.
    window.addEventListener('load', rebuild);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(rebuild);
    }
  }
});
