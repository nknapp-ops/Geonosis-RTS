# Custom unit models

Put `.glb` or `.gltf` files in this folder, then copy `manifest.example.json` to `manifest.json` and list them.
Any unit not listed keeps its built-in procedural model.

Each entry is keyed by unit id:

| Republic | Separatist |
|---|---|
| `clone`, `heavy`, `jedi`, `atrt`, `saber`, `atte`, `laat`, `hqREP` | `b1`, `b2`, `droideka`, `geo`, `magna`, `aat`, `hailfire`, `spider`, `hqCIS` |

Options per entry:

- `file` (required): file name inside `models/`.
- `rotateY`: degrees to turn the model so its front faces the way the unit moves. Try `90`, `180` or `-90` if a unit drives sideways or backwards.
- `scale`: fixed scale factor. Leave it out and the model is auto-sized to the unit's real dimensions (an AT-TE is about 13.8 m long, a clone about 1.8 m tall).
- `offsetY`: lift the model (metres) if it sinks into the ground.
- `walk`, `idle`: animation clip names. Without them the game looks for clips named like "walk"/"run" and "idle".

Advanced options (used by the current `manifest.json`):

- `rotateX`: degrees, for models exported lying on their side.
- `tint`, `rough`, `metal`: recolour untextured models (e.g. a white B2) and adjust their surface.
- `glow`: cap for emissive textures (default 0.5) so lights don't blow out the bloom.
- `rig`: animate a skinned model that has no walk clip by driving its bones.
  - `{"type": "biped", "armDown": 75, "armFwd": 20, "foreBend": 75, "armSwing": 0}`: humanoids. Bones are found by name (`LeftUpLeg`/`L Thigh`, `LeftArm`/`L UpperArm`, …). `armDown` lowers T-pose arms; set it to 0 for models already posed.
  - Two-pose bipeds: `"poses": {"carry": {"R": {...}, "L": {...}}, "aim": {...}}`, where each arm has `down`, `fwd`, `in` and `bend` in degrees. Units blend to `aim` while standing and firing at a target in range. `"mirror": true` swaps the arm roles for models whose left/right bones are labelled the other way round (the clone uses this so troopers are right-handed). With `attach: "dc15"` the rifle grip follows the right hand and the barrel points past the left.
  - `{"type": "walker2", "legs": [["legA1","legA2"],["legB1","legB2"]]}`: two-legged walkers.
  - `{"type": "spider", "legs": [[hip, knee], …]}`: four-legged walkers.
- `autoRig`: give a model with no skeleton a pair of jointed legs. `{"hip": 0.46, "knee": 0.26, "legWidth": 0.15}` sets the hip and knee heights and the half-width of the leg zone, as fractions of the model's height (vertices outside that zone, like a hanging arm, stay rigid). Combine with a `biped` `rig` to make it walk; the B2 uses this.
- `attach`: `"dc15"` puts a DC-15A rifle in the right hand; `"rps6"` mounts a rocket launcher on the shoulder.
- `fix`: repair broken skin bindings from FBX conversions. `{"hide": ["Undersuit"], "attach": [{"mat": "Helmet", "bone": "Head", "height": 0.19, "up": 0.08, "rotX": 180}]}` drops a mesh by material name and refits a rigid part onto a bone.
- `rebind`: freeze a skinned model's current shape as its rest pose (when bind matrices are wrong but the shape is right).

`tools/optimize-models.sh` rebuilds every `.glb` here from the raw downloads in https://github.com/nknapp-ops/geonosis-models.

Models are loaded only when the game is served over http (`python3 -m http.server`), not when opening the file directly.

## Licensing

Check each model's licence before using it. On Sketchfab, filter by "Downloadable" and read the licence on the model page.
Models ripped from commercial games (Battlefront, etc.) are not licensed for reuse even when posted for download.
Star Wars designs belong to Lucasfilm, so keep any build with fan models private and non-commercial.
