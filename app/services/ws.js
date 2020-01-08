const websocketHandlersMap = new Map();

const addWebsocketHandler = (dealId, handlerId, handler) => {
    let handlers = websocketHandlersMap.get(dealId);
    if (handlers === undefined) {
        handlers = new Map();
    }
    handlers.set(handlerId, handler);
    websocketHandlersMap.set(dealId, handlers);
};

const removeWebsocketHandler = (dealId, handlerId) => {
    const handlers = websocketHandlersMap.get(dealId);
    if (handlers !== undefined) {
        handlers.delete(handlerId);
    }
};

const emitWebsocketReaction = (dealId, points) => {
    const handlers = websocketHandlersMap.get(dealId);
    if (handlers !== undefined) {
        const handlersKeys = handlers.keys();
        for(const key of handlersKeys) {
            const handler = handlers.get(key);
            try {
                handler(points);
            } catch (_e) {
                handlers.delete(key);
            }
        }
    }
};

module.exports = {
    addWebsocketHandler,
    removeWebsocketHandler,
    emitWebsocketReaction,
};
