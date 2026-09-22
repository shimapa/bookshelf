'use strict';

/* ---------- language: Russian (the source) or English ---------- */

// Interface strings are written in Russian; in English they are looked up here. A missing entry stays Russian.
const LANG_KEY = 'bookshelf.lang';
let lang = (() => { try { return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'ru'; } catch { return 'ru'; } })();
const locale = () => (lang === 'en' ? 'en-GB' : 'ru-RU');

const EN = {
  // header, menu, tools
  'Книжная полка': 'Bookshelf', 'Меню': 'Menu', 'Скачать резервную копию': 'Download a backup', 'Загрузить резервную копию': 'Restore a backup',
  'Ключ Google Books API…': 'Google Books API key…', 'Войти': 'Sign in', 'Выйти': 'Sign out', 'Язык': 'Language',
  'Все книги корешками': 'All books, spines out', 'Разделы': 'Sections', 'Что почитать?': 'What to read?', 'Статистика': 'Statistics', 'Карта полок': 'Shelf map',
  'Поиск книг': 'Search books', 'Сортировка': 'Sort', 'По издательству': 'By publisher', 'Новые': 'Newest', 'По названию': 'By title', 'По автору': 'By author', 'По оценке': 'By rating',
  'Пока нет книг': 'No books yet', 'Нажмите': 'Tap', 'внизу слева, чтобы отсканировать книгу или добавить её вручную.': 'in the bottom left corner to scan a book or add it by hand.',
  // shelves and filters
  'Все': 'All', 'Художественная': 'Fiction', 'Нон-фикшн': 'Non-fiction', 'Детские': 'Children’s', 'Без категории': 'No category', 'Без места': 'No room',
  'Прочитал Паша': 'Read by Pasha', 'Прочитала Алина': 'Read by Alina', 'Никто не читал': 'Nobody has read', 'Паша': 'Pasha', 'Алина': 'Alina',
  'На русском': 'In Russian', 'На других языках': 'In other languages', 'Полка Феди': 'Fedya’s shelf', 'Добавить новую книгу': 'Add a new book', 'Ничего не найдено.': 'Nothing found.', 'Серия': 'Series',
  // add sheet, scanner
  'Добавить книгу': 'Add a book', 'Сканировать ISBN или штрихкод': 'Scan an ISBN or barcode', 'Наведите камеру на обратную сторону книги': 'Point the camera at the back of the book',
  'Добавить вручную': 'Add by hand', 'По ISBN, названию или с чистого листа': 'By ISBN, title or from scratch', 'ISBN или название': 'ISBN or title', 'Найти': 'Search',
  'Заполнить карточку без поиска': 'Fill in the card without searching', 'Отмена': 'Cancel', 'Штрихкод': 'Barcode', 'Номер ISBN': 'ISBN number', 'Наведите на штрихкод': 'Point at the barcode', 'Закрыть': 'Close',
  'Включаю камеру…': 'Starting the camera…', 'Загружаю распознавание текста…': 'Loading text recognition…', 'Поместите номер ISBN в рамку': 'Fit the ISBN number in the frame',
  'Сканер не загрузился — проверьте интернет': 'The scanner didn’t load — check the connection', 'Камера работает только по https. Введите ISBN вручную.': 'The camera only works over https. Type the ISBN instead.',
  'Нет доступа к камере': 'No access to the camera', 'Не удалось включить камеру': 'Couldn’t start the camera', 'Это не похоже на ISBN': 'That doesn’t look like an ISBN', 'Ищу книгу…': 'Looking up the book…',
  'Не нашлось в интернете — заполните сами': 'Not found online — fill it in yourself', 'Это не ISBN — заполните сами': 'Not an ISBN — fill it in yourself', 'Заполните данные книги': 'Fill in the book’s details',
  // book card
  'Открыть обложку': 'Open the cover', 'Сменить обложку': 'Change the cover', 'Сфотографировать обложку': 'Photograph the cover', 'О книге': 'About', 'Читать, если хочешь… или Читать, чтобы окунуться…': 'Read if you want to… or Read to immerse yourself in…',
  'Название': 'Title', 'Автор': 'Author', 'например, Гарри Поттер': 'e.g. Harry Potter', 'Издательство': 'Publisher', 'Год': 'Year', 'Страниц': 'Pages', 'Категория': 'Category', 'Место': 'Room', 'Прочитали': 'Read by',
  'Заметки': 'Notes', 'Состояние, кому дал почитать…': 'Condition, who borrowed it…', 'Удалить': 'Delete', 'Добавить': 'Add', 'Сохранить': 'Save', 'Добавить и сканировать дальше': 'Add and scan the next one',
  'Добавлено': 'Added', 'Сохранено': 'Saved', 'Удалить «{title}»?': 'Delete “{title}”?', 'Новое место': 'New room', 'Название комнаты': 'Room name', 'не указано': 'not set', 'не указана': 'not set', 'пока никто': 'nobody yet',
  'из': 'of', 'Оценка:': 'Rating:', 'Уже есть в библиотеке': 'Already in the library', 'стоит:': 'shelved in:', 'Серия «{name}»': 'Series “{name}”',
  '«{title}» уже есть в библиотеке{room}. Всё равно добавить ещё один экземпляр?': '“{title}” is already in the library{room}. Add another copy anyway?',
  'Ищу обложки…': 'Looking for covers…', 'Обложка': 'Cover', 'Без обложки': 'No cover', 'Других обложек не нашлось.': 'No other covers found.',
  'Не удалось открыть фото': 'Couldn’t open the photo', 'Загружаю фото…': 'Uploading the photo…', 'Фото загружено — нажмите «Сохранить»': 'Photo uploaded — tap “Save”', 'Не удалось сохранить фото в GitHub': 'Couldn’t save the photo to GitHub',
  'Подгоните рамку по краям обложки': 'Fit the frame to the edges of the cover', 'Сбросить': 'Reset', 'Готово': 'Done', 'Предыдущая': 'Previous', 'Следующая': 'Next',
  // title search
  'Поиск:': 'Search:', 'Ищу…': 'Searching…', 'Поиск не отвечает — проверьте интернет.': 'Search isn’t responding — check the connection.', 'Ничего не нашлось. Попробуйте другое написание или добавьте вручную.': 'Nothing found. Try another spelling or add it by hand.',
  // sign in, sync, backup
  'Вход для редактирования': 'Sign in to edit', 'Вставьте GitHub-токен с правом записи в': 'Paste a GitHub token with write access to', '. Он хранится только на этом устройстве.': '. It is stored only on this device.', 'GitHub-токен': 'GitHub token',
  'Вы вошли': 'Signed in', 'Вы вошли · добавлено {n} с этого устройства': 'Signed in · {n} added from this device', 'Токен не принят': 'Token not accepted', 'У этого токена нет права записи в {repo}': 'This token can’t write to {repo}', 'Не удалось связаться с GitHub': 'Couldn’t reach GitHub',
  'сохраняю…': 'saving…', 'нет связи': 'offline', 'вход истёк': 'sign-in expired', 'токен без права записи': 'token can’t write', 'не сохранено': 'not saved', 'найдено': 'found', 'нет': 'none', 'ошибка': 'error',
  'Ключ сохранён': 'Key saved', 'Ключ удалён': 'Key removed', 'Импортировано:': 'Imported:', 'Это не файл резервной копии': 'That isn’t a backup file',
  'Ключ Google Books API (необязательно: помогает, когда бесплатный лимит закончился). Оставьте пустым, чтобы удалить.': 'Google Books API key (optional: helps when the free quota runs out). Leave empty to remove it.',
  'Книги с этого устройства перенесутся в библиотеку, когда вы войдёте (меню → Войти)': 'Books from this device will move into the library once you sign in (menu → Sign in)',
  // what to read
  'Для кого': 'For whom', 'Другую': 'Another', 'Открыть': 'Open', 'Кому угодно': 'Anyone', 'Любая': 'Any', 'Все книги уже кто-то прочитал': 'Every book has been read by someone',
  'Паша прочитал всё': 'Pasha has read everything', 'Алина прочитала всё': 'Alina has read everything', 'пора за новыми!': 'time for new ones!', 'Ещё {count} {books} на выбор': '{count} more {books} to choose from',
  // statistics
  'Наша библиотека': 'Our library', 'страниц на полках': 'pages on the shelves', 'страниц': 'pages', 'средняя оценка': 'average rating', 'Оба прочитали': 'Both have read', 'никто пока не открывал': 'nobody has opened yet',
  'Категории': 'Categories', 'Комнаты': 'Rooms', 'Издательства': 'Publishers', 'Годы издания': 'Publication years', 'Рекорды': 'Records',
  'Самая толстая': 'Thickest', 'Самая тонкая': 'Thinnest', 'Самое старое издание': 'Oldest edition', 'Лучшая по Goodreads': 'Best on Goodreads', 'Любимая в семье': 'Family favourite',
  // map
  'Нажмите на комнату, чтобы увидеть её книги': 'Tap a room to see its books',
  // records
  'Книги': 'Books', 'Пластинки': 'Records', 'Разделы коллекции': 'Collection sections', 'Винтаж': 'Vintage', 'Современные': 'Modern',
  'Добавить пластинку': 'Add a record', 'Уже есть в коллекции': 'Already in the collection', 'Ищу пластинку…': 'Looking up the record…',
  'Не нашлось в Discogs — заполните сами': 'Not found on Discogs — fill it in yourself', 'Заполните данные пластинки': 'Fill in the record’s details',
  'Сфотографировать этикетку': 'Photograph the label', 'Для старых пластинок без штрихкода — по каталожному номеру': 'For older records with no barcode — by catalogue number',
  'Каталожный номер': 'Catalogue number', 'например, С60 27413 000': 'e.g. С60 27413 000', 'Формат': 'Format', 'Альбом': 'Album', 'Исполнитель': 'Artist', 'Лейбл': 'Label',
  'Слушали': 'Listened to', 'Редактировать': 'Edit', 'Об альбоме': 'About the album', 'Сменить конверт': 'Change the sleeve', 'Сфотографировать конверт': 'Photograph the sleeve', 'Штрихкод': 'Barcode', 'Слушать, если хочешь…': 'Listen if you want to…', 'Поместите каталожный номер в рамку': 'Fit the catalogue number in the frame',
  'Что послушать?': 'What to listen to?', 'Снять фото': 'Take a photo', 'Ввести номер': 'Type the number', 'Читаю фото…': 'Reading the photo…',
  'На фото не видно номера — попробуйте ещё раз': 'No number visible in the photo — try again', 'Не удалось прочитать фото': 'Couldn’t read the photo', 'Сканировать штрихкод': 'Scan the barcode', 'Наведите камеру на штрихкод на конверте': 'Point the camera at the barcode on the sleeve',
  'По исполнителю, альбому или с чистого листа': 'By artist, album or from scratch', 'Исполнитель, альбом или номер': 'Artist, album or catalogue number', 'Слушал Паша': 'Pasha listened', 'Слушала Алина': 'Alina listened', 'Никто не слушал': 'Nobody has listened', 'Пластинки на полке': 'Records on the shelf', 'Пока нет пластинок': 'No records yet', 'Поиск пластинок': 'Search records', 'Наши пластинки': 'Our records', 'По исполнителю': 'By artist', 'По лейблу': 'By label', 'По году': 'By year',
  'Токен Discogs…': 'Discogs token…', 'Токен сохранён': 'Token saved', 'Токен удалён': 'Token removed',
  'Токен Discogs (необязательно: с ним приходят картинки конвертов). Оставьте пустым, чтобы удалить.': 'Discogs token (optional: it brings the sleeve pictures). Leave empty to remove it.',
  'Исполнители': 'Artists', 'Лейблы': 'Labels', 'исполнителей': 'artists', 'лейблов': 'labels', 'до 1991 года': 'from before 1991', 'пока без оценок': 'no ratings yet',
  'Самая старая': 'Oldest', 'Самая новая': 'Newest', 'Лучшая по Discogs': 'Best rated',
};
const EN_PATTERNS = [[/^Версия (\d+)$/, 'Version $1']];
const EN_PLURALS = { 'книга': ['book', 'books'], 'пластинка': ['record', 'records'], 'оценка': ['rating', 'ratings'], 'страница': ['page', 'pages'], 'автор': ['author', 'authors'], 'комната': ['room', 'rooms'] };
// Rooms are the family's own names; the usual ones get an English name, others show as written.
const EN_ROOMS = { 'Гостиная': 'Living room', 'Кабинет Паши': 'Pasha’s study', 'Спальня': 'Bedroom', 'Столовая': 'Dining room', 'Детская': 'Children’s room', 'Кухня': 'Kitchen', 'Прихожая': 'Hallway' };

function t(text, vars) {
  let out = text;
  if (lang === 'en') {
    out = EN[text] ?? text;
    if (out === text) for (const [re, to] of EN_PATTERNS) if (re.test(text)) { out = text.replace(re, to); break; }
  }
  return vars ? out.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m) : out;
}
const roomLabel = (name) => (lang === 'en' && EN_ROOMS[name]) || name;
// Label maps whose values follow the language: { key: 'Русский' } read through t().
function localized(map) {
  const out = {};
  for (const [k, v] of Object.entries(map)) Object.defineProperty(out, k, { get: () => t(v), enumerable: true });
  return out;
}
// The one-line description has an English twin; the card edits whichever language is shown.
const fieldKey = (name, l = lang) => (name === 'description' && l === 'en' ? 'descriptionEn' : name);

