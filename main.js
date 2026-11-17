/* vilchinski.com — liquid glass edition. No dependencies, no build step. */

// previews are served from the storage bucket
const CDN = 'https://s3.twcstorage.ru/vilchinski/';

// Test look, off unless asked for: ?look=sky switches it on for the tab, ?look=off back.
{
  const ask = new URLSearchParams(location.search).get('look');
  let look = '';
  try { if (ask) sessionStorage.setItem('look', ask); look = sessionStorage.getItem('look') || ''; } catch { look = ask || ''; }
  if (look === 'sky') document.documentElement.classList.add('look-sky');
}

// sobersasha: videos stream straight from the public Yandex Disk folder; the loader in index.html
// fetches each file's direct link into window.SRC before this script runs.
// [slug, youtubeId, Yandex Disk path, title, artist]
const WORKS = [
  ['major-grom', '', '/Майор Гром_сериал.mp4', 'Игра против правил', 'Майор Гром'],
  ['tesno', '', '/Music_video/Aarne, Bushido Zho, Anikv - Тесно.mp4', 'Тесно', 'Aarne, Bushido Zho, Anikv'],
  ['brunette', '', '/Music_video/BRUNETTE_H265.mp4', 'SUPERSTAR ILLNESS', 'BRUNETTE'],
  ['za-dengi-da', '', '/Music_video/Instasamka -  За деньги да', 'За деньги да', 'Instasamka'],
  ['windows', '', '/Music_video/Seemee, Mayot - Windows.mp4', 'Windows', 'Seemee, Mayot'],
  ['liza', '', '/Music_video/Slava Marlow - Лиза.mp4', 'Лиза', 'Slava Marlow'],
  ['kabluki', '', '/Music_video/Slava Marlow – Каблуки.mp4', 'Каблуки', 'Slava Marlow'],
  ['cvety', '', '/Music_video/Минаева_Эти цветы так кстати.mp4', 'Эти цветы так кстати', 'Минаева'],
  ['siuzanna', '', '/Music_video/Siuzanna.mp4', 'клип', 'Siuzanna'],
  ['betboom', '', '/Commercial/BetBoom.mov', 'Убойный медиафутбол', 'BetBoom'],
  ['rostics', '', '/Commercial/ROSTICS_Autumn.mp4', 'Чикен Комбо', 'Rostic’s'],
  ['sber', '', '/Commercial/Sber.mp4', 'Молодежная Сберкарта ft. Exile и Парадевич', 'Сбер'],
  ['yandex-pay', '', '/Commercial/YandexPay_barber_30.mp4', 'Яндекс Пэй', 'Яндекс'],
  ['yota', '', '/Commercial/Yota_20s_260626_upd3.mp4', 'Заработай', 'Yota'],
  ['patsanki', '', '/Patsanki.mp4', 'Пацанки', 'сериал'],
  ['nurlandos', 'ac_kS49M95w', '', 'фильм', 'Нурландос'],
  ['amazing-red', '', '/Fashion/Amazing Red.mp4', 'Fashion film', 'Amazing Red'],
  ['amazing-red-ghost', '', '/Fashion/Amazing_Red.MP4', 'Ghost', 'Amazing Red'],
  ['ostin', '', '/Fashion/OSTIN_promo_OLV.mp4', 'Promo', 'O′STIN'],
  ['outlaw', '', '/Fashion/Outlaw_Dinamo.mp4', 'Динамо', 'Outlaw'],
  ['usl', '', '/Fashion/USL.mp4', 'Fashion film', 'USL'],
  ['dear-passengers', '', '/Fashion/fakoshima_-_dear passengers mst.mp4', 'Dear Passengers', 'fakoshima'],
  ['vending-machine', '', '/Fashion/fakoshima_-_vending machine mst.mp4', 'Vending Machine', 'fakoshima'],
  ['reel-1', '', '/Fashion/Malbec/reel 1 mst.mp4', 'Взгляд сквозь пряди', 'Malbec'],
  ['reel-2', '', '/Fashion/Malbec/reel 2 mst.mp4', 'Рыжая походка по городу', 'Malbec'],
  ['reel-3', '', '/Fashion/Malbec/reel 3 mst.mp4', 'Шаг на каблуках', 'Malbec'],
  ['reel-4', '', '/Music_video/Malbeс/reel 4 mst v2.mp4', 'Комната-калейдоскоп', 'Malbec'],
  ['reel-5', '', '/Fashion/Malbec/reel 5 mst v2.mp4', 'Ночь среди своих', 'Malbec'],
  ['reel-6', '', '/Music_video/Malbeс/reel 6 mst v2.mp4', 'Лето на траве', 'Malbec'],
  ['reel-7', '', '/Music_video/Malbeс/reel 7 mst rip.mp4', 'Алые волосы, тихий лес', 'Malbec'],
  ['reel-8', '', '/Fashion/Malbec/reel 8 mst bolno v2.mp4', 'Больно, но красиво', 'Malbec'],
  ['reel-9', '', '/Music_video/Malbeс/reel 9 toys_4.mp4', 'Среди игрушек', 'Malbec'],
  ['reel-10', '', '/Music_video/Malbeс/reel red intro 1 mst.mp4', 'Red Intro', 'Malbec'],
  ['reel-11', '', '/Music_video/Malbeс/reel red vse v golove.mp4', 'Всё в голове', 'Malbec'],
  ['reel-12', '', '/Music_video/Malbec.mp4', 'Кожанка и полумрак', 'Malbec'],
].map(([slug, yt, path, title, artist]) => ({
  slug, yt, title, artist, path, cat: catOf(slug),
  get src() { return pick(window.SRC, path); }, // filled in the background by the loader
  poster: yt ? `https://i.ytimg.com/vi/${yt}/maxresdefault.jpg` : pick(window.PV, path),
  hay: haystack(title, artist, slug),
}));


// Find a file's entry even when its name on the Disk carries stray invisible characters
function loose(s) { return s.normalize('NFC').toLowerCase().replace(/[^a-zа-яё0-9/]/g, ''); }
function pick(o, p) {
  o = o || {};
  const exact = o[p.normalize('NFC')];
  if (exact) return exact;
  const l = loose(p);
  for (const k in o) if (loose(k) === l) return o[k];
  return '';
}

// sections of the wall, in this order
const CATS = ['Selected', 'Music video', 'Commercial', 'TV', 'Film', 'Fashion', 'Reels'];
function catOf(s) {
  if (s === 'major-grom') return 'Selected';
  if (s === 'patsanki') return 'TV';
  if (s === 'nurlandos') return 'Film';
  if (/^reel-/.test(s)) return 'Reels';
  if (['betboom', 'rostics', 'sber', 'yandex-pay', 'yota'].includes(s)) return 'Commercial';
  if (['amazing-red', 'amazing-red-ghost', 'ostin', 'outlaw', 'usl', 'dear-passengers', 'vending-machine'].includes(s)) return 'Fashion';
  return 'Music video';
}

// Credits ("титры"): works listed here get a Credits button in the player.
// rows are [role, names]; foot is the closing line.
const CREDITS = {
  'platina-bro': {
    rows: [['Directed by', 'Октябрь'], ['DP', 'Никита Вильчинский'], ['B-cam', 'Igor Salcov'], ['Edit', 'Октябрь, menyazovytaik, Nikita Krivicky']],
    foot: 'РНБ КЛУБ 2025',
  },
  'neo': {
    rows: [['Directed by', 'Октябрь'], ['DOP', 'Никита Вильчинский'], ['Edit', 'Октябрь, Nikita Krivicky (Buddyski Brothers), menyazovytaik'], ['VFX', 'Октябрь, veis_design']],
    foot: 'РНБ КЛУБ 2025',
  },
};

// Search understands Cyrillic: artists get their Russian spelling as an alias, and a Cyrillic
// query is also tried transliterated ("зажигалки" finds Zazhigalki). Accents are ignored.
function haystack(title, artist, slug) {
  const ALIASES = {
    'платина': 'platina', 'egor kreed': 'егор крид', 'plohoyparen': 'плохой парень плохойпарень', 'dora': 'дора',
    'poshlaya molly': 'пошлая молли', 'husky': 'хаски', 'madk1d': 'мэдкид медкид madkid', 'kai angel': 'кай энджел кай ангел',
    'mirele': 'мирэль мирель', 'slava marlow': 'слава марлоу', 'gavrilina': 'гаврилина', 'malbek': 'мальбэк мальбек',
    'hofmannita': 'хофманнита', 'instasamka': 'инстасамка', 'toxi$': 'токсис toxis', 'lildrughill': 'лилдрагхилл',
    'seemee': 'сими', 'mayot': 'майот', 'morgenshtern': 'моргенштерн', 'arut': 'арут', 'eldzhey': 'элджей',
    'og buda': 'ог буда', 'pasha technique': 'паша техник', 'nurlandos': 'нурландос', '9mice': 'найнмайс',
    'tyomny prints': 'темный принц', 'aarne': 'аарне', 'bushido zho': 'бушидо жо', 'anikv': 'аникв',
    'artik & asti': 'артик асти', 'mona': 'мона', 'maybe baby': 'мэйби бэйби', 'mediafootball': 'медиафутбол',
  };
  const base = fold(title + ' ' + artist + ' ' + slug);
  let hay = base;
  for (const k in ALIASES) if (base.includes(fold(k))) hay += ' ' + fold(ALIASES[k]);
  return hay;
}
// lower case without accents: è→e, and also ё→е, й→и, so both sides of a search compare alike
function fold(t) { return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').normalize('NFC'); }
const TRANSLIT = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya' };
const normQuery = q => fold(q.trim()).replace(/\s+/g, ' ');
function matcher(q) {
  const lat = q.replace(/[а-я]/g, c => TRANSLIT[c] ?? c);
  return lat === q ? w => w.hay.includes(q) : w => w.hay.includes(q) || w.hay.includes(lat);
}

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};
// The system's "reduce motion / animation effects off" switch is not followed for the wall: on
// Windows it is routinely off for speed, and obeying it left visitors with frozen previews and
// flat titles that looked like a broken site. Only the blast (flashes, tumbling) still respects it.
const reduced = false;
const calmBlast = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = matchMedia('(hover: hover)').matches;
// WebKit (Safari, and every browser on iPhone): a few 3D text effects need a fallback there
if ('GestureEvent' in window) document.documentElement.classList.add('safari');
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};

$$('.js-year').forEach(n => (n.textContent = new Date().getFullYear()));

/* ───────── Lite mode ─────────
   On weak hardware, with data saver on, or when frames start dropping while scrolling,
   the expensive decoration is switched off: refraction filters, the video backdrop,
   blur behind captions. The layout and every function stay the same. */
const lowEnd = !!navigator.connection?.saveData
  || (navigator.deviceMemory > 0 && navigator.deviceMemory <= 2)
  || (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2);
let lite = false;
function goLite() {
  if (lite) return;
  lite = true;
  document.documentElement.classList.add('lite');
  for (const n of $$('[data-liquid]')) n.style.backdropFilter = '';
  for (const v of $$('.ambient__v')) { v.pause(); v.removeAttribute('src'); v.load(); }
}
// Phones and tablets always get the light version: mobile browsers stutter on the heavy glass,
// the video backdrop and the per-frame scroll effects, and a steady wall matters more there.
// Computers always get the full version.
if (!canHover) goLite();
// (an earlier build remembered slow computers and served them the light version: forget that)
try { localStorage.removeItem('lite'); } catch {}

