require('dotenv-safe').config()
const express = require('express')
const freeclimbSDK = require('@freeclimb/sdk')
const customers = require('./customers')
const caller = require('./caller')
const host = process.env.HOST
const accountId = process.env.ACCOUNT_ID
const authToken = process.env.AUTH_TOKEN
const freeclimb = freeclimbSDK(accountId, authToken)
const cardValidator = require('card-validator')

router = express.Router()

let errCount = 0

router.post('/ccNumberPrompt', (req, res) => {
    const incoming = req.body.from
    let script
    if (customers.has(incoming)) {
        script = "Okay, whats that card number"
    } else {
        script = "To make a payment with a credit card please enter the card number"
    }

    res.status(200).json(
        freeclimb.percl.build(
            freeclimb.percl.getDigits(`${host}/ccNumber`, {
                prompts: [
                    freeclimb.percl.say(script)
                ],
                maxDigits: 19,
                minDigits: 1,
                flushBuffer: true,
                privacyMode: true
            })
        )
    )
})

router.post('/ccNumber', (req, res) => {
    const getDigitsResponse = req.body
    const digits = getDigitsResponse.digits
    const ccValidation = cardValidator.number(digits)

    if (ccValidation.isValid) { 
        caller.CVVType = ccValidation.card.code.size 
        caller.ccNum = digits
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.redirect(`${host}/ccExpiryPrompt`) 
            )

        )
    } else if (digits == '0') {
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.redirect(`${host}/transfer`)
            )

        )
    }
    else if (errCount > 3) {
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
                freeclimb.percl.say('Sorry the number you entered was invalid please try again'),
                freeclimb.percl.redirect(`${host}/ccNumberPrompt`)
            )

        )
    }


})

module.exports = router