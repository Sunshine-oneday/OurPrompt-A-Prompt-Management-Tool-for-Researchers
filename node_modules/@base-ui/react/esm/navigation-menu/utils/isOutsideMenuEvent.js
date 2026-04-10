import { contains, getNodeChildren } from "../../floating-ui-react/utils.js";
export function isOutsideMenuEvent({
  currentTarget,
  relatedTarget
}, params) {
  const {
    popupElement,
    viewportElement,
    rootRef,
    tree,
    nodeId
  } = params;
  const nodeChildrenContains = tree ? getNodeChildren(tree.nodesRef.current, nodeId).some(node => contains(node.context?.elements.floating, relatedTarget)) : [];

  // For nested scenarios without popupElement, we need to be more lenient
  // and only close if we're definitely outside the root
  if (!popupElement) {
    return !contains(rootRef.current, relatedTarget) && !nodeChildrenContains;
  }

  // Use popupElement as the primary floating element, but fall back to viewportElement if needed
  const floatingElement = popupElement || viewportElement;
  return !contains(floatingElement, currentTarget) && !contains(floatingElement, relatedTarget) && !contains(rootRef.current, relatedTarget) && !nodeChildrenContains && !(contains(floatingElement, relatedTarget) && relatedTarget?.hasAttribute('data-base-ui-focus-guard'));
}