import { Vector2 } from "scenerystack/dot";
import { describe, expect, it } from "vitest";
import LadyBugConstants from "../../../src/LadyBugConstants.js";
import { CIRCLE_RADIUS_BY_SIZE, CIRCLE_SIZE_VALUES, CircleSize } from "../../../src/lady-bug/model/CircleSize.js";
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

describe("LadyBugModel circular motion", () => {
  // Steps the circular preset long enough to reach the ring and settle on it. Two runs
  // stay under MAX_RECORDING_TIME (600 steps), which would otherwise switch to playback.
  const STEPS = 250;
  const runCircular = (size: CircleSize): LadyBugModel => {
    const model = new LadyBugModel(new LadyBugPreferencesModel());
    model.circleSizeProperty.value = size;
    model.motionTypeProperty.value = MotionType.CIRCULAR;
    for (let i = 0; i < STEPS; i++) {
      model.stepOnce();
    }
    return model;
  };

  it("settles on the ring of the selected size, with acceleration pointing at the origin", () => {
    for (const size of CIRCLE_SIZE_VALUES) {
      const { ladybug } = runCircular(size);
      expect(ladybug.position.magnitude).toBeCloseTo(CIRCLE_RADIUS_BY_SIZE[size], 6);
      // Centripetal: acceleration is antiparallel to position, velocity is perpendicular.
      expect(ladybug.acceleration.normalized().dot(ladybug.position.normalized())).toBeCloseTo(-1, 6);
      expect(ladybug.velocity.dot(ladybug.position)).toBeCloseTo(0, 6);
    }
  });

  it("scales acceleration with radius at the fixed angular rate (small : medium : large = 1 : 2 : 3)", () => {
    const small = runCircular(CircleSize.SMALL).ladybug.acceleration.magnitude;
    const medium = runCircular(CircleSize.MEDIUM).ladybug.acceleration.magnitude;
    const large = runCircular(CircleSize.LARGE).ladybug.acceleration.magnitude;
    expect(medium / small).toBeCloseTo(2, 6);
    expect(large / small).toBeCloseTo(3, 6);
  });

  it("moves to the new ring when the size changes mid-motion, and Reset All restores Large", () => {
    const model = runCircular(CircleSize.LARGE);
    model.circleSizeProperty.value = CircleSize.SMALL;
    for (let i = 0; i < STEPS; i++) {
      model.stepOnce();
    }
    expect(model.ladybug.position.magnitude).toBeCloseTo(LadyBugConstants.CIRCLE_RADIUS_SMALL, 6);
    model.reset();
    expect(model.circleSizeProperty.value).toBe(CircleSize.LARGE);
  });
});