/* ───────── Ambient backdrop ───────── */
const amb = $$('.ambient__v');
let ambOn = 0, ambSrc = '', ambTimer;
let hovering = false; // a card is under the pointer
// With a mouse the backdrop is only visible under a hovered work, so it is only loaded and
// played then; at rest nothing is decoded or blurred behind the wall.
const ambientIdle = () => canHover && !hovering;
let ambPause;
function ambientWake(on) {
  clearTimeout(ambPause);
  if (lite || !canHover) return;
  if (on) { if (amb[ambOn].getAttribute('src')) amb[ambOn].play().catch(() => {}); }
  else ambPause = setTimeout(() => { if (ambientIdle()) for (const v of amb) v.pause(); }, 1300); // after the fade-out
}
function setAmbient(src, delay = 140) {
  if (lite || ambientIdle()) return;
  clearTimeout(ambTimer);
  ambTimer = setTimeout(() => {
    if (lite || ambientIdle()) return;
    if (src === ambSrc) { ambientWake(true); return; }
    ambSrc = src;
    const next = amb[1 - ambOn], prev = amb[ambOn];
    next.src = src;
    next.onloadeddata = () => {
      if (ambSrc !== src) return;
      next.classList.add('is-on');
      prev.classList.remove('is-on');
      prev.pause();
      ambOn = 1 - ambOn;
    };
    next.play().catch(() => {});
  }, delay);
}

/* ───────── Feed: infinite, with videos loaded only near the viewport ───────── */
const grid = $('#grid');
const sentinel = $('.sentinel');
const visible = new Set();
const centred = new Set(); // touch: cards crossing the middle line of the screen
const titles = [];         // big-title elements (one with a mouse, one per labelled card on touch)
let locked = false;   // a modal is open → previews stay paused

const play = v => { if (!locked && !reduced && !document.hidden) v.play().catch(() => {}); };

/* Preview loading goes through a short queue. Asking the CDN for every nearby preview at
   once (two dozen requests on a fresh page) made some of them stall or fail and left the
   visible cards waiting behind the invisible ones. Now at most MAX_LOADS run together,
   cards on screen go first, and a card that scrolls into view never waits at all. */
const MAX_LOADS = lowEnd ? 2 : canHover ? 3 : 2;
const waiting = new Set();
let loading = 0;
function startLoad(card) {
  const v = card.firstElementChild;
  waiting.delete(card);
  if (v.getAttribute('src')) return;
  // its direct link is still being fetched: the poster holds the card, try again shortly
  if (!WORKS[card.dataset.i].src) { setTimeout(() => card.isConnected && startLoad(card), 700); return; }
  v._slot = true;
  loading++;
  // a stalled request must not hold its slot for ever
  v._slotTimer = setTimeout(() => freeSlot(v), 8000);
  v.src = WORKS[card.dataset.i].src + '#t=0.1';
}
function freeSlot(v) {
  if (!v._slot) return;
  v._slot = false;
  clearTimeout(v._slotTimer);
  loading--;
  pump();
}
function pump() {
  while (loading < MAX_LOADS && waiting.size) {
    let next;
    for (const c of waiting) if (visible.has(c)) { next = c; break; }
    startLoad(next ?? waiting.values().next().value);
  }
}
function unload(card) {
  if (!card.classList.contains('card')) return; // section headings
  const v = card.firstElementChild;
  waiting.delete(card);
  freeSlot(v);
  if (!v.getAttribute('src')) return;
  v.pause();
  v.removeAttribute('src');
  v.load();
  v.classList.remove('is-ready');
}

// Load a preview when its card gets close, drop it again when it is far away,
// so memory stays flat no matter how long the feed gets.
const near = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (!e.isIntersecting) unload(e.target);
    else if (!e.target.firstElementChild.getAttribute('src')) waiting.add(e.target);
  }
  pump();
}, { rootMargin: lowEnd ? '350px 0px' : canHover ? '900px 0px' : '350px 0px' });

const onScreen = new IntersectionObserver(entries => {
  for (const e of entries) {
    const v = e.target.firstElementChild;
    if (e.isIntersecting) {
      visible.add(e.target);
      e.target.classList.add('is-in', 'is-vis');
      if (waiting.has(e.target)) startLoad(e.target); // on screen: load now, queue or not
      play(v);
    } else {
      visible.delete(e.target);
      e.target.classList.remove('is-vis');
      v.pause();
      for (const p of ['--sk', '--gx', '--gy']) e.target.style.removeProperty(p);
      e.target._sk = '';
    }
  }
  if (!canHover) syncCentre();
}, { threshold: 0.1 });

// On touch devices the backdrop takes its colour from the card in the middle of the screen
const center = canHover ? null : new IntersectionObserver(entries => {
  // every card on the middle line is tracked (two or three stand side by side on a tablet),
  // and leaving the line counts too: before, the last card reported simply won, which was
  // always the right-hand column
  for (const e of entries) e.isIntersecting ? centred.add(e.target) : centred.delete(e.target);
  syncCentre();
}, { rootMargin: '-48% 0px -48% 0px' });

function makeCard(i, feature) {
  const w = WORKS[i];
  const a = el('a', feature ? 'card card--feature' : w.cat === 'Reels' ? 'card card--reel' : 'card');
  a.href = '#' + w.slug;
  a.dataset.i = i;
  a.setAttribute('aria-label', `${w.title} — ${w.artist}`);
  const v = el('video');
  if (w.poster) { v.poster = w.poster; v.classList.add('is-ready'); }
  let tries = 0;
  v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'metadata';
  v.disablePictureInPicture = true;
  v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
  v.addEventListener('loadeddata', () => {
    tries = 0;
    freeSlot(v);
    v.classList.add('is-ready');
    if (visible.has(a)) play(v);
  });
  // some mobile browsers only deliver a frame once playback really starts
  v.addEventListener('playing', () => v.classList.add('is-ready'));
  // retry with a growing pause if a preview fails mid-flight (e.g. cut by fast scrolling)
  v.addEventListener('error', () => {
    freeSlot(v); // the retry below runs outside the queue
    if (tries >= 4 || !v.getAttribute('src')) return;
    setTimeout(() => { if (v.getAttribute('src')) v.load(); }, 600 * 2 ** tries++);
  });
  a.append(v);
  near.observe(a); onScreen.observe(a); center?.observe(a);
  return a;
}

// Every round is shuffled, so each visit (and each loop) opens with different works
// Where two rounds meet, the same work must never show up twice on one screen:
// the first SPACING works of a round can't be any of the last SPACING of the previous one,
// so repeats are always at least SPACING + 1 cards (4+ rows) apart.
const SPACING = 15;
// A round has to end on a full row in both the 2- and the 3-column wall, or a hole is left where
// the next round's big card cannot fit. The feature card takes 4 cells; if the works don't make
// the total a multiple of 6, a few from the middle of the round are shown once more at its end.
const PAD = (6 - (WORKS.length + 3) % 6) % 6;
const ROUND = WORKS.length + PAD;
let recent = [];
function shuffled() {
  const order = WORKS.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const blocked = new Set(recent);
  let spare = SPACING;
  for (let i = 0; i < SPACING; i++) {
    if (!blocked.has(order[i])) continue;
    while (blocked.has(order[spare])) spare++;
    [order[i], order[spare]] = [order[spare], order[i]];
    spare++;
  }
  recent = order.slice(-SPACING);
  return order;
}

// sobersasha: one ordered wall, split into sections with a heading each (no endless loop)
let laid = [];
function appendBatch() {
  if (grid.children.length) return laid;
  const frag = document.createDocumentFragment();
  laid = [];
  const of = c => WORKS.map((w, i) => i).filter(i => WORKS[i].cat === c);
  for (const c of CATS) {
    // TV and Film sit side by side: both headings first, then both cards (grid columns pair them up)
    if (c === 'Film') continue;
    if (c === 'TV') {
      const pair = [['TV', 'tv series', 'a'], ['Film', 'short movie', 'b']];
      for (const [, label, s] of pair) frag.append(el('h2', 'sect sect--' + s, label));
      for (const [cat, , s] of pair) for (const i of of(cat)) {
        const card = makeCard(i, false);
        card.classList.add('card--' + s);
        frag.append(card); laid.push(i);
      }
      continue;
    }
    const idx = of(c);
    if (!idx.length) continue;
    frag.append(el('h2', 'sect', c));
    idx.forEach(i => { frag.append(makeCard(i, c === 'Selected')); laid.push(i); });
  }
  // about: the closing section of the wall
  const about = el('div', 'about');
  about.id = 'about';
  about.innerHTML = '<p>Саша Пьяных (sobersasha) — режиссёр и креативный директор из Москвы, бывший участник дуэта «Мальбэк». Начинал с музыки, а потом перенёс её ощущение в кадр.</p>'
    + '<p>Один из ключевых клипмейкеров российской музыкальной индустрии последних лет, номинант Forbes «30 до 30» 2024 года в категории «Музыка».</p>'
    + '<p>Клипы для INSTASAMKA, Aarne, Slava Marlow, Seemee и Mayot, реклама для Сбера, Яндекса, Rostic’s, Yota и BetBoom, fashion-проекты и сериал «Майор Гром: Игра против правил».</p>'
    + '<p>Отвечает за идею и смысл: пишет тритмент, собирает референсы и выстраивает концепцию.</p>'
    + '<p class="about__links"><a href="https://t.me/toosobersasha" target="_blank" rel="noopener">Telegram-канал ↗</a><a href="https://t.me/ew_an_den" target="_blank" rel="noopener">Агент ↗</a><a href="https://www.kinopoisk.ru/name/10218400/" target="_blank" rel="noopener">Кинопоиск ↗</a><a href="https://www.imdb.com/name/nm17260577/" target="_blank" rel="noopener">IMDb ↗</a></p>';
  frag.append(el('h2', 'sect', 'about'), about);
  grid.append(frag);
  return laid;
}

// Keep the page bounded: once more than KEEP rounds are laid out, the oldest one — by then
// several screens above — is taken away. Browsers with scroll anchoring hold the view still
// on their own; the measured correction covers any that shift. Without anchoring (older
// Safari) nothing is removed: a jump mid-swipe would be worse than a longer page.
const KEEP = 4;
const anchors = !!window.CSS?.supports?.('overflow-anchor', 'auto');
function prune() {
  if (!anchors) return;
  while (grid.children.length > ROUND * KEEP) {
    const endOfOldest = grid.children[ROUND - 1];
    if (endOfOldest.getBoundingClientRect().bottom > -innerHeight) return; // still too close
    const mark = visible.values().next().value;
    const before = mark?.getBoundingClientRect().top;
    for (let k = 0; k < ROUND; k++) {
      const c = grid.firstElementChild, v = c.firstElementChild;
      near.unobserve(c); onScreen.unobserve(c); center?.unobserve(c);
      visible.delete(c); centred.delete(c);
      unload(c);
      c.remove();
    }
    if (mark?.isConnected) {
      const shift = mark.getBoundingClientRect().top - before;
      if (Math.abs(shift) > 1) scrollBy({ top: shift, behavior: 'instant' });
    }
  }
}

