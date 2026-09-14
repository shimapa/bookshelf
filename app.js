'use strict';

const STORE_KEY = 'bookshelf.books';
const GKEY_KEY = 'bookshelf.googleKey';
const LAST_LOC_KEY = 'bookshelf.lastLocation';
const FIELDS = ['title', 'authors', 'publisher', 'year', 'location', 'notes'];
const POLYFILL = 'https://cdn.jsdelivr.net/npm/barcode-detector@3.2.2/ponyfill/+esm';
const collator = new Intl.Collator(['ru', 'en'], { sensitivity: 'base', numeric: true });

const $ = (id) => document.getElementById(id);
let books = load();
let locFilter = null; // null = all, '' = books without a location, otherwise a location name

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

// AbortSignal.timeout is missing on older iOS Safari; without a timeout a slow API would hang forever.
function timeout(ms = 10000) {
  if (AbortSignal.timeout) return AbortSignal.timeout(ms);
  const c = new AbortController();
  setTimeout(() => c.abort(), ms);
  return c.signal;
}

async function fetchJson(url) {
  const r = await fetch(url, { signal: timeout() });
  if (!r.ok) throw new Error(r.status);
  return r.json();
}

async function fromOpenLibrary(isbn) {
  const d = await fetchJson(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
  const b = d[`ISBN:${isbn}`];
  if (!b) return null;
  let authors = (b.authors || []).map((a) => a.name).filter((n, i, all) => all.indexOf(n) === i).join(', ');
  if (!authors) {
    // Edition records often lack authors; the work-level search index usually has them.
    const s = await fetchJson(`https://openlibrary.org/search.json?isbn=${isbn}&fields=author_name&limit=1`).catch(() => null);
    authors = (s?.docs?.[0]?.author_name || []).join(', ');
  }
  return {
    title: b.title + (b.subtitle ? ': ' + b.subtitle : ''),
    authors,
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

// Chitai-gorod (Russian bookstore) search API: needs a free anonymous token, cached until it expires.
const CG_API = 'https://web-gate.chitai-gorod.ru/api';
const CG_TOKEN_KEY = 'bookshelf.cgToken';

async function chitaiGorodToken(fresh = false) {
  const cached = JSON.parse(localStorage.getItem(CG_TOKEN_KEY) || 'null');
  if (!fresh && cached && cached.exp * 1000 > Date.now() + 60000) return cached.token;
  const r = await fetch(`${CG_API}/v1/auth/anonymous`, { method: 'POST', signal: timeout() });
  if (!r.ok) throw new Error(r.status);
  const { token } = await r.json();
  localStorage.setItem(CG_TOKEN_KEY, JSON.stringify({ token: token.accessToken, exp: token.expAccessToken }));
  return token.accessToken;
}

async function fromChitaiGorod(isbn) {
  const search = async (token) => fetch(`${CG_API}/v2/search/product?phrase=${isbn}`, {
    headers: { Authorization: token },
    signal: timeout(),
  });
  let r = await search(await chitaiGorodToken());
  if (r.status === 401) r = await search(await chitaiGorodToken(true));
  if (!r.ok) throw new Error(r.status);
  const a = (await r.json()).included?.find((i) => i.type === 'product')?.attributes;
  if (!a) return null;
  return {
    title: a.title,
    authors: (a.authors || []).map((p) => [p.firstName, p.lastName].filter(Boolean).join(' ')).join(', '),
    publisher: a.publisher?.title || '',
    year: a.yearPublishing ? String(a.yearPublishing) : '',
    cover: a.picture ? `https://content.img-gorod.ru${a.picture}?width=400&height=560&fit=bounds` : '',
  };
}

// Loads an image URL; resolves to its natural size, or null if it fails.
function probeImage(url, ms = 8000) {
  return new Promise((resolve) => {
    const img = new Image();
    const done = (v) => { clearTimeout(t); img.onload = img.onerror = null; resolve(v); };
    const t = setTimeout(() => done(null), ms);
    img.onload = () => done({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => done(null);
    img.src = url;
  });
}

// Cover images addressable by ISBN alone (no API quota). Probed in parallel, first usable one wins.
async function findCover(isbn) {
  const candidates = [
    { url: `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false` }, // 404 when missing
  ];
  if (isIsbn(isbn) && isbn.startsWith('978')) {
    const body = isbn.slice(3, 12);
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += +body[i] * (10 - i);
    const check = (11 - (sum % 11)) % 11;
    // Amazon serves a 1×1 GIF when it has no cover.
    candidates.push({ url: `https://images-na.ssl-images-amazon.com/images/P/${body}${check === 10 ? 'X' : check}.01.LZZZZZZZ.jpg` });
  }
  // Google serves a 128×170 "image not available" PNG when it has no cover.
  candidates.push({ url: `https://books.google.com/books/content?vid=ISBN${isbn}&printsec=frontcover&img=1&zoom=1`, placeholder: [128, 170] });

  const sizes = await Promise.all(candidates.map((c) => probeImage(c.url)));
  const i = sizes.findIndex((size, i) => size && size.w > 20 && size.h > 20 &&
    !(candidates[i].placeholder && size.w === candidates[i].placeholder[0] && size.h === candidates[i].placeholder[1]));
  return i === -1 ? '' : candidates[i].url;
}

// Russian editions (978-5) are best covered by Chitai-gorod; others by Open Library.
// Empty fields are filled from later sources; a cover is searched by ISBN if no source has one.
// Returns { found, report } — report lists each source's outcome so a miss can be diagnosed on the phone.
async function lookup(isbn) {
  const cg = ['Chitai-gorod', fromChitaiGorod], ol = ['Open Library', fromOpenLibrary], gb = ['Google Books', fromGoogle];
  const sources = isbn.startsWith('9785') ? [cg, ol, gb] : [ol, gb, cg];
  let found = null;
  const report = [];
  for (const [name, src] of sources) {
    let r = null;
    try {
      r = await src(isbn);
      report.push(`${name}: ${r ? 'found' : 'no match'}`);
    } catch (err) {
      report.push(`${name}: error ${err.name === 'Error' ? err.message : err.name + ' ' + err.message}`);
    }
    if (!r) continue;
    found ??= {};
    for (const [k, v] of Object.entries(r)) if (!found[k] && v) found[k] = v;
    if (found.title && found.authors && found.cover) break;
  }
  if (found && !found.cover) found.cover = await findCover(isbn);
  return { found, report };
}

/* ---------- list ---------- */

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Distinct locations, sorted, with book counts.
function locations() {
  const counts = new Map();
  for (const b of books) if (b.location) counts.set(b.location, (counts.get(b.location) || 0) + 1);
  return [...counts].sort((a, b) => collator.compare(a[0], b[0]));
}

function renderLocations() {
  const locs = locations();
  if (locFilter && !locs.some(([name]) => name === locFilter)) locFilter = null;
  const unplaced = books.filter((b) => !b.location).length;
  const chip = (value, label, n) => `<button class="chip${locFilter === value ? ' on' : ''}" data-loc="${value === null ? '*' : esc(value)}">${esc(label)} <span>${n}</span></button>`;
  $('locations').hidden = locs.length === 0;
  $('locations').innerHTML = locs.length === 0 ? '' : [
    chip(null, 'All', books.length),
    ...locs.map(([name, n]) => chip(name, name, n)),
    unplaced ? chip('', 'No location', unplaced) : '',
  ].join('');
  $('locationList').innerHTML = locs.map(([name]) => `<option value="${esc(name)}">`).join('');
}

function render() {
  renderLocations();
  const q = $('search').value.trim().toLowerCase();
  const sort = $('sort').value;
  let shown = books.filter((b) =>
    (locFilter === null || (b.location || '') === locFilter) &&
    (!q || [b.title, b.authors, b.isbn, b.publisher, b.location, b.notes].some((f) => (f || '').toLowerCase().includes(q))));

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
        ${b.location ? `<div class="tag">${esc(b.location)}</div>` : ''}
      </div>
    </button>`).join('') ||
    (books.length ? '<p class="empty">Nothing matches your search.</p>' : '');
}

/* ---------- book sheet ---------- */

let editing = null; // { book, isNew, fromScan }

function openSheet(book, { isNew = false, fromScan = false, note = '', warn = false, detail = '' } = {}) {
  editing = { book, isNew, fromScan };
  const f = $('bookForm');
  for (const name of FIELDS) f.elements[name].value = book[name] || '';
  // New books default to the last location used, so a whole shelf can be scanned in a row.
  if (isNew && !book.location) f.elements.location.value = localStorage.getItem(LAST_LOC_KEY) || '';
  $('fIsbnText').textContent = book.isbn || '—';
  $('fCoverImg').hidden = !book.cover;
  $('fCoverPh').hidden = !!book.cover;
  if (book.cover) $('fCoverImg').src = book.cover;
  $('sheetNote').textContent = note;
  $('sheetNote').className = 'note' + (warn ? ' warn' : '');
  $('sheetDetail').textContent = detail;
  $('sheetDetail').hidden = !detail;
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
  for (const name of FIELDS) book[name] = f.elements[name].value.trim().replace(/\s+/g, ' ');
  // Reuse an existing location's spelling when only the case differs ("гостиная" → "Гостиная").
  const same = locations().find(([name]) => name.toLowerCase() === book.location.toLowerCase());
  if (same) book.location = same[0];
  if (isNew) localStorage.setItem(LAST_LOC_KEY, book.location);
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
// A cover URL that stops working falls back to the placeholder.
$('list').addEventListener('error', (e) => {
  if (e.target.tagName === 'IMG') e.target.outerHTML = '<div class="cover-ph">No cover</div>';
}, true);
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
  const { found: data, report } = await lookup(isbn);
  busy = false;
  hideToast();
  openSheet({ isbn, ...(data || {}) }, {
    isNew: true,
    fromScan,
    note: data ? '' : (isIsbn(isbn) ? 'Not found online — enter details' : 'Not an ISBN barcode — enter details'),
    detail: data ? '' : report.join(' · '),
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

const TESSERACT = 'https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.min.js';
const SCAN_MODE_KEY = 'bookshelf.scanMode';

let stream = null;
let scanRun = 0; // bumped on close / mode switch so the running loop stops
let scanMode = localStorage.getItem(SCAN_MODE_KEY) === 'text' ? 'text' : 'barcode';
let detectorPromise = null;
let ocrPromise = null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.onload = resolve;
    el.onerror = () => reject(new Error('Failed to load ' + src));
    document.head.append(el);
  });
}

// Tesseract OCR worker, loaded only the first time text mode is used (a few MB).
function getOcrWorker() {
  ocrPromise ??= (async () => {
    if (!window.Tesseract) await loadScript(TESSERACT);
    const worker = await window.Tesseract.createWorker('eng');
    await worker.setParameters({ tessedit_char_whitelist: '0123456789Xx-ISBN ', tessedit_pageseg_mode: '6' });
    return worker;
  })();
  ocrPromise.catch(() => { ocrPromise = null; });
  return ocrPromise;
}

async function startScanner() {
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    toast('Camera needs https:// or localhost. Type the ISBN instead.', 4000);
    return;
  }
  setScanMode(scanMode);
  $('scanner').hidden = false;
  $('scanHint').textContent = 'Starting camera…';
  try {
    const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
    if ($('scanner').hidden) { s.getTracks().forEach((t) => t.stop()); return; } // closed while starting
    stream = s;
    const video = $('video');
    video.srcObject = stream;
    await video.play();
    runScan();
  } catch (err) {
    stopScanner();
    toast(err.name === 'NotAllowedError' ? 'Camera permission denied' : 'Could not start camera', 3500);
  }
}

function setScanMode(mode) {
  scanMode = mode;
  localStorage.setItem(SCAN_MODE_KEY, mode);
  $('scanner').dataset.mode = mode;
  for (const b of document.querySelectorAll('.scan-modes button')) b.classList.toggle('on', b.dataset.mode === mode);
  if (stream) runScan();
}

async function runScan() {
  const run = ++scanRun;
  const alive = () => stream && run === scanRun;
  const video = $('video');
  try {
    if (scanMode === 'barcode') {
      $('scanHint').textContent = 'Point at the barcode';
      barcodeLoop(await getDetector(), video, alive);
    } else {
      $('scanHint').textContent = 'Loading text recognition…';
      const worker = await getOcrWorker();
      if (!alive()) return;
      $('scanHint').textContent = 'Fit the printed ISBN number in the frame';
      textLoop(worker, video, alive);
    }
  } catch {
    if (alive()) $('scanHint').textContent = 'Scanner failed to load — check the connection';
  }
}

async function barcodeLoop(detector, video, alive) {
  let lastOther = null, otherHits = 0;
  while (alive()) {
    try {
      const codes = (await detector.detect(video)).map((c) => normalizeCode(c.rawValue)).filter(Boolean);
      if (!alive()) return;
      const isbn = codes.find(isIsbn);
      if (isbn) return onScanned(isbn);
      // Non-ISBN barcode: require a few identical reads before accepting.
      if (codes[0]) {
        otherHits = codes[0] === lastOther ? otherHits + 1 : 1;
        lastOther = codes[0];
        if (otherHits >= 4) return onScanned(codes[0]);
      }
    } catch { /* frame not ready */ }
    await sleep(120);
  }
}

async function textLoop(worker, video, alive) {
  let last = null;
  while (alive()) {
    const crop = frameCrop(video);
    if (crop) {
      try {
        const { data } = await worker.recognize(crop);
        if (!alive()) return;
        const hit = findIsbnInText(data.text);
        // A number printed after "ISBN" is trusted at once; a bare 978… number must be read twice.
        if (hit && (hit.labelled || hit.code === last)) return onScanned(hit.code);
        last = hit?.code ?? null;
      } catch { /* try next frame */ }
    }
    await sleep(100);
  }
}

// The part of the video under the on-screen frame, upscaled and grayscale for OCR.
function frameCrop(video) {
  const vw = video.videoWidth, vh = video.videoHeight;
  if (!vw || !vh) return null;
  const box = video.getBoundingClientRect();
  const fr = document.querySelector('.frame').getBoundingClientRect();
  const scale = Math.max(box.width / vw, box.height / vh); // object-fit: cover
  const sx = (fr.left - box.left - (box.width - vw * scale) / 2) / scale;
  const sy = (fr.top - box.top - (box.height - vh * scale) / 2) / scale;
  const sw = fr.width / scale, sh = fr.height / scale;
  const c = document.createElement('canvas');
  c.width = Math.round(Math.min(1400, sw * 2));
  c.height = Math.round((c.width * sh) / sw);
  const ctx = c.getContext('2d');
  ctx.filter = 'grayscale(1) contrast(1.5)';
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, c.width, c.height);
  return c;
}

// Finds a checksum-valid ISBN in OCR text → { code (ISBN-13), labelled } or null.
// ISBN-10 is only accepted on a line that says "ISBN", since random digits pass its checksum too often.
function findIsbnInText(text) {
  for (const line of text.toUpperCase().split('\n')) {
    const labelled = /[I1L|]\s*S\s*[B8]\s*N/.test(line);
    const digits = line.replace(/[^0-9X]/g, '');
    for (let i = 0; i + 10 <= digits.length; i++) {
      const w13 = digits.slice(i, i + 13);
      if (/^97[89]\d{10}$/.test(w13) && normalizeCode(w13)) return { code: w13, labelled };
      const w10 = digits.slice(i, i + 10);
      if (labelled && /^\d{9}[\dX]$/.test(w10) && !/^97[89]/.test(w10)) {
        const code = normalizeCode(w10);
        if (code) return { code, labelled };
      }
    }
  }
  return null;
}

function onScanned(code) {
  navigator.vibrate?.(60);
  stopScanner();
  addByCode(code, true);
}

function stopScanner() {
  scanRun++;
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
  $('video').srcObject = null;
  $('scanner').hidden = true;
}

$('scanBtn').addEventListener('click', startScanner);
$('closeScan').addEventListener('click', stopScanner);
$('scanModes').addEventListener('click', (e) => {
  const mode = e.target.closest('button')?.dataset.mode;
  if (mode && mode !== scanMode) setScanMode(mode);
});

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
$('locations').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  locFilter = chip.dataset.loc === '*' ? null : chip.dataset.loc;
  render();
});
$('sort').addEventListener('change', render);
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!$('scanner').hidden) stopScanner();
  else if (!$('sheet').hidden) closeSheet();
});

// Books saved before cover/author fallbacks existed: fill their empty fields once, quietly.
const BACKFILL = 1;
render();
backfill();

async function backfill() {
  for (const b of books.filter((b) => b.isbn && (!b.cover || !b.authors) && (b.backfill || 0) < BACKFILL)) {
    const { found } = await lookup(b.isbn).catch(() => ({}));
    const cover = b.cover || found?.cover || await findCover(b.isbn);
    if (!books.includes(b)) continue; // deleted meanwhile
    if (found) for (const k of ['authors', 'publisher', 'year']) if (!b[k] && found[k]) b[k] = found[k];
    if (!b.cover && cover) b.cover = cover;
    b.backfill = BACKFILL;
    save();
  }
}
