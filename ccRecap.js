require('dotenv-safe').config()
const express = require('express')
const freeclimbSDK = require('@freeclimb/sdk')
const host = process.env.HOST
const accountId = process.env.ACCOUNT_ID
const authToken = process.env.AUTH_TOKEN
const freeclimb = freeclimbSDK(accountId, authToken)
const caller = require('./caller')
const customers = require('./customers')

router = express.Router()

let errCount = 0
let retries = 0

router.post('/ccRecapPrompt', (req, res) => {
    customers.add(req.from)
    res.status(200).json(
        freeclimb.percl.build(
            freeclimb.percl.getDigits(
                `${host}/ccRecap`,
                {
                    prompts: [
                        freeclimb.percl.say(
                            `Your payment will be ${caller.paymentAmt} dollars on the card ending in ${caller.ccNum.substring(caller.ccNum.length - 4)}, if thats correct press 1 to confirm if not press 2 to try again`
                        )
                    ],
                    maxDigits: 1,
                    minDigits: 1,
                    flushBuffer: true
                }
            )
        )
    )
})

router.post('/ccRecap', (req, res) => {
    const getDigitsResponse = req.body
    const digits = getDigitsResponse.digits
    const menuOpts = new Map([
        [
            '1',
            {
                script: 'great',
                redirect: `${host}/ccProcess`
            }
        ],
        [
            '2',
            {
                script: 'Sorry to make sure your information is correct lets start again',
                redirect: `${host}/ccAmountPrompt`
            }
        ],
        [
            '0',
            { script: 'Redirecting you to an operator', redirect: `${host}/transfer` }
        ]
    ])
    if ((!digits || !menuOpts.get(digits)) && errCount < 1) {
        errCount++
        res
            .status(200)
            .json(
                freeclimb.percl.build(
                    freeclimb.percl.say('Error'),
                    freeclimb.percl.redirect(
                        `${host}/ccRecapPrompt`
                    )
                )
            )
    } else if (errCount >= 1 || retries >= 1) {
        errCount = 0
        res
            .status(200)
            .json(
                freeclimb.percl.build(
                    freeclimb.percl.say(
                        'Please wait while we connect you to an operator'
                    ),
                    freeclimb.percl.pause(100),
                    freeclimb.percl.redirect(`${host}/transfer`)
                )
            )
    } else {
        errCount = 0
        if (digits === '2') {
            retries++ // retries tracked separately from input errors
        } else if (digits === '1') {
            retries = 0
        }
        res
            .status(200)
            .json(
                freeclimb.percl.build(
                    freeclimb.percl.say(menuOpts.get(digits).script),
                    freeclimb.percl.redirect(menuOpts.get(digits).redirect)
                )
            )
    }
})

module.exports = router
