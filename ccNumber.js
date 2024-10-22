const express = require('express')
const cardValidator = require('card-validator')
const customers = require('./customers')
const caller = require('./caller')
const freeclimb = require('./freeclimb')
const { PerclScript, GetDigits, Say, Redirect } = require('@freeclimb/sdk')

const host = process.env.HOST

const router = express.Router()

let errCount = 0

router.post('/ccNumberPrompt', (req, res) => {
    const incoming = req.body.from
    let script
    if (customers.has(incoming)) {
        script = 'Okay, whats that card number'
    } else {
        script = 'To make a payment with a credit card please enter the card number'
    }

    res.status(200).json(
        new PerclScript({
            commands: [
                new GetDigits({
                    prompts: [new Say({ text: script })],
                    actionUrl: `${host}/ccNumber`,
                    maxDigits: 19,
                    minDigits: 1,
                    flushBuffer: true,
                    privacyMode: true // privacyMode hides important information to maintain pci compliance, avoid logging sensitive info
                })
            ]
        }).build()
    )
})

router.post('/ccNumber', (req, res) => {
    const getDigitsResponse = req.body
    const digits = getDigitsResponse.digits
    const ccValidation = cardValidator.number(digits)

    if (ccValidation.isValid) {
        //ccNumber checked against a 3rd party library using the luhn algorithm
        caller.CVVType = ccValidation.card.code.size
        caller.ccNum = digits
        res.status(200).json(
            new PerclScript({
                commands: [new Redirect({ actionUrl: `${host}/ccExpiryPrompt` })]
            }).build()
        )
    } else if (digits == '0') {
        res.status(200).json(
            new PerclScript({
                commands: [new Redirect({ actionUrl: `${host}/transfer` })]
            }).build()
        )
    } else if (errCount > 3) {
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
                    new Redirect({ actionUrl: `${host}/ccNumberPrompt` })
                ]
            }).build()
        )
    }
})

module.exports = router
