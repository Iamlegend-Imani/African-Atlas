const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const motionToggle = document.getElementById('motionToggle');
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');

const savedTheme = localStorage.getItem('atlas-theme');
if (savedTheme) html.dataset.theme = savedTheme;
themeToggle.textContent = html.dataset.theme === 'dark' ? 'Light' : 'Dark';

themeToggle.addEventListener('click', () => {
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('atlas-theme', html.dataset.theme);
  themeToggle.textContent = html.dataset.theme === 'dark' ? 'Light' : 'Dark';
  themeToggle.setAttribute('aria-pressed', html.dataset.theme === 'dark');
});

let motionOff = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (motionOff) html.dataset.motion = 'off';
motionToggle.textContent = html.dataset.motion === 'off' ? 'Motion off' : 'Motion';
motionToggle.addEventListener('click', () => {
  html.dataset.motion = html.dataset.motion === 'off' ? 'on' : 'off';
  motionToggle.textContent = html.dataset.motion === 'off' ? 'Motion off' : 'Motion';
  motionToggle.setAttribute('aria-pressed', html.dataset.motion === 'off');
});

menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!open));
  mobileNav.hidden = open;
});
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileNav.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
}));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const progressBar = document.getElementById('progressBar');
window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progressBar.style.width = `${Math.min(100, (scrollY / max) * 100)}%`;
}, { passive: true });

const mapFrame = document.querySelector('.map-frame');
const orbit = document.querySelector('.cursor-orbit');
mapFrame.addEventListener('pointermove', e => {
  if (html.dataset.motion === 'off') return;
  const r = mapFrame.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width - .5) * 40;
  const y = ((e.clientY - r.top) / r.height - .5) * 40;
  orbit.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
});

const systems = {
  africa: { index:'SYSTEM 00', title:'Everything is connected.', body:'The Atlas begins by refusing the false separation between sectors. Every system creates pressure, possibility and feedback in every other system.', links:['food','logistics','capital','health','knowledge','technology','governance','energy','commerce'] },
  food: { index:'SYSTEM 01', title:'Food is an economic nervous system.', body:'Food touches land, health, climate, logistics, finance, trade, culture and livelihoods. To map food is to map far more than agriculture.', links:['logistics','capital','health','energy','commerce','governance','technology'] },
  logistics: { index:'SYSTEM 02', title:'Movement determines access.', body:'Logistics shapes which producers reach markets, which businesses can scale, what food costs, and how resilient trade becomes.', links:['food','capital','commerce','technology','energy','governance'] },
  capital: { index:'SYSTEM 03', title:'Capital reveals what a system values.', body:'Where money can move, infrastructure can grow. Where it cannot, ambition is constrained regardless of demand or talent.', links:['commerce','food','technology','health','energy','governance'] },
  health: { index:'SYSTEM 04', title:'Health is infrastructure for human capacity.', body:'Nutrition, mobility, knowledge, employment and care shape whether people can participate fully in economic and civic life.', links:['food','knowledge','capital','technology','energy','governance'] },
  knowledge: { index:'SYSTEM 05', title:'Knowledge changes what becomes possible.', body:'Education, research, memory and local intelligence determine whether systems merely repeat themselves or learn and transform.', links:['technology','health','governance','capital','commerce','food'] },
  technology: { index:'SYSTEM 06', title:'Technology should amplify the system, not replace it.', body:'The strongest tools make durable physical and human systems more legible, coordinated and scalable without becoming their single point of failure.', links:['knowledge','commerce','logistics','capital','health','energy'] },
  governance: { index:'SYSTEM 07', title:'Rules shape every flow.', body:'Policy, institutions, trust and enforcement influence how people trade, build, move, invest and cooperate across the continent.', links:['capital','commerce','food','logistics','health','energy','knowledge'] },
  energy: { index:'SYSTEM 08', title:'Energy is permission to operate.', body:'Production, cold chains, hospitals, data centers, mobility and industry all depend on reliable energy systems.', links:['technology','food','logistics','health','commerce','capital'] },
  commerce: { index:'SYSTEM 09', title:'Commerce is relationships in motion.', body:'Markets are not abstract. They are networks of trust, information, payment, logistics, production and human behavior.', links:['logistics','capital','food','technology','governance','knowledge'] }
};

const stage = document.getElementById('systemStage');
const linesSvg = document.getElementById('systemLines');
const nodes = [...stage.querySelectorAll('.system-node')];
const titleEl = document.getElementById('readoutTitle');
const bodyEl = document.getElementById('readoutBody');
const indexEl = document.getElementById('readoutIndex');

function centerOf(node) {
  const sr = stage.getBoundingClientRect();
  const r = node.getBoundingClientRect();
  return { x: ((r.left + r.width/2 - sr.left) / sr.width) * 900, y: ((r.top + r.height/2 - sr.top) / sr.height) * 520 };
}
function drawLines(active='africa') {
  linesSvg.innerHTML = '';
  const central = nodes.find(n => n.dataset.system === 'africa');
  const c = centerOf(central);
  const activeLinks = new Set(systems[active].links || []);
  nodes.filter(n => n !== central).forEach(node => {
    const p = centerOf(node);
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', c.x); line.setAttribute('y1', c.y); line.setAttribute('x2', p.x); line.setAttribute('y2', p.y);
    if (active === 'africa' || activeLinks.has(node.dataset.system)) line.classList.add('active');
    linesSvg.appendChild(line);
  });
  if (active !== 'africa') {
    const aNode = nodes.find(n => n.dataset.system === active); const a = centerOf(aNode);
    activeLinks.forEach(id => {
      const n = nodes.find(x => x.dataset.system === id); if (!n) return; const p = centerOf(n);
      const line = document.createElementNS('http://www.w3.org/2000/svg','line');
      line.setAttribute('x1', a.x); line.setAttribute('y1', a.y); line.setAttribute('x2', p.x); line.setAttribute('y2', p.y); line.classList.add('active');
      linesSvg.appendChild(line);
    });
  }
}
function activateSystem(id) {
  nodes.forEach(n => n.classList.toggle('active', n.dataset.system === id));
  const data = systems[id]; indexEl.textContent = data.index; titleEl.textContent = data.title; bodyEl.textContent = data.body; drawLines(id);
}
nodes.forEach(node => node.addEventListener('click', () => activateSystem(node.dataset.system)));
window.addEventListener('resize', () => drawLines(document.querySelector('.system-node.active')?.dataset.system || 'africa'));
setTimeout(() => { activateSystem('africa'); }, 100);

const joinForm = document.getElementById('joinForm');
joinForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  if (!email) return;
  document.getElementById('formNote').textContent = `You're on the prototype explorer list: ${email}`;
  joinForm.querySelector('button').textContent = 'Recorded ✓';
});
