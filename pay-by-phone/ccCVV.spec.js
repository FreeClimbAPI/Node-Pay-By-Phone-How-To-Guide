let request
let customers
let caller

require('dotenv-safe').config()

const host = process.env.HOST

beforeEach(() => {
    jest.resetModules()
    const { app } = require('./index')
    const supertest = require('supertest')
    customers = require('./customers')
    caller = require('./caller')
    request = supertest(app)
})

describe('POST /ccCVVPrompt', () => {
    it('returns the percl commands for cc CVV entry menu with correct script if new caller', async () => {
        const res = await request
            .post('/ccCVVPrompt')
            .type('form')
            .send({ from: '1' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                GetDigits: {
                    actionUrl: `${host}/ccCVV`,
                    flushBuffer: true,
                    maxDigits: 4,
                    minDigits: 1,
                    privacyMode: true,
                    prompts: [
                        {
                            Say: {
                                text: 'Almost done, Whats the security code'
                            }
                        }
                    ]
                }
            }
        ])
    })

    it('returns the percl commands for cc CVV entry menu with correct script if existing caller', async () => {
        customers.add('1')
        const res = await request
            .post('/ccCVVPrompt')
            .type('form')
            .send({ from: '1' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                GetDigits: {
                    actionUrl: `${host}/ccCVV`,
                    flushBuffer: true,
                    maxDigits: 4,
                    minDigits: 1,
                    privacyMode: true,
                    prompts: [
                        {
                            Say: {
                                text: 'Okay, whats the security code'
                            }
                        }
                    ]
                }
            }
        ])
    })
})

describe('POST /ccCVV', () => {
    it('returns percl command for redirect when user enters 0', async () => {
        const res = await request
            .post('/ccCVV')
            .type('form')
            .send({ digits: '0' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Redirect: {
                    actionUrl: `${host}/transfer`
                }
            }
        ])
    })

    it('returns percl command for redirect to ccZipPrompt when user enters valid cc CVV', async () => {
        caller.CVVType = 4
        const res = await request
            .post('/ccCVV')
            .type('form')
            .send({ digits: '0000' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Redirect: {
                    actionUrl: `${host}/ccZipPrompt`
                }
            }
        ])
    })

    it('returns percl command for err message and redirect to original prompt on error', async () => {
        caller.CVVType = 3
        const res = await request
            .post('/ccCVV')
            .type('form')
            .send({ digits: '0000' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    text: 'Sorry im looking for the 3 digit security code, please enter it now'
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/ccCVVPrompt`
                }
            }
        ])
    })

    it('returns percl command for err message and redirect to /transfer on error limit reached', async () => {
        caller.CVVType = 3
        for (let i = 0; i < 3; i++) {
            await request
                .post('/ccCVV')
                .type('form')
                .send({ digits: '0000' })
        }

        const res = await request
            .post('/ccCVV')
            .type('form')
            .send({ digits: '0000' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    text:
                        'You have exceeded the maximum number of retries allowed, please wait while we connect you to an operator'
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/transfer`
                }
            }
        ])
    })
})
