let request
let customers

const host = process.env.HOST

beforeEach(() => {
    jest.resetModules()
    const { app } = require('./index')
    const supertest = require('supertest')
    customers = require('./customers')
    request = supertest(app)
})

describe('POST /ccExpiryPrompt', () => {
    it('returns the percl commands for cc expiry entry menu with correct script if new caller', async () => {
        const res = await request
            .post('/ccExpiryPrompt')
            .type('form')
            .send({ from: '1' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                GetDigits: {
                    actionUrl: `${host}/ccExpiry`,
                    flushBuffer: true,
                    maxDigits: 4,
                    minDigits: 1,
                    privacyMode: true,
                    prompts: [
                        {
                            Say: {
                                loop: 1,
                                text:
                                    'Enter the expiration date using two digits for the month and two digits for the year'
                            }
                        }
                    ]
                }
            }
        ])
    })

    it('returns the percl commands for cc expiry entry menu with correct script if existing caller', async () => {
        customers.add('1')
        const res = await request
            .post('/ccExpiryPrompt')
            .type('form')
            .send({ from: '1' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                GetDigits: {
                    actionUrl: `${host}/ccExpiry`,
                    flushBuffer: true,
                    maxDigits: 4,
                    minDigits: 1,
                    privacyMode: true,
                    prompts: [
                        {
                            Say: {
                                loop: 1,
                                text: 'Okay, whats the four digit expiration date'
                            }
                        }
                    ]
                }
            }
        ])
    })
})

describe('POST /ccExpiry', () => {
    it('returns percl command for redirect when user enters 0', async () => {
        const res = await request
            .post('/ccExpiry')
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

    it('returns percl command for redirect to ccCVVPrompt when user enters valid cc expiry', async () => {
        const res = await request
            .post('/ccExpiry')
            .type('form')
            .send({ digits: '0431' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Redirect: {
                    actionUrl: `${host}/ccCVVPrompt`
                }
            }
        ])
    })

    it('returns percl command for err message and redirect to original prompt on error', async () => {
        const res = await request
            .post('/ccExpiry')
            .type('form')
            .send({ digits: '0411' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    loop: 1,
                    text: 'Sorry the date you entered was invalid please try again'
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/ccExpiryPrompt`
                }
            }
        ])
    })

    it('returns percl command for err message and redirect to /transfer on error limit reached', async () => {
        for (let i = 0; i < 3; i++) {
            await request
                .post('/ccExpiry')
                .type('form')
                .send({ digits: '0411' })
        }

        const res = await request
            .post('/ccExpiry')
            .type('form')
            .send({ digits: '0411' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    loop: 1,
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
