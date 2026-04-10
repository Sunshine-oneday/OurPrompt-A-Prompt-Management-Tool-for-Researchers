import * as React from 'react';
/**
 * Renders filtered list items.
 * Doesn't render its own HTML element.
 *
 * If rendering a flat list, pass a function child to the `List` component instead, which implicitly wraps it.
 */
export declare function ComboboxCollection(props: ComboboxCollection.Props): React.JSX.Element | null;
export interface ComboboxCollectionState {}
export interface ComboboxCollectionProps {
  children: (item: any, index: number) => React.ReactNode;
}
export declare namespace ComboboxCollection {
  type State = ComboboxCollectionState;
  type Props = ComboboxCollectionProps;
}