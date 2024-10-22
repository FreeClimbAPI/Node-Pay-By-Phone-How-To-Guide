const express = require('express')
const codeGenerator = require('./confirmationCode')
const { PerclScript, Say, Sms, Redirect } = require('@freeclimb/sdk')
const host = process.env.HOST

const router = express.Router()

router.post('/ccConfirmationMessage', (req, res) => {
    const confirmationNumber = codeGenerator.generate()
    res.status(200).json(
        new PerclScript({
            commands: [
                new Say({
                    text: `Thank you for your payment, your confirmation number is ${confirmationNumber}, you will receive an sms shortly`
                }),
                new Sms({
                    from: process.env.FC_NUMBER,
                    to: req.body.from,
                    text: `your confirmation number is ${confirmationNumber}, thank you for using the Node pay-by-phone tutorial`
                }),
                new Redirect({ actionUrl: `${host}/endcall` })
            ]
        }).build()
    )
})
module.exports = router
