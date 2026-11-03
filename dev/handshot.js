// usage: node handshot.js <key> [out] ; close-ups of both hands while aiming at a distant foe
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'); const { execSync } = require('child_process');
const DEPS = path.join(__dirname, 'node_modules/three'); const key = process.argv[2] || 'engREP', out = process.argv[3] || 'hand_' + key, mode = process.env.MODE || 'guard', R = +(process.env.R || 4);
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const p = await b.newPage({ viewport: { width: 400, height: 400 } });
  p.on('pageerror', e => console.log('PAGEERROR', e.message));
  await p.route('https://cdn.jsdelivr.net/npm/three@0.160.0/**', r => { const rel = r.request().url().split('three@0.160.0/')[1]; r.fulfill({ body: fs.readFileSync(path.join(DEPS, rel)), contentType: 'application/javascript' }); });
  await p.route('https://cdn.jsdelivr.net/npm/meshoptimizer@1.2.0/**', r => r.abort()); await p.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: '', contentType: 'text/css' }));
  await p.goto('http://127.0.0.1:8765/index.html'); await p.waitForSelector('#menu:not([hidden])', { timeout: 240000 });
  await p.evaluate(([key, mode]) => { const g = window.__geo; g.SETTINGS.fog = false; g.startSkirmish(); g.game.paused = true; for (const e of g.ents) e.obj.visible = false; for (const id of ['bottom', 'top', 'hint', 'toast']) document.querySelector('#' + id).hidden = true;
    const x0 = 60, z0 = -150, u = g.spawn(key, 'REP', x0, z0, 0); window.__u = u; u.speedNow = 0; u.moving = false; const foe = g.spawn('b1', 'CIS', x0, z0 + 20, Math.PI); foe.obj.visible = false; foe.hp = 1e9;
    if (mode === 'guard') u.target = foe; u.mode = mode; for (let s = 0; s < 60; s++) { u.t += 1 / 60; u.model.anim(u, 1 / 60); } g.focusOn(x0, z0); }, [key, mode]);
  const views = [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 1, .3], [0, -1, .4]], files = [];
  for (const s of [1, -1]) for (let vi = 0; vi < views.length; vi++) {
    await p.evaluate(([s, v, R]) => { const g = window.__geo, T = g.THREE, u = window.__u; for (let k = 0; k < 2; k++) { u.t += 1 / 60; u.model.anim(u, 1 / 60); }
      const m = u.model, hb = m.rig?.parts.hand?.[s]?.b || m.launcher; m.g.updateWorldMatrix(true, true); const c = hb.getWorldPosition(new T.Vector3()); const q = m.g.getWorldQuaternion(new T.Quaternion());
      const d = new T.Vector3(...v).normalize().applyQuaternion(q); window.__camHook = cam => { cam.position.copy(c).addScaledVector(d, R); cam.lookAt(c); cam.fov = 9; cam.updateProjectionMatrix(); }; }, [s, views[vi], R]);
    await p.waitForTimeout(500); const f = `hs_${s}_${vi}.png`; await p.screenshot({ path: f }); files.push(f); }
  await b.close();
  execSync(`python3 hscomp.py ${out}`);
})();
