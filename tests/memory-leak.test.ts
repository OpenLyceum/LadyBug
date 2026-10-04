/**
 * Fleet-standard memory-leak regression suite.
 * SamplingMotionModel is pure numeric state (no axon links) — the dispose unit for this sim.
 */

import { Bounds2, Vector2 } from "scenerystack/dot";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import { describe, expect, it } from "vitest";
import LadyBugConstants from "../src/LadyBugConstants.js";
import { LadyBugModel } from "../src/lady-bug/model/LadyBugModel.js";
import { SamplingMotionModel } from "../src/lady-bug/model/SamplingMotionModel.js";
import { LadybugTraceNode } from "../src/lady-bug/view/LadybugTraceNode.js";
import { LadyBugPreferencesModel } from "../src/preferences/LadyBugPreferencesModel.js";
import { describeDisposalLeaks, forceGC } from "./helpers/memoryLeak.js";

const SAMPLING_HALF_WINDOW: number = LadyBugConstants.SAMPLING_HALF_WINDOW;
const SAMPLING_NUM_AVERAGED: number = LadyBugConstants.SAMPLING_NUM_AVERAGED;

function createAndDropSamplingModel(): WeakRef<object> {
  const model = new SamplingMotionModel(SAMPLING_HALF_WINDOW, SAMPLING_NUM_AVERAGED, 0, 0);
  for (let i = 0; i < 20; i++) {
    model.addPointAndUpdate(new Vector2(i, 0));
  }
  return new WeakRef<object>(model);
}

describe("Memory leak regression", () => {
  it("SamplingMotionModel is collected after drop", async () => {
    const ref = createAndDropSamplingModel();
    await forceGC(ref);
    expect(ref.deref()).toBeUndefined();
  });

  it("repeated create/drop cycles leave no survivors", async () => {
    const refs: WeakRef<object>[] = [];
    for (let i = 0; i < 10; i++) {
      refs.push(createAndDropSamplingModel());
    }
    await forceGC(refs);
    expect(refs.filter((r) => r.deref() !== undefined).length).toBe(0);
  });
});

describeDisposalLeaks([
  {
    name: "LadybugTraceNode",
    create: () =>
      new LadybugTraceNode(
        new LadyBugModel(new LadyBugPreferencesModel()),
        ModelViewTransform2.createIdentity(),
        new Bounds2(-5, -5, 5, 5),
      ),
  },
]);
