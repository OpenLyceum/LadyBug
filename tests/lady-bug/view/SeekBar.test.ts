import type { Rectangle } from "scenerystack/scenery";
import { describe, expect, it } from "vitest";
import { LadyBugModel } from "../../../src/lady-bug/model/LadyBugModel.js";
import { SeekBar } from "../../../src/lady-bug/view/SeekBar.js";
import { LadyBugPreferencesModel } from "../../../src/preferences/LadyBugPreferencesModel.js";

describe("SeekBar", () => {
  it("puts the handle at the recorded progress endpoint on a partial recording", () => {
    const model = new LadyBugModel(new LadyBugPreferencesModel());
    for (let i = 0; i < 30; i++) {
      model.stepOnce();
    }
    const bar = new SeekBar(model, 200);
    const progress = bar.children[1] as Rectangle;
    const handle = bar.children[2] as Rectangle;
    expect(handle.centerX).toBeCloseTo(progress.rectWidth);
    expect(handle.centerX).toBeLessThan(200);
    model.setTime(model.furthestRecordedTimeProperty.value / 2);
    expect(handle.centerX).toBeCloseTo(progress.rectWidth / 2);
  });
});
