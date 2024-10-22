const freeclimbSDK = require('@freeclimb/sdk')
const accountId = process.env.ACCOUNT_ID
const apiKey = process.env.API_KEY
const configuration = freeclimbSDK.createConfiguration({ accountId, apiKey })
const freeclimb = new freeclimbSDK.DefaultApi(configuration)

module.exports = freeclimb