// Static page text: every text node and label is translated from the Russian it was written in.
// Parts filled in by the app (the shelves, cards, lists) are skipped — they are rendered through t().
const DYNAMIC = '#list, #heroTrack, #locations, #readers, #categories, #locTags, #catTags, #readTags, #pickCard, #pickWho, #pickCat, #statsBody, #mapPlan, #resultsList, #resultsTitle, #addHero, #coverPicker, #fCover, #fIsbnText, #toast, #sheetNote, #sheetDetail, #grLink, #count, #syncState, #lbTrack, #lbCounter, #signinError, #langSwitch';
const ruText = new WeakMap();
function translatePage() {
  document.documentElement.lang = lang;
  document.title = t('Книжная полка');
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node; (node = walker.nextNode());) {
    if (!ruText.has(node)) {
      if (!/[А-Яа-яЁё]/.test(node.nodeValue) || node.parentElement.closest(DYNAMIC)) continue;
      ruText.set(node, node.nodeValue);
    }
    const ru = ruText.get(node), core = ru.trim();
    node.nodeValue = ru.replace(core, t(core));
  }
  for (const el of document.querySelectorAll('[placeholder], [aria-label], [title]')) {
    if (el.parentElement?.closest(DYNAMIC)) continue; // a container's own label is static; what the app puts inside is not
    for (const attr of ['placeholder', 'aria-label', 'title']) {
      if (!el.hasAttribute(attr)) continue;
      const key = 'ru' + attr.replace(/(^|-)(\w)/g, (m, dash, c) => c.toUpperCase()); // ruPlaceholder, ruAriaLabel, ruTitle
      if (!(key in el.dataset)) { if (!/[А-Яа-яЁё]/.test(el.getAttribute(attr))) continue; el.dataset[key] = el.getAttribute(attr); }
      el.setAttribute(attr, t(el.dataset[key]));
    }
  }
  for (const btn of document.querySelectorAll('#langSwitch button')) btn.classList.toggle('on', btn.dataset.lang === lang);
}

const GKEY_KEY = 'bookshelf.googleKey';
const LAST_LOC_KEY = 'bookshelf.lastLocation';
const FIELDS = ['title', 'authors', 'series', 'publisher', 'year', 'pages', 'catno', 'format', 'category', 'location', 'readBy', 'ratingPasha', 'ratingAlina', 'notes', 'description'];
// Who has read a book: stored as a comma-separated list of these keys ("pasha,alina"); each reader's own 1–5 stars in its field.
const READERS = localized({ pasha: 'Паша', alina: 'Алина' });
const RATING_FIELD = { pasha: 'ratingPasha', alina: 'ratingAlina' };
const hasRead = (b, key) => (b.readBy || '').split(',').includes(key);
const POLYFILL = 'https://cdn.jsdelivr.net/npm/barcode-detector@3.2.2/ponyfill/+esm';
const collator = new Intl.Collator(['ru', 'en'], { sensitivity: 'base', numeric: true });

const $ = (id) => document.getElementById(id);

// Russian plural: plural(5, ['книга', 'книги', 'книг']) → 'книг'. In English: 'book' / 'books'.
function plural(n, [one, few, many]) {
  if (lang === 'en') { const en = EN_PLURALS[one]; if (en) return n === 1 ? en[0] : en[1]; }
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}
const BOOK_FORMS = ['книга', 'книги', 'книг'];
// The collection has two halves: books and records. Everything on screen follows the open tab.
const TAB_KEY = 'bookshelf.tab';
let tab = (() => { try { return localStorage.getItem(TAB_KEY) === 'vinyl' ? 'vinyl' : 'books'; } catch { return 'books'; } })();
const isVinyl = (b) => b.kind === 'vinyl';
const tabItems = () => books.filter((b) => isVinyl(b) === (tab === 'vinyl'));
const ITEM_FORMS = { books: BOOK_FORMS, vinyl: ['пластинка', 'пластинки', 'пластинок'] };

let locFilter = null; // null = all, '' = books without a location, otherwise a location name
let readFilter = null; // null = all, 'pasha' / 'alina' = read by that person, 'none' = read by nobody
let catFilter = null; // null = all, otherwise a CATEGORIES key

const CATEGORIES = localized({ fiction: 'Художественная', nonfiction: 'Нон-фикшн', kids: 'Детские' });

// Chitai-gorod: its category path names fiction explicitly ("Художественная литература", also for children's books).
const cgCategory = (chain = []) => chain.length < 2 ? ''
  : chain.some((c) => /для детей|детская/i.test(c)) ? 'kids'
  : chain.some((c) => /художественная литература/i.test(c)) ? 'fiction' : 'nonfiction';
// Open Library / Google: only trust an explicit fiction-like subject; anything else stays for the owner to set.
const subjectCategory = (subjects = []) =>
  subjects.some((s) => /juvenile|children|picture books/i.test(s)) ? 'kids'
  : subjects.some((s) => /fiction|fantasy|novel|short stories|fairy tales/i.test(s)) ? 'fiction' : '';

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
  if (token && pending.length) setSyncState(t('сохраняю…'));
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
    setSyncState(t(!token ? 'нет связи' : err.status === 401 ? 'вход истёк' : err.status === 403 || err.status === 404 ? 'токен без права записи' : 'не сохранено'));
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
    toast(moved ? t('Вы вошли · добавлено {n} с этого устройства', { n: `${moved} ${plural(moved, BOOK_FORMS)}` }) : t('Вы вошли'), 3000);
  } catch (err) {
    $('signinError').textContent = err.status === 401 ? t('Токен не принят') : err.status === 403 || err.status === 404
      ? t('У этого токена нет права записи в {repo}', { repo: REPO }) : t('Не удалось связаться с GitHub');
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
    pages: b.number_of_pages ? String(b.number_of_pages) : '',
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
    pages: v.pageCount ? String(v.pageCount) : '',
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
    pages: a.pages || await cgPages(a.url),
    category: cgCategory(a.categoryChain),
    publisherSeries: a.publisherSeries?.title || '', // only used to match an existing series, never stored
  };
}

// Search results leave the page count empty; the product page has it.
async function cgPages(url = '') {
  try {
    const d = await fetch(`${CG_API}/v1/products/slug/${encodeURIComponent(url.replace(/^product\//, ''))}`, { headers: { Authorization: await chitaiGorodToken() }, signal: timeout() });
    return d.ok ? (await d.text()).match(/"pages":"?(\d+)/)?.[1] || '' : '';
  } catch {
    return '';
  }
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
  // No Google Books images: its "no cover" placeholder is now a normal-looking JPEG and it mixes up Russian ISBNs.
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
// Sleeve pictures to choose from: Apple's artwork, the Cover Art Archive, and whatever is already set.
async function vinylCoverOptions(rec) {
  const out = [];
  try {
    const d = await fetchJson(`https://itunes.apple.com/search?${new URLSearchParams({ term: `${rec.authors} ${rec.title}`, entity: 'album', limit: '6' })}`);
    for (const a of d.results || []) if (a.artworkUrl100) out.push(a.artworkUrl100.replace('100x100bb', '600x600bb'));
  } catch { /* offline */ }
  const archive = await vinylCover({ ...rec, cover: '' }).catch(() => '');
  if (archive) out.push(archive);
  return [...new Set([rec.cover, ...out].filter(Boolean))];
}

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
      report.push(`${name}: ${t(r ? 'найдено' : 'нет')}`);
    } catch (err) {
      report.push(`${name}: ${t('ошибка')} ${err.name === 'Error' ? err.message : err.name + ' ' + err.message}`);
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
const PLUS_LARGE = '<svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true"><path d="M17 7v20M7 17h20" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
const BALLOON = '<svg class="kids-icon" width="26" height="34" viewBox="0 0 26 34" aria-hidden="true"><path d="M13 23c-5.5 0-10-4.9-10-10.5S7.5 2 13 2s10 4.9 10 10.5S18.5 23 13 23z" fill="#f08a5d"/><path d="M9 7.5c1-1.4 2.4-2.2 4-2.4" stroke="#fff" stroke-width="1.8" stroke-linecap="round" fill="none" opacity=".7"/><path d="M11.5 23h3l-1.5 2.2z" fill="#e0764a"/><path class="balloon-string" d="M13 25.2c-1.8 2 1.8 3.6 0 5.8" stroke="#6a88a8" stroke-width="1.3" fill="none" stroke-linecap="round"/></svg>';
const STAR = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 .6l1.6 3.4 3.7.4-2.8 2.5.8 3.7L6 8.7 2.7 10.6l.8-3.7L.7 4.4l3.7-.4z"/></svg>';

// Goodreads rating as a small badge in the cover's top-right corner.
const ratingBadge = (b) => b.rating ? `<span class="gr-badge" title="Goodreads">${STAR}${b.rating.toFixed(1)}</span>` : '';

// Each room gets its own quiet colour; the same name always gets the same one.
const LOC_COLORS = 8;
function locColor(name = '') {
  let h = 1;
  for (const ch of name) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  return h % LOC_COLORS;
}

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
document.addEventListener('load', (e) => {
  const img = e.target;
  if (!img.matches?.('.cover img')) return;
  if (!img.classList.contains('instant')) img.classList.add('loaded');
  if (img.closest('.kids-shelf .book:not(.stack)')) fitKidsCover(img);
}, true);

// Children's books come in every shape: on their shelf a cover keeps its real proportions inside the 2:3 slot.
// Ratios are remembered so the shelf lays out right away next time.
const RATIO_KEY = 'bookshelf.coverRatios';
const coverRatios = new Map(Object.entries(readJson(RATIO_KEY, {})));
function fitKidsCover(img) {
  const ratio = +(img.naturalWidth / img.naturalHeight).toFixed(3);
  if (!ratio) return;
  const key = img.dataset.fallback || img.getAttribute('src');
  if (coverRatios.get(key) !== ratio) {
    coverRatios.set(key, ratio);
    try { localStorage.setItem(RATIO_KEY, JSON.stringify(Object.fromEntries([...coverRatios].slice(-400)))); } catch { /* storage full */ }
  }
  img.closest('.cover').style.setProperty('--ar', ratio);
}
const kidsRatio = (b) => {
  const r = b.cover && coverRatios.get(b.cover);
  return r ? ` style="--ar:${r}"` : '';
};
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

/* ---------- series ---------- */

const seriesKey = (name = '') => name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

function seriesNames() {
  const names = new Map();
  for (const b of books) if (b.series) names.set(seriesKey(b.series), b.series);
  return [...names.values()].sort((a, b) => collator.compare(a, b));
}

// A new book joins an existing series when the store names that series, or its title starts with the series name.
// Store "series" are often publisher lines, so they are never used to start a new series on their own.
function matchSeries(book) {
  const title = seriesKey(book.title), store = seriesKey(book.publisherSeries);
  return seriesNames().find((name) => { const k = seriesKey(name); return k && (k === store || title.startsWith(k + ' ') || title === k); }) || '';
}

// Books of one series in reading order: by year, then title with numbers compared as numbers.
const seriesOrder = (a, b) => (+a.year || 9999) - (+b.year || 9999) || collator.compare(a.title, b.title);

// A Russian edition: Russian ISBN group (978-5) or Cyrillic in the title or author.
const isRussian = (b) => /^9785/.test(b.isbn || '') || /[а-яё]/i.test(`${b.title} ${b.authors || ''}`);

// Distinct locations, sorted, with book counts.
function locations() {
  const counts = new Map();
  for (const b of books) if (b.location) counts.set(b.location, (counts.get(b.location) || 0) + 1);
  return [...counts].sort((a, b) => collator.compare(a[0], b[0]));
}

const inCategory = (b) => catFilter === null || (b.category || '') === catFilter;
const inReadFilter = (b) => readFilter === null || (readFilter === 'none' ? !(b.readBy || '') : hasRead(b, readFilter));

// Who-has-read filter: one chip per reader and one for books nobody has read yet; tapping the chosen one clears it.
function renderReaderFilter() {
  const vinyl = tab === 'vinyl';
  const pool = tabItems().filter((b) => vinyl || (inCategory(b) && (locFilter === null || (b.location || '') === locFilter)));
  const chip = (value, label, n) => `<button class="chip reader-filter${readFilter === value ? ' on' : ''}" data-read="${value}">${label} <span>${n}</span></button>`;
  $('readers').hidden = pool.length === 0;
  $('readers').innerHTML = [
    chip('pasha', t(vinyl ? 'Слушал Паша' : 'Прочитал Паша'), pool.filter((b) => hasRead(b, 'pasha')).length),
    chip('alina', t(vinyl ? 'Слушала Алина' : 'Прочитала Алина'), pool.filter((b) => hasRead(b, 'alina')).length),
    chip('none', t(vinyl ? 'Никто не слушал' : 'Никто не читал'), pool.filter((b) => !(b.readBy || '')).length),
  ].join('');
}

function renderCategories() {
  const counts = { fiction: 0, nonfiction: 0, kids: 0, '': 0 };
  for (const b of books) counts[b.category || ''] = (counts[b.category || ''] || 0) + 1;
  const seg = (value, label, n) => `<button class="seg${catFilter === value ? ' on' : ''}" data-cat="${value ?? '*'}">${label}${n === null ? '' : ` <span>${n}</span>`}</button>`;
  $('categories').hidden = books.length === 0;
  $('categories').innerHTML = [
    seg(null, t('Все'), null),
    seg('fiction', CATEGORIES.fiction, counts.fiction),
    seg('nonfiction', CATEGORIES.nonfiction, counts.nonfiction),
    seg('kids', CATEGORIES.kids, counts.kids),
    counts[''] ? seg('', t('Без категории'), counts['']) : '',
  ].join('');
}

function renderLocations() {
  const locs = locations();
  if (locFilter && !locs.some(([name]) => name === locFilter)) locFilter = null;
  // Room counts follow the chosen category.
  const pool = books.filter(inCategory);
  const count = (name) => pool.filter((b) => (b.location || '') === name).length;
  const unplaced = count('');
  const chip = (value, label, n) => `<button class="chip${locFilter === value ? ' on' : ''}" data-loc="${value === null ? '*' : esc(value)}"${value ? ` data-color="${locColor(value)}"` : ''}>${esc(label)} <span>${n}</span></button>`;
  $('locations').hidden = locs.length === 0;
  $('locations').innerHTML = locs.length === 0 ? '' : [
    chip(null, t('Все'), pool.length),
    ...locs.filter(([name]) => count(name) || name === locFilter).map(([name]) => chip(name, roomLabel(name), count(name))),
    unplaced ? chip('', t('Без места'), unplaced) : '',
  ].join('');
}

function render() {
  document.body.dataset.tab = tab;
  // The browser paints its toolbars in this colour, so the address bar matches the top of the page.
  document.documentElement.dataset.tab = tab;
  $('themeColor').content = tab === 'vinyl' ? '#3a1d5e' : '#f7f6f3';
  $('statusBar').content = tab === 'vinyl' ? 'black-translucent' : 'default';
  document.querySelector('h1').textContent = t(tab === 'vinyl' ? 'Пластинки на полке' : 'Книжная полка');
  $('search').placeholder = t(tab === 'vinyl' ? 'Поиск пластинок' : 'Поиск книг');
  $('empty').querySelector('[data-label="emptyTitle"]').textContent = t(tab === 'vinyl' ? 'Пока нет пластинок' : 'Пока нет книг');
  $('quick').querySelector('[data-open="pick"] span').textContent = t(tab === 'vinyl' ? 'Что послушать?' : 'Что почитать?');
  for (const btn of $('tabs').querySelectorAll('button')) btn.classList.toggle('on', btn.dataset.tab === tab);
  for (const el of document.querySelectorAll('#sort option')) el.hidden = el.dataset.tab && el.dataset.tab !== tab;
  if ($('sort').selectedOptions[0]?.hidden) $('sort').value = tab === 'vinyl' ? 'artist' : 'publisher';
  if (tab === 'vinyl') return renderVinyl();
  renderHero();
  renderCategories();
  renderLocations();
  renderReaderFilter();
  const q = $('search').value.trim().toLowerCase();
  const sort = $('sort').value;
  let shown = tabItems().filter((b) => inCategory(b) &&
    (locFilter === null || (b.location || '') === locFilter) && inReadFilter(b) &&
    (!q || [b.title, b.authors, b.series, b.isbn, b.publisher, b.location, b.notes].some((f) => (f || '').toLowerCase().includes(q))));

  if (sort === 'publisher') {
    // Books stand in publisher order (then author, then title); books without a publisher go last.
    const pub = (b) => publisherName(b.publisher) || '￿';
    shown.sort((a, b) => collator.compare(pub(a), pub(b)) || collator.compare(a.authors || '￿', b.authors || '￿') || collator.compare(a.title, b.title));
  }
  else if (sort === 'title') shown.sort((a, b) => collator.compare(a.title, b.title));
  else if (sort === 'rating') shown.sort((a, b) => (b.rating || 0) - (a.rating || 0) || collator.compare(a.title, b.title));
  else if (sort === 'author') shown.sort((a, b) => collator.compare(a.authors || '￿', b.authors || '￿') || collator.compare(a.title, b.title));
  else shown.sort((a, b) => b.added - a.added);

  const mine = tabItems();
  $('count').textContent = mine.length ? `${mine.length} ${plural(mine.length, BOOK_FORMS)}` : '';
  $('empty').hidden = mine.length > 0;
  let index = 0;
  const bookHtml = (b, kids = false) => `
    <button class="book" data-id="${esc(b.id)}">
      <span class="stand"><span class="cover"${kids ? kidsRatio(b) : ''}>${coverInner(b, index++ >= 12)}${ratingBadge(b)}</span></span>
      <span class="label">
        <span class="title">${esc(b.title)}</span>
        <span class="sub">${esc(b.authors || b.year || '')}</span>
        ${b.location && locFilter === null ? `<span class="loc-tag" data-color="${locColor(b.location)}">${esc(roomLabel(b.location))}</span>` : ''}
      </span>
    </button>`;
  // Two or more visible books of one series stand as a single stack where the first of them would be.
  stacks.clear();
  const withStacks = (list, kids = false) => {
    const groups = new Map();
    for (const b of list) if (b.series) { const k = seriesKey(b.series); groups.set(k, [...(groups.get(k) || []), b]); }
    const done = new Set();
    return list.map((b) => {
      const k = b.series && seriesKey(b.series);
      if (!k || groups.get(k).length < 2) return bookHtml(b, kids);
      if (done.has(k)) return '';
      done.add(k);
      const members = groups.get(k).sort(seriesOrder);
      stacks.set(k, { name: b.series, books: members });
      return stackHtml(k, members);
    }).join('');
  };
  const stackHtml = (k, members) => `
    <button class="book stack" data-series="${esc(k)}" aria-label="${t('Серия «{name}»', { name: esc(members[0].series) })}, ${members.length} ${plural(members.length, BOOK_FORMS)}">
      <span class="stand"><span class="stack-covers">${members.slice(0, 3).map((b, depth) => `<span class="cover stack-cover" data-depth="${depth}">${coverInner(b, index++ >= 12)}</span>`).reverse().join('')}</span></span>
      <span class="label">
        <span class="title">${esc(members[0].series)}</span>
        <span class="sub">${members.length} ${plural(members.length, BOOK_FORMS)}</span>
      </span>
    </button>`;
  // The owner's shelf ends with a grey placeholder book for adding a new one (not while searching).
  const addBook = token && !q ? `
    <button class="book add-book" data-add-book>
      <span class="stand"><span class="cover add-cover">${PLUS_LARGE}</span></span>
      <span class="label"><span class="title">${t('Добавить новую книгу')}</span></span>
    </button>` : '';
  // Two shelves: Russian books first, then other languages. Titles appear only when both shelves have books.
  // Children's books get their own shelf at the bottom; the rest split by language.
  const grown = shown.filter((b) => b.category !== 'kids');
  const russian = grown.filter(isRussian), other = grown.filter((b) => !isRussian(b));
  const kids = shown.filter((b) => b.category === 'kids');
  const sections = [[t('На русском'), russian], [t('На других языках'), other]].filter(([, list]) => list.length);
  const titled = sections.length > 1 || (sections.length && kids.length);
  let html;
  const kidsShelf = kids.length ? `
    <section class="shelf-section kids-section">
      <h2 class="shelf-title kids-title">${BALLOON}${t('Полка Феди')}</h2>
      <div class="shelf kids-shelf">${withStacks(kids, true)}${sections.length ? '' : addBook}</div>
    </section>` : '';
  if (!sections.length && !kids.length) {
    html = addBook ? `<div class="shelf">${addBook}</div>` : (books.length ? `<p class="empty">${t('Ничего не найдено.')}</p>` : '');
  } else {
    html = sections.map(([title, list], i) => `
      <section class="shelf-section">
        ${titled ? `<h2 class="shelf-title">${title}</h2>` : ''}
        <div class="shelf">${withStacks(list)}${i === sections.length - 1 ? addBook : ''}</div>
      </section>`).join('') + kidsShelf;
  }
  // Re-creating the same markup would reload every cover (e.g. after a sync that changed nothing).
  if (html === renderedList) return;
  renderedList = html;
  $('list').innerHTML = html;
  $('seriesList').innerHTML = seriesNames().map((n) => `<option value="${esc(n)}">`).join('');
  settleCovers($('list'));
}
let renderedList = null;
const stacks = new Map(); // series key → { name, books } for the stacks on screen

/* ---------- hero: the whole library, spines out ---------- */

// Every book stands on one long shelf with its spine facing out. Spines are drawn, not photographed:
// the colour comes from the cover, size and ornament from the title, so each book keeps its own look.
const SPINE_KEY = 'bookshelf.spineColors';
const spineColors = new Map(Object.entries(readJson(SPINE_KEY, {})));
let heroHtml = null, heroIntro = true;

function hashOf(text = '') {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.codePointAt(0), 16777619) >>> 0;
  return h;
}

// Cloth colour for books whose cover colour isn't known (yet), as [hue, saturation, lightness].
function clothHsl(b) {
  const hex = CLOTHS[[...(b.title || '')].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 0) % CLOTHS.length];
  const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return rgbToHsl(r, g, bl);
}

