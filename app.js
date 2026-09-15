'use strict';

const GKEY_KEY = 'bookshelf.googleKey';
const LAST_LOC_KEY = 'bookshelf.lastLocation';
const FIELDS = ['title', 'authors', 'publisher', 'year', 'category', 'location', 'notes', 'description'];
const POLYFILL = 'https://cdn.jsdelivr.net/npm/barcode-detector@3.2.2/ponyfill/+esm';
const collator = new Intl.Collator(['ru', 'en'], { sensitivity: 'base', numeric: true });

const $ = (id) => document.getElementById(id);

// Russian plural: plural(5, ['книга', 'книги', 'книг']) → 'книг'.
function plural(n, [one, few, many]) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}
const BOOK_FORMS = ['книга', 'книги', 'книг'];
let locFilter = null; // null = all, '' = books without a location, otherwise a location name
let catFilter = null; // null = all, otherwise a CATEGORIES key

const CATEGORIES = { fiction: 'Художественная', nonfiction: 'Нон-фикшн' };

// Chitai-gorod: its category path names fiction explicitly ("Художественная литература", also for children's books).
const cgCategory = (chain = []) => chain.length < 2 ? '' : chain.some((c) => /художественная литература/i.test(c)) ? 'fiction' : 'nonfiction';
// Open Library / Google: only trust an explicit fiction-like subject; anything else stays for the owner to set.
const subjectCategory = (subjects = []) => subjects.some((s) => /fiction|fantasy|novel|short stories|fairy tales/i.test(s)) ? 'fiction' : '';

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
  if (token && pending.length) setSyncState('сохраняю…');
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
    setSyncState(!token ? 'нет связи' : err.status === 401 ? 'вход истёк' : err.status === 403 || err.status === 404 ? 'токен без права записи' : 'не сохранено');
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
    toast(moved ? `Вы вошли · добавлено ${moved} ${plural(moved, BOOK_FORMS)} с этого устройства` : 'Вы вошли', 3000);
  } catch (err) {
    $('signinError').textContent = err.status === 401 ? 'Токен не принят' : err.status === 403 || err.status === 404
      ? `У этого токена нет права записи в ${REPO}` : 'Не удалось связаться с GitHub';
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
    category: subjectCategory((b.subjects || []).map((x) => x.name)),
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
    category: v.categories?.length ? (subjectCategory(v.categories) || 'nonfiction') : '',
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
    cover: a.picture ? await cleanCgCover(cgImage(a.picture)) : '',
    category: cgCategory(a.categoryChain),
  };
}

const cgImage = (path) => `https://content.img-gorod.ru/${path.replace(/^\//, '')}?width=400&height=560&fit=bounds`;

// All pictures Chitai-gorod has for an edition: the main one plus product photos (covers, backs, spreads).
async function cgGallery(isbn) {
  const token = await chitaiGorodToken();
  const r = await fetch(`${CG_API}/v2/search/product?phrase=${isbn}`, { headers: { Authorization: token }, signal: timeout() });
  const a = r.ok && (await r.json()).included?.find((i) => i.type === 'product')?.attributes;
  if (!a) return [];
  const d = await fetch(`${CG_API}/v1/products/slug/${encodeURIComponent(a.url.replace(/^product\//, ''))}`, { headers: { Authorization: token }, signal: timeout() });
  const text = d.ok ? await d.text() : '';
  const images = JSON.parse(text.match(/"images":(\[[^\]]*\])/)?.[1] || '[]');
  return [a.picture, ...images].filter(Boolean).slice(0, 10).map(cgImage);
}

// Chitai-gorod often shows a 3D product shot on white instead of a flat cover. Pixels of cross-origin images
// can't be read directly, so a small copy is sampled through images.weserv.nl, an open image proxy with CORS.
const IMG_PROXY = 'https://images.weserv.nl/?url=';

async function hasWhiteFrame(url) {
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = `${IMG_PROXY}${encodeURIComponent(url)}&w=60&h=90&fit=inside`;
    await Promise.race([img.decode(), new Promise((_, no) => setTimeout(no, 8000))]);
    const c = document.createElement('canvas');
    const w = (c.width = img.naturalWidth), h = (c.height = img.naturalHeight);
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, w, h);
    const white = (x, y) => {
      const i = (y * w + x) * 4, lo = Math.min(data[i], data[i + 1], data[i + 2]), hi = Math.max(data[i], data[i + 1], data[i + 2]);
      return lo > 232 && hi - lo < 14;
    };
    let hits = 0;
    for (let x = 0; x < w; x++) hits += white(x, 0) + white(x, h - 1);
    for (let y = 0; y < h; y++) hits += white(0, y) + white(w - 1, y);
    return hits / (2 * (w + h)) > 0.95;
  } catch {
    return false;
  }
}

// Trimming the white background and cropping to 2:3 from the right drops the spine: the shot reads as a flat cover.
const flattenShot = (url) => `${IMG_PROXY}${encodeURIComponent(url)}&trim=12&w=400&h=600&fit=cover&a=right`;

