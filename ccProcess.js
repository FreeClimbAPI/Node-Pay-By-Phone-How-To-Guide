const express = require('express')
const caller = require('./caller')
const testCards = require('./testCards')
const freeclimb = require('./freeclimb')
const { PerclScript, Redirect, Say } = require('@freeclimb/sdk')

const host = process.env.HOST

const router = express.Router()

let retries = 0

router.post('/ccProcess', (req, res) => {
    const testResponse = testCards.get(caller.ccNum)
    if (testResponse.result === 'success') {
        retries = 0
        res.status(200).json(
            new PerclScript({
                commands: [new Redirect({ actionUrl: `${host}/ccConfirmationMessage` })]
            }).build()
        )
    } else if (retries < 1) {
        retries++
        res.status(200).json(
            new PerclScript({
                commands: [
                    new Say({
                        text:
                            "We're having trouble processing your payment, please try again. Remember we Accept Visa, Discover, Mastercard and American Express cards"
                    }),
                    new Redirect({ actionUrl: `${host}/ccNumberPrompt` })
                ]
            }).build()
        )
    } else {
        retries = 0
        res.status(200).json(
            new PerclScript({
                commands: [
                    new Say({
                        text:
                            'The payment could not be processed at this time please wait while we transfer you to an operator'
                    }),
                    new Redirect({ actionUrl: `${host}/transfer` })
                ]
            }).build()
        )
    }
})
module.exports = router
