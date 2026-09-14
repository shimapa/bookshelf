'use strict';

const GKEY_KEY = 'bookshelf.googleKey';
const LAST_LOC_KEY = 'bookshelf.lastLocation';
const FIELDS = ['title', 'authors', 'publisher', 'year', 'location', 'notes'];
const POLYFILL = 'https://cdn.jsdelivr.net/npm/barcode-detector@3.2.2/ponyfill/+esm';
const collator = new Intl.Collator(['ru', 'en'], { sensitivity: 'base', numeric: true });

const $ = (id) => document.getElementById(id);
let locFilter = null; // null = all, '' = books without a location, otherwise a location name

/* ---------- storage ---------- */

// The library is books.json on the `data` branch of the GitHub repo: anyone can read it, only the
// owner (signed in with a GitHub token) can change it. localStorage keeps the last copy read plus
// changes not committed yet, so the app opens instantly and edits survive being offline.
const REPO = 'shimapa/bookshelf';
const DATA_BRANCH = 'data';
const DATA_FILE = 'books.json';
const TOKEN_KEY = 'bookshelf.githubToken';
const CACHE_KEY = 'bookshelf.cache';
const PENDING_KEY = 'bookshelf.pending';
const LEGACY_KEY = 'bookshelf.legacyBooks';

// Before shared storage each device kept its own list under 'bookshelf.books'.
// Keep it aside until the owner signs in on that device and it gets merged.
if (localStorage.getItem('bookshelf.books')) {
  if (!localStorage.getItem(LEGACY_KEY)) localStorage.setItem(LEGACY_KEY, localStorage.getItem('bookshelf.books'));
  localStorage.removeItem('bookshelf.books');
}

let token = localStorage.getItem(TOKEN_KEY);
let remote = readJson(CACHE_KEY, []); // last list read from GitHub
let pending = readJson(PENDING_KEY, []); // uncommitted changes, oldest first: { put: book } | { del: id }
let books = applyOps(remote, pending);

function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

function applyOps(list, ops) {
  const byId = new Map(list.map((b) => [b.id, b]));
  for (const op of ops) op.put ? byId.set(op.put.id, op.put) : byId.delete(op.del);
  return [...byId.values()].map((b) => ({ ...b }));
}

function persist() {
  localStorage.setItem(CACHE_KEY, JSON.stringify(remote));
  localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  if (token && pending.length) setSyncState('saving…');
  render();
}

// Records changed books and schedules a commit. Background changes (covers, ratings) wait longer so they batch.
function saveBooks(changed, { background = false } = {}) {
  for (const b of [].concat(changed)) {
    const i = books.findIndex((x) => x.id === b.id);
    if (i === -1) books.push(b); else books[i] = b;
    pending.push({ put: { ...b } });
  }
  persist();
  scheduleSync(background ? 20000 : 1500);
}

function deleteBook(id) {
  books = books.filter((b) => b.id !== id);
  pending.push({ del: id });
  persist();
  scheduleSync(1500);
}

let syncAt = Infinity, syncTimer;
function scheduleSync(ms) {
  if (!token || Date.now() + ms >= syncAt) return;
  syncAt = Date.now() + ms;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => { syncAt = Infinity; sync(); }, ms);
}

let syncing = false, syncAgain = false;
// Reads the shared list and, when signed in, commits pending changes on top of it (retrying if another device wrote first).
async function sync() {
  if (syncing) { syncAgain = true; return; }
  syncing = true;
  try {
    for (let attempt = 1; ; attempt++) {
      const { list, sha } = await readRemote();
      const ops = pending.slice();
      if (token && ops.length) {
        const next = applyOps(list, ops);
        try {
          await writeRemote(next, sha, ops.length);
        } catch (err) {
          if ((err.status === 409 || err.status === 422) && attempt < 3) continue; // file changed meanwhile
          throw err;
        }
        pending = pending.slice(ops.length);
        remote = next;
      } else {
        remote = list;
      }
      break;
    }
    books = applyOps(remote, pending);
    setSyncState('');
    persist();
  } catch (err) {
    setSyncState(!token ? 'offline' : err.status === 401 ? 'sign-in expired' : err.status === 403 || err.status === 404 ? 'token can’t write' : 'not saved yet');
  } finally {
    syncing = false;
    if (syncAgain) { syncAgain = false; sync(); }
  }
}

async function readRemote() {
  if (token) {
    const file = await github(`contents/${DATA_FILE}?ref=${DATA_BRANCH}`);
    // Files over 1 MB come without inline content.
    const text = file.content ? decodeBase64(file.content) : await github(`contents/${DATA_FILE}?ref=${DATA_BRANCH}`, { raw: true });
    return { list: JSON.parse(text), sha: file.sha };
  }
  const r = await fetch(`https://raw.githubusercontent.com/${REPO}/${DATA_BRANCH}/${DATA_FILE}`, { cache: 'no-store', signal: timeout() });
  if (!r.ok) throw Object.assign(new Error(r.status), { status: r.status });
  return { list: await r.json(), sha: null };
}

