import { createServer, get } from 'node:http'
import { createReadStream } from 'node:fs'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { setTimeout as wait } from 'node:timers/promises'

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
    let messages = getMessages(body.lastId)
    // if no new messages occured
    while (messages.length < 1) {
      // check once a second for at least 1 new message to response
      messages = getMessages(body.lastId)
      await wait(1000)
    }
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