function rgbToHsl(r, g, b) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

function spineStyle(b) {
  const [h, sat, l] = spineColors.get(b.cover) || clothHsl(b);
  const hash = hashOf(b.id + b.title);
  const height = 0.8 + ((hash >> 3) % 21) / 100;
  // A spine is as thick as the book: about 4 px per hundred pages on top of the boards; unknown page count, a middling book.
  const pages = parseInt(b.pages, 10);
  const width = Math.round(pages ? Math.min(62, Math.max(18, 14 + pages * 0.045)) : 24 + (hash >> 9) % 12);
  const light = l > 0.56;
  return { style: `--spine:hsl(${h.toFixed(0)} ${(sat * 100).toFixed(0)}% ${(l * 100).toFixed(0)}%);--h:${height.toFixed(2)};--w:${width}px`, variant: hash % 4, light, wide: width >= 34 };
}

// A spine carries the short title: no subtitle, no edition note in brackets.
function spineTitle(title = '') {
  let t = title.replace(/\s*[(\[].*?[)\]]/g, '').split(/:\s|\s[—–]\s/)[0].trim();
  const dot = t.indexOf('. ');
  if (t.length > 28 && dot >= 5) t = t.slice(0, dot); // "Номер 1. Как стать лучшим…" → "Номер 1"
  return t.replace(/\.$/, '') || title;
}

function spineHtml(b, i) {
  const { style, variant, light, wide } = spineStyle(b);
  // Only wide spines have room for the author next to the title.
  const surname = !wide ? '' : (b.authors || '').split(',')[0].trim().split(/\s+/).pop() || '';
  return `<button class="spine${light ? ' light' : ''}" data-id="${esc(b.id)}" data-v="${variant}" data-dir="${isRussian(b) ? 'up' : 'down'}" style="${style};--i:${i}" aria-label="${esc(b.title)}">` +
    `<span class="spine-text"><span class="spine-title">${esc(spineTitle(b.title))}</span>${surname ? `<span class="spine-author">${esc(surname)}</span>` : ''}</span></button>`;
}

function renderHero() {
  const hero = $('hero');
  if (tab === 'vinyl') return renderCrate(hero);
  const pub = (b) => publisherName(b.publisher) || '￿';
  const order = (a, b) => collator.compare(pub(a), pub(b)) || collator.compare(a.authors || '￿', b.authors || '￿') || collator.compare(a.title, b.title);
  // Grown-up books only: picture books have hardly any spine. Russian books first, a little gap, then the rest.
  const all = books.filter((b) => !isVinyl(b) && b.category !== 'kids').sort(order);
  if (!all.length) { hero.hidden = true; return; }
  const groups = [all.filter(isRussian), all.filter((b) => !isRussian(b))].filter((g) => g.length);
  let i = 0;
  const html = groups.map((g) => g.map((b) => spineHtml(b, i++)).join('')).join('<span class="shelf-gap" aria-hidden="true"></span>');
  hero.hidden = false;
  if (html === heroHtml) return;
  heroHtml = html;
  $('heroTrack').innerHTML = html;
  fitSpines();
  hero.classList.toggle('intro', heroIntro);
  if (heroIntro) setTimeout(() => hero.classList.remove('intro'), 1600);
  heroIntro = false;
  sampleSpineColors();
}

// Titles never end in an ellipsis: each one gets the largest type at which it fits the spine in at most two lines.
// The author's name gives way first when there is no room for both.
function fitSpines(root = $('heroTrack')) {
  for (const spine of root.querySelectorAll('.spine')) {
    const title = spine.querySelector('.spine-title'), author = spine.querySelector('.spine-author');
    if (author) author.hidden = false;
    const fits = () => {
      const room = spine.clientWidth - 5;
      const lh = parseFloat(title.style.fontSize) * 1.08;
      return title.offsetWidth <= Math.min(room, lh * 2 + 3) && title.scrollHeight <= title.clientHeight + 1;
    };
    const tryFit = (min) => {
      for (let size = 12.5; size >= min; size -= 0.5) {
        title.style.fontSize = `${size}px`;
        if (fits()) return true;
      }
      return false;
    };
    // With the author the title must still be comfortably readable; otherwise the title gets the whole spine.
    if (author && tryFit(10)) continue;
    if (author) author.hidden = true;
    if (tryFit(7)) continue;
    // A long title on a thin book: the spine grows just enough to take it in two lines.
    for (let w = spine.offsetWidth + 3; w <= 70; w += 3) {
      spine.style.setProperty('--w', `${w}px`);
      if (tryFit(8)) break;
    }
  }
}
document.fonts?.ready.then(() => fitSpines());
addEventListener('resize', () => { clearTimeout(fitSpines.timer); fitSpines.timer = setTimeout(fitSpines, 150); });

// The shelf scrolls sideways by finger, trackpad, mouse wheel, or by dragging it with the mouse.
// The wheel moves the shelf only while it can still move that way, so at either end the page scrolls on as usual.
const heroShelf = $('heroShelf');
heroShelf.addEventListener('wheel', (e) => {
  if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return; // trackpads already scroll sideways
  const max = heroShelf.scrollWidth - heroShelf.clientWidth;
  const dy = e.deltaY * (e.deltaMode === 1 ? 32 : 1);
  if ((dy < 0 && heroShelf.scrollLeft <= 0) || (dy > 0 && heroShelf.scrollLeft >= max - 1)) return;
  e.preventDefault();
  heroShelf.scrollLeft += dy;
}, { passive: false });

let heroDrag = null; // { x, left, moved }
heroShelf.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'mouse' || e.button !== 0) return; // touch scrolls natively
  heroDrag = { x: e.clientX, left: heroShelf.scrollLeft, moved: false };
});
addEventListener('pointermove', (e) => {
  if (!heroDrag) return;
  const dx = e.clientX - heroDrag.x;
  if (!heroDrag.moved && Math.abs(dx) < 5) return;
  if (!heroDrag.moved) { heroDrag.moved = true; heroShelf.classList.add('dragging'); }
  heroShelf.scrollLeft = heroDrag.left - dx;
});
addEventListener('pointerup', () => {
  if (!heroDrag) return;
  // A drag that moved the shelf must not also open the book it started on.
  if (heroDrag.moved) {
    const swallow = (e) => { e.stopPropagation(); e.preventDefault(); };
    addEventListener('click', swallow, { capture: true, once: true });
    setTimeout(() => removeEventListener('click', swallow, { capture: true }), 0); // no click follows a release off the shelf
  }
  heroShelf.classList.remove('dragging');
  heroDrag = null;
});

$('heroTrack').addEventListener('click', (e) => {
  const item = e.target.closest('.spine, .crate-record');
  if (item) openSheet(books.find((b) => b.id === item.dataset.id));
});

