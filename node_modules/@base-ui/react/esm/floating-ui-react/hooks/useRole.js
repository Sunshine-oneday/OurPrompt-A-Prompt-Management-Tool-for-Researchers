import * as React from 'react';
import { useId } from '@base-ui/utils/useId';
import { getFloatingFocusElement } from "../utils.js";
import { useFloatingParentNodeId } from "../components/FloatingTree.js";
import { EMPTY_OBJECT } from "../../utils/constants.js";
const componentRoleToAriaRoleMap = new Map([['select', 'listbox'], ['combobox', 'listbox'], ['label', false]]);

/**
 * Adds base screen reader props to the reference and floating elements for a
 * given floating element `role`.
 * @see https://floating-ui.com/docs/useRole
 */
export function useRole(context, props = {}) {
  const store = 'rootStore' in context ? context.rootStore : context;
  const open = store.useState('open');
  const defaultFloatingId = store.useState('floatingId');
  const domReference = store.useState('domReferenceElement');
  const floatingElement = store.useState('floatingElement');
  const {
    role = 'dialog'
  } = props;
  const defaultReferenceId = useId();
  const referenceId = domReference?.id || defaultReferenceId;
  const floatingId = React.useMemo(() => getFloatingFocusElement(floatingElement)?.id || defaultFloatingId, [floatingElement, defaultFloatingId]);
  const ariaRole = componentRoleToAriaRoleMap.get(role) ?? role;
  const parentId = useFloatingParentNodeId();
  const isNested = parentId != null;
  const trigger = React.useMemo(() => {
    if (ariaRole === 'tooltip' || role === 'label') {
      return EMPTY_OBJECT;
    }
    return {
      'aria-haspopup': ariaRole === 'alertdialog' ? 'dialog' : ariaRole,
      'aria-expanded': 'false',
      ...(ariaRole === 'listbox' && {
        role: 'combobox'
      }),
      ...(ariaRole === 'menu' && isNested && {
        role: 'menuitem'
      }),
      ...(role === 'select' && {
        'aria-autocomplete': 'none'
      }),
      ...(role === 'combobox' && {
        'aria-autocomplete': 'list'
      })
    };
  }, [ariaRole, isNested, role]);
  const reference = React.useMemo(() => {
    if (ariaRole === 'tooltip' || role === 'label') {
      return {
        [`aria-${role === 'label' ? 'labelledby' : 'describedby'}`]: open ? floatingId : undefined
      };
    }
    const triggerProps = trigger;
    return {
      ...triggerProps,
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': open ? floatingId : undefined,
      ...(ariaRole === 'menu' && {
        id: referenceId
      })
    };
  }, [ariaRole, floatingId, open, referenceId, role, trigger]);
  const floating = React.useMemo(() => {
    const floatingProps = {
      id: floatingId,
      ...(ariaRole && {
        role: ariaRole
      })
    };
    if (ariaRole === 'tooltip' || role === 'label') {
      return floatingProps;
    }
    return {
      ...floatingProps,
      ...(ariaRole === 'menu' && {
        'aria-labelledby': referenceId
      })
    };
  }, [ariaRole, floatingId, referenceId, role]);
  const item = React.useCallback(({
    active,
    selected
  }) => {
    const commonProps = {
      role: 'option',
      ...(active && {
        id: `${floatingId}-fui-option`
      })
    };

    // For `menu`, we are unable to tell if the item is a `menuitemradio`
    // or `menuitemcheckbox`. For backwards-compatibility reasons, also
    // avoid defaulting to `menuitem` as it may overwrite custom role props.
    switch (role) {
      case 'select':
      case 'combobox':
        return {
          ...commonProps,
          'aria-selected': selected
        };
      default:
    }
    return {};
  }, [floatingId, role]);
  return React.useMemo(() => ({
    reference,
    floating,
    item,
    trigger
  }), [reference, floating, trigger, item]);
}