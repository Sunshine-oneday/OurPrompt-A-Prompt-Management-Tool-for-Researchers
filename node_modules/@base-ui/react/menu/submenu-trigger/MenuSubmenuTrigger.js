"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MenuSubmenuTrigger = void 0;
var _formatErrorMessage2 = _interopRequireDefault(require("@base-ui/utils/formatErrorMessage"));
var React = _interopRequireWildcard(require("react"));
var _floatingUiReact = require("../../floating-ui-react");
var _MenuRootContext = require("../root/MenuRootContext");
var _useBaseUiId = require("../../utils/useBaseUiId");
var _popupStateMapping = require("../../utils/popupStateMapping");
var _useCompositeListItem = require("../../composite/list/useCompositeListItem");
var _useMenuItem = require("../item/useMenuItem");
var _useRenderElement = require("../../utils/useRenderElement");
var _MenuPositionerContext = require("../positioner/MenuPositionerContext");
var _popups = require("../../utils/popups");
var _MenuSubmenuRootContext = require("../submenu-root/MenuSubmenuRootContext");
/**
 * A menu item that opens a submenu.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Menu](https://base-ui.com/react/components/menu)
 */
const MenuSubmenuTrigger = exports.MenuSubmenuTrigger = /*#__PURE__*/React.forwardRef(function SubmenuTriggerComponent(componentProps, forwardedRef) {
  const {
    render,
    className,
    label,
    id: idProp,
    nativeButton = false,
    openOnHover = true,
    delay = 100,
    closeDelay = 0,
    disabled: disabledProp = false,
    ...elementProps
  } = componentProps;
  const listItem = (0, _useCompositeListItem.useCompositeListItem)();
  const menuPositionerContext = (0, _MenuPositionerContext.useMenuPositionerContext)();
  const {
    store
  } = (0, _MenuRootContext.useMenuRootContext)();
  const thisTriggerId = (0, _useBaseUiId.useBaseUiId)(idProp);
  const open = store.useState('open');
  const floatingRootContext = store.useState('floatingRootContext');
  const floatingTreeRoot = store.useState('floatingTreeRoot');
  const baseRegisterTrigger = (0, _popups.useTriggerRegistration)(thisTriggerId, store);
  const registerTrigger = React.useCallback(element => {
    const cleanup = baseRegisterTrigger(element);
    if (element !== null && store.select('open') && store.select('activeTriggerId') == null) {
      store.update({
        activeTriggerId: thisTriggerId,
        activeTriggerElement: element,
        closeDelay
      });
    }
    return cleanup;
  }, [baseRegisterTrigger, closeDelay, store, thisTriggerId]);
  const triggerElementRef = React.useRef(null);
  const handleTriggerElementRef = React.useCallback(el => {
    triggerElementRef.current = el;
    store.set('activeTriggerElement', el);
  }, [store]);
  const submenuRootContext = (0, _MenuSubmenuRootContext.useMenuSubmenuRootContext)();
  if (!submenuRootContext?.parentMenu) {
    throw new Error(process.env.NODE_ENV !== "production" ? 'Base UI: <Menu.SubmenuTrigger> must be placed in <Menu.SubmenuRoot>.' : (0, _formatErrorMessage2.default)(37));
  }
  store.useSyncedValue('closeDelay', closeDelay);
  const parentMenuStore = submenuRootContext.parentMenu;
  const itemProps = parentMenuStore.useState('itemProps');
  const highlighted = parentMenuStore.useState('isActive', listItem.index);
  const itemMetadata = React.useMemo(() => ({
    type: 'submenu-trigger',
    setActive() {
      parentMenuStore.set('activeIndex', listItem.index);
    }
  }), [parentMenuStore, listItem.index]);
  const rootDisabled = store.useState('disabled');
  const disabled = disabledProp || rootDisabled;
  const {
    getItemProps,
    itemRef
  } = (0, _useMenuItem.useMenuItem)({
    closeOnClick: false,
    disabled,
    highlighted,
    id: thisTriggerId,
    store,
    typingRef: parentMenuStore.context.typingRef,
    nativeButton,
    itemMetadata,
    nodeId: menuPositionerContext?.nodeId
  });
  const hoverEnabled = store.useState('hoverEnabled');
  const allowMouseEnter = parentMenuStore.useState('allowMouseEnter');
  const hoverProps = (0, _floatingUiReact.useHoverReferenceInteraction)(floatingRootContext, {
    enabled: hoverEnabled && openOnHover && !disabled,
    handleClose: (0, _floatingUiReact.safePolygon)({
      blockPointerEvents: true
    }),
    mouseOnly: true,
    move: true,
    restMs: delay,
    delay: allowMouseEnter ? {
      open: delay,
      close: closeDelay
    } : 0,
    triggerElementRef,
    externalTree: floatingTreeRoot
  });
  const click = (0, _floatingUiReact.useClick)(floatingRootContext, {
    enabled: !disabled,
    event: 'mousedown',
    toggle: !openOnHover,
    ignoreMouse: openOnHover,
    stickIfOpen: false
  });
  const localInteractionProps = (0, _floatingUiReact.useInteractions)([click]);
  const rootTriggerProps = store.useState('triggerProps', true);
  delete rootTriggerProps.id;
  const state = {
    disabled,
    highlighted,
    open
  };
  const element = (0, _useRenderElement.useRenderElement)('div', componentProps, {
    state,
    stateAttributesMapping: _popupStateMapping.triggerOpenStateMapping,
    props: [localInteractionProps.getReferenceProps(), hoverProps, rootTriggerProps, itemProps, {
      tabIndex: open || highlighted ? 0 : -1,
      onBlur() {
        if (highlighted) {
          parentMenuStore.set('activeIndex', null);
        }
      }
    }, elementProps, getItemProps],
    ref: [forwardedRef, listItem.ref, itemRef, registerTrigger, handleTriggerElementRef]
  });
  return element;
});
if (process.env.NODE_ENV !== "production") MenuSubmenuTrigger.displayName = "MenuSubmenuTrigger";