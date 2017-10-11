#!/usr/bin/env node

const vorpal = require('vorpal')()
const p2p = require('./hello')

vorpal
  .command('open <port>', 'Open new p2p server')
  .alias('o')
  .action((args, next) => {
    const {port} = args

    p2p.startServer({
      port,
      onConnection: (peer) => {
        vorpal.log('new peer')
      },
      messageHandler: (peer, message) => {
        vorpal.log('message', message)
      }
    })

    vorpal.log(`ouvindo em ${port}`)
    next()
  })

vorpal
  .command('connect <host> <port>', 'Connect to peer')
  .alias('cn')
  .action((args, next) => {
    const {
      port,
      host
    } = args

    p2p.connectToPeer({
      port,
      host,
      messageHandler: (peer, message) => {
        vorpal.log('message', message)
      }
    })

    next()
  })

vorpal
  .command('message <data>', 'new message')
  .alias('m')
  .action((args, next) => {
    p2p.broadcast(args.data)
    next()
  })

vorpal
  .command('list', 'Listar peers')
  .alias('l')
  .action((args, next) => {
    vorpal.log('p2p.getPeers().length {}', p2p.getPeers().length)
    p2p.getPeers().forEach(peer => vorpal.log(`👤 ${peer.pxpPeer.socket._host} \n`))
    next()
  })

vorpal
  .delimiter('hi →')
  .show()
