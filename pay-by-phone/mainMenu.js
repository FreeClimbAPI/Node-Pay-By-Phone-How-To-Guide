const express = require('express')
const freeclimb = require('./freeclimb')


const host = process.env.HOST

const router = express.Router()

let mainMenuErrCount = 0

router.post('/mainMenuPrompt', (req, res) => {
    res.status(200).json(
        freeclimb.percl.build(
            freeclimb.percl.getDigits(`${host}/mainMenu`, {
                prompts: [
                    freeclimb.percl.say(
                        ' to make a one time payment please press 1, or press 0 to speak with an operator'
                    )
                ],
                maxDigits: 1,
                minDigits: 1,
                flushBuffer: true
            })
        )
    )
})

router.post('/mainMenu', (req, res) => {
    const getDigitsResponse = req.body
    const digits = getDigitsResponse.digits
    const menuOpts = new Map([
        [
            '1',
            {
                redirect: `${host}/ccAmountPrompt`
            }
        ],
        [
            '0',
            {
                redirect: `${host}/transfer`
            }
        ]
    ])
    if ((!digits || !menuOpts.get(digits)) && mainMenuErrCount < 3) {
        mainMenuErrCount++
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.say('Error, please try again'),
                freeclimb.percl.redirect(`${host}/mainMenuPrompt`)
            )
        )
    } else if (mainMenuErrCount >= 3) {
        mainMenuErrCount = 0
        res.status(200).json(
            freeclimb.percl.build(
                freeclimb.percl.say('Max retry limit reached'),
                freeclimb.percl.pause(100),
                freeclimb.percl.redirect(`${host}/endCall`)
            )
        )
    } else {
        mainMenuErrCount = 0
        res.status(200).json(
            freeclimb.percl.build(freeclimb.percl.redirect(menuOpts.get(digits).redirect))
        )
    }
})

module.exports = router
