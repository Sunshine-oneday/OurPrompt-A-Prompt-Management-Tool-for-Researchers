import type { ElementProps, FloatingContext, FloatingRootContext } from "../types.js";
type AriaRole = 'tooltip' | 'dialog' | 'alertdialog' | 'menu' | 'listbox' | 'grid' | 'tree';
type ComponentRole = 'select' | 'label' | 'combobox';
export interface UseRoleProps {
  /**
   * The role of the floating element.
   * @default 'dialog'
   */
  role?: AriaRole | ComponentRole | undefined;
}
/**
 * Adds base screen reader props to the reference and floating elements for a
 * given floating element `role`.
 * @see https://floating-ui.com/docs/useRole
 */
export declare function useRole(context: FloatingRootContext | FloatingContext, props?: UseRoleProps): ElementProps;
export {};