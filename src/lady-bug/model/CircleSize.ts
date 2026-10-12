/**
 * CircleSize.ts
 *
 * The ring sizes offered by the circular-motion preset. Discrete choices (rather
 * than a continuous slider) make it easy to compare the vectors on concentric rings.
 */

import LadyBugConstants from "../../LadyBugConstants.js";

export const CircleSize = {
  SMALL: "Small",
  MEDIUM: "Medium",
  LARGE: "Large",
} as const;

export type CircleSize = (typeof CircleSize)[keyof typeof CircleSize];

export const CIRCLE_SIZE_VALUES: CircleSize[] = [CircleSize.SMALL, CircleSize.MEDIUM, CircleSize.LARGE];

/** Ring radius (cm) for each size. */
export const CIRCLE_RADIUS_BY_SIZE: Record<CircleSize, number> = {
  [CircleSize.SMALL]: LadyBugConstants.CIRCLE_RADIUS_SMALL,
  [CircleSize.MEDIUM]: LadyBugConstants.CIRCLE_RADIUS_MEDIUM,
  [CircleSize.LARGE]: LadyBugConstants.CIRCLE_RADIUS_LARGE,
};
