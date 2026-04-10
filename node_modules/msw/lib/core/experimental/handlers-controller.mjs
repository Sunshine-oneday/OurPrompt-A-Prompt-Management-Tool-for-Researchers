import { invariant } from "outvariant";
import { devUtils } from '../utils/internal/devUtils.mjs';
function groupHandlersByKind(handlers) {
  const groups = {};
  for (const handler of handlers) {
    ;
    (groups[handler.kind] ||= []).push(handler);
  }
  return groups;
}
class HandlersController {
  getInitialState(initialHandlers) {
    invariant(
      this.#validateHandlers(initialHandlers),
      devUtils.formatMessage(
        "[MSW] Failed to apply given request handlers: invalid input. Did you forget to spread the request handlers Array?"
      )
    );
    const normalizedInitialHandlers = groupHandlersByKind(initialHandlers);
    return {
      initialHandlers: normalizedInitialHandlers,
      handlers: { ...normalizedInitialHandlers }
    };
  }
  currentHandlers() {
    return Object.values(this.getState().handlers).flat().filter((handler) => handler != null);
  }
  getHandlersByKind(kind) {
    return this.getState().handlers[kind] || [];
  }
  use(nextHandlers) {
    invariant(
      this.#validateHandlers(nextHandlers),
      devUtils.formatMessage(
        '[MSW] Failed to call "use()" with the given request handlers: invalid input. Did you forget to spread the array of request handlers?'
      )
    );
    if (nextHandlers.length === 0) {
      return;
    }
    const { handlers } = this.getState();
    for (let i = nextHandlers.length - 1; i >= 0; i--) {
      const handler = nextHandlers[i];
      handlers[handler.kind] = handlers[handler.kind] ? [handler, ...handlers[handler.kind]] : [handler];
    }
    this.setState({ handlers });
  }
  reset(nextHandlers) {
    invariant(
      nextHandlers.length > 0 ? this.#validateHandlers(nextHandlers) : true,
      devUtils.formatMessage(
        "Failed to replace initial handlers during reset: invalid handlers. Did you forget to spread the handlers array?"
      )
    );
    const { initialHandlers } = this.getState();
    if (nextHandlers.length === 0) {
      this.setState({
        handlers: { ...initialHandlers }
      });
      return;
    }
    const normalizedNextHandlers = groupHandlersByKind(nextHandlers);
    this.setState({
      initialHandlers: normalizedNextHandlers,
      handlers: { ...normalizedNextHandlers }
    });
  }
  #validateHandlers(handlers) {
    return handlers.every((handler) => !Array.isArray(handler));
  }
}
class InMemoryHandlersController extends HandlersController {
  #handlers;
  #initialHandlers;
  constructor(initialHandlers) {
    super();
    const initialState = this.getInitialState(initialHandlers);
    this.#initialHandlers = initialState.initialHandlers;
    this.#handlers = initialState.handlers;
  }
  getState() {
    return {
      initialHandlers: this.#initialHandlers,
      handlers: this.#handlers
    };
  }
  setState(nextState) {
    if (nextState.initialHandlers) {
      this.#initialHandlers = nextState.initialHandlers;
    }
    if (nextState.handlers) {
      this.#handlers = nextState.handlers;
    }
  }
}
export {
  HandlersController,
  InMemoryHandlersController,
  groupHandlersByKind
};
//# sourceMappingURL=handlers-controller.mjs.map