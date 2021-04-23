let request

const host = process.env.HOST
const fcNumber = process.env.FC_NUMBER

beforeEach(() => {
    jest.resetModules()
    const { app } = require('./index')
    const supertest = require('supertest')
    const confirmationCode = require('./confirmationCode')
    jest.spyOn(confirmationCode, 'generate').mockImplementation(() => {
        return 111111
    })
    request = supertest(app)
})

describe('POST /ccConfirmationMessage', () => {
    it('returns percl commands for sms confirmation message', async () => {
        const res = await request
            .post('/ccConfirmationMessage')
            .type('form')
            .send({ from: '1' })
        expect(res.status).toBe(200)
        expect(res.body).toStrictEqual([
            {
                Say: {
                    text:
                        'Thank you for your payment, your confirmation number is 111111, you will receive an sms shortly'
                }
            },
            {
                Sms: {
                    from: `${fcNumber}`,
                    text:
                        'your confirmation number is 111111, thank you for using the Node pay-by-phone tutorial',
                    to: '1'
                }
            },
            {
                Redirect: {
                    actionUrl: `${host}/endcall`
                }
            }
        ])
    })
})
