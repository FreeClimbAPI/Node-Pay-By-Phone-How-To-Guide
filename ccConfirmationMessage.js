require('dotenv-safe').config()
const express = require('express')
const freeclimbSDK = require('@freeclimb/sdk')
const codeGenerator = require('./confirmationCode')
const host = process.env.HOST
const accountId = process.env.ACCOUNT_ID
const authToken = process.env.AUTH_TOKEN
const fcNumber = process.env.FC_NUMBER
const freeclimb = freeclimbSDK(accountId, authToken)

router = express.Router()

router.post('/ccConfirmationMessage', (req, res) => {
   const confirmationNumber = codeGenerator.generate()
   res
      .status(200)
      .json(
        freeclimb.percl.build(
          freeclimb.percl.say(`Thank you for your payment, your confirmation number is ${confirmationNumber}, you will receive an sms shortly`),
          freeclimb.percl.sms(fcNumber,req.body.from,`your confirmation number is ${confirmationNumber}, thank you for using the Node pay-by-phone tutorial`),
          freeclimb.percl.redirect(`${host}/endcall`)
        )
      )
})
module.exports = router
