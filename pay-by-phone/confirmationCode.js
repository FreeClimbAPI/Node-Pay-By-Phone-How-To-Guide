exports.generate = () => {
    return Math.floor(100000 + Math.random() * 900000).toString() // create verification code as random 6 digit number represented with a string
}
