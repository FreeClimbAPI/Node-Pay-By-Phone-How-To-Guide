let request
let caller

require('dotenv-safe').config()

const host = process.env.HOST

beforeEach(() => {
    jest.resetModules()
    const { app } = require('./index')
    const supertest = require('supertest')
    caller = require('./caller')
    request = supertest(app)
})

describe('POST /ccProcess', () => {
    it('returns redirect to /ccConfirmationMessage if the on a successful response from the payment processor (fake)', async () => {
        caller.ccNum = '4539512795366158'
        const res = await request.post('/ccProcess')
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Redirect: {
                    actionUrl: `${host}/ccConfirmationMessage`
                }
            }
        ])
    })

    it('returns redirect to /ccNumberPrompt if the on an unsuccessful response from the payment processor (fake)', async () => {
        caller.ccNum = '375804818469449'
        const res = await request.post('/ccProcess')
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    text:
                        "We're having trouble processing your payment, please try again. Remember we Accept Visa, Discover, Mastercard and American Express cards"
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/ccNumberPrompt`
                }
            }
        ])
    })

    it('returns redirect to /transfer if max unsuccessful response limit reached', async () => {
        caller.ccNum = '375804818469449'
        await request.post('/ccProcess')
        const res = await request.post('/ccProcess')
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    text:
                        'The payment could not be processed at this time please wait while we transfer you to an operator'
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
