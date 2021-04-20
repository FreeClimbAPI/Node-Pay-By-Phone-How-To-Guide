let request

require('dotenv-safe').config()

const host = process.env.HOST

beforeEach(() => {
  jest.resetModules()
  const { app } = require('./index')
  const supertest = require('supertest')
  request = supertest(app)
})

describe('POST /mainMenuPrompt', () => {
  it('returns the percl commands for the main manu getdigits including redirect and prompt', async () => {
    const res = await request.post('/mainMenuPrompt')
    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual([
      {
        GetDigits: {
          actionUrl: `${host}/mainMenu`,
          flushBuffer: true,
          maxDigits: 1,
          minDigits: 1,
          prompts: [
            {
              Say: {
                text:
                  ' to make a one time payment please press 1, or press 0 to speak with an operator'
              }
            }
          ]
        }
      }
    ])
  })
})

describe('POST /mainMenu', () => {
  it('returns the percl command for redirect to /transfer when sent with digit "0" ', async () => {
    const res = await request
      .post('/mainMenu')
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

  it('returns the percl command for redirect to /ccAmount when sent with digit "1" ', async () => {
    const res = await request
      .post('/mainMenu')
      .type('form')
      .send({ digits: '1' })
    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual([
      {
        Redirect: {
          actionUrl: `${host}/ccAmountPrompt`
        }
      }
    ])
  })

  it('returns the percl command for redirect back to mainMenuPrompt when sent with invalid digits', async () => {
    const res = await request
      .post('/mainMenu')
      .type('form')
      .send({ digits: '7' })
    expect(res.status).toBe(200)
    expect(res.body).toStrictEqual([
      {
        Say: {
          text: 'Error, please try again'
        }
      },
      {
        Redirect: {
          actionUrl: `${host}/mainMenuPrompt`
        }
      }
    ])
  })
})
