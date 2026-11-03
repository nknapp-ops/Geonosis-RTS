// 400-unit battle: simulation cost per step, animation cost, and render statistics
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const DEPS = path.join(__dirname, 'node_modules/three');
const N = +(process.argv[2] || 400);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message + (e.stack || '').split('\n')[1]));
  await p.route('https://cdn.jsdelivr.net/npm/three@0.160.0/**', r => { const rel = r.request().url().split('three@0.160.0/')[1]; r.fulfill({ body: fs.readFileSync(path.join(DEPS, rel)), contentType: 'application/javascript' }); });
  await p.route('https://cdn.jsdelivr.net/npm/meshoptimizer@1.2.0/**', r => { const rel = r.request().url().split('meshoptimizer@1.2.0/')[1]; r.fulfill({ body: fs.readFileSync(path.join(__dirname, 'node_modules/meshoptimizer', rel)), contentType: 'application/javascript' }); });
  await p.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: '', contentType: 'text/css' }));
  await p.goto('http://127.0.0.1:8765/index.html?quality=low'); await p.waitForSelector('#menu:not([hidden])', { timeout: 240000 });
  console.log(await p.evaluate((N) => {
    const g = window.__geo; g.startSkirmish(); g.game.paused = true; g.FOG.on = false;
    const mixR = [['clone', .5], ['heavy', .12], ['atrt', .08], ['saber', .06], ['atte', .03], ['engREP', .02]], mixC = [['b1', .55], ['b2', .18], ['droideka', .08], ['aat', .06], ['hailfire', .03], ['spider', .02]];
    const place = (mix, team, cx, cz, n) => { let k = 0; for (const [key, f] of mix) { const c = Math.round(n * f); for (let i = 0; i < c; i++, k++) { const r = Math.sqrt(k) * 2.4, a = k * 2.4; g.spawn(key, team, cx + Math.cos(a) * r, cz + Math.sin(a) * r, 0); } } };
    place(mixR, 'REP', -35, 35, N / 2); place(mixC, 'CIS', 35, -35, N / 2);
    for (const e of g.ents) if (!e.def.bld) g.orderMove([e], { x: 0, z: 0 }, 'amove');
    g.focusOn(0, 0); g.cam.dist = g.cam.zoomTo = 90; g.game.running = true; for (let i = 0; i < 40; i++) { g.cam.x = 0; } window.__cam = 1;
    const units = g.ents.filter(e => e.alive && !e.def.bld).length; g.composer.render(); g.updateFrustum(); g.shadowLOD();
    // simulation timing (includes animation, which runs inside updateUnit)
    for (let i = 0; i < 20; i++) g.simStep(1 / 30);
    let t0 = performance.now(); for (let i = 0; i < 60; i++) g.simStep(1 / 30, false); const logic = (performance.now() - t0) / 60;
    t0 = performance.now(); for (let i = 0; i < 60; i++) g.visualStep(1 / 60); const visual = (performance.now() - t0) / 60; const sim = logic / 2 + visual;
    // render statistics for one frame
    g.renderer.info.autoReset = false; g.renderer.info.reset(); g.composer.render(); const inf = g.renderer.info.render; const calls = inf.calls, tris = inf.triangles; g.renderer.info.autoReset = true;
    t0 = performance.now(); for (let i = 0; i < 3; i++) g.composer.render(); const rms = (performance.now() - t0) / 3;
    let skinned = 0; g.scene.traverse(o => { if (o.isSkinnedMesh && o.visible) skinned++; });
    const per = {}; for (const e of g.ents) { if (!e.alive) continue; let n = 0; e.obj.traverseVisible(o => { if (o.isMesh) n++; }); per[e.key] = (per[e.key] || 0) + n; }
    const batches = Object.entries(g.BATCH).map(([k, B]) => k + ':' + (B ? B.n : 'off')).join(' ');
    return `units ${units} | logic ${logic.toFixed(1)} ms per 30 Hz tick | visuals ${visual.toFixed(1)} ms per frame | CPU per 60 fps frame ≈ ${sim.toFixed(1)} ms | draw calls ${calls} | triangles ${(tris / 1e6).toFixed(2)}M | skinned meshes ${skinned} | per-unit visible meshes ${JSON.stringify(per)} | batches ${batches} | render (SwiftShader, not representative) ${rms.toFixed(0)} ms`;
  }, N));
  console.log(errs.slice(0, 5).join('\n')); await b.close();
})();
