/**
 * RemoteControlPanel.ts
 *
 * Lets the user steer the ladybug indirectly by dragging an arrow inside a square pad.
 * A Position / Velocity / Acceleration selector picks which quantity the arrow controls
 * (and reflects, when the user isn't dragging).
 */

import { Multilink, Property } from "scenerystack/axon";
import { Bounds2, clamp, Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Circle, Node, Rectangle, RichDragListener, Text, VBox } from "scenerystack/scenery";
import { ArrowNode, PhetFont } from "scenerystack/scenery-phet";
import { Panel, RectangularRadioButtonGroup } from "scenerystack/sun";
import { StringManager } from "../../i18n/StringManager.js";
import LadyBugColors from "../../LadyBugColors.js";
import LadyBugConstants from "../../LadyBugConstants.js";
import type { LadyBugModel } from "../model/LadyBugModel.js";
import { MotionType } from "../model/MotionType.js";
import { UpdateMode } from "../model/UpdateMode.js";

const AREA = LadyBugConstants.REMOTE_PAD_SIZE;
const HALF = AREA / 2;

// ── Typography ────────────────────────────────────────────────────────────────

// Point size of the panel title ("Remote Control").
const TITLE_FONT_SIZE = 16;

// Point size of the mode-selector tab labels (Position / Velocity / Acceleration).
const TAB_FONT_SIZE = 13;

// ── Arrow (direction indicator inside the pad) ────────────────────────────────
//
// These dimensions intentionally match the vector arrows in LadybugVectorsNode so
// the direction indicator uses a consistent visual language.

// Width (px) of the arrowhead.
const ARROW_HEAD_WIDTH = 14;

// Height (px) of the arrowhead.
const ARROW_HEAD_HEIGHT = 14;

// Width (px) of the arrow shaft.
const ARROW_TAIL_WIDTH = 5;

// ── Control knob ──────────────────────────────────────────────────────────────

// Radius (px) of the draggable knob that sits at the arrow tip.
const KNOB_RADIUS = 9;

// Semi-transparent border on the knob for visual separation from the pad background.
const KNOB_STROKE = "rgba(0,0,0,0.4)";

// ── Layout & panel styling ────────────────────────────────────────────────────

// Pixel gap between the mode-selector tab buttons.
const TAB_SPACING = 4;

// Corner radius (px) of the drag-pad background rectangle.
const PAD_CORNER_RADIUS = 4;

// Corner radius (px) of the outer Panel container.
const PANEL_CORNER_RADIUS = 6;

// Horizontal padding (px) inside the outer Panel.
const PANEL_X_MARGIN = 12;

// Vertical padding (px) inside the outer Panel.
const PANEL_Y_MARGIN = 10;

// Vertical spacing (px) between the title, tab row, and pad inside the VBox.
const VBOX_SPACING = 8;

const COLOR_BY_MODE = {
  [UpdateMode.POSITION]: LadyBugColors.positionVectorProperty,
  [UpdateMode.VELOCITY]: LadyBugColors.velocityVectorProperty,
  [UpdateMode.ACCELERATION]: LadyBugColors.accelerationVectorProperty,
};

export class RemoteControlPanel extends Panel {
  private readonly selectedModeProperty: Property<UpdateMode>;

