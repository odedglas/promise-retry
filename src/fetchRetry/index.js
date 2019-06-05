import { promiseRetry } from '../promiseRetry';
import { RETRY_ON, DEFAULT_DELAY, DEFAULT_RETRIES } from './constants';

const baseRetryOnError = (err) => RETRY_ON.status.includes(err.status) || RETRY_ON.type.includes(err.type);
const baseRetryOnResolved = (res) => {
    if (!res.ok) {
        const err = new Error(res.statusText);
        err.status = res.status;
        throw err;
    }
};

/**
 *
 * @param fetch - Can be any fetch implementation ( node-fetch / browser fetch )
 * @param url - Request url
 * @param retries - Amount of retries, default to 3
 * @param delay - The delay between executions, can be a number for the default backoff strategy OR a custom function
 * @param retryOnResolved - When should retry on resolved fetch result
 * @param retryOnError - When should retry on error occurred
 * @param onFailedAttempt - Execute on each failure
 * @param fetchOptions - Normal fetch options you would pass
 * @returns {Any|Object}
 */
export const fetchRetry = (fetch, url, { retries = DEFAULT_RETRIES, delay = DEFAULT_DELAY, retryOnResolved, retryOnError, onFailedAttempt, ...fetchOptions } = {}) => {

    retryOnResolved = retryOnResolved || baseRetryOnResolved;
    retryOnError = retryOnError || baseRetryOnError;

    const options = {
        validateResolved: retryOnResolved,
        retryOn: retryOnError,
        retries,
        delay,
        onFailedAttempt
    };

    return promiseRetry(() => fetch(url, fetchOptions), options);
};
