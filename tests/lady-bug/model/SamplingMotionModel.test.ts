import { Vector2 } from "scenerystack/dot";
import { describe, expect, it } from "vitest";
import LadyBugConstants from "../../../src/LadyBugConstants.js";
import { SamplingMotionModel } from "../../../src/lady-bug/model/SamplingMotionModel.js";

describe("SamplingMotionModel", () => {
  const { SAMPLING_HALF_WINDOW, SAMPLING_NUM_AVERAGED } = LadyBugConstants;

  it("reports positive x velocity when x increases steadily", () => {
    const model = new SamplingMotionModel(SAMPLING_HALF_WINDOW, SAMPLING_NUM_AVERAGED, 0, 0);
    const numPoints = 3 * SAMPLING_NUM_AVERAGED + 2 * SAMPLING_HALF_WINDOW;

    for (let i = 0; i < numPoints + 5; i++) {
      model.addPointAndUpdate(new Vector2(i, 0));
    }

    expect(model.getVelocity().x).toBeGreaterThan(0);
    expect(model.getVelocity().y).toBeCloseTo(0, 6);
  });

  it("reset immediately clears motion at the reset point", () => {
    const model = new SamplingMotionModel(SAMPLING_HALF_WINDOW, SAMPLING_NUM_AVERAGED, 0, 0);
    const numPoints = 3 * SAMPLING_NUM_AVERAGED + 2 * SAMPLING_HALF_WINDOW;

    for (let i = 0; i < numPoints + 5; i++) {
      model.addPointAndUpdate(new Vector2(i, i));
    }
    expect(model.getVelocity().x).toBeGreaterThan(0);

    model.reset(new Vector2(3, 4));
    expect(model.getAverageMid().equals(new Vector2(3, 4))).toBe(true);
    expect(model.getVelocity().equals(Vector2.ZERO)).toBe(true);
    expect(model.getAcceleration().equals(Vector2.ZERO)).toBe(true);

    expect(model.getVelocity().x).toBeCloseTo(0, 6);
    expect(model.getVelocity().y).toBeCloseTo(0, 6);
    expect(model.getAverageMid().x).toBeCloseTo(3, 6);
    expect(model.getAverageMid().y).toBeCloseTo(4, 6);
  });

  it("reports near-zero acceleration for constant-velocity samples", () => {
    const model = new SamplingMotionModel(SAMPLING_HALF_WINDOW, SAMPLING_NUM_AVERAGED, 0, 0);
    const numPoints = 3 * SAMPLING_NUM_AVERAGED + 2 * SAMPLING_HALF_WINDOW;

    for (let i = 0; i < numPoints + 10; i++) {
      model.addPointAndUpdate(new Vector2(2 * i, 0));
    }

    expect(model.getVelocity().x).toBeGreaterThan(0);
    expect(Math.abs(model.getAcceleration().x)).toBeLessThan(0.5);
  });
});
