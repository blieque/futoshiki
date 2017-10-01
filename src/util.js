/**
 * Given an element, class, contect object, and an array of event handler
 * property names, this attaches event handlers to a DOM element. This is a
 * utility function useful when making UI components interactive.
 */
export const addEventListeners =
    function addEventListeners(el, classObject, thisArg, handlers) {
    handlers.forEach((handlerName) => {
        let eventName;
        if (typeof handlerName === 'string') {
            eventName = handlerName.slice(2).toLowerCase();
        } else {
            eventName = handlerName[0];
            handlerName = handlerName[1];
        }
        const handler = classObject[handlerName].bind(thisArg);
        el.addEventListener(eventName, handler);
    });
};

/**
 * Generates an array containing `min', `max', and all integers between them, in
 * ascending order. If `max' < `min', an empty array is returned.
 */
export const range = function range(min, max) {
    const arr = [];
    for (let i = min; i <= max; i++) {
        arr.push(i);
    }
    return arr;
};
