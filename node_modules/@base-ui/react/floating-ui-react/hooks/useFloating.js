"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useFloating = useFloating;
var React = _interopRequireWildcard(require("react"));
var _reactDom = require("@floating-ui/react-dom");
var _dom = require("@floating-ui/utils/dom");
var _useIsoLayoutEffect = require("@base-ui/utils/useIsoLayoutEffect");
var _FloatingTree = require("../components/FloatingTree");
var _useFloatingRootContext = require("./useFloatingRootContext");
/**
 * Provides data to position a floating element and context to add interactions.
 * @see https://floating-ui.com/docs/useFloating
 */
function useFloating(options = {}) {
  const {
    nodeId,
    externalTree
  } = options;
  const internalRootStore = (0, _useFloatingRootContext.useFloatingRootContext)(options);
  const rootContext = options.rootContext || internalRootStore;
  const rootContextElements = {
    reference: rootContext.useState('referenceElement'),
    floating: rootContext.useState('floatingElement'),
    domReference: rootContext.useState('domReferenceElement')
  };
  const [positionReference, setPositionReferenceRaw] = React.useState(null);
  const domReferenceRef = React.useRef(null);
  const tree = (0, _FloatingTree.useFloatingTree)(externalTree);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    if (rootContextElements.domReference) {
      domReferenceRef.current = rootContextElements.domReference;
    }
  }, [rootContextElements.domReference]);
  const position = (0, _reactDom.useFloating)({
    ...options,
    elements: {
      ...rootContextElements,
      ...(positionReference && {
        reference: positionReference
      })
    }
  });
  const setPositionReference = React.useCallback(node => {
    const computedPositionReference = (0, _dom.isElement)(node) ? {
      getBoundingClientRect: () => node.getBoundingClientRect(),
      getClientRects: () => node.getClientRects(),
      contextElement: node
    } : node;
    // Store the positionReference in state if the DOM reference is specified externally via the
    // `elements.reference` option. This ensures that it won't be overridden on future renders.
    setPositionReferenceRaw(computedPositionReference);
    position.refs.setReference(computedPositionReference);
  }, [position.refs]);
  const [localDomReference, setLocalDomReference] = React.useState(null);
  const [localFloatingElement, setLocalFloatingElement] = React.useState(null);
  rootContext.useSyncedValue('referenceElement', localDomReference);
  rootContext.useSyncedValue('domReferenceElement', (0, _dom.isElement)(localDomReference) ? localDomReference : null);
  rootContext.useSyncedValue('floatingElement', localFloatingElement);
  const setReference = React.useCallback(node => {
    if ((0, _dom.isElement)(node) || node === null) {
      domReferenceRef.current = node;
      setLocalDomReference(node);
    }

    // Backwards-compatibility for passing a virtual element to `reference`
    // after it has set the DOM reference.
    if ((0, _dom.isElement)(position.refs.reference.current) || position.refs.reference.current === null ||
    // Don't allow setting virtual elements using the old technique back to
    // `null` to support `positionReference` + an unstable `reference`
    // callback ref.
    node !== null && !(0, _dom.isElement)(node)) {
      position.refs.setReference(node);
    }
  }, [position.refs, setLocalDomReference]);
  const setFloating = React.useCallback(node => {
    setLocalFloatingElement(node);
    position.refs.setFloating(node);
  }, [position.refs]);
  const refs = React.useMemo(() => ({
    ...position.refs,
    setReference,
    setFloating,
    setPositionReference,
    domReference: domReferenceRef
  }), [position.refs, setReference, setFloating, setPositionReference]);
  const elements = React.useMemo(() => ({
    ...position.elements,
    domReference: rootContextElements.domReference
  }), [position.elements, rootContextElements.domReference]);
  const open = rootContext.useState('open');
  const floatingId = rootContext.useState('floatingId');
  const context = React.useMemo(() => ({
    ...position,
    dataRef: rootContext.context.dataRef,
    open,
    onOpenChange: rootContext.setOpen,
    events: rootContext.context.events,
    floatingId,
    refs,
    elements,
    nodeId,
    rootStore: rootContext
  }), [position, refs, elements, nodeId, rootContext, open, floatingId]);
  (0, _useIsoLayoutEffect.useIsoLayoutEffect)(() => {
    rootContext.context.dataRef.current.floatingContext = context;
    const node = tree?.nodesRef.current.find(n => n.id === nodeId);
    if (node) {
      node.context = context;
    }
  });
  return React.useMemo(() => ({
    ...position,
    context,
    refs,
    elements,
    rootStore: rootContext
  }), [position, refs, elements, context, rootContext]);
}