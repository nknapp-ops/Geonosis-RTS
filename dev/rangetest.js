// when does each unit first fire, relative to its weapon range? (a) attack-move toward a target, (b) holding while a target walks in
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const DEPS = path.join(__dirname, 'node_modules/three');
const KEYS = (process.argv[2] || 'clone,heavy,atrt,saber,atte,laat,jedi,b1,b2,droideka,geo,dwarf,aat,hailfire,spider').split(',');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 400, height: 300 } }); const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message + e.stack));
  await p.route('https://cdn.jsdelivr.net/npm/three@0.160.0/**', r => { const rel = r.request().url().split('three@0.160.0/')[1]; r.fulfill({ body: fs.readFileSync(path.join(DEPS, rel)), contentType: 'application/javascript' }); });
  await p.route('https://cdn.jsdelivr.net/npm/meshoptimizer@1.2.0/**', r => r.abort());
  await p.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: '', contentType: 'text/css' }));
  await p.addInitScript(([tk, tr]) => { window.__TK = tk; window.__TR = tr; }, [process.argv[3] || '', !!process.argv[4]]);
  await p.addInitScript(() => { try { sessionStorage.setItem('geonosis.boot', JSON.stringify({ map: 'plain' })); } catch (e) {} });
  await p.goto('http://127.0.0.1:8765/index.html?quality=low'); await p.waitForSelector('#menu:not([hidden])', { timeout: 240000 });
  console.log(await p.evaluate(KEYS => { const g = window.__geo, V = g.THREE.Vector3, out = []; g.SETTINGS.fog = false; g.startSkirmish(); g.game.paused = true; g.game.mode = 'test'; g.game.aiCastT = 1e9;
    const clear = () => { for (const e of g.ents) if (!e.def.bld) { e.alive = false; e.obj.visible = false; e.ring.visible = false; } g.ents.splice(0, g.ents.length, ...g.ents.filter(e => e.def.bld)); };
    const ed = (a, t) => Math.max(0, Math.hypot(a.pos.x - t.pos.x, a.pos.z - t.pos.z) - t.def.radius * .6);
    for (const k of KEYS) { const d = g.DEFS[k], team = d.team, foeT = team === 'REP' ? 'CIS' : 'REP', R = Math.max(...d.weapons.filter(w => !w.min).map(w => w.range));
      const tk = window.__TK || (d.weapons[0].vs?.veh ?? 1) >= 1 && (d.weapons[0].vs?.inf ?? 1) < 1 ? (foeT === 'REP' ? 'saber' : 'aat') : (foeT === 'REP' ? 'clone' : 'b1');
      const res = [];
      for (const mode of ['amove', 'hold']) { clear(); let x0 = 0, z0 = -60; { let best = null; for (let x = -150; x <= 150; x += 10) for (let z = -170; z <= 60; z += 10) { if (Math.hypot(x, z) < 60) continue; if (g.OBST.every(o => Math.abs(o.x - x) > o.r + 8 || o.z < z - o.r - 8 || o.z > z + 125 + o.r)) { best = [x, z]; break; } if (best) break; } if (best) { x0 = best[0]; z0 = best[1]; } }
        const u = g.spawn(k, team, x0, z0, mode === 'amove' ? Math.PI * .5 : 0); u.hp = u.maxHp = 1e7;
        const t = g.spawn(tk, foeT, x0, z0 + R * (mode === 'amove' ? 1.7 : 1.5) + 10, Math.PI); t.hp = t.maxHp = 1e7; t.wcd = t.wcd.map(() => 1e9); t.def = { ...t.def, weapons: t.def.weapons.map(w => ({ ...w, range: 0 })) };
        if (mode === 'amove') g.orderMove([u], new V(t.pos.x, 0, t.pos.z), 'amove'); else { g.orderMove([t], new V(x0, 0, z0), 'move'); }
        let first = null, n0 = g.projs.length, firstT = null;
        for (let s = 0; s < 30 * 40; s++) { g.simStep(1 / 30, false); if (window.__TR && s % 6 === 0) out.push(`  ${mode} t${(s/30).toFixed(1)} d=${ed(u,t).toFixed(1)} tgt=${u.target ? u.target.key : '-'} ord=${u.order.type} wcd=${u.wcd.map(x=>x.toFixed(2))} hd=${Math.abs(g.angDiff ? 0 : 0)} los=${g.losClear(u,t)} face=${(Math.atan2(t.pos.x-u.pos.x,t.pos.z-u.pos.z)-u.heading).toFixed(2)} dep=${(u.deployT||0).toFixed(2)} want=${u.wantMove} sp=${(u.speedNow||0).toFixed(1)}`); if (g.projs.some(q => q.src === u) || u.swing > 0 || u.recoil > 0.11) { first = ed(u, t); firstT = g.game.time; break; } }
        res.push(`${mode} first shot at ${first == null ? 'never' : first.toFixed(1) + ' m (' + (first / R * 100).toFixed(0) + '% of range)'}`); }
      out.push(`${k.padEnd(9)} range ${String(R).padStart(3)} vs ${tk.padEnd(6)} | ${res.join(' | ')}`); }
    return out.join('\n'); }, KEYS));
  console.log(errs.slice(0, 3).join('\n')); await b.close();
})();
