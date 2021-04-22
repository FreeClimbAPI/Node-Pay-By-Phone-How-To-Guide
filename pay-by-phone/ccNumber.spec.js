let request
let customers

require('dotenv-safe').config()

const host = process.env.HOST

beforeEach(() => {
    jest.resetModules()
    const { app } = require('./index')
    const supertest = require('supertest')
    customers = require('./customers')
    request = supertest(app)
})

describe('POST /ccNumberPrompt', () => {
    it('returns the percl commands for cc number entry menu with correct script if new caller', async () => {
        const res = await request.post('/ccNumberPrompt').type('form')
            .send({ from: '1' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                GetDigits: {
                    actionUrl: `${host}/ccNumber`,
                    flushBuffer: true,
                    maxDigits: 19,
                    minDigits: 1,
                    privacyMode: true,
                    prompts: [
                        {
                            Say: {
                                text: 'To make a payment with a credit card please enter the card number'
                            }
                        }
                    ]
                }
            }
        ])
    })

    it('returns the percl commands for cc number entry menu with correct script if existing caller', async () => {
        customers.add('1')
        const res = await request.post('/ccNumberPrompt').type('form')
            .send({ from: '1' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                GetDigits: {
                    actionUrl: `${host}/ccNumber`,
                    flushBuffer: true,
                    maxDigits: 19,
                    minDigits: 1,
                    privacyMode: true,
                    prompts: [
                        {
                            Say: {
                                text: 'Okay, whats that card number'
                            }
                        }
                    ]
                }
            }
        ])
    })
})

describe('POST /ccNumber', () => {
    it('returns percl command for redirect when user enters 0', async () => {
        const res = await request.post('/ccNumber').type('form')
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

    it('returns percl command for redirect to ccExpiryPrompt when user enters valid ccNumber', async () => {
        const res = await request.post('/ccNumber').type('form')
            .send({ digits: '341814945428581' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Redirect: {
                    actionUrl: `${host}/ccExpiryPrompt`
                }
            }
        ])
    })

    it('returns percl command for err message and redirect to original prompt on error', async () => {
        const res = await request.post('/ccNumber').type('form')
            .send({ digits: '102' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    text: 'Sorry the number you entered was invalid please try again'
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/ccNumberPrompt`
                }
            }
        ])
    })

    it('returns percl command for err message and redirect to /transfer on error limit reached', async () => {
        for (let i = 0; i < 3; i++) {
            await request
                .post('/ccNumber')
                .type('form')
                .send({ digits: '101' })
        }

        const res = await request.post('/ccNumber').type('form')
            .send({ digits: '101' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    text: 'You have exceeded the maximum number of retries allowed, please wait while we connect you to an operator'
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