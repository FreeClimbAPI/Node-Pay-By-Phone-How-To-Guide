const express = require('express')
const freeclimb = require('./freeclimb')
const { PerclScript, GetDigits, Say, Redirect, Pause } = require('@freeclimb/sdk')

const host = process.env.HOST

const router = express.Router()

let mainMenuErrCount = 0

router.post('/mainMenuPrompt', (req, res) => {
    res.status(200).json(
        new PerclScript({
            commands: [
                new GetDigits({
                    prompts: [
                        new Say({
                            text:
                                ' to make a one time payment please press 1, or press 0 to speak with an operator'
                        })
                    ],
                    actionUrl: `${host}/mainMenu`,
                    maxDigits: 1,
                    minDigits: 1,
                    flushBuffer: true
                })
            ]
        }).build()
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
            new PerclScript({
                commands: [
                    new Say({ text: 'Error, please try again' }),
                    new Redirect({ actionUrl: `${host}/mainMenuPrompt` })
                ]
            }).build()
        )
    } else if (mainMenuErrCount >= 3) {
        mainMenuErrCount = 0
        res.status(200).json(
            new PerclScript({
                commands: [
                    new Say({ text: 'Max retry limit reached' }),
                    new Pause({ length: 100 }),
                    new Redirect({ actionUrl: `${host}/endCall` })
                ]
            }).build()
        )
    } else {
        mainMenuErrCount = 0
        res.status(200).json(
            new PerclScript({
                commands: [new Redirect({ actionUrl: menuOpts.get(digits).redirect })]
            }).build()
        )
    }
})

module.exports = router
