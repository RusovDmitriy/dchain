// const blockchain = require('./blockchain')
// const WebSocket = require('ws')
// const PORT = +process.env.PORT || 3030
// const INIT_PEERS_LIST = [
//   {host: '127.0.0.1', port: 5051},
//   {host: '127.0.0.1', port: 5052}
// ]

// const METHODS = {
//   GET_BLOCKS_AFTER: 0,
//   BLOCKS_AFTER: 1,
//   NEW_BLOCK: 2,
//   NEW_TRANSACTION: 3
// }


// const SOCKETS = []

// server = new WebSocket.Server({port: PORT});
// server.on('connection', connection)

// function connection(ws) {


// }

// function connectToPeers(peers) {
//   peers.forEach(peer => {
//     if (peer.port !== PORT) {
//       var ws = new WebSocket(`ws://${peer.host}:${peer.port}`)
//       ws.on('open', () => connection(ws))
//       ws.on('error', () => {
//         console.log('connection failed')
//       })
//     }

//   })
// }

// connectToPeers(INIT_PEERS_LIST)

// module.exports = class Peers {
//   static broadcast(data) {
//     SOCKETS.forEach(ws => ws.send(JSON.stringify(data)))
//   }
// }

