const express = require('express')
const customers = require('./customers')
const caller = require('./caller')
const freeclimb = require('./freeclimb')

require('dotenv-safe').config()

const host = process.env.HOST

router = express.Router()

let errCount = 0

router.post('/ccExpiryPrompt', (req, res) => {
    const incoming = req.body.from
    let script
    if (customers.has(incoming)) {
        script = 'Okay, whats the four digit expiration date'
    } else {
        script =
            'Enter the expiration date using two digits for the month and two digits for the year'
    }

    res.status(200).json(
        freeclimb.percl.build(
            freeclimb.percl.getDigits(`${host}/ccExpiry`, {
                prompts: [freeclimb.percl.say(script)],
                maxDigits: 4,
                minDigits: 1,
                flushBuffer: true,
                privacyMode: true
            })
        )
    )
})

router.post('/ccExpiry', (req, res) => {
    const getDigitsResponse = req.body
    const digits = getDigitsResponse.digits

    if (digits.length == 4 && dateCheck(digits)) {
        caller.ccExp = digits
        res.status(200).json(freeclimb.percl.build(freeclimb.percl.redirect(`${host}/ccCVVPrompt`)))
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
                freeclimb.percl.say('Sorry the date you entered was invalid please try again'),
                freeclimb.percl.redirect(`${host}/ccExpiryPrompt`)
            )
        )
    }
})

const dateCheck = digits => {
    const month = 1 + parseInt(digits.substring(0, 2))
    const year = 2000 + parseInt(digits.substring(2))
    const expDate = new Date(year, month)
    const now = new Date()
    return expDate - now >= 0
}

module.exports = router
