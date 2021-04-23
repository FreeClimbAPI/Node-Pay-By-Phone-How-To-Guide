const testCards = new Map([
    ['4539512795366158', { result: 'success', message: 'Transaction processed successfully' }],
    ['341814945428581', { result: 'success', message: 'Transaction processed successfully' }],
    ['4007000000027', { result: 'failure', message: 'Invalid card number' }],
    ['373543870670161', { result: 'failure', message: 'Invalid card number' }],
    ['5478670693104129', { result: 'failure', message: 'Invalid card number' }],
    ['6011592457501696709', { result: 'failure', message: 'Invalid card Number' }],
    ['4929677130838456', { result: 'failure', message: 'Invalid Expiration Date' }],
    ['6011844071763663', { result: 'failure', message: 'Invalid CVV' }],
    ['375804818469449', { result: 'failure', message: 'Invalid CVV' }],
    ['5113791227910848', { result: 'failure', message: 'Invalid Zip code' }]
])

module.exports = testCards
