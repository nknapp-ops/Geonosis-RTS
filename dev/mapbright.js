// usage: node mapbright.js [tag] ; screenshot every campaign map from a typical RTS view, print mean brightness
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'); const { execSync } = require('child_process'); const DEPS = path.join(__dirname, 'node_modules/three');
const tag = process.argv[2] || 'a', maps = ['cArena', 'cHives', 'cBeach', 'cPlains', 'cDocks', 'cFields', 'cFoundry'];
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const m of maps) { const p = await b.newPage({ viewport: { width: 640, height: 400 } });
    await p.route('https://cdn.jsdelivr.net/npm/three@0.160.0/**', r => { const rel = r.request().url().split('three@0.160.0/')[1]; r.fulfill({ body: fs.readFileSync(path.join(DEPS, rel)), contentType: 'application/javascript' }); });
    await p.route('https://cdn.jsdelivr.net/npm/meshoptimizer@1.2.0/**', r => r.abort()); await p.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: '', contentType: 'text/css' }));
    await p.addInitScript(m => sessionStorage.setItem('geonosis.boot', JSON.stringify({ map: m })), m);
    await p.goto('http://127.0.0.1:8765/index.html?quality=low'); await p.waitForSelector('#menu:not([hidden])', { timeout: 240000 });
    await p.evaluate(() => { const g = window.__geo; const i = g.MISSIONS.findIndex(M => M.map === g.MAP_ID); g.startMission(i); g.game.paused = true; for (const id of ['bottom', 'top', 'hint', 'toast', 'brief', 'dlg']) { const el = document.querySelector('#' + id); if (el) el.hidden = true; } const u = g.ents.find(e => e.alive && e.team === g.game.player && !e.def.bld) || g.ents[0]; g.focusOn(u.pos.x, u.pos.z); g.cam.dist = g.cam.zoomTo = 95; });
    await p.waitForTimeout(2500); try { await p.screenshot({ path: `mb_${m}.png`, timeout: 240000 }); } catch (e) { console.log(m, "shot failed"); } await p.close(); }
  await b.close();
  console.log(execSync(`python3 -c "
from PIL import Image, ImageStat
ms=${JSON.stringify(maps).replace(/"/g, "'")}
o=Image.new('RGB',(320*4,200*2))
for i,m in enumerate(ms):
  im=Image.open('mb_'+m+'.png').convert('RGB'); print(m, round(ImageStat.Stat(im.convert('L')).mean[0],1)); o.paste(im.resize((320,200)),((i%4)*320,(i//4)*200))
o.save('mb_${tag}.png')"`).toString());
})();