async function cleanCgCover(url) {
  return url.includes('img-gorod.ru') && !url.startsWith(IMG_PROXY) && await hasWhiteFrame(url) ? flattenShot(url) : url;
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

// Cover images addressable by ISBN alone (no API quota), in order of preference.
function isbnCoverUrls(isbn) {
  const urls = [{ url: `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false` }]; // 404 when missing
  if (isIsbn(isbn) && isbn.startsWith('978')) {
    const body = isbn.slice(3, 12);
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += +body[i] * (10 - i);
    const check = (11 - (sum % 11)) % 11;
    // Amazon serves a 1×1 GIF when it has no cover.
    urls.push({ url: `https://images-na.ssl-images-amazon.com/images/P/${body}${check === 10 ? 'X' : check}.01.LZZZZZZZ.jpg` });
  }
  // Google serves a 128×170 "image not available" PNG when it has no cover. It matches Russian ISBNs to the wrong books.
  if (!isbn.startsWith('9785')) urls.push({ url: `https://books.google.com/books/content?vid=ISBN${isbn}&printsec=frontcover&img=1&zoom=1`, placeholder: [128, 170] });
  return urls;
}

const usableImage = (size, candidate) => size && size.w > 40 && size.h > 40 &&
  !(candidate.placeholder && size.w === candidate.placeholder[0] && size.h === candidate.placeholder[1]);

// Probed in parallel, first usable one wins.
async function findCover(isbn) {
  const candidates = isbnCoverUrls(isbn);
  const sizes = await Promise.all(candidates.map((c) => probeImage(c.url)));
  const i = sizes.findIndex((size, i) => usableImage(size, candidates[i]));
  return i === -1 ? '' : candidates[i].url;
}

// Every cover option for the picker: current cover, Chitai-gorod pictures (product shots flattened), ISBN sources.
async function coverOptions(book) {
  const candidates = [];
  if (book.isbn) {
    const gallery = await cgGallery(book.isbn).catch(() => []);
    candidates.push(...gallery.map((url) => ({ url })), ...isbnCoverUrls(book.isbn));
  }
  const sizes = await Promise.all(candidates.map((c) => probeImage(c.url)));
  const portrait = candidates.filter((c, i) => usableImage(sizes[i], c) && sizes[i].w / sizes[i].h > 0.45 && sizes[i].w / sizes[i].h < 0.85);
  const urls = await Promise.all(portrait.map((c) => cleanCgCover(c.url)));
  return [...new Set([book.cover, ...urls].filter(Boolean))];
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
      report.push(`${name}: ${r ? 'найдено' : 'нет'}`);
    } catch (err) {
      report.push(`${name}: ошибка ${err.name === 'Error' ? err.message : err.name + ' ' + err.message}`);
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

// Book-cloth colours for covers without an image; each title always gets the same one.
const CLOTHS = ['#4f6150', '#3d5166', '#7d5236', '#74393a', '#8f6b2e', '#44464a', '#5e5170', '#2f5d50'];
const STAR = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 .6l1.6 3.4 3.7.4-2.8 2.5.8 3.7L6 8.7 2.7 10.6l.8-3.7L.7 4.4l3.7-.4z"/></svg>';

function clothCover(b) {
  let h = 0;
  for (const ch of b.title || '') h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `<span class="cloth" style="--cloth:${CLOTHS[h % CLOTHS.length]}">
    <span class="cloth-title" lang="${/[а-яё]/i.test(b.title) ? 'ru' : 'en'}">${esc(b.title)}</span><span class="cloth-author">${esc(b.authors)}</span></span>`;
}

// Cloth binding always, photo on top when there is one (it fades in on load, see the load listener).
// Photos taken on this device are shown from memory until GitHub serves the uploaded file.
const localPhotos = new Map();

function coverInner(b, lazy = true) {
  if (!b.cover) return clothCover(b);
  if (localPhotos.has(b.cover)) return clothCover(b) + `<img src="${localPhotos.get(b.cover)}" alt="">`;
  // Open Library answers every cover request with a redirect to archive.org, slow even when cached;
  // the image proxy serves it in one cached hop. The original URL stays as a fallback.
  const viaProxy = b.cover.includes('covers.openlibrary.org');
  const src = viaProxy ? `${IMG_PROXY}${encodeURIComponent(b.cover)}&w=400` : b.cover;
  return clothCover(b) + `<img src="${esc(src)}"${viaProxy ? ` data-fallback="${esc(b.cover)}"` : ''} alt=""${lazy ? ' loading="lazy"' : ''}>`;
}

// Images fire load/error without bubbling: listen in the capture phase on the whole document.
// A cover that arrives late fades in; a broken one is removed so the cloth binding shows.
document.addEventListener('load', (e) => { if (e.target.matches?.('.cover img:not(.instant)')) e.target.classList.add('loaded'); }, true);
document.addEventListener('error', (e) => {
  const img = e.target;
  if (!img.matches?.('.cover img')) return;
  if (img.dataset.fallback) { img.src = img.dataset.fallback; delete img.dataset.fallback; } else img.remove();
}, true);

// Covers already in the browser cache appear at once, with no fade. Cached images finish decoding
// within a frame or two of being inserted, so check right away and again shortly after.
function settleCovers(root) {
  const settle = () => {
    for (const img of root.querySelectorAll('.cover img:not(.loaded):not(.instant)')) {
      if (img.complete && img.naturalWidth) img.classList.add('instant');
    }
  };
  settle();
  requestAnimationFrame(() => requestAnimationFrame(settle));
  setTimeout(settle, 120);
}

// Publisher names as the sources spell them differ ("Scholastic Inc." / "Scholastic, Incorporated"):
// drop corporate suffixes so one publisher makes one shelf.
function publisherName(raw = '') {
  return raw.trim()
    .replace(/[,.]?\s*\b(inc|incorporated|ltd|limited|plc|llc|gmbh|co|corp|corporation|group|usa|uk)\b\.?/gi, '')
    .replace(/\s*\b(publishers?|publishing|press|books?)\b\.?/gi, '')
    .replace(/\s{2,}/g, ' ').replace(/[\s,.]+$/, '')
    .replace(/^./, (c) => c.toUpperCase());
}

// Distinct locations, sorted, with book counts.
function locations() {
  const counts = new Map();
  for (const b of books) if (b.location) counts.set(b.location, (counts.get(b.location) || 0) + 1);
  return [...counts].sort((a, b) => collator.compare(a[0], b[0]));
}

const inCategory = (b) => catFilter === null || (b.category || '') === catFilter;

function renderCategories() {
  const counts = { fiction: 0, nonfiction: 0, '': 0 };
  for (const b of books) counts[b.category || ''] = (counts[b.category || ''] || 0) + 1;
  const seg = (value, label, n) => `<button class="seg${catFilter === value ? ' on' : ''}" data-cat="${value ?? '*'}">${label}${n === null ? '' : ` <span>${n}</span>`}</button>`;
  $('categories').hidden = books.length === 0;
  $('categories').innerHTML = [
    seg(null, 'Все', null),
    seg('fiction', CATEGORIES.fiction, counts.fiction),
    seg('nonfiction', CATEGORIES.nonfiction, counts.nonfiction),
    counts[''] ? seg('', 'Без категории', counts['']) : '',
  ].join('');
}

function renderLocations() {
  const locs = locations();
  if (locFilter && !locs.some(([name]) => name === locFilter)) locFilter = null;
  // Room counts follow the chosen category.
  const pool = books.filter(inCategory);
  const count = (name) => pool.filter((b) => (b.location || '') === name).length;
  const unplaced = count('');
  const chip = (value, label, n) => `<button class="chip${locFilter === value ? ' on' : ''}" data-loc="${value === null ? '*' : esc(value)}">${esc(label)} <span>${n}</span></button>`;
  $('locations').hidden = locs.length === 0;
  $('locations').innerHTML = locs.length === 0 ? '' : [
    chip(null, 'Все', pool.length),
    ...locs.filter(([name]) => count(name) || name === locFilter).map(([name]) => chip(name, name, count(name))),
    unplaced ? chip('', 'Без места', unplaced) : '',
  ].join('');
}

function render() {
  renderCategories();
  renderLocations();
  const q = $('search').value.trim().toLowerCase();
  const sort = $('sort').value;
  let shown = books.filter((b) => inCategory(b) &&
    (locFilter === null || (b.location || '') === locFilter) &&
    (!q || [b.title, b.authors, b.isbn, b.publisher, b.location, b.notes].some((f) => (f || '').toLowerCase().includes(q))));

  if (sort === 'publisher') shown.sort((a, b) => collator.compare(a.authors || '￿', b.authors || '￿') || collator.compare(a.title, b.title));
  else if (sort === 'title') shown.sort((a, b) => collator.compare(a.title, b.title));
  else if (sort === 'rating') shown.sort((a, b) => (b.rating || 0) - (a.rating || 0) || collator.compare(a.title, b.title));
  else if (sort === 'author') shown.sort((a, b) => collator.compare(a.authors || '￿', b.authors || '￿') || collator.compare(a.title, b.title));
  else shown.sort((a, b) => b.added - a.added);

  $('count').textContent = books.length ? `${books.length} ${plural(books.length, BOOK_FORMS)}` : '';
  $('empty').hidden = books.length > 0;
  let index = 0;
  const bookHtml = (b) => `
    <button class="book" data-id="${esc(b.id)}">
      <span class="stand"><span class="cover">${coverInner(b, index++ >= 12)}</span></span>
      <span class="label">
        <span class="title">${esc(b.title)}</span>
        <span class="sub">${esc(b.authors || b.year || '')}</span>
        ${b.rating ? `<span class="rating">${STAR}${b.rating.toFixed(2)}</span>` : ''}
        ${b.location && locFilter === null ? `<span class="loc-tag">${esc(b.location)}</span>` : ''}
      </span>
    </button>`;
  const shelf = (list) => `<div class="shelf">${list.map(bookHtml).join('')}</div>`;
  let html;
  if (!shown.length) {
    html = books.length ? '<p class="empty">Ничего не найдено.</p>' : '';
  } else if (sort === 'publisher') {
    // One shelf per publisher, alphabetically; books without a publisher go last.
    const groups = new Map();
    for (const b of shown) {
      const name = publisherName(b.publisher);
      if (!groups.has(name)) groups.set(name, []);
      groups.get(name).push(b);
    }
    html = [...groups].sort(([a], [b]) => (!a) - (!b) || collator.compare(a, b)).map(([name, list]) => `
      <section class="group">
        <h2 class="group-title">${esc(name || 'Издательство не указано')} <span>${list.length}</span></h2>
        ${shelf(list)}
      </section>`).join('');
  } else {
    html = shelf(shown);
  }
  // Re-creating the same markup would reload every cover (e.g. after a sync that changed nothing).
  if (html === renderedList) return;
  renderedList = html;
  $('list').innerHTML = html;
  settleCovers($('list'));
}
let renderedList = null;

/* ---------- book sheet ---------- */

let editing = null; // { book, isNew, fromScan }

function openSheet(book, { isNew = false, fromScan = false, note = '', warn = false, detail = '' } = {}) {
  editing = { book, isNew, fromScan };
  const f = $('bookForm');
  for (const name of FIELDS) f.elements[name].value = book[name] || '';
  // New books default to the last location used, so a whole shelf can be scanned in a row.
  if (isNew && !book.location) f.elements.location.value = localStorage.getItem(LAST_LOC_KEY) || '';
  renderLocTags();
  renderCatTags();
  $('fIsbnText').textContent = book.isbn || '—';
  $('fCover').innerHTML = coverInner(book, false);
  settleCovers($('fCover'));
  $('coverPicker').hidden = true;
  $('sheetNote').textContent = note;
  $('sheetNote').className = 'note' + (warn ? ' warn' : '');
  $('sheetDetail').textContent = detail;
  $('sheetDetail').hidden = !detail;
  $('grLink').hidden = !book.goodreadsUrl;
  if (book.goodreadsUrl) {
    $('grLink').href = book.goodreadsUrl;
    $('grLink').textContent = `Goodreads ${book.rating.toFixed(2)} · ${book.ratingsCount.toLocaleString('ru-RU')} ${plural(book.ratingsCount, ['оценка', 'оценки', 'оценок'])}`;
  }
  for (const el of f.elements) if (el.name) el.readOnly = !token; // visitors get a read-only view
  $('cancelBtn').textContent = token ? 'Отмена' : 'Закрыть';
  $('saveBtn').textContent = isNew ? 'Добавить' : 'Сохранить';
  $('deleteBtn').hidden = isNew;
  $('saveNextBtn').hidden = !(isNew && fromScan);
  $('aboutField').hidden = !token && !book.description;
  $('sheet').hidden = false;
  $('sheet').querySelector('.sheet').scrollTop = 0;
  for (const el of f.querySelectorAll('textarea')) fitTextarea(el);
  if (isNew && !book.title) f.elements.title.focus();
}

// Text areas grow with their content, so a description reads like text rather than a scroll box.
function fitTextarea(el) {
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight + 2}px`;
}
$('bookForm').addEventListener('input', (e) => { if (e.target.tagName === 'TEXTAREA') fitTextarea(e.target); });

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
  for (const name of FIELDS) {
    const v = f.elements[name].value.trim();
    book[name] = f.elements[name].tagName === 'TEXTAREA' ? v.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n') : v.replace(/\s+/g, ' ');
  }
  if (editing.cover !== undefined) book.cover = editing.cover; // chosen in the cover picker
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
  toast(isNew ? 'Добавлено' : 'Сохранено');
  if (next) startScanner();
  if (isNew) updateRatings();
});

$('cancelBtn').addEventListener('click', closeSheet);
$('sheet').addEventListener('click', (e) => { if (e.target.id === 'sheet') closeSheet(); });
$('deleteBtn').addEventListener('click', () => {
  if (!confirm(`Удалить «${editing.book.title}»?`)) return;
  deleteBook(editing.book.id);
  closeSheet();
});
$('list').addEventListener('click', (e) => {
  const el = e.target.closest('.book');
  if (el) openSheet(books.find((b) => b.id === el.dataset.id));
});

/* ---------- cover picker ---------- */

$('coverBtn').addEventListener('click', async () => {
  if (!editing || !token) return;
  const sheetBook = editing.book;
  const picker = $('coverPicker');
  picker.hidden = false;
  picker.innerHTML = '<p class="results-state">Ищу обложки…</p>';
  const options = await coverOptions(sheetBook);
  if (editing?.book !== sheetBook) return; // sheet closed or another book opened meanwhile
  const chosen = editing.cover ?? sheetBook.cover ?? '';
  picker.innerHTML = [...options, ''].map((url) => `
    <button type="button" class="cover-option${url === chosen ? ' on' : ''}" data-url="${esc(url)}" aria-label="${url ? 'Обложка' : 'Без обложки'}">
      <span class="cover">${coverInner({ ...sheetBook, cover: url })}</span>
    </button>`).join('') + (options.length ? '' : '<p class="results-state">Других обложек не нашлось.</p>');
});

/* ---------- cover photo ---------- */

$('photoBtn').addEventListener('click', () => { if (editing && token) $('photoInput').click(); });

$('photoInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file || !editing || !token) return;
  const sheetBook = editing.book;
  let dataUrl;
  try {
    dataUrl = await cropPhoto(file);
  } catch {
    toast('Не удалось открыть фото', 3000);
    return;
  }
  if (!dataUrl) return; // crop cancelled
  toast('Загружаю фото…', 0);
  try {
    const name = `covers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    await github(`contents/${name}`, {
      method: 'PUT',
      body: { message: `Cover photo for «${sheetBook.title || 'book'}»`, content: dataUrl.split(',')[1], branch: DATA_BRANCH },
    });
    const url = `https://raw.githubusercontent.com/${REPO}/${DATA_BRANCH}/${name}`;
    localPhotos.set(url, dataUrl);
    if (editing?.book === sheetBook) {
      editing.cover = url;
      $('fCover').innerHTML = coverInner({ ...sheetBook, cover: url }, false);
      settleCovers($('fCover'));
      $('coverPicker').hidden = true;
    }
    toast('Фото загружено — нажмите «Сохранить»', 3000);
  } catch (err) {
    toast('Не удалось сохранить фото в GitHub', 3500);
  }
});

