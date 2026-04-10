import * as React from 'react';
import type { BaseUIComponentProps } from "../../utils/types.js";
import type { FieldRoot } from "../../field/root/FieldRoot.js";
/**
 * An accessible label that is automatically associated with the combobox trigger.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Combobox](https://base-ui.com/react/components/combobox)
 */
export declare const ComboboxLabel: React.ForwardRefExoticComponent<Omit<ComboboxLabelProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
export type ComboboxLabelState = FieldRoot.State;
export interface ComboboxLabelProps extends Omit<BaseUIComponentProps<'div', ComboboxLabel.State>, 'id'> {}
export declare namespace ComboboxLabel {
  type State = ComboboxLabelState;
  type Props = ComboboxLabelProps;
}