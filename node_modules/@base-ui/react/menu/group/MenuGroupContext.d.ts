import * as React from 'react';
export interface MenuGroupContext {
  setLabelId: (id: string | undefined) => void;
}
export declare const MenuGroupContext: React.Context<MenuGroupContext | undefined>;
export declare function useMenuGroupRootContext(): MenuGroupContext;