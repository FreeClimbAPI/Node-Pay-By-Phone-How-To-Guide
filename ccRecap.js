const express = require('express')
const caller = require('./caller')
const customers = require('./customers')
const freeclimb = require('./freeclimb')
const { PerclScript, GetDigits, Say, Redirect, Pause } = require('@freeclimb/sdk')

const host = process.env.HOST

const router = express.Router()

let errCount = 0
let retries = 0

router.post('/ccRecapPrompt', (req, res) => {
    customers.add(req.from)
    res.status(200).json(
        new PerclScript({
            commands: [
                new GetDigits({
                    prompts: [
                        new Say({
                            text: `Your payment will be ${
                                caller.paymentAmt
                            } dollars on the card ending in ${caller.ccNum.substring(
                                caller.ccNum.length - 4
                            )}, if thats correct press 1 to confirm if not press 2 to try again`
                        })
                    ],
                    actionUrl: `${host}/ccRecap`,
                    maxDigits: 1,
                    minDigits: 1,
                    flushBuffer: true
                })
            ]
        }).build()
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
        ['0', { script: 'Redirecting you to an operator', redirect: `${host}/transfer` }]
    ])
    if ((!digits || !menuOpts.get(digits)) && errCount < 1) {
        errCount++
        res.status(200).json(
            new PerclScript({
                commands: [
                    new Say({ text: 'Error' }),
                    new Redirect({ actionUrl: `${host}/ccRecapPrompt` })
                ]
            }).build()
        )
    } else if (errCount >= 1 || retries >= 1) {
        errCount = 0
        res.status(200).json(
            new PerclScript({
                commands: [
                    new Say({ text: 'Please wait while we connect you to an operator' }),
                    new Pause({ length: 100 }),
                    new Redirect({ actionUrl: `${host}/transfer` })
                ]
            }).build()
        )
    } else {
        errCount = 0
        if (digits === '2') {
            retries++ // retries tracked separately from input errors
        } else if (digits === '1') {
            retries = 0
        }
        res.status(200).json(
            new PerclScript({
                commands: [
                    new Say({ text: menuOpts.get(digits).script }),
                    new Redirect({ actionUrl: menuOpts.get(digits).redirect })
                ]
            }).build()
        )
    }
})

module.exports = router
