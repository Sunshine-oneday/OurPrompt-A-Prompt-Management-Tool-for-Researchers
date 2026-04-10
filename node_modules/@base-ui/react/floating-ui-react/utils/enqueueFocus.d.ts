import type { FocusableElement } from 'tabbable';
interface Options {
  preventScroll?: boolean | undefined;
  cancelPrevious?: boolean | undefined;
  sync?: boolean | undefined;
}
export declare function enqueueFocus(el: FocusableElement | null, options?: Options): void;
export {};