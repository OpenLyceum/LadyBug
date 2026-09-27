# Implementation Notes - Lady Bug

Developer-facing notes on the architecture. The physics itself is documented for educators in
[model.md](./model.md).

## Architecture Overview

Lady Bug is a single-screen SceneryStack simulation, a TypeScript port of PhET's *Ladybug Motion 2D*.
The code separates model state from scenery views; data flows Model → View through AXON
`Property` objects.

```
src/
  main.ts, brand.ts, splash.ts, assert.ts, init.ts     bootstrap chain (brand first)
  LadyBugColors.ts, LadyBugNamespace.ts                 profile colors + namespace
  i18n/StringManager.ts, strings_*.json                 localization
  preferences/                                          query params + Preferences dialog
  lady-bug/
    LadyBugScreen.ts                                    Screen factory (model + view)
    model/
      LadyBugModel.ts                                   TModel: record/playback, stepping, bounds
      Ladybug.ts                                        position / velocity / acceleration / heading
      LadybugMover.ts                                   Linear / Circular / Elliptical presets
      SamplingMotionModel.ts                            smoothed v, a from position history
      LadybugStateRecord.ts                             playback snapshot
      MotionType.ts, UpdateMode.ts                      string-union enums
      LadyBugConstants.ts, motionMath.ts, binarySearch.ts
    view/
      LadyBugScreenView.ts                              layout, mvt, PDOM, keyboard
      LadybugNode.ts, LadybugVectorsNode.ts, LadybugTraceNode.ts
      RemoteControlPanel.ts, VectorsControlPanel.ts
      PlaybackControls.ts, SeekBar.ts
      LadyBugScreenSummaryContent.ts, LadyBugKeyboardHelpContent.ts
```

`LadyBugModel` implements `TModel` and the `MoverContext` interface consumed by `LadybugMover`.

## Key design decisions

- **Not Ladybug Revolution.** There is no rotatable platform — only heading rotation
  (`Ladybug.pointInDirectionOfMotion`) and the circular preset's fixed ring. Do not add a
  spinning reference frame.
- **Fixed timestep accumulator.** `step(dt)` consumes whole `FIXED_DT` (1/30 s) slices, capped
  by `MAX_CATCHUP_STEPS`. Preset constants and position-mode fudge factors are calibrated for
  this dt; never integrate with raw frame dt.
- **Differentiate, don't integrate, in position mode.** `SamplingMotionModel` (ported from PhET's
  `Motion2DModel`) keeps a rolling position history and returns window-averaged velocity and
  acceleration. `POSITION_MODE_V_SCALE_FACTOR` and `POSITION_MODE_A_SCALE_FACTOR` rescale the
  result for the fixed dt. Touching this smoothing changes the pedagogical feel.
- **Virtual pen for manual input.** Drag and remote-pad input write sample points into a pen path;
  position mode reads the smoothed midpoint of that path. `penDown` forces position mode while
  dragging even if velocity/acceleration mode is selected.
- **Record vs playback branch.** `recordingProperty` selects `stepRecording` (advance mover,
  append `LadybugStateRecord`, trim pen path) vs `stepPlayback` (binary-search history, apply
  stored state). Auto-stop at `MAX_RECORDING_TIME` (20 s).
- **History culling.** Consecutive identical positions are omitted from `culledStateHistory` (for
  the trace) but kept in the full `stateHistory` (for derivative estimation during recording).
- **Nested constants.** Physics constants live in `src/LadyBugConstants.ts` (fleet
  carve-out for PhET-port layout); colors in `LadyBugColors.ts`.

## View components

- **LadyBugScreenView** — circular play area (`ModelViewTransform2`, origin at center, +y up),
  right column (remote pad + vectors panel), bottom seek/playback. Calls `model.setBounds()` from
  layout. `ladybugOutOfBounds()` drives an out-of-bounds indicator when manual drag leaves the
  square model bounds.
- **LadybugNode** — draggable sprite; drag listeners feed the model pen path.
- **LadybugVectorsNode** — velocity/acceleration arrows gated on `showVelocityProperty` /
  `showAccelerationProperty`.
- **LadybugTraceNode** — line or dot trace from `culledStateHistory`; opacity fade per
  `TRACE_SECONDS_TO_BE_OLD`.
- **RemoteControlPanel** — arrow drag for the active `UpdateMode`.
- **VectorsControlPanel** — vector toggles, motion-preset radio buttons, trace mode.
- **PlaybackControls / SeekBar** — record toggle, play/pause, scrub `timeProperty`.

Decorative knob strokes in `RemoteControlPanel` / `SeekBar` use hardcoded `rgba(0,0,0,0.4)`
(carve-out: translucent borders on both color profiles).

## Disposal conventions

Screen-lifetime nodes (panels, play area, chrome) persist for the app session and intentionally
do not dispose. `SamplingMotionModel` is pure numeric state with no axon links. Dynamic
add/remove patterns are minimal for this sim; the fleet memory-leak suite uses
`SamplingMotionModel` as its dispose unit (see `tests/memory-leak.test.ts`).

## Testing

`npm test` (vitest, `--expose-gc` for GC regression):

- `tests/lady-bug/model/SamplingMotionModel.test.ts` — derivative sign, reset, constant-velocity
  acceleration near zero
- `tests/memory-leak.test.ts` — fleet-standard WeakRef/GC regression suite

No Playwright fuzz suite; `npm run lint && npm run check && npm run build` is the CI gate.

## Multi-screen simulations

This sim is single-screen. If it ever grows screens, follow [SceneryStackTemplate `doc/multi-screen.md`](https://github.com/OpenLyceum/SceneryStackTemplate/blob/main/doc/multi-screen.md).
