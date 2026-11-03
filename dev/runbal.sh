#!/bin/sh
# Full equal-cost matchup matrix (Republic units vs every droid unit), four browsers at a time. Usage: dev/runbal.sh <tag>
cd "$(dirname "$0")"; mkdir -p out; TAG=${1:-a}
run() { timeout 3000 node balance.js $1 b1,b2,droideka,geo,dwarf,aat,hailfire,spider 6 > out/bal_${TAG}_$1.log 2>&1; }
(run clone; run atte) & (run heavy; run laat) & (run atrt; run jedi) & (run saber) & wait
echo ALLDONE > out/bal_${TAG}_done.txt