// Cover colours are read from a tiny copy of each cover (the image proxy allows canvas access), a few at a time,
// and remembered, so spines come up in their colours right away next time.
let sampling = false;
async function sampleSpineColors() {
  if (sampling) return;
  sampling = true;
  try {
    const todo = books.filter((b) => b.cover && !spineColors.has(b.cover) && !localPhotos.has(b.cover));
    const worker = async () => {
      for (let b; (b = todo.shift());) {
        const hsl = await coverColor(b.cover);
        if (!hsl) continue;
        spineColors.set(b.cover, hsl.map((v) => +v.toFixed(3)));
        for (const el of document.querySelectorAll(`.spine[data-id="${CSS.escape(b.id)}"]`)) {
          const { style, light } = spineStyle(b);
          el.style.setProperty('--spine', style.match(/--spine:([^;]+)/)[1]); // size stays as fitted
          el.classList.toggle('light', light);
        }
      }
    };
    await Promise.all([worker(), worker(), worker(), worker()]);
    heroHtml = null; // markup now carries the sampled colours
    try { localStorage.setItem(SPINE_KEY, JSON.stringify(Object.fromEntries([...spineColors].slice(-500)))); } catch { /* storage full */ }
  } finally {
    sampling = false;
  }
}

async function coverColor(url) {
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = `${IMG_PROXY}${encodeURIComponent(url)}&w=16&h=24&fit=cover`;
    await Promise.race([img.decode(), new Promise((_, no) => setTimeout(no, 10000))]);
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, c.width, c.height);
    // The cover's character colour: pixels weigh more the more colourful they are, so a white title or
    // a black outline doesn't turn every spine grey. Hue is averaged on the colour wheel.
    let x = 0, y = 0, sw = 0, lw = 0, weight = 0;
    for (let i = 0; i < data.length; i += 4) {
      const [h, sat, l] = rgbToHsl(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255);
      const w = 0.08 + sat * (1 - Math.abs(2 * l - 1));
      x += Math.cos(h * Math.PI / 180) * w; y += Math.sin(h * Math.PI / 180) * w;
      sw += sat * w; lw += l * w; weight += w;
    }
    const hue = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    // Bookcloth, not neon: saturation is capped and lightness kept in a range that still reads as a binding.
    return [hue, Math.min(0.66, (sw / weight) * 1.2), Math.min(0.64, Math.max(0.2, lw / weight))];
  } catch {
    return null;
  }
}

/* ---------- series fan ---------- */

// Tapping a stack fans its books out over the page, like a hand of cards; each card opens its book.
// The fan stays under the book card, so closing the card returns to the fan.
let fan = null; // { el, cards, origin }

function openFan(stackEl) {
  const stack = stacks.get(stackEl.dataset.series);
  if (!stack || fan) return;
  const front = stackEl.querySelector('.stack-cover[data-depth="0"]').getBoundingClientRect();
  const vw = innerWidth, vh = innerHeight, n = stack.books.length;
  const w = Math.round(Math.min(170, Math.max(104, vw * 0.3))), h = Math.round(w * 1.5);
  const R = Math.max(w * 2.6, 320);
  const reach = Math.max(0, vw / 2 - w * 0.68 - 12); // rotated edge cards are wider than w
  const maxAngle = Math.asin(Math.min(1, reach / R));
  const step = n > 1 ? Math.min(16 * Math.PI / 180, (2 * maxAngle) / (n - 1)) : 0;
  const cx = vw / 2, cy = Math.min(vh * 0.5, vh - h / 2 - 90);

  const at = (x, y, angle, scale) => `translate(${x - w / 2}px, ${y - h / 2}px) rotate(${angle}rad) scale(${scale})`;
  // Where card i sits in the stack on the shelf: the first three match the peeking covers exactly
  // (position, size and tilt); the rest tuck in behind the last one. Measured again on close, as the page may have scrolled.
  const home = (i) => {
    // A sync may have redrawn the shelf meanwhile: find the stack again by its series.
    if (!stackEl.isConnected) stackEl = $('list').querySelector(`.stack[data-series="${CSS.escape(stackEl.dataset.series)}"]`) || stackEl;
    stackEl.classList.add('fanned');
    const cover = stackEl.querySelector(`.stack-cover[data-depth="${Math.min(i, 2)}"]`) || stackEl.querySelector('.stack-cover');
    if (!cover) return at(front.left + front.width / 2, front.top + front.height / 2, 0, front.width / w);
    const r = cover.getBoundingClientRect(); // rotation keeps the centre, so the bounding box centre is the cover's centre
    const deg = parseFloat(getComputedStyle(cover).rotate) || 0;
    return at(r.left + r.width / 2, r.top + r.height / 2, deg * Math.PI / 180, cover.offsetWidth / w);
  };
  // Starting positions are measured before the fan exists and written into the cards' markup: a card whose
  // first style had no position would fly in from the corner of the screen instead of rising out of the stack.
  const starts = stack.books.map((_, i) => home(i));

  const el = document.createElement('div');
  el.className = 'fan';
  el.innerHTML = `<div class="fan-backdrop"></div><p class="fan-title">${esc(stack.name)}<span>${n} ${plural(n, BOOK_FORMS)}</span></p>` +
    stack.books.map((b, i) => `<button type="button" class="fan-card" data-id="${esc(b.id)}" style="width:${w}px;transform:${starts[i]};z-index:${n - i};transition-delay:${i * 30}ms" aria-label="${esc(b.title)}"><span class="fan-lift"><span class="cover">${coverInner(b, false)}${ratingBadge(b)}</span></span></button>`).join('');
  document.body.append(el);
  settleCovers(el);

  // The first book lies on top, as in the stack; cards leave with the same glide and 30 ms step they return with.
  const cards = [...el.querySelectorAll('.fan-card')];
  cards.forEach((card, i) => {
    const a = (i - (n - 1) / 2) * step;
    card.dataset.to = at(cx + R * Math.sin(a), cy + R * (1 - Math.cos(a)), a, 1);
  });
  stackEl.classList.add('fanned'); // the cards are the stack now; the shelf copy hides until they return
  requestAnimationFrame(() => requestAnimationFrame(() => {
    el.classList.add('open');
    for (const card of cards) card.style.transform = card.dataset.to;
  }));
  fan = { el, cards, home, stack: () => stackEl };

  el.addEventListener('click', (e) => {
    const card = e.target.closest('.fan-card');
    if (card) openSheet(books.find((b) => b.id === card.dataset.id));
    else closeFan();
  });
}

function closeFan() {
  if (!fan) return;
  const { el, cards, home, stack } = fan;
  fan = null;
  el.classList.remove('open');
  el.classList.add('closing');
  const last = (cards.length - 1) * 30;
  cards.forEach((card, i) => { card.style.transitionDelay = `${last - i * 30}ms`; card.style.transform = home(i); });
  // Hand back to the shelf only once every card has landed, so the stack never jumps mid-flight.
  setTimeout(() => {
    stack().classList.remove('fanned');
    el.remove();
  }, 460 + last);
}

/* ---------- book sheet ---------- */

let editing = null; // { book, isNew, fromScan }
// A card opens as a page to look at; editing starts when the owner asks for it.
let viewing = false;
const canEdit = () => !!token && !viewing;

function openSheet(book, { isNew = false, fromScan = false, note = '', warn = false, detail = '' } = {}) {
  editing = { book, isNew, fromScan, lang }; // the description being edited stays in the language it was opened in
  const f = $('bookForm');
  for (const name of FIELDS) f.elements[name].value = book[fieldKey(name)] || '';
  // New books default to the last location used, so a whole shelf can be scanned in a row.
  if (isNew && !book.location) f.elements.location.value = localStorage.getItem(LAST_LOC_KEY) || '';
  const vinyl = isVinyl(book);
  $('sheet').dataset.kind = vinyl ? 'vinyl' : 'book';
  for (const [key, ru] of Object.entries(vinyl
    ? { title: 'Альбом', authors: 'Исполнитель', publisher: 'Лейбл', read: 'Слушали', about: 'Об альбоме', coverChange: 'Сменить конверт', coverPhoto: 'Сфотографировать конверт', textmode: 'Каталожный номер', code: book.isbn ? 'Штрихкод' : 'Каталожный номер' }
    : { title: 'Название', authors: 'Автор', publisher: 'Издательство', read: 'Прочитали', about: 'О книге', coverChange: 'Сменить обложку', coverPhoto: 'Сфотографировать обложку', textmode: 'Номер ISBN', code: 'ISBN' })) {
    for (const el of document.querySelectorAll(`[data-label="${key}"]`)) el.textContent = t(ru);
  }
  $('aboutField').querySelector('textarea').placeholder = t(vinyl ? 'Слушать, если хочешь…' : 'Читать, если хочешь… или Читать, чтобы окунуться…');
  renderLocTags();
  renderCatTags();
  renderReadTags();
  $('fIsbnText').textContent = book.isbn || book.catno || '—';
  $('fIsbnText').closest('.isbn-line').hidden = vinyl && !!token && !isNew; // the heading below already carries it
  $('dgLink').hidden = !book.discogsUrl;
  if (book.discogsUrl) $('dgLink').href = book.discogsUrl;
  $('fCover').className = `cover zoomable${vinyl ? ' sleeve' : ''}`;
  for (const id of ['coverBtn', 'photoBtn']) $(id).classList.toggle('edit-only', true);
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
    $('grLink').textContent = `Goodreads ${book.rating.toFixed(2)} · ${book.ratingsCount.toLocaleString(locale())} ${plural(book.ratingsCount, ['оценка', 'оценки', 'оценок'])}`;
  }
  viewing = !isNew && !!token; // a card opens as a page to read; the owner taps "Edit" to change it
  applySheetMode();
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
  if (!canEdit()) return closeSheet(); // reading view (Enter in a field still submits the form)
  const f = e.target;
  const { isNew } = editing;
  // The list may have been refreshed while the sheet was open: edit the current copy of the book.
  const book = isNew ? editing.book : books.find((b) => b.id === editing.book.id) || editing.book;
  for (const name of FIELDS) {
    const v = f.elements[name].value.trim();
    book[fieldKey(name, editing.lang)] = f.elements[name].tagName === 'TEXTAREA' ? v.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n') : v.replace(/\s+/g, ' ');
  }
  if (editing.cover !== undefined) book.cover = editing.cover; // chosen in the cover picker
  // Reuse an existing location's spelling when only the case differs ("гостиная" → "Гостиная").
  const same = locations().find(([name]) => name.toLowerCase() === book.location.toLowerCase());
  if (same) book.location = same[0];
  if (isNew) localStorage.setItem(LAST_LOC_KEY, book.location);
  if (isNew) {
    if (editing.book.kind) book.kind = editing.book.kind;
    if (editing.book.discogsUrl) book.discogsUrl = editing.book.discogsUrl;
    book.id = book.isbn || (crypto.randomUUID?.() || String(Date.now()));
    book.added = Date.now();
  }
  // A book typed in by hand may already be on the shelf under the same title and author, or the same ISBN.
  if (isNew) {
    const twin = books.find((x) => (book.isbn && x.isbn === book.isbn) || (book.title && bookKey(x) === bookKey(book)));
    if (twin && !confirm(t('«{title}» уже есть в библиотеке{room}. Всё равно добавить ещё один экземпляр?', { title: twin.title, room: twin.location ? ` (${roomLabel(twin.location)})` : '' }))) return;
  }
  const next = e.submitter?.value === 'next';
  saveBooks(book);
  closeSheet();
  toast(t(isNew ? 'Добавлено' : 'Сохранено'));
  if (next) startScanner();
  if (isNew) updateRatings();
});

// Reading view: the fields are plain lines, the empty ones step aside, and nothing can be typed over by accident.
function applySheetMode() {
  const f = $('bookForm');
  const { isNew, fromScan, book } = editing;
  const edit = canEdit();
  $('sheet').classList.toggle('viewing', !edit);
  for (const el of f.elements) if (el.name) el.readOnly = !edit;
  // A record being read shows its artist and album as a heading, so those fields step aside.
  const inHeadline = ['title', 'authors', 'publisher', 'year', 'catno', 'format'];
  const headline = !edit && isVinyl(book);
  for (const label of f.querySelectorAll('label:has(input[name]), label:has(textarea[name])')) {
    const field = label.querySelector('input[name], textarea[name]');
    label.hidden = !edit && (!field.value.trim() || (headline && inHeadline.includes(field.name)));
  }
  for (const row of f.querySelectorAll('.row')) row.hidden = [...row.querySelectorAll('label')].every((l) => l.hidden);
  $('sheetHeadline').hidden = !headline;
  $('fIsbnText').closest('.isbn-line').hidden = headline;
  if (headline) {
    const meta = [book.year, book.publisher, book.format, book.catno].filter(Boolean);
    $('sheetHeadline').innerHTML = `
      <p class="headline-artist">${esc(book.authors || '')}</p>
      <p class="headline-album">${esc(book.title || '')}</p>
      ${meta.length ? `<p class="headline-meta">${meta.map((m) => `<span>${esc(m)}</span>`).join('')}</p>` : ''}`;
  }
  for (const field of f.querySelectorAll('.field')) field.hidden = !edit && !field.querySelector('.chip');
  $('editBtn').hidden = edit || !token;
  $('saveBtn').hidden = !edit;
  $('deleteBtn').hidden = isNew || !edit;
  $('saveNextBtn').hidden = !(isNew && fromScan && edit);
  $('cancelBtn').textContent = t(edit ? 'Отмена' : 'Закрыть');
  $('saveBtn').textContent = t(isNew ? 'Добавить' : 'Сохранить');
  $('aboutField').hidden = !edit && !book[fieldKey('description')];
  $('seriesField').hidden = (!edit && !book.series) || isVinyl(book);
  renderLocTags();
  renderCatTags();
  renderReadTags();
  for (const el of f.querySelectorAll('textarea')) fitTextarea(el);
}

$('editBtn').addEventListener('click', () => {
  viewing = false;
  applySheetMode();
  $('sheet').querySelector('.sheet').scrollTop = 0;
});