// The loop: whenever the end gets close, lay down another round (not while searching)
let query = '';
new IntersectionObserver(([e]) => {
  if (e.isIntersecting && !query) appendBatch();
}, { rootMargin: '1400px 0px' }).observe(sentinel);

setAmbient(WORKS[appendBatch()[0]].src, 0);

const resume = () => { for (const c of visible) play(c.firstElementChild); };
document.addEventListener('visibilitychange', () => {
  if (document.hidden) for (const c of visible) c.firstElementChild.pause();
  else resume();
});
// back/forward cache restores the page frozen — start the previews again
addEventListener('pageshow', e => { if (e.persisted) resume(); });
// if autoplay was refused (e.g. iPhone Low Power Mode), the first touch is allowed to start it
addEventListener('pointerdown', resume, { once: true, passive: true });

/* --------- Toast (a small glass piece) --------- */
const toastEl = $('.toast');
let toastTimer;
function toast(text) {
  toastEl.textContent = text;
  toastEl.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 1700);
}
/* --------- Search (lives in the bottom bar) --------- */
const dock = $('.dock');
// with a mouse the field in the dock; on touch a plain bar of its own at the top of the screen
const msearch = $('.msearch');
const search = canHover ? $('.search input') : $('input', msearch);

// Searching lays out one card per work once, then every keystroke only hides and shows them:
// nothing is rebuilt and the previews that stay on screen keep playing.
let searching = false;
let clearHover = () => {}; // set where the hover effects live; the wall calls it when it is rebuilt
function resetFeed() {
  clearHover();
  near.disconnect(); onScreen.disconnect(); center?.disconnect();
  visible.clear(); centred.clear();
  // let go of the previews that are still loading, or they keep downloading off-page
  for (const c of grid.children) unload(c);
  grid.replaceChildren();
}
function renderFeed() {
  document.documentElement.classList.toggle('searching', !!query);
  if (!query) {
    searching = false;
    resetFeed();
    scrollTo({ top: 0, behavior: 'instant' });
    appendBatch();
    return;
  }
  if (!searching) {
    searching = true;
    resetFeed();
    const frag = document.createDocumentFragment();
    WORKS.forEach((_, i) => frag.append(makeCard(i, false)));
    grid.append(frag);
  }
  const hit = matcher(query);
  let n = 0;
  for (const c of grid.children) {
    const ok = hit(WORKS[c.dataset.i]);
    if (c.hidden === ok) c.hidden = !ok;
    n += ok;
  }
  relayout(); // the cards that stay have moved: their titles go with them, the hidden ones lose theirs
  if (scrollY) scrollTo({ top: 0, behavior: 'instant' });
}

// The search lives in the address too (?q=kreed), so a filtered wall can be shared as a link
function applySearch() {
  const q = normQuery(search.value);
  search.parentElement.classList.toggle('has-value', !!search.value);
  if (!canHover && q) openSearchBar(false); // a search from a link (?q=…) shows its bar too
  if (q === query) return;
  query = q;
  history.replaceState(null, '', (q ? '?q=' + encodeURIComponent(q) : location.pathname) + location.hash);
  renderFeed();
}
let searchTimer;
search.addEventListener('keydown', e => { if (e.key === 'Enter') { clearTimeout(searchTimer); applySearch(); search.blur(); } });
search.addEventListener('input', () => {
  clearTimeout(searchTimer);
  // a phone waits a little longer after the last key: filtering re-lays the wall out
  searchTimer = setTimeout(applySearch, canHover ? 90 : 220);
});
// Touch: the bar. Opened by the search button in the dock, closed by its cross (which also
// clears the search) or by leaving the field empty.
function openSearchBar(focus = true) {
  msearch.hidden = false;
  document.documentElement.classList.add('msearch-open');
  if (focus) search.focus({ preventScroll: true });
}
function closeSearchBar() {
  msearch.hidden = true;
  document.documentElement.classList.remove('msearch-open');
}
if (!canHover) {
  $('.search').addEventListener('click', e => { e.preventDefault(); openSearchBar(); });
  $('.msearch__close').addEventListener('click', () => { search.blur(); if (search.value) setSearch(''); closeSearchBar(); });
  search.addEventListener('blur', () => { if (!search.value) closeSearchBar(); });
}
function setSearch(text) {
  clearTimeout(searchTimer);
  search.value = text;
  applySearch();
}
{
  const q = new URLSearchParams(location.search).get('q');
  if (q) setSearch(q.slice(0, 80));
}

/* ───────── Big title ───────── */
/* Big title: the wall carries no captions. A work gets its name set as big as the frame
   allows, with the artist small in the corner: the card under the pointer with a mouse; on
   touch, every card on the middle line of the screen (and every result while searching).
   Each title is one element laid over its card; it is re-placed whenever the wall changes
   shape, so it can never be left behind where its card used to be. */
// with a mouse the word has volume: a stack of copies behind the face (see .ht__3d in the CSS)
// (a dozen layers under a mouse; six on touch, where the word is a block of clear glass that sways by itself)
const DEPTH = lite || !canHover ? 0 : 12;
function makeTitle() {
  const t = { ht: el('div', 'ht'), artist: el('span', 'ht__artist'), title: el('span', 'ht__title'), face: el('span', 'ht__face'), sides: [], card: null };
  const body = el('span', 'ht__3d');
  for (let k = DEPTH; k >= 1; k--) {
    const s = el('span', k === DEPTH ? 'ht__side ht__side--shadow' : 'ht__side');
    s.style.setProperty('--k', k);
    t.sides.push(s);
    body.append(s);
  }
  body.append(t.face);
  t.title.append(body);
  t.ht.setAttribute('aria-hidden', 'true');
  t.ht.append(t.artist, t.title);
  grid.after(t.ht);
  titles.push(t);
  return t;
}
makeTitle(); // titles[0]: the one that follows the mouse
/* The title is lit like a solid piece of glass: an SVG lighting filter treats the letters
   as a rounded relief and puts a point light over them. The light sits where the pointer
   is, so the highlights slide along the edges of the glyphs as it moves. */
