let request

const host = process.env.HOST

beforeEach(() => {
    jest.resetModules()
    const { app } = require('./index')
    const supertest = require('supertest')
    request = supertest(app)
})

describe('POST /ccAmountConfirmationPrompt', () => {
    it('returns the percl commands for the payment amount confirmation menu getdigits including redirect and prompt', async () => {
        const res = await request.post('/ccAmountConfirmationPrompt?amt=20')
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                GetDigits: {
                    actionUrl: `${host}/ccAmountConfirmation?amt=20`,
                    flushBuffer: true,
                    maxDigits: 1,
                    minDigits: 1,
                    prompts: [
                        {
                            Say: {
                                loop: 1,
                                text:
                                    'Just to be sure thats 20 dollars is that correct? Press 1 for yes and 2 for no'
                            }
                        }
                    ]
                }
            }
        ])
    })
})

describe('POST /ccAmountConfirmation', () => {
    it('returns an error when no menu options are selected', async () => {
        const res = await request
            .post('/ccAmountConfirmation?amt=20')
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
                    actionUrl: `${host}/ccAmountConfirmationPrompt?amt=20`
                }
            }
        ])
    })

    it('returns transfer to operator if max err limit reached', async () => {
        for (let i = 0; i < 3; i++) {
            await request
                .post('/ccAmountConfirmation?amt=20')
                .type('form')
                .send({ digits: '' })
        }

        const res = await request
            .post('/ccAmountConfirmation?amt=20')
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
                .post('/ccAmountConfirmation?amt=20')
                .type('form')
                .send({ digits: '2' })
        }

        const res = await request
            .post('/ccAmountConfirmation?amt=20')
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

    it('returns redirect to /ccNumber on input of number 1', async () => {
        const res = await request
            .post('/ccAmountConfirmation?amt=20')
            .type('form')
            .send({ digits: '1' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    loop: 1,
                    text: 'Thank you'
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/ccNumberPrompt`
                }
            }
        ])
    })

    it('returns redirect to /ccAmountPrompt on input of number 2', async () => {
        const res = await request
            .post('/ccAmountConfirmation?amt=20')
            .type('form')
            .send({ digits: '2' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    loop: 1,
                    text: 'Ok'
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
