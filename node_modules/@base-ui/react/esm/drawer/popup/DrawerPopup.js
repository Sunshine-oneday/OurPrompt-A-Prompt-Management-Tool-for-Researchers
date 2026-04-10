'use client';

import * as React from 'react';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { FloatingFocusManager } from "../../floating-ui-react/index.js";
import { useDialogRootContext } from "../../dialog/root/DialogRootContext.js";
import { useRenderElement } from "../../utils/useRenderElement.js";
import { popupStateMapping as baseMapping } from "../../utils/popupStateMapping.js";
import { transitionStatusMapping } from "../../utils/stateAttributesMapping.js";
import { DrawerBackdropCssVars } from "../backdrop/DrawerBackdropCssVars.js";
import { DrawerPopupCssVars } from "./DrawerPopupCssVars.js";
import { DrawerPopupDataAttributes } from "./DrawerPopupDataAttributes.js";
import { useDialogPortalContext } from "../../dialog/portal/DialogPortalContext.js";
import { useOpenChangeComplete } from "../../utils/useOpenChangeComplete.js";
import { COMPOSITE_KEYS } from "../../composite/composite.js";
import { useDrawerRootContext } from "../root/DrawerRootContext.js";
import { useDrawerSnapPoints } from "../root/useDrawerSnapPoints.js";
import { useDrawerViewportContext } from "../viewport/DrawerViewportContext.js";
import { EMPTY_OBJECT } from "../../utils/constants.js";
// Module-level flag to ensure we only register the CSS properties once,
// regardless of how many Drawer components are mounted.
import { jsx as _jsx } from "react/jsx-runtime";
let drawerSwipeVarsRegistered = false;

/**
 * Removes inheritance of high-frequency drawer swipe CSS variables, which
 * reduces style recalculation cost in complex drawers with deep subtrees.
 * Child elements that need these values can still opt-in by using `inherit`.
 * See https://motion.dev/blog/web-animation-performance-tier-list
 * under the "Improving CSS variable performance" section.
 */
function removeCSSVariableInheritance() {
  if (drawerSwipeVarsRegistered) {
    return;
  }

  // Intentionally keep inheritance disabled on WebKit as well. Safari doesn't support
  // opting descendants back in via `--var: inherit` for custom properties registered
  // with `inherits: false`, but Drawer does not rely on descendant access to these vars
  // (unlike ScrollArea), so we keep the performance optimization enabled.
  if (typeof CSS !== 'undefined' && 'registerProperty' in CSS) {
    [DrawerPopupCssVars.swipeMovementX, DrawerPopupCssVars.swipeMovementY, DrawerPopupCssVars.snapPointOffset].forEach(name => {
      try {
        CSS.registerProperty({
          name,
          syntax: '<length>',
          inherits: false,
          initialValue: '0px'
        });
      } catch {
        /* ignore already-registered */
      }
    });
    [{
      name: DrawerBackdropCssVars.swipeProgress,
      initialValue: '0'
    }, {
      name: DrawerPopupCssVars.swipeStrength,
      initialValue: '1'
    }].forEach(({
      name,
      initialValue
    }) => {
      try {
        CSS.registerProperty({
          name,
          syntax: '<number>',
          inherits: false,
          initialValue
        });
      } catch {
        /* ignore already-registered */
      }
    });
  }
  drawerSwipeVarsRegistered = true;
}
const stateAttributesMapping = {
  ...baseMapping,
  ...transitionStatusMapping,
  expanded(value) {
    return value ? {
      [DrawerPopupDataAttributes.expanded]: ''
    } : null;
  },
  nestedDrawerOpen(value) {
    return value ? {
      [DrawerPopupDataAttributes.nestedDrawerOpen]: ''
    } : null;
  },
  nestedDrawerSwiping(value) {
    return value ? {
      [DrawerPopupDataAttributes.nestedDrawerSwiping]: ''
    } : null;
  },
  swipeDirection(value) {
    return value ? {
      [DrawerPopupDataAttributes.swipeDirection]: value
    } : null;
  },
  swiping(value) {
    return value ? {
      [DrawerPopupDataAttributes.swiping]: ''
    } : null;
  }
};

/**
 * A container for the drawer contents.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Drawer](https://base-ui.com/react/components/drawer)
 */
