import * as React from 'react';
import { type CompositeMetadata } from "../list/CompositeList.js";
import type { BaseUIComponentProps } from "../../utils/types.js";
import type { Dimensions, ModifierKey } from "../composite.js";
import { StateAttributesMapping } from "../../utils/getStateAttributesProps.js";
/**
 * @internal
 */
export declare function CompositeRoot<Metadata extends {}, State extends Record<string, any>>(componentProps: CompositeRoot.Props<Metadata, State>): import("react/jsx-runtime").JSX.Element;
export interface CompositeRootState {}
export interface CompositeRootProps<Metadata, State extends Record<string, any>> extends Pick<BaseUIComponentProps<'div', State>, 'render' | 'className' | 'children'> {
  props?: Array<Record<string, any> | (() => Record<string, any>)> | undefined;
  state?: State | undefined;
  stateAttributesMapping?: StateAttributesMapping<State> | undefined;
  refs?: React.Ref<HTMLElement | null>[] | undefined;
  tag?: keyof React.JSX.IntrinsicElements | undefined;
  orientation?: 'horizontal' | 'vertical' | 'both' | undefined;
  cols?: number | undefined;
  loopFocus?: boolean | undefined;
  highlightedIndex?: number | undefined;
  onHighlightedIndexChange?: ((index: number) => void) | undefined;
  itemSizes?: Dimensions[] | undefined;
  dense?: boolean | undefined;
  enableHomeAndEndKeys?: boolean | undefined;
  onMapChange?: ((newMap: Map<Node, CompositeMetadata<Metadata> | null>) => void) | undefined;
  stopEventPropagation?: boolean | undefined;
  rootRef?: React.RefObject<HTMLElement | null> | undefined;
  disabledIndices?: number[] | undefined;
  modifierKeys?: ModifierKey[] | undefined;
  highlightItemOnHover?: boolean | undefined;
}
export declare namespace CompositeRoot {
  type State = CompositeRootState;
  type Props<Metadata, TState extends Record<string, any>> = CompositeRootProps<Metadata, TState>;
}