const wrtc = require('wrtc')
const Exchange = require('peer-exchange')
const p2p = new Exchange('blockchain.js', { wrtc: wrtc })
const net = require('net')
const logger = require('vorpal')()

class PeerToPeer {
  constructor () {
    this.peers = []
  }

  startServer ({port}) {
    const server = net.createServer(socket => p2p.accept(socket, (err, connection) => {
      if (err) {
        logger.log(`❗  ${err}`)
      } else {
        logger.log('👥  A peer has connected to the server!')
        this.initConnection.call(this, connection)
      }
    })).listen(port)
    logger.log(`📡  listening to peers on ${server.address().address}:${server.address().port}... `)
  }

  connectToPeer ({host, port}) {
    const socket = net.connect(port, host, () => p2p.connect(socket, (err, connection) => {
      if (err) {
        logger.log(`❗  ${err}`)
      } else {
        logger.log('👥  Successfully connected to a new peer!')
        this.initConnection.call(this, connection)
      }
    }))
  }

  discoverPeers () {
    p2p.getNewPeer((err) => {
      if (err) {
        logger.log(`❗  ${err}`)
      } else {
        logger.log('👀  Discovered new peers.') // todo
      }
    })
  }

  initConnection (connection) {
    this.peers.push(connection)
    this.initMessageHandler(connection)
    this.initErrorHandler(connection)
  }

  initMessageHandler (connection) {
    connection.on('data', data => {
      const message = JSON.parse(data.toString('utf8'))
      this.handleMessage(connection, message)
    })
  }

  handleMessage (peer, message) {
    logger.log(`new message -> ${message}`)
  }

  initErrorHandler (connection) {
    connection.on('error', error => logger.log(`❗  ${error}`))
  }

  broadcast (message) {
    this.peers.forEach(peer => this.write(peer, message))
  }

  write (peer, message) {
    peer.write(JSON.stringify(message))
  }

  closeConnection () {

  }

  handleBlockchainResponse (message) {

  }
}

module.exports = new PeerToPeer()
