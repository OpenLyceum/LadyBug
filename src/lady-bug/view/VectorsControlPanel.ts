/**
 * VectorsControlPanel.ts
 *
 * The right-hand control panel: vector visibility checkboxes, motion-preset radio
 * buttons, and trace-mode radio buttons. All labels come from StringManager and all
 * colors from LadyBugColors.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { type Node, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { AquaRadioButtonGroup, Panel, VerticalCheckboxGroup } from "scenerystack/sun";
import { StringManager } from "../../i18n/StringManager.js";
import LadyBugColors from "../../LadyBugColors.js";
import type { LadyBugModel } from "../model/LadyBugModel.js";
import { MotionType } from "../model/MotionType.js";
import { TraceMode } from "../model/TraceMode.js";

// Point size for section-title text (e.g. "Vectors", "Motion", "Trace").
const TITLE_FONT_SIZE = 16;
const TITLE_FONT = new PhetFont({ size: TITLE_FONT_SIZE, weight: "bold" });

// Point size for option-label text (checkbox labels, radio-button labels).
const LABEL_FONT_SIZE = 14;
const LABEL_FONT = new PhetFont(LABEL_FONT_SIZE);

// Pixel gap between the two vector-visibility checkboxes.
const CHECKBOX_SPACING = 8;

// Radius (px) of the radio-button circles used in motion and trace groups.
const RADIO_BUTTON_RADIUS = 8;

// Pixel gap between individual radio buttons within each group.
const RADIO_BUTTON_SPACING = 6;

// Pixel gap between sections (title + control group pairs) in the main VBox.
const VBOX_SPACING = 8;

// Corner radius (px) of the outer Panel container.
const PANEL_CORNER_RADIUS = 6;

// Horizontal padding (px) inside the outer Panel.
const PANEL_X_MARGIN = 12;

// Vertical padding (px) inside the outer Panel.
const PANEL_Y_MARGIN = 10;

function titleText(stringProperty: TReadOnlyProperty<string>): Node {
  return new Text(stringProperty, { font: TITLE_FONT, fill: LadyBugColors.foregroundColorProperty });
}

function labelText(stringProperty: TReadOnlyProperty<string>): Node {
  return new Text(stringProperty, { font: LABEL_FONT, fill: LadyBugColors.foregroundColorProperty });
}

export class VectorsControlPanel extends Panel {
  public constructor(model: LadyBugModel) {
    const strings = StringManager.getInstance();
    const vectors = strings.getVectorsStrings();
    const motion = strings.getMotionStrings();
    const trace = strings.getTraceStrings();

    const checkboxGroup = new VerticalCheckboxGroup(
      [
        { property: model.showVelocityProperty, createNode: () => labelText(vectors.showVelocityStringProperty) },
        {
          property: model.showAccelerationProperty,
          createNode: () => labelText(vectors.showAccelerationStringProperty),
        },
      ],
      {
        spacing: CHECKBOX_SPACING,
        checkboxOptions: {
          checkboxColor: LadyBugColors.foregroundColorProperty,
          checkboxColorBackground: LadyBugColors.backgroundColorProperty,
        },
      },
    );

    const radioButtonOptions = { radius: RADIO_BUTTON_RADIUS, stroke: LadyBugColors.foregroundColorProperty };

    const motionRadioGroup = new AquaRadioButtonGroup(
      model.motionTypeProperty,
      [
        { value: MotionType.MANUAL, createNode: () => labelText(motion.manualStringProperty) },
        { value: MotionType.LINEAR, createNode: () => labelText(motion.linearStringProperty) },
        { value: MotionType.CIRCULAR, createNode: () => labelText(motion.circularStringProperty) },
        { value: MotionType.ELLIPTICAL, createNode: () => labelText(motion.ellipticalStringProperty) },
      ],
      { spacing: RADIO_BUTTON_SPACING, radioButtonOptions, accessibleName: motion.titleStringProperty },
    );

    const traceRadioGroup = new AquaRadioButtonGroup<TraceMode>(
      model.traceModeProperty,
      [
        { value: TraceMode.LINE, createNode: () => labelText(trace.lineStringProperty) },
        { value: TraceMode.DOTS, createNode: () => labelText(trace.dotsStringProperty) },
        { value: TraceMode.OFF, createNode: () => labelText(trace.offStringProperty) },
      ],
      { spacing: RADIO_BUTTON_SPACING, radioButtonOptions, accessibleName: trace.titleStringProperty },
    );

    const content = new VBox({
      align: "left",
      spacing: VBOX_SPACING,
      children: [
        titleText(vectors.titleStringProperty),
        checkboxGroup,
        titleText(motion.titleStringProperty),
        motionRadioGroup,
        titleText(trace.titleStringProperty),
        traceRadioGroup,
      ],
    });

    super(content, {
      fill: LadyBugColors.panelFillProperty,
      stroke: LadyBugColors.panelStrokeProperty,
      cornerRadius: PANEL_CORNER_RADIUS,
      xMargin: PANEL_X_MARGIN,
      yMargin: PANEL_Y_MARGIN,
      align: "left",
    });
  }
}
