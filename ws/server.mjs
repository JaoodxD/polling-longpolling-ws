import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import WebSocket, { WebSocketServer } from 'ws'

const getResource = name => {
  const resources = {
    '/': 'index.html',
    '/client.js': 'client.js'
  }

  const MIMEType = {
    '/': 'text/html',
    '/client.js': 'text/javascript'
  }

  const fileName = resources[name] ?? resources['/']
  const path = join(import.meta.dirname, fileName)
  const file = createReadStream(path)
  const type = MIMEType[name] ?? MIMEType['/']
  return { file, type }
}

const messages = []

const getMessages = () => messages

const server = createServer(async (req, res) => {
  const resource = req.url
  const { file, type } = getResource(resource)
  res.setHeader('Content-Type', type)
  file.pipe(res)
})

server.listen(3000)

const ws = new WebSocketServer({ server })

ws.on('connection', (connection, req) => {
  const messages = JSON.stringify(getMessages())
  connection.send(messages, { binary: false })
})

setInterval(() => {
  const message = { id: Date.now(), message: randomUUID() }
  messages.push(message)

  // notify all clients with new message
  for (const client of ws.clients) {
    if (client.readyState !== WebSocket.OPEN) continue
    const newMessage = JSON.stringify([message])
    client.send(newMessage, { binary: false })
  }
}, 5000).unref()
