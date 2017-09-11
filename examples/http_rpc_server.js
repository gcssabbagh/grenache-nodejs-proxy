'use strict'

const Grenache = require('./../')
const Link = require('grenache-nodejs-link')
const Peer = Grenache.HttpPeerRPCServer
const HttpClient = Grenache.HttpPeerRPCClient

const _ = require('lodash')

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new Peer(link, {
  timeout: 300000
})
peer.init()

const client = new HttpClient(link, {})
client.init()

const service = peer.transport('server')
service.listen(_.random(1000) + 1024)

setInterval(function () {
  link.announce('rpc_test', service.port, {})
}, 1000)

//register service with proxy

client.request(
  'http_rpc_register',
  { service: 'rpc_test', transport: 'http'},
  { timeout: 10000 },
  (err, data) => {
    if (err) {
      console.error(err)
      process.exit(-1)
    }
    console.log('register attempt', data)
    return data
  }
)

service.on('request', (rid, key, payload, handler) => {
  console.log('peer', rid, key, payload)
  handler.reply(null, 'world')
  // handler.reply(new Error('something went wrong'), 'world')
})
