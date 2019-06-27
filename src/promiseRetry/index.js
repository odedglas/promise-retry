/**
 * Decorate an error with retries left / current attempt
 * @private
 * @param  {Object} error          The error raised by the promise runner
 * @param  {Number} retries        Current retries left to consumer
 * @param  {Number} attempt        Current attempt
 * @return {Object} Decorated error
 */
const decorateError = (error = {}, retries, attempt) => {
    error.attempt = attempt;
    error.retriesLeft = retries - 1;
    return error;
};

/**
 * Pause a promise execution by given delay
 * @private
 * @param  {Number} delay          The delay to wait for a given promise execution
 * @return {Promise} delayed promised
 */
const pause = (delay) => new Promise((promise) => setTimeout(promise, delay));

/**
 * Exponential Back off strategy
 * @param delay
 * @returns {number}
 */
const backoff = (delay) => delay * 2;

/**
 * Execute a promise with retry setup
 * @param  {Function} run                    Function that returns a promise
 * @param  {Function} validateResolved       Sample promise resolved result and determines if OK
 * @param  {Function} retryOn                Determines when to retry on error, DEFAULT - all ways
 * @param  {Number} retries                  Amount of retries to execute, DEFAULT - 1 retry
 * @param  {Number|Function} delay           The exponential delay between execution ( Can be a function for delay strategies) DEFAULT - 0
 * @param  {Function} onFailedAttempt        Error callback, will be called on each retriable error.
 * @param  {Function} onBreach               Error callback, will be called on 2 cases: 1) When attempts are equal to retries. 2) On Non retriable error.
 * @param  {Number} attempt                  Current attempt
 * @return {Any|Object} Promise result / Error
 */
export const promiseRetry = (run, { validateResolved, retryOn = () => true, retries = 1, delay = 0, onFailedAttempt, onBreach }, attempt = 1) => run().then((res) => {
    validateResolved && validateResolved(res, attempt);
    return res;
}).catch((err = {}) => {

    err = decorateError(err, retries, attempt);
    const shouldRetry = retries > 1 && retryOn(err);

    shouldRetry && onFailedAttempt && onFailedAttempt(err);
    !shouldRetry && onBreach && onBreach(err);

    const retryDelay = typeof delay === 'function' ? delay(err) : backoff(delay);

    return shouldRetry
        ? pause(retryDelay).then(() => promiseRetry(run, { validateResolved, retryOn, retries: err.retriesLeft, delay: retryDelay, onFailedAttempt, onBreach}, attempt + 1))
        : Promise.reject(err);
});
