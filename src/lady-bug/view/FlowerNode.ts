/**
 * FlowerNode.ts
 *
 * A small decorative flower drawn at the model origin. It marks the "zero" position:
 * the tail of the position vector and the center of the circular-motion rings.
 */

import { Vector2 } from "scenerystack/dot";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Circle, Node } from "scenerystack/scenery";
import LadyBugColors from "../../LadyBugColors.js";

// Number of petals arranged evenly around the center.
const PETAL_COUNT = 6;

// Petal radius and distance of each petal's center from the flower center (px).
const PETAL_RADIUS = 7;
const PETAL_OFFSET = 8;

// Radius (px) of the flower's center disk.
const CENTER_RADIUS = 6;

export class FlowerNode extends Node {
  public constructor(modelViewTransform: ModelViewTransform2) {
    const petals = Array.from({ length: PETAL_COUNT }, (_, i) => {
      const center = Vector2.createPolar(PETAL_OFFSET, (2 * Math.PI * i) / PETAL_COUNT);
      return new Circle(PETAL_RADIUS, { center, fill: LadyBugColors.flowerPetalProperty });
    });
    const center = new Circle(CENTER_RADIUS, { fill: LadyBugColors.flowerCenterProperty });

    super({
      children: [...petals, center],
      center: modelViewTransform.modelToViewPosition(Vector2.ZERO),
      pickable: false,
    });
  }
}
