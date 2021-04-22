require('dotenv-safe').config()
const express = require('express')
const customers = require('./customers')
const freeclimb = require('./freeclimb')
const host = process.env.HOST

router = express.Router()

let errCount = 0

router.post('/ccAmountPrompt', (req, res) => {
    const incoming = req.body.from
    let script
    if (customers.has(incoming)) {
        script = 'so how much would you like to pay'
    } else {
        script =
            'How much would you like to pay? Just key in the payment amount in US Dollars For example, to make a payment of twenty dollars press two zero, to speak to an agent press zero'
    }

    res.status(200).json(
        freeclimb.percl.build(
            freeclimb.percl.getDigits(`${host}/ccAmount`, {
                prompts: [
                    freeclimb.percl.say(script),
                    freeclimb.percl.say('The maximum amount is 100 dollars')
                ],
                maxDigits: 3,
                minDigits: 1,
                flushBuffer: true
            })
        )
    )
})

router.post('/ccAmount', (req, res) => {
    const getDigitsResponse = req.body
    const digits = getDigitsResponse.digits
    const price = parseInt(digits)

    if (digits == '0') {
        res.status(200).json(freeclimb.percl.build(freeclimb.percl.redirect(`${host}/transfer`)))
    } else if (price < 100) {
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.redirect(`${host}/ccAmountConfirmationPrompt?amt=${price}`)
            )
        )
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
                freeclimb.percl.say('Sorry the number you entered was invalid please try again'),
                freeclimb.percl.redirect(`${host}/ccAmountPrompt`)
            )
        )
    }
})

module.exports = router