$('cancelBtn').addEventListener('click', closeSheet);
$('sheet').addEventListener('click', (e) => { if (e.target.id === 'sheet') closeSheet(); });
$('deleteBtn').addEventListener('click', () => {
  if (!confirm(t('Удалить «{title}»?', { title: editing.book.title }))) return;
  deleteBook(editing.book.id);
  closeSheet();
});
$('list').addEventListener('click', (e) => {
  const el = e.target.closest('.book, .record');
  if (!el) return;
  if ('addBook' in el.dataset) openAddSheet();
  else if (el.dataset.series) openFan(el);
  else openSheet(books.find((b) => b.id === el.dataset.id));
});

/* ---------- cover picker ---------- */

$('coverBtn').addEventListener('click', async () => {
  if (!editing || !canEdit()) return;
  const sheetBook = editing.book;
  const picker = $('coverPicker');
  picker.hidden = false;
  picker.innerHTML = `<p class="results-state">${t('Ищу обложки…')}</p>`;
  const options = await (isVinyl(sheetBook) ? vinylCoverOptions(sheetBook) : coverOptions(sheetBook));
  if (editing?.book !== sheetBook) return; // sheet closed or another book opened meanwhile
  const chosen = editing.cover ?? sheetBook.cover ?? '';
  picker.innerHTML = [...options, ''].map((url) => `
    <button type="button" class="cover-option${url === chosen ? ' on' : ''}" data-url="${esc(url)}" aria-label="${t(url ? 'Обложка' : 'Без обложки')}">
      <span class="cover${isVinyl(sheetBook) ? ' sleeve' : ''}">${coverInner({ ...sheetBook, cover: url })}</span>
    </button>`).join('') + (options.length ? '' : `<p class="results-state">${t('Других обложек не нашлось.')}</p>`);
});

/* ---------- cover photo ---------- */

$('photoBtn').addEventListener('click', () => { if (editing && canEdit()) $('photoInput').click(); });

$('photoInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file || !editing || !token) return;
  const sheetBook = editing.book;
  let dataUrl;
  try {
    dataUrl = await cropPhoto(file);
  } catch {
    toast(t('Не удалось открыть фото'), 3000);
    return;
  }
  if (!dataUrl) return; // crop cancelled
  toast(t('Загружаю фото…'), 0);
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
    toast(t('Фото загружено — нажмите «Сохранить»'), 3000);
  } catch (err) {
    toast(t('Не удалось сохранить фото в GitHub'), 3500);
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

// Photos of the book beyond its cover from the Chitai-gorod gallery: page scans and contents first,
// then square photos of the book itself. Spine-only strips are skipped; results are kept for the session.
const pagesCache = new Map();

function bookPages(isbn) {
  if (!pagesCache.has(isbn)) {
    pagesCache.set(isbn, (async () => {
      const [, ...photos] = await cgGallery(isbn); // the first picture is the cover itself
      const sizes = await Promise.all(photos.map((url) => probeImage(url)));
      const ratio = (i) => sizes[i].w / sizes[i].h;
      const square = (i) => ratio(i) >= 0.85 && ratio(i) <= 1.2;
      return photos.map((url, i) => ({ url, i }))
        .filter(({ i }) => sizes[i] && ratio(i) > 0.3 && ratio(i) < 2.5)
        .sort((a, b) => square(a.i) - square(b.i))
        .map(({ url }) => largeCoverUrl(url));
    })().catch(() => { pagesCache.delete(isbn); return []; }));
  }
  return pagesCache.get(isbn);
}

let lightboxRun = 0;

function slideHtml(src, large = '') {
  return `<div class="lb-slide"><img src="${esc(src)}"${large ? ` data-large="${esc(large)}"` : ''} alt="" draggable="false"></div>`;
}

function updateLightboxCounter() {
  const track = $('lbTrack'), n = track.children.length;
  const i = Math.round(track.scrollLeft / track.clientWidth);
  $('lbCounter').textContent = n > 1 ? `${i + 1} / ${n}` : '';
  $('lbPrev').hidden = n < 2 || i === 0;
  $('lbNext').hidden = n < 2 || i >= n - 1;
}

$('fCover').addEventListener('click', async () => {
  const shown = $('fCover').querySelector('img');
  if (!shown || !editing) return; // cloth binding: nothing to enlarge
  const run = ++lightboxRun;
  const book = editing.book;
  const cover = editing.cover ?? book.cover;
  const large = cover && !localPhotos.has(cover) ? largeCoverUrl(cover) : '';
  // The cover shows at once from the loaded image; the larger file replaces it once downloaded.
  $('lbTrack').innerHTML = slideHtml(shown.currentSrc || shown.src, large);
  $('lbTrack').scrollLeft = 0;
  $('lightbox').hidden = false;
  updateLightboxCounter();
  if (large) {
    const hi = new Image();
    hi.onload = () => { const img = $('lbTrack').querySelector('img[data-large]'); if (img && run === lightboxRun) img.src = large; };
    hi.src = large;
  }
  if (!book.isbn) return;
  const pages = await bookPages(book.isbn);
  if (run !== lightboxRun || $('lightbox').hidden || !pages.length) return;
  $('lbTrack').insertAdjacentHTML('beforeend', pages.map((url) => slideHtml(url)).join(''));
  updateLightboxCounter();
});

function closeLightbox() {
  lightboxRun++;
  $('lightbox').hidden = true;
}

function stepLightbox(dir) {
  const track = $('lbTrack');
  track.scrollBy({ left: dir * track.clientWidth, behavior: 'smooth' });
}

$('lbTrack').addEventListener('scroll', updateLightboxCounter, { passive: true });
$('lightbox').addEventListener('click', (e) => {
  if (e.target.closest('#lbPrev')) return stepLightbox(-1);
  if (e.target.closest('#lbNext')) return stepLightbox(1);
  closeLightbox(); // a tap anywhere else closes; a swipe doesn't count as a tap
});

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
  const shown = canEdit() ? names : names.filter((n) => n === current);
  $('locTags').innerHTML = shown.map((n) =>
    `<button type="button" class="chip${n === current ? ' on' : ''}" aria-pressed="${n === current}" data-loc="${esc(n)}" data-color="${locColor(n)}">${esc(roomLabel(n))}</button>`).join('') +
    (canEdit() ? `<button type="button" class="chip chip-add" data-add>${PLUS}${t('Новое место')}</button>` : '') +
    (!canEdit() && !current ? `<span class="tags-empty">${t('не указано')}</span>` : '');
}

// Category: two tags, one can be chosen; visitors only see the book's category.
function renderCatTags() {
  const current = $('bookForm').elements.category.value;
  const shown = Object.entries(CATEGORIES).filter(([key]) => canEdit() || key === current);
  $('catTags').innerHTML = shown.map(([key, label]) =>
    `<button type="button" class="chip${key === current ? ' on' : ''}" aria-pressed="${key === current}" data-cat="${key}">${label}</button>`).join('') +
    (!canEdit() && !current ? `<span class="tags-empty">${t('не указана')}</span>` : '');
}

// Readers: each person has a read toggle with a check mark and their own five stars.
// A star also marks the book as read; un-marking clears the stars. Visitors only see who has read it and how they rated it.
const CHECK = '<svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true"><path d="M2.5 6.8l2.7 2.7 5.3-6" stroke="currentColor" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const STAR_LARGE = '<svg width="22" height="22" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 .8l1.55 3.2 3.5.45-2.6 2.4.7 3.5L6 8.6 2.85 10.35l.7-3.5-2.6-2.4 3.5-.45z"/></svg>';
const readersOf = (value = '') => value.split(',').filter((k) => k in READERS);
function renderReadTags() {
  const f = $('bookForm').elements;
  const current = readersOf(f.readBy.value);
  const shown = Object.entries(READERS).filter(([key]) => canEdit() || current.includes(key));
  $('readTags').innerHTML = shown.map(([key, name]) => {
    const on = current.includes(key);
    const stars = +f[RATING_FIELD[key]].value || 0;
    const starBtns = [1, 2, 3, 4, 5].map((n) => `<button type="button" class="star${n <= stars ? ' on' : ''}" data-reader="${key}" data-stars="${n}" aria-label="${name}: ${n} ${t('из')} 5"${canEdit() ? '' : ' disabled'}>${STAR_LARGE}</button>`).join('');
    return `<div class="reader-row"><button type="button" class="chip read-chip${on ? ' on' : ''}" aria-pressed="${on}" data-reader="${key}">${CHECK}${name}</button>` +
      (canEdit() || stars ? `<span class="stars" role="group" aria-label="${t('Оценка:')} ${name}">${starBtns}</span>` : '') + '</div>';
  }).join('') + (!canEdit() && !current.length ? `<span class="tags-empty">${t('пока никто')}</span>` : '');
}

$('readTags').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn || !canEdit()) return;
  const f = $('bookForm').elements;
  const key = btn.dataset.reader;
  let current = readersOf(f.readBy.value);
  const rating = f[RATING_FIELD[key]];
  if (btn.dataset.stars) {
    const n = btn.dataset.stars;
    rating.value = rating.value === n ? '' : n; // the same star again takes the rating back
    if (!current.includes(key)) current.push(key);
  } else if (current.includes(key)) {
    current = current.filter((k) => k !== key);
    rating.value = '';
  } else current.push(key);
  f.readBy.value = Object.keys(READERS).filter((k) => current.includes(k)).join(',');
  renderReadTags();
});

$('catTags').addEventListener('click', (e) => {
  const chip = e.target.closest('button');
  if (!chip || !canEdit()) return;
  const field = $('bookForm').elements.category;
  field.value = field.value === chip.dataset.cat ? '' : chip.dataset.cat;
  renderCatTags();
});

$('locTags').addEventListener('click', (e) => {
  const chip = e.target.closest('button');
  if (!chip || !canEdit()) return;
  const field = $('bookForm').elements.location;
  if (!('add' in chip.dataset)) {
    field.value = chip.dataset.loc === field.value ? '' : chip.dataset.loc;
    renderLocTags();
    return;
  }
  chip.outerHTML = `<input class="tag-input" placeholder="${t('Название комнаты')}" enterkeyhint="done" autocomplete="off">`;
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
  if (tab === 'vinyl') return addRecordBy('barcode', normalizeCode(raw) || String(raw).replace(/\D/g, ''), fromScan);
  const isbn = normalizeCode(raw);
  if (!isbn) { toast(t('Это не похоже на ISBN')); return; }

  const existing = books.find((b) => b.isbn === isbn);
  if (existing) {
    navigator.vibrate?.([60, 60, 60]);
    openSheet(existing, { note: duplicateNote(existing), warn: true, fromScan });
    return;
  }
  if (busy) return;
  busy = true;
  toast(t('Ищу книгу…'), 0);
  const { found: data, report } = await lookup(isbn);
  busy = false;
  hideToast();
  const { publisherSeries, ...fields } = data || {};
  const book = { isbn, ...fields };
  book.series = matchSeries({ ...book, publisherSeries });
  openSheet(book, {
    isNew: true,
    fromScan,
    note: data ? '' : t(isIsbn(isbn) ? 'Не нашлось в интернете — заполните сами' : 'Это не ISBN — заполните сами'),
    detail: data ? '' : report.join(' · '),
  });
}

/* ---------- add a book ---------- */

// The "+" button opens a small sheet: scan, or add by hand (ISBN / title search, or an empty card).
function openAddSheet() {
  if (!token) return;
  $('addTitle').textContent = t(tab === 'vinyl' ? 'Добавить пластинку' : 'Добавить книгу');
  const vinyl = tab === 'vinyl';
  for (const [key, ru] of Object.entries(vinyl
    ? { scanTitle: 'Сканировать штрихкод', scanHint: 'Наведите камеру на штрихкод на конверте', manualHint: 'По исполнителю, альбому или с чистого листа' }
    : { scanTitle: 'Сканировать ISBN или штрихкод', scanHint: 'Наведите камеру на обратную сторону книги', manualHint: 'По ISBN, названию или с чистого листа' })) {
    for (const el of $('addSheet').querySelectorAll(`[data-label="${key}"]`)) el.textContent = t(ru);
  }
  $('isbnInput').placeholder = t(vinyl ? 'Исполнитель, альбом или номер' : 'ISBN или название');
  const withCovers = tabItems().filter((b) => b.cover);
  const picks = [...withCovers].sort(() => Math.random() - 0.5).slice(0, 3);
  $('addHero').innerHTML = picks.map((b, i) => `<span class="cover add-hero-cover${tab === 'vinyl' ? ' sleeve' : ''}" data-i="${i}">${coverInner(b, false)}</span>`).join('');
  settleCovers($('addHero'));
  $('isbnForm').hidden = true;
  $('addBlank').hidden = true;
  $('addManual').hidden = false;
  $('addSheet').hidden = false;
}
const closeAddSheet = () => { $('addSheet').hidden = true; };

$('addFab').addEventListener('click', openAddSheet);
$('addClose').addEventListener('click', closeAddSheet);
$('addSheet').addEventListener('click', (e) => { if (e.target.id === 'addSheet') closeAddSheet(); });
$('addScan').addEventListener('click', () => { closeAddSheet(); startScanner(); });
$('addManual').addEventListener('click', () => {
  $('addManual').hidden = true;
  $('isbnForm').hidden = false;
  $('addBlank').hidden = false;
  $('isbnInput').focus();
});
$('addBlank').addEventListener('click', () => {
  closeAddSheet();
  const typedIn = $('isbnInput').value.trim();
  openSheet(tab === 'vinyl' ? { kind: 'vinyl', title: typedIn } : { title: typedIn },
    { isNew: true, note: t(tab === 'vinyl' ? 'Заполните данные пластинки' : 'Заполните данные книги') });
  $('isbnInput').value = '';
});
// Old records have no barcode: the camera reads the catalogue number off the label instead.
$('addLabel').addEventListener('click', () => { closeAddSheet(); startScanner('text'); });

// A USB barcode scanner types the code and presses Enter within a few milliseconds.
let typed = '', typedAt = 0;
document.addEventListener('keydown', (e) => {
  if (!token || e.target.closest?.('input, textarea, select') || e.metaKey || e.ctrlKey || e.altKey) return;
  const now = Date.now();
  if (now - typedAt > 80) typed = '';
  typedAt = now;
  if (/^[\dXx]$/.test(e.key)) typed += e.key;
  else if (e.key === 'Enter' && typed.length >= 8) { const code = typed; typed = ''; addByCode(code); }
});

// One field for both: a valid ISBN goes to the ISBN lookup, anything else is searched as a title.
$('isbnForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const v = $('isbnInput').value.trim();
  if (!v) return;
  $('isbnInput').value = '';
  $('isbnInput').blur();
  closeAddSheet();
  if (tab === 'vinyl') normalizeCode(v) ? addByCode(v) : searchRecords(v);
  else if (normalizeCode(v)) addByCode(v);
  else if (/^[\d\s-]{9,}x?$/i.test(v)) toast(t('Это не похоже на ISBN')); // a mistyped number, not a title like «1984»
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
      publisherSeries: a.publisherSeries?.title || '',
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
  $('resultsList').innerHTML = `<p class="results-state">${t('Ищу…')}</p>`;
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
    $('resultsList').innerHTML = `<p class="results-state">${t(lists.every((l) => l === null) ? 'Поиск не отвечает — проверьте интернет.' : 'Ничего не нашлось. Попробуйте другое написание или добавьте вручную.')}</p>`;
    return;
  }
  $('resultsList').innerHTML = resultsHtml(searchResults);
  settleCovers($('resultsList'));
}