const NSG = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs) => { const n = document.createElementNS(NSG, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };
const gt = sv('filter', { id: 'gt', x: '-12%', y: '-30%', width: '124%', height: '160%', 'color-interpolation-filters': 'sRGB' });
const gtBlur = sv('feGaussianBlur', { in: 'SourceAlpha', stdDeviation: 3, result: 'relief' });
const gtSpec = sv('feSpecularLighting', { in: 'relief', surfaceScale: 7, specularConstant: 1.3, specularExponent: 24, 'lighting-color': '#ffffff', result: 'spec' });
const gtLight = sv('fePointLight', { x: 0, y: 0, z: 120 });
gtSpec.append(gtLight);
const gtShade = sv('feGaussianBlur', { in: 'SourceAlpha', stdDeviation: 8, result: 'sh0' });
const gtMerge = sv('feMerge', {});
// The bright rim is drawn here, from the outer silhouette of the word. A CSS text stroke
// traces every contour inside a glyph as well (the crossbar of an A is its own shape in
// this font), which showed up as stray lines across the letters.
const gtFat = sv('feMorphology', { in: 'SourceAlpha', operator: 'dilate', radius: 1.5, result: 'fat' });
// (no drop shadow under the word: only the rim, the letters and the glint are drawn)
gtMerge.append(sv('feMergeNode', { in: 'rim' }), sv('feMergeNode', { in: 'SourceGraphic' }), sv('feMergeNode', { in: 'glint' }));
gt.append(
  gtBlur, gtSpec,
  sv('feComposite', { in: 'spec', in2: 'SourceAlpha', operator: 'in', result: 'glint' }),
  gtFat,
  sv('feComposite', { in: 'fat', in2: 'SourceAlpha', operator: 'out', result: 'ring' }),
  sv('feColorMatrix', { in: 'ring', type: 'matrix', values: '0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 0', result: 'rim' }),
  gtShade,
  sv('feOffset', { in: 'sh0', dy: 6, result: 'sh1' }),
  sv('feColorMatrix', { in: 'sh1', type: 'matrix', values: '0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0', result: 'shadow' }),
  gtMerge,
);
$('#liquid-defs').append(gt);
const mctx = document.createElement('canvas').getContext('2d');
const widths = new Map(); // width of each title at 100px, measured once
let lightX = -99, lightY = -99;
const EDGE = canHover ? 22 : 10; // px kept free at the screen edge
const SPILL = canHover ? 1.07 : 0.86; // with a mouse the word is a touch wider than its frame; on touch, where neighbours are titled too, it stays inside
const fitRange = document.createRange();
// size and position one title over its card
function place(t) {
  const card = t.card;
  const w = WORKS[card.dataset.i];
  const W = card.offsetWidth, H = card.offsetHeight;
  if (!W || !H) return;
  // "Malo 2.0 (ft. …)" → the name goes big, the bracketed part joins the small line
  const [, name, extra = ''] = w.title.match(/^(.*?)\s*[([](.*?)[)\]]?\s*$/) || [0, w.title];
  const text = name.toLowerCase(); // measured the way it is shown: in lowercase
  if (!widths.has(text)) {
    mctx.font = `800 100px ${getComputedStyle(document.body).fontFamily}`;
    widths.set(text, Math.max(1, mctx.measureText(text).width - 1.2 * text.length)); // -.012em tracking
  }
  const per = widths.get(text) / 100;          // text width per 1px of font size
  // never wider than the screen allows: for a card at the edge the word is limited to the
  // room left beside it (minus the title's drift)
  const box = card.getBoundingClientRect();
  const centre = box.left + W / 2, vw = document.documentElement.clientWidth;
  // tall reels keep the word inside the card and centred in it
  const reel = card.classList.contains('card--reel');
  const room = reel ? W * 0.88 : Math.max(W * 0.6, Math.min(W * SPILL, 2 * (Math.min(centre, vw - centre) - EDGE)));
  let size = room / per;                       // one line
  const wrap = size < H * (reel ? 0.09 : 0.2); // too long for one line: several lines instead
  if (wrap) {
    size = Math.max(H * 0.1, Math.min(H * 0.2, Math.sqrt((room * H * 0.62) / (per * 0.9))));
    // the longest word still has to fit on its own line
    const longest = text.split(/\s+/).reduce((a, b) => (b.length > a.length ? b : a), '');
    mctx.font = `800 100px ${getComputedStyle(document.body).fontFamily}`;
    const perL = Math.max(1, mctx.measureText(longest).width - 1.2 * longest.length) / 100;
    size = Math.min(size, (room * 0.96) / perL);
  }
  size = Math.min(size, H * (reel ? 0.3 : 0.62));
  const { ht, title, face, artist } = t;
  ht.classList.toggle('is-reel', reel);
  title.style.left = title.style.right = ((W - room) / 2).toFixed(1) + 'px';
  ht.classList.toggle('is-wrap', wrap);
  ht.style.left = card.offsetLeft + 'px';
  ht.style.top = card.offsetTop + 'px';
  ht.style.width = W + 'px';
  ht.style.height = H + 'px';
  title.style.fontSize = size.toFixed(1) + 'px';
  // phones keep the plain glass lettering: the lighting filter is for a moving pointer
  const lit = t === titles[0] && canHover && !lite;
  if (lit) {
    // the relief and the light scale with the letters; until the pointer moves, light from top left
    gtBlur.setAttribute('stdDeviation', Math.max(1.2, size * 0.022).toFixed(2));
    gtSpec.setAttribute('surfaceScale', Math.max(3, size * 0.06).toFixed(1));
    gtShade.setAttribute('stdDeviation', Math.max(3, size * 0.06).toFixed(1));
    gtFat.setAttribute('radius', Math.max(1, size * 0.011).toFixed(2));
    gtLight.setAttribute('z', Math.max(60, size * 1.1).toFixed(0));
    if (lightX < 0) {
      gtLight.setAttribute('x', (W * 0.25).toFixed(0));
      gtLight.setAttribute('y', (-size * 0.3).toFixed(0));
    }
  }
  face.style.filter = lit ? 'url(#gt)' : '';
  if (face.textContent !== name) { face.textContent = name; for (const s of t.sides) s.textContent = name; }
  const small = extra ? `${w.artist} · ${extra}` : w.artist;
  if (artist.textContent !== small) artist.textContent = small;
  // the estimate is made before the web font is certain to be in; if the real word came out
  // wider than its box, it is scaled back to fit (the lighting filter would cut it otherwise)
  if (!wrap) {
    fitRange.selectNodeContents(face);
    const real = fitRange.getBoundingClientRect().width;
    if (real > room + 1) {
      size *= room / real;
      title.style.fontSize = size.toFixed(1) + 'px';
      widths.delete(text); // measured too early: measure again next time
    }
  }
}
function setTitle(t, card) {
  if (t.card === card) { if (card) place(t); return; }
  t.ht.classList.remove('is-on');
  t.card = card;
  if (!card) return;
  place(t);
  t.ht.offsetWidth; // restart the entrance
  t.ht.classList.add('is-on');
}
const showTitle = card => { lightX = lightY = -99; setTitle(titles[0], card); };
const clearTitles = () => { for (const t of titles) setTitle(t, null); };
// the wall changed shape (search filter, rotation, a new round, the web font arriving):
// every title follows its card, and a card that is gone or hidden loses its title
function relayout() {
  for (const t of titles) {
    if (!t.card) continue;
    if (!t.card.isConnected || t.card.hidden) setTitle(t, null);
    else place(t);
  }
}
new ResizeObserver(relayout).observe(grid);
addEventListener('resize', relayout, { passive: true });
document.fonts?.addEventListener?.('loadingdone', () => { widths.clear(); relayout(); });

/* Touch: which cards carry a title. Normally the ones on the middle line of the screen (the
   whole row on a tablet); if nothing is on the line — a short list of search results, a gap
   between rows — the row nearest to it. While searching, every result on screen is named. */
const MAX_TITLES = 9;
let tapped = null; // touch: the preview whose title is showing
// Touch: the first tap on a preview shows its name, the second one opens it. (While searching
// every result is already named, so a tap opens at once.)
if (!canHover) grid.addEventListener('click', e => {
  const card = e.target.closest?.('.card');
  if (!card || titles.some(t => t.card === card)) return;
  e.preventDefault();
  e.stopPropagation(); // the tap stops here: the handler that opens the player never sees it
  tapped = card;
  syncCentre();
}, true);
function syncCentre() {
  // with a mouse titles follow the pointer; during the blast the flying cards must not
  // re-title themselves or wake the backdrop video
  if (canHover || document.documentElement.classList.contains('boomed')) return;
  const live = c => c.isConnected && !c.hidden;
  const onLine = [...centred].filter(live);
  const lead = onLine[0];
  let picks;
  if (searching) picks = [...visible].filter(live);
  // otherwise only the preview that was tapped is named, for as long as it stays on screen
  else picks = tapped && live(tapped) && visible.has(tapped) ? [tapped] : (tapped = null, []);
  picks = picks.slice(0, MAX_TITLES);
  for (const t of titles) if (t.card && !picks.includes(t.card)) setTitle(t, null);
  for (const c of picks) {
    if (titles.some(t => t.card === c)) continue;
    setTitle(titles.find(t => !t.card) ?? makeTitle(), c);
  }
  // the backdrop takes its colour from a card on the middle line
  const tone = lead ?? picks[0];
  if (tone) setAmbient(WORKS[tone.dataset.i].src, 250);
}
// on a phone a rebuilt wall (search, reset) simply drops the titles; the mouse section replaces this
clearHover = clearTitles;

/* ───────── Pointer: highlight, tilt, ambient, lens — one rAF-throttled handler ───────── */
const lens = $('.lens');
const BASE_TITLE = document.title;
let current = -1;     // index of the work open in the player, -1 when closed
if (canHover) {
  let ev = null, queued = false, lit = null;
  let lx = innerWidth / 2, ly = innerHeight / 2, tx = lx, ty = ly, lensRaf = 0;

  // three beads of glass trail behind the lens (plain gradients, moved by transform only)
  const beads = reduced || lite ? [] : [[15, .34, .8], [10, .3, .6], [6, .26, .45]].map(([d, k, o]) => {
    const b = el('i', 'bead');
    b.style.setProperty('--d', d + 'px'); b.style.setProperty('--o', o);
    b.setAttribute('aria-hidden', 'true');
    return { el: b, k, x: innerWidth / 2, y: innerHeight / 2 };
  });
  lens.after(...beads.map(b => b.el));
  // magnet: the glass button under the pointer leans towards it
  let mag = null;
  const unmag = () => { if (mag) { mag.style.translate = ''; mag.classList.remove('is-mag'); mag = null; } };

  // the lens is a drop of glass: it stretches along its way and settles round again
  const lensTick = () => {
    const vx = tx - lx, vy = ty - ly;
    lx += vx * 0.22; ly += vy * 0.22;
    const s = Math.min(Math.hypot(vx, vy) * 0.006, 0.38);
    const a = s > 0.01 ? Math.atan2(vy, vx) : 0;
    lens.style.setProperty('--a', a.toFixed(3) + 'rad');
    // the light hangs over the top of the screen: the glint slides round the lens as it travels
    lens.style.setProperty('--hx', (72 - (lx / innerWidth) * 44).toFixed(1) + '%');
    lens.style.setProperty('--hy', (16 + (ly / innerHeight) * 34).toFixed(1) + '%');
    lens.style.transform = `translate3d(${lx}px, ${ly}px, 0) rotate(${a.toFixed(3)}rad) scale(${(1 + s).toFixed(3)}, ${(1 - s * 0.55).toFixed(3)})`;
    // the beads: each one chases the one before it, a little slower
    let px = lx, py = ly, far = 0;
    for (const b of beads) {
      b.x += (px - b.x) * b.k; b.y += (py - b.y) * b.k;
      far += Math.abs(px - b.x) + Math.abs(py - b.y);
      b.el.style.transform = `translate3d(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px, 0)`;
      px = b.x; py = b.y;
    }
    lensRaf = Math.abs(tx - lx) + Math.abs(ty - ly) + far > 0.6 ? requestAnimationFrame(lensTick) : 0;
  };

  /* Glow: a tiny live copy of the hovered preview, blown up and blurred behind its card,
     so the picture spills its own light onto the wall around it. */
  const glow = el('canvas', 'glow');
  glow.width = 32; glow.height = 18;
  glow.setAttribute('aria-hidden', 'true');
  grid.before(glow);
  const gctx = glow.getContext('2d');
  // the dock is tinted by the same picture: a few pixels of it stretched across the glass
  const tint = el('canvas', 'dock__tint');
  tint.width = 6; tint.height = 2;
  tint.setAttribute('aria-hidden', 'true');
  dock.prepend(tint);
  const tctx = tint.getContext('2d');
  let glowCard = null, glowRaf = 0, glowN = 0;
  const glowTick = () => {
    glowRaf = 0;
    if (!glowCard?.isConnected || locked || lite) { glowCard = null; glow.classList.remove('is-on'); return; }
    if (glowN++ % 3 === 0) {
      const v = glowCard.firstElementChild;
      glow.style.left = glowCard.offsetLeft + 'px';
      glow.style.top = glowCard.offsetTop + 'px';
      glow.style.width = glowCard.offsetWidth + 'px';
      glow.style.height = glowCard.offsetHeight + 'px';
      if (v.readyState >= 2) { try { gctx.drawImage(v, 0, 0, 32, 18); tctx.drawImage(glow, 0, 0, 6, 2); glow.classList.add('is-on'); } catch {} }
    }
    glowRaf = requestAnimationFrame(glowTick);
  };
  const setGlow = card => {
    document.documentElement.classList.toggle('is-hovering', !!card);
    showTitle(card);
    ambientWake(!!card);
    if (reduced || lite) return;
    glowCard = card;
    glow.classList.remove('is-on');
    glowN = 0;
    if (card && !glowRaf) glowRaf = requestAnimationFrame(glowTick);
  };

  // The rest of the wall dims while a card is hovered. A class on the grid, switched only when
  // the pointer goes from cards to elsewhere and back: the old CSS (.grid:has(.card:hover))
  // made the browser restyle every card on the page each time the hovered card changed —
  // which, while scrolling with a wheel, is every few frames.
  let dimmed = false;
  const dim = on => { if (on !== dimmed) { dimmed = on; grid.classList.toggle('is-dim', on); } };
  document.addEventListener('pointerover', e => dim(!!e.target.closest?.('.card')), { passive: true });

  // the card under the pointer is gone (search, reset): drop its title, glow and backdrop
  clearHover = () => { dim(false); if (lit) { lit = null; hovering = false; setGlow(null); lens.classList.remove('is-on'); } };

  const frame = () => {
    queued = false;
    // the caption is glass inside a card: both get the highlight, and the card keeps tilting under it
    const card = ev.target.closest?.('.card');
    for (const t of new Set([ev.target.closest?.('.glass'), card])) {
      if (!t) continue;
      const r = t.getBoundingClientRect();
      const x = ev.clientX - r.left, y = ev.clientY - r.top;
      t.style.setProperty('--mx', x + 'px');
      t.style.setProperty('--my', y + 'px');
      if (t === card) {
        t.style.setProperty('--px', (x / r.width).toFixed(3));
        t.style.setProperty('--py', (y / r.height).toFixed(3));
        // the big title drifts a little against the pointer, so it floats in front of the frame
        titles[0].ht.style.setProperty('--px', (x / r.width).toFixed(3));
        titles[0].ht.style.setProperty('--py', (y / r.height).toFixed(3));
        // re-lighting re-runs the filter over the whole word: only when the pointer really moved
        if (Math.abs(ev.clientX - lightX) + Math.abs(ev.clientY - lightY) >= 3) {
          lightX = ev.clientX; lightY = ev.clientY;
          const tr = titles[0].face.getBoundingClientRect();
          gtLight.setAttribute('x', (lightX - tr.left).toFixed(0));
          gtLight.setAttribute('y', (lightY - tr.top).toFixed(0));
        }
      }
    }
    const m = reduced ? null : ev.target.closest?.('.ibtn, .pill');
    if (m !== mag) { unmag(); mag = m; m?.classList.add('is-mag'); }
    if (m) {
      const r = m.getBoundingClientRect();
      m.style.translate = `${((ev.clientX - r.left - r.width / 2) * 0.24).toFixed(1)}px ${((ev.clientY - r.top - r.height / 2) * 0.32).toFixed(1)}px`;
    }
    hovering = !!card;
    dim(hovering);
    if (card !== lit) {
      setGlow(card);
      if (card) setAmbient(WORKS[card.dataset.i].src);
      // the browser tab names whatever is under the cursor (the open work while the player is up)
      if (current < 0) document.title = card ? `${WORKS[card.dataset.i].title} — ${WORKS[card.dataset.i].artist}`.toLowerCase() : BASE_TITLE;
    }
    lit = card;
    if (reduced) return;
    tx = ev.clientX; ty = ev.clientY;
    const on = hovering && ev.pointerType === 'mouse';
    if (on && !lens.classList.contains('is-on')) { lx = tx; ly = ty; for (const b of beads) { b.x = tx; b.y = ty; } }
    lens.classList.toggle('is-on', on);
    if (!lensRaf) lensRaf = requestAnimationFrame(lensTick);
  };

  document.addEventListener('pointermove', e => {
    ev = e;
    if (!queued) { queued = true; requestAnimationFrame(frame); }
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { unmag(); dim(false); hovering = false; lit = null; setGlow(null); lens.classList.remove('is-on'); });

  /* Dock: one drop of glass slides under whatever is hovered, stretching on the way */
  const blob = $('.dock__blob');
  dock.addEventListener('pointerover', e => {
    const t = e.target.closest('.dock__link, .dock__contact, .search');
    if (!t) return;
    // the open search field is its own highlighted pill: no drop under it
    if (t.matches('.search:focus-within, .search.has-value')) { blob.classList.remove('is-on'); return; }
    if (!blob.classList.contains('is-on')) blob.style.transition = 'opacity .25s'; // appear in place, don't fly in
    blob.style.width = t.offsetWidth + 'px';
    blob.style.transform = `translateX(${t.offsetLeft}px)`;
    blob.offsetWidth;
    blob.style.transition = '';
    blob.classList.add('is-on');
  });
  dock.addEventListener('pointerleave', () => blob.classList.remove('is-on'));
  // the drop was sized to the closed search button; when the field opens it must not stay behind as a circle
  search.addEventListener('focus', () => blob.classList.remove('is-on'));
  search.parentElement.addEventListener('pointerdown', () => blob.classList.remove('is-on'));

  // Fisheye: the dock's items swell towards the pointer, as if seen through a rolling drop
  const dockItems = $$('.dock__link, .dock__contact', dock);
  dock.addEventListener('pointermove', e => {
    for (const n of dockItems) {
      const r = n.getBoundingClientRect();
      const k = Math.max(0, 1 - Math.abs(e.clientX - (r.left + r.width / 2)) / 110);
      n.style.transform = k ? `translateY(${(-3 * k).toFixed(1)}px) scale(${(1 + 0.2 * k).toFixed(3)})` : '';
    }
  }, { passive: true });
  dock.addEventListener('pointerleave', () => { for (const n of dockItems) n.style.transform = ''; });
  addEventListener('scroll', () => lens.classList.remove('is-on'), { passive: true });

  // warm up the YouTube connection the first time a card is hovered
  grid.addEventListener('pointerover', () => {
    for (const href of ['https://www.youtube-nocookie.com', 'https://i.ytimg.com']) {
      const l = el('link'); l.rel = 'preconnect'; l.href = href; document.head.append(l);
    }
  }, { once: true });
}

/* ───────── Glass touches ───────── */
// Ripple: pressing a glass control sends a ring of light out from the point of touch
document.addEventListener('pointerdown', e => {
  lens.classList.add('is-press');
  // a work: a ring of light runs across its glass from the point of touch (one element, transform only)
  const card = e.target.closest?.('.card');
  if (card && !reduced) {
    const r = card.getBoundingClientRect();
    const s = el('i', 'splash');
    s.style.left = e.clientX - r.left + 'px';
    s.style.top = e.clientY - r.top + 'px';
    s.style.setProperty('--s', (Math.hypot(r.width, r.height) / 20).toFixed(1));
    s.addEventListener('animationend', () => s.remove(), { once: true });
    card.append(s);
  }
  const g = e.target.closest?.('.pill, .ibtn, .dock, .drop');
  if (!g || reduced) return;
  const r = g.getBoundingClientRect();
  g.style.setProperty('--rx', e.clientX - r.left + 'px');
  g.style.setProperty('--ry', e.clientY - r.top + 'px');
  g.style.setProperty('--rs', Math.max(r.width, 90) * 2.2 + 'px');
  g.classList.remove('is-ripple');
  g.offsetWidth; // restart the animation
  g.classList.add('is-ripple');
}, { passive: true });
for (const t of ['pointerup', 'pointercancel']) addEventListener(t, () => lens.classList.remove('is-press'), { passive: true });
document.addEventListener('animationend', e => { if (e.animationName === 'ripple') e.target.classList.remove('is-ripple'); });

// The dock pulls itself in while the wall moves down and opens up again on the way back
{
  let y = scrollY, liquidBack;
  addEventListener('scroll', () => {
    const d = scrollY - y;
    if (Math.abs(d) < 6) return;
    y = scrollY;
    const c = d > 0 && scrollY > 200 && !query;
    if (c === dock.classList.contains('is-compact')) return;
    dock.classList.toggle('is-compact', c);
    // the refraction filter is too heavy to re-run while the dock is changing size:
    // pulled in, the dock is plain frosted glass; opened again, it gets its refraction back
    clearTimeout(liquidBack);
    if (c) dock.style.backdropFilter = '';
    else liquidBack = setTimeout(() => { if (!lite && dock._liquid) dock.style.backdropFilter = dock._liquid; }, 700);
  }, { passive: true });
}

/* ───────── Player ───────── */
const player = $('#player');
const contact = $('#contact');
const pVideo = $('.player__video');
const pEmbed = $('.player__embed');
const pCredits = $('.credits');
const pCreditsBtn = $('.player__credits');
const pTitle = $('#player-title');
const pArtist = $('#player-artist');
const pYt = $('.player__yt');
const pGlow = $('.player__glow');
const YT_ORIGIN = 'https://www.youtube-nocookie.com';
// Russia: YouTube is throttled there, so the same works open from VK Video (v…) or Rutube (r…).
// ?src=vk / ?src=yt in the address forces either one. Works with no entry here stay on YouTube.
const RU_SRC = {"platina-bro":"ra712330138b87085745c9d22279d90eb","neo":"v-176742742_456242472","did-it-first":"v-54460128_456279735","zazhigalki":"v-23482802_456273744","malo":"v-23482802_456273573","karma":"v-23482802_456273486","dora-million":"v-222045875_456241302","angel-vozmi":"v-187734511_456249935","kreed-mona":"v-52756130_456255229","episode3":"v-230130166_456239031","pm-akne":"v-209650666_456241501","haski":"v-59790294_456239795","sukablyat":"v-30101930_456251436","madkid":"v-209650666_456241358","areyouhappy":"v-209650666_456241341","no4noe-cafe":"v-45172096_456273124","slava-maniya":"v-229289182_456239736","lovesong":"v-23180464_456257029","dura":"v-228304492_456246130","uhh":"v-25143234_456255963","active":"v-167449201_456239486","tesno":"v-242993091_456242502","mms":"v-25143234_456255455","tabletka":"v-177514294_456248807","hihihaha":"v-197288437_456243477","telefon":"v-66678575_456357241","za-dengi-da":"v-233211622_456282550","vandal":"v-190579181_456239808","domino":"v-242993091_456243054","windows":"v-177514294_456248241","ne-prada":"v-181515142_456239277","serdce-ypalo-vniz":"v-197288437_456243340","krit":"v-64722546_456239320","serdce-vremya":"v-64722546_456239191","kabluki":"v-166575278_456243309","prostite":"v-53109527_456254406","liza":"v-66243225_456240656","mediafootball":"v-220450433_456239107","spokoistvie":"v-2000081613_74081613","nurlandos":"v-219779099_456246341","ume":"r27a07d272a688c26339adce40baccef4","malbek_hofmannita":"r835b15e151f368af40feeb79f2ac8650"};
for (const k in RU_SRC) if (k !== 'nurlandos') delete RU_SRC[k];
for (const k in CREDITS) delete CREDITS[k];
const RU_ZONES =/^(Europe\/(Moscow|Kaliningrad|Samara|Volgograd|Saratov|Ulyanovsk|Astrakhan|Kirov|Simferopol)|Asia\/(Yekaterinburg|Omsk|Novosibirsk|Barnaul|Tomsk|Novokuznetsk|Krasnoyarsk|Irkutsk|Chita|Yakutsk|Khandyga|Vladivostok|Ust-Nera|Magadan|Sakhalin|Srednekolymsk|Kamchatka|Anadyr))$/;
// The visitor's real country comes from their IP address (so a VPN reads as abroad, where YouTube
// works). The time zone is only the first guess, and the answer if the lookup fails.
let inRussia = false;
{
  const force = new URLSearchParams(location.search).get('src');
  if (force === 'vk') inRussia = true;
  else if (force !== 'yt') {
    try { inRussia = RU_ZONES.test(Intl.DateTimeFormat().resolvedOptions().timeZone); } catch {}
    let seen = '';
    try { seen = sessionStorage.getItem('geo') || ''; } catch {}
    if (seen) inRussia = seen === 'RU';
    else fetch('https://ipwho.is/?fields=country_code', { signal: AbortSignal.timeout?.(5000) })
      .then(r => r.json())
      .then(d => {
        if (!/^[A-Z]{2}$/.test(d?.country_code)) return;
        inRussia = d.country_code === 'RU';
        try { sessionStorage.setItem('geo', d.country_code); } catch {}
      })
      .catch(() => {});
  }
}
function ruEmbed(slug) {
  const id = inRussia && RU_SRC[slug];
  if (!id) return '';
  if (id[0] === 'r') return 'https://rutube.ru/play/embed/' + id.slice(1) + '?autoplay=1';
  const [oid, vid] = id.slice(1).split('_');
  return `https://vkvideo.ru/video_ext.php?oid=${oid}&id=${vid}&hd=2&autoplay=1`;
}
const anyModal = () => player.open || contact.open;

// Credits: a sheet of end titles laid over the video (it keeps playing underneath)
function setCredits(on) {
  on = !!on && !pCreditsBtn.hidden;
  pCredits.classList.toggle('is-on', on);
  pCredits.setAttribute('aria-hidden', String(!on));
  pCreditsBtn.setAttribute('aria-expanded', String(on));
  pCreditsBtn.classList.toggle('is-active', on);
}

function lock() {
  locked = true;
  lens.classList.remove('is-on');
  for (const c of visible) c.firstElementChild.pause();
}
function unlock() {
  if (anyModal()) return; // one sheet closed because another one opened
  locked = false;
  for (const c of visible) play(c.firstElementChild);
}

function show(i, push = true) {
  const from = current;
  current = (i + WORKS.length) % WORKS.length;
  const w = WORKS[current];
  // switching inside the open player: the picture and the title slide over from the side they came from
  if (player.open && from >= 0 && !reduced) {
    const fwd = (current - from + WORKS.length) % WORKS.length <= WORKS.length / 2;
    const frame = pVideo.parentElement;
    frame.style.setProperty('--dir', fwd ? 1 : -1);
    frame.classList.remove('is-swap');
    frame.offsetWidth; // restart the animation
    frame.classList.add('is-swap');
  }
  // the work's own preview, blurred, glows from behind the video and lights the glass bar
  // (a still frame from the middle of it: a moving picture under the glass bar made the bar
  // re-refract on every frame, which is what stuttered under the player)
  if (!lite) {
    pGlow.preload = 'auto';
    pGlow.onloadedmetadata = () => { pGlow.currentTime = (pGlow.duration || 0) * 0.4; };
    pGlow.src = w.src;
  }
  pTitle.textContent = w.title;
  setCredits(false);
  const cr = CREDITS[w.slug];
  pCreditsBtn.hidden = !cr;
  pCredits.replaceChildren();
  if (cr) {
    const dl = el('dl', 'credits__list');
    for (const [role, names] of cr.rows) dl.append(el('dt', '', role), el('dd', '', names));
    pCredits.append(dl, el('p', 'credits__foot', cr.foot));
  }
  // every artist is a button: click it and the wall shows only their works
  pArtist.replaceChildren(...w.artist.split(/(, | & | feat\. )/).map((part, n) => {
    if (n % 2) return part;
    const b = el('button', 'player__artist', part);
    b.dataset.act = 'artist';
    b.title = 'Show all works with ' + part;
    return b;
  }));
  document.title = `${w.title} — ${w.artist}`.toLowerCase();
  pYt.style.display = w.yt ? '' : 'none';
  if (w.yt) pYt.href = 'https://www.youtube.com/watch?v=' + w.yt;
  if (!w.yt) {
    // Yandex Disk file: a plain video element; when it ends, the next work starts
    const fv = el('video');
    fv.src = w.src; fv.controls = true; fv.autoplay = true; fv.playsInline = true;
    fv.style.cssText = 'width:100%;height:100%;background:#000;object-fit:contain';
    fv.addEventListener('ended', () => { if (player.open && !document.fullscreenElement) show(current + 1); });
    pEmbed.replaceChildren(fv);
    setAmbient(w.src, 0);
    if (contact.open) contact.close();
    if (!player.open) { player.showModal(); lock(); }
    if (push && location.hash !== '#' + w.slug) history.pushState(null, '', '#' + w.slug);
    return;
  }
  const f = el('iframe');
  // enablejsapi lets the page hear when the video ends, so the next work can start by itself
  const ru = ruEmbed(w.slug);
  f.src = ru || `${YT_ORIGIN}/embed/${w.yt}?autoplay=1&rel=0&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`;
  if (!ru) f.addEventListener('load', () => {
    try { f.contentWindow.postMessage('{"event":"listening","id":1,"channel":"widget"}', YT_ORIGIN); } catch {}
  });
  f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  f.allowFullscreen = true;
  f.title = `${w.title} — ${w.artist}`;
  f.referrerPolicy = 'strict-origin-when-cross-origin';
  pEmbed.replaceChildren(f);
  setAmbient(w.src, 0);
  if (contact.open) contact.close();
  if (!player.open) { player.showModal(); lock(); }
  if (push && location.hash !== '#' + w.slug) history.pushState(null, '', '#' + w.slug);
}

// Showreel: when a video plays to the end, the next work starts
addEventListener('message', e => {
  if (e.origin !== YT_ORIGIN || current < 0 || e.source !== pEmbed.firstElementChild?.contentWindow) return;
  let d;
  try { d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch { return; }
  if (d?.info?.playerState === 0 && player.open && !document.fullscreenElement) show(current + 1);
});

player.addEventListener('close', () => {
  pEmbed.replaceChildren();
  setCredits(false);
  pVideo.parentElement.classList.remove('is-swap');
  pGlow.pause(); pGlow.removeAttribute('src'); pGlow.load();
  current = -1;
  document.title = BASE_TITLE;
  if (WORKS.some(w => '#' + w.slug === decodeURIComponent(location.hash)))
    history.pushState(null, '', location.pathname + location.search);
  unlock();
});
contact.addEventListener('close', unlock);
// Esc closes the credits first, the player second
player.addEventListener('cancel', e => { if (pCredits.classList.contains('is-on')) { e.preventDefault(); setCredits(false); } });

// Card → player: the clicked preview morphs into the player where View Transitions exist
grid.addEventListener('click', e => {
  const c = e.target.closest('.card');
  if (!c || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  const i = +c.dataset.i;
  if (document.startViewTransition && !reduced) {
    c.style.viewTransitionName = 'work';
    document.startViewTransition(() => { c.style.viewTransitionName = ''; show(i); });
  } else show(i);
});

function flash(btn, text) {
  btn.dataset.label ??= btn.textContent; // remember the real label across repeated clicks
  btn.textContent = text;
  clearTimeout(btn._flash);
  btn._flash = setTimeout(() => (btn.textContent = btn.dataset.label), 1600);
}
async function copy(text, btn, done = 'Copied') {
  try { await navigator.clipboard.writeText(text); flash(btn, done); toast(done); }
  catch { flash(btn, text); } // clipboard blocked → at least show the text itself
}

// One click handler for every action button
document.addEventListener('click', e => {
  const modal = e.target.closest?.('.modal');
  // click on the backdrop; the contact drops float on it, so anything but a drop closes them
  if (modal && (e.target === modal || (modal === contact && !e.target.closest('.drop')))) return modal.close();
  if (e.target.closest?.('[data-open="contact"]')) {
    if (!contact.open) { contact.showModal(); lock(); }
    return;
  }
  const btn = e.target.closest?.('[data-act]');
  if (!btn) return;
  switch (btn.dataset.act) {
    case 'close': btn.closest('.modal').close(); break;
    case 'prev': show(current - 1); break;
    case 'next': show(current + 1); break;
    case 'credits': setCredits(!pCredits.classList.contains('is-on')); break;
    case 'copy':
      // touch devices get the system share sheet, everything else copies the link
      // (the button is an icon: a tick shows for a moment once the link is on the clipboard)
      if (!canHover && navigator.share) {
        const w = WORKS[current];
        navigator.share({ title: `${w.title} — ${w.artist}`, url: location.href }).catch(() => {});
      } else {
        navigator.clipboard?.writeText(location.href).then(() => {
          btn.classList.add('is-done');
          btn.title = 'Link copied';
          toast('link copied');
          clearTimeout(btn._flash);
          btn._flash = setTimeout(() => { btn.classList.remove('is-done'); btn.title = 'Share'; }, 1600);
        }).catch(() => {});
      }
      break;
    case 'artist': {
      const name = btn.textContent;
      player.close();
      setSearch(name);
      break;
    }
    // Mail: the link still opens the mail app; the address is also copied, so the
    // click does something visible even where no mail app is set up
    case 'mail': copy('deals@vilchinski.ru', btn, 'Email copied'); break;
  }
});

// A random work, never the one that is open and not the last few picks either
const picked = [];
function randomWork() {
  let i;
  do i = Math.floor(Math.random() * WORKS.length); while (i === current || picked.includes(i));
  picked.push(i);
  if (picked.length > 12) picked.shift();
  show(i);
}

document.addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (player.open) {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
    if (e.key === 'f' || e.key === 'F' || e.key === 'а' || e.key === 'А') {
      if (document.fullscreenElement) document.exitFullscreen();
      else pVideo.requestFullscreen?.().catch(() => {});
    }
    if (e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К') randomWork();
    if (e.key === 'c' || e.key === 'C' || e.key === 'с' || e.key === 'С') setCredits(!pCredits.classList.contains('is-on'));
    return;
  }
  if (e.key === '/' && !contact.open && document.activeElement !== search) { e.preventDefault(); search.focus(); }
  // R — open a random work
  if ((e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К') && !contact.open && document.activeElement !== search) randomWork();
  if (e.key === 'Escape' && document.activeElement === search) { search.value = ''; search.dispatchEvent(new Event('input')); search.blur(); }
});

// Swipe left/right on the player (outside the video itself) to change work
{
  let sx = 0, sy = 0;
  player.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  player.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1));
  }, { passive: true });
}

function route() {
  const slug = decodeURIComponent(location.hash.slice(1));
  const i = WORKS.findIndex(w => w.slug === slug);
  if (i >= 0) show(i, false);
  else if (player.open) player.close();
}
addEventListener('popstate', route);
route();

/* ───────── Motion extras ───────── */
if (!reduced) {
  /* Scroll inertia: the picture lags inside its frame in proportion to scroll speed,
     then settles — the wall feels like it has weight. Only the cards on screen are touched.
     The same loop watches frame times: if scrolling keeps dropping frames, go lite. */
  if (canHover) {
    let lastY = scrollY, sk = 0, raf = 0, lastT = 0, frames = 0, slow = 0;
    // a card's style is only touched when its value really changes
    const paint = val => {
      // the dock spreads and flattens with the speed of the wall
      const q = val ? Math.abs(+val).toFixed(1) : '0.0';
      if (q !== (dock._q || '0.0')) { dock._q = q; q === '0.0' ? dock.style.removeProperty('--q') : dock.style.setProperty('--q', q); }
      for (const c of visible) {
        if ((c._sk || '') === val) continue;
        c._sk = val;
        val ? c.style.setProperty('--sk', val) : c.style.removeProperty('--sk');
      }
    };
    const tick = now => {
      if (lastT && !lite) {
        const d = now - lastT;
        if (d < 1000) { frames++; if (d > 34) slow++; }
        if (frames >= 120) frames = slow = 0;
      }
      lastT = now;
      const v = scrollY - lastY;
      lastY = scrollY;
      // slow movement (including the idle drift) counts as standing still
      const target = lite || Math.abs(v) < 2 ? 0 : Math.max(-4, Math.min(4, v * 0.12));
      sk += (target - sk) * 0.14;
      if (Math.abs(sk) < 0.02 && target === 0) {
        if (v === 0 || lite) { sk = 0; raf = 0; lastT = 0; paint(''); return; }
        sk = 0; paint('');
      } else paint(sk.toFixed(1));
      raf = requestAnimationFrame(tick);
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
  }

  /* Drift: leave the page alone for a few seconds and the feed starts to flow by itself,
     an endless slow wall. Any input stops it at once. */
  if (canHover) { // the wall drifts by itself only on a computer
    const IDLE_MS = 7000, SPEED = 28; // px per second, the same on any refresh rate
    // No frame loop at rest: a timer waits for the idle moment, and only then does the loop
    // run; any input stops it again. (An endless loop kept the page drawing 60 frames a
    // second while nothing moved — a drain on laptop and phone batteries.)
    let idleSince = performance.now(), acc = 0, prev = 0, raf = 0, idleTimer = 0;
    const arm = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => { if (!raf) { prev = performance.now(); raf = requestAnimationFrame(drift); } }, IDLE_MS);
    };
    const wake = () => {
      idleSince = performance.now();
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      arm();
    };
    for (const t of ['wheel', 'touchstart', 'touchmove', 'keydown', 'pointerdown'])
      addEventListener(t, wake, { passive: true });
    // browsers re-send a pointermove when content slides under a resting cursor;
    // only a move that really changes position counts as the user coming back
    let mx = -1, my = -1;
    addEventListener('pointermove', e => {
      if (e.clientX === mx && e.clientY === my) return;
      mx = e.clientX; my = e.clientY;
      wake();
    }, { passive: true });
    function drift(now) {
      raf = 0;
      if (now - idleSince < IDLE_MS) return arm();
      // something else holds the page (a modal, the search, a hidden tab): look again later
      if (locked || query || document.hidden || document.activeElement === search) return arm();
      const dt = Math.min(now - prev, 50) / 1000;
      prev = now;
      acc += SPEED * dt;
      const step = Math.floor(acc);
      if (step) { acc -= step; scrollBy({ top: step, behavior: 'instant' }); }
      raf = requestAnimationFrame(drift);
    }
    arm();
  }

  /* Phone tilt: on devices that report orientation without a permission prompt,
     tilting the phone slides every picture a little inside its frame. */
  if (false) { // phone tilt is off: it restyled every card on each sensor reading
    let gx = 0, gy = 0, queued = false, base = null;
    addEventListener('deviceorientation', e => {
      if (e.gamma == null || e.beta == null) return;
      base ??= e.beta; // whatever angle the phone is held at counts as neutral
      gx = Math.max(-4, Math.min(4, e.gamma / 6));
      gy = Math.max(-4, Math.min(4, (e.beta - base) / 6));
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        if (lite) return;
        for (const c of visible) {
          c.style.setProperty('--gx', gx.toFixed(2));
          c.style.setProperty('--gy', gy.toFixed(2));
        }
        // the big title floats against the tilt, the way it does against the pointer
        for (const t of titles) {
          t.ht.style.setProperty('--px', (0.5 + gx / 8).toFixed(3));
          t.ht.style.setProperty('--py', (0.5 + gy / 8).toFixed(3));
        }
      });
    }, { passive: true });
  }
}

