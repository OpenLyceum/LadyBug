/**
 * LadybugTraceNode.ts
 *
 * Draws the ladybug's recorded path as either a line or a series of dots, fading
 * each segment toward a low opacity over a couple of seconds. Uses a CanvasNode so
 * that each segment can be stroked with its own alpha cheaply.
 */

import { DerivedProperty } from "scenerystack/axon";
import type { Bounds2 } from "scenerystack/dot";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { CanvasNode } from "scenerystack/scenery";
import { StringManager } from "../../i18n/StringManager.js";
import LadyBugColors from "../../LadyBugColors.js";
import LadyBugConstants from "../../LadyBugConstants.js";
import type { LadyBugModel } from "../model/LadyBugModel.js";
import { TraceMode } from "../model/TraceMode.js";

// In "dots" mode only every Nth history sample is rendered; this keeps the dots
// visually sparse and reduces per-frame canvas work at high recording rates.
const DOT_HISTORY_STRIDE = 4;

// Radius (px) of each dot in "dots" trace mode.
const DOT_RADIUS = 2;

// Stroke width (px) used when drawing the trace as a continuous line.
const LINE_STROKE_WIDTH = 3;

export class LadybugTraceNode extends CanvasNode {
  private readonly model: LadyBugModel;
  private readonly modelViewTransform: ModelViewTransform2;

  public constructor(model: LadyBugModel, modelViewTransform: ModelViewTransform2, canvasBounds: Bounds2) {
    const a11y = StringManager.getInstance().getA11yStrings();
    const traceHelpProperty = new DerivedProperty(
      [
        model.traceModeProperty,
        a11y.trace.lineHelpStringProperty,
        a11y.trace.dotsHelpStringProperty,
        a11y.trace.offHelpStringProperty,
      ],
      (mode, lineHelp, dotsHelp, offHelp) =>
        mode === TraceMode.LINE ? lineHelp : mode === TraceMode.DOTS ? dotsHelp : offHelp,
    );
    super({
      canvasBounds,
      tagName: "figure",
      accessibleName: a11y.trace.nodeNameStringProperty,
      accessibleHelpText: traceHelpProperty,
    });
    this.model = model;
    this.modelViewTransform = modelViewTransform;

    const repaint = () => this.invalidatePaint();
    model.historyAddedEmitter.addListener(repaint);
    model.historyRemovedEmitter.addListener(repaint);
    model.timeProperty.link(repaint);
    LadyBugColors.traceProperty.link(repaint);
    model.traceModeProperty.link((mode) => {
      this.visible = mode !== TraceMode.OFF;
      repaint();
    });
  }

  private opacityForState(time: number, stateTime: number): number {
    const age = time - stateTime;
    const oldOpacity = LadyBugConstants.TRACE_OLD_OPACITY;
    const newOpacity = LadyBugConstants.TRACE_NEW_OPACITY;
    if (age >= LadyBugConstants.TRACE_SECONDS_TO_BE_OLD) {
      return oldOpacity;
    }
    return newOpacity + (oldOpacity - newOpacity) * (age / LadyBugConstants.TRACE_SECONDS_TO_BE_OLD);
  }

  public override paintCanvas(context: CanvasRenderingContext2D): void {
    const mode = this.model.traceModeProperty.value;
    if (mode === TraceMode.OFF) {
      return;
    }

    const history = this.model.culledStateHistory;
    if (history.length === 0) {
      return;
    }
    const time = this.model.timeProperty.value;
    const colorCss = LadyBugColors.traceProperty.value.toCSS();
    const mvt = this.modelViewTransform;

    if (mode === TraceMode.DOTS) {
      context.fillStyle = colorCss;
      for (let i = 0; i < history.length; i += DOT_HISTORY_STRIDE) {
        const state = history[i];
        if (!state) {
          continue;
        }
        const point = mvt.modelToViewPosition(state.position);
        context.globalAlpha = this.opacityForState(time, state.time);
        context.beginPath();
        context.arc(point.x, point.y, DOT_RADIUS, 0, 2 * Math.PI);
        context.fill();
      }
    } else {
      context.strokeStyle = colorCss;
      context.lineWidth = LINE_STROKE_WIDTH;
      context.lineCap = "round";
      for (let i = 1; i < history.length; i++) {
        const a = history[i - 1];
        const b = history[i];
        if (!(a && b)) {
          continue;
        }
        const pa = mvt.modelToViewPosition(a.position);
        const pb = mvt.modelToViewPosition(b.position);
        context.globalAlpha = this.opacityForState(time, b.time);
        context.beginPath();
        context.moveTo(pa.x, pa.y);
        context.lineTo(pb.x, pb.y);
        context.stroke();
      }
    }
    context.globalAlpha = 1;
  }
}
