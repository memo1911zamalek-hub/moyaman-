(() => {
const $ = s => document.querySelector(s);
const ROUND = 10, LEVEL_NAMES = {1:'سهل',2:'متوسط',3:'صعب'};
const CAT_NAMES = {guess:'خمّن اللاعب',transfer:'انتقالات',general:'أسئلة عامة'};
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (pool, ...ex) => shuffle([...new Set(pool)].filter(x => !ex.includes(x))).slice(0, 3);

/* ---------- بناء بنك الأسئلة ---------- */
const NAMES = PLAYERS.map(p => p[0]);
const NATS = PLAYERS.map(p => p[2]);
const CLUBS = TRANSFERS.flatMap(t => [t[1], t[2]]);
const BANK = [];
PLAYERS.forEach(([n, pos, nat, clubs, l]) => {
  BANK.push({c:'guess', l, q:'من هو اللاعب صاحب هذه المسيرة؟', clues:[`الأندية: ${clubs}`, `المركز: ${pos}`, `الجنسية: ${nat}`], a:n, o:pick(NAMES, n)});
  BANK.push({c:'general', l, q:`ما جنسية اللاعب ${n}؟`, a:nat, o:pick(NATS, nat)});
});
TRANSFERS.forEach(([p, f, t, y, l]) => BANK.push({c:'transfer', l, q:`إلى أي نادٍ انتقل ${p} من ${f} عام ${y}؟`, a:t, o:pick(CLUBS, t, f)}));
GENERAL.forEach(([q, a, x, y, z, l]) => BANK.push({c:'general', l, q, a, o:[x, y, z]}));

/* ---------- الحالة ---------- */
let cat = 'all', lvl = 0, Q = [], idx = 0, score = 0, streak = 0, right = 0;
let hints = 0, left = 0, total = 20, timer = null, locked = true, fiftyUsed = false;

const store = {
  get(){ try { return +localStorage.getItem('fq_best') || 0; } catch(e){ return 0; } },
  set(v){ try { localStorage.setItem('fq_best', v); } catch(e){} }
};
const show = id => { document.querySelectorAll('.screen').forEach(s => s.classList.remove('show')); $(id).classList.add('show'); };
const pool = () => BANK.filter(q => (cat === 'all' || q.c === cat) && (!lvl || q.l === lvl));

/* ---------- الصوت ---------- */
let AC;
function tone(f, d = .15, type = 'sine', delay = 0) {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + delay;
    o.type = type; o.frequency.value = f; g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d);
  } catch(e){}
}
const sfx = {ok(){ tone(660,.12); tone(880,.2,'sine',.1); tone(1180,.25,'sine',.22); }, no(){ tone(200,.3,'sawtooth'); }, tick(){ tone(520,.05,'square'); }};

/* ---------- قصاصات ملونة ---------- */
const cv = $('#fx'), cx = cv.getContext('2d'); let parts = [], raf = 0;
const resize = () => { cv.width = innerWidth; cv.height = innerHeight; };
addEventListener('resize', resize); resize();
function confetti(n = 110) {
  const cols = ['#ffd23f', '#2ecc71', '#fff', '#e63946', '#4cc9f0'];
  for (let i = 0; i < n; i++) parts.push({x:cv.width / 2, y:cv.height * .55, vx:(Math.random() - .5) * 16, vy:-Math.random() * 16 - 4, s:Math.random() * 8 + 4, r:Math.random() * 6, vr:Math.random() * .3, c:cols[i % 5], life:100 + Math.random() * 60});
  if (!raf) loop();
}
function loop() {
  cx.clearRect(0, 0, cv.width, cv.height);
  parts = parts.filter(p => p.life-- > 0);
  parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .35; p.r += p.vr; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.globalAlpha = Math.min(1, p.life / 30); cx.fillStyle = p.c; cx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); cx.restore(); });
  raf = parts.length ? requestAnimationFrame(loop) : 0;
}

/* ---------- ميلان البطاقة ثلاثي الأبعاد مع الماوس ---------- */
const card = $('#card');
card.addEventListener('pointermove', e => {
  if (e.pointerType === 'touch') return;
  const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
  card.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
});
card.addEventListener('pointerleave', () => card.style.transform = '');

/* ---------- القائمة ---------- */
function refreshMenu() {
  $('#count').textContent = `عدد الأسئلة المتاحة: ${pool().length} من ${BANK.length}`;
  const b = store.get(); $('#bestMenu').textContent = b ? `أفضل نتيجة: ${b} نقطة` : '';
}
function chips(id, fn) {
  $(id).addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    $(id).querySelectorAll('.chip').forEach(c => c.classList.remove('on')); b.classList.add('on'); fn(b.dataset.v); refreshMenu();
  });
}
chips('#cats', v => cat = v);
chips('#lvls', v => lvl = +v);

