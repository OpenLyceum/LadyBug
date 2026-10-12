/**
 * LadyBugPreferencesNode.ts
 *
 * Custom preferences UI shown in Preferences → Simulation. Controls are bound to
 * LadyBugPreferencesModel Properties (initial values from query parameters).
 */

import { Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Checkbox } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import { StringManager } from "../i18n/StringManager.js";
import LadyBugColors from "../LadyBugColors.js";
import LadyBugNamespace from "../LadyBugNamespace.js";
import type { LadyBugPreferencesModel } from "./LadyBugPreferencesModel.js";

export class LadyBugPreferencesNode extends VBox {
  public constructor(preferencesModel: LadyBugPreferencesModel, tandem?: Tandem) {
    const prefStrings = StringManager.getInstance().getPreferences();

    // Preferences dialog is always white — use control-surface colors, not textColorProperty.
    const header = new Text(prefStrings.titleStringProperty, {
      font: new PhetFont({ size: 18, weight: "bold" }),
      fill: LadyBugColors.controlSurfaceTextColorProperty,
    });

    const checkbox = (
      property: LadyBugPreferencesModel["showVelocityProperty"],
      labelProperty: typeof prefStrings.showVelocityStringProperty,
      tandemName: string,
    ): Checkbox =>
      new Checkbox(
        property,
        new Text(labelProperty, {
          font: new PhetFont(14),
          fill: LadyBugColors.controlSurfaceTextColorProperty,
        }),
        {
          spacing: 8,
          checkboxColor: LadyBugColors.controlSurfaceTextColorProperty,
          checkboxColorBackground: LadyBugColors.controlSurfaceColorProperty,
          ...(tandem && { tandem: tandem.createTandem(tandemName) }),
        },
      );

    super({
      align: "left",
      spacing: 12,
      children: [
        header,
        checkbox(preferencesModel.showPositionProperty, prefStrings.showPositionStringProperty, "showPositionCheckbox"),
        checkbox(preferencesModel.showVelocityProperty, prefStrings.showVelocityStringProperty, "showVelocityCheckbox"),
        checkbox(
          preferencesModel.showAccelerationProperty,
          prefStrings.showAccelerationStringProperty,
          "showAccelerationCheckbox",
        ),
      ],
    });
  }
}

LadyBugNamespace.register("LadyBugPreferencesNode", LadyBugPreferencesNode);
