#!/usr/bin/env bash
#
# Synthesises every sound in src/sounds/ from scratch with ffmpeg.
#
#   bash scripts/make-sounds.sh
#
# Nothing is sampled: each file is an ffmpeg `aevalsrc` expression, so the
# whole sound set lives in this script and can be retuned by editing it.
#
# Output is 16-bit mono WAV, not MP3. MP3 encoders prepend ~25ms of priming
# silence, which is exactly the lag that made the old pad tones land late;
# WAV starts on the first sample. At these lengths the files are ~50KB each.
#
# Every file is level-matched after synthesis (see `normalise`) so the set is
# balanced by measurement rather than by ear: pads share one level, the round
# chime sits a little under them, and the fail cue further under still.

set -euo pipefail

OUT="$(cd "$(dirname "$0")/.." && pwd)/src/sounds"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

RATE=44100

# Mean (RMS) level each file is normalised to, in dB.
PAD_DB=-16
ROUND_DB=-20
FAIL_DB=-21

# Render an expression to a WAV. $1 = name, $2 = duration (s), $3 = expr,
# $4 = extra audio filters (optional).
render() {
  local filters="aformat=sample_fmts=s16:channel_layouts=mono"
  [[ -n "${4:-}" ]] && filters="$4,$filters"
  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "aevalsrc=${3}:s=${RATE}:d=${2}" \
    -af "$filters" "$TMP/$1.wav"
}

# Scale a rendered file so its mean level lands on $2 dB.
normalise() {
  local mean gain
  mean=$(ffmpeg -hide_banner -i "$TMP/$1.wav" -af volumedetect -f null - 2>&1 |
    sed -n 's/.*mean_volume: \(-\{0,1\}[0-9.]*\) dB.*/\1/p')
  gain=$(awk -v t="$2" -v m="$mean" 'BEGIN { printf "%.2f", t - m }')
  ffmpeg -hide_banner -loglevel error -y -i "$TMP/$1.wav" \
    -af "volume=${gain}dB,aformat=sample_fmts=s16:channel_layouts=mono" \
    "$OUT/$1.wav"
  echo "$1.wav  mean ${mean} dB -> $2 dB (gain ${gain} dB)"
}

# ── pad tones ──
#
# The four notes of the original Simon, an A-major chord: red A4, yellow C#4,
# green E4, blue E3. Pad index order follows theme.js scheme 0 (red, yellow,
# green, blue), so each pad keeps its classic note.
#
# Timbre is a sine with a short stack of falling harmonics. The harmonics are
# not decoration: phone speakers barely reproduce anything under ~300Hz, so a
# pure 165Hz E3 is close to silent on a phone. The 2nd-4th harmonics put the
# note's energy where a small speaker can play it, and the ear fills in the
# fundamental.
#
# 6ms attack (no click), a gentle decay, and a tail that fades to silence by
# 0.6s. Playback cuts the tone with its own short fade when the pad goes
# dark, so the length here is just the most a tone can ever ring for.
pad() {
  local f=$1
  local expr="(0.62*sin(2*PI*${f}*t)+0.22*sin(4*PI*${f}*t)+0.1*sin(6*PI*${f}*t)+0.05*sin(8*PI*${f}*t))*min(1\,t/0.006)*exp(-1.4*t)"
  render "$2" 0.6 "$expr" "afade=t=out:st=0.42:d=0.18"
}

pad 440.00 pad1   # red    A4
pad 277.18 pad2   # yellow C#4
pad 329.63 pad3   # green  E4
pad 164.81 pad4   # blue   E3

# ── fail cue ──
#
# A soft two-note "uh-oh", E3 falling to C3. Replaces a full-scale 85Hz square
# wave that startled people. Rounded triangle-ish timbre, low-passed, and
# mixed well under the pads: it should read as "no", not as an alarm.
fail_note() {
  # $1 = start time, $2 = frequency
  echo "between(t\,${1}\,${1}+0.26)*min(1\,(t-${1})/0.01)*exp(-3.2*(t-${1}))*(0.7*sin(2*PI*${2}*(t-${1}))+0.2*sin(6*PI*${2}*(t-${1}))+0.08*sin(10*PI*${2}*(t-${1})))"
}
render fail 0.62 "$(fail_note 0 164.81)+$(fail_note 0.24 130.81)" \
  "lowpass=f=1800,afade=t=out:st=0.5:d=0.12"

# ── round chime ──
#
# A quick rising arpeggio of the same A-major chord, two octaves up: A5, C#6,
# E6. Each note is plucked (instant attack, fast decay) and overlaps the
# next, so it rings as one bright flourish rather than three beeps.
chime_note() {
  echo "gte(t\,${1})*min(1\,(t-${1})/0.003)*exp(-9*(t-${1}))*(0.8*sin(2*PI*${2}*(t-${1}))+0.15*sin(4*PI*${2}*(t-${1})))"
}
render round 0.55 "$(chime_note 0 880)+$(chime_note 0.07 1108.73)+$(chime_note 0.14 1318.51)" \
  "afade=t=out:st=0.43:d=0.12"

for n in pad1 pad2 pad3 pad4; do normalise "$n" "$PAD_DB"; done
normalise round "$ROUND_DB"
normalise fail "$FAIL_DB"
