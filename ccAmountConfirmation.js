const express = require('express')
const freeclimb = require('./freeclimb')
const caller = require('./caller')
const { PerclScript, GetDigits, Say, Redirect, Pause } = require('@freeclimb/sdk')

const host = process.env.HOST

const router = express.Router()

let errCount = 0
let retries = 0

router.post('/ccAmountConfirmationPrompt', (req, res) => {
    res.status(200).json(
        new PerclScript({
            commands: [
                new GetDigits({
                    prompts: [
                        new Say({
                            text: `Just to be sure thats ${req.query.amt} dollars is that correct? Press 1 for yes and 2 for no`
                        })
                    ],
                    actionUrl: `${host}/ccAmountConfirmation?amt=${req.query.amt}`,
                    maxDigits: 1,
                    minDigits: 1,
                    flushBuffer: true
                })
            ]
        }).build()
    )
})

router.post('/ccAmountConfirmation', (req, res) => {
    const getDigitsResponse = req.body
    const digits = getDigitsResponse.digits
    const menuOpts = new Map([
        [
            '1',
            {
                script: 'Thank you',
                redirect: `${host}/ccNumberPrompt`
            }
        ],
        [
            '2',
            {
                script: 'Ok',
                redirect: `${host}/ccAmountPrompt`
            }
        ],
        ['0', { script: 'Redirecting you to an operator', redirect: `${host}/transfer` }]
    ])
    if ((!digits || !menuOpts.get(digits)) && errCount < 3) {
        errCount++
        res.status(200).json(
            new PerclScript({
                commands: [
                    new Say({ text: 'Error' }),
                    new Redirect({
                        actionUrl: `${host}/ccAmountConfirmationPrompt?amt=${req.query.amt}`
                    })
                ]
            }).build()
        )
    } else if (errCount >= 3 || retries >= 2) {
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
            caller.paymentAmt = req.query.amt
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
