/**
 * PlaybackControls.ts
 *
 * Record/Playback toggle, rewind / play-pause / step transport buttons, and a Clear
 * button. (Reset All lives in the screen view.)
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { HBox, type Node, Text } from "scenerystack/scenery";
import { PhetFont, PlayPauseButton, StepBackwardButton, StepForwardButton } from "scenerystack/scenery-phet";
import { AquaRadioButtonGroup, TextPushButton } from "scenerystack/sun";
import { StringManager } from "../../i18n/StringManager.js";
import LadyBugColors from "../../LadyBugColors.js";
import type { LadyBugModel } from "../model/LadyBugModel.js";

// Point size used for radio-button labels and the Clear button text.
const LABEL_FONT_SIZE = 14;
const LABEL_FONT = new PhetFont(LABEL_FONT_SIZE);

// Pixel gap between the Record and Playback radio buttons.
const RADIO_BUTTON_SPACING = 12;

// Radius (px) of the radio-button circles.
const RADIO_BUTTON_RADIUS = 8;

// Radius (px) of the rewind and step-forward transport buttons.
const TRANSPORT_BUTTON_RADIUS = 18;

// Radius (px) of the play/pause button; slightly larger so it reads as the primary action.
const PLAY_PAUSE_BUTTON_RADIUS = 22;

// Pixel gap between the button groups in the playback bar.
const CONTROLS_SPACING = 16;

function labelText(stringProperty: TReadOnlyProperty<string>): Node {
  return new Text(stringProperty, { font: LABEL_FONT, fill: LadyBugColors.foregroundColorProperty });
}

export class PlaybackControls extends HBox {
  public constructor(model: LadyBugModel) {
    const playback = StringManager.getInstance().getPlaybackStrings();
    const a11y = StringManager.getInstance().getA11yStrings();

    const recordPlaybackGroup = new AquaRadioButtonGroup<boolean>(
      model.recordingProperty,
      [
        { value: true, createNode: () => labelText(playback.recordStringProperty) },
        { value: false, createNode: () => labelText(playback.playbackStringProperty) },
      ],
      {
        orientation: "horizontal",
        spacing: RADIO_BUTTON_SPACING,
        radioButtonOptions: { radius: RADIO_BUTTON_RADIUS, stroke: LadyBugColors.foregroundColorProperty },
        accessibleName: a11y.controls.recordModeStringProperty,
      },
    );

    const rewindButton = new StepBackwardButton({
      radius: TRANSPORT_BUTTON_RADIUS,
      listener: () => model.rewind(),
      accessibleName: a11y.controls.rewindStringProperty,
    });

    const playPauseButton = new PlayPauseButton(model.isPlayingProperty, {
      radius: PLAY_PAUSE_BUTTON_RADIUS,
      startPlayingAccessibleName: a11y.controls.playPauseStartStringProperty,
      endPlayingAccessibleName: a11y.controls.playPauseEndStringProperty,
    });

    const stepForwardButton = new StepForwardButton({
      radius: TRANSPORT_BUTTON_RADIUS,
      enabledProperty: DerivedProperty.not(model.isPlayingProperty),
      listener: () => model.stepOnce(),
      accessibleName: a11y.controls.stepForwardStringProperty,
    });

    const clearButton = new TextPushButton(playback.clearStringProperty, {
      font: LABEL_FONT,
      listener: () => model.clear(),
    });

    super({
      spacing: CONTROLS_SPACING,
      align: "center",
      children: [recordPlaybackGroup, rewindButton, playPauseButton, stepForwardButton, clearButton],
    });
  }
}
