# Geonosis RTS: notes for Claude

A single-file Three.js real-time strategy game of the Battle of Geonosis (Attack of the Clones). The whole game is `index.html` (Three.js 0.160 from the jsdelivr importmap, GLTFLoader). Models are in `models/*.glb`, and `models/manifest.json` configures them: scale, rig mapping, poses, weapon attachments and muzzles. `README.md` describes the gameplay.

## The published game
- It's published as a claude.ai artifact: **https://claude.ai/artifact/KkTRLrQnzJnNhabRFGnNPC**. Always update that URL; never create a new artifact.
- **From a new conversation:** first `Artifact` `action: "read"` it, then publish with `url` set.
- **Publishing:**
  - Run `dev/mkpub.sh`. It builds `dev/out/geonosis-front.html` (head contents + body, because the host supplies the page skeleton), base64 copies of every model, and `dev/out/pubfiles.json`.
  - Publish `dev/out/geonosis-front.html` with a `files` map.
  - The page loads the `models/*.glb.b64.txt` copies when hosted.
  - Send `models/manifest.json` every time; send a model's `.b64.txt` only when that model changed. Files left out are kept.
- **Commits:** commit and push source changes to this repo (`nknapp-ops/geonosis-rts`) too, because the cloud container is temporary.

## Local testing
- **Server:** run `cd <repo> && python3 -m http.server 8765` in the background. It dies at the 2-hour background limit, so restart it when needed.
- **Dependencies:** `cd dev && npm install` gives the scripts `three@0.160.0` and `meshoptimizer@1.2.0` to serve in place of the CDN. Playwright and Chromium come preinstalled in cloud sessions.
- **Where to run:** run scripts from `dev/` (they write PNGs and logs to the current directory, which is gitignored).
- **Scripts:**
  - `node err.js`: page errors. Must print nothing apart from ERR_FAILED noise.
  - `node camphM.js <missionIdx>`: a bot plays a campaign mission. Indices 0–6 are arena, hives, beach, plains (Walkers), docks, fields and foundry. It should end `over=true` with objectives done. Check 3 and 6 after gameplay changes.
  - `node perf.js`: 380-unit battle cost. Logic and visuals are each about 9–12 ms; swings of ±2 ms are noise.
  - `node balance.js <repKeys> <cisKeys> [trials] [budget] [map]`: equal-cost fights. `runbal.sh <tag>` runs the full matrix.
  - `node rangestop.js`: how close chasing units stop compared with weapon range (expect about 80–87%).
  - `node rangetest.js`: when units first fire relative to their range.
  - **Visual checks:**
    - `jedistrip.js <key> <modes> <frames> <stepsPerFrame> <yaw>`: strips of animation frames.
      - Modes are walk, guard, combo, run, parry and push.
      - Environment variables: `JD` camera distance, `JT` tilt, `FD` foe distance.
    - `handshot.js <key>`: close-ups of the hands (env `R` camera distance).
    - `spidershot.js`: OG-9 muzzles (`ONLY=spider`).
    - `mapbright.js`: brightness of every mission map.
    - `nodetree.js <glbName>`: a model's node and bone tree.
  - Headless SwiftShader is slow (a few frames per second), so judge time-based motion per frame.
- **Model conversion:** see `tools/optimize-models.sh` (gltf-transform optimize with webp textures).

## Code conventions and pitfalls
- **Comments:** never put a `// comment` in the middle of a line that has code after it, because it comments out the rest of the line. Use `/* */` inline.
- **Simulation:** fixed 30 Hz `simStep`. `visualStep` covers `placeUnit`, `animUnit` and `updateProjectiles`.
- **Rendering:** units draw through instanced skinned batches (`BATCH_KEYS` / `batchFor`), and rigid meshes through pooled `STATICS`.
- **Test harnesses:** set `game.mode = 'test'` so the enemy AI doesn't override orders.
- **Rigs:**
  - `makeRig` (biped map, `nodes: true` for armature nodes), `animRig`, `solveArmIK`, `setBoneW`.
  - `placeRifle2` / `gripHand` / `twistPalm` / `curlFingers`: rifle hold with finger curl.
  - `holdLauncher`: RPS-6.
  - `aimWrists`: B2 film pose.
  - `autoRigLegs`: rigid models; can add arm bones through manifest `autoRig.arms`.
- **Exports:** `window.__geo` exposes the internals the harnesses use.

## The owner's preferences
- **Film accuracy** comes first: models, poses, lasers and scale.
- **Animation:** hand-authored only; no Mixamo.
- **B1s:** combat B1 droids keep their original model, with no E-5 swap. Only the droid engineer carries an E-5.
- **Scale:** battles of 200–400 units, so performance matters.
- **Units:** every unit should have a niche. MagnaGuards were removed on purpose.
- **No night missions:** every map is daylight.
- **Process:** verify visually (screenshots) before publishing, and report results honestly.
