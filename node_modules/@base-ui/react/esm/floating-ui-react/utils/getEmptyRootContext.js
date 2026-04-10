import { PopupTriggerMap } from "../../utils/popups/index.js";
import { FloatingRootStore } from "../components/FloatingRootStore.js";
export function getEmptyRootContext() {
  return new FloatingRootStore({
    open: false,
    floatingElement: null,
    referenceElement: null,
    triggerElements: new PopupTriggerMap(),
    floatingId: '',
    nested: false,
    noEmit: false,
    onOpenChange: undefined
  });
}