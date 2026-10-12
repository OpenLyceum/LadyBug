/**
 * VectorsControlPanel.ts
 *
 * The right-hand control panel: vector visibility checkboxes, motion-preset radio
 * buttons (with a Small / Medium / Large ring choice for the circular preset), and
 * trace-mode radio buttons. All labels come from StringManager and all
 * colors from LadyBugColors.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { type Node, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { AquaRadioButtonGroup, Panel, VerticalCheckboxGroup } from "scenerystack/sun";
import { StringManager } from "../../i18n/StringManager.js";
import LadyBugColors from "../../LadyBugColors.js";
import { CircleSize } from "../model/CircleSize.js";
import type { LadyBugModel } from "../model/LadyBugModel.js";
import { MotionType } from "../model/MotionType.js";
import { TraceMode } from "../model/TraceMode.js";

// Point size for section-title text (e.g. "Vectors", "Motion", "Trace").
const TITLE_FONT_SIZE = 16;
const TITLE_FONT = new PhetFont({ size: TITLE_FONT_SIZE, weight: "bold" });

// Point size for option-label text (checkbox labels, radio-button labels).
const LABEL_FONT_SIZE = 14;
const LABEL_FONT = new PhetFont(LABEL_FONT_SIZE);

// Smaller point size for the circle-size radio buttons so they fit on one row.
const SMALL_LABEL_FONT_SIZE = 12;
const SMALL_LABEL_FONT = new PhetFont(SMALL_LABEL_FONT_SIZE);

// Indent (px) of the circle-size sub-control under the motion radio buttons.
const SUB_CONTROL_INDENT = 22;

// Radius (px) and spacing (px) of the circle-size radio buttons.
const SMALL_RADIO_BUTTON_RADIUS = 6;
const SMALL_RADIO_BUTTON_SPACING = 10;

// Pixel gap between the two vector-visibility checkboxes.
const CHECKBOX_SPACING = 8;

// Radius (px) of the radio-button circles used in motion and trace groups.
const RADIO_BUTTON_RADIUS = 8;

// Pixel gap between individual radio buttons within each group.
const RADIO_BUTTON_SPACING = 6;

// Pixel gap between the horizontally laid-out trace radio buttons.
const TRACE_RADIO_BUTTON_SPACING = 14;

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

function labelText(stringProperty: TReadOnlyProperty<string>, font = LABEL_FONT): Node {
  return new Text(stringProperty, { font, fill: LadyBugColors.foregroundColorProperty });
}

export class VectorsControlPanel extends Panel {
  public constructor(model: LadyBugModel) {
    const strings = StringManager.getInstance();
    const vectors = strings.getVectorsStrings();
    const motion = strings.getMotionStrings();
    const trace = strings.getTraceStrings();

    const checkboxGroup = new VerticalCheckboxGroup(
      [
        { property: model.showPositionProperty, createNode: () => labelText(vectors.showPositionStringProperty) },
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
        { value: MotionType.ELLIPTICAL, createNode: () => labelText(motion.ellipticalStringProperty) },
        // Circular is listed last so its ring-size row sits directly beneath it.
        { value: MotionType.CIRCULAR, createNode: () => labelText(motion.circularStringProperty) },
      ],
      { spacing: RADIO_BUTTON_SPACING, radioButtonOptions, accessibleName: motion.titleStringProperty },
    );

    // Ring size for the circular preset; only meaningful (and enabled) while Circular is selected.
    // It sits indented right under "Circular", so it has no visible title (only an accessible name).
    const isCircularProperty = new DerivedProperty([model.motionTypeProperty], (type) => type === MotionType.CIRCULAR);
    const circleSizeRadioGroup = new AquaRadioButtonGroup<CircleSize>(
      model.circleSizeProperty,
      [
        { value: CircleSize.SMALL, createNode: () => labelText(motion.smallStringProperty, SMALL_LABEL_FONT) },
        { value: CircleSize.MEDIUM, createNode: () => labelText(motion.mediumStringProperty, SMALL_LABEL_FONT) },
        { value: CircleSize.LARGE, createNode: () => labelText(motion.largeStringProperty, SMALL_LABEL_FONT) },
      ],
      {
        orientation: "horizontal",
        spacing: SMALL_RADIO_BUTTON_SPACING,
        radioButtonOptions: { ...radioButtonOptions, radius: SMALL_RADIO_BUTTON_RADIUS },
        enabledProperty: isCircularProperty,
        accessibleName: motion.radiusStringProperty,
        layoutOptions: { leftMargin: SUB_CONTROL_INDENT },
      },
    );

    const traceRadioGroup = new AquaRadioButtonGroup<TraceMode>(
      model.traceModeProperty,
      [
        { value: TraceMode.LINE, createNode: () => labelText(trace.lineStringProperty) },
        { value: TraceMode.DOTS, createNode: () => labelText(trace.dotsStringProperty) },
        { value: TraceMode.OFF, createNode: () => labelText(trace.offStringProperty) },
      ],
      // Horizontal to keep the right-hand column short enough for the Remote Control panel.
      {
        orientation: "horizontal",
        spacing: TRACE_RADIO_BUTTON_SPACING,
        radioButtonOptions,
        accessibleName: trace.titleStringProperty,
      },
    );

    const content = new VBox({
      align: "left",
      spacing: VBOX_SPACING,
      children: [
        titleText(vectors.titleStringProperty),
        checkboxGroup,
        titleText(motion.titleStringProperty),
        motionRadioGroup,
        circleSizeRadioGroup,
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
