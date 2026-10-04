import { Vector2 } from "scenerystack/dot";
import { describe, expect, it } from "vitest";
import LadyBugConstants from "../../../src/LadyBugConstants.js";
import { LadyBugModel } from "../../../src/lady-bug/model/LadyBugModel.js";
import { MotionType } from "../../../src/lady-bug/model/MotionType.js";
import { LadyBugPreferencesModel } from "../../../src/preferences/LadyBugPreferencesModel.js";

describe("LadyBugModel transport", () => {
  it("stops and preserves the full recording at the recording limit", () => {
    const model = new LadyBugModel(new LadyBugPreferencesModel());
    model.motionTypeProperty.value = MotionType.LINEAR;
    model.play();
    for (let i = 0; i < 610; i++) {
      model.step(LadyBugConstants.FIXED_DT);
    }
    expect(model.isPlayingProperty.value).toBe(false);
    expect(model.recordingProperty.value).toBe(false);
    expect(model.furthestRecordedTimeProperty.value).toBe(model.maxRecordingTime);
    model.setTime(model.maxRecordingTime);
    expect(model.timeProperty.value).toBe(model.maxRecordingTime);
  });

  it("switching to manual position control holds the current position", () => {
    const model = new LadyBugModel(new LadyBugPreferencesModel());
    model.motionTypeProperty.value = MotionType.LINEAR;
    for (let i = 0; i < 5; i++) {
      model.stepOnce();
    }
    const position = model.ladybug.position.copy();
    model.motionTypeProperty.value = MotionType.MANUAL;
    for (let i = 0; i < 30; i++) {
      model.stepOnce();
    }
    expect(model.ladybug.position.x).toBeCloseTo(position.x);
    expect(model.ladybug.position.y).toBeCloseTo(position.y);
  });

  it("stays at rest after Reset All from a displaced position", () => {
    const model = new LadyBugModel(new LadyBugPreferencesModel());
    model.ladybug.setPosition(new Vector2(3, 4));
    model.reset();
    for (let i = 0; i < 4; i++) {
      model.stepOnce();
    }
    expect(model.ladybug.position.equals(Vector2.ZERO)).toBe(true);
    expect(model.ladybug.velocity.equals(Vector2.ZERO)).toBe(true);
  });

  it("clamps playback to the last recorded time, including repeated Step presses", () => {
    const model = new LadyBugModel(new LadyBugPreferencesModel());
    model.motionTypeProperty.value = MotionType.LINEAR;
    for (let i = 0; i < 5; i++) {
      model.stepOnce();
    }
    const end = model.furthestRecordedTimeProperty.value;
    model.recordingProperty.value = false;
    for (let i = 0; i < 10; i++) {
      model.stepOnce();
    }
    expect(model.timeProperty.value).toBe(end);
    model.setTime(end + LadyBugConstants.FIXED_DT);
    expect(model.timeProperty.value).toBe(end);
    model.setTime(-1);
    expect(model.timeProperty.value).toBe(0);
  });
});