/* ---------- photo crop ---------- */

// Full-screen crop step between taking a photo and uploading it. The frame is kept in the photo's own
// pixels, so it survives rotating the phone; drag inside to move it, drag a corner to resize.
let crop = null; // { img, box: {x, y, w, h}, scale, done(result) }

function cropPhoto(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = $('cropImg');
    img.onload = () => {
      const W = img.naturalWidth, H = img.naturalHeight;
      crop = { W, H, box: initialCropBox(W, H), done: (result) => { URL.revokeObjectURL(url); crop = null; $('cropper').hidden = true; resolve(result); } };
      $('cropper').hidden = false;
      layoutCrop();
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode')); };
    img.src = url; // browsers apply the photo's EXIF rotation when displaying it
  });
}

// A centred 2:3 frame covering most of the photo — the usual shape of a book cover.
function initialCropBox(W, H) {
  let h = H * 0.86, w = h * 2 / 3;
  if (w > W * 0.86) { w = W * 0.86; h = w * 1.5; }
  return { x: (W - w) / 2, y: (H - h) / 2, w, h };
}

function layoutCrop() {
  if (!crop) return;
  const stage = $('cropStage').getBoundingClientRect();
  crop.scale = Math.min(stage.width / crop.W, stage.height / crop.H);
  const area = $('cropArea');
  area.style.width = `${crop.W * crop.scale}px`;
  area.style.height = `${crop.H * crop.scale}px`;
  const { x, y, w, h } = crop.box, k = crop.scale;
  Object.assign($('cropBox').style, { left: `${x * k}px`, top: `${y * k}px`, width: `${w * k}px`, height: `${h * k}px` });
}
window.addEventListener('resize', layoutCrop);

