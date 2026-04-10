import { Menu } from "../../menu/index.js";
import type { BaseUIChangeEventDetails } from "../../types/index.js";
import type { MenuRoot } from "../../menu/root/MenuRoot.js";
/**
 * A component that creates a context menu activated by right clicking or long pressing.
 * Doesn’t render its own HTML element.
 *
 * Documentation: [Base UI Context Menu](https://base-ui.com/react/components/context-menu)
 */
export declare function ContextMenuRoot(props: ContextMenuRoot.Props): import("react/jsx-runtime").JSX.Element;
export interface ContextMenuRootState {}
export interface ContextMenuRootProps extends Omit<Menu.Root.Props, 'modal' | 'openOnHover' | 'delay' | 'closeDelay' | 'onOpenChange'> {
  /**
   * Event handler called when the menu is opened or closed.
   */
  onOpenChange?: ((open: boolean, eventDetails: ContextMenuRoot.ChangeEventDetails) => void) | undefined;
}
export type ContextMenuRootChangeEventReason = MenuRoot.ChangeEventReason;
export type ContextMenuRootChangeEventDetails = BaseUIChangeEventDetails<ContextMenuRoot.ChangeEventReason>;
export declare namespace ContextMenuRoot {
  type State = ContextMenuRootState;
  type Props = ContextMenuRootProps;
  type ChangeEventReason = ContextMenuRootChangeEventReason;
  type ChangeEventDetails = ContextMenuRootChangeEventDetails;
}