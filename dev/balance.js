// equal-cost matchup matrix: node balance.js <repKeys> <cisKeys> [trials] [budget] [map]
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const DEPS = path.join(__dirname, 'node_modules/three');
const RK = (process.argv[2] || 'clone').split(','), CK = (process.argv[3] || 'b1,b2,droideka,geo,dwarf,aat,hailfire,spider').split(','), TR = +(process.argv[4] || 6), BUD = +(process.argv[5] || 1400), MAP = process.argv[6] || 'plain';
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 400, height: 300 } }); const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message + (e.stack || '').split('\n')[1]));
  await p.route('https://cdn.jsdelivr.net/npm/three@0.160.0/**', r => { const rel = r.request().url().split('three@0.160.0/')[1]; r.fulfill({ body: fs.readFileSync(path.join(DEPS, rel)), contentType: 'application/javascript' }); });
  await p.route('https://cdn.jsdelivr.net/npm/meshoptimizer@1.2.0/**', r => r.abort());
  await p.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: '', contentType: 'text/css' }));
  await p.addInitScript(m => { try { sessionStorage.setItem('geonosis.boot', JSON.stringify({ map: m })); } catch (e) {} }, MAP);
  await p.goto('http://127.0.0.1:8765/index.html?quality=low'); await p.waitForSelector('#menu:not([hidden])', { timeout: 240000 });
  const out = await p.evaluate(([RK, CK, TR, BUD]) => { const g = window.__geo, V = g.THREE.Vector3; g.SETTINGS.fog = false; g.startSkirmish(); g.game.paused = true; g.game.mode = 'test'; g.game.aiCastT = 1e9;
    for (const e of g.ents) { e.alive = false; e.obj.visible = false; e.ring.visible = false; } g.ents.length = 0;
    let X = 0, Z = -60; { for (let x = -150; x <= 150 && X === 0; x += 10) for (let z = -170; z <= 60; z += 10) { if (Math.hypot(x, z) < 70) continue; if (Math.abs(x) > 120 || Math.abs(z) > 120) continue; if (g.OBST.every(o => Math.hypot(o.x - x, o.z - (z + 50)) > o.r + 70)) { X = x; Z = z + 50; break; } } }
    const lines = [];
    for (const rk of RK) for (const ck of CK) {
      const R = g.DEFS[rk] || { cost: BUD }, C = g.DEFS[ck] || { cost: BUD }; let nr = Math.max(1, Math.round(BUD / R.cost)); if (R.max) nr = 1; const nc = Math.max(1, Math.round(nr * R.cost / C.cost));
      let rw = 0, effR = 0, effC = 0, tEnd = 0;
      for (let tr = 0; tr < TR; tr++) {
        for (const e of g.ents) if (!e.def.bld) { e.alive = false; e.obj.visible = false; e.ring.visible = false; } g.ents.splice(0, g.ents.length, ...g.ents.filter(e => e.def.bld)); g.projs.length = 0;
        const A = { REP: [], CIS: [] }, mk = (t, k, n, side) => { const d = g.DEFS[k]; for (let s = 0; s < n; s++) { const grp = []; for (let i = 0; i < d.count; i++) grp.push(g.spawn(k, t, X + (Math.random() - .5) * 26, Z + side * 45 + (Math.random() - .5) * 14, side > 0 ? Math.PI : 0)); if (grp.length > 1) g.makeSquad(grp); A[t].push(...grp); } };
        if (rk === 'mix') { for (const [t, side, pool] of [['REP', -1, ['clone', 'clone', 'heavy', 'atrt', 'saber', 'atte', 'laat']], ['CIS', 1, ['b1', 'b1', 'b2', 'droideka', 'geo', 'dwarf', 'aat', 'hailfire', 'spider']]]) { let bud = BUD, guard = 0; while (bud > 80 && guard++ < 200) { const k = pool[Math.floor(Math.random() * pool.length)]; if (g.DEFS[k].cost > bud) continue; bud -= g.DEFS[k].cost; mk(t, k, 1, side); } } }
        else { mk('REP', rk, nr, -1); mk('CIS', ck, nc, 1); }
        const v0 = t => A[t].reduce((s, u) => s + u.def.cost / u.def.count, 0), V0 = { REP: v0('REP'), CIS: v0('CIS') };
        g.orderMove(A.REP, new V(X, 0, Z + 60), 'amove'); g.orderMove(A.CIS, new V(X, 0, Z - 60), 'amove');
        const t0 = g.game.time; let s = 0;
        for (; s < 30 * 150; s++) { g.simStep(1 / 30, true); if (s % 24 === 0) for (const u of [...A.REP, ...A.CIS]) if (u.alive) g.aiCast(u); if (!A.REP.some(u => u.alive) || !A.CIS.some(u => u.alive)) break;
          if (s % 90 === 0) for (const t of ['REP', 'CIS']) { const idle = A[t].filter(u => u.alive && u.order.type === 'idle' && !u.target); if (idle.length) { const foe = A[t === 'REP' ? 'CIS' : 'REP'].find(e => e.alive); if (foe) g.orderMove(idle, foe.pos.clone(), 'amove'); } } }
        const left = t => A[t].filter(u => u.alive).reduce((s, u) => s + u.def.cost / u.def.count * u.hp / u.maxHp, 0);
        const lr = left('REP') / V0.REP, lc = left('CIS') / V0.CIS; if (lr > lc) rw++; else if (lr === lc) rw += .5;
        effR += lr; effC += lc; tEnd += g.game.time - t0;
      }
      lines.push({ rk, ck, nr, nc, w: rw / TR, lr: effR / TR, lc: effC / TR, t: tEnd / TR });
    }
    return lines; }, [RK, CK, TR, BUD]);
  for (const l of out) console.log(`${l.rk.padEnd(6)} x${String(l.nr).padEnd(2)} vs ${l.ck.padEnd(8)} x${String(l.nc).padEnd(2)} | REP wins ${(l.w * 100).toFixed(0).padStart(3)}% | value left REP ${(l.lr * 100).toFixed(0).padStart(3)}% CIS ${(l.lc * 100).toFixed(0).padStart(3)}% | ${l.t.toFixed(0)}s`);
  if (errs.length) console.log(errs.slice(0, 3).join('\n')); await b.close();
})();
