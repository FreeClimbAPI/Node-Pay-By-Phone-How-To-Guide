require('dotenv-safe').config()
const express = require('express')
const customers = require('./customers')
const caller = require('./caller')
const freeclimb = require('./freeclimb')
const host = process.env.HOST

router = express.Router()

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
        freeclimb.percl.build(
            freeclimb.percl.getDigits(`${host}/ccZip`, {
                prompts: [freeclimb.percl.say(script)],
                maxDigits: 5,
                minDigits: 1,
                flushBuffer: true,
                privacyMode: true
            })
        )
    )
})

router.post('/ccZip', (req, res) => {
    const getDigitsResponse = req.body
    const digits = getDigitsResponse.digits

    if (digits.length == 5) {
        caller.Zip = digits
        res.status(200).json(
            freeclimb.percl.build(freeclimb.percl.redirect(`${host}/ccRecapPrompt`))
        )
    } else if (digits == '0') {
        res.status(200).json(freeclimb.percl.build(freeclimb.percl.redirect(`${host}/transfer`)))
    } else if (errCount > 3) {
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.say(
                    'You have exceeded the maximum number of retries allowed, please wait while we connect you to an operator'
                ),
                freeclimb.percl.redirect(`${host}/transfer`)
            )
        )
    } else {
        errCount++
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.say(
                    `Please enter the 5 digit zip code of the billing address for the card you've entered.`
                ),
                freeclimb.percl.redirect(`${host}/ccAmountPrompt`)
            )
        )
    }
})

module.exports = router