function writeRemote(list, sha, changes) {
  const sorted = [...list].sort((a, b) => (a.added || 0) - (b.added || 0));
  const text = sorted.length ? `[\n${sorted.map((b) => JSON.stringify(b)).join(',\n')}\n]\n` : '[]\n'; // one book per line: readable diffs
  return github(`contents/${DATA_FILE}`, {
    method: 'PUT',
    body: { message: `Update books (${changes} ${changes === 1 ? 'change' : 'changes'})`, content: encodeBase64(text), sha, branch: DATA_BRANCH },
  });
}

async function github(path, { method = 'GET', body, raw = false } = {}) {
  const r = await fetch(`https://api.github.com/repos/${REPO}${path ? '/' + path : ''}`, {
    method,
    cache: 'no-store',
    signal: timeout(20000),
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body && JSON.stringify(body),
  });
  if (!r.ok) throw Object.assign(new Error(`GitHub ${r.status}`), { status: r.status });
  return raw ? r.text() : r.json();
}

function encodeBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
function decodeBase64(b64) {
  return new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, '')), (c) => c.charCodeAt(0)));
}

function setSyncState(text) {
  $('syncState').textContent = text ? `· ${text}` : '';
}

/* ---------- sign in ---------- */

function updateRole() {
  document.body.classList.toggle('owner', !!token);
  $('empty').querySelector('.empty-hint').hidden = !token;
}

async function signIn(value) {
  token = value.trim();
  try {
    const repo = await github('');
    if (!repo.permissions?.push) throw Object.assign(new Error('no push'), { status: 403 });
  } catch (err) {
    token = null;
    throw err;
  }
  localStorage.setItem(TOKEN_KEY, token);
  updateRole();
  await sync();
  // Books this device kept before shared storage: add the ones the library doesn't have yet.
  const legacy = readJson(LEGACY_KEY, []);
  const fresh = legacy.filter((b) => b && b.id && b.title && !books.some((x) => x.id === b.id));
  if (fresh.length) saveBooks(fresh);
  localStorage.removeItem(LEGACY_KEY);
  backfill();
  updateRatings();
  return fresh.length;
}

function signOut() {
  token = null;
  localStorage.removeItem(TOKEN_KEY);
  setSyncState('');
  updateRole();
  render();
}

$('signinForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.submitter;
  btn.disabled = true;
  $('signinError').hidden = true;
  try {
    const moved = await signIn(e.target.elements.token.value);
    $('signin').hidden = true;
    e.target.reset();
    toast(moved ? `Signed in · ${moved} ${moved === 1 ? 'book' : 'books'} from this device added` : 'Signed in', 3000);
  } catch (err) {
    $('signinError').textContent = err.status === 401 ? 'Token not accepted' : err.status === 403 || err.status === 404
      ? `This token can’t write to ${REPO}` : 'Could not reach GitHub';
    $('signinError').hidden = false;
  } finally {
    btn.disabled = false;
  }
});
$('signinCancel').addEventListener('click', () => { $('signin').hidden = true; });

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

