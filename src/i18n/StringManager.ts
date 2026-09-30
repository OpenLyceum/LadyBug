/**
 * StringManager.ts
 *
 * Centralizes string management for LadyBug.
 * Provides access to localized strings for all components.
 */

import type { ReadOnlyProperty } from "scenerystack/axon";
import { LocalizedString } from "scenerystack/chipper";
import stringsEn from "./strings_en.json";
import stringsEs from "./strings_es.json";
import stringsFr from "./strings_fr.json";

// ── Compile-time key-parity check ─────────────────────────────────────────────
// English is the canonical shape; every other locale must match it exactly.
// TypeScript errors here if any locale file is missing (or adds) a key relative to
// English. Add one `satisfies` line per new locale so the check stays exhaustive.
// biome-ignore lint/complexity/noVoid: intentional compile-time type assertion
void (stringsFr satisfies typeof stringsEn);
// biome-ignore lint/complexity/noVoid: intentional compile-time type assertion
void (stringsEn satisfies typeof stringsFr);
// biome-ignore lint/complexity/noVoid: intentional compile-time type assertion
void (stringsEs satisfies typeof stringsEn);
// biome-ignore lint/complexity/noVoid: intentional compile-time type assertion
void (stringsEn satisfies typeof stringsEs);

// ── Build the reactive string property tree ───────────────────────────────────
const stringProperties = LocalizedString.getNestedStringProperties({
  en: stringsEn,
  fr: stringsFr,
  es: stringsEs,
});

export class StringManager {
  private static instance: StringManager | null = null;

  private constructor() {
    // Private — obtain via getInstance()
  }

  public static getInstance(): StringManager {
    if (StringManager.instance === null) {
      StringManager.instance = new StringManager();
    }
    return StringManager.instance;
  }

  public getTitleStringProperty(): ReadOnlyProperty<string> {
    return stringProperties.titleStringProperty;
  }

  /**
   * Accessibility (Interactive Description) StringProperties: the screen-summary
   * regions and the live current-details template. See the shared OpenLyceum
   * ACCESSIBILITY.md convention.
   */
  public getA11yStrings() {
    return stringProperties.a11y;
  }

  public getScreenNames(): { ladyBugStringProperty: ReadOnlyProperty<string> } {
    return {
      ladyBugStringProperty: stringProperties.screens.ladyBugStringProperty,
    };
  }

  public getVectorsStrings() {
    return stringProperties.vectors;
  }

  public getMotionStrings() {
    return stringProperties.motion;
  }

  public getTraceStrings() {
    return stringProperties.trace;
  }

  public getRemoteControlStrings() {
    return stringProperties.remoteControl;
  }

  public getPlaybackStrings() {
    return stringProperties.playback;
  }

  public getReturnLadybugStringProperty(): ReadOnlyProperty<string> {
    return stringProperties.returnLadybugStringProperty;
  }

  public getKeyboardHelpStrings() {
    return stringProperties.keyboardHelp;
  }

  /** Simulation-specific preference labels shown in Preferences → Simulation. */
  public getPreferences() {
    return stringProperties.preferences;
  }
}
