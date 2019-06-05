import { promiseRetry } from './';

const unreliablePromise = (resolveOn, resolveWith = { status: 200, ok:true }, rejectWith = {}) => new Promise((resolve, reject) => {
    if (--resolveOn > 0) {
        reject(rejectWith);
    }
    resolve(resolveWith);
});

const generatePromise = (accept) => new Promise((resolve, reject) => accept ? resolve({ ok: true }) : reject());

describe('promiseRetry', () => {

    it('Should resolve normally successfull promise', (done) => {

        const options = {
            validateResolved: () => true,
        };

        promiseRetry(() => generatePromise(true), options).then(() => {
            done();
        }).catch((error) => { done.fail(new Error(error)); });
    });

    it('Should use validateResolve to validate resolved promise', (done) => {
        const options = {
            validateResolved: () => {
                throw new Error('bla');
            },
        };
        promiseRetry(() => generatePromise(true), options).then(() => {
            done.fail(new Error('TEST FAIL'));
        }).catch(() => {
            done();
        });
    });

    it('Should decorate thrown errors with retries and attempts', (done) => {

        const options = {
            validateResolved: () => true,
            retryOn: () => false,
        };

        promiseRetry(() => generatePromise(false), options).then(() => {
            done.fail(new Error('TEST FAIL'));
        }).catch((error) => {
            expect(error.retriesLeft).toEqual(0);
            expect(error.attempt).toEqual(1);
            done();
        });
    });

    it('Should execute promise with retry according to config', (done) => {

        const options = {
            retries: 3,
            validateResolved: () => false,
            retryOn: () => true,
        };

        let count = 0;
        const run = () => {
            count++;
            return unreliablePromise(3);
        };

        promiseRetry(run, options).then(() => {
            done.fail(new Error('TEST FAIL'));
        }).catch((error) => {

            expect(error.retriesLeft).toEqual(0);
            expect(count).toEqual(3);
            done();
        });
    });

    it('Should use backoff strategy on fail by default', (done) => {
        const options = {
            retries: 3,
            delay: 100,
            validateResolved: () => false,
            retryOn: () => true,
        };

        const run = () => unreliablePromise(6);
        const now = new Date();
        const startTime = now.getTime();

        promiseRetry(run, options).then(() => {
            done.fail(new Error('TEST FAIL'));
        }).catch(() => {

            const finish = new Date();
            expect(finish.getTime() - startTime - 600 > 0 ).toBeTruthy();
            done();
        });
    });
});
