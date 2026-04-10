import { type FocusableElement } from 'tabbable';
export declare const getTabbableOptions: () => {
  readonly getShadowRoot: true;
  readonly displayCheck: "none" | "full";
};
export declare function getNextTabbable(referenceElement: Element | null): FocusableElement | null;
export declare function getPreviousTabbable(referenceElement: Element | null): FocusableElement | null;
export declare function getTabbableAfterElement(referenceElement: Element | null): FocusableElement | null;
export declare function getTabbableBeforeElement(referenceElement: Element | null): FocusableElement | null;
export declare function isOutsideEvent(event: FocusEvent | React.FocusEvent, container?: Element): boolean;
export declare function disableFocusInside(container: HTMLElement): void;
export declare function enableFocusInside(container: HTMLElement): void;