/* ───────── Liquid glass: refraction along the rim ─────────
   Chromium accepts an SVG filter inside backdrop-filter. For each [data-liquid]
   element we build a displacement map matching its size and radius: near the rim
   the backdrop is pulled inwards like thick glass, with a touch of chromatic
   aberration. Safari and Firefox keep the plain frosted glass from the CSS, and so
   do phones and lite mode — the filter is too heavy for mobile GPUs. */
const isChromium = !!navigator.userAgentData?.brands?.some(b => b.brand === 'Chromium');

if (isChromium && canHover && !lite) {
  const NS = 'http://www.w3.org/2000/svg';
  const defs = $('#liquid-defs');
  const svg = (tag, attrs) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };

  function displacementMap(w, h, radius, bezel, zoom) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(w, h);
    const d = img.data;
    const hw = w / 2, hh = h / 2;
    const r = Math.min(radius, hw, hh);
    const b = Math.min(bezel, hw, hh);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const px = x + 0.5 - hw, py = y + 0.5 - hh;
        const qx = Math.abs(px) - (hw - r), qy = Math.abs(py) - (hh - r);
        const sx = px < 0 ? -1 : 1, sy = py < 0 ? -1 : 1;
        let nx = 0, ny = 0, dist;
        if (qx > 0 && qy > 0) {
          const l = Math.hypot(qx, qy) || 1;
          nx = (qx / l) * sx; ny = (qy / l) * sy;
          dist = r - l;
        } else if (qx > qy) { nx = sx; dist = hw - Math.abs(px); }
        else { ny = sy; dist = hh - Math.abs(py); }
        const t = Math.max(0, Math.min(1, 1 - dist / b));
        const m = 1 - Math.sqrt(1 - t * t); // lens profile: steep at the rim, flat in the middle
        const o = (y * w + x) * 4;
        // zoom: every point also looks a little towards the centre, so the glass magnifies
        d[o] = 128 - nx * m * 127 - px * zoom;
        d[o + 1] = 128 - ny * m * 127 - py * zoom;
        d[o + 2] = 128;
        d[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL();
  }

  let uid = 0;
  function liquify(node) {
    const id = 'lg' + uid++;
    const scale = +node.dataset.scale || 55;
    const bezel = +node.dataset.bezel || 22;
    const zoom = (+node.dataset.zoom || 0) * 255 / scale;
    const image = buildFilter(id, scale);
    let lw = 0, lh = 0, timer, applied = '';
    const draw = () => {
      if (lite) return;
      const w = Math.round(node.offsetWidth), h = Math.round(node.offsetHeight);
      if (!w || !h) return;
      if (w === lw && h === lh) { node.style.backdropFilter = applied; return; } // back at the old size
      lw = w; lh = h;
      const cs = getComputedStyle(node);
      image.setAttribute('href', displacementMap(w, h, parseFloat(cs.borderTopLeftRadius) || 0, bezel, zoom));
      image.setAttribute('width', w);
      image.setAttribute('height', h);
      const blur = cs.getPropertyValue('--blur').trim() || '18px';
      applied = `url(#${id}) blur(${node.dataset.blur || `calc(${blur} * .35)`}) saturate(190%) brightness(1.1)`;
      node.style.backdropFilter = node._liquid = applied;
    };
    // While the element is changing size (the search field opening, a window drag) the
    // refraction is dropped for plain frosted glass: re-filtering a resizing surface on every
    // frame is what made the dock stutter. The map is rebuilt once the size settles.
    new ResizeObserver(() => {
      const w = Math.round(node.offsetWidth), h = Math.round(node.offsetHeight);
      if (w === lw && h === lh && !timer) return;
      node.style.backdropFilter = '';
      clearTimeout(timer);
      timer = setTimeout(() => { timer = 0; draw(); }, 160);
    }).observe(node);
    draw();
  }

  function buildFilter(id, scale) {
    const filter = svg('filter', { id, x: 0, y: 0, width: '100%', height: '100%', 'color-interpolation-filters': 'sRGB' });
    const image = svg('feImage', { x: 0, y: 0, preserveAspectRatio: 'none', result: 'map' });
    filter.append(image);
    // three channels displaced by slightly different amounts → chromatic fringe on the rim
    [['r', 1, '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0'],
     ['g', 1.1, '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0'],
     ['b', 1.2, '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0']].forEach(([ch, k, m]) => {
      filter.append(
        svg('feDisplacementMap', { in: 'SourceGraphic', in2: 'map', scale: scale * k, xChannelSelector: 'R', yChannelSelector: 'G', result: 'd' + ch }),
        svg('feColorMatrix', { in: 'd' + ch, type: 'matrix', values: m, result: ch }),
      );
    });
    filter.append(
      svg('feBlend', { in: 'r', in2: 'g', mode: 'screen', result: 'rg' }),
      svg('feBlend', { in: 'rg', in2: 'b', mode: 'screen' }),
    );
    defs.append(filter);
    return image;
  }

  // build the maps when the main thread is idle — they are decoration, not content
  const idle = window.requestIdleCallback || (fn => setTimeout(fn, 1));
  $$('[data-liquid]').forEach(n => idle(() => liquify(n)));
}