async function fetchJson(url, ms) {
  const r = await fetch(url, { signal: timeout(ms) });
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

// Goodreads has no public API and sends no CORS headers; its search autocomplete returns the rating.
// Primary: a small server route on shimansky.nl that queries it. Fallback: a public CORS proxy (often rate-limited).
const GOODREADS = 'https://www.goodreads.com';
// Same-origin when served from shimansky.nl/books, cross-origin (CORS-allowed) from other hosts.
const RATING_API = location.pathname.startsWith('/books') ? '/api/goodreads' : 'https://shimansky.nl/api/goodreads';

async function fromGoodreads(isbn) {
  try {
    const d = await fetchJson(`${RATING_API}?isbn=${isbn}`);
    return d && { rating: d.rating, ratingsCount: d.ratingsCount, goodreadsUrl: d.url };
  } catch { /* route not deployed or down */ }
  const url = `${GOODREADS}/book/auto_complete?format=json&q=${isbn}`;
  const wrapped = await fetchJson(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, 20000);
  if (!wrapped.status || wrapped.status.http_code !== 200) throw new Error('proxy ' + wrapped.status?.http_code);
  const list = JSON.parse(wrapped.contents);
  const b = Array.isArray(list) ? list[0] : null;
  if (!b || !b.bookUrl) return null;
  return { rating: parseFloat(b.avgRating) || 0, ratingsCount: b.ratingsCount || 0, goodreadsUrl: GOODREADS + b.bookUrl };
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
  else if (sort === 'rating') shown.sort((a, b) => (b.rating || 0) - (a.rating || 0) || collator.compare(a.title, b.title));
  else if (sort === 'author') shown.sort((a, b) => collator.compare(a.authors || '￿', b.authors || '￿') || collator.compare(a.title, b.title));
  else shown.sort((a, b) => b.added - a.added);

  $('count').textContent = books.length ? `${books.length} ${books.length === 1 ? 'book' : 'books'}` : '';
  $('empty').hidden = books.length > 0;
  $('list').innerHTML = shown.map((b) => `
    <button class="book" data-id="${esc(b.id)}">
      ${b.cover ? `<img src="${esc(b.cover)}" alt="" loading="lazy">` : '<div class="cover-ph">No cover</div>'}
      <div class="meta">
        <div class="title">${esc(b.title)}</div>
        <div class="sub">${esc([b.authors, b.year, b.rating ? `★ ${b.rating.toFixed(2)}` : ''].filter(Boolean).join(' · '))}</div>
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
  $('grLink').hidden = !book.goodreadsUrl;
  if (book.goodreadsUrl) {
    $('grLink').href = book.goodreadsUrl;
    $('grLink').textContent = `Goodreads ★ ${book.rating.toFixed(2)} · ${book.ratingsCount.toLocaleString('ru-RU')} ratings`;
  }
  for (const el of f.elements) if (el.name) el.readOnly = !token; // visitors get a read-only view
  $('cancelBtn').textContent = token ? 'Cancel' : 'Close';
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
  if (!token) return closeSheet(); // read-only view (Enter in a field still submits the form)
  const f = e.target;
  const { isNew } = editing;
  // The list may have been refreshed while the sheet was open: edit the current copy of the book.
  const book = isNew ? editing.book : books.find((b) => b.id === editing.book.id) || editing.book;
  for (const name of FIELDS) book[name] = f.elements[name].value.trim().replace(/\s+/g, ' ');
  // Reuse an existing location's spelling when only the case differs ("гостиная" → "Гостиная").
  const same = locations().find(([name]) => name.toLowerCase() === book.location.toLowerCase());
  if (same) book.location = same[0];
  if (isNew) localStorage.setItem(LAST_LOC_KEY, book.location);
  if (isNew) {
    book.id = book.isbn || (crypto.randomUUID?.() || String(Date.now()));
    book.added = Date.now();
  }
  const next = e.submitter?.value === 'next';
  saveBooks(book);
  closeSheet();
  toast(isNew ? 'Added' : 'Saved');
  if (next) startScanner();
  if (isNew) updateRatings();
});

$('fCoverImg').addEventListener('error', () => { $('fCoverImg').hidden = true; $('fCoverPh').hidden = false; });
$('cancelBtn').addEventListener('click', closeSheet);
$('sheet').addEventListener('click', (e) => { if (e.target.id === 'sheet') closeSheet(); });
$('deleteBtn').addEventListener('click', () => {
  if (!confirm(`Delete “${editing.book.title}”?`)) return;
  deleteBook(editing.book.id);
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
  if (action === 'signin') { $('signin').hidden = false; $('signinForm').elements.token.focus(); }
  if (action === 'signout') signOut();
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
    saveBooks(fresh);
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
// Goodreads ratings: fetched one book at a time, re-checked after 90 days (30 if not found before).
const DAY = 86400000;
let ratingsRunning = false;

updateRole();
render();
sync();
if (token) { backfill(); updateRatings(); }
else if (readJson(LEGACY_KEY, []).length) toast('Books saved on this device will move to the library when you sign in (⋯ → Sign in)', 6000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') sync(); });

async function updateRatings() {
  if (!token || ratingsRunning) return;
  ratingsRunning = true;
  try {
    const due = (b) => b.isbn && Date.now() - (b.ratingChecked || 0) > (b.goodreadsUrl ? 90 : 30) * DAY;
    let b;
    while ((b = books.find(due))) {
      let gr;
      try {
        gr = await fromGoodreads(b.isbn);
      } catch {
        return; // proxy or network down: try again next time the app opens
      }
      const cur = books.find((x) => x.id === b.id); // list may have been refreshed meanwhile
      if (cur) {
        if (gr) Object.assign(cur, gr);
        cur.ratingChecked = Date.now();
        saveBooks(cur, { background: true });
      }
      await sleep(1000);
    }
  } finally {
    ratingsRunning = false;
  }
}

async function backfill() {
  if (!token) return;
  for (const b of books.filter((b) => b.isbn && (!b.cover || !b.authors) && (b.backfill || 0) < BACKFILL)) {
    const { found } = await lookup(b.isbn).catch(() => ({}));
    const cover = b.cover || found?.cover || await findCover(b.isbn);
    const cur = books.find((x) => x.id === b.id); // deleted or refreshed meanwhile
    if (!cur) continue;
    if (found) for (const k of ['authors', 'publisher', 'year']) if (!cur[k] && found[k]) cur[k] = found[k];
    if (!cur.cover && cover) cur.cover = cover;
    cur.backfill = BACKFILL;
    saveBooks(cur, { background: true });
  }
}
