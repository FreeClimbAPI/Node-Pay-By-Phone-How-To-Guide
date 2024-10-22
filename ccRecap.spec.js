let request
let caller

const host = process.env.HOST

beforeEach(() => {
    jest.resetModules()
    const { app } = require('./index')
    const supertest = require('supertest')
    caller = require('./caller')
    request = supertest(app)
})

describe('POST /ccRecapPrompt', () => {
    it('returns the percl commands for the payment info recap menu getdigits including redirect and prompt', async () => {
        caller.paymentAmt = 20
        caller.ccNum = '341814945428581'
        const res = await request
            .post('/ccRecapPrompt')
            .type('form')
            .send({ from: '1' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                GetDigits: {
                    actionUrl: `${host}/ccRecap`,
                    flushBuffer: true,
                    maxDigits: 1,
                    minDigits: 1,
                    prompts: [
                        {
                            Say: {
                                loop: 1,
                                text:
                                    'Your payment will be 20 dollars on the card ending in 8581, if thats correct press 1 to confirm if not press 2 to try again'
                            }
                        }
                    ]
                }
            }
        ])
    })
})

describe('POST /ccRecap', () => {
    it('returns an error when no menu options are selected', async () => {
        const res = await request
            .post('/ccRecap')
            .type('form')
            .send({ digits: '' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    loop: 1,
                    text: 'Error'
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/ccRecapPrompt`
                }
            }
        ])
    })

    it('returns transfer to operator if max err limit reached', async () => {
        for (let i = 0; i < 3; i++) {
            await request
                .post('/ccRecap')
                .type('form')
                .send({ digits: '' })
        }

        const res = await request
            .post('/ccRecap')
            .type('form')
            .send({ digits: '' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    loop: 1,
                    text: 'Please wait while we connect you to an operator'
                }
            },
            {
                Pause: {
                    length: 100
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/transfer`
                }
            }
        ])
    })

    it('returns transfer to operator if max retry limit reached', async () => {
        for (let i = 0; i < 2; i++) {
            await request
                .post('/ccRecap')
                .type('form')
                .send({ digits: '2' })
        }

        const res = await request
            .post('/ccRecap')
            .type('form')
            .send({ digits: '2' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    loop: 1,
                    text: 'Please wait while we connect you to an operator'
                }
            },
            {
                Pause: {
                    length: 100
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/transfer`
                }
            }
        ])
    })

    it('returns redirect to /ccProcess on input of number 1', async () => {
        const res = await request
            .post('/ccRecap')
            .type('form')
            .send({ digits: '1' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    loop: 1,
                    text: 'great'
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/ccProcess`
                }
            }
        ])
    })

    it('returns redirect to /ccAmountPrompt on input of number 2', async () => {
        const res = await request
            .post('/ccRecap')
            .type('form')
            .send({ digits: '2' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    loop: 1,
                    text: 'Sorry to make sure your information is correct lets start again'
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/ccAmountPrompt`
                }
            }
        ])
    })
})
