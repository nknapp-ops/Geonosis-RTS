#!/usr/bin/env bash
# Rebuild models/*.glb from the raw Sketchfab downloads (https://github.com/nknapp-ops/geonosis-models).
# Requires: npm i -g @gltf-transform/cli   (uses sharp for WebP textures)
# Usage: tools/optimize-models.sh /path/to/geonosis-models
set -euo pipefail
SRC="${1:?path to geonosis-models checkout}"; OUT="$(dirname "$0")/../models"
conv() { # slot source-folder simplify-ratio(1=off) texture-size flatten [simplify-error]
  local simp="--simplify true --simplify-ratio $3 --simplify-error ${6:-0.003}"; [ "$3" = "1" ] && simp="--simplify false"
  gltf-transform optimize "$SRC/$2/scene.gltf" "$OUT/$1.glb" --compress false --texture-compress webp \
    --texture-size "$4" --flatten "$5" --join "$5" --palette false --instance false $simp
}
conv laat       star_wars_laati_gunship              0.1  2048 true  0.012
conv aat        -star_wars-_aat                      1    1024 false
conv atrt       at-rt                                0.5  1024 false
conv atte       at-te_walker_animated                0.5  2048 false
conv b1         b1_battle_droid                      1    512  false
conv clone      clone_trooper_phase1_shiny_updated   0.3  1024 false
conv b2         droid_b2_juggernaut                  0.1  1024 true
conv droideka   droideka                             0.2  1024 true
conv geo        geonosian_zombie                     1    1024 true
conv hailfire   hailfire_droid                       0.25 1024 true  0.01
conv spider     homing_spider_droid                  1    1024 false
conv jedi       mace_windu                           1    1024 false
conv jediKnight obi_wan_rig                          1    1024 false
conv coreship   star_wars_separatist_core_ship       0.5  2048 true
conv saber      tx-130                               1    1024 true
conv dc15       star_wars_dc-15a                     0.4  512  true
conv e5         e-5_blaster_rifle                    0.3  512  true
conv commando   republic_commando                    0.35 1024 false
conv dwarf      dwarf_spider_droid                   0.5  1024 false
N3="New Folder With Items 3"
conv turret     "$N3/hoth_defense_turret_-_star_wars"     1    1024 false
conv rps6       "$N3/rps-6_clone_trooper_rocket_launcher" 0.5  512  true
conv engrep     "$N3/phase_i_clone_captain"               0.35 1024 false
conv engcis     "$N3/battle_droid_b1"                     0.35 1024 false
