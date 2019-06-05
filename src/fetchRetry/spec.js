import { fetchRetry } from './';
import { DEFAULT_RETRIES } from './constants';

const generatePromise = (accept, rejectWith = {}) => new Promise((resolve, reject) => accept ? resolve({ ok: true }) : reject(rejectWith));
const goforOK = () => generatePromise(true);
const retrieableGofor = () => generatePromise(false, {status: 503});

describe('fetchRetry', () => {

    it('Should run a successful gofor call', () => {

        fetchRetry(goforOK, '/something');
    });

    it('Should execute failed gofor by retrier defualts', (done) => {

        const start = new Date();
        const onFail = jest.fn();

        fetchRetry(retrieableGofor, '/something', { onFailedAttempt: onFail, delay: 100 }).then(() => {
            done.fail(new Error('TEST FAIL'));
        }).catch(e => {

            expect(e.retriesLeft).toEqual(0);
            expect(e.attempt).toEqual(DEFAULT_RETRIES);

            const end = new Date();
            expect(end.getTime() - start.getTime() < 700).toEqual(true);

            expect(onFail).toHaveBeenCalled();
            done();
        });
    });

    it('Should not retry on un-retriable status', (done) => {

        const nonRetriableGofor = () => generatePromise(false, {status: 507});
        const onFail = jest.fn();

        fetchRetry(nonRetriableGofor, '/something', { onFailedAttempt: onFail }).then(() => {
            done.fail(new Error('TEST FAIL'));
        }).catch(e => {

            expect(e.retriesLeft).toEqual(DEFAULT_RETRIES - 1);
            expect(onFail).toHaveBeenCalled();
            done();
        });
    });
});
