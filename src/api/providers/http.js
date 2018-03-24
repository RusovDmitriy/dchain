const finalhandler = require('finalhandler')
const jsonrpc = require('jsonrpc-lite')
const http = require('http')
const bodyParser = require('body-parser')
const Router = require('router')
const PORT = 3000

module.exports = function(actions) {
  const router = Router()
  router.use(bodyParser.json())

  router.get('*', (req, res) => {
    res.end('Welcome! I`am node.js + redis BlockChain.')
  })

  router.post('*', async (req, res) => {
    const {type, payload: {id, method, params}} = jsonrpc.parseObject(req.body)
    const result = {code: 200, msg: ''}
    if (type === 'request') {
      if (actions[method]) {
        try {
          const data = await actions[method](params[0])
          result.msg = jsonrpc.success(id, data)
        } catch (err) {
          result.code = err.code || 500
          result.msg = jsonrpc.error(id, new jsonrpc.JsonRpcError(err.message, result.code))
        }
      } else {
        result.code = 404
        result.msg = jsonrpc.error(id, new jsonrpc.JsonRpcError(`Not found method: ${method}`, 404))
      }
    } else {
      result.code = 400
      result.msg = jsonrpc.error(id, new jsonrpc.JsonRpcError('Invalid JSON-RPC data', 400))
    }
    res.statusCode = result.code
    res.write(JSON.stringify(result.msg))
    res.end()
  })

  const server = http.createServer((req, res) => router(req, res, finalhandler(req, res)))
  server.listen(PORT, () => console.log('Http server start listen, port: ', PORT))
}