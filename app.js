'use strict';

const STORE_KEY = 'bookshelf.books';
const GKEY_KEY = 'bookshelf.googleKey';
const POLYFILL = 'https://cdn.jsdelivr.net/npm/barcode-detector@3.2.2/ponyfill/+esm';
const collator = new Intl.Collator(['ru', 'en'], { sensitivity: 'base', numeric: true });

const $ = (id) => document.getElementById(id);
let books = load();

/* ---------- storage ---------- */

function load() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch { return []; }
}
function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(books));
  render();
}

/* ---------- ISBN helpers ---------- */

// Returns a checked 13-digit code (ISBN-13 / EAN-13), or null.
function normalizeCode(raw) {
  const s = String(raw).toUpperCase().replace(/[^0-9X]/g, '');
  if (/^\d{9}[\dX]$/.test(s)) return isbn10to13(s);
  if (/^\d{12}$/.test(s)) return eanValid('0' + s) ? '0' + s : null; // UPC-A
  if (/^\d{13}$/.test(s)) return eanValid(s) ? s : null;
  return null;
}
function isbn10to13(s) {
  let sum = 0;
  for (let i = 0; i < 10; i++) sum += (s[i] === 'X' ? 10 : +s[i]) * (10 - i);
  if (sum % 11) return null;
  const body = '978' + s.slice(0, 9);
  return body + eanCheck(body);
}
function eanCheck(body12) {
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += +body12[i] * (i % 2 ? 3 : 1);
  return (10 - (sum % 10)) % 10;
}
function eanValid(s) { return eanCheck(s.slice(0, 12)) === +s[12]; }
const isIsbn = (code) => /^97[89]/.test(code);

/* ---------- metadata lookup ---------- */

async function fetchJson(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!r.ok) throw new Error(r.status);
  return r.json();
}

