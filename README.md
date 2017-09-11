# [Grenache](https://github.com/bitfinexcom/grenache) Node.JS HTTP implementation

Grenache is a micro-framework for connecting microservices. Its simple and optimized for performance.

Internally, Grenache uses Distributed Hash Tables (DHT, known from Bittorrent) for Peer to Peer connections. You can find more details how Grenche internally works at the [Main Project Homepage](https://github.com/bitfinexcom/grenache)

 - [Setup](#setup)
 - [Examples](#examples)
 - [API](#api)

## Setup

### Install
```
npm install
```

### Other Requirements

Install `Grenache Grape`: https://github.com/bitfinexcom/grenache-grape:

```bash
npm i -g grenache-grape
```

```
// Run 3 Grapes
grape -b 127.0.0.1 --dp 20001 --dc 32 --aph 30001 --bn '127.0.0.1:20002,127.0.0.1:20003'
grape --dp 20002 --aph 40001 --dc 32 --bn '127.0.0.1:20001,127.0.0.1:20003'
grape --dp 20003 --aph 50001 --dc 32 --bn '127.0.0.1:20001,127.0.0.1:20002'
```

### Examples

#### RPC Proxy / Server / Client

Run proxy first, then server, then client
```bash
node examples/rpc_proxy.js
node examples/http_rpc_server.js
node examples/ws_rpc_client.js
```

The RPC Proxy announces its proxy and register services for each transport supported:
`http_rpc_proxy`, `http_rpc_register`, `ws_rpc_proxy`, `ws_rpc_register`

This Http RPC Server example announces a service called `rpc_test`
on the overlay network. When a request from a client is received,
it replies with `world`.  
The RPC Server will then register with the proxy by providing its service name and transport

The WS client can now communicate directly with the proxy (in this case via Websocket) and not worry about the server's transport.  
The Proxy will do the translation.  
The client sends `hello` and receives `world` from the server (via proxy).

[Code Proxy](https://github.com/gcssabbagh/grenache-nodejs-proxy/tree/master/examples/rpc_proxy.js)  
[Code Server](https://github.com/bitfinexcom/grenache-nodejs-http/tree/master/examples/http_rpc_server.js)  
[Code Client](https://github.com/bitfinexcom/grenache-nodejs-http/tree/master/examples/ws_rpc_client.js)