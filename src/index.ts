/**
 * navigation-controller — level-based back navigation for React.
 *
 * The main entry re-exports the headless core plus the React layer. The core
 * alone (no React required) is importable from "navigation-controller/core";
 * the opt-in View Transitions helpers from "navigation-controller/transitions".
 */
export {
  createLevelStack,
  UnknownPageError,
  type Direction,
  type LevelStack,
  type LevelStackConfig,
  type NavEvent,
  type NavResult,
} from "./core";

export {
  Navigator,
  useLevelNavigator,
  bindHardwareBack,
  type NavigatorHandle,
  type NavigatorPageProps,
  type NavigatorProps,
  type UseLevelNavigatorResult,
} from "./react";

/** 4.x compatibility alias for {@link Direction}. */
export type { Direction as NavigatorDirection } from "./core";
