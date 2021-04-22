require('dotenv-safe').config()
const express = require('express')
const customers = require('./customers')
const caller = require('./caller')
const freeclimb = require('./freeclimb')
const host = process.env.HOST

router = express.Router()

let errCount = 0

router.post('/ccCVVPrompt', (req, res) => {
    const incoming = req.body.from
    let script
    if (customers.has(incoming) || errCount > 0) {
        script = "Okay, whats the security code"
    } else {
        script = "Almost done, Whats the security code"
    }

    res.status(200).json(
        freeclimb.percl.build(
            freeclimb.percl.getDigits(`${host}/ccCVV`, {
                prompts: [
                    freeclimb.percl.say(script)
                ],
                maxDigits: 4,
                minDigits: 1,
                flushBuffer: true,
                privacyMode: true
            })
        )
    )
})

router.post('/ccCVV', (req, res) => {
    const getDigitsResponse = req.body
    const digits = getDigitsResponse.digits

    if (digits.length == caller.CVVType) { 
        caller.CVV = digits
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.redirect(`${host}/ccZipPrompt`) 
            )

        )
    } else if (digits == '0') {
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.redirect(`${host}/transfer`)
            )

        )
    }
    else if (errCount >= 3) {
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.say('You have exceeded the maximum number of retries allowed, please wait while we connect you to an operator'),
                freeclimb.percl.redirect(`${host}/transfer`)
            )

        ) 
    }
    else {
        errCount++
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.say(`Sorry im looking for the ${caller.CVVType} digit security code, please enter it now`),
                freeclimb.percl.redirect(`${host}/ccCVVPrompt`)
            )

        )
    }


})

module.exports = router