// Records are searched in Discogs by whatever was typed: artist, album, or a catalogue number.
async function searchRecords(q) {
  const run = ++searchRun;
  $('resultsTitle').textContent = `«${q}»`;
  $('resultsList').innerHTML = `<p class="results-state">${t('Ищу…')}</p>`;
  $('manualBtn').dataset.title = q;
  $('results').hidden = false;
  let list = null;
  try {
    list = await discogsSearch(/\d{2,}/.test(q) && /[A-ZА-Я]/i.test(q) ? { q, catno: q } : { q });
    if (!list.length) list = await discogsSearch({ q });
  } catch { /* offline or rate-limited */ }
  if (run !== searchRun) return;
  searchResults = (list || []).slice(0, 12);
  if (!searchResults.length) {
    $('resultsList').innerHTML = `<p class="results-state">${t(list === null ? 'Поиск не отвечает — проверьте интернет.' : 'Ничего не нашлось. Попробуйте другое написание или добавьте вручную.')}</p>`;
    return;
  }
  $('resultsList').innerHTML = resultsHtml(searchResults);
  settleCovers($('resultsList'));
}

// Where the copy you already have stands, so it can be found (or the new one left in the shop).
const duplicateNote = (b) => t('Уже есть в библиотеке') + (b.location ? ` — ${t('стоит:')} ${roomLabel(b.location)}` : '');

// Shows a ready list of finds (records) in the same sheet the book search uses.
function showResults(list, query) {
  searchRun++;
  searchResults = list;
  $('resultsTitle').textContent = `«${query}»`;
  $('manualBtn').dataset.title = query;
  $('resultsList').innerHTML = resultsHtml(list);
  settleCovers($('resultsList'));
  $('results').hidden = false;
}

function resultsHtml(list) {
  return list.map((b, i) => {
    const have = findInLibrary(b);
    const line = isVinyl(b) ? [b.authors, b.year, b.publisher, b.catno, b.format, b.country].filter(Boolean).join(' · ')
      : [b.authors, b.year, b.publisher].filter(Boolean).join(' · ');
    return `<button type="button" class="result" data-i="${i}">
      <span class="cover${isVinyl(b) ? ' sleeve' : ''}">${coverInner(b)}</span>
      <span class="r-text">
        <span class="r-title">${esc(b.title)}</span>
        <span class="r-sub">${esc(line)}</span>
        ${have ? `<span class="r-have">${t(isVinyl(b) ? 'Уже есть в коллекции' : 'Уже есть в библиотеке')}</span>` : ''}
      </span>
    </button>`;
  }).join('');
}

function findInLibrary(b) {
  if (isVinyl(b)) return books.find((x) => isVinyl(x) && ((b.isbn && x.isbn === b.isbn) || (b.catno && x.catno === b.catno && (x.authors || '') === (b.authors || ''))));
  return books.find((x) => (b.isbn && x.isbn === b.isbn) || bookKey(x) === bookKey(b));
}

$('resultsList').addEventListener('click', async (e) => {
  const el = e.target.closest('.result');
  if (!el || busy) return;
  const picked = { ...searchResults[+el.dataset.i] };
  busy = true;
  el.classList.add('loading');
  if (isVinyl(picked)) {
    picked.cover = await vinylCover(picked);
    if (picked.barcode && !picked.isbn) picked.isbn = normalizeCode(picked.barcode) || '';
    delete picked.barcode;
    busy = false;
    el.classList.remove('loading');
    $('results').hidden = true;
    const twin = findInLibrary(picked);
    return twin ? openSheet(twin, { note: t('Уже есть в коллекции'), warn: true }) : openSheet(picked, { isNew: true });
  }
  try {
    if (picked.cgSlug && !picked.isbn) {
      const token = await chitaiGorodToken();
      const r = await fetch(`${CG_API}/v1/products/slug/${encodeURIComponent(picked.cgSlug)}`, { headers: { Authorization: token }, signal: timeout() });
      const text = r.ok ? await r.text() : '';
      picked.isbn = (text.match(/"isbn":\["([^"]+)"/)?.[1] && normalizeCode(text.match(/"isbn":\["([^"]+)"/)[1])) || '';
    }
    picked.series = matchSeries(picked);
    if (picked.cover) picked.cover = await cleanCgCover(picked.cover);
    if (!picked.cover && picked.isbn) picked.cover = await findCover(picked.isbn);
  } catch { /* add without ISBN */ }
  busy = false;
  el.classList.remove('loading');
  delete picked.cgSlug;
  delete picked.publisherSeries;
  if (!picked.isbn) delete picked.isbn;

  $('results').hidden = true;
  const existing = findInLibrary(picked);
  if (existing) openSheet(existing, { note: duplicateNote(existing), warn: true });
  else openSheet(picked, { isNew: true });
});

$('manualBtn').addEventListener('click', (e) => {
  $('results').hidden = true;
  const typedIn = e.currentTarget.dataset.title;
  openSheet(tab === 'vinyl' ? { kind: 'vinyl', title: typedIn } : { title: typedIn },
    { isNew: true, note: t(tab === 'vinyl' ? 'Заполните данные пластинки' : 'Заполните данные книги') });
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

async function startScanner(mode) {
  if (mode) setScanMode(mode);
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    toast(t('Камера работает только по https. Введите ISBN вручную.'), 4000);
    return;
  }
  setScanMode(scanMode);
  $('scanner').hidden = false;
  $('scanHint').textContent = t('Включаю камеру…');
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
    toast(t(err.name === 'NotAllowedError' ? 'Нет доступа к камере' : 'Не удалось включить камеру'), 3500);
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
      $('scanHint').textContent = t('Наведите на штрихкод');
      barcodeLoop(await getDetector(), video, alive);
    } else {
      $('scanHint').textContent = t('Загружаю распознавание текста…');
      const worker = await getOcrWorker();
      if (!alive()) return;
      $('scanHint').textContent = t(tab === 'vinyl' ? 'Поместите каталожный номер в рамку' : 'Поместите номер ISBN в рамку');
      textLoop(worker, video, alive);
    }
  } catch {
    if (alive()) $('scanHint').textContent = t('Сканер не загрузился — проверьте интернет');
  }
}

