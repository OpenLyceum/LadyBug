/**
 * LadyBugConstants.ts
 *
 * Numeric physics and layout constants, ported from the original Ladybug Motion sim.
 * Colors live in LadyBugColors; user-facing strings live in StringManager.
 */
import LadyBugNamespace from "./LadyBugNamespace.js";

const LadyBugConstants = {
  // The model runs on a fixed internal timestep. The original sim stepped at a fixed
  // ~33 ms (30 fps), and every motion-preset constant plus the velocity/acceleration
  // scaling factors below are calibrated around this dt. Stepping with the real (variable)
  // frame dt would make the tuned motion run at the wrong speed, so we substep instead.
  FIXED_DT: 1 / 30,
  MAX_CATCHUP_STEPS: 5,

  // Smallest scene dimension, in centimeters, used to derive the model-view scale.
  SCENE_DIAMETER: 5,

  // Number of recent samples used to estimate velocity / acceleration derivatives.
  ESTIMATION_SAMPLE_SIZE: 6,

  // Ladybug size, in centimeters.
  LADYBUG_WIDTH: 0.4,
  LADYBUG_LENGTH: 0.6,

  // Speed (cm/s) at or above which the ladybug spreads its wings.
  WING_OPEN_VELOCITY: 2,

  // Motion-preset constants (all calibrated for FIXED_DT).
  LINEAR_SPEED: 0.8, // cm/s
  CIRCLE_RADIUS: 2, // cm
  CIRCLE_SPEED: 0.018, // arbitrary tuned value
  ELLIPSE_A: 2, // cm
  ELLIPSE_B: 1.4, // cm

  // Trace opacity fade.
  TRACE_NEW_OPACITY: 1,
  TRACE_OLD_OPACITY: 0.15,
  TRACE_SECONDS_TO_BE_OLD: 2,

  // Recording / playback.
  MAX_RECORDING_TIME: 20, // seconds
  PEN_PATH_MAX: 100, // max retained pen-path samples

  // SamplingMotionModel tuning (halfWindowSize, numPointsAveraged).
  SAMPLING_HALF_WINDOW: 10,
  SAMPLING_NUM_AVERAGED: 5,

  // Remote-control pad: side length of the square drag area, in view pixels.
  REMOTE_PAD_SIZE: 166,

  // ── Manual (position-mode) velocity / acceleration fudge factors ─────────────
  //
  // These were tuned empirically in the original Java PhET simulation so that the
  // sampled position window produces v and a values that "feel right" when displayed
  // as on-screen vectors. Because updatePositionMode() always runs with
  // deltaTime = FIXED_DT, both factors collapse to fixed dimensionless multipliers.
  //
  //   vscale = 1 / deltaTime / POSITION_MODE_V_SCALE_FACTOR
  //   ascale = vscale² × POSITION_MODE_A_SCALE_FACTOR
  POSITION_MODE_V_SCALE_FACTOR: 10, // denominates 1/dt to calibrate velocity units
  POSITION_MODE_A_SCALE_FACTOR: 3.835, // calibrates vscale² to produce the acceleration scale

  // Minimum speed (cm/s) required to update the ladybug's heading angle.
  // Below this threshold the heading holds steady to prevent jitter when nearly stopped.
  MIN_HEADING_VELOCITY: 1e-6,

  // ── Circular-motion preset ───────────────────────────────────────────────────
  //
  // CIRCULAR_ANGULAR_RATE (rad/s): calibrated angular speed around the ring.
  // Derived from the original Java values:
  //   (π/64) × 1.3 × 30 × 0.7 × 2 × 0.85 × 0.4
  // where 30 is the reference frame rate (fps), π/64 is the base angular step per
  // frame at that rate, and the remaining five factors are empirical tuning constants.
  // The sign is positive; code negates it to produce clockwise (decreasing-angle) motion.
  CIRCULAR_ANGULAR_RATE: (Math.PI / 64) * 1.3 * 30 * 0.7 * 2 * 0.85 * 0.4,

  // Distance tolerance (cm) for deciding whether the ladybug has reached the ring.
  CIRCULAR_RING_TOLERANCE: 1e-6,

  // ── Elliptical-motion preset ─────────────────────────────────────────────────
  //
  // ELLIPTICAL_STEPS_PER_SECOND: number of parametric steps per second of simulation time.
  // Derived from the original Java values:
  //   (79 / 0.015) × 0.7 × 5
  // where 0.015 s is the reference timestep the constant 79 was tuned against, and
  // 0.7 × 5 are empirical speed-scale factors from the original simulation.
  // Usage: n = floor(ELLIPTICAL_STEPS_PER_SECOND × dt);  t += 2π / n  per fixed step.
  ELLIPTICAL_STEPS_PER_SECOND: (79 / 0.015) * 0.7 * 5,
} as const;

LadyBugNamespace.register("LadyBugConstants", LadyBugConstants);

export default LadyBugConstants;

/** Corner radius shared by themed panels (px). */
export const PANEL_CORNER_RADIUS = 5;