$('cropBox').addEventListener('pointerdown', (e) => {
  if (!crop) return;
  e.preventDefault();
  const handle = e.target.dataset.h || 'move';
  const start = { px: e.clientX, py: e.clientY, ...crop.box };
  const min = 60 / crop.scale; // keep the frame at least 60 screen px
  const move = (ev) => {
    const dx = (ev.clientX - start.px) / crop.scale, dy = (ev.clientY - start.py) / crop.scale;
    let { x, y, w, h } = start;
    if (handle === 'move') {
      x = Math.min(Math.max(0, x + dx), crop.W - w);
      y = Math.min(Math.max(0, y + dy), crop.H - h);
    } else {
      let left = x, top = y, right = x + w, bottom = y + h;
      if (handle.includes('w')) left = Math.min(Math.max(0, left + dx), right - min);
      if (handle.includes('e')) right = Math.max(Math.min(crop.W, right + dx), left + min);
      if (handle.includes('n')) top = Math.min(Math.max(0, top + dy), bottom - min);
      if (handle.includes('s')) bottom = Math.max(Math.min(crop.H, bottom + dy), top + min);
      x = left; y = top; w = right - left; h = bottom - top;
    }
    crop.box = { x, y, w, h };
    layoutCrop();
  };
  const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
});

$('cropReset').addEventListener('click', () => { if (crop) { crop.box = initialCropBox(crop.W, crop.H); layoutCrop(); } });
$('cropCancel').addEventListener('click', () => crop?.done(null));
// The chosen area, scaled so its longer side is at most 900 px, as JPEG (~80 KB).
$('cropDone').addEventListener('click', () => {
  if (!crop) return;
  const { x, y, w, h } = crop.box;
  const k = Math.min(1, 900 / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * k);
  canvas.height = Math.round(h * k);
  canvas.getContext('2d').drawImage($('cropImg'), x, y, w, h, 0, 0, canvas.width, canvas.height);
  crop.done(canvas.toDataURL('image/jpeg', 0.85));
});

