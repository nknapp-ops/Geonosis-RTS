const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'); const DEPS = path.join(__dirname, 'node_modules/three');
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const p = await b.newPage({ viewport: { width: 1000, height: 520 } });
  p.on('pageerror', e => console.log('PAGEERROR', e.message));
  await p.route('https://cdn.jsdelivr.net/npm/three@0.160.0/**', r => { const rel = r.request().url().split('three@0.160.0/')[1]; r.fulfill({ body: fs.readFileSync(path.join(DEPS, rel)), contentType: 'application/javascript' }); });
  await p.route('https://cdn.jsdelivr.net/npm/meshoptimizer@1.2.0/**', r => r.abort()); await p.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: '', contentType: 'text/css' }));
  await p.goto('http://127.0.0.1:8765/index.html?quality=low'); await p.waitForSelector('#menu:not([hidden])', { timeout: 240000 });
  for (const [key, foeKey, team, dist, wait] of (process.env.ONLY === 'spider' ? [['spider', 'saber', 'CIS', 45, 3]] : [['laat', 'aat', 'REP', 30, 18], ['saber', 'aat', 'REP', 34, 12], ['spider', 'saber', 'CIS', 45, 3]])) {
    await p.evaluate(([key, foeKey, team, dist, wait]) => { const g = window.__geo; g.SETTINGS.fog = false; if (!window.__s) { g.startSkirmish(); window.__s = 1; } g.game.paused = true; g.game.mode = 'test';
      for (const e of g.ents) { e.alive = false; e.obj.visible = false; if (e.ring) e.ring.visible = false; } g.ents.length = 0; g.projs.length = 0; for (const id of ['bottom', 'top', 'hint', 'toast']) document.querySelector('#' + id).hidden = true;
      const u = g.spawn(key, team, 40, -100, 0), f = g.spawn(foeKey, team === 'REP' ? 'CIS' : 'REP', 40 + 6, -100 + dist, Math.PI); u.hp = u.maxHp = f.hp = f.maxHp = 1e9; f.wcd = f.wcd.map(() => 1e9);
      let n = 0; for (let k = 0; k < 30 * 8 && n < wait; k++) { g.simStep(1 / 30); n = g.projs.filter(q => q.src === u && (q.type === 'bolt' || q.type === 'beam')).length ? n + 1 : n; }
      const y = u.pos.y, T = g.THREE; u.model.g.updateWorldMatrix(true, true); const out = [];
      for (const k of ['cannon', 'gun']) for (const m of u.model.mz[k]) { const w = m.o.localToWorld(m.v.clone()); out.push(k + ' ' + w.toArray().map(v => v.toFixed(2))); const s = new T.Mesh(new T.SphereGeometry(.25, 8, 6), new T.MeshBasicMaterial({ color: k === 'cannon' ? 0x00ff00 : 0x00ffff, depthTest: false })); s.position.copy(w); s.renderOrder = 999; g.scene.add(s); }
      window.__out = out.join(' / ') + ' pos ' + u.pos.toArray().map(v => v.toFixed(1)); const V = +(window.__V || 0);
      window.__camHook = cam => { if (V === 0) cam.position.set(40 + 16, y + 9, -100 + 4); else cam.position.set(40 - 6, y + 10, -100 - 14); cam.lookAt(40, y + 5, -100 + 4); }; }, [key, foeKey, team, dist, wait]);
    await p.waitForTimeout(600); console.log(await p.evaluate(() => window.__out)); await p.screenshot({ path: `las_${key}.png` }); await p.evaluate(() => { window.__V = 1; }); await p.waitForTimeout(500); await p.screenshot({ path: `las_${key}_b.png` }); }
  await b.close(); })();
