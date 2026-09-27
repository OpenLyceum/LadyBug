import { Color, ProfileColorProperty } from "scenerystack/scenery";
import LadyBugNamespace from "./LadyBugNamespace.js";

const { BLACK, WHITE } = Color;

// ── Panel fill colors ─────────────────────────────────────────────────────────
// Near-black / near-white neutral fills so panels contrast with both themes.
const PANEL_FILL_DARK = new Color(40, 40, 40);
const PANEL_FILL_LIGHT = new Color(240, 240, 240);

// Semi-transparent borders (40 % opacity) that stay visible on either fill.
const PANEL_STROKE_DARK = "rgba(255, 255, 255, 0.4)"; // white border on dark background
const PANEL_STROKE_LIGHT = "rgba(0, 0, 0, 0.4)"; // black border on light background

// ── Ladybug dark-mode fills ───────────────────────────────────────────────────
// On a black background pure-black elements (head, antennae, wing seam) are
// invisible. Dark mode uses medium-to-light grays so those parts remain visible.
const HEAD_FILL_DARK = new Color(55, 55, 55); // head / exposed back between open wings
const ANTENNA_FILL_DARK = new Color(190, 190, 190); // antenna lines + tips
const WING_SEAM_FILL_DARK = new Color(60, 60, 60); // centre-line on closed wings

// ── Remote-control pad fills ──────────────────────────────────────────────────
// White overlays at different opacities so the pad reads clearly on both themes.
const REMOTE_PAD_FILL_DARK = "rgba(255, 255, 255, 0.5)"; // 50 % white on dark background
const REMOTE_PAD_FILL_LIGHT = "rgba(255, 255, 255, 0.65)"; // 65 % white on light background

// Tab button base color for the mode-selector radio buttons.
const TAB_BUTTON_FILL_DARK = new Color(58, 58, 58); // dark gray — readable with bright vector labels
const TAB_BUTTON_FILL_LIGHT = new Color(245, 245, 245); // near-white — readable with dark vector labels

// ── Seek-bar track colors ─────────────────────────────────────────────────────
// Medium-dark / medium-light grays that contrast with their respective backgrounds.
const SEEK_TRACK_DARK = new Color(70, 70, 70);
const SEEK_TRACK_LIGHT = new Color(200, 200, 200);

// The drag handle uses white in dark mode; a medium gray in projector mode so it
// stays distinguishable on the lighter track.
const SEEK_HANDLE_LIGHT = new Color(80, 80, 80);

