let lastMessageId = 0

const fetchMessages = async (lastId = 0) => {
  const body = JSON.stringify({ lastId })
  const response = await fetch('/messages', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body
  })
  const messages = await response.json()
  return messages
}

const interval = setInterval(async () => {
  try {
    const messages = await fetchMessages(lastMessageId)

    if (messages.length < 1) return console.log('Empty response')
    
    console.table(messages)
    
    const lastId = messages.at(-1).id
    if(lastId) lastMessageId = lastId
  } catch (e) {
    console.error(e)
    clearInterval(interval)
  }
}, 1000)
