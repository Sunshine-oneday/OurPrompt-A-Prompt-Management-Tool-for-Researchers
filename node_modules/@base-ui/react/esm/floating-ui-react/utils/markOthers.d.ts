type Undo = () => void;
interface MarkOthersOptions {
  ariaHidden?: boolean | undefined;
  inert?: boolean | undefined;
  mark?: boolean | undefined;
  markerIgnoreElements?: Element[] | undefined;
}
export declare const supportsInert: () => boolean;
export declare function markOthers(avoidElements: Element[], options?: MarkOthersOptions): Undo;
export {};