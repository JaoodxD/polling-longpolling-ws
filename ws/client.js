const ws = new WebSocket('ws://localhost:3000')

ws.addEventListener('message', ({ data }) => {
  const messages = JSON.parse(data)
  console.table(messages)
})