const LadyBugColors = {
  backgroundColorProperty: new ProfileColorProperty(LadyBugNamespace, "background", {
    default: BLACK,
    projector: WHITE,
  }),
  foregroundColorProperty: new ProfileColorProperty(LadyBugNamespace, "foreground", {
    default: WHITE,
    projector: BLACK,
  }),
  panelFillProperty: new ProfileColorProperty(LadyBugNamespace, "panelFill", {
    default: PANEL_FILL_DARK,
    projector: PANEL_FILL_LIGHT,
  }),
  panelStrokeProperty: new ProfileColorProperty(LadyBugNamespace, "panelStroke", {
    default: PANEL_STROKE_DARK,
    projector: PANEL_STROKE_LIGHT,
  }),

  // Motion vectors. Dark mode uses lighter/brighter variants for contrast against dark buttons.
  positionVectorProperty: new ProfileColorProperty(LadyBugNamespace, "positionVector", {
    default: "#6EB5FF",
    projector: "#1A5B9E",
  }),
  velocityVectorProperty: new ProfileColorProperty(LadyBugNamespace, "velocityVector", {
    default: "#FF7572",
    projector: "#A51A16",
  }),
  accelerationVectorProperty: new ProfileColorProperty(LadyBugNamespace, "accelerationVector", {
    default: "#5CD65C",
    projector: "#1B6B1B",
  }),

  // The ladybug itself.
  ladybugBodyProperty: new ProfileColorProperty(LadyBugNamespace, "ladybugBody", {
    default: "#D8262B",
    projector: "#C81E22",
  }),
  // Spots stay pure black in both profiles (ink on the red elytra).
  ladybugSpotsProperty: new ProfileColorProperty(LadyBugNamespace, "ladybugSpots", {
    default: BLACK,
    projector: BLACK,
  }),
  ladybugHeadProperty: new ProfileColorProperty(LadyBugNamespace, "ladybugHead", {
    default: HEAD_FILL_DARK,
    projector: BLACK,
  }),
  ladybugWingSeamProperty: new ProfileColorProperty(LadyBugNamespace, "ladybugWingSeam", {
    default: WING_SEAM_FILL_DARK,
    projector: BLACK,
  }),
  ladybugAntennaeProperty: new ProfileColorProperty(LadyBugNamespace, "ladybugAntennae", {
    default: ANTENNA_FILL_DARK,
    projector: BLACK,
  }),

  // The motion trace — flips with the theme so it stays visible on the background.
  traceProperty: new ProfileColorProperty(LadyBugNamespace, "trace", { default: WHITE, projector: BLACK }),

  // Remote-control pad.
  remotePadFillProperty: new ProfileColorProperty(LadyBugNamespace, "remotePadFill", {
    default: REMOTE_PAD_FILL_DARK,
    projector: REMOTE_PAD_FILL_LIGHT,
  }),
  tabButtonFillProperty: new ProfileColorProperty(LadyBugNamespace, "tabButtonFill", {
    default: TAB_BUTTON_FILL_DARK,
    projector: TAB_BUTTON_FILL_LIGHT,
  }),

  // "Return ladybug" button — slightly darker yellow in projector for white backgrounds.
  returnButtonFillProperty: new ProfileColorProperty(LadyBugNamespace, "returnButtonFill", {
    default: "#F6E652",
    projector: "#D4C020",
  }),

  // Seek bar / playback timeline.
  seekBarTrackProperty: new ProfileColorProperty(LadyBugNamespace, "seekBarTrack", {
    default: SEEK_TRACK_DARK,
    projector: SEEK_TRACK_LIGHT,
  }),
  // Progress fill — deeper blue in projector for contrast on the light track.
  seekBarProgressProperty: new ProfileColorProperty(LadyBugNamespace, "seekBarProgress", {
    default: "#2575BA",
    projector: "#1565A0",
  }),
  seekBarHandleProperty: new ProfileColorProperty(LadyBugNamespace, "seekBarHandle", {
    default: WHITE,
    projector: SEEK_HANDLE_LIGHT,
  }),

  // Fleet-standard aliases for shared Panel + ButtonOptions modules.
  panelBackgroundColorProperty: new ProfileColorProperty(LadyBugNamespace, "panelBackground", {
    default: PANEL_FILL_DARK,
    projector: PANEL_FILL_LIGHT,
  }),
  panelBorderColorProperty: new ProfileColorProperty(LadyBugNamespace, "panelBorder", {
    default: PANEL_STROKE_DARK,
    projector: PANEL_STROKE_LIGHT,
  }),
  textColorProperty: new ProfileColorProperty(LadyBugNamespace, "text", { default: WHITE, projector: BLACK }),

  // ── Light control surfaces ───────────────────────────────────────────────────
  // White chrome (combo boxes, flat push buttons, editable input fields) stays light
  // in both profiles; its text stays dark.

  /** Fill of light control surfaces: combo-box button/list, editable input fields. */
  controlSurfaceColorProperty: new ProfileColorProperty(LadyBugNamespace, "controlSurface", {
    default: "#ffffff",
    projector: "#ffffff",
  }),

  /** Fill of a disabled control surface (grayed-out editable input field). */
  controlSurfaceDisabledColorProperty: new ProfileColorProperty(LadyBugNamespace, "controlSurfaceDisabled", {
    default: "#cccccc",
    projector: "#cccccc",
  }),

  /** Text on light control surfaces: combo items, flat-button labels, field values, preferences. */
  controlSurfaceTextColorProperty: new ProfileColorProperty(LadyBugNamespace, "controlSurfaceText", {
    default: "#1a1a1a",
    projector: "#1a1a1a",
  }),
};

export default LadyBugColors;
