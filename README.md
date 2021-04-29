# Node Pay By Phone Tutorial

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Pay By Phone CI](https://github.com/FreeClimbAPI/Node-Pay-By-Phone-Tutorial/actions/workflows/node-pay-by-phone-sample.yaml/badge.svg?branch=master)](https://github.com/FreeClimbAPI/Node-Pay-By-Phone-Tutorial/actions/workflows/node-pay-by-phone-sample.yaml)
[![Coverage Status](https://coveralls.io/repos/github/FreeClimbAPI/Node-Pay-By-Phone-Tutorial/badge.svg?branch=master)](https://coveralls.io/github/FreeClimbAPI/Node-Pay-By-Phone-Tutorial?branch=master)

This project serves as a guide to help you build a pay by phone IVR application with [FreeClimb](https://docs.freeclimb.com/docs/how-freeclimb-works).

Specifically, the project will:

- Receive an incoming call via a FreeClimb application
- Route users via [DTMF](https://en.wikipedia.org/wiki/Dual-tone_multi-frequency_signaling) (e.g. keypad) input
- Collect and process credit card payment information using [`privacymode`](https://docs.freeclimb.com/docs/securing-sensitive-user-data#using-privacymode-in-your-applications)
- Use [PerCL](https://docs.freeclimb.com/reference/percl-overview) to send an SMS payment confirmation message to user

## Tutorial

We offer a [Pay by Phone with Voice Calling tutorial](https://docs.freeclimb.com/docs/pay-by-phone) for more detailed set-up instructions and explanation of how the code in this sample app works.

## Requirements
A [FreeClimb account](https://www.freeclimb.com/dashboard/signup/)

A [registered application](https://docs.freeclimb.com/docs/registering-and-configuring-an-application#register-an-app) with a named alias

A [configured FreeClimb number](https://docs.freeclimb.com/docs/getting-and-configuring-a-freeclimb-number) assigned to your application

Trial accounts: a [verified number](https://docs.freeclimb.com/docs/using-your-trial-account#verifying-outbound-numbers)

Tools:
- [Node.js](https://nodejs.org/en/download/) 12.14.0 or higher
- [Yarn](https://yarnpkg.com/en/)
- [ngrok](https://ngrok.com/download) (optional for hosting)

## Setting up the Sample App

1. Install the required packages

    ```bash
    yarn install
    ```

1. Create a .env file and configure the following environment variables within it:

    | ENV VARIABLE    | DESCRIPTION                                                                                                                                                                                                                               |
    | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | ACCOUNT_ID      | Account ID which can be found under [API credentials](https://www.freeclimb.com/dashboard/portal/account/authentication) in dashboard.                                                                                                         |
    | API_KEY      | API key which can be found under [API credentials](https://www.freeclimb.com/dashboard/portal/account/authentication) in dashboard.                                                                                                  |
    | HOST            | The hostname as defined in your FC application. We recommend [ngrok](https://ngrok.com/download) as an option to get up and running quickly.                                                                                                                                                                                            |
    | PORT            | Specifies the port on which the app will run (e.g. PORT=3000 means you would direct your browser to http://localhost:3000).                                                                                                                                                                                              |
    | FC_NUMBER       | The FreeClimb phone number associated with your application.                                                                                                                                                                                             |
    
## Running the Sample App

```bash
yarn start
```

## Feedback & Issues
If you would like to give the team feedback or you encounter a problem, please [contact support](https://www.freeclimb.com/support/) or [submit a ticket](https://freeclimb.com/dashboard/portal/support) in the dashboard.
