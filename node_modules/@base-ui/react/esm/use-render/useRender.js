import { useRenderElement } from "../utils/useRenderElement.js";
/**
 * Renders a Base UI element.
 *
 * @public
 */
export function useRender(params) {
  return useRenderElement(params.defaultTagName ?? 'div', params, params);
}