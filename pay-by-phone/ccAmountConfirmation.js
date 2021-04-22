const express = require('express')
const freeclimb = require('./freeclimb')
const caller = require('./caller')
require('dotenv-safe').config()

const host = process.env.HOST

router = express.Router()

let errCount = 0
let retries = 0

router.post('/ccAmountConfirmationPrompt', (req, res) => {
    res.status(200).json(
        freeclimb.percl.build(
            freeclimb.percl.getDigits(`${host}/ccAmountConfirmation?amt=${req.param('amt')}`, {
                prompts: [
                    freeclimb.percl.say(
                        `Just to be sure thats ${req.param(
                            'amt'
                        )} dollars is that correct? Press 1 for yes and 2 for no`
                    )
                ],
                maxDigits: 1,
                minDigits: 1,
                flushBuffer: true
            })
        )
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
            freeclimb.percl.build(
                freeclimb.percl.say('Error'),
                freeclimb.percl.redirect(
                    `${host}/ccAmountConfirmationPrompt?acct=${req.param('amt')}`
                )
            )
        )
    } else if (errCount >= 3 || retries >= 2) {
        errCount = 0
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.say('Please wait while we connect you to an operator'),
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
            caller.paymentAmt = req.param('amt')
        }
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.say(menuOpts.get(digits).script),
                freeclimb.percl.redirect(menuOpts.get(digits).redirect)
            )
        )
    }
})

module.exports = router
