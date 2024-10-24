const express = require('express')
const customers = require('./customers')
const caller = require('./caller')
const freeclimb = require('./freeclimb')
const { PerclScript, GetDigits, Say, Redirect } = require('@freeclimb/sdk')

const host = process.env.HOST

const router = express.Router()

let errCount = 0

router.post('/ccZipPrompt', (req, res) => {
    const incoming = req.body.from
    let script
    if (customers.has(incoming)) {
        script = 'Okay, whats the Zip code'
    } else {
        script = 'Last thing, Whats the zip code for this card?'
    }

    res.status(200).json(
        new PerclScript({
            commands: [
                new GetDigits({
                    prompts: [new Say({ text: script })],
                    actionUrl: `${host}/ccZip`,
                    maxDigits: 5,
                    minDigits: 1,
                    flushBuffer: true,
                    privacyMode: true
                })
            ]
        }).build()
    )
})

router.post('/ccZip', (req, res) => {
    const getDigitsResponse = req.body
    const digits = getDigitsResponse.digits

    if (digits.length == 5) {
        caller.Zip = digits
        res.status(200).json(
            new PerclScript({
                commands: [new Redirect({ actionUrl: `${host}/ccRecapPrompt` })]
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
                        text: `Please enter the 5 digit zip code of the billing address for the card you've entered.`
                    }),
                    new Redirect({ actionUrl: `${host}/ccZipPrompt` })
                ]
            }).build()
        )
    }
})

module.exports = router
