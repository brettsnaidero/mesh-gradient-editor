function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

export function throttle(callback, limit) {
    let waiting = false; // Initially, we're not waiting
    return function() {
        // We return a throttled function
        if (!waiting) {
            // If we're not waiting
            callback.apply(this, arguments); // Execute users function
            waiting = true; // Prevent future invocations
            setTimeout(function() {
                // After a period of time
                waiting = false; // And allow future invocations
            }, limit);
        }
    };
}

export default debounce;
