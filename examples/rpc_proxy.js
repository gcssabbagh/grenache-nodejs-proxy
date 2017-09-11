'use strict'

const Grenache = require('./../')
const Link = require('grenache-nodejs-link')
const HttpServer = Grenache.HttpPeerRPCServer
const WSServer = Grenache.WSPeerRPCServer
const HttpClient = Grenache.HttpPeerRPCClient;
const WSClient = Grenache.WSPeerRPCClient;

const _ = require('lodash')

// setup link, servers and clients
const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const httpServer = new HttpServer(link, {
  timeout: 300000
})
httpServer.init()

const wsServer = new WSServer(link, {
  timeout: 300000
})
wsServer.init()

const httpClient = new HttpClient(link, {})
httpClient.init()

const wsClient = new WSClient(link, {})
wsClient.init()

// registered services and respective transports will be saved in this object
let proxyRegistry = {};

// proxy request to service via http/ws
const proxyRequest = (service, payload, transport, callback) => {
  if (transport === 'http') {
    httpClient.request(service, payload, { timeout: 10000 }, (err, data) => {
      if (err) {
        console.error(err)
      }
      console.log('http_proxy', data)
      callback(err, data)
    })
  }
  if (transport === 'ws') {
    wsClient.request(service, payload, { timeout: 10000 }, (err, data) => {
      if (err) {
        console.error(err)
      }
      console.log('ws_proxy', data)
      callback(err, data)
    })
  }

}

const httpService = httpServer.transport('server')
httpService.listen(_.random(1000) + 1024)

const wsService = wsServer.transport('server')
wsService.listen(_.random(1000) + 1024)

setInterval(function () {
  link.announce('http_rpc_proxy', httpService.port, {})
  link.announce('http_rpc_register', httpService.port, {})

  link.announce('ws_rpc_proxy', wsService.port, {})
  link.announce('ws_rpc_register', wsService.port, {})
}, 1000)

httpService.on('request', (rid, key, payload, handler) => {
  console.log('http_peer', rid, key, payload)
  if (key === 'http_rpc_proxy') {
    proxyRequest(payload.service, payload.payload, proxyRegistry[payload.service], (err, data) => {
      handler.reply(err, data);
    })
  }
  if (key === 'http_rpc_register') {
    console.log(proxyRegistry)
    proxyRegistry[payload.service] = payload.transport
    console.log('registered!', proxyRegistry)
    handler.reply(null, `registered ${payload.service} ${payload.transport}`)
  }
})

wsService.on('request', (rid, key, payload, handler) => {
  console.log('ws_peer', rid, key, payload)
  if (key === 'ws_rpc_proxy') {
    proxyRequest(payload.service, payload.payload, proxyRegistry[payload.service], handler.reply)
  }
  if (key === 'ws_rpc_register') {
    console.log(proxyRegistry)
    proxyRegistry[payload.service] = payload.transport
    console.log('registered!', proxyRegistry)
    handler.reply(null, `registered ${payload.service} ${payload.transport}`)
  }
})