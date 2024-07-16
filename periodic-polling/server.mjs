import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

const bodyParse = async stream => {
  try {
    const chunks = []
    for await (const chunk of stream) chunks.push(chunk)
    const buffer = Buffer.concat(chunks)
    return JSON.parse(buffer)
  } catch (e) {
    return {}
  }
}

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

const getMessages = lastId => {
  if (!lastId) return messages
  return messages.filter(msg => msg?.id > lastId)
}

const server = createServer(async (req, res) => {
  const resource = req.url
  if (resource === '/messages') {
    const body = await bodyParse(req)
    const messages = getMessages(body.lastId)
    const response = JSON.stringify(messages)
    res.setHeader('Content-Type', 'application/json')
    res.end(response)
  } else {
    const { file, type } = getResource(resource)
    res.setHeader('Content-Type', type)
    file.pipe(res)
  }
})

server.listen(3000)

setInterval(() => {
  const message = { id: Date.now(), message: randomUUID() }
  messages.push(message)
}, 5000).unref()
