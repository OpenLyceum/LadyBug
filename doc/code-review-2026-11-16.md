# Code review — LadyBug — 2026-11-16

Reviewed commit: `4b2f0961ea366d1cc17300e62f7d88e3b74ab450`. Working tree was clean at review start.
Selected as one of the ten oldest catalogued simulations by the earliest root commit's author timestamp: `2026-05-24T03:02:17Z`. This is source-history age, not GitHub repository-creation age.

## Scope

Fixed-step recording/playback, rewind and history; manual/preset transitions; circular and elliptical mover paths and derivative sampling.

This is a targeted functional code review with broad automated checks, not a full release certification. The findings below describe the reviewed commit. The remediation section records the subsequent corrections.

## Findings

### P2: Record the starting state before advancing the first slice

Location: `src/lady-bug/model/LadyBugModel.ts:145`.

The recording path advances time and motion before creating its first snapshot. There is no snapshot at t=0. Rewind sets the clock to zero, then closest-snapshot lookup applies the state from t=1/30 s instead. With the Linear preset, the initial x=0 becomes x=0.0266667 cm at displayed t=0. The initial position and initial vector state are lost for every recording.

Recommendation: capture the current state at the recording's starting time before moving. Do this for both Play and Step and after Clear or a resumed recording branch; preserve any paused edits in that first snapshot.

## Validation

Node v26.13.0. `npm run lint`, `npm run check`, `npm run build`, `npm run check:architecture`, and the existing `npm test` suite pass (17 tests). Local Baton compliance passes with warnings; GitHub security settings could not be read by the checker.

Template drift is pre-existing and separate from the functional findings:

```text
❌ LadyBug (2)
   differs       biome.json — differs outside extendable keys
   dependency    @biomejs/biome — @biomejs/biome@^2.6.5 ≠ template ^2.6.6
```

## Reproducer

Temporarily save the following as `tests/review-diagnostic.test.ts`, then run `npm test -- tests/review-diagnostic.test.ts` inside this repository under Node 26. The assertion intentionally fails on the reviewed commit. Remove the temporary test afterward.

```ts
import {it,expect} from "vitest";
import {LadyBugModel} from "../src/lady-bug/model/LadyBugModel.js";
import {LadyBugPreferencesModel} from "../src/preferences/LadyBugPreferencesModel.js";
import {MotionType} from "../src/lady-bug/model/MotionType.js";
it("rewind returns to the original position",()=>{
 const m=new LadyBugModel(new LadyBugPreferencesModel());
 m.motionTypeProperty.value=MotionType.LINEAR;
 const initial=m.ladybug.position.copy();
 for(let i=0;i<10;i++)m.stepOnce();
 m.rewind(); console.log("rewound",m.timeProperty.value,m.ladybug.position.x,"initial",initial.x);
 expect(m.ladybug.position.x).toBeCloseTo(initial.x,10);
});
```

## Limits and retained evidence

No new browser fuzz, live video/camera, heap profiling, manual screen-reader audit, remote dependency audit, or educator sign-off was performed in this review. Unit mocks and source tracing do not substitute for these checks. The November 15 fleet-fuzz results in the superproject review log are prior evidence, not a new browser run.

Validation logs and original diagnostic sources/output are retained locally in `/tmp/oldest-review/`; temporary evidence may be removed by the system. This report preserves the actionable reproducers.


## Remediation — 2026-11-16

Recording captures the starting pose before the first clock/motion advance, including paused edits, Clear and resumed branches. State writes invalidate the cached timestamp index.

Permanent regression coverage: `tests/lady-bug/model/LadyBugModel.test.ts`. The historical diagnostic above describes the original failure; use the permanent regression suite to validate the corrected transport path.

Aligned template-owned configuration and shared dependency declarations with SceneryStackTemplate: Biome ^2.6.6, its 2.6.6 schema and locked executable, dependency ordering, and Resonance’s Vitest declaration where applicable. Preserved documented per-simulation configuration exceptions.

Final validation and commit identifiers are recorded in the superproject’s `review-log.md`.
