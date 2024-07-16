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

const timeout = setTimeout(async function longPolling () {
  try {
    const messages = await fetchMessages(lastMessageId)

    if (messages.length < 1) return console.log('Empty response')
    
    console.table(messages)
    
    const lastId = messages.at(-1).id
    if (lastId) lastMessageId = lastId
    // recursively calling next iteration only after previous one ends
    longPolling()
  } catch (e) {
    console.error(e)
    clearTimeout(timeout)
  }
}, 1000)
