const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const DEPS = path.join(__dirname, 'node_modules/three');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1100, height: 680 } }); const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message + ' ' + (e.stack||'').split('\n')[1])); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type()+': '+m.text()); });
  await p.route('https://cdn.jsdelivr.net/npm/three@0.160.0/**', r => { const rel = r.request().url().split('three@0.160.0/')[1]; r.fulfill({ body: fs.readFileSync(path.join(DEPS, rel)), contentType: 'application/javascript' }); });
  await p.route('https://cdn.jsdelivr.net/npm/meshoptimizer@1.2.0/**', r => { const rel = r.request().url().split('meshoptimizer@1.2.0/')[1]; r.fulfill({ body: fs.readFileSync(path.join(__dirname, 'node_modules/meshoptimizer', rel)), contentType: 'application/javascript' }); });
  await p.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: '', contentType: 'text/css' }));
  await p.addInitScript(m => { try { sessionStorage.setItem('geonosis.boot', JSON.stringify({ map: m })); } catch (e) {} }, ['cArena', 'cHives', 'cBeach', 'cPlains', 'cDocks', 'cFields', 'cFoundry'][+process.argv[2]] || 'spires');
  await p.goto('http://127.0.0.1:8765/index.html?quality=low');
  await p.waitForSelector('#menu:not([hidden])', { timeout: 240000 });
  const mode = process.argv[2] || 'all';
  const out = await p.evaluate(async (mode) => {
    const g = window.__geo, log = [];
    const run = (i, secs, bot) => {
      g.startMission(i); g.game.paused = true; const M = g.MISSIONS[i];
      for (let s = 0; s < secs * 20; s++) {
        g.simStep(0.05);
        if (s % 16 === 0) for (const e of g.ents) if (e.alive && e.team === 'REP' && !e.def.bld) g.aiCast(e);
        if (bot && s % 100 === 0) { const mine = g.ents.filter(e => e.alive && e.team === 'REP' && !e.def.bld && !e.def.eng && !e.npc); bot(mine, g); }
        if (g.game.over) break;
        if (s % 600 === 0) log.push(`  [${M.id}] t=${g.game.time.toFixed(0)} rep=${g.ents.filter(e=>e.alive&&e.team==='REP').length} cis=${g.ents.filter(e=>e.alive&&e.team==='CIS').length} objs=${g.MS.objs.map(o=>o.id+':'+o.state+(o.extra?'('+o.extra+')':'')).join(' ')} timer=${g.MS.timer? (g.MS.timer.end-g.game.time).toFixed(0):'-'}`);
      }
      log.push(`[${M.id}] END t=${g.game.time.toFixed(0)} over=${g.game.over} objs=${g.MS.objs.map(o=>o.id+':'+o.state+(o.extra?'('+o.extra+')':'')).join(' ')}`);
    };
    const toLZ = (mine, g) => { const s = g.MS.s; if (s.lz) g.orderMove(s.jedi.filter(j => j.alive), { x: s.lz.x, z: s.lz.z }, 'move'); };
    const attackAll = (mine, g) => { const t = g.ents.filter(e => e.alive && e.team === 'CIS').sort((a,b)=> (a.def.bld?1:0)-(b.def.bld?1:0) || Math.hypot(a.pos.x+150,a.pos.z-150)-Math.hypot(b.pos.x+150,b.pos.z-150))[0]; if (t) g.orderMove(mine.filter(u=>u.order.type==='idle'), { x: t.pos.x, z: t.pos.z }, 'amove'); };
    const caps = (mine, g) => { const p = ['Spire Gate','Dune Sea','Petranaki Arena'].map(n=>g.MS.active && g.points.find(q=>q.name===n)).find(q=>q.owner!=='REP'); const t = p || g.points.find(q=>q.name==='Petranaki Arena'); g.orderMove(mine.filter(u=>u.order.type==='idle'), { x: t.x, z: t.z }, 'amove'); for (const b of g.ents.filter(e=>e.alive&&e.team==='REP'&&e.prod&&!e.uc&&e.prod.length<2)) { const L=b.def.produce.filter(k=>!g.whyNot('REP',k,[b])&&k!=='engREP'); if (L.length) g.enqueue('REP', L[Math.random()*L.length|0], [b]); } };
    const ships = (mine, g) => { const t = g.MS.s.ships.filter(e=>e.alive)[0]; if (t) g.orderMove(mine.filter(u=>u.order.type==='idle'), { x: t.pos.x, z: t.pos.z }, 'amove'); for (const b of g.ents.filter(e=>e.alive&&e.team==='REP'&&e.prod&&!e.uc&&e.prod.length<2)) { const L=b.def.produce.filter(k=>!g.whyNot('REP',k,[b])&&k!=='engREP'); if (L.length) g.enqueue('REP', L[Math.random()*L.length|0], [b]); } };
    const fnd = (mine, g) => { const t = g.MS.s.f.filter(e=>e.alive)[0] || g.MS.s.cmd; if (t) g.orderMove(mine.filter(u=>u.order.type==='idle'), { x: t.pos.x, z: t.pos.z }, 'amove'); for (const b of g.ents.filter(e=>e.alive&&e.team==='REP'&&e.prod&&!e.uc&&e.prod.length<2)) { const L=b.def.produce.filter(k=>!g.whyNot('REP',k,[b])&&k!=='engREP'); if (L.length) g.enqueue('REP', L[Math.random()*L.length|0], [b]); } };
    const t0 = performance.now(); log.push('custom: ' + Object.keys(g.CUSTOM).length);
    const nearest = (arr, p) => arr.filter(e => e.alive).sort((a, b) => Math.hypot(a.pos.x - p.x, a.pos.z - p.z) - Math.hypot(b.pos.x - p.x, b.pos.z - p.z))[0];
    const prod = (keys) => { for (const b of g.ents.filter(e => e.alive && e.team === 'REP' && e.prod && !e.uc && e.prod.length < 2)) { const L = b.def.produce.filter(k => !g.whyNot('REP', k, [b]) && k !== 'engREP'); if (L.length) g.enqueue('REP', L[Math.random() * L.length | 0], [b]); } };
    const hivesBot = (mine, g) => { const s = g.MS.s, h = s.hives.find(h => !h.locked); const cm = s.cmd.filter(u => u.alive); if (!h || !cm.length) return; const c = cm[0].pos; const lockedNear = s.hives.find(x => x.locked && x.alive && Math.hypot(x.pos.x - c.x, x.pos.z - c.z) < 40);
      g.orderMove(cm, lockedNear ? { x: c.x - (lockedNear.pos.x - c.x), z: c.z - (lockedNear.pos.z - c.z) } : h.bz, lockedNear ? 'move' : 'amove'); const rest = mine.filter(u => !cm.includes(u) && u.order.type === 'idle'); if (rest.length) g.orderMove(rest, h.bz, 'amove'); };
    const walkersBot = (mine, g) => { const s = g.MS.s; const t = s.p2 ? { pos: { x: s.mesa.x, z: s.mesa.z } } : nearest(s.spiders, mine[0]?.pos || { x: 0, z: 0 }); if (t) g.orderMove(mine.filter(u => u.order.type === 'idle'), { x: t.pos.x, z: t.pos.z }, 'amove'); };
    const trBot = (mine, g) => { const s = g.MS.s; const t = s.tr.filter(e => e.alive).sort((a, b) => a.launchAt - b.launchAt)[0]; if (t) g.orderMove(mine.filter(u => u.order.type === 'idle' || u.order.type === 'move'), { x: t.pos.x, z: t.pos.z }, 'amove'); };
    const fnd2 = (mine, g) => { const s = g.MS.s; const f = s.f.find(f => f.alive && f.team === 'CIS'); const t = f ? f.zone : s.cmd.pos; if (t) g.orderMove(mine.filter(u => u.order.type === 'idle'), { x: t.x, z: t.z }, 'amove'); prod(); };
    const caps2 = (mine, g) => { caps(mine, g); };
    const BOTS = { arena: [400, (m, g) => { if (g.MS.s.phase === 2) toLZ(m, g); }], hives: [700, hivesBot], beachhead: [700, caps2], walkers: [900, walkersBot], transports: [600, trBot], coreships: [700, ships], foundries: [1000, fnd2] };
    g.MISSIONS.forEach((M, i) => { if (mode === 'all' || mode === String(i)) run(i, BOTS[M.id][0], BOTS[M.id][1]); });
    g.showMenu(); g.startSkirmish(); g.game.paused = true; for (let s = 0; s < 2400; s++) g.simStep(.05); log.push('skirmish ok t=' + g.game.time.toFixed(0) + ' ents=' + g.ents.length + ' blds=' + g.ents.filter(e=>e.alive&&e.def.struct).map(e=>e.team[0]+':'+e.key+(e.uc?'*':'')).join(','));
    log.push('ms ' + (performance.now() - t0).toFixed(0));
    return log;
  }, mode);
  console.log(out.join('\n')); console.log(errs.slice(0, 10).join('\n'));
  await b.close();
})();
