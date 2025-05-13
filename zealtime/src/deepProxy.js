/**
 * Deep-proxy a whole object graph.
 *
 * @param {object} target      The root object to wrap
 * @param {object} userHandler Your traps (get / set / deleteProperty …)
 * @param {WeakMap} cache      Internal – keeps 1-proxy-per-object
 * @returns {Proxy|any}
 */
export function DeepProxy(target, userHandler = {}, cache = new WeakMap()) {
    if (target === null || typeof target !== 'object') return target;

    if (cache.has(target)) return cache.get(target);

    const proxy = new Proxy(target, {

        get(t, prop, receiver) {
            if (typeof userHandler.get === 'function') {
                return userHandler.get(t, prop, receiver, () =>
                    DeepProxy(Reflect.get(t, prop, receiver), userHandler, cache)
                );
            }
            return DeepProxy(Reflect.get(t, prop, receiver), userHandler, cache);
        },

        set(t, prop, value, receiver) {
            const done = typeof userHandler.set === 'function'
                ? userHandler.set(t, prop, value, receiver)
                : Reflect.set(t, prop, value, receiver);

            return done;
        },

        deleteProperty: forward('deleteProperty'),
        has: forward('has'),
        ownKeys: forward('ownKeys'),
        defineProperty: forward('defineProperty'),
        getOwnPropertyDescriptor: forward('getOwnPropertyDescriptor'),
        getPrototypeOf: forward('getPrototypeOf'),
        setPrototypeOf: forward('setPrototypeOf'),
        isExtensible: forward('isExtensible'),
        preventExtensions: forward('preventExtensions')
    });

    cache.set(target, proxy);
    return proxy;

    function forward(trap) {
        return (...args) =>
            typeof userHandler[trap] === 'function'
                ? userHandler[trap](...args)
                : Reflect[trap](...args);
    }
}