/* ───────── Boom ─────────
   After 30 seconds of actually using the site (tab visible, no player or contact sheet open,
   not typing in the search) the wall blows apart and the word КУРС lands in its place. The
   whole screen is then a link to the Telegram channel. The cross or Esc puts the wall back.
   Once per browser session.
   The blast is chaos on purpose: every card ricochets off a random point and leaves in its
   own direction, tumbling in 3D at its own speed; the dock is thrown too; debris flies along
   bent paths; the letters of the word arrive one by one from wherever, spinning. */
{
  const BOOM_AFTER = 15; // seconds of use before the blast
  const CHAOS = 10000;    // ms the blast lasts before the phrase has put itself together
  const LINES = ['подпишись', 'на тг', 'канал'];
  const boom = $('#boom');
  const link = $('.boom__link', boom);
  const word = $('.boom__word', boom);
  const root = document.documentElement;
  const main = $('main');
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[(Math.random() * arr.length) | 0];
  let used = 0, done = false, on = false, timer = 0;
  let waves = 0, t0 = 0;
  let flying = []; // running animations of the cards and the dock, played backwards on restore
  try { done = sessionStorage.getItem('boom') === '1'; } catch {}

  // the word is only built when the blast happens: nothing extra sits in the page before
  // every letter is a face with a stack of copies behind it, like the titles on the wall
  const letters = [];
  function build() {
    if (letters.length) return;
    boom.prepend(el('i', 'boom__glitch'));
    const body = el('span', 'boom__3d');
    const layers = lite || calmBlast ? 0 : canHover ? 6 : 3;
    for (const text of LINES) {
      const line = el('span', 'boom__line');
      for (const ch of text) {
        if (ch === ' ') { line.append(el('span', 'boom__gap')); continue; }
        const L = el('span', 'boom__letter');
        for (let k = layers; k >= 1; k--) {
          const s = el('span', k === layers ? 'boom__side boom__side--shadow' : 'boom__side', ch);
          s.style.setProperty('--k', k);
          L.append(s);
        }
        L.append(el('span', 'boom__face', ch));
        line.append(L);
        letters.push(L);
      }
      body.append(line);
    }
    word.append(body);
  }

  // a phone spins the pieces flat (one axis): tumbling live video in 3D is what made the blast stutter there
  const spin = (max = 720) => canHover
    ? `rotateX(${rnd(-max, max).toFixed(0)}deg) rotateY(${rnd(-max, max).toFixed(0)}deg) rotateZ(${rnd(-max, max).toFixed(0)}deg)`
    : `rotate(${rnd(-max / 2, max / 2).toFixed(0)}deg)`;

  function blow() {
    if (on) return;
    on = done = true;
    try { sessionStorage.setItem('boom', '1'); } catch {}
    clearInterval(timer);
    clearHover();
    build();
    // the previews stop while the wall is in pieces: no video decoding under the heaviest
    // animation of the site, and nothing starts playing behind the phrase
    locked = true;
    for (const v of $$('.card video')) v.pause();
    for (const v of amb) v.pause(); // the blurred backdrop too
    // colour flashes on the flying cards are for a mouse-and-GPU computer; phones and the
    // lite mode throw the same pieces without re-filtering live video every frame
    const fx = canHover && !lite;
    const W = innerWidth, H = innerHeight, far = Math.hypot(W, H);
    flying = [];
    t0 = performance.now();
    if (!calmBlast) {
      // the cards tumble in 3D around the middle of the screen, wherever the wall is scrolled to
      const g = grid.getBoundingClientRect();
      grid.style.perspectiveOrigin = `${(W / 2 - g.left).toFixed(0)}px ${(H / 2 - g.top).toFixed(0)}px`;
      for (const c of visible) {
        c.classList.add('is-fly');
        const r = c.getBoundingClientRect();
        // first a jolt on the spot, then a ricochet off a random point, then out — any direction
        const mx = rnd(0, W) - (r.left + r.width / 2), my = rnd(0, H) - (r.top + r.height / 2);
        const a = rnd(0, Math.PI * 2), d = far * rnd(0.9, 1.6);
        flying.push(c.animate([
          { opacity: 1 },
          { transform: `translate(${rnd(-30, 30).toFixed(0)}px, ${rnd(-30, 30).toFixed(0)}px) rotate(${rnd(-14, 14).toFixed(0)}deg) scale(${rnd(1.02, 1.25).toFixed(2)})`, ...(fx && { filter: 'brightness(2.6) saturate(2.2)' }), opacity: 1, offset: rnd(0.05, 0.12) },
          { transform: `translate3d(${mx.toFixed(0)}px, ${my.toFixed(0)}px, ${rnd(-300, 500).toFixed(0)}px) ${spin(300)} scale(${rnd(0.5, 1.5).toFixed(2)})`, ...(fx && { filter: `brightness(${rnd(1, 2.2).toFixed(1)}) hue-rotate(${rnd(-120, 120).toFixed(0)}deg)` }), opacity: 1, offset: rnd(0.38, 0.6) },
          { transform: `translate3d(${(Math.cos(a) * d).toFixed(0)}px, ${(Math.sin(a) * d).toFixed(0)}px, ${rnd(-900, 300).toFixed(0)}px) ${spin(900)} scale(${rnd(0.15, 1.1).toFixed(2)})`, ...(fx && { filter: 'blur(5px) brightness(1.4)' }), opacity: 0 },
        ], { duration: rnd(1600, 5200), delay: rnd(0, 900), easing: pick(['cubic-bezier(.3,.05,.2,1)', 'cubic-bezier(.6,-.3,.3,1.1)', 'cubic-bezier(.1,.8,.3,1)', 'linear']), fill: 'both' }));
      }
      // the dock is thrown off as well
      const da = rnd(0, Math.PI * 2);
      flying.push(dock.animate([
        {},
        { transform: `translate(calc(-50% + ${(Math.cos(da) * far * .25).toFixed(0)}px), ${(Math.sin(da) * far * .25 - H * .3).toFixed(0)}px) rotate(${rnd(-200, 200).toFixed(0)}deg) scale(1.2)`, opacity: 1, offset: .4 },
        { transform: `translate(calc(-50% + ${(Math.cos(da) * far).toFixed(0)}px), ${(Math.sin(da) * far).toFixed(0)}px) rotate(${rnd(-900, 900).toFixed(0)}deg) scale(.3)`, opacity: 0 },
      ], { duration: rnd(1100, 1700), delay: rnd(0, 200), easing: 'cubic-bezier(.3,.05,.2,1)', fill: 'forwards' }));
      // shockwaves, each from its own point
      const ring = (delay = 0) => {
        const r = el('i', 'boom__ring boom__extra');
        r.style.setProperty('--rx', rnd(10, 90).toFixed(0) + '%');
        r.style.setProperty('--ry', rnd(10, 90).toFixed(0) + '%');
        r.style.setProperty('--rd', delay.toFixed(2) + 's');
        boom.prepend(r);
        r.addEventListener('animationend', () => r.remove(), { once: true });
      };
      ring(0.12); ring(0.3);
      // debris: bent paths, wild spin, every piece at its own pace
      const burst = n => { for (let i = 0; i < n; i++) {
        const kind = pick(['', '', ' boom__shard--b', ' boom__shard--c', ' boom__shard--spark', ' boom__shard--spark']);
        const s = el('i', 'boom__shard' + kind);
        const sparkish = kind.includes('spark');
        const w = sparkish ? rnd(30, 140) : rnd(6, 64);
        s.style.setProperty('--w', w.toFixed(0) + 'px');
        s.style.setProperty('--h', (sparkish ? 2 : w * rnd(0.4, 1.3)).toFixed(0) + 'px');
        s.style.setProperty('--hue', rnd(0, 360).toFixed(0));
        s.setAttribute('aria-hidden', 'true');
        boom.prepend(s);
        const ox = rnd(-W * .42, W * .42), oy = rnd(-H * .42, H * .42); // from all over the screen
        const a1 = rnd(0, Math.PI * 2), a2 = a1 + rnd(-1.6, 1.6), d1 = far * rnd(0.12, 0.45), d2 = far * rnd(0.5, 1.1);
        const rot = sparkish ? `rotate(${(a2 * 180 / Math.PI).toFixed(0)}deg)` : spin(1400);
        s.animate([
          { transform: `translate(${ox.toFixed(0)}px, ${oy.toFixed(0)}px) scale(.2)`, opacity: 1 },
          { transform: `translate(${(ox + Math.cos(a1) * d1).toFixed(0)}px, ${(oy + Math.sin(a1) * d1).toFixed(0)}px) ${sparkish ? `rotate(${(a1 * 180 / Math.PI).toFixed(0)}deg)` : spin(500)} scale(${rnd(0.6, 1.6).toFixed(2)})`, opacity: 1, offset: rnd(0.25, 0.5) },
          { transform: `translate(${(ox + Math.cos(a2) * d2).toFixed(0)}px, ${(oy + Math.sin(a2) * d2 + rnd(0, H * .25)).toFixed(0)}px) ${rot} scale(${rnd(0.2, 1.2).toFixed(2)})`, opacity: 0 },
        ], { duration: rnd(700, 2600), delay: rnd(0, 380), easing: pick(['cubic-bezier(.08,.7,.2,1)', 'cubic-bezier(.2,.2,.4,1)', 'ease-out']), fill: 'both' }).onfinish = () => s.remove();
      } };
      // the blast keeps going: a new wave of debris and a shockwave every moment until the phrase is nearly together
      burst(lite ? 26 : canHover ? 110 : 36);
      waves = setInterval(() => {
        if (!on || performance.now() - t0 > CHAOS - 1500) return clearInterval(waves);
        burst(lite ? 8 : canHover ? 30 : 10); ring();
      }, 650);
      setTimeout(() => { if (on) { ring(); ring(0.1); } }, CHAOS - 250); // the last piece lands: one more kick
      // the letters: for the whole blast every one of them is a piece of debris of its own, thrown
      // from point to point across the screen; then, piece by piece, they find their places
      const at = () => `translate3d(${rnd(-62, 62).toFixed(0)}vw, ${rnd(-58, 58).toFixed(0)}vh, ${rnd(-900, 500).toFixed(0)}px) ${spin(700)} scale(${rnd(0.5, canHover ? 3 : 1.4).toFixed(2)})`;
      const order = letters.map((_, i) => i).sort(() => Math.random() - .5);
      order.forEach((li, n) => {
        const L = letters[li];
        const dur = CHAOS * (0.62 + 0.38 * (n + 1) / letters.length); // they land one after another, the last at the very end
        const frames = [{ transform: `${at()}`, opacity: 0 }, { opacity: 1, offset: 0.04 }];
        const hops = 4 + ((Math.random() * 3) | 0);
        for (let h = 1; h <= hops; h++) frames.push({ transform: at(), offset: 0.04 + (0.8 * h) / (hops + 1), easing: pick(['ease-in-out', 'cubic-bezier(.6,-.2,.3,1.2)', 'linear']) });
        frames.push(
          { transform: `translate3d(${rnd(-5, 5).toFixed(0)}vw, ${rnd(-7, 7).toFixed(0)}vh, 160px) rotateX(${rnd(-40, 40).toFixed(0)}deg) rotateY(${rnd(-40, 40).toFixed(0)}deg) rotateZ(${rnd(-18, 18).toFixed(0)}deg) scale(${rnd(1.15, 1.5).toFixed(2)})`, offset: 0.9, easing: 'cubic-bezier(.2,.9,.3,1)' },
          { transform: `rotateZ(${rnd(-6, 6).toFixed(0)}deg) scale(.94)`, offset: 0.96 },
          { transform: 'none', opacity: 1 },
        );
        L.animate(frames, { duration: dur, delay: rnd(0, 250), fill: 'backwards' });
      });
    }
    root.classList.add('boomed');
    boom.hidden = false;
    boom.offsetWidth;
    boom.classList.add('is-on');
    main.inert = true; dock.inert = true;
    document.activeElement?.blur?.();
  }
  function restore() {
    if (!on) return;
    on = false;
    boom.classList.remove('is-on');
    root.classList.remove('boomed');
    main.inert = false; dock.inert = false;
    clearInterval(waves);
    locked = false;
    // the previews (and the backdrop) start again as the cards land
    setTimeout(() => { resume(); syncCentre(); if (!lite && !ambientIdle() && amb[ambOn].getAttribute('src')) amb[ambOn].play().catch(() => {}); }, 400);
    for (const c of $$('.card.is-fly')) c.classList.remove('is-fly');
    for (const L of letters) for (const a of L.getAnimations()) a.cancel();
    // everything flies back along its own path, faster
    for (const a of flying) {
      try { a.playbackRate = -2.2; a.play(); a.onfinish = () => a.cancel(); } catch { a.cancel(); }
    }
    flying = [];
    setTimeout(() => { if (!on) { boom.hidden = true; for (const s of $$('.boom__shard, .boom__extra', boom)) s.remove(); } }, 950);
  }
  $('.boom__close', boom).addEventListener('click', restore);
  addEventListener('keydown', e => { if (on && e.key === 'Escape') { e.preventDefault(); restore(); } });
  // the channel opens in a new tab; the wall is back by the time the visitor returns
  link.addEventListener('click', () => setTimeout(restore, 700));
  // the word turns towards the pointer
  if (canHover) boom.addEventListener('pointermove', e => {
    boom.style.setProperty('--px', (e.clientX / innerWidth).toFixed(3));
    boom.style.setProperty('--py', (e.clientY / innerHeight).toFixed(3));
  }, { passive: true });

  if (!done) timer = setInterval(() => {
    const busy = document.hidden || document.querySelector('dialog[open]') || document.activeElement === search;
    if (used < BOOM_AFTER) { if (!document.hidden) used++; return; }
    if (!busy) blow();
  }, 1000);
  // for trying it out: open the site with ?boom in the address and it goes off after 2 seconds
  if (/[?&]boom\b/.test(location.search)) { done = false; clearInterval(timer); setTimeout(blow, 2000); }
}