  public constructor(model: LadyBugModel) {
    const strings = StringManager.getInstance();
    const remote = strings.getRemoteControlStrings();
    const a11y = strings.getA11yStrings();
    const selectedModeProperty = new Property<UpdateMode>(UpdateMode.POSITION);

    const titleFont = new PhetFont({ size: TITLE_FONT_SIZE, weight: "bold" });
    const tabFont = new PhetFont(TAB_FONT_SIZE);

    const header = new Text(remote.titleStringProperty, {
      font: titleFont,
      fill: LadyBugColors.foregroundColorProperty,
    });

    const tabs = new RectangularRadioButtonGroup<UpdateMode>(
      selectedModeProperty,
      [
        {
          value: UpdateMode.POSITION,
          createNode: () => new Text(remote.positionStringProperty, { font: tabFont, fill: COLOR_BY_MODE.position }),
        },
        {
          value: UpdateMode.VELOCITY,
          createNode: () => new Text(remote.velocityStringProperty, { font: tabFont, fill: COLOR_BY_MODE.velocity }),
        },
        {
          value: UpdateMode.ACCELERATION,
          createNode: () =>
            new Text(remote.accelerationStringProperty, { font: tabFont, fill: COLOR_BY_MODE.acceleration }),
        },
      ],
      {
        orientation: "horizontal",
        spacing: TAB_SPACING,
        radioButtonOptions: { baseColor: LadyBugColors.tabButtonFillProperty },
        accessibleName: remote.titleStringProperty,
      },
    );

    const padBackground = new Rectangle(-HALF, -HALF, AREA, AREA, {
      fill: LadyBugColors.remotePadFillProperty,
      cornerRadius: PAD_CORNER_RADIUS,
    });
    const arrow = new ArrowNode(0, 0, 0, 0, {
      headWidth: ARROW_HEAD_WIDTH,
      headHeight: ARROW_HEAD_HEIGHT,
      tailWidth: ARROW_TAIL_WIDTH,
      stroke: null,
    });
    const knob = new Circle(KNOB_RADIUS, { cursor: "pointer", stroke: KNOB_STROKE });
    const padLayer = new Node({
      clipArea: Shape.bounds(new Bounds2(-HALF, -HALF, HALF, HALF)),
      children: [arrow, knob],
    });
    const pad = new Node({
      children: [padBackground, padLayer],
      tagName: "div",
      focusable: true,
      accessibleName: remote.titleStringProperty,
      accessibleHelpText: a11y.controls.remotePadHelpStringProperty,
    });

    const content = new VBox({ spacing: VBOX_SPACING, children: [header, tabs, pad] });
    super(content, {
      fill: LadyBugColors.panelFillProperty,
      stroke: LadyBugColors.panelStrokeProperty,
      cornerRadius: PANEL_CORNER_RADIUS,
      xMargin: PANEL_X_MARGIN,
      yMargin: PANEL_Y_MARGIN,
    });

    this.selectedModeProperty = selectedModeProperty;

    let isDragging = false;

    const setTip = (tip: Vector2): void => {
      arrow.setTailAndTip(0, 0, tip.x, tip.y);
      knob.center = tip;
    };

    // Model → arrow (when the user isn't dragging).
    const reflect = (): void => {
      if (isDragging) {
        return;
      }
      const ladybug = model.ladybug;
      let tip: Vector2;
      if (selectedModeProperty.value === UpdateMode.POSITION) {
        // The same scale as apply() below (the play area's smaller side), so a
        // released knob stays where it was dropped instead of jumping.
        const bounds = model.getBounds();
        const minDim = Math.min(bounds.width, bounds.height) || 1;
        tip = new Vector2((ladybug.position.x / minDim) * AREA, (ladybug.position.y / minDim) * AREA);
      } else if (selectedModeProperty.value === UpdateMode.VELOCITY) {
        tip = ladybug.velocity.timesScalar(AREA);
      } else {
        tip = ladybug.acceleration.timesScalar(AREA);
      }
      setTip(new Vector2(clamp(tip.x, -HALF, HALF), clamp(tip.y, -HALF, HALF)));
    };

    // Arrow → model.
    const apply = (tip: Vector2): void => {
      const ladybug = model.ladybug;
      if (selectedModeProperty.value === UpdateMode.POSITION) {
        const bounds = model.getBounds();
        const minDim = Math.min(bounds.width, bounds.height);
        model.setSamplePoint(new Vector2((tip.x / AREA) * minDim, (tip.y / AREA) * minDim));
      } else if (selectedModeProperty.value === UpdateMode.VELOCITY) {
        ladybug.setVelocityXY(tip.x / AREA, tip.y / AREA);
      } else {
        ladybug.setAccelerationXY(tip.x / AREA, tip.y / AREA);
      }
    };

    const beginRemoteDrag = (): void => {
      isDragging = true;
      model.recordingProperty.value = true;
      model.motionTypeProperty.value = MotionType.MANUAL;
      model.updateModeProperty.value = selectedModeProperty.value;
      model.play();
      if (selectedModeProperty.value === UpdateMode.POSITION) {
        model.startSampling();
      }
    };
    const endRemoteDrag = (): void => {
      if (selectedModeProperty.value === UpdateMode.POSITION) {
        model.stopSampling();
      }
      isDragging = false;
    };
    const remoteDragListener = new RichDragListener({
      dragListenerOptions: {
        start: beginRemoteDrag,
        drag: (event) => {
          const local = padLayer.globalToLocalPoint(event.pointer.point);
          const tip = new Vector2(clamp(local.x, -HALF, HALF), clamp(local.y, -HALF, HALF));
          setTip(tip);
          apply(tip);
        },
        end: endRemoteDrag,
      },
      keyboardDragListenerOptions: {
        dragSpeed: 120,
        shiftDragSpeed: 40,
        start: beginRemoteDrag,
        drag: (_event, listener) => {
          const tip = new Vector2(
            clamp(knob.centerX + listener.modelDelta.x, -HALF, HALF),
            clamp(knob.centerY + listener.modelDelta.y, -HALF, HALF),
          );
          setTip(tip);
          apply(tip);
        },
        end: endRemoteDrag,
      },
    });
    knob.addInputListener(remoteDragListener.dragListener);
    // Keyboard hotkeys must be attached to the focusable pad, not the decorative knob.
    pad.addInputListener(remoteDragListener.keyboardDragListener);

    const applyArrowColor = (): void => {
      const color = COLOR_BY_MODE[selectedModeProperty.value];
      arrow.fill = color;
      knob.fill = color;
    };
    selectedModeProperty.link(applyArrowColor);

    Multilink.multilink(
      [
        model.ladybug.positionProperty,
        model.ladybug.velocityProperty,
        model.ladybug.accelerationProperty,
        selectedModeProperty,
      ],
      reflect,
    );
  }

  public reset(): void {
    this.selectedModeProperty.reset();
  }
}
