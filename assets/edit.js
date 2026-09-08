/*
  브라우저 임시 편집 모드
  - 수정 내용은 이 브라우저의 localStorage에만 저장됩니다 (다른 방문자에게는 보이지 않음).
  - "내보내기"로 현재 페이지 전체를 편집된 상태의 HTML 파일로 내려받을 수 있습니다.
    그 파일을 다시 전달하면 실제 사이트 파일에 반영할 수 있습니다.
*/
(function () {
  'use strict';

  var STORAGE_KEY = 'portfolio-edits:' + location.pathname;
  var EDITABLE_SELECTOR = 'h1,h2,h3,h4,p,dd,.tag,.qa__len,.pcard__meta';
  var EXCLUDE_CLOSEST = 'header,footer,nav,.doctabs,.anchornav,.projectnav,.nextdocs,' +
    '.pagehead__actions,.filters,.editbar,button,a.btn,.backlink';

  var root = document.body;

  var editables = [];
  var editing = false;
  var saveTimer = null;

  function isExcluded(el) {
    return el.closest(EXCLUDE_CLOSEST) !== null;
  }

  function pathFor(el) {
    var parts = [];
    var node = el;
    while (node && node !== root) {
      var parent = node.parentElement;
      if (!parent) break;
      var same = Array.prototype.filter.call(parent.children, function (c) {
        return c.tagName === node.tagName;
      });
      var idx = same.indexOf(node);
      parts.unshift(node.tagName.toLowerCase() + ':' + idx);
      node = parent;
    }
    parts.unshift('root');
    return parts.join('>');
  }

  function collectEditables() {
    var nodes = root.querySelectorAll(EDITABLE_SELECTOR);
    Array.prototype.forEach.call(nodes, function (el) {
      if (isExcluded(el)) return;
      if (el.querySelector('a')) return; // 링크가 섞인 요소는 안전을 위해 편집 대상에서 제외
      el.dataset.ek = pathFor(el);
      editables.push(el);
    });

    // 목록형 항목(경력/학력/자격증 등)의 이름·기간은 각각 개별 편집 대상으로
    var rowSpans = root.querySelectorAll('li .n, li .m');
    Array.prototype.forEach.call(rowSpans, function (el) {
      if (isExcluded(el)) return;
      el.dataset.ek = pathFor(el);
      editables.push(el);
    });
  }

  function loadEdits() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch (e) { return {}; }
  }
  function saveEditsData(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
    catch (e) { /* 저장 공간이 없거나 접근 불가한 경우 조용히 무시 */ }
  }

  function applyEdits() {
    var data = loadEdits();
    editables.forEach(function (el) {
      var key = el.dataset.ek;
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        el.innerHTML = data[key];
      }
    });
  }

  function saveNow() {
    var data = loadEdits();
    editables.forEach(function (el) {
      data[el.dataset.ek] = el.innerHTML;
    });
    saveEditsData(data);
    showToast('저장됨');
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 500);
  }

  var toastEl = null;
  var toastTimer = null;
  function showToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'edittoast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-shown');
    }, 1400);
  }

  function stripFormattingPaste(e) {
    e.preventDefault();
    var text = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, text);
  }

  function guardEnter(el) {
    return function (e) {
      if (e.key === 'Enter' && el.tagName !== 'P') {
        e.preventDefault();
        el.blur();
      }
    };
  }

  function setEditing(on) {
    editing = on;
    document.body.classList.toggle('is-editing', on);
    editables.forEach(function (el) {
      el.setAttribute('contenteditable', on ? 'true' : 'false');
    });
    var bar = document.getElementById('editbar');
    if (bar) bar.hidden = !on;
    var toggle = document.getElementById('editToggle');
    if (toggle) toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (on) showToast('수정 모드 — 텍스트를 눌러 바로 고치세요');
  }

  function exportPage() {
    var clone = document.documentElement.cloneNode(true);
    var body = clone.querySelector('body');
    body.classList.remove('is-editing');

    Array.prototype.forEach.call(clone.querySelectorAll('[data-ek]'), function (el) {
      el.removeAttribute('contenteditable');
      el.removeAttribute('data-ek');
    });
    var bar = clone.querySelector('#editbar');
    if (bar) bar.parentNode.removeChild(bar);
    var toast = clone.querySelector('.edittoast');
    if (toast) toast.parentNode.removeChild(toast);

    var html = '<!doctype html>\n' + clone.outerHTML;
    var blob = new Blob([html], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var name = (location.pathname.split('/').pop() || 'page.html').replace(/\.html$/, '');
    a.href = url;
    a.download = name + '-edited.html';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    showToast('내보냈습니다 — 다운로드 폴더 확인');
  }

  function resetPage() {
    if (!window.confirm('이 페이지에 저장된 수정 내용을 모두 지울까요? 되돌릴 수 없습니다.')) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    location.reload();
  }

  // 편집 모드에서는 카드 안의 텍스트를 눌러도 링크로 이동하지 않도록 막는다
  document.addEventListener('click', function (e) {
    if (!editing) return;
    var link = e.target.closest ? e.target.closest('a') : null;
    if (link && link.querySelector('[data-ek]')) {
      e.preventDefault();
    }
  }, true);

  document.addEventListener('DOMContentLoaded', function () {
    collectEditables();
    applyEdits();

    editables.forEach(function (el) {
      el.addEventListener('input', scheduleSave);
      el.addEventListener('paste', stripFormattingPaste);
      el.addEventListener('keydown', guardEnter(el));
    });

    var toggle = document.getElementById('editToggle');
    if (toggle) {
      toggle.addEventListener('click', function () { setEditing(!editing); });
    }
    var doneBtn = document.getElementById('editDone');
    if (doneBtn) doneBtn.addEventListener('click', function () { setEditing(false); });
    var exportBtn = document.getElementById('editExport');
    if (exportBtn) exportBtn.addEventListener('click', exportPage);
    var resetBtn = document.getElementById('editReset');
    if (resetBtn) resetBtn.addEventListener('click', resetPage);
  });
})();
