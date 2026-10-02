import { DerivedProperty } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Node } from "scenerystack/scenery";
import { PhetFont, ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { TextPushButton } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/LadyBugButtonOptions.js";
import { StringManager } from "../../i18n/StringManager.js";
import LadyBugColors from "../../LadyBugColors.js";
import LadyBugConstants from "../../LadyBugConstants.js";
import type { LadyBugModel } from "../model/LadyBugModel.js";
import { LadyBugScreenSummaryContent } from "./LadyBugScreenSummaryContent.js";
import { LadybugNode } from "./LadybugNode.js";
import { LadybugTraceNode } from "./LadybugTraceNode.js";
import { LadybugVectorsNode } from "./LadybugVectorsNode.js";
import { PlaybackControls } from "./PlaybackControls.js";
import { RemoteControlPanel } from "./RemoteControlPanel.js";
import { SeekBar } from "./SeekBar.js";
import { VectorsControlPanel } from "./VectorsControlPanel.js";

type LadyBugScreenViewOptions = ScreenViewOptions & { tandem: Tandem };

// Pixel margin around the play area and between all adjacent UI elements.
const MARGIN = 12;

// Pixel height reserved below the play area for the seek bar and playback controls.
const BOTTOM_CONTROLS_HEIGHT = 100;

// Point size for the "Return Ladybug" button label.
const RETURN_BUTTON_FONT_SIZE = 16;

/**
 * LadyBugScreenView
 *
 * Lays out the play area (with the ladybug, its vectors, and the motion trace), the
 * right-hand control panels, and the bottom playback timeline.
 */
export class LadyBugScreenView extends ScreenView {
  private readonly remoteControlPanel: RemoteControlPanel;

  public constructor(model: LadyBugModel, providedOptions: LadyBugScreenViewOptions) {
    const options = optionize<LadyBugScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
      {
        screenSummaryContent: new LadyBugScreenSummaryContent(model),
      },
      providedOptions,
    );
    super(options);

    const layoutBounds = this.layoutBounds;

    // Right-hand control column.
    const vectorsControlPanel = new VectorsControlPanel(model);
    const remoteControlPanel = new RemoteControlPanel(model);
    this.remoteControlPanel = remoteControlPanel;
    const columnWidth = Math.max(vectorsControlPanel.width, remoteControlPanel.width);

    // Play area occupies the space left of the control column and above the bottom controls.
    const usableWidth = layoutBounds.width - columnWidth - 3 * MARGIN;
    const usableHeight = layoutBounds.height - BOTTOM_CONTROLS_HEIGHT - 2 * MARGIN;
    const playAreaCenterX = MARGIN + usableWidth / 2;
    const playAreaCenterY = MARGIN + usableHeight / 2;
    const scale = Math.min(usableWidth, usableHeight) / LadyBugConstants.SCENE_DIAMETER;

    // Non-inverted Y mapping (model +Y is down on screen), matching the original sim so
    // the tuned motion presets, vectors, and heading angles behave identically.
    const modelViewTransform = ModelViewTransform2.createSinglePointScaleMapping(
      Vector2.ZERO,
      new Vector2(playAreaCenterX, playAreaCenterY),
      scale,
    );

    const topLeft = modelViewTransform.viewToModelXY(
      playAreaCenterX - usableWidth / 2,
      playAreaCenterY - usableHeight / 2,
    );
    const bottomRight = modelViewTransform.viewToModelXY(
      playAreaCenterX + usableWidth / 2,
      playAreaCenterY + usableHeight / 2,
    );
    model.setBounds(topLeft.x, topLeft.y, bottomRight.x, bottomRight.y);

    const traceNode = new LadybugTraceNode(model, modelViewTransform, layoutBounds);
    const ladybugNode = new LadybugNode(model, modelViewTransform);
    const vectorsNode = new LadybugVectorsNode(model, modelViewTransform);

    const returnButton = new TextPushButton(StringManager.getInstance().getReturnLadybugStringProperty(), {
      font: new PhetFont(RETURN_BUTTON_FONT_SIZE),
      baseColor: LadyBugColors.returnButtonFillProperty,
      visibleProperty: new DerivedProperty([model.ladybug.positionProperty], () => model.ladybugOutOfBounds()),
      listener: () => model.returnLadybug(),
    });

    const playbackControls = new PlaybackControls(model);
    const seekBar = new SeekBar(model, usableWidth);

    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
        this.reset();
      },
      right: layoutBounds.maxX - MARGIN,
      bottom: layoutBounds.maxY - MARGIN,
      tandem: providedOptions.tandem.createTandem("resetAllButton"),
      accessibleName: StringManager.getInstance().getA11yStrings().controls.resetAllStringProperty,
    });

    // Position everything, and again whenever a piece changes size: with the
    // runtime language switch a longer translation widens a panel or the
    // playback row, and fixed positions would push it past the margin.
    const layout = (): void => {
      vectorsControlPanel.right = layoutBounds.maxX - MARGIN;
      vectorsControlPanel.top = MARGIN;
      remoteControlPanel.right = layoutBounds.maxX - MARGIN;
      remoteControlPanel.top = vectorsControlPanel.bottom + MARGIN;

      returnButton.centerX = playAreaCenterX;
      returnButton.top = MARGIN;

      seekBar.centerX = playAreaCenterX;
      // Place the seek bar at the top of the bottom-controls band, offset by one MARGIN.
      seekBar.bottom = layoutBounds.maxY - BOTTOM_CONTROLS_HEIGHT + MARGIN;
      playbackControls.centerX = playAreaCenterX;
      playbackControls.bottom = layoutBounds.maxY - MARGIN;
    };
    // These nodes live as long as the screen, so the links are never removed.
    for (const node of [vectorsControlPanel, remoteControlPanel, returnButton, seekBar, playbackControls]) {
      node.localBoundsProperty.lazyLink(layout);
    }
    layout();

    this.children = [
      traceNode,
      ladybugNode,
      vectorsNode,
      returnButton,
      vectorsControlPanel,
      remoteControlPanel,
      seekBar,
      playbackControls,
      resetAllButton,
    ];

    // ── Accessibility: keyboard / reading traversal order ───────────────────────
    // Deterministic Tab/reading order: the draggable ladybug first, then the
    // controls, seek bar, playback controls, and Reset All last. ScreenView throws
    // if you set pdomOrder on itself, so use a wrapper Node.
    this.addChild(
      new Node({
        pdomOrder: [
          ladybugNode,
          vectorsControlPanel,
          remoteControlPanel,
          returnButton,
          seekBar,
          playbackControls,
          resetAllButton,
        ],
      }),
    );
  }

  public reset(): void {
    this.remoteControlPanel.reset();
  }
}