/* ---------- full-screen cover ---------- */

// Bigger versions of the same image where the host offers one.
function largeCoverUrl(url) {
  return url
    .replace(/(img-gorod\.ru\/[^?]+)\?width=\d+&height=\d+/, '$1?width=1200&height=1680')
    .replace(/cdn\.litres\.ru\/pub\/c\/cover_\d+\//, 'cdn.litres.ru/pub/c/cover_max1500/')
    .replace(/(avatars\.mds\.yandex\.net\/get-mpic\/\d+\/[^/]+)\/[^/?]+$/, '$1/orig')
    .replace(/(covers\.openlibrary\.org\/b\/[^?]+)-M\.jpg/, '$1-L.jpg')
    .replace(/(images\.weserv\.nl\/\?.*)&w=400&h=600/, '$1&w=1200&h=1800')
    .replace(/(images\.weserv\.nl\/\?url=[^&]*covers\.openlibrary[^&]*)&w=400/, '$1&w=1200');
}

$('fCover').addEventListener('click', () => {
  const shown = $('fCover').querySelector('img');
  if (!shown) return; // cloth binding: nothing to enlarge
  const big = $('lightboxImg');
  big.src = shown.currentSrc || shown.src; // instant, then swap in the larger file once it has loaded
  $('lightbox').hidden = false;
  const cover = editing?.cover ?? editing?.book.cover;
  const large = cover && !localPhotos.has(cover) ? largeCoverUrl(cover) : '';
  if (large && large !== big.src) {
    const hi = new Image();
    hi.onload = () => { if (!$('lightbox').hidden) big.src = large; };
    hi.src = large;
  }
});
$('lightbox').addEventListener('click', () => { $('lightbox').hidden = true; });

$('coverPicker').addEventListener('click', (e) => {
  const option = e.target.closest('.cover-option');
  if (!option || !editing) return;
  editing.cover = option.dataset.url;
  $('fCover').innerHTML = coverInner({ ...editing.book, cover: editing.cover });
  for (const el of $('coverPicker').querySelectorAll('.cover-option')) el.classList.toggle('on', el === option);
});

/* ---------- location tags in the sheet ---------- */

const PLUS = '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1.5v9M1.5 6h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

// Rooms as tags: one can be chosen per book; the owner can also add a new room. Visitors only see the book's room.
function renderLocTags() {
  const current = $('bookForm').elements.location.value;
  const names = locations().map(([name]) => name);
  if (current && !names.includes(current)) names.push(current);
  const shown = token ? names : names.filter((n) => n === current);
  $('locTags').innerHTML = shown.map((n) =>
    `<button type="button" class="chip${n === current ? ' on' : ''}" aria-pressed="${n === current}" data-loc="${esc(n)}">${esc(n)}</button>`).join('') +
    (token ? `<button type="button" class="chip chip-add" data-add>${PLUS}Новое место</button>` : '') +
    (!token && !current ? '<span class="tags-empty">не указано</span>' : '');
}

// Category: two tags, one can be chosen; visitors only see the book's category.
function renderCatTags() {
  const current = $('bookForm').elements.category.value;
  const shown = Object.entries(CATEGORIES).filter(([key]) => token || key === current);
  $('catTags').innerHTML = shown.map(([key, label]) =>
    `<button type="button" class="chip${key === current ? ' on' : ''}" aria-pressed="${key === current}" data-cat="${key}">${label}</button>`).join('') +
    (!token && !current ? '<span class="tags-empty">не указана</span>' : '');
}

$('catTags').addEventListener('click', (e) => {
  const chip = e.target.closest('button');
  if (!chip || !token) return;
  const field = $('bookForm').elements.category;
  field.value = field.value === chip.dataset.cat ? '' : chip.dataset.cat;
  renderCatTags();
});

$('locTags').addEventListener('click', (e) => {
  const chip = e.target.closest('button');
  if (!chip || !token) return;
  const field = $('bookForm').elements.location;
  if (!('add' in chip.dataset)) {
    field.value = chip.dataset.loc === field.value ? '' : chip.dataset.loc;
    renderLocTags();
    return;
  }
  chip.outerHTML = '<input class="tag-input" placeholder="Название комнаты" enterkeyhint="done" autocomplete="off">';
  const input = $('locTags').querySelector('.tag-input');
  input.focus();
  const commit = () => {
    const v = input.value.trim().replace(/\s+/g, ' ');
    // Reuse an existing room's spelling when only the case differs.
    if (v) field.value = locations().find(([name]) => name.toLowerCase() === v.toLowerCase())?.[0] || v;
    if (input.isConnected) renderLocTags();
  };
  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') { ev.preventDefault(); commit(); }
    if (ev.key === 'Escape') { ev.stopPropagation(); input.value = ''; renderLocTags(); }
  });
  input.addEventListener('blur', commit);
});

