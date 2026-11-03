// usage: node jedistrip.js <key> <mode,...> [frames] [stepsPerFrame] [yaw]
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'); const { execSync } = require('child_process');
const DEPS = path.join(__dirname, 'node_modules/three');
const key = process.argv[2] || 'jedi', modes = (process.argv[3] || 'walk').split(','), N = +(process.argv[4] || 6), SPF = +(process.argv[5] || 4), yaw = +(process.argv[6] || 1.57);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 700, height: 520 } }); const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message)); p.on('console', m => { if (/rror|model/i.test(m.text())) errs.push(m.text()); });
  await p.route('https://cdn.jsdelivr.net/npm/three@0.160.0/**', r => { const rel = r.request().url().split('three@0.160.0/')[1]; r.fulfill({ body: fs.readFileSync(path.join(DEPS, rel)), contentType: 'application/javascript' }); });
  await p.route('https://cdn.jsdelivr.net/npm/meshoptimizer@1.2.0/**', r => { const rel = r.request().url().split('meshoptimizer@1.2.0/')[1]; r.fulfill({ body: fs.readFileSync(path.join(__dirname, 'node_modules/meshoptimizer', rel)), contentType: 'application/javascript' }); });
  await p.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: '', contentType: 'text/css' }));
  await p.addInitScript(([d, t, fd]) => { window.__JD = d; window.__JT = t; window.__FD = fd; }, [+(process.env.JD || 5), +(process.env.JT ?? -.35), +(process.env.FD || 2.2)]);
  await p.goto('http://127.0.0.1:8765/index.html'); await p.waitForSelector('#menu:not([hidden])', { timeout: 240000 });
  for (const mode of modes) {
    await p.evaluate(([key, mode, yaw]) => { const g = window.__geo; g.SETTINGS.fog = false; if (!window.__started) { g.startSkirmish(); window.__started = 1; } g.game.paused = true; for (const e of g.ents) e.obj.visible = false; for (const id of ['bottom', 'top', 'hint', 'toast']) document.querySelector('#' + id).hidden = true;
      const x0 = 60, z0 = -150; const u = g.spawn(key, 'REP', x0, z0, 0); window.__u = u; u.speedNow = 0; u.moving = false;
      const foe = g.spawn('b1', 'CIS', x0 + 0.0, z0 + (window.__FD || 2.2), Math.PI); foe.obj.visible = false; foe.hp = 1e9; window.__foe = foe;
      u.mode = mode; if (mode === 'guard' || mode === 'combo' || mode === 'parry' || mode === 'push' || mode === 'runcombo' || mode === 'runguard') u.target = foe;
      if (mode === 'walk') { u.speedNow = 4.5; u.moving = true; } if (mode === 'run' || mode === 'runcombo' || mode === 'runguard') { u.speedNow = 9; u.moving = true; }
      for (let s = 0; s < 40; s++) { u.t += 1 / 60; u.model.anim(u, 1 / 60); }
      g.focusOn(x0, z0); g.cam.yaw = yaw; g.cam.dist = g.cam.zoomTo = +(window.__JD || 5); g.cam.tilt = window.__JT ?? -.35; }, [key, mode, yaw]);
    await p.waitForTimeout(1200);
    for (let f = 0; f < N; f++) {
      await p.evaluate(([mode, f, SPF]) => { const g = window.__geo, u = window.__u;
        for (let s = 0; s < SPF; s++) { u.t += 1 / 60;
          if ((mode === 'combo' || mode === 'runcombo') && !u.atk && (f > 0 || s > 0)) { g.__swing ? g.__swing(u) : 0; }
          if (mode === 'parry' && !u.parry && s === 0 && f % 3 === 0) u.parry = { t: 0, T: .28, lx: f % 2 ? .8 : -.8 };
          if (mode === 'push' && f === 0 && s === 0) u.pushT = .6;
          u.model.anim(u, 1 / 60); } }, [mode, f, SPF]);
      await p.waitForTimeout(300); await p.screenshot({ path: `js_${mode}_${f}.png`, clip: { x: 200, y: 60, width: 300, height: 420 } });
    }
    await p.evaluate(() => { const u = window.__u; u.obj.visible = false; u.alive = false; });
  }
  console.log(errs.slice(0, 8).join('\n')); await b.close();
  for (const mode of modes) execSync(`python3 -c "from PIL import Image\nims=[Image.open('js_${mode}_%d.png'%i) for i in range(${N})]\no=Image.new('RGB',(300*${N},420))\nfor i,im in enumerate(ims): o.paste(im,(i*300,0))\no.save('js_${key}_${mode}.png')"`);
})();
