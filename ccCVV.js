const express = require('express')
const customers = require('./customers')
const caller = require('./caller')
const freeclimb = require('./freeclimb')
const { PerclScript, GetDigits, Say, Redirect } = require('@freeclimb/sdk')

const host = process.env.HOST

const router = express.Router()

let errCount = 0

router.post('/ccCVVPrompt', (req, res) => {
    const incoming = req.body.from
    let script
    if (customers.has(incoming) || errCount > 0) {
        script = 'Okay, whats the security code'
    } else {
        script = 'Almost done, Whats the security code'
    }

    res.status(200).json(
        new PerclScript({
            commands: [
                new GetDigits({
                    prompts: [new Say({ text: script })],
                    actionUrl: `${host}/ccCVV`,
                    maxDigits: 4,
                    minDigits: 1,
                    flushBuffer: true,
                    privacyMode: true
                })
            ]
        }).build()
    )
})

router.post('/ccCVV', (req, res) => {
    const getDigitsResponse = req.body
    const digits = getDigitsResponse.digits

    if (digits.length == caller.CVVType) {
        caller.CVV = digits
        res.status(200).json(
            new PerclScript({
                commands: [new Redirect({ actionUrl: `${host}/ccZipPrompt` })]
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
                    new Say({
                        text: `Sorry im looking for the ${caller.CVVType} digit security code, please enter it now`
                    }),
                    new Redirect({ actionUrl: `${host}/ccCVVPrompt` })
                ]
            }).build()
        )
    }
})

module.exports = router