/* ---------- اللعب ---------- */
function start() {
  Q = shuffle(pool()).slice(0, ROUND); idx = score = streak = right = 0;
  $('#sScore').textContent = 0; $('#sStreak').textContent = 0;
  show('#game'); render();
}
function render() {
  const q = Q[idx]; locked = false; hints = 0; fiftyUsed = false;
  total = left = q.c === 'guess' ? 30 : 20;
  $('#sQ').textContent = `${idx + 1}/${Q.length}`;
  const tag = $('#tag'); tag.textContent = `${CAT_NAMES[q.c]} • ${LEVEL_NAMES[q.l]}`; tag.className = 'tag l' + q.l;
  $('#question').textContent = q.q;
  const cl = $('#clues'); cl.innerHTML = '';
  if (q.clues) addClue(q.clues[0]);
  $('#hintBtn').style.display = q.clues ? '' : 'none'; $('#hintBtn').disabled = false;
  $('#fiftyBtn').disabled = false; $('#next').classList.remove('show');
  const o = $('#opts'); o.innerHTML = '';
  shuffle([q.a, ...q.o]).forEach(v => { const b = document.createElement('button'); b.className = 'opt'; b.textContent = v; b.onclick = () => answer(b, v); o.appendChild(b); });
  card.classList.remove('flip', 'shake'); void card.offsetWidth; card.classList.add('flip');
  clearInterval(timer); updBar();
  timer = setInterval(() => { left--; updBar(); if (left <= 5 && left > 0) sfx.tick(); if (left <= 0) answer(null, null); }, 1000);
}
const addClue = t => { const d = document.createElement('div'); d.className = 'clue'; d.textContent = t; $('#clues').appendChild(d); };
const updBar = () => $('#bar').style.width = Math.max(0, left / total * 100) + '%';

$('#hintBtn').onclick = () => {
  const q = Q[idx]; if (locked || hints >= 2) return;
  hints++; addClue(q.clues[hints]); if (hints >= 2) $('#hintBtn').disabled = true;
};
$('#fiftyBtn').onclick = () => {
  if (locked || fiftyUsed) return; fiftyUsed = true; $('#fiftyBtn').disabled = true;
  const q = Q[idx];
  shuffle([...document.querySelectorAll('.opt')].filter(b => b.textContent !== q.a)).slice(0, 2).forEach(b => b.classList.add('gone'));
};

function answer(btn, val) {
  if (locked) return; locked = true; clearInterval(timer);
  const q = Q[idx], ok = val === q.a;
  document.querySelectorAll('.opt').forEach(b => { b.disabled = true; if (b.textContent === q.a) b.classList.add('right'); });
  if (ok) {
    const pts = Math.max(5, q.l * 10 + Math.ceil(left / 2) - hints * 4 - (fiftyUsed ? 3 : 0));
    score += pts; streak++; right++; if (streak >= 3) score += 5;
    sfx.ok(); confetti(streak >= 3 ? 220 : 110);
  } else {
    if (btn) btn.classList.add('wrong'); streak = 0; sfx.no();
    card.classList.remove('flip'); void card.offsetWidth; card.classList.add('shake');
  }
  $('#sScore').textContent = score; $('#sStreak').textContent = streak;
  const n = $('#next'); n.textContent = idx === Q.length - 1 ? 'عرض النتيجة' : 'السؤال التالي'; n.classList.add('show');
}
$('#next').onclick = () => { idx++; idx < Q.length ? render() : finish(); };

function finish() {
  clearInterval(timer);
  const pct = right / Q.length;
  const title = pct === 1 ? 'مباراة مثالية! أنت أسطورة' : pct >= .8 ? 'أداء عالمي' : pct >= .5 ? 'لاعب أساسي' : pct >= .3 ? 'لاعب احتياطي' : 'تحتاج مزيداً من التدريب';
  $('#endTitle').textContent = title; $('#endScore').textContent = `${score} نقطة`;
  $('#endInfo').textContent = `أجبت على ${right} من ${Q.length} إجابة صحيحة`;
  const b = store.get(), nb = score > b;
  if (nb) store.set(score);
  $('#bestEnd').textContent = nb ? 'رقم قياسي جديد!' : `أفضل نتيجة: ${b} نقطة`;
  show('#end'); if (pct >= .5) { confetti(250); setTimeout(() => confetti(150), 500); }
}

$('#start').onclick = start;
$('#again').onclick = start;
$('#home').onclick = () => { refreshMenu(); show('#menu'); };
refreshMenu();
})();
