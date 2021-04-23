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

describe('POST /ccAmountPrompt', () => {
    it('returns the percl commands for amount entry menu with correct script if new caller', async () => {
        const res = await request
            .post('/ccAmountPrompt')
            .type('form')
            .send({ from: '1' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                GetDigits: {
                    actionUrl: `${host}/ccAmount`,
                    flushBuffer: true,
                    maxDigits: 3,
                    minDigits: 1,
                    prompts: [
                        {
                            Say: {
                                text:
                                    'How much would you like to pay? Just key in the payment amount in US Dollars For example, to make a payment of twenty dollars press two zero, to speak to an agent press zero'
                            }
                        },
                        {
                            Say: {
                                text: 'The maximum amount is 100 dollars'
                            }
                        }
                    ]
                }
            }
        ])
    })

    it('returns the percl commands for amount entry menu with correct script if existing caller', async () => {
        customers.add('1')
        const res = await request
            .post('/ccAmountPrompt')
            .type('form')
            .send({ from: '1' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                GetDigits: {
                    actionUrl: `${host}/ccAmount`,
                    flushBuffer: true,
                    maxDigits: 3,
                    minDigits: 1,
                    prompts: [
                        {
                            Say: {
                                text: 'so how much would you like to pay'
                            }
                        },
                        {
                            Say: {
                                text: 'The maximum amount is 100 dollars'
                            }
                        }
                    ]
                }
            }
        ])
    })
})

describe('POST /ccAmount', () => {
    it('returns percl command for redirect when user enters 0', async () => {
        const res = await request
            .post('/ccAmount')
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

    it('returns percl command for redirect to amount confirmation when user enters valid amount', async () => {
        const res = await request
            .post('/ccAmount')
            .type('form')
            .send({ digits: '25' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Redirect: {
                    actionUrl: `${host}/ccAmountConfirmationPrompt?amt=25`
                }
            }
        ])
    })

    it('returns percl command for err message and redirect to original prompt on error', async () => {
        const res = await request
            .post('/ccAmount')
            .type('form')
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
                    actionUrl: `${host}/ccAmountPrompt`
                }
            }
        ])
    })

    it('returns percl command for err message and redirect to /transfer on error limit reached', async () => {
        for (let i = 0; i < 3; i++) {
            await request
                .post('/ccAmount')
                .type('form')
                .send({ digits: '101' })
        }

        const res = await request
            .post('/ccAmount')
            .type('form')
            .send({ digits: '101' })
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
