promise-retry
A promise retry executor with exponential  backoff strategy. Comes with fetch retry out of the box

## Table of Contents

- [Installation](#installation)
- [API](#api)
    * [`promiseRetry [Function]`](#promise-retry)
    * [`fetchRetry [Function]`](#gofor-retry)

## Installation

Install the package:
```sh
npm i @pdedg/promise-retry
```

## API

### `promiseRetry [Function]`

A promise retry executor
 * @param  {Function} run                    Function that returns a promise
 * @param  {Object} Options                  Execution options
     * @param  {Function} validateResolved       Sample promise resolved result and determines if OK
     * @param  {Function} retryOn                Determines when to retry on error
     * @param  {Number} retries                  Amount of retries to execute
     * @param  {Number|Function} delay           The delay between execution ( Can be a function for delay strategies)
     * @param  {Function} onFailedAttempt        Error callback, will be called on each error.
 
#### Examples

```js
// Simple execution

import { promiseRetry } from '@pdedg/promise-retry';

const run = () => new Promise((resolve, reject) => reject());
promiseRetry(run); // will execute rejected promise by default 3 times and after will trow error
```

```js
// With custom delay strategy

import { promiseRetry } from '@pdedg/promise-retry';

const options = {
    retries: 5,
    retryOn: (err) => true,
    delay: (err) => err.attempt * 1000,
    onFailedAttempt: (err) => console.log(err.status)
}

const run = () => new Promise((resolve, reject) => reject());
promiseRetry(run);
/*
    Will result of: 5 executions of failed promise ( retryOn is set to all ways true ).
    On each attempt it will execute the onFailedAttempt, and will use linear delay between executions ( last will be 5s delay )
 */
```

### `fetchRetry [Function]`

Wraps a fetch request with retry, by default it will retry on the following http status
 [408, 503, 504] and on request-timeout error.

 * @param {Function} fetch - Can be any fetch implementation ( node-fetch / browser fetch )
 * @param {String} url - Request url
 * @param {Object} options - fetch retry options
     * @param {Number} retries - Amount of retries, default to 3
     * @param {Number / Function} delay - The delay between executions, can be a number for the default backoff strategy OR a custom function
     * @param {Function} retryOnResolved - When should retry on resolved fetch result
     * @param {Function} retryOnError - When should retry on error occurred
     * @param {Function} onFailedAttempt - Execute on each failure
     * @param {Object} fetchOptions - Normal fetch options you would pass
 
#### Examples

```js
// Simple execution

import { fetchRetry } from '@pdedg/promise-retry';

const fetch = () => new Promise((resolve, reject) => reject());
fetchRetry(run, '/end-point', { delay: 100 }); // Will execute 3 fetch calls with 100 / 200 / 400 delay and eventually an error will be thrown.
```

```js
// With custom options

import { fetchRetry } from '@pdedg/promise-retry';

const options = {
    retries: 2,
    retryOnResolved: (res) => {
        if (res.status === 300) {
            throw new Error('Cannot handle 300 status.')
        }
    },
}

const fetch = () => new Promise((resolve, reject) => resolve({ status: 300 }));
fetchRetry(run, '/end-point', options)
/*
    Will result of: 2 executions of resolved promises, that will be rejected by the validate resolved method.
    eventually, it will throw an error.
 */
```
