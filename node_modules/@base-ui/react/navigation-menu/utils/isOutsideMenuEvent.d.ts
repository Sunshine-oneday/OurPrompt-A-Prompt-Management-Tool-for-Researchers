import { FloatingTreeType } from "../../floating-ui-react/index.js";
interface Targets {
  currentTarget: HTMLElement | null;
  relatedTarget: HTMLElement | null;
}
interface Params {
  popupElement: HTMLElement | null;
  viewportElement?: HTMLElement | null | undefined;
  rootRef: React.RefObject<HTMLDivElement | null>;
  tree: FloatingTreeType | null;
  nodeId: string | undefined;
}
export declare function isOutsideMenuEvent({
  currentTarget,
  relatedTarget
}: Targets, params: Params): boolean;
export {};