async function fromOpenLibrary(isbn) {
  const d = await fetchJson(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
  const b = d[`ISBN:${isbn}`];
  if (!b) return null;
  return {
    title: b.title + (b.subtitle ? ': ' + b.subtitle : ''),
    authors: (b.authors || []).map((a) => a.name).filter((n, i, all) => all.indexOf(n) === i).join(', '),
    publisher: b.publishers?.[0]?.name || '',
    year: (b.publish_date || '').match(/\d{4}/)?.[0] || '',
    cover: b.cover?.medium || '',
  };
}

async function fromGoogle(isbn) {
  const key = localStorage.getItem(GKEY_KEY);
  const d = await fetchJson(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}${key ? '&key=' + encodeURIComponent(key) : ''}`);
  const v = d.items?.[0]?.volumeInfo;
  if (!v) return null;
  return {
    title: v.title + (v.subtitle ? ': ' + v.subtitle : ''),
    authors: (v.authors || []).join(', '),
    publisher: v.publisher || '',
    year: (v.publishedDate || '').slice(0, 4),
    cover: (v.imageLinks?.thumbnail || '').replace(/^http:/, 'https:').replace('&edge=curl', ''),
  };
}

// Russian editions (978-5) are better covered by Google Books; others by Open Library.
async function lookup(isbn) {
  const sources = isbn.startsWith('9785') ? [fromGoogle, fromOpenLibrary] : [fromOpenLibrary, fromGoogle];
  let found = null;
  for (const src of sources) {
    const r = await src(isbn).catch(() => null);
    if (!r) continue;
    if (!found) found = r;
    else if (!found.cover && r.cover) found.cover = r.cover;
    if (found.cover) break;
  }
  return found;
}

/* ---------- list ---------- */

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function render() {
  const q = $('search').value.trim().toLowerCase();
  const sort = $('sort').value;
  let shown = books.filter((b) =>
    !q || [b.title, b.authors, b.isbn, b.publisher, b.notes].some((f) => (f || '').toLowerCase().includes(q)));

  if (sort === 'title') shown.sort((a, b) => collator.compare(a.title, b.title));
  else if (sort === 'author') shown.sort((a, b) => collator.compare(a.authors || '￿', b.authors || '￿') || collator.compare(a.title, b.title));
  else shown.sort((a, b) => b.added - a.added);

  $('count').textContent = books.length ? `${books.length} ${books.length === 1 ? 'book' : 'books'}` : '';
  $('empty').hidden = books.length > 0;
  $('list').innerHTML = shown.map((b) => `
    <button class="book" data-id="${esc(b.id)}">
      ${b.cover ? `<img src="${esc(b.cover)}" alt="" loading="lazy">` : '<div class="cover-ph">No cover</div>'}
      <div class="meta">
        <div class="title">${esc(b.title)}</div>
        <div class="sub">${esc([b.authors, b.year].filter(Boolean).join(' · '))}</div>
      </div>
    </button>`).join('') ||
    (books.length ? '<p class="empty">Nothing matches your search.</p>' : '');
}

/* ---------- book sheet ---------- */

let editing = null; // { book, isNew, fromScan }

function openSheet(book, { isNew = false, fromScan = false, note = '', warn = false } = {}) {
  editing = { book, isNew, fromScan };
  const f = $('bookForm');
  for (const name of ['title', 'authors', 'publisher', 'year', 'notes']) f.elements[name].value = book[name] || '';
  $('fIsbnText').textContent = book.isbn || '—';
  $('fCoverImg').hidden = !book.cover;
  $('fCoverPh').hidden = !!book.cover;
  if (book.cover) $('fCoverImg').src = book.cover;
  $('sheetNote').textContent = note;
  $('sheetNote').className = 'note' + (warn ? ' warn' : '');
  $('saveBtn').textContent = isNew ? 'Add book' : 'Save';
  $('deleteBtn').hidden = isNew;
  $('saveNextBtn').hidden = !(isNew && fromScan);
  $('sheet').hidden = false;
  if (isNew && !book.title) f.elements.title.focus();
}

function closeSheet() {
  $('sheet').hidden = true;
  editing = null;
}

$('bookForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target;
  const { book, isNew } = editing;
  for (const name of ['title', 'authors', 'publisher', 'year', 'notes']) book[name] = f.elements[name].value.trim();
  if (isNew) {
    book.id = book.isbn || (crypto.randomUUID?.() || String(Date.now()));
    book.added = Date.now();
    books.push(book);
  }
  const next = e.submitter?.value === 'next';
  save();
  closeSheet();
  toast(isNew ? 'Added' : 'Saved');
  if (next) startScanner();
});

$('fCoverImg').addEventListener('error', () => { $('fCoverImg').hidden = true; $('fCoverPh').hidden = false; });
$('cancelBtn').addEventListener('click', closeSheet);
$('sheet').addEventListener('click', (e) => { if (e.target.id === 'sheet') closeSheet(); });
$('deleteBtn').addEventListener('click', () => {
  if (!confirm(`Delete “${editing.book.title}”?`)) return;
  books = books.filter((b) => b !== editing.book);
  save();
  closeSheet();
});
$('list').addEventListener('click', (e) => {
  const el = e.target.closest('.book');
  if (el) openSheet(books.find((b) => b.id === el.dataset.id));
});

/* ---------- adding by code ---------- */

let busy = false;

async function addByCode(raw, fromScan = false) {
  const isbn = normalizeCode(raw);
  if (!isbn) { toast('That doesn’t look like a valid ISBN'); return; }

  const existing = books.find((b) => b.isbn === isbn);
  if (existing) {
    openSheet(existing, { note: 'Already in your library', warn: true, fromScan });
    return;
  }
  if (busy) return;
  busy = true;
  toast('Looking up…', 0);
  const data = await lookup(isbn);
  busy = false;
  hideToast();
  openSheet({ isbn, ...(data || {}) }, {
    isNew: true,
    fromScan,
    note: data ? '' : (isIsbn(isbn) ? 'Not found online — enter details' : 'Not an ISBN barcode — enter details'),
  });
}

$('isbnForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const v = $('isbnInput').value;
  if (!v.trim()) return;
  $('isbnInput').value = '';
  addByCode(v);
});

/* ---------- camera scanner ---------- */

let stream = null;
let detectorPromise = null;

function getDetector() {
  const formats = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];
  detectorPromise ??= (async () => {
    if ('BarcodeDetector' in window) {
      try {
        const supported = await window.BarcodeDetector.getSupportedFormats();
        if (supported.includes('ean_13')) return new window.BarcodeDetector({ formats });
      } catch { /* fall through to polyfill */ }
    }
    const mod = await import(POLYFILL);
    return new mod.BarcodeDetector({ formats });
  })();
  detectorPromise.catch(() => { detectorPromise = null; });
  return detectorPromise;
}

async function startScanner() {
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    toast('Camera needs https:// or localhost. Type the ISBN instead.', 4000);
    return;
  }
  $('scanner').hidden = false;
  $('scanHint').textContent = 'Starting camera…';
  try {
    const [detector, s] = await Promise.all([
      getDetector(),
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }),
    ]);
    stream = s;
    if ($('scanner').hidden) { stopScanner(); return; } // closed while starting
    const video = $('video');
    video.srcObject = stream;
    await video.play();
    $('scanHint').textContent = 'Point at the barcode';
    scanLoop(detector, video);
  } catch (err) {
    stopScanner();
    toast(err.name === 'NotAllowedError' ? 'Camera permission denied' : 'Could not start scanner', 3500);
  }
}

async function scanLoop(detector, video) {
  let lastOther = null, otherHits = 0;
  while (stream) {
    try {
      const codes = (await detector.detect(video)).map((c) => normalizeCode(c.rawValue)).filter(Boolean);
      const isbn = codes.find(isIsbn);
      if (isbn) return onScanned(isbn);
      // Non-ISBN barcode: require a few identical reads before accepting.
      if (codes[0]) {
        otherHits = codes[0] === lastOther ? otherHits + 1 : 1;
        lastOther = codes[0];
        if (otherHits >= 4) return onScanned(codes[0]);
      }
    } catch { /* frame not ready */ }
    await new Promise((r) => setTimeout(r, 120));
  }
}

function onScanned(code) {
  navigator.vibrate?.(60);
  stopScanner();
  addByCode(code, true);
}

function stopScanner() {
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
  $('video').srcObject = null;
  $('scanner').hidden = true;
}

$('scanBtn').addEventListener('click', startScanner);
$('closeScan').addEventListener('click', stopScanner);

/* ---------- menu: backup + settings ---------- */

$('menuBtn').addEventListener('click', (e) => { e.stopPropagation(); $('menu').hidden = !$('menu').hidden; });
document.addEventListener('click', () => { $('menu').hidden = true; });

$('menu').addEventListener('click', (e) => {
  const action = e.target.dataset.action;
  if (action === 'export') exportBooks();
  if (action === 'import') $('importFile').click();
  if (action === 'gkey') {
    const v = prompt('Google Books API key (optional, improves lookups when the free quota runs out). Leave empty to remove.', localStorage.getItem(GKEY_KEY) || '');
    if (v === null) return;
    v.trim() ? localStorage.setItem(GKEY_KEY, v.trim()) : localStorage.removeItem(GKEY_KEY);
    toast(v.trim() ? 'Key saved' : 'Key removed');
  }
});

function exportBooks() {
  const blob = new Blob([JSON.stringify(books, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `bookshelf-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

$('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    const incoming = JSON.parse(await file.text());
    if (!Array.isArray(incoming)) throw new Error();
    const ids = new Set(books.map((b) => b.id));
    const fresh = incoming.filter((b) => b && b.id && b.title && !ids.has(b.id));
    books.push(...fresh);
    save();
    toast(`Imported ${fresh.length} ${fresh.length === 1 ? 'book' : 'books'}`);
  } catch {
    toast('Not a valid backup file');
  }
});

/* ---------- toast ---------- */

let toastTimer;
function toast(msg, ms = 2000) {
  $('toast').textContent = msg;
  $('toast').hidden = false;
  clearTimeout(toastTimer);
  if (ms) toastTimer = setTimeout(hideToast, ms);
}
function hideToast() { $('toast').hidden = true; }

/* ---------- init ---------- */

$('search').addEventListener('input', render);
$('sort').addEventListener('change', render);
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!$('scanner').hidden) stopScanner();
  else if (!$('sheet').hidden) closeSheet();
});
render();
