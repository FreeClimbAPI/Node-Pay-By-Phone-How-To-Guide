const express = require('express')
const customers = require('./customers')
const freeclimb = require('./freeclimb')
const { PerclScript, GetDigits, Say, Redirect } = require('@freeclimb/sdk')

const host = process.env.HOST

const router = express.Router()

let errCount = 0

router.post('/ccAmountPrompt', (req, res) => {
    res.status(200).json(
        new PerclScript({
            commands: [
                new GetDigits({
                    prompts: [
                        new Say({
                            text: customers.has(req.body.from)
                                ? 'so how much would you like to pay'
                                : 'How much would you like to pay? Just key in the payment amount in US Dollars For example, to make a payment of twenty dollars press two zero, to speak to an agent press zero'
                        }),
                        new Say({ text: 'The maximum amount is 100 dollars' })
                    ],
                    actionUrl: `${host}/ccAmount`,
                    maxDigits: 3,
                    minDigits: 1,
                    flushBuffer: true
                })
            ]
        }).build()
    )
})

router.post('/ccAmount', (req, res) => {
    const digits = req.body.digits
    const price = parseInt(digits)

    if (digits == '0') {
        res.status(200).json(
            new PerclScript({
                commands: [new Redirect({ actionUrl: `${host}/transfer` })]
            }).build()
        )
    } else if (price < 100) {
        res.status(200).json(
            new PerclScript({
                commands: [
                    new Redirect({ actionUrl: `${host}/ccAmountConfirmationPrompt?amt=${price}` })
                ]
            }).build()
        )
    } else if (errCount >= 3) {
        res.status(200).json(
            new PerclScript({
                commands: [
                    new Say({
                        text:
                            'You have exceeded the maximum number of retries allowed, please wait while we connect you to an operator'
                    }),
                    new Redirect({ actionUrl: `${host}/transfer` })
                ]
            }).build()
        )
    } else {
        errCount++
        res.status(200).json(
            new PerclScript({
                commands: [
                    new Say({ text: 'Sorry the number you entered was invalid please try again' }),
                    new Redirect({ actionUrl: `${host}/ccAmountPrompt` })
                ]
            }).build()
        )
    }
})

module.exports = router
