/**
 * LadyBugKeyboardHelpContent.ts
 *
 * Content for the keyboard-help dialog (the "?" button in the navigation bar).
 * The ladybug and the remote-control knob are dragged in two dimensions by
 * RichDragListener (arrow keys or WASD, Shift for a smaller step). The playback
 * handle is left/right only; its rows use the same key strings KeyboardDragListener
 * binds for keyboardDragDirection "leftRight", and they are not given a second
 * listener.
 */

import { HotkeyData } from "scenerystack/scenery";
import {
  BasicActionsKeyboardHelpSection,
  KeyboardHelpSection,
  KeyboardHelpSectionRow,
  MoveDraggableItemsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";
import { StringManager } from "../../i18n/StringManager.js";

const seekStrings = StringManager.getInstance().getKeyboardHelpStrings();

// Matches KeyboardDragListener's left/right key strings (shift is an ignored modifier).
const seekMoveHotkeyData = new HotkeyData({
  keys: ["shift?+arrowLeft", "shift?+arrowRight", "shift?+a", "shift?+d"],
  repoName: "ladybug",
  keyboardHelpDialogLabelStringProperty: seekStrings.seekMoveStringProperty,
  keyboardHelpDialogPDOMLabelStringProperty: seekStrings.seekMoveDescriptionStringProperty,
});

// Shift changes drag speed inside that same listener; this row only documents it.
const seekSlowerHotkeyData = new HotkeyData({
  keys: ["shift+arrowLeft", "shift+arrowRight", "shift+a", "shift+d"],
  repoName: "ladybug",
  keyboardHelpDialogLabelStringProperty: seekStrings.seekSlowerStringProperty,
  keyboardHelpDialogPDOMLabelStringProperty: seekStrings.seekSlowerDescriptionStringProperty,
});

export class LadyBugKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    const moveItems = new MoveDraggableItemsKeyboardHelpSection();
    const seek = new KeyboardHelpSection(seekStrings.seekHeadingStringProperty, [
      KeyboardHelpSectionRow.fromHotkeyData(seekMoveHotkeyData),
      KeyboardHelpSectionRow.fromHotkeyData(seekSlowerHotkeyData),
    ]);
    KeyboardHelpSection.alignHelpSectionIcons([moveItems, seek]);

    super([moveItems, seek], [new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })]);
  }
}