/* ---------- adding by code ---------- */

let busy = false;

async function addByCode(raw, fromScan = false) {
  const isbn = normalizeCode(raw);
  if (!isbn) { toast('Это не похоже на ISBN'); return; }

  const existing = books.find((b) => b.isbn === isbn);
  if (existing) {
    openSheet(existing, { note: 'Уже есть в библиотеке', warn: true, fromScan });
    return;
  }
  if (busy) return;
  busy = true;
  toast('Ищу книгу…', 0);
  const { found: data, report } = await lookup(isbn);
  busy = false;
  hideToast();
  openSheet({ isbn, ...(data || {}) }, {
    isNew: true,
    fromScan,
    note: data ? '' : (isIsbn(isbn) ? 'Не нашлось в интернете — заполните сами' : 'Это не ISBN — заполните сами'),
    detail: data ? '' : report.join(' · '),
  });
}

// One field for both: a valid ISBN goes to the ISBN lookup, anything else is searched as a title.
$('isbnForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const v = $('isbnInput').value.trim();
  if (!v) return;
  $('isbnInput').value = '';
  $('isbnInput').blur();
  if (normalizeCode(v)) addByCode(v);
  else if (/^[\d\s-]{9,}x?$/i.test(v)) toast('Это не похоже на ISBN'); // a mistyped number, not a title like «1984»
  else searchByTitle(v);
});

