require('dotenv-safe').config()
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


const port = process.env.PORT || 3000
const freeclimb = require('./freeclimb')


const mainMenuRoutes = require('./mainMenu')
const ccAmtRoutes = require('./ccAmount')
const ccAmountConfirmationRoutes = require('./ccAmountConfirmation')
const ccNumberRoutes = require('./ccNumber')
const ccExpiryRoutes = require('./ccExpiry')
const ccCVVRoutes = require('./ccCVV')
const ccZipRoutes = require('./ccZip')
const ccRecapRoutes = require('./ccRecap')
const ccProcessRoutes = require('./ccProcess')
const ccConfirmationMessageRoutes = require('./ccConfirmationMessage')

app.use('/', mainMenuRoutes)
app.use('/',ccAmtRoutes)
app.use('/',ccAmountConfirmationRoutes)
app.use('/',ccNumberRoutes)
app.use('/',ccExpiryRoutes)
app.use('/',ccCVVRoutes)
app.use('/',ccZipRoutes)
app.use('/',ccRecapRoutes)
app.use('/',ccProcessRoutes)
app.use('/',ccConfirmationMessageRoutes)

app.post('/incomingCall', (req, res) => {
  res
    .status(200)
    .json(
      freeclimb.percl.build(
        freeclimb.percl.say('Welcome to the Node Pay By Phone Sample App.'),
        freeclimb.percl.pause(100),
        freeclimb.percl.redirect(`${host}/mainMenuPrompt`)
      )
    )
})

app.post('/transfer', (req, res) => {
  res
    .status(200)
    .json(
      freeclimb.percl.build(
        freeclimb.percl.say('there are no operators available at this time'),
        freeclimb.percl.redirect(`${host}/endCall`)
      )
    )
})

app.post('/endCall', (req, res) => {
  res
    .status(200)
    .json(
      freeclimb.percl.build(
        freeclimb.percl.say(
          'Thank you for calling the Node Pay By Phone sample app , have a nice day!'
        ),
        freeclimb.percl.hangup()
      )
    )
})

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Starting server on port ${port}`)
  })
}

module.exports = { app }
