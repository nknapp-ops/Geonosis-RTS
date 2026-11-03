# Geonosis Front

A browser RTS set on the Geonosis spire fields: Galactic Republic vs Separatist Alliance.
It is a single file (`index.html`) using Three.js 0.160 from a CDN. There is no build step.

## Run

Serve the folder (ES modules need http, not file://):

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Add `?quality=low` on slower GPUs. This turns off MSAA, uses a smaller shadow map and renders at a lower resolution.

Development tools are in `dev/`: the build and publish scripts for the hosted version, plus headless test harnesses for page errors, campaign bots, performance, balance and animation screenshots. `CLAUDE.md` describes the workflow.

## Unit models

Every unit is modelled in code from film reference: extruded hull profiles, lathed armour shells, and a shared weathering shader that adds panel lines, grime streaks and Geonosian dust (heavier near the ground).
Static parts are merged per material at load time, so detail costs little at runtime.

Sketchfab models (CC-BY / CC-BY-SA) now replace 18 of the built-in units: see `models/manifest.json`, the in-game **Model credits** screen, and `models/README.md`. Units without a downloaded model (droid foundries, the Republic command base) keep their built-in versions.

To use other downloaded 3D models, see `models/README.md`. Any unit you list in `models/manifest.json` is swapped for your glTF file, auto-scaled and animated if the file has walk or idle clips.

New downloaded models: a DC-15A rifle carried by clone troopers and commandos, a Republic Commando (rigged through its own skeleton for the leg and arm IK), and the DSD1 Dwarf Spider Droid, a new Separatist light assault walker. Its four legs plant their feet by IK, its shock-absorber pistons follow the legs, and its head turret tracks targets. It hunts clones, AT-RTs and Jedi but falls to heavy troopers, tanks, AT-TEs and gunships. The E-5 rifle model (`models/e5.glb`) is carried by the droid engineer; combat B1s keep their original model.

More downloaded models: the Hoth-style defence turret (both factions' towers; the Separatist one tinted droid tan) with a turning head, the RPS-6 launcher on heavy troopers, a Phase I clone captain as the clone engineer, and a rigid-part B1 as the droid engineer (its armature nodes drive the leg IK). Droidekas roll as a plated bronze wheel and unfold out of it. Separatist core ships stand about 85 m tall. LAAT ball turrets fire green bolts, Saber tanks long blue bolts, and the OG-9 a lingering red-orange homing beam. Both engineers carry a rifle (DC-15A and E-5) with hands gripping it by IK; the clone captain's fingers close round the grip. Heavy troopers hold the RPS-6 by its pistol grip with the hand on the launcher's side. B2s fire as they do in the film: upper arms down along the body, elbows bent, both forearms level at the target, firing from the wrists while they march. The OG-9's orb turns to its target, and the homing beam leaves the tip of its lower cannon while the small top gun fires the anti-personnel lasers.

Camera rotation: hold `[` / `]`, hold the rotate buttons in the minimap's corner, Alt+drag (handy on trackpads) or middle-drag (which also tilts). Middle-click or the minimap's home button resets the view.

Animation is hand-authored in code rather than taken from motion-capture libraries:
- **Jedi** hold the lightsaber in both hands by inverse kinematics. They have relaxed, walking, running and two-handed guard stances, and chain five different cuts (diagonal, backhand, sweep, overhead, thrust) with torso twist and a lunge. They parry deflected bolts with the blade, gesture for Force pushes and throws, and tuck their knees in leaps. A fading trail follows the blade.
- **Geonosians** get a skeleton generated at load time (`"autoRig": {"type": "geonosian"}`), so their two pairs of wings beat out of phase. They hover upright, pitch forward and bank in cruise, and fly strafing orbits around their targets. They swoop when diving, and land to perch with their wings folded when left idle.

## Campaign: the First Battle of Geonosis

Seven missions follow the battle as it unfolded (no lightsaber duels). They unlock in order, and progress is saved in the browser:

Mission 1 is fought inside a film-scale Petranaki arena that fills the whole battlefield: a 300 m floor ringed by tiered stands packed with about 2,400 Geonosian spectators (the real model, posed with wings folded and simplified to under 300 triangles, drawn in 16 culled sections and animated in the vertex shader: they cheer when a Jedi falls or Dooku speaks, and some take flight when the gunships arrive), with droid columns marching in through all four gates and the gunships landing on the arena floor. Each mission has its own battlefield, with its own terrain, rock spire forest and light: Arena Approaches (afternoon), Hive Spires (dense, tall spires at red dusk), Landing Zones (rolling hills in morning haze), The Plains (open ground at harsh midday), Techno Union Docks (mesas and big spires in smoky haze), Landing Fields (open ground under dark battle smoke) and Foundry Mesa (rugged plateaus at sunset). Starting a mission reloads the page into its battlefield.

1. **The Petranaki Arena:** keep the Jedi strike team alive on the arena floor, through Dooku's offer of surrender, until Yoda's gunships arrive. Then evacuate them through the south-west gate.
2. **Silence the Launch Hives:** lead clone commando teams to plant targeting beacons on three Geonosian launch hives, then clear out before the Acclamators' orbital strike lands. Geonosian swarms launch from every hive still standing.
3. **Establish the Beachhead:** from Yoda's forward command centre, take Spire Gate, the Dune Sea and the arena, then hold all three against the droid counter-attack.
4. **The Charge of the Walkers:** a large set-piece battle. Your AT-TE company holds the centre while allied clone battalions advance on both flanks against the main droid army. Destroy the four spider droids, survive the flanking attack through the Dune Sea, then seize the Foundry Mesa.
5. **Strike the Techno Union:** a gunship flight hunts the Techno Union transports before they lift off, through laser flak, Hailfires and Geonosian fighters.
6. **Concentrate All Fire:** with SPHA-T heavy artillery attached, bring down two of three core ships before they launch. The ships are ringed with defence towers.
7. **The Foundries Fall:** capture the droid foundries intact to drop the command ship's shield, then destroy it before Dooku's solar sailer departs.

Missions are data in the `MISSIONS` array (CAMPAIGN section of `index.html`). Each has a `setup` and an `update` function written against a small scripting API (`A.squad`, `A.wave`, `A.dropship`, `A.obj`, `A.say`, `A.timer`, `A.marker`, `A.win`, `A.lose`), so new missions are straightforward to add.

## Medals, battle report and hints

Every campaign win earns a medal, shown in the mission list (best result kept):
- **Bronze:** any win.
- **Silver:** finish under the mission's par time, or lose fewer than 35% of your units.
- **Gold:** both, with no bonus objective failed.

After every battle, the report shows:
- Totals: units deployed, units lost, enemies destroyed, damage dealt and credits earned.
- A chart of each side's army value over time; hover it to read exact values.
- A unit-by-type table.

During play, a battle log on the right lists notable events: kills of vehicles, heroes and structures, control points captured or lost, structures completed and promotions. First-time tips appear in missions 1–2 and skirmish; turn them off in the settings menu (Esc).

## How to win

Skirmish offers three battlefields (Spire Fields, Open Plain, Spire Canyon) and four enemy commanders (Random, Defensive, Aggressive, Swarm). The AI fights in army groups: it picks objectives by value and threat, flanks around defended positions, holds what it takes, reinforces and pulls back broken squads, and counters your army composition.

Capture control points to raise your income (each point adds 180 credits a minute), build a base and an army, and destroy the enemy HQ: the Republic forward command base or the Separatist core ship.

## Tactics

- **Focus fire:** with troops selected, hovering an enemy shows red brackets. Right-click it (or press **A** and click it) to make your selection attack that unit. The target stays marked, and when it dies your troops move on to the nearest member of the same squad. **A** then a ground click is attack-move.
- **Pathfinding:** ground units plan routes on a clearance grid (A*), so they go around spires, rock forests, bases and the arena wall through its gates instead of walking into them. Big walkers take wider routes, and units that get stuck sidestep and re-plan. Selected units show their planned route as a dotted line.
- **Cover:** troops next to large rocks, spires, structures or burning wrecks take half damage from that side (70% from blasts). Move orders near cover put each trooper behind it, and a green shield under the cursor shows where cover is. Only organic infantry use cover; droids don't.
- **Dynamic cover:** troopers near cover step around it to keep it between them and their target. Behind low cover they kneel, rise to fire over it and go flat when pinned. At tall cover (spires, buildings, wrecks) they hold the edge and lean out to shoot.
- **Suppression:** sustained fire, near misses and blasts suppress clones (slower, less accurate), then pin them (crawling, poor aim, no abilities). B2s, AT-RT repeaters, droidekas and the AT-TE's lasers suppress hardest. Droids are fearless and never suppressed.
- **Engaging:** units chasing a target brake so they halt just inside weapon range rather than running up to it; the AT-RT accelerates and stops like a light scout, not a heavy walker.
- **Flanking:** vehicles take 1.25x damage from the sides and 1.6x from the rear, and heavy turrets traverse slowly.
- **Line of sight and high ground:** rock spires and the arena walls block direct fire. The AT-TE cannon and Hailfire missiles fire indirectly over them. Shooting from 3 m above the target gives +15% range and accuracy.
- **Stray fire:** missed bolts can hit other enemies standing near the line of fire.
- **Squads:** units trained together form a squad. Clicking a trooper selects the squad, and its abilities share one cooldown. Press **G** to reinforce a squad near a production structure, the HQ or a held control point (the cost is shown on the button). Press **T** to retreat: the squad sprints back to the nearest of those points and ignores suppression.
- **Counters (tested in equal-cost fights):** clones beat droid infantry but lose to droidekas, Dwarf spider droids and AATs. Heavy troopers wreck every vehicle and lose to any infantry. AT-RTs hunt B1s, droidekas and Geonosians. Sabers beat every droid vehicle. AT-TEs crush infantry but fall to AATs, Spider droids and Geonosians. LAATs (armoured against small arms) dominate everything except Hailfires, droidekas and massed B1s. Droideka shields shrug off blasters but are overloaded by vehicle guns. Geonosians are cheap harassers that beat heavy-weapons teams and walkers.
- **Veterancy** now needs 1.6x / 4x / 8x a unit's value in damage dealt for Veteran / Elite / Heroic.

## Fog of war

The battlefield is dark until your units or structures see it, and ground you have explored but can't currently see stays dimmed. Hidden enemies can't be seen, clicked or auto-targeted, and an enemy that fires reveals itself briefly. Enemy bases and mission objectives are known from the start. Fog is on in campaign missions 2–5 and can be toggled for skirmish in the main menu. On Recruit the AI only targets what it can see.

## Base building

The HQ trains engineers (Clone Engineers or Separatist Construction Droids) and basic infantry. Select engineers to open the construction card, pick a structure, and click the ground to place it (green ghost = valid, red = blocked; Shift places several). Engineers build together faster, repair damaged structures and vehicles, and pick up nearby work on their own.

| Republic | Separatists | Role |
|---|---|---|
| Clone Barracks | Droid Barracks | Infantry and heroes |
| Vehicle Bay | Droid Factory | Walkers and tanks (needs a barracks) |
| Gunship Pad | Geonosian Hive | LAAT/i gunships / droidekas and Geonosians (needs a barracks) |
| AV-7 Cannon | Defence Tower | Static defence |
| Command Post | Signal Relay | +20 command limit (base 120, max 200) |

Each production structure has its own queue and rally point (right-click with it selected). The command card follows your selection: a building shows what it trains, engineers show structures, and with nothing selected you get every unit, routed to the least busy building. Missions 2, 4 and 5 start with a partly built base; the AI follows a fixed build order and rebuilds what it loses.

## Code map (sections in `index.html`)

| Section | What it does |
|---|---|
| RENDERER / SCENE | ACES tone mapping, soft shadows that follow the camera, bloom, vignette and grain, procedural sky with Geonosis's ring band |
| TERRAIN | heightfield, vertex-coloured sand and rock, generated detail and normal maps, rock spires (also used as pathing obstacles), boulders |
| MATERIALS | PBR materials with the triplanar weathering shader (panel lines, grime, dust) |
| UNIT MODELS | detailed procedural models, `bake()` (merges static parts), prototypes, and the glTF override loader |
| UNIT DEFINITIONS | `DEFS`: all stats, weapons and damage-vs-armour tables. Balance lives here. |
| PARTICLES | GPU point sprites for fire, sparks, smoke and dust; scorch decals; explosion lights |
| AUDIO | everything synthesised with Web Audio: mixer buses (effects, music, ambience, UI) with a generated reverb and a limiter; faction blasters, cannons, missiles, explosions, lightsaber hums and swings, walker footsteps, engine loops, desert wind and battle rumble; and an original generative D-minor score (pads, timpani and snare, brass) that intensifies with combat, plus a calmer menu theme |
| UNIT UPDATE | targeting, orders (move / attack / attack-move / hold), A* pathfinding on a clearance grid (`NAV`), steering, firing |
| PETRANAKI ARENA / CAMPAIGN | arena scenery and gate pathing, mission scripting API, the five missions, briefing and objective UI |
| CONTROL POINTS / ECONOMY | income, per-building production queues, construction, placement rules (`validSite`, `findSite`) |
| AI COMMANDER | `updateAI`: build order (`AI_BUILD`), production mix with counter-picks, attack waves, base and point defence, damaged vehicles pulled back for repair, fast-unit raids on undefended points, focus fire, difficulty personalities |
| POLISH | battle statistics, end-of-battle report and chart, medals, battle log, tutorial hints |
| FOG OF WAR | visibility grid, terrain fog shader, hidden enemies, minimap overlay |

`window.__geo.simStep(dt)` advances the simulation without rendering, which is useful for automated balance tests.

Fan project. Star Wars names and designs belong to Lucasfilm. Keep it non-commercial.