async function barcodeLoop(detector, video, alive) {
  let lastOther = null, otherHits = 0;
  while (alive()) {
    try {
      const codes = (await detector.detect(video)).map((c) => normalizeCode(c.rawValue)).filter(Boolean);
      if (!alive()) return;
      const isbn = codes.find(isIsbn);
      if (isbn && tab !== 'vinyl') return onScanned(isbn);
      // Any other barcode has to read the same way a few times: on a record sleeve twice is enough,
      // because the check digit already has to add up.
      if (codes[0]) {
        otherHits = codes[0] === lastOther ? otherHits + 1 : 1;
        lastOther = codes[0];
        if (otherHits >= (tab === 'vinyl' ? 2 : 4)) return onScanned(codes[0]);
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
        const hit = tab === 'vinyl' ? findCatnoInText(data.text) : findIsbnInText(data.text);
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
// A record's catalogue number as printed on the label: "С60 27413 000", "33С 10-05207", "SHVL 804", "PL 12345".
// Letters and digits in one token, at least three digits, and never a bare year.
function findCatnoInText(text) {
  const clean = text.toUpperCase().replace(/[^0-9A-ZА-ЯЁ \n-]/g, ' ');
  // Soviet numbers put a letter straight before the digits ("С60 27413 000", "33С 60-08429");
  // western ones are a short word and a number ("SHVL 804", "MFSL 1-017").
  const soviet = /(?:^|\s)((?:\d{2}\s?)?[A-ZА-ЯЁ]-?\d{2,3}(?:\s?-?\s?\d{2,6}){0,2}(?:\s?-?\s?\d)?)(?=\s|$)/;
  const western = /(?:^|\s)([A-ZА-ЯЁ]{2,5}\s?-?\s?\d{1,3}(?:\s?-?\s?\d{2,6}){0,2})(?=\s|$)/;
  // Some labels print the speed first: "33С 60-08429".
  const speedFirst = /(?:^|\s)(\d{2}\s?[A-ZА-ЯЁ]\s?-?\s?\d{2,3}(?:\s?-?\s?\d{2,6}){0,2})(?=\s|$)/;
  for (const line of clean.split('\n')) {
    for (const re of [soviet, speedFirst, western]) {
      const code = line.match(re)?.[1].replace(/\s+/g, ' ').trim();
      if (code && (code.match(/\d/g) || []).length >= 3) return { code, labelled: false };
    }
  }
  return null;
}

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
  if (tab === 'vinyl' && scanMode === 'text') addRecordBy('catno', code, true);
  else addByCode(code, true);
}

$('scanType').addEventListener('click', () => { stopScanner(); openAddSheet(); $('addManual').click(); });
$('scanShot').addEventListener('click', () => $('scanPhoto').click());
$('scanPhoto').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  $('scanHint').textContent = t('Читаю фото…');
  try {
    const bitmap = await createImageBitmap(file);
    const codes = (await (await getDetector()).detect(bitmap)).map((c) => normalizeCode(c.rawValue)).filter(Boolean);
    bitmap.close?.();
    if (codes.length) return onScanned(codes.find(isIsbn) || codes[0]);
    // No bars in the picture: read the number printed under them instead.
    const worker = await getOcrWorker();
    const { data } = await worker.recognize(file);
    const digits = (data.text.match(/[\d\s]{11,}/g) || []).map((d) => normalizeCode(d)).filter(Boolean);
    if (digits.length) return onScanned(digits[0]);
    const catno = tab === 'vinyl' ? findCatnoInText(data.text) : null;
    if (catno) { stopScanner(); return addRecordBy('catno', catno.code, true); }
    $('scanHint').textContent = t('На фото не видно номера — попробуйте ещё раз');
  } catch {
    $('scanHint').textContent = t('Не удалось прочитать фото');
  }
});

function stopScanner() {
  scanRun++;
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
  $('video').srcObject = null;
  $('scanner').hidden = true;
}

$('closeScan').addEventListener('click', stopScanner);
$('scanModes').addEventListener('click', (e) => {
  const mode = e.target.closest('button')?.dataset.mode;
  if (mode && mode !== scanMode) setScanMode(mode);
});



/* ---------- records ---------- */

// The records' hero: the whole collection leaning in a crate, the way you flip through one in a shop.
function renderCrate(hero) {
  const all = tabItems().sort((a, b) => collator.compare(a.authors || '￿', b.authors || '￿') || (+a.year || 0) - (+b.year || 0));
  if (!all.length) { hero.hidden = true; return; }
  const html = all.map((b, i) => `
    <button class="crate-record" data-id="${esc(b.id)}" style="--i:${i}" aria-label="${esc([b.authors, b.title].filter(Boolean).join(' — '))}">
      <span class="cover crate-sleeve">${coverInner(b, i >= 14)}</span>
    </button>`).join('');
  hero.hidden = false;
  if (html === heroHtml) return;
  heroHtml = html;
  $('heroTrack').innerHTML = html;
  settleCovers($('heroTrack'));
}

// A record's spine is its sleeve: square covers stand in a crate, newest pressings and vintage on separate shelves.
// Everything else — search, sort, the read/listened marks, ratings, the card — is shared with the books.
const VINTAGE_BEFORE = 1991; // Soviet and early pressings go on their own shelf
const isVintage = (b) => +b.year > 0 && +b.year < VINTAGE_BEFORE;

function renderVinyl() {
  const q = '';
  const sort = 'artist';
  const mine = tabItems();
  let shown = [...mine];

  if (sort === 'title') shown.sort((a, b) => collator.compare(a.title, b.title));
  else if (sort === 'rating') shown.sort((a, b) => (b.rating || 0) - (a.rating || 0) || collator.compare(a.title, b.title));
  else if (sort === 'year') shown.sort((a, b) => (+b.year || 0) - (+a.year || 0) || collator.compare(a.title, b.title));
  else if (sort === 'label') shown.sort((a, b) => collator.compare(publisherName(a.publisher) || '￿', publisherName(b.publisher) || '￿') || collator.compare(a.authors || '￿', b.authors || '￿'));
  else if (sort === 'added') shown.sort((a, b) => b.added - a.added);
  else shown.sort((a, b) => collator.compare(a.authors || '￿', b.authors || '￿') || (+a.year || 0) - (+b.year || 0) || collator.compare(a.title, b.title));

  renderHero();
  $('categories').hidden = true;
  $('locations').hidden = true;
  $('readers').hidden = true;
  $('count').textContent = mine.length ? `${mine.length} ${plural(mine.length, ITEM_FORMS.vinyl)}` : '';
  $('empty').hidden = mine.length > 0;

  let index = 0;
  const sleeve = (b) => `
    <button class="record" data-id="${esc(b.id)}">
      <span class="stand"><span class="disc" aria-hidden="true"></span><span class="cover sleeve">${coverInner(b, index++ >= 12)}${ratingBadge(b)}</span></span>
      <span class="label">
        <span class="title">${esc(b.authors || b.title)}</span>
        <span class="sub">${esc([b.title !== b.authors ? b.title : '', b.year].filter(Boolean).join(' · '))}</span>
      </span>
    </button>`;
  const addRecord = token && !q ? `
    <button class="record add-book" data-add-book>
      <span class="stand"><span class="cover sleeve add-cover">${PLUS_LARGE}</span></span>
      <span class="label"><span class="title">${t('Добавить пластинку')}</span></span>
    </button>` : '';

  const vintage = shown.filter(isVintage), modern = shown.filter((b) => !isVintage(b));
  const groups = [[t('Винтаж'), vintage], [t('Современные'), modern]].filter(([, list]) => list.length);
  const titled = groups.length > 1;
  let html = groups.map(([title, list], i) => `
    <section class="shelf-section vinyl-section">
      ${titled ? `<h2 class="shelf-title vinyl-title">${title}</h2>` : ''}
      <div class="shelf crate">${list.map(sleeve).join('')}${i === groups.length - 1 ? addRecord : ''}</div>
    </section>`).join('');
  if (!groups.length) html = addRecord ? `<div class="shelf crate">${addRecord}</div>` : (mine.length ? `<p class="empty">${t('Ничего не найдено.')}</p>` : '');
  if (html !== renderedList) {
    renderedList = html;
    $('list').innerHTML = html;
    settleCovers($('list'));
  }
}

/* ---------- looking records up ---------- */

// Discogs knows both new pressings (by barcode) and Soviet ones (by catalogue number); it answers without a key,
// 25 requests a minute. A personal token is optional and only adds the sleeve pictures.
const DISCOGS = 'https://api.discogs.com/database/search';
const DKEY_KEY = 'bookshelf.discogsToken';
const discogsAuth = () => {
  const key = localStorage.getItem(DKEY_KEY);
  return key ? { Authorization: `Discogs token=${key}` } : {};
};

// Records only: the same barcode or catalogue number often belongs to a CD or a cassette as well.
async function discogsSearch(params) {
  const url = `${DISCOGS}?${new URLSearchParams({ type: 'release', format: 'Vinyl', per_page: '12', ...params })}`;
  const r = await fetch(url, { headers: discogsAuth(), signal: timeout() });
  if (!r.ok) throw new Error(r.status);
  return ((await r.json()).results || []).map(fromDiscogs);
}

// "Ария - Герой Асфальта" → artist and album; Discogs marks duplicate names as "Aria (2)".
function fromDiscogs(r) {
  const [artist, ...rest] = String(r.title || '').split(' - ');
  return {
    kind: 'vinyl',
    authors: artist.replace(/\s*\(\d+\)$/, '').trim(),
    title: (rest.join(' - ') || artist).trim(),
    year: r.year ? String(r.year) : '',
    publisher: (r.label || [])[0] || '',
    catno: r.catno || '',
    format: pickFormat(r.format || []),
    country: r.country || '',
    cover: r.cover_image && !r.cover_image.includes('spacer.gif') ? r.cover_image : '',
    discogsUrl: r.uri ? `https://www.discogs.com${r.uri}` : '',
    barcode: (r.barcode || [])[0] || '',
  };
}
const mbEscape = (s = '') => s.replace(/["\\]/g, ' ').trim();

// "33С 60-08429" → also "С 60-08429", "С60-08429", "60-08429": Discogs writes the same number in several ways.
function catnoVariants(code) {
  const trimmed = code.trim();
  const noSpeed = trimmed.replace(/^(?:33|45|78)\s?/, '');
  // The bare digits are left out on purpose: they match half the catalogue.
  return [...new Set([trimmed, noSpeed, noSpeed.replace(/\s+/g, ''), noSpeed.replace(/[\s-]+/g, ' ')].filter(Boolean))];
}
const pickFormat = (list) => list.find((f) => /^(LP|EP|7"|10"|12"|Box Set|Single)$/i.test(f)) || (list.includes('Vinyl') ? 'LP' : list[0] || '');

// Sleeve pictures: Discogs only serves them with a token, so the usual source is Apple's catalogue,
// then the Cover Art Archive by barcode. Both allow being read from the page.
async function vinylCover(rec) {
  if (rec.cover) return rec.cover;
  try {
    const d = await fetchJson(`https://itunes.apple.com/search?${new URLSearchParams({ term: `${rec.authors} ${rec.title}`, entity: 'album', limit: '3' })}`);
    const want = seriesKey(rec.title);
    const hit = (d.results || []).find((a) => {
      const got = seriesKey(a.collectionName);
      return got === want || got.startsWith(want + ' ') || want.startsWith(got + ' '); // "Currents (Deluxe)" counts, "The Wall" does not
    });
    if (hit?.artworkUrl100) return hit.artworkUrl100.replace('100x100bb', '600x600bb');
  } catch { /* offline or no match */ }
  // Apple's catalogue misses plenty of older albums; MusicBrainz plus the Cover Art Archive usually has them.
  const mbQuery = (rec.isbn || rec.barcode)
    ? `release/?query=barcode:${rec.isbn || rec.barcode}&fmt=json&limit=1`
    : `release-group/?query=artist:"${mbEscape(rec.authors)}" AND releasegroup:"${mbEscape(rec.title)}"&fmt=json&limit=1`;
  try {
    const mb = await fetchJson(`https://musicbrainz.org/ws/2/${mbQuery}`);
    const group = mb['release-groups']?.[0], release = mb.releases?.[0];
    const url = group ? `https://coverartarchive.org/release-group/${group.id}` : release ? `https://coverartarchive.org/release/${release.id}` : '';
    if (url) {
      const art = await fetch(url, { signal: timeout() });
      if (art.ok) {
        const front = (await art.json()).images?.find((i) => i.front) || {};
        // the archive answers with http links; the page is served over https
        return (front.thumbnails?.['500'] || front.thumbnails?.large || front.image || '').replace(/^http:/, 'https:');
      }
    }
  } catch { /* no cover art anywhere */ }
  return '';
}

// A record scanned by barcode, or found by its catalogue number.
async function addRecordBy(kind, value, fromScan = false) {
  const existing = books.find((b) => isVinyl(b) && (kind === 'barcode' ? b.isbn === value : b.catno && b.catno.toLowerCase() === value.toLowerCase()));
  if (existing) {
    navigator.vibrate?.([60, 60, 60]);
    openSheet(existing, { note: t('Уже есть в коллекции'), warn: true, fromScan });
    return;
  }
  if (busy) return;
  busy = true;
  toast(t('Ищу пластинку…'), 0);
  let found = null;
  try {
    let list = [];
    if (kind === 'barcode') list = await discogsSearch({ barcode: value });
    else {
      // The number on the label rarely matches the catalogue exactly: the speed, spaces and dashes all vary.
      for (const variant of catnoVariants(value)) {
        list = await discogsSearch({ catno: variant });
        if (!list.length) list = await discogsSearch({ q: variant });
        if (list.length) break;
      }
      if (!list.length) list = await discogsSearch({ catno: value, format: '' }); // not a vinyl-only number after all
    }
    found = list[0] || null;
    if (list.length > 1) { // several pressings of the same record: let the owner choose
      busy = false;
      hideToast();
      showResults(list, value);
      return;
    }
  } catch { /* offline or rate-limited */ }
  busy = false;
  hideToast();
  const rec = { kind: 'vinyl', ...(found || {}), [kind === 'barcode' ? 'isbn' : 'catno']: value };
  if (found) rec.cover = await vinylCover(rec);
  openSheet(rec, { isNew: true, fromScan, note: found ? '' : t('Не нашлось в Discogs — заполните сами') });
}

/* ---------- what to read ---------- */

// A random grown-up book the chosen person hasn't read (or nobody has, for "anyone"), optionally of one category.
const PICK_KEY = 'bookshelf.pick';
const pickPrefs = { who: 'any', cat: '', ...readJson(PICK_KEY, {}) };
let pickCurrent = null;

function pickPool() {
  if (tab === 'vinyl') return tabItems().filter((b) => (pickPrefs.who === 'any' ? !(b.readBy || '') : !hasRead(b, pickPrefs.who)));
  return books.filter((b) => !isVinyl(b) && b.category !== 'kids' && (pickPrefs.who === 'any' ? !(b.readBy || '') : !hasRead(b, pickPrefs.who)) &&
    (!pickPrefs.cat || (b.category || '') === pickPrefs.cat));
}

function renderPick(reroll = true) {
  $('pickTitle').textContent = t(tab === 'vinyl' ? 'Что послушать?' : 'Что почитать?');
  $('pickCat').hidden = tab === 'vinyl';
  if (pickPrefs.cat === 'kids') pickPrefs.cat = ''; // children's books aren't offered (a choice saved before)
  const seg = (group, value, label) => `<button type="button" class="seg${pickPrefs[group] === value ? ' on' : ''}" data-${group}="${value}">${label}</button>`;
  $('pickWho').innerHTML = seg('who', 'any', t('Кому угодно')) + Object.entries(READERS).map(([k, n]) => seg('who', k, n)).join('');
  $('pickCat').innerHTML = seg('cat', '', t('Любая')) + Object.entries(CATEGORIES).filter(([k]) => k !== 'kids').map(([k, n]) => seg('cat', k, n)).join('');
  const pool = pickPool();
  if (reroll || !pool.includes(pickCurrent)) {
    const others = pool.length > 1 ? pool.filter((b) => b !== pickCurrent) : pool;
    pickCurrent = others[Math.floor(Math.random() * others.length)] || null;
  }
  const b = pickCurrent;
  $('pickAgain').disabled = pool.length < 2;
  $('pickOpen').hidden = !b;
  if (!b) {
    $('pickCard').innerHTML = `<p class="pick-empty">${pickPrefs.who === 'any' ? t('Все книги уже кто-то прочитал') : t(pickPrefs.who === 'alina' ? 'Алина прочитала всё' : 'Паша прочитал всё')} — ${t('пора за новыми!')}</p>`;
    return;
  }
  $('pickCard').innerHTML = `
    <span class="cover pick-cover">${coverInner(b, false)}${ratingBadge(b)}</span>
    <div class="pick-text">
      <p class="pick-title">${esc(b.title)}</p>
      <p class="pick-author">${esc([b.authors, b.year].filter(Boolean).join(', '))}</p>
      ${b[fieldKey('description')] ? `<p class="pick-desc">${esc(b[fieldKey('description')])}</p>` : ''}
      <p class="pick-meta">${b.pages ? `<span>${b.pages} ${plural(+b.pages, ['страница', 'страницы', 'страниц'])}</span>` : ''}${b.location ? `<span class="loc-tag" data-color="${locColor(b.location)}">${esc(roomLabel(b.location))}</span>` : ''}</p>
      <p class="pick-left">${t('Ещё {count} {books} на выбор', { count: pool.length - 1, books: plural(pool.length - 1, BOOK_FORMS) })}</p>
    </div>`;
  settleCovers($('pickCard'));
  $('pickCard').classList.remove('deal');
  void $('pickCard').offsetWidth; // restart the little deal-in animation
  $('pickCard').classList.add('deal');
}

function openPick() { renderPick(); $('pickSheet').hidden = false; }
$('pickSheet').addEventListener('click', (e) => {
  if (e.target.id === 'pickSheet' || e.target.closest('#pickClose')) { $('pickSheet').hidden = true; return; }
  const seg = e.target.closest('.seg');
  if (seg) {
    if (seg.dataset.who !== undefined) pickPrefs.who = seg.dataset.who;
    if (seg.dataset.cat !== undefined) pickPrefs.cat = seg.dataset.cat;
    try { localStorage.setItem(PICK_KEY, JSON.stringify(pickPrefs)); } catch { /* storage unavailable */ }
    renderPick();
    return;
  }
  if (e.target.closest('#pickAgain')) renderPick();
  if (e.target.closest('#pickOpen') || e.target.closest('.pick-cover')) { $('pickSheet').hidden = true; openSheet(pickCurrent); }
});

/* ---------- statistics ---------- */

function bars(rows, { color = () => '', onClick = null } = {}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return `<div class="bars">${rows.map((r) => `
    <${onClick ? `button type="button" data-${onClick}="${esc(r.key ?? r.label)}"` : 'div'} class="bar-row"${color(r)}>
      <span class="bar-label">${esc(r.label)}</span>
      <span class="bar-track"><span class="bar-fill" style="width:${(r.value / max * 100).toFixed(1)}%"></span></span>
      <span class="bar-value">${r.value}${r.suffix || ''}</span>
    </${onClick ? 'button' : 'div'}>`).join('')}</div>`;
}

function renderStats() {
  if (tab === 'vinyl') return renderVinylStats();
  const books = tabItems(); // this half of the collection only
  const n = books.length;
  const num = (v) => v.toLocaleString(locale());
  const pagesOf = (list) => list.reduce((sum, b) => sum + (parseInt(b.pages, 10) || 0), 0);
  const authors = new Set(books.flatMap((b) => (b.authors || '').split(',').map((a) => a.trim()).filter(Boolean)));
  const readBy = (k) => books.filter((b) => hasRead(b, k));
  const both = books.filter((b) => hasRead(b, 'pasha') && hasRead(b, 'alina'));
  const nobody = books.filter((b) => !(b.readBy || ''));
  const avg = (vals) => vals.length ? (vals.reduce((a, v) => a + v, 0) / vals.length) : 0;
  const count = (key) => { const m = new Map(); for (const b of books) { const k = key(b); if (k) m.set(k, (m.get(k) || 0) + 1); } return [...m].sort((a, b) => b[1] - a[1]); };

  const tiles = [
    [num(n), plural(n, BOOK_FORMS)],
    [num(pagesOf(books)), t('страниц на полках')],
    [num(authors.size), plural(authors.size, ['автор', 'автора', 'авторов'])],
    [num(locations().length), plural(locations().length, ['комната', 'комнаты', 'комнат'])],
  ];

  const readerCards = Object.entries(READERS).map(([k, name]) => {
    const list = readBy(k);
    const stars = books.map((b) => +b[RATING_FIELD[k]]).filter(Boolean);
    return `<div class="reader-stat">
      <p class="reader-name">${name}</p>
      <p class="reader-big">${list.length}<span> ${t('из')} ${n}</span></p>
      <span class="progress"><span style="width:${n ? (list.length / n * 100).toFixed(1) : 0}%"></span></span>
      <p class="reader-sub">${num(pagesOf(list))} ${t('страниц')}${stars.length ? ` · ${t('средняя оценка')} ${avg(stars).toFixed(1)}★` : ''}</p>
    </div>`;
  }).join('');

  const byPages = books.filter((b) => +b.pages).sort((a, b) => b.pages - a.pages);
  const byYear = books.filter((b) => +b.year > 1000).sort((a, b) => a.year - b.year);
  const byGoodreads = books.filter((b) => b.rating && b.ratingsCount >= 50).sort((a, b) => b.rating - a.rating);
  const family = (b) => avg(Object.values(RATING_FIELD).map((f) => +b[f]).filter(Boolean));
  const byFamily = books.filter(family).sort((a, b) => family(b) - family(a));
  const record = (label, b, value) => b ? `<button type="button" class="record-card" data-id="${esc(b.id)}"><span class="cover">${coverInner(b, false)}</span><span><small>${label}</small><b>${esc(b.title)}</b><em>${value}</em></span></button>` : '';

  const decades = count((b) => +b.year > 1000 ? (lang === 'en' ? `${Math.floor(b.year / 10) * 10}s` : `${Math.floor(b.year / 10) * 10}-е`) : '').sort((a, b) => a[0].localeCompare(b[0]));

  $('statsBody').innerHTML = `
    <div class="stat-tiles">${tiles.map(([v, l]) => `<div class="stat-tile"><b>${v}</b><span>${l}</span></div>`).join('')}</div>

    <h3 class="stats-h">${t('Прочитали')}</h3>
    <div class="reader-stats">${readerCards}</div>
    <p class="stats-note">${t('Оба прочитали')} ${both.length} ${plural(both.length, BOOK_FORMS)} · ${t('никто пока не открывал')} ${nobody.length}</p>

    <h3 class="stats-h">${t('Категории')}</h3>
    ${bars([...Object.entries(CATEGORIES).map(([k, l]) => ({ label: l, key: k, value: books.filter((b) => b.category === k).length })), { label: t('Без категории'), key: '', value: books.filter((b) => !b.category).length }].filter((r) => r.value))}

    <h3 class="stats-h">${t('Комнаты')}</h3>
    ${bars(count((b) => b.location).map(([l, v]) => ({ label: roomLabel(l), key: l, value: v })), { color: (r) => ` data-color="${locColor(r.key)}"` })}

    <h3 class="stats-h">${t('Издательства')}</h3>
    ${bars(count((b) => publisherName(b.publisher)).slice(0, 6).map(([l, v]) => ({ label: l, value: v })))}

    ${decades.length ? `<h3 class="stats-h">${t('Годы издания')}</h3>${bars(decades.map(([l, v]) => ({ label: l, value: v })))}` : ''}

    <h3 class="stats-h">${t('Рекорды')}</h3>
    <div class="records">
      ${record(t('Самая толстая'), byPages[0], byPages[0] && `${byPages[0].pages} ${t('страниц')}`)}
      ${record(t('Самая тонкая'), byPages.at(-1), byPages.at(-1) && `${byPages.at(-1).pages} ${t('страниц')}`)}
      ${record(t('Самое старое издание'), byYear[0], byYear[0]?.year)}
      ${record(t('Лучшая по Goodreads'), byGoodreads[0], byGoodreads[0] && `★ ${byGoodreads[0].rating.toFixed(2)}`)}
      ${record(t('Любимая в семье'), byFamily[0], byFamily[0] && `★ ${family(byFamily[0]).toFixed(1)}`)}
    </div>`;
  settleCovers($('statsBody'));
}

// The records get their own numbers: artists, labels, decades and who has listened to what.
function renderVinylStats() {
  const list = tabItems();
  const n = list.length;
  const num = (v) => v.toLocaleString(locale());
  const avg = (vals) => (vals.length ? vals.reduce((a, v) => a + v, 0) / vals.length : 0);
  const count = (key) => { const m = new Map(); for (const b of list) { const k = key(b); if (k) m.set(k, (m.get(k) || 0) + 1); } return [...m].sort((a, b) => b[1] - a[1]); };
  const artists = new Set(list.map((b) => (b.authors || '').trim()).filter(Boolean));
  const vintage = list.filter(isVintage);
  const readerCards = Object.entries(READERS).map(([k, name]) => {
    const heard = list.filter((b) => hasRead(b, k));
    const stars = list.map((b) => +b[RATING_FIELD[k]]).filter(Boolean);
    return `<div class="reader-stat">
      <p class="reader-name">${name}</p>
      <p class="reader-big">${heard.length}<span> ${t('из')} ${n}</span></p>
      <span class="progress"><span style="width:${n ? (heard.length / n * 100).toFixed(1) : 0}%"></span></span>
      <p class="reader-sub">${stars.length ? `${t('средняя оценка')} ${avg(stars).toFixed(1)}★` : t('пока без оценок')}</p>
    </div>`;
  }).join('');
  const decades = count((b) => (+b.year > 1000 ? (lang === 'en' ? `${Math.floor(b.year / 10) * 10}s` : `${Math.floor(b.year / 10) * 10}-е`) : '')).sort((a, b) => a[0].localeCompare(b[0]));
  const byYear = list.filter((b) => +b.year > 1000).sort((a, b) => a.year - b.year);
  const byRating = list.filter((b) => b.rating).sort((a, b) => b.rating - a.rating);
  const record = (label, b, value) => (b ? `<button type="button" class="record-card" data-id="${esc(b.id)}"><span class="cover sleeve">${coverInner(b, false)}</span><span><small>${label}</small><b>${esc(b.title)}</b><em>${value}</em></span></button>` : '');
  $('statsBody').innerHTML = `
    <div class="stat-tiles">
      ${[[num(n), plural(n, ITEM_FORMS.vinyl)], [num(artists.size), t('исполнителей')], [num(count((b) => publisherName(b.publisher)).length), t('лейблов')], [num(vintage.length), t('до 1991 года')]]
    .map(([v, l]) => `<div class="stat-tile"><b>${v}</b><span>${l}</span></div>`).join('')}
    </div>
    <h3 class="stats-h">${t('Слушали')}</h3>
    <div class="reader-stats">${readerCards}</div>
    <h3 class="stats-h">${t('Исполнители')}</h3>
    ${bars(count((b) => b.authors).slice(0, 6).map(([l, v]) => ({ label: l, value: v })))}
    <h3 class="stats-h">${t('Лейблы')}</h3>
    ${bars(count((b) => publisherName(b.publisher)).slice(0, 6).map(([l, v]) => ({ label: l, value: v })))}
    ${decades.length ? `<h3 class="stats-h">${t('Годы издания')}</h3>${bars(decades.map(([l, v]) => ({ label: l, value: v })))}` : ''}
    <h3 class="stats-h">${t('Рекорды')}</h3>
    <div class="records">
      ${record(t('Самая старая'), byYear[0], byYear[0]?.year)}
      ${record(t('Самая новая'), byYear.at(-1), byYear.at(-1)?.year)}
      ${record(t('Лучшая по Discogs'), byRating[0], byRating[0] && `★ ${byRating[0].rating.toFixed(2)}`)}
    </div>`;
  settleCovers($('statsBody'));
}

function openStats() { $('statsTitle').textContent = t(tab === 'vinyl' ? 'Наши пластинки' : 'Наша библиотека'); renderStats(); $('statsSheet').hidden = false; $('statsBody').scrollTop = 0; }
$('statsSheet').addEventListener('click', (e) => {
  if (e.target.id === 'statsSheet' || e.target.closest('#statsClose')) { $('statsSheet').hidden = true; return; }
  const rec = e.target.closest('.record-card');
  if (rec) { $('statsSheet').hidden = true; openSheet(books.find((b) => b.id === rec.dataset.id)); }
});

/* ---------- map of the shelves ---------- */

// A floor plan of the flat: each room a tile sized by its books, with its books as tiny spines on little shelves.
// Tapping a room shows only its books on the page.
function renderMap() {
  const rooms = locations();
  const unplaced = books.filter((b) => !b.location);
  const list = [...rooms.map(([name, n]) => ({ name, n, books: books.filter((b) => b.location === name) })).sort((a, b) => b.n - a.n),
    ...(unplaced.length ? [{ name: '', n: unplaced.length, books: unplaced }] : [])];
  const total = Math.max(1, books.length);
  $('mapPlan').innerHTML = list.map((room, i) => {
    // The biggest room takes the whole width; rooms holding more books get taller tiles.
    const wide = (i === 0 && room.n / total > 0.35) || (i === list.length - 1 && (list.length - (list[0].n / total > 0.35 ? 1 : 0)) % 2 === 1);
    const spines = room.books.map((b) => {
      const [h, sat, l] = spineColors.get(b.cover) || clothHsl(b);
      const hash = hashOf(b.id + b.title);
      const w = +b.pages ? Math.max(3, Math.min(9, Math.round(2 + b.pages / 140))) : 3 + hash % 3;
      const height = b.category === 'kids' ? 17 + (hash >> 4) % 6 : 22 + (hash >> 4) % 8;
      return `<i style="--spine:hsl(${h.toFixed(0)} ${(sat * 100).toFixed(0)}% ${(l * 100).toFixed(0)}%);--h:${height}px;width:${w}px"></i>`;
    }).join('');
    return `<button type="button" class="room${wide ? ' wide' : ''}"${room.name ? ` data-color="${locColor(room.name)}"` : ''} data-room="${esc(room.name)}">
      <span class="room-head"><b>${esc(room.name ? roomLabel(room.name) : t('Без места'))}</b><span>${room.n} ${plural(room.n, BOOK_FORMS)}</span></span>
      <span class="room-shelves">${spines}</span>
    </button>`;
  }).join('');
}

function openMap() { renderMap(); $('mapSheet').hidden = false; }
$('mapSheet').addEventListener('click', (e) => {
  if (e.target.id === 'mapSheet' || e.target.closest('#mapClose')) { $('mapSheet').hidden = true; return; }
  const room = e.target.closest('.room');
  if (!room) return;
  $('mapSheet').hidden = true;
  locFilter = room.dataset.room;
  catFilter = null;
  readFilter = null;
  render();
  $('categories').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

$('quick').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  ({ pick: openPick, stats: openStats, map: openMap })[btn.dataset.open]?.();
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
  if (action === 'pick') openPick();
  if (action === 'stats') openStats();
  if (action === 'dkey') {
    const v = prompt(t('Токен Discogs (необязательно: с ним приходят картинки конвертов). Оставьте пустым, чтобы удалить.'), localStorage.getItem(DKEY_KEY) || '');
    if (v === null) return;
    v.trim() ? localStorage.setItem(DKEY_KEY, v.trim()) : localStorage.removeItem(DKEY_KEY);
    toast(v.trim() ? t('Токен сохранён') : t('Токен удалён'));
  }
  if (action === 'gkey') {
    const v = prompt(t('Ключ Google Books API (необязательно: помогает, когда бесплатный лимит закончился). Оставьте пустым, чтобы удалить.'), localStorage.getItem(GKEY_KEY) || '');
    if (v === null) return;
    v.trim() ? localStorage.setItem(GKEY_KEY, v.trim()) : localStorage.removeItem(GKEY_KEY);
    toast(v.trim() ? t('Ключ сохранён') : t('Ключ удалён'));
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
    toast(`${t('Импортировано:')} ${fresh.length} ${plural(fresh.length, BOOK_FORMS)}`);
  } catch {
    toast(t('Это не файл резервной копии'));
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
$('tabs').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn || btn.dataset.tab === tab) return;
  tab = btn.dataset.tab;
  try { localStorage.setItem(TAB_KEY, tab); } catch { /* storage unavailable */ }
  locFilter = null;
  catFilter = null;
  readFilter = null;
  $('search').value = '';
  renderedList = null;
  heroHtml = null;
  render();
  scrollTo({ top: 0, behavior: 'smooth' });
});

$('langSwitch').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn || btn.dataset.lang === lang) return;
  lang = btn.dataset.lang;
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* storage unavailable */ }
  translatePage();
  heroHtml = null;
  renderedList = null;
  render();
  if (!$('pickSheet').hidden) renderPick(false);
  if (!$('statsSheet').hidden) renderStats();
  if (!$('mapSheet').hidden) renderMap();
  if (!$('sheet').hidden) { renderLocTags(); renderCatTags(); renderReadTags(); }
});
$('readers').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  readFilter = readFilter === chip.dataset.read ? null : chip.dataset.read;
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
  if (!$('lightbox').hidden && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) return stepLightbox(e.key === 'ArrowLeft' ? -1 : 1);
  if (e.key !== 'Escape') return;
  if (crop) crop.done(null);
  else if (!$('lightbox').hidden) closeLightbox();
  else if (!$('scanner').hidden) stopScanner();
  else if (!$('results').hidden) { $('results').hidden = true; searchRun++; }
  else if (!$('sheet').hidden) closeSheet();
  else if (!$('addSheet').hidden) closeAddSheet();
  else if (!$('pickSheet').hidden) $('pickSheet').hidden = true;
  else if (!$('statsSheet').hidden) $('statsSheet').hidden = true;
  else if (!$('mapSheet').hidden) $('mapSheet').hidden = true;
  else if (fan) closeFan();
});

// Books saved before cover/author fallbacks existed: fill their empty fields once, quietly.
const BACKFILL = 1;
// Books saved before product shots were detected: flatten their Chitai-gorod cover once.
const COVER_FIX = 1;
// Goodreads ratings: fetched one book at a time, re-checked after 90 days (30 if not found before).
const DAY = 86400000;
let ratingsRunning = false;

translatePage();
updateRole();
render();
sync();
if (token) { backfill(); updateRatings(); }
else if (readJson(LEGACY_KEY, []).length) toast(t('Книги с этого устройства перенесутся в библиотеку, когда вы войдёте (меню → Войти)'), 6000);
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