/* ───────── ?debug ─────────
   A plain readout for telling what a visitor's browser reports: add ?debug to the address. */
if (new URLSearchParams(location.search).has('debug')) {
  const mm = q => matchMedia(q).matches ? 'yes' : 'no';
  const box = el('pre');
  Object.assign(box.style, { position: 'fixed', left: '8px', top: '8px', zIndex: 99999, margin: 0, padding: '10px 12px', background: '#000', color: '#0f0', font: '12px/1.45 monospace', textTransform: 'none', whiteSpace: 'pre-wrap', maxWidth: 'calc(100vw - 16px)', borderRadius: '8px', pointerEvents: 'none' });
  const paint = () => {
    const vis = $$('.card.is-vis video');
    let key = '-';
    try { key = localStorage.getItem('lite') || '-'; } catch {}
    box.textContent = [
      'build ' + (document.querySelector('script[src*="main.js"]')?.src.split('v=')[1] || '?'),
      'mode ' + (lite ? 'LIGHT' : 'full') + ' | hover ' + mm('(hover: hover)') + ' | any-hover ' + mm('(any-hover: hover)') + ' | fine ' + mm('(pointer: fine)') + ' | touch ' + navigator.maxTouchPoints,
      'reduced motion ' + mm('(prefers-reduced-motion: reduce)') + ' | saved flag ' + key,
      'previews playing ' + vis.filter(v => !v.paused && v.readyState >= 2).length + '/' + vis.length + ' | 3d layers ' + DEPTH,
      'screen ' + innerWidth + 'x' + innerHeight + ' @' + devicePixelRatio + ' | cores ' + (navigator.hardwareConcurrency || '?') + ' | ram ' + (navigator.deviceMemory || '?'),
      'country ' + (sessionStorage.getItem('geo') || '?') + ' | russian player ' + (inRussia ? 'yes' : 'no'),
      navigator.userAgent,
    ].join('\n');
  };
  document.body.append(box);
  paint(); setInterval(paint, 1000);
}
