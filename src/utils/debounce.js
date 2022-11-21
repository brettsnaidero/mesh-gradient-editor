export const debounce = (func, wait) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, wait);
    };
};

export const throttle = (callback, limit) => {
    let waiting = false; // Initially, we're not waiting
    return (...args) => {
        // We return a throttled function
        if (!waiting) {
            // If we're not waiting
            callback.apply(this, args); // Execute users function
            waiting = true; // Prevent future invocations
            setTimeout(() => {
                // After a period of time
                waiting = false; // And allow future invocations
            }, limit);
        }
    };
};
