/**
 * SeekBar.ts
 *
 * A timeline scrubber for the recorded motion. The filled "progress" region shows how
 * much has been recorded; the handle shows (and, when paused or in playback, sets) the
 * current playback time.
 */

import { DragListener, Node, Rectangle, RichDragListener } from "scenerystack/scenery";
import { StringManager } from "../../i18n/StringManager.js";
import LadyBugColors from "../../LadyBugColors.js";
import type { LadyBugModel } from "../model/LadyBugModel.js";

/** How far the seek handle's touch and mouse areas reach past its drawn edge, px. */
const HANDLE_TOUCH_DILATION = 10;
const HANDLE_MOUSE_DILATION = 4;

// Height (px) of the seek-bar track and progress fill.
const BAR_HEIGHT = 10;

// Width (px) of the draggable seek handle rectangle.
const HANDLE_WIDTH = 12;

// Amount (px) the handle extends above and below the bar on each side,
// making it easier to grab while staying visually centered on the track.
const HANDLE_OVERHANG = 5;

// Corner radius (px) of the seek handle rectangle.
const HANDLE_CORNER_RADIUS = 3;

// Semi-transparent border rendered around the seek handle for visual separation.
const HANDLE_STROKE = "rgba(0,0,0,0.4)";

// View-pixel step the timeline scrubs per arrow-key press; Shift is the fine step.
const SEEK_KEY_DELTA = 8;
const SEEK_KEY_SHIFT_DELTA = 2;

export class SeekBar extends Node {
  public constructor(model: LadyBugModel, width: number) {
    super({
      tagName: "div",
      focusable: true,
      accessibleName: StringManager.getInstance().getA11yStrings().controls.seekBarNameStringProperty,
    });

    const track = new Rectangle(0, 0, width, BAR_HEIGHT, {
      fill: LadyBugColors.seekBarTrackProperty,
      cornerRadius: BAR_HEIGHT / 2,
    });
    const progress = new Rectangle(0, 0, width, BAR_HEIGHT, {
      fill: LadyBugColors.seekBarProgressProperty,
      cornerRadius: BAR_HEIGHT / 2,
    });
    const handle = new Rectangle(-HANDLE_WIDTH / 2, -HANDLE_OVERHANG, HANDLE_WIDTH, BAR_HEIGHT + 2 * HANDLE_OVERHANG, {
      fill: LadyBugColors.seekBarHandleProperty,
      stroke: HANDLE_STROKE,
      cornerRadius: HANDLE_CORNER_RADIUS,
      cursor: "pointer",
    });
    this.children = [track, progress, handle];

    const maxTime = (): number => Math.max(model.furthestRecordedTimeProperty.value, model.maxRecordingTime);
    const scrubbable = (): boolean => !(model.isPlayingProperty.value && model.recordingProperty.value);

    const updateProgress = (): void => {
      const furthest = model.furthestRecordedTimeProperty.value;
      const max = maxTime();
      const w = max > 0 ? (furthest / max) * width : 0;
      progress.rectWidth = Math.max(0, w);
      progress.visible = w > 0;
    };

    const updateHandle = (): void => {
      const furthest = model.furthestRecordedTimeProperty.value;
      const percent = furthest > 0 ? Math.min(1, model.timeProperty.value / furthest) : 0;
      handle.centerX = percent * width;
      handle.centerY = BAR_HEIGHT / 2;
    };

    const updateVisibility = (): void => {
      handle.visible = scrubbable();
    };

    model.furthestRecordedTimeProperty.link(() => {
      updateProgress();
      updateHandle();
    });
    model.timeProperty.link(updateHandle);
    model.isPlayingProperty.link(updateVisibility);
    model.recordingProperty.link(updateVisibility);

    const seekToLocalX = (localX: number): void => {
      if (!scrubbable()) {
        return;
      }
      const max = maxTime();
      if (max <= 0) {
        return;
      }
      const progressWidth = (model.furthestRecordedTimeProperty.value / max) * width;
      const x = Math.max(0, Math.min(progressWidth, localX));
      model.setTime((x / width) * max);
    };

    const seekListener = new RichDragListener({
      dragListenerOptions: {
        drag: (event) => seekToLocalX(this.globalToLocalPoint(event.pointer.point).x),
      },
      keyboardDragListenerOptions: {
        keyboardDragDirection: "leftRight",
        dragDelta: SEEK_KEY_DELTA,
        shiftDragDelta: SEEK_KEY_SHIFT_DELTA,
        drag: (_event, listener) => {
          seekToLocalX(handle.centerX + listener.modelDelta.x);
        },
      },
    });
    // Pointer drag grabs the handle; the keyboard half goes on `this`, the focusable Node.
    // hotkeyManager only activates hotkeys for listeners on Nodes in the focus trail, so a
    // listener on the (non-focusable) handle would never see an arrow key.
    // The handle is narrow; a larger target makes it easy to grab by touch.
    handle.touchArea = handle.localBounds.dilated(HANDLE_TOUCH_DILATION);
    handle.mouseArea = handle.localBounds.dilated(HANDLE_MOUSE_DILATION);
    handle.addInputListener(seekListener.dragListener);
    this.addInputListener(seekListener.keyboardDragListener);
    track.addInputListener(
      new DragListener({
        press: (event) => seekToLocalX(this.globalToLocalPoint(event.pointer.point).x),
        drag: (event) => seekToLocalX(this.globalToLocalPoint(event.pointer.point).x),
      }),
    );
  }
}
