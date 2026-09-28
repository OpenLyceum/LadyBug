/**
 * LadyBugPreferencesModel.ts
 *
 * Model for the simulation-specific preferences shown in Preferences →
 * Simulation. Each preference Property takes its initial value from the
 * corresponding query parameter in ladyBugQueryParameters.
 */

import { BooleanProperty } from "scenerystack/axon";
import type { Tandem } from "scenerystack/tandem";
import LadyBugNamespace from "../LadyBugNamespace.js";
import ladyBugQueryParameters from "./ladyBugQueryParameters.js";

export class LadyBugPreferencesModel {
  public readonly showVelocityProperty: BooleanProperty;
  public readonly showAccelerationProperty: BooleanProperty;

  public constructor(tandem?: Tandem) {
    this.showVelocityProperty = new BooleanProperty(
      ladyBugQueryParameters.showVelocity,
      tandem ? { tandem: tandem.createTandem("showVelocityProperty") } : undefined,
    );
    this.showAccelerationProperty = new BooleanProperty(
      ladyBugQueryParameters.showAcceleration,
      tandem ? { tandem: tandem.createTandem("showAccelerationProperty") } : undefined,
    );
  }

  public reset(): void {
    this.showVelocityProperty.reset();
    this.showAccelerationProperty.reset();
  }
}

LadyBugNamespace.register("LadyBugPreferencesModel", LadyBugPreferencesModel);