export const DrawerPopup = /*#__PURE__*/React.forwardRef(function DrawerPopup(componentProps, forwardedRef) {
  const {
    className,
    finalFocus,
    initialFocus,
    render,
    ...elementProps
  } = componentProps;
  const {
    store
  } = useDialogRootContext();
  const {
    swipeDirection,
    frontmostHeight,
    hasNestedDrawer,
    nestedSwiping,
    nestedSwipeProgressStore,
    onPopupHeightChange,
    notifyParentFrontmostHeight,
    notifyParentHasNestedDrawer
  } = useDrawerRootContext();
  const descriptionElementId = store.useState('descriptionElementId');
  const disablePointerDismissal = store.useState('disablePointerDismissal');
  const floatingRootContext = store.useState('floatingRootContext');
  const rootPopupProps = store.useState('popupProps');
  const modal = store.useState('modal');
  const mounted = store.useState('mounted');
  const nested = store.useState('nested');
  const nestedOpenDialogCount = store.useState('nestedOpenDialogCount');
  const transitionStatus = store.useState('transitionStatus');
  const open = store.useState('open');
  const openMethod = store.useState('openMethod');
  const titleElementId = store.useState('titleElementId');
  const role = store.useState('role');
  const nestedDrawerOpen = nestedOpenDialogCount > 0;
  const swipe = useDrawerViewportContext(true);
  const swiping = swipe?.swiping ?? false;
  const swipeStrength = swipe?.swipeStrength ?? null;
  const {
    snapPoints,
    activeSnapPoint,
    activeSnapPointOffset
  } = useDrawerSnapPoints();
  useDialogPortalContext();
  const [popupHeight, setPopupHeight] = React.useState(0);
  const popupHeightRef = React.useRef(0);
  const measureHeight = useStableCallback(() => {
    const popupElement = store.context.popupRef.current;
    if (!popupElement) {
      return;
    }
    const offsetHeight = popupElement.offsetHeight;

    // Only skip while the element is still actually stretched beyond its last measured height.
    if (popupHeightRef.current > 0 && frontmostHeight > popupHeightRef.current && offsetHeight > popupHeightRef.current) {
      return;
    }
    const keepHeightWhileNested = popupHeightRef.current > 0 && hasNestedDrawer;
    if (keepHeightWhileNested) {
      const oldHeight = popupHeightRef.current;
      setPopupHeight(oldHeight);
      onPopupHeightChange(oldHeight);
      return;
    }
    const nextHeight = offsetHeight;
    if (nextHeight === popupHeightRef.current) {
      return;
    }
    popupHeightRef.current = nextHeight;
    setPopupHeight(nextHeight);
    onPopupHeightChange(nextHeight);
  });
  useIsoLayoutEffect(() => {
    if (!mounted) {
      popupHeightRef.current = 0;
      setPopupHeight(0);
      onPopupHeightChange(0);
      return undefined;
    }
    const popupElement = store.context.popupRef.current;
    if (!popupElement) {
      return undefined;
    }
    removeCSSVariableInheritance();
    measureHeight();
    if (typeof ResizeObserver !== 'function') {
      return undefined;
    }
    const resizeObserver = new ResizeObserver(measureHeight);
    resizeObserver.observe(popupElement);
    return () => {
      resizeObserver.disconnect();
    };
  }, [measureHeight, mounted, nestedDrawerOpen, onPopupHeightChange, store.context.popupRef]);
  useIsoLayoutEffect(() => {
    const popupRef = store.context.popupRef;
    const syncNestedSwipeProgress = () => {
      const popupElement = popupRef.current;
      if (!popupElement) {
        return;
      }
      const progress = nestedSwipeProgressStore.getSnapshot();
      if (progress > 0) {
        popupElement.style.setProperty(DrawerBackdropCssVars.swipeProgress, `${progress}`);
      } else {
        popupElement.style.setProperty(DrawerBackdropCssVars.swipeProgress, '0');
      }
    };
    syncNestedSwipeProgress();
    const unsubscribe = nestedSwipeProgressStore.subscribe(syncNestedSwipeProgress);
    return () => {
      unsubscribe();
      const popupElement = popupRef.current;
      if (popupElement) {
        popupElement.style.setProperty(DrawerBackdropCssVars.swipeProgress, '0');
      }
    };
  }, [nestedSwipeProgressStore, store.context.popupRef]);
  React.useEffect(() => {
    if (!open) {
      return undefined;
    }
    notifyParentFrontmostHeight?.(frontmostHeight);
    return () => {
      notifyParentFrontmostHeight?.(0);
    };
  }, [frontmostHeight, open, notifyParentFrontmostHeight]);
  React.useEffect(() => {
    if (!notifyParentHasNestedDrawer) {
      return undefined;
    }
    const present = open || transitionStatus === 'ending';
    notifyParentHasNestedDrawer(present);
    return () => {
      notifyParentHasNestedDrawer(false);
    };
  }, [notifyParentHasNestedDrawer, open, transitionStatus]);
  useOpenChangeComplete({
    open,
    ref: store.context.popupRef,
    onComplete() {
      if (open) {
        store.context.onOpenChangeComplete?.(true);
      }
    }
  });
  const resolvedInitialFocus = initialFocus === undefined ? store.context.popupRef : initialFocus;
  const state = {
    open,
    nested,
    transitionStatus,
    expanded: activeSnapPoint === 1,
    nestedDrawerOpen,
    nestedDrawerSwiping: nestedSwiping,
    swipeDirection,
    swiping
  };
  let popupHeightCssVarValue;
  const shouldUseAutoHeight = !hasNestedDrawer && transitionStatus !== 'ending';
  if (popupHeight && !shouldUseAutoHeight) {
    popupHeightCssVarValue = `${popupHeight}px`;
  }
  const shouldApplySnapPoints = snapPoints && snapPoints.length > 0 && (swipeDirection === 'down' || swipeDirection === 'up');
  let snapPointOffsetValue = null;
  if (shouldApplySnapPoints && activeSnapPointOffset !== null) {
    snapPointOffsetValue = swipeDirection === 'up' ? -activeSnapPointOffset : activeSnapPointOffset;
  }
  let dragStyles = swipe ? swipe.getDragStyles() : EMPTY_OBJECT;
  if (shouldApplySnapPoints && swipeDirection === 'down') {
    const baseOffset = activeSnapPointOffset ?? 0;
    const movementValue = Number.parseFloat(String(dragStyles[DrawerPopupCssVars.swipeMovementY] ?? 0));
    const nextOffset = Number.isFinite(movementValue) ? baseOffset + movementValue : baseOffset;
    const shouldDamp = nextOffset < 0;
    if (swiping && shouldDamp && Number.isFinite(movementValue)) {
      const overshoot = Math.abs(nextOffset);
      const dampedOffset = -Math.sqrt(overshoot);
      const dampedMovement = dampedOffset - baseOffset;
      dragStyles = {
        ...dragStyles,
        transform: undefined,
        [DrawerPopupCssVars.swipeMovementY]: `${dampedMovement}px`
      };
    } else {
      dragStyles = {
        ...dragStyles,
        transform: undefined
      };
    }
  }
  const element = useRenderElement('div', componentProps, {
    state,
    props: [rootPopupProps, {
      'aria-labelledby': titleElementId,
      'aria-describedby': descriptionElementId,
      role,
      tabIndex: -1,
      hidden: !mounted,
      onKeyDown(event) {
        if (COMPOSITE_KEYS.has(event.key)) {
          event.stopPropagation();
        }
      },
      style: {
        ...dragStyles,
        [DrawerBackdropCssVars.swipeProgress]: '0',
        [DrawerPopupCssVars.nestedDrawers]: nestedOpenDialogCount,
        [DrawerPopupCssVars.height]: popupHeightCssVarValue,
        [DrawerPopupCssVars.snapPointOffset]: typeof snapPointOffsetValue === 'number' ? `${snapPointOffsetValue}px` : '0px',
        [DrawerPopupCssVars.frontmostHeight]: frontmostHeight ? `${frontmostHeight}px` : undefined,
        [DrawerPopupCssVars.swipeStrength]: typeof swipeStrength === 'number' && Number.isFinite(swipeStrength) && swipeStrength > 0 ? `${swipeStrength}` : '1'
      }
    }, elementProps],
    ref: [forwardedRef, store.context.popupRef, store.useStateSetter('popupElement')],
    stateAttributesMapping
  });
  return /*#__PURE__*/_jsx(FloatingFocusManager, {
    context: floatingRootContext,
    openInteractionType: openMethod,
    disabled: !mounted,
    closeOnFocusOut: !disablePointerDismissal,
    initialFocus: resolvedInitialFocus,
    returnFocus: finalFocus,
    modal: modal !== false,
    restoreFocus: "popup",
    children: element
  });
});
if (process.env.NODE_ENV !== "production") DrawerPopup.displayName = "DrawerPopup";