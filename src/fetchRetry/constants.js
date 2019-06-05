// Forgivable errors
const SERVICE_UNAVAILABLE= 503,
    GATEWAY_TIMEOUT_CODE = 504,
    TIMEOUT_CODE = 408;

// Node fetch timeout config
const REQUEST_TIMEOUT = 'request-timeout';

export const RETRY_ON = {
    status: [SERVICE_UNAVAILABLE, GATEWAY_TIMEOUT_CODE, TIMEOUT_CODE],
    type: [REQUEST_TIMEOUT],
};

export const DEFAULT_RETRIES = 3;
export const DEFAULT_DELAY = 0;
