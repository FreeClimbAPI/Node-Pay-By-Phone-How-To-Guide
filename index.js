require('dotenv-safe').config()

const bodyParser = require('body-parser')
const express = require('express')
const mainMenuRoutes = require('./mainMenu')
const ccAmtRoutes = require('./ccAmount')
const ccAmountConfirmationRoutes = require('./ccAmountConfirmation')
const ccNumberRoutes = require('./ccNumber')
const ccExpiryRoutes = require('./ccExpiry')
const ccCVVRoutes = require('./ccCVV')
const ccZipRoutes = require('./ccZIP')
const ccRecapRoutes = require('./ccRecap')
const ccProcessRoutes = require('./ccProcess')
const ccConfirmationMessageRoutes = require('./ccConfirmationMessage')
const freeclimb = require('./freeclimb')
const { PerclScript, Say, Pause, Redirect, Hangup } = require('@freeclimb/sdk')

const app = express()
const port = process.env.PORT || 3000
const host = process.env.HOST

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/', mainMenuRoutes)
app.use('/', ccAmtRoutes)
app.use('/', ccAmountConfirmationRoutes)
app.use('/', ccNumberRoutes)
app.use('/', ccExpiryRoutes)
app.use('/', ccCVVRoutes)
app.use('/', ccZipRoutes)
app.use('/', ccRecapRoutes)
app.use('/', ccProcessRoutes)
app.use('/', ccConfirmationMessageRoutes)

app.post('/incomingCall', (req, res) => {
    res.status(200).json(
        new PerclScript({
            commands: [
                new Say({ text: 'Welcome to the Node Pay By Phone Sample App.' }),
                new Pause({ length: 100 }),
                new Redirect({ actionUrl: `${host}/mainMenuPrompt` })
            ]
        }).build()
    )
})

app.post('/transfer', (req, res) => {
    res.status(200).json(
        new PerclScript({
            commands: [
                new Say({ text: 'there are no operators available at this time' }),
                new Redirect({ actionUrl: `${host}/endCall` })
            ]
        }).build()
    )
})

app.post('/endCall', (req, res) => {
    res.status(200).json(
        new PerclScript({
            commands: [
                new Say({
                    text:
                        'Thank you for calling the Node Pay By Phone sample app , have a nice day!'
                }),
                new Hangup({})
            ]
        }).build()
    )
})

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Starting server on port ${port}`)
    })
}

module.exports = { app }
