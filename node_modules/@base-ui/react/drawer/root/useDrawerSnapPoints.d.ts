import type { DrawerSnapPoint } from "./DrawerRootContext.js";
export interface ResolvedDrawerSnapPoint {
  value: DrawerSnapPoint;
  height: number;
  offset: number;
}
export declare function useDrawerSnapPoints(): {
  snapPoints: DrawerSnapPoint[] | undefined;
  activeSnapPoint: DrawerSnapPoint | null | undefined;
  setActiveSnapPoint: ((snapPoint: DrawerSnapPoint | null, eventDetails?: import("./DrawerRoot.js").DrawerRootSnapPointChangeEventDetails) => void) | undefined;
  popupHeight: number;
  viewportHeight: number;
  resolvedSnapPoints: ResolvedDrawerSnapPoint[];
  activeSnapPointOffset: number | null;
};