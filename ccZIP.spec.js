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

describe('POST /ccZipPrompt', () => {
    it('returns the percl commands for cc zip entry menu with correct script if new caller', async () => {
        const res = await request.post('/ccZipPrompt').type('form')
            .send({ from: '1' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                GetDigits: {
                    actionUrl: `${host}/ccZip`,
                    flushBuffer: true,
                    maxDigits: 5,
                    minDigits: 1,
                    privacyMode: true,
                    prompts: [
                        {
                            Say: {
                                text: 'Last thing, Whats the zip code for this card?'
                            }
                        }
                    ]
                }
            }
        ])
    })

    it('returns the percl commands for cc zip entry menu with correct script if existing caller', async () => {
        customers.add('1')
        const res = await request.post('/ccZipPrompt').type('form')
            .send({ from: '1' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                GetDigits: {
                    actionUrl: `${host}/ccZip`,
                    flushBuffer: true,
                    maxDigits: 5,
                    minDigits: 1,
                    privacyMode: true,
                    prompts: [
                        {
                            Say: {
                                text: 'Okay, whats the Zip code'
                            }
                        }
                    ]
                }
            }
        ])
    })
})

describe('POST /ccZip', () => {
    it('returns percl command for redirect when user enters 0', async () => {
        const res = await request.post('/ccZip').type('form')
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

    it('returns percl command for redirect to ccRecapPrompt when user enters valid cc CVV', async () => {
        const res = await request.post('/ccZip').type('form')
            .send({ digits: '00000' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Redirect: {
                    actionUrl: `${host}/ccRecapPrompt`
                }
            }
        ])
    })

    it('returns percl command for err message and redirect to original prompt on error', async () => {
        const res = await request.post('/ccZip').type('form')
            .send({ digits: '0000' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    text: 'Please enter the 5 digit zip code of the billing address for the card you\'ve entered.'
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/ccZipPrompt`
                }
            }
        ])
    })

    it('returns percl command for err message and redirect to /transfer on error limit reached', async () => {
        for (let i = 0; i < 3; i++) {
            await request
                .post('/ccZip')
                .type('form')
                .send({ digits: '' })
        }

        const res = await request.post('/ccZip').type('form')
            .send({ digits: '' })
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