/* ---------- adding by title ---------- */

async function searchChitaiGorod(q) {
  const token = await chitaiGorodToken();
  const r = await fetch(`${CG_API}/v2/search/product?phrase=${encodeURIComponent(q)}&products%5Bper-page%5D=24`, {
    headers: { Authorization: token },
    signal: timeout(),
  });
  if (!r.ok) throw new Error(r.status);
  return ((await r.json()).included || [])
    .filter((i) => i.type === 'product' && i.attributes.isBook)
    .map(({ attributes: a }) => ({
      title: a.title,
      authors: (a.authors || []).map((p) => [p.firstName, p.lastName].filter(Boolean).join(' ')).join(', '),
      publisher: a.publisher?.title || '',
      year: a.yearPublishing ? String(a.yearPublishing) : '',
      cover: a.picture ? `https://content.img-gorod.ru${a.picture}?width=400&height=560&fit=bounds` : '',
      category: cgCategory(a.categoryChain),
      cgSlug: a.url.replace(/^product\//, ''), // ISBN is only in the product details, fetched when chosen
    }));
}

async function searchOpenLibrary(q) {
  const d = await fetchJson(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&fields=title,author_name,first_publish_year,publisher,isbn,cover_i&limit=10`);
  return (d.docs || []).map((doc) => ({
    title: doc.title,
    authors: (doc.author_name || []).slice(0, 3).join(', '),
    publisher: doc.publisher?.[0] || '',
    year: doc.first_publish_year ? String(doc.first_publish_year) : '',
    cover: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : '',
    isbn: (doc.isbn || []).map(normalizeCode).find((c) => c && isIsbn(c)) || '',
  }));
}

const bookKey = (b) => `${(b.title || '').toLowerCase().split(/[:.(]/)[0].replace(/[^\p{L}\p{N}]+/gu, ' ').trim()}|${(b.authors || '').toLowerCase().split(/[ ,]/).filter(Boolean).pop() || ''}`;
let searchResults = [];
let searchRun = 0;

async function searchByTitle(q) {
  const run = ++searchRun;
  $('resultsTitle').textContent = `«${q}»`;
  $('resultsList').innerHTML = '<p class="results-state">Ищу…</p>';
  $('manualBtn').dataset.title = q;
  $('results').hidden = false;

  const cyrillic = /[а-яё]/i.test(q);
  const sources = cyrillic ? [searchChitaiGorod, searchOpenLibrary] : [searchOpenLibrary, searchChitaiGorod];
  const lists = await Promise.all(sources.map((src) => src(q).catch(() => null)));
  if (run !== searchRun) return; // a newer search replaced this one

  const seen = new Set();
  searchResults = lists.flatMap((l) => l || []).filter((b) => {
    const key = `${bookKey(b)}|${b.publisher.toLowerCase()}|${b.year}`; // same book, different editions stay separate
    if (!b.title || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 12);

  if (!searchResults.length) {
    $('resultsList').innerHTML = `<p class="results-state">${lists.every((l) => l === null) ? 'Поиск не отвечает — проверьте интернет.' : 'Ничего не нашлось. Попробуйте другое написание или добавьте вручную.'}</p>`;
    return;
  }
  $('resultsList').innerHTML = searchResults.map((b, i) => {
    const have = findInLibrary(b);
    return `<button type="button" class="result" data-i="${i}">
      <span class="cover">${coverInner(b)}</span>
      <span class="r-text">
        <span class="r-title">${esc(b.title)}</span>
        <span class="r-sub">${esc([b.authors, b.year, b.publisher].filter(Boolean).join(' · '))}</span>
        ${have ? '<span class="r-have">Уже есть в библиотеке</span>' : ''}
      </span>
    </button>`;
  }).join('');
}

function findInLibrary(b) {
  return books.find((x) => (b.isbn && x.isbn === b.isbn) || bookKey(x) === bookKey(b));
}

$('resultsList').addEventListener('click', async (e) => {
  const el = e.target.closest('.result');
  if (!el || busy) return;
  const picked = { ...searchResults[+el.dataset.i] };
  busy = true;
  el.classList.add('loading');
  try {
    if (picked.cgSlug && !picked.isbn) {
      const token = await chitaiGorodToken();
      const r = await fetch(`${CG_API}/v1/products/slug/${encodeURIComponent(picked.cgSlug)}`, { headers: { Authorization: token }, signal: timeout() });
      const text = r.ok ? await r.text() : '';
      picked.isbn = (text.match(/"isbn":\["([^"]+)"/)?.[1] && normalizeCode(text.match(/"isbn":\["([^"]+)"/)[1])) || '';
    }
    if (picked.cover) picked.cover = await cleanCgCover(picked.cover);
    if (!picked.cover && picked.isbn) picked.cover = await findCover(picked.isbn);
  } catch { /* add without ISBN */ }
  busy = false;
  el.classList.remove('loading');
  delete picked.cgSlug;
  if (!picked.isbn) delete picked.isbn;

  $('results').hidden = true;
  const existing = findInLibrary(picked);
  if (existing) openSheet(existing, { note: 'Уже есть в библиотеке', warn: true });
  else openSheet(picked, { isNew: true });
});

$('manualBtn').addEventListener('click', (e) => {
  $('results').hidden = true;
  openSheet({ title: e.currentTarget.dataset.title }, { isNew: true, note: 'Заполните данные книги' });
});
$('resultsClose').addEventListener('click', () => { $('results').hidden = true; searchRun++; });
$('results').addEventListener('click', (e) => { if (e.target.id === 'results') { $('results').hidden = true; searchRun++; } });

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
    toast('Камера работает только по https. Введите ISBN вручную.', 4000);
    return;
  }
  setScanMode(scanMode);
  $('scanner').hidden = false;
  $('scanHint').textContent = 'Включаю камеру…';
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
    toast(err.name === 'NotAllowedError' ? 'Нет доступа к камере' : 'Не удалось включить камеру', 3500);
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
      $('scanHint').textContent = 'Наведите на штрихкод';
      barcodeLoop(await getDetector(), video, alive);
    } else {
      $('scanHint').textContent = 'Загружаю распознавание текста…';
      const worker = await getOcrWorker();
      if (!alive()) return;
      $('scanHint').textContent = 'Поместите номер ISBN в рамку';
      textLoop(worker, video, alive);
    }
  } catch {
    if (alive()) $('scanHint').textContent = 'Сканер не загрузился — проверьте интернет';
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
    const v = prompt('Ключ Google Books API (необязательно: помогает, когда бесплатный лимит закончился). Оставьте пустым, чтобы удалить.', localStorage.getItem(GKEY_KEY) || '');
    if (v === null) return;
    v.trim() ? localStorage.setItem(GKEY_KEY, v.trim()) : localStorage.removeItem(GKEY_KEY);
    toast(v.trim() ? 'Ключ сохранён' : 'Ключ удалён');
  }
});

function exportBooks() {
  const blob = new Blob([JSON.stringify(books, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `knigi-${new Date().toISOString().slice(0, 10)}.json`;
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
    toast(`Импортировано: ${fresh.length} ${plural(fresh.length, BOOK_FORMS)}`);
  } catch {
    toast('Это не файл резервной копии');
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
$('categories').addEventListener('click', (e) => {
  const seg = e.target.closest('.seg');
  if (!seg) return;
  catFilter = seg.dataset.cat === '*' ? null : seg.dataset.cat;
  render();
});
$('locations').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  locFilter = chip.dataset.loc === '*' ? null : chip.dataset.loc;
  render();
});
// The chosen order is remembered on this device; grouping by publisher is the default.
const SORT_KEY = 'bookshelf.sort';
try { const saved = localStorage.getItem(SORT_KEY); if (saved && $('sort').querySelector(`option[value="${saved}"]`)) $('sort').value = saved; } catch { /* storage unavailable */ }
$('sort').addEventListener('change', () => {
  try { localStorage.setItem(SORT_KEY, $('sort').value); } catch { /* storage unavailable */ }
  render();
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (crop) crop.done(null);
  else if (!$('lightbox').hidden) $('lightbox').hidden = true;
  else if (!$('scanner').hidden) stopScanner();
  else if (!$('results').hidden) { $('results').hidden = true; searchRun++; }
  else if (!$('sheet').hidden) closeSheet();
});

// Books saved before cover/author fallbacks existed: fill their empty fields once, quietly.
const BACKFILL = 1;
// Books saved before product shots were detected: flatten their Chitai-gorod cover once.
const COVER_FIX = 1;
// Goodreads ratings: fetched one book at a time, re-checked after 90 days (30 if not found before).
const DAY = 86400000;
let ratingsRunning = false;

updateRole();
render();
sync();
if (token) { backfill(); updateRatings(); }
else if (readJson(LEGACY_KEY, []).length) toast('Книги с этого устройства перенесутся в библиотеку, когда вы войдёте (меню → Войти)', 6000);
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
  for (const b of books.filter((b) => b.cover?.includes('img-gorod.ru') && !b.cover.includes('weserv') && (b.coverFix || 0) < COVER_FIX)) {
    const cover = await cleanCgCover(b.cover);
    const cur = books.find((x) => x.id === b.id);
    if (!cur || cur.cover !== b.cover) continue; // deleted or changed by hand meanwhile
    cur.cover = cover;
    cur.coverFix = COVER_FIX;
    saveBooks(cur, { background: true });
  }
}
