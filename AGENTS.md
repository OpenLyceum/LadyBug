# AGENTS.md — Lady Bug

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenLyceum/.github/AGENTS.md](https://github.com/OpenLyceum/.github/blob/main/AGENTS.md).

## Project

SceneryStack port of the PhET *Ladybug Motion 2D* simulation. Single screen: drive a ladybug around a 2D play area by **position, velocity, or acceleration**, or hand control to a **motion preset** (Linear / Circular / Elliptical), and study the resulting kinematics with on-screen velocity/acceleration vectors and a motion trace. Motion is **recorded** and can be scrubbed/played back.

> **Not Ladybug Revolution.** There is **no rotatable platform** here — only the ladybug's heading (it turns to face its velocity) and the circular-motion preset's path around a fixed ring.

Physics for educators: `doc/model.md`. Architecture: `doc/implementation-notes.md`.

## Key files

| Area | Location |
|---|---|
| Screen | `src/lady-bug/LadyBugScreen.ts` |
| Model | `model/LadyBugModel.ts` (state + record/playback step), `Ladybug.ts`, `LadybugMover.ts` (motion presets), `SamplingMotionModel.ts` (derivative estimation), `LadybugStateRecord.ts`, `LadyBugConstants.ts` |
| Enums | `model/MotionType.ts` (Manual/Linear/Circular/Elliptical), `model/UpdateMode.ts` (position/velocity/acceleration) |
| Numeric helpers | `model/motionMath.ts`, `model/binarySearch.ts` |
| View | `view/LadyBugScreenView.ts`, `LadybugNode.ts`, `LadybugTraceNode.ts`, `LadybugVectorsNode.ts`, `PlaybackControls.ts`, `SeekBar.ts`, `RemoteControlPanel.ts`, `VectorsControlPanel.ts`, `LadyBugScreenSummaryContent.ts` |
| Colors / strings | `LadyBugColors.ts`, `LadyBugNamespace.ts`, `src/i18n/StringManager.ts` |

## Model

`LadyBugModel` is the single screen model. Two string-union enums drive its behavior: `MotionType` (the automated preset, or `Manual`) and `UpdateMode` (which kinematic quantity the user is dragging in manual mode).

| Property | Type | Meaning |
|---|---|---|
| `motionTypeProperty` | `Property<MotionType>` | Manual / Linear / Circular / Elliptical; `lazyLink` → `mover.setMotionType` |
| `updateModeProperty` | `Property<UpdateMode>` | manual control via position, velocity, or acceleration |
| `recordingProperty` | `BooleanProperty` (default true) | recording vs. playback |
| `isPlayingProperty` | `BooleanProperty` (default false) | play/pause of the step loop |
| `timeProperty` | `NumberProperty` | current time (recording head or playback cursor) |
| `furthestRecordedTimeProperty` | `NumberProperty` | length of the recording (SeekBar extent) |
| `showVelocityProperty` / `showAccelerationProperty` | `BooleanProperty` | vector overlays |
| `traceModeProperty` | `Property<TraceMode>` | path-trace style (`"line"`, …) |

### Stepping, record/playback & numerics

- **Fixed timestep accumulator.** `step(dt)` runs whole `FIXED_DT` slices (capped by `MAX_CATCHUP_STEPS`); `stepOnce()` is the Step button.
- Each slice (`stepInternal`) branches on `recordingProperty`: **recording** advances the `mover`, records a pen point + state, trims sample history, and bumps `furthestRecordedTime`; **playback** applies the recorded state at `timeProperty`. Recording auto-stops at `MAX_RECORDING_TIME`.
- **Velocity & acceleration are not integrated — they are differentiated.** `SamplingMotionModel` (ported from PhET's `Motion2DModel`) keeps a rolling history of sampled positions and derives **smoothed** velocity and acceleration via windowed averaging. It is pure numeric code with no observable state; the smoothing window means the vectors lag sharp manual moves slightly (by design).
- The ladybug heading only rotates when speed exceeds `MIN_HEADING_VELOCITY`, so a near-stationary bug doesn't spin from numerical jitter. Circular preset speed is the calibrated `CIRCULAR_ANGULAR_RATE`.

## Accessibility

Follows the shared [OpenLyceum accessibility convention](https://github.com/OpenLyceum/Baton/blob/main/ACCESSIBILITY.md).
`LadyBugScreenView` registers `LadyBugScreenSummaryContent` (live current-details: ladybug
position, speed, play state) via the `screenSummaryContent` super-option, and orders the PDOM
through a wrapper `Node`. A11y strings live under the top-level `a11y` key in each locale JSON,
via `StringManager.getA11yStrings()`.

## Compliance carve-outs

- **Nested constants:** `src/LadyBugConstants.ts` (screen-scoped PhET port layout; documented here instead of a root `LadyBugConstants.ts`).
- **Hardcoded colors:** `rgba(0,0,0,0.4)` knob/handle strokes in `RemoteControlPanel.ts` / `SeekBar.ts` — decorative borders that must stay translucent on both color profiles; not theme tokens.
- **Domain clock:** recording/playback uses the model's own `recordingProperty` / `isPlayingProperty` / `timeProperty` instead of composing fleet-standard `TimeModel` (`src/common/TimeModel.ts` is present for shared reference only).


### `package.json` overrides

JSON cannot carry comments, so the rationale for forced transitive pins lives here. Prefer
**tilde (`~`) or exact** versions — caret (`^`) lets minors drift under what is meant to be a
hard pin. Dependabot ignores these three names (see `.github/dependabot.yml`) so it does not
open PRs that fight the overrides. Revisit when SceneryStack drops or re-pins them upstream.

| Override | Pin | Why |
|---|---|---|
| `lodash` | `~4.18.1` | SceneryStack declares `~4.17.12`. Bump clears Dependabot/npm advisories patched in 4.18.x (e.g. GHSA-r5fr-rjxr-66jc, GHSA-f23m-r3pf-42rh). |
| `three` | `~0.125.2` | SceneryStack declares `^0.104.0`. Floor is 0.125.0 for GHSA-fq6p-x6j3-cmmq (ReDoS). Staying on the 0.125 line avoids a larger API jump; **0.125.x still has open CVEs** (e.g. XSS GHSA-7vvq-7r29-5vg3, fixed only in ≥0.137.0). Remove this override if/when SceneryStack stops depending on `three` or pins a patched line itself. LightPropagation keeps a higher `three` pin — do not force 0.125 there. |
| `brace-expansion` | `~5.0.9` | Transitive via `vite-plugin-pwa` / Workbox. Clears npm audit (originally GHSA-mh99-v99m-4gvg; keep ≥5.0.9 for GHSA-rgw5-rvv9-x895). |

## Testing

Fleet-standard Vitest layout:

| Path | Purpose |
|---|---|
| `vitest.config.ts` | `happy-dom` environment, `setupFiles`, `execArgv: ["--expose-gc"]` |
| `tests/setup.ts` | Canvas / AudioContext mocks + `init({ name: "…" })` before SceneryStack imports |
| `tests/**/*.test.ts` | Model/physics unit tests — mirror `src/` under `tests/` |
| `tests/memory-leak.test.ts` | WeakRef + `forceGC` dispose regression (fleet pattern) |

Actual specs:

- `tests/lady-bug/model/SamplingMotionModel.test.ts`
- `tests/memory-leak.test.ts`

Run `npm test`. CI runs the suite when a `test` script is present.

## Commands

```bash
npm run lint && npm run check && npm run build
npm test
```

`npm run release` intentionally skips `npm test` in some sims — append `&& npm test` before the version bump so a release cannot ship a failing suite.

## Development notes

- Vector display and the manual position/velocity/acceleration modes are the core pedagogical features; keep the velocity/acceleration smoothing intact when touching `SamplingMotionModel`.
