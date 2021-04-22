require('dotenv-safe').config()
const express = require('express')
const caller = require('./caller')
const testCards = require('./testCards')
const freeclimb = require('./freeclimb')
const host = process.env.HOST

router = express.Router()

let retries = 0

router.post('/ccProcess', (req, res) => {
    const testResponse = testCards.get(caller.ccNum)
    if (testResponse.result === 'success') {
        retries = 0
        res.status(200).json(
            freeclimb.percl.build(freeclimb.percl.redirect(`${host}/ccConfirmationMessage`))
        )
    } else if (retries < 1) {
        retries++
        console.error(testResponse.message)
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.say(
                    "We're having trouble processing your payment, please try again. Remember we Accept Visa, Discover, Mastercard and American Express cards"
                ),
                freeclimb.percl.redirect(`${host}/ccNumberPrompt`)
            )
        )
    } else {
        retries = 0
        console.error(testResponse.message)
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.say(
                    'The payment could not be processed at this time please wait while we transfer you to an operator'
                ),
                freeclimb.percl.redirect(`${host}/transfer`)
            )
        )
    }
})
module.exports = router
