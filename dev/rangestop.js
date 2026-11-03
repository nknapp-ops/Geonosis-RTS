// how close does a chaser end up? spawn unit + stationary harmless enemy 70 m away, order attack / amove / idle-acquire, step sim, report closest & final edge distance vs range
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'); const DEPS = path.join(__dirname, 'node_modules/three');
const CASES = [['atrt', 'b1', 'attack'], ['atrt', 'b1', 'amove'], ['atrt', 'b1', 'idle'], ['saber', 'aat', 'attack'], ['clone', 'b1', 'attack'], ['atte', 'b1', 'attack'], ['heavy', 'aat', 'attack']];
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const p = await b.newPage({ viewport: { width: 400, height: 300 } });
  p.on('pageerror', e => console.log('PAGEERROR', e.message));
  await p.route('https://cdn.jsdelivr.net/npm/three@0.160.0/**', r => { const rel = r.request().url().split('three@0.160.0/')[1]; r.fulfill({ body: fs.readFileSync(path.join(DEPS, rel)), contentType: 'application/javascript' }); });
  await p.route('https://cdn.jsdelivr.net/npm/meshoptimizer@1.2.0/**', r => r.abort()); await p.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: '', contentType: 'text/css' }));
  await p.addInitScript(() => { try { sessionStorage.setItem('geonosis.boot', JSON.stringify({ map: 'plain' })); } catch (e) {} });
  await p.goto('http://127.0.0.1:8765/index.html?quality=low'); await p.waitForSelector('#menu:not([hidden])', { timeout: 240000 });
  console.log(await p.evaluate(CASES => { const g = window.__geo, V = g.THREE.Vector3, out = []; g.SETTINGS.fog = false; g.startSkirmish(); g.game.paused = true; g.game.mode = 'test'; g.game.aiCastT = 1e9;
    const ed = (a, t) => Math.hypot(a.pos.x - t.pos.x, a.pos.z - t.pos.z) - a.def.radius - t.def.radius;
    for (const [key, foeKey, mode] of CASES) {
      for (const e of g.ents) { if (!e.def.bld || e.def.radius < 40) { e.alive = false; e.obj.visible = false; } } g.ents.splice(0, g.ents.length, ...g.ents.filter(e => e.alive));
      const x0 = 0, z0 = -60, u = g.spawn(key, 'REP', x0, z0, 0), f = g.spawn(foeKey, 'CIS', x0, z0 + 70 + (mode === 'idle' ? -22 : 0), Math.PI);
      for (const e of [u, f]) { e.hp = e.maxHp = 1e9; } f.wcd = f.wcd.map(() => 1e9); f.speedMul = 0; f.order = { type: 'hold' };
      const r = u.def.weapons.reduce((m, w) => Math.max(m, w.range), 0); let mn = 1e9;
      if (mode === 'attack') g.orderAttack ? g.orderAttack([u], f) : (u.order = { type: 'attack', target: f }, u.target = f);
      else if (mode === 'amove') g.orderMove([u], new V(f.pos.x, 0, f.pos.z), 'amove');
      for (let k = 0; k < 30 * 16; k++) { f.pos.set(x0, f.pos.y, z0 + 70 + (mode === 'idle' ? -22 : 0)); f.vx = f.vz = 0; g.simStep(1 / 30); mn = Math.min(mn, ed(u, f)); }
      out.push(`${key} vs ${foeKey} [${mode}] range ${r} : closest ${mn.toFixed(1)} final ${ed(u, f).toFixed(1)} (${(ed(u, f) / r * 100).toFixed(0)}% of range)`);
      u.alive = false; f.alive = false; u.obj.visible = f.obj.visible = false; }
    return out.join('\n'); }, CASES));
  await b.close(); })();
