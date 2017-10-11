
const wrtc = require('wrtc')
const Exchange = require('peer-exchange')
const p2p = new Exchange('blockchain.js', { wrtc: wrtc })
const net = require('net')
const logger = require('vorpal')()

const peers = []

function startServer ({port}) {
  const server = net.createServer(socket => p2p.accept(socket, (err, connection) => {
    if (err) {
      logger.log(`❗  ${err}`)
    } else {
      logger.log('👥  A peer has connected to the server!')
      initConnection(connection)
    }
  })).listen(port)
  logger.log(`📡  listening to peers on ${server.address().address}:${server.address().port}... `)
}

function connectToPeer ({host, port}) {
  const socket = net.connect(port, host, () => p2p.connect(socket, (err, connection) => {
    if (err) {
      logger.log(`❗  ${err}`)
    } else {
      logger.log('👥  Successfully connected to a new peer!')
      initConnection(connection)
    }
  }))
}

function discoverPeers () {
  p2p.getNewPeer((err) => {
    if (err) {
      logger.log(`❗  ${err}`)
    } else {
      logger.log('👀  Discovered new peers.') // todo
    }
  })
}

function initConnection (connection) {
  peers.push(connection)
  initMessageHandler(connection)
  initErrorHandler(connection)
}

function initMessageHandler (connection) {
  connection.on('data', data => {
    const message = JSON.parse(data.toString('utf8'))
    handleMessage(connection, message)
  })
}

function handleMessage (peer, message) {
  logger.log('new message ->', message)
}

function initErrorHandler (connection) {
  connection.on('error', error => logger.log(`❗  ${error}`))
}

function broadcast (message) {
  peers.forEach(peer => peer.write(JSON.stringify(message)))
}

function getPeers () {
  return peers
}

module.exports = {
  startServer,
  broadcast,
  discoverPeers,
  connectToPeer,
  getPeers
}
