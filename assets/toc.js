/* ============================================================================
   이력서 · 자기소개서 공통 — 왼쪽에 따라다니는 목차(.rtoc)
   목차 링크의 href(#id) 와 본문 섹션 id 가 1:1로 대응한다.
   ============================================================================ */
/* 따라다니는 목차 — 클릭 시 해당 영역으로 빠르게 스크롤, 현재 보고 있는 영역 강조 */
(function () {
  var toc = document.querySelector('.rtoc');
  if (!toc) return;
  var links = Array.prototype.slice.call(toc.querySelectorAll('a'));
  var targets = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var OFFSET = 72; // 고정 내비 높이 + 여유

  // 페이지 전역의 scroll-behavior:smooth 와 겹치지 않도록 매 프레임 즉시 이동(instant)으로 직접 애니메이션
  function jump(y) {
    try { window.scrollTo({ top: y, left: 0, behavior: 'instant' }); }
    catch (err) { window.scrollTo(0, y); }
  }
  function scrollToY(y) {
    if (reduce) { jump(y); return; }
    var startY = window.pageYOffset, dist = y - startY, dur = 320, t0 = null, done = false;
    function finish() {
      if (done) return;
      done = true;
      jump(y);
      update();
    }
    function step(ts) {
      if (done) return;
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      jump(startY + dist * (1 - Math.pow(1 - p, 3))); // easeOutCubic
      if (p < 1) window.requestAnimationFrame(step); else finish();
    }
    window.requestAnimationFrame(step);
    window.setTimeout(finish, dur + 120); // 애니메이션 프레임이 멈춘 환경에서도 목적지 도달 보장
  }

  links.forEach(function (a, i) {
    a.addEventListener('click', function (e) {
      var el = targets[i];
      if (!el) return;
      e.preventDefault();
      var y = el.getBoundingClientRect().top + window.pageYOffset - OFFSET;
      if (i === 0) y = 0; // 첫 항목은 맨 위로
      scrollToY(Math.max(0, y));
      history.replaceState(null, '', a.getAttribute('href'));
    });
  });

  function update() {
    var cur = 0;
    targets.forEach(function (el, i) {
      if (el && el.getBoundingClientRect().top - OFFSET - 80 <= 0) cur = i;
    });
    // 페이지 끝에 닿으면 마지막 항목
    if (window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 2) cur = targets.length - 1;
    links.forEach(function (a, i) { a.classList.toggle('is-active', i === cur); });
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();

