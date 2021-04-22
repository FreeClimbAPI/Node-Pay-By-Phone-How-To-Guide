const express = require('express')
const freeclimb = require('./freeclimb')

require('dotenv-safe').config()

const host = process.env.HOST
const fcNumber = process.env.FC_NUMBER

router = express.Router()

router.post('/ccConfirmationMessage', (req, res) => {
    const confirmationNumber = Math.floor(100000 + Math.random() * 900000).toString()
    console.log(req)
    res.status(200).json(
        freeclimb.percl.build(
            freeclimb.percl.say(
                `Thank you for your payment, your confirmation number is ${confirmationNumber}, you will receive an sms shortly`
            ),
            freeclimb.percl.sms(
                fcNumber,
                req.body.from,
                `your confirmation number is ${confirmationNumber}, thank you for using the Node pay-by-phone tutorial`
            ),
            freeclimb.percl.redirect(`${host}/endcall`)
        )
    )
})
module.exports